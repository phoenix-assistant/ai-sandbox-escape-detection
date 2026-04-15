import { Alerter } from '../alerter';
import { NetworkRule } from '../rules';

export class NetworkDetector {
  constructor(
    private rules: NetworkRule[],
    private allowedPorts: number[],
    private alerter: Alerter
  ) {}

  checkConnection(host: string, port: number): boolean {
    let detected = false;

    for (const rule of this.rules) {
      if (this.matchesHost(host, rule.patterns)) {
        this.alerter.emit({
          detector: 'network',
          ruleName: rule.name,
          severity: rule.severity,
          message: `Suspicious network connection to ${host}:${port}`,
          details: { host, port, rule: rule.name },
        });
        detected = true;
      }

      if (rule.ports?.includes(port)) {
        this.alerter.emit({
          detector: 'network',
          ruleName: rule.name,
          severity: rule.severity,
          message: `Connection to suspicious port ${port} (${host})`,
          details: { host, port, rule: rule.name },
        });
        detected = true;
      }
    }

    if (!this.allowedPorts.includes(port) && !detected) {
      this.alerter.emit({
        detector: 'network',
        ruleName: 'unauthorized-port',
        severity: 'medium',
        message: `Connection to non-allowed port ${port} on ${host}`,
        details: { host, port, allowedPorts: this.allowedPorts },
      });
      detected = true;
    }

    return detected;
  }

  checkDNS(query: string): boolean {
    for (const rule of this.rules) {
      if (this.matchesHost(query, rule.patterns)) {
        this.alerter.emit({
          detector: 'network',
          ruleName: rule.name,
          severity: rule.severity,
          message: `Suspicious DNS query: ${query}`,
          details: { query, rule: rule.name },
        });
        return true;
      }
    }
    return false;
  }

  private matchesHost(host: string, patterns: string[]): boolean {
    return patterns.some(p => {
      if (p.startsWith('*.')) {
        return host.endsWith(p.slice(1));
      }
      return host === p;
    });
  }
}
