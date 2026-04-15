import { Alerter } from '../alerter';
import { ProcessRule } from '../rules';

export class ProcessDetector {
  private childCount = 0;

  constructor(
    private rules: ProcessRule[],
    private allowedProcesses: string[],
    private alerter: Alerter
  ) {}

  checkSpawn(command: string, args: string[] = []): boolean {
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

  resetChildCount(): void {
    this.childCount = 0;
  }
}
