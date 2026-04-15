"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessDetector = void 0;
class ProcessDetector {
    rules;
    allowedProcesses;
    alerter;
    childCount = 0;
    constructor(rules, allowedProcesses, alerter) {
        this.rules = rules;
        this.allowedProcesses = allowedProcesses;
        this.alerter = alerter;
    }
    checkSpawn(command, args = []) {
        const fullCommand = `${command} ${args.join(' ')}`.trim();
        this.childCount++;
        let detected = false;
        for (const rule of this.rules) {
            if (rule.commands.some(c => fullCommand.includes(c))) {
                this.alerter.emit({
                    detector: 'process',
                    ruleName: rule.name,
                    severity: rule.severity,
                    message: `Suspicious process spawn: ${fullCommand}`,
                    details: { command: fullCommand, rule: rule.name },
                });
                detected = true;
            }
            if (rule.maxChildren && this.childCount > rule.maxChildren) {
                this.alerter.emit({
                    detector: 'process',
                    ruleName: rule.name,
                    severity: rule.severity,
                    message: `Process spawn limit exceeded (${this.childCount}/${rule.maxChildren})`,
                    details: { childCount: this.childCount, maxChildren: rule.maxChildren },
                });
                detected = true;
            }
        }
        const baseName = command.split('/').pop() || command;
        if (!this.allowedProcesses.includes(baseName)) {
            this.alerter.emit({
                detector: 'process',
                ruleName: 'unauthorized-process',
                severity: 'medium',
                message: `Unauthorized process: ${baseName}`,
                details: { command: fullCommand, allowed: this.allowedProcesses },
            });
            detected = true;
        }
        return detected;
    }
    resetChildCount() {
        this.childCount = 0;
    }
}
exports.ProcessDetector = ProcessDetector;
//# sourceMappingURL=process.js.map