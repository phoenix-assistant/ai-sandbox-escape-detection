import { Alerter } from '../alerter';
import { FilesystemRule } from '../rules';
export declare class FilesystemDetector {
    private rules;
    private allowedPaths;
    private alerter;
    constructor(rules: FilesystemRule[], allowedPaths: string[], alerter: Alerter);
    check(accessedPath: string): boolean;
    private matchesRule;
}
//# sourceMappingURL=filesystem.d.ts.map