import { Alerter } from '../alerter';
import { ProcessRule } from '../rules';
export declare class ProcessDetector {
    private rules;
    private allowedProcesses;
    private alerter;
    private childCount;
    constructor(rules: ProcessRule[], allowedProcesses: string[], alerter: Alerter);
    checkSpawn(command: string, args?: string[]): boolean;
    resetChildCount(): void;
}
//# sourceMappingURL=process.d.ts.map