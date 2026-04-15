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
exports.loadRules = loadRules;
exports.generateDefaultConfig = generateDefaultConfig;
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
const DEFAULT_CONFIG = {
    version: '1.0',
    sandbox: {
        allowedPaths: ['/tmp/sandbox', '/home/agent'],
        allowedPorts: [80, 443],
        allowedProcesses: ['node', 'python3', 'bash'],
    },
    rules: {
        filesystem: [
            {
                name: 'etc-access',
                description: 'Access to system configuration',
                severity: 'critical',
                paths: ['/etc/passwd', '/etc/shadow', '/etc/sudoers'],
                action: 'alert',
            },
            {
                name: 'ssh-access',
                description: 'SSH key or config access',
                severity: 'critical',
                paths: ['**/.ssh/**', '**/id_rsa*', '**/authorized_keys'],
                action: 'alert',
            },
            {
                name: 'proc-access',
                description: 'Process filesystem access',
                severity: 'high',
                paths: ['/proc/**', '/sys/**'],
                action: 'alert',
            },
        ],
        network: [
            {
                name: 'dns-exfil',
                description: 'DNS exfiltration pattern',
                severity: 'high',
                patterns: ['*.ngrok.io', '*.burpcollaborator.net', '*.requestbin.com'],
                action: 'alert',
            },
            {
                name: 'reverse-shell',
                description: 'Reverse shell ports',
                severity: 'critical',
                ports: [4444, 5555, 1234, 9001],
                patterns: [],
                action: 'alert',
            },
        ],
        process: [
            {
                name: 'shell-spawn',
                description: 'Suspicious shell spawning',
                severity: 'high',
                commands: ['sh -i', 'bash -i', '/bin/sh', 'nc -e', 'ncat', 'socat'],
                action: 'alert',
            },
            {
                name: 'privilege-escalation',
                description: 'Privilege escalation attempts',
                severity: 'critical',
                commands: ['sudo', 'su ', 'chmod +s', 'chown root', 'pkexec'],
                action: 'alert',
            },
        ],
    },
    alerting: {
        console: true,
        auditLog: './audit.log',
    },
};
function loadRules(configPath) {
    if (!configPath)
        return DEFAULT_CONFIG;
    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        const loaded = yaml.load(content);
        return { ...DEFAULT_CONFIG, ...loaded };
    }
    catch {
        console.warn(`Failed to load config from ${configPath}, using defaults`);
        return DEFAULT_CONFIG;
    }
}
function generateDefaultConfig() {
    return yaml.dump(DEFAULT_CONFIG, { indent: 2, lineWidth: 120 });
}
//# sourceMappingURL=rules.js.map