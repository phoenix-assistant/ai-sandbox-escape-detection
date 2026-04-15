import { Alerter } from '../alerter';
import { NetworkRule } from '../rules';
export declare class NetworkDetector {
    private rules;
    private allowedPorts;
    private alerter;
    constructor(rules: NetworkRule[], allowedPorts: number[], alerter: Alerter);
    checkConnection(host: string, port: number): boolean;
    checkDNS(query: string): boolean;
    private matchesHost;
}
//# sourceMappingURL=network.d.ts.map