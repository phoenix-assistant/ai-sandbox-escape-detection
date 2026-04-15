export interface FilesystemRule {
    name: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    paths: string[];
    action: 'alert' | 'block' | 'log';
}
export interface NetworkRule {
    name: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    patterns: string[];
    ports?: number[];
    action: 'alert' | 'block' | 'log';
}
export interface ProcessRule {
    name: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    commands: string[];
    maxChildren?: number;
    action: 'alert' | 'block' | 'log';
}
export interface RulesConfig {
    version: string;
    sandbox: {
        allowedPaths: string[];
        allowedPorts: number[];
        allowedProcesses: string[];
    };
    rules: {
        filesystem: FilesystemRule[];
        network: NetworkRule[];
        process: ProcessRule[];
    };
    alerting: {
        console: boolean;
        file?: string;
        auditLog: string;
    };
}
export declare function loadRules(configPath?: string): RulesConfig;
export declare function generateDefaultConfig(): string;
//# sourceMappingURL=rules.d.ts.map