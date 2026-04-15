import { EventEmitter } from 'events';
import { RulesConfig } from './rules';
import { Alerter, Alert } from './alerter';
import { FilesystemDetector } from './detectors/filesystem';
import { NetworkDetector } from './detectors/network';
import { ProcessDetector } from './detectors/process';
export declare class SandboxMonitor extends EventEmitter {
    private config;
    alerter: Alerter;
    fsDetector: FilesystemDetector;
    netDetector: NetworkDetector;
    procDetector: ProcessDetector;
    private watcher?;
    private running;
    constructor(config: RulesConfig);
    start(watchPaths?: string[]): Promise<void>;
    stop(): void;
    isRunning(): boolean;
    checkFile(path: string): boolean;
    checkNetwork(host: string, port: number): boolean;
    checkProcess(command: string, args?: string[]): boolean;
    getAlerts(): Alert[];
}
//# sourceMappingURL=monitor.d.ts.map