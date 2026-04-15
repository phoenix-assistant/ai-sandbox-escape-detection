import * as fs from 'fs';
import * as yaml from 'js-yaml';

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

const DEFAULT_CONFIG: RulesConfig = {
  version: '1.0',
  sandbox: {
    allowedPaths: ['/tmp/sandbox', '/home/agent'],
    allowedPorts: [80, 443],
    allowedProcesses: ['node', 'python3', 'bash'],
  },
  rules: {
    filesystem: [
      {
        name: 'etc-access',
        description: 'Access to system configuration',
        severity: 'critical',
        paths: ['/etc/passwd', '/etc/shadow', '/etc/sudoers'],
        action: 'alert',
      },
      {
        name: 'ssh-access',
        description: 'SSH key or config access',
        severity: 'critical',
        paths: ['**/.ssh/**', '**/id_rsa*', '**/authorized_keys'],
        action: 'alert',
      },
      {
        name: 'proc-access',
        description: 'Process filesystem access',
        severity: 'high',
        paths: ['/proc/**', '/sys/**'],
        action: 'alert',
      },
    ],
    network: [
      {
        name: 'dns-exfil',
        description: 'DNS exfiltration pattern',
        severity: 'high',
        patterns: ['*.ngrok.io', '*.burpcollaborator.net', '*.requestbin.com'],
        action: 'alert',
      },
      {
        name: 'reverse-shell',
        description: 'Reverse shell ports',
        severity: 'critical',
        ports: [4444, 5555, 1234, 9001],
        patterns: [],
        action: 'alert',
      },
    ],
    process: [
      {
        name: 'shell-spawn',
        description: 'Suspicious shell spawning',
        severity: 'high',
        commands: ['sh -i', 'bash -i', '/bin/sh', 'nc -e', 'ncat', 'socat'],
        action: 'alert',
      },
      {
        name: 'privilege-escalation',
        description: 'Privilege escalation attempts',
        severity: 'critical',
        commands: ['sudo', 'su ', 'chmod +s', 'chown root', 'pkexec'],
        action: 'alert',
      },
    ],
  },
  alerting: {
    console: true,
    auditLog: './audit.log',
  },
};

export function loadRules(configPath?: string): RulesConfig {
  if (!configPath) return DEFAULT_CONFIG;
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const loaded = yaml.load(content) as Partial<RulesConfig>;
    return { ...DEFAULT_CONFIG, ...loaded } as RulesConfig;
  } catch {
    console.warn(`Failed to load config from ${configPath}, using defaults`);
    return DEFAULT_CONFIG;
  }
}

export function generateDefaultConfig(): string {
  return yaml.dump(DEFAULT_CONFIG, { indent: 2, lineWidth: 120 });
}
