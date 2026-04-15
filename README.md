# 🛡️ AI Sandbox Escape Detection

Detect when AI agents attempt to break out of sandboxes. Monitor file system access patterns, network calls, and process spawning in real-time.

## Features

- **Filesystem Monitoring** — Detect access to sensitive paths (`/etc/passwd`, SSH keys, `/proc`)
- **Network Detection** — Flag DNS exfiltration, reverse shell ports, unauthorized connections
- **Process Tracking** — Catch shell spawns, privilege escalation, fork bombs
- **Configurable Rules** — YAML-based detection rules with severity levels
- **Real-time Alerting** — Console output, file logging, structured audit log
- **Audit Analysis** — Analyze historical audit logs for patterns

## Quick Start

```bash
npm install @phoenixaihub/sandbox-escape-detection

# Generate default config
sandbox-guard init

# Start monitoring
sandbox-guard monitor --config rules.yaml

# Analyze audit log
sandbox-guard analyze audit.log --severity high
```

## Programmatic Usage

```typescript
import { SandboxMonitor, loadRules } from '@phoenixaihub/sandbox-escape-detection';

const monitor = new SandboxMonitor(loadRules('./rules.yaml'));

// Check specific events
monitor.checkFile('/etc/passwd');        // → true (alert!)
monitor.checkNetwork('evil.ngrok.io', 443); // → true (alert!)
monitor.checkProcess('sudo', ['rm', '-rf', '/']); // → true (alert!)

// Start real-time filesystem watching
await monitor.start(['/tmp/sandbox']);
```

## License

MIT
