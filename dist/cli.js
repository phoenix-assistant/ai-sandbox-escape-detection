#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const monitor_1 = require("./monitor");
const rules_1 = require("./rules");
const alerter_1 = require("./alerter");
const program = new commander_1.Command();
program
    .name('sandbox-guard')
    .description('AI Sandbox Escape Detection — monitor and detect sandbox breakout attempts')
    .version('1.0.0');
program
    .command('monitor')
    .description('Start real-time monitoring')
    .option('-c, --config <path>', 'Path to rules YAML config')
    .option('-w, --watch <paths...>', 'Paths to watch')
    .action(async (opts) => {
    const config = (0, rules_1.loadRules)(opts.config);
    const monitor = new monitor_1.SandboxMonitor(config);
    process.on('SIGINT', () => { monitor.stop(); process.exit(0); });
    process.on('SIGTERM', () => { monitor.stop(); process.exit(0); });
    await monitor.start(opts.watch);
    console.log('Press Ctrl+C to stop monitoring...');
});
program
    .command('analyze <logfile>')
    .description('Analyze an audit log file')
    .option('--severity <level>', 'Filter by minimum severity', 'low')
    .option('--json', 'Output as JSON')
    .action((logfile, opts) => {
    const alerts = alerter_1.Alerter.parseAuditLog(logfile);
    if (alerts.length === 0) {
        console.log('✅ No alerts found in audit log.');
        return;
    }
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    const minLevel = severityOrder[opts.severity] ?? 0;
    const filtered = alerts.filter(a => severityOrder[a.severity] >= minLevel);
    if (opts.json) {
        console.log(JSON.stringify(filtered, null, 2));
        return;
    }
    console.log(`\n📊 Audit Log Analysis: ${filtered.length} alerts (of ${alerts.length} total)\n`);
    const bySeverity = {};
    const byDetector = {};
    for (const a of filtered) {
        bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
        byDetector[a.detector] = (byDetector[a.detector] || 0) + 1;
    }
    console.log('By Severity:');
    for (const [k, v] of Object.entries(bySeverity))
        console.log(`  ${k}: ${v}`);
    console.log('\nBy Detector:');
    for (const [k, v] of Object.entries(byDetector))
        console.log(`  ${k}: ${v}`);
    console.log('\nRecent Alerts:');
    for (const a of filtered.slice(-10)) {
        const icon = { low: 'ℹ️', medium: '⚠️', high: '🔶', critical: '🚨' }[a.severity];
        console.log(`  ${icon} [${a.timestamp}] ${a.detector}/${a.ruleName}: ${a.message}`);
    }
});
program
    .command('init')
    .description('Generate a default rules.yaml config file')
    .option('-o, --output <path>', 'Output path', 'rules.yaml')
    .action((opts) => {
    const fs = require('fs');
    fs.writeFileSync(opts.output, (0, rules_1.generateDefaultConfig)());
    console.log(`✅ Default config written to ${opts.output}`);
});
program.parse();
//# sourceMappingURL=cli.js.map