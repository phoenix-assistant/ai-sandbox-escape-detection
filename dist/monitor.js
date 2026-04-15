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
exports.SandboxMonitor = void 0;
const events_1 = require("events");
const chokidar = __importStar(require("chokidar"));
const alerter_1 = require("./alerter");
const filesystem_1 = require("./detectors/filesystem");
const network_1 = require("./detectors/network");
const process_1 = require("./detectors/process");
class SandboxMonitor extends events_1.EventEmitter {
    config;
    alerter;
    fsDetector;
    netDetector;
    procDetector;
    watcher;
    running = false;
    constructor(config) {
        super();
        this.config = config;
        this.alerter = new alerter_1.Alerter(config.alerting);
        this.fsDetector = new filesystem_1.FilesystemDetector(config.rules.filesystem, config.sandbox.allowedPaths, this.alerter);
        this.netDetector = new network_1.NetworkDetector(config.rules.network, config.sandbox.allowedPorts, this.alerter);
        this.procDetector = new process_1.ProcessDetector(config.rules.process, config.sandbox.allowedProcesses, this.alerter);
    }
    async start(watchPaths) {
        if (this.running)
            return;
        this.running = true;
        const paths = watchPaths || this.config.sandbox.allowedPaths;
        console.log(`🛡️  Sandbox Guard monitoring: ${paths.join(', ')}`);
        this.watcher = chokidar.watch(paths, {
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: true,
        });
        this.watcher
            .on('add', path => { this.fsDetector.check(path); this.emit('event', { type: 'fs', path }); })
            .on('change', path => { this.fsDetector.check(path); this.emit('event', { type: 'fs', path }); })
            .on('unlink', path => { this.fsDetector.check(path); this.emit('event', { type: 'fs', path }); });
        this.emit('started');
    }
    stop() {
        this.running = false;
        this.watcher?.close();
        this.emit('stopped');
        console.log('🛑 Sandbox Guard stopped');
    }
    isRunning() {
        return this.running;
    }
    checkFile(path) {
        return this.fsDetector.check(path);
    }
    checkNetwork(host, port) {
        return this.netDetector.checkConnection(host, port);
    }
    checkProcess(command, args) {
        return this.procDetector.checkSpawn(command, args);
    }
    getAlerts() {
        return this.alerter.getAlerts();
    }
}
exports.SandboxMonitor = SandboxMonitor;
//# sourceMappingURL=monitor.js.map