"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesystemDetector = void 0;
class FilesystemDetector {
    rules;
    allowedPaths;
    alerter;
    constructor(rules, allowedPaths, alerter) {
        this.rules = rules;
        this.allowedPaths = allowedPaths;
        this.alerter = alerter;
    }
    check(accessedPath) {
        // Check if path is outside allowed sandbox
        const inSandbox = this.allowedPaths.some(p => accessedPath.startsWith(p));
        for (const rule of this.rules) {
            if (this.matchesRule(accessedPath, rule)) {
                this.alerter.emit({
                    detector: 'filesystem',
                    ruleName: rule.name,
                    severity: rule.severity,
                    message: `Suspicious file access: ${accessedPath}`,
                    details: { path: accessedPath, rule: rule.name, inSandbox },
                });
                return true;
            }
        }
        if (!inSandbox) {
            this.alerter.emit({
                detector: 'filesystem',
                ruleName: 'sandbox-boundary',
                severity: 'medium',
                message: `Access outside sandbox boundary: ${accessedPath}`,
                details: { path: accessedPath, allowedPaths: this.allowedPaths },
            });
            return true;
        }
        return false;
    }
    matchesRule(path, rule) {
        return rule.paths.some(pattern => {
            if (pattern.includes('**')) {
                // Convert glob to regex: ** matches any path segment
                const regexStr = '^' + pattern
                    .replace(/\*\*/g, '.*')
                    .replace(/(?<!\.)\*/g, '[^/]*')
                    .replace(/\//g, '\\/')
                    + '$';
                try {
                    return new RegExp(regexStr).test(path);
                }
                catch {
                    // Fallback: check if key segment exists in path
                    const key = pattern.replace(/\*/g, '').replace(/\//g, '');
                    return key.length > 0 && path.includes(key);
                }
            }
            if (pattern.includes('*')) {
                const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]*') + '$');
                return regex.test(path);
            }
            return path === pattern || path.startsWith(pattern);
        });
    }
}
exports.FilesystemDetector = FilesystemDetector;
//# sourceMappingURL=filesystem.js.map