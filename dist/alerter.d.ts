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
export declare class Alerter {
    private logger;
    private auditPath;
    private alerts;
    constructor(options: {
        console: boolean;
        file?: string;
        auditLog: string;
    });
    emit(alert: Omit<Alert, 'timestamp'>): void;
    getAlerts(): Alert[];
    static parseAuditLog(path: string): Alert[];
}
//# sourceMappingURL=alerter.d.ts.map