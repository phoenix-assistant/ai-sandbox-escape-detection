import * as fs from 'fs';
import * as winston from 'winston';

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type DetectorType = 'filesystem' | 'network' | 'process';

export interface Alert {
  timestamp: string;
  detector: DetectorType;
  ruleName: string;
  severity: Severity;
  message: string;
  details: Record<string, unknown>;
}

export class Alerter {
  private logger: winston.Logger;
  private auditPath: string;
  private alerts: Alert[] = [];

  constructor(options: { console: boolean; file?: string; auditLog: string }) {
    this.auditPath = options.auditLog;
    const transports: winston.transport[] = [];
    if (options.console) {
      transports.push(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ level, message }) => `[SANDBOX-GUARD] ${level}: ${message}`)
        ),
      }));
    }
    if (options.file) {
      transports.push(new winston.transports.File({ filename: options.file }));
    }
    this.logger = winston.createLogger({ level: 'info', transports });
  }

  emit(alert: Omit<Alert, 'timestamp'>): void {
    const full: Alert = { ...alert, timestamp: new Date().toISOString() };
    this.alerts.push(full);

    const icon = { low: 'ℹ️', medium: '⚠️', high: '🔶', critical: '🚨' }[alert.severity];
    this.logger.warn(`${icon} [${alert.severity.toUpperCase()}] ${alert.detector}/${alert.ruleName}: ${alert.message}`);

    // Append to audit log
    try {
      fs.appendFileSync(this.auditPath, JSON.stringify(full) + '\n');
    } catch { /* ignore write errors */ }
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  static parseAuditLog(path: string): Alert[] {
    try {
      return fs.readFileSync(path, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line) as Alert);
    } catch {
      return [];
    }
  }
}
