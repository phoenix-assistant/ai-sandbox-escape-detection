"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alerter = void 0;
const fs = __importStar(require("fs"));
const winston = __importStar(require("winston"));
class Alerter {
    logger;
    auditPath;
    alerts = [];
    constructor(options) {
        this.auditPath = options.auditLog;
        const transports = [];
        if (options.console) {
            transports.push(new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), winston.format.printf(({ level, message }) => `[SANDBOX-GUARD] ${level}: ${message}`)),
            }));
        }
        if (options.file) {
            transports.push(new winston.transports.File({ filename: options.file }));
        }
        this.logger = winston.createLogger({ level: 'info', transports });
    }
    emit(alert) {
        const full = { ...alert, timestamp: new Date().toISOString() };
        this.alerts.push(full);
        const icon = { low: 'ℹ️', medium: '⚠️', high: '🔶', critical: '🚨' }[alert.severity];
        this.logger.warn(`${icon} [${alert.severity.toUpperCase()}] ${alert.detector}/${alert.ruleName}: ${alert.message}`);
        // Append to audit log
        try {
            fs.appendFileSync(this.auditPath, JSON.stringify(full) + '\n');
        }
        catch { /* ignore write errors */ }
    }
    getAlerts() {
        return [...this.alerts];
    }
    static parseAuditLog(path) {
        try {
            return fs.readFileSync(path, 'utf-8')
                .split('\n')
                .filter(Boolean)
                .map(line => JSON.parse(line));
        }
        catch {
            return [];
        }
    }
}
exports.Alerter = Alerter;
//# sourceMappingURL=alerter.js.map