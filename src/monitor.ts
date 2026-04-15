import { EventEmitter } from 'events';
import * as chokidar from 'chokidar';
import { RulesConfig } from './rules';
import { Alerter, Alert } from './alerter';
import { FilesystemDetector } from './detectors/filesystem';
import { NetworkDetector } from './detectors/network';
import { ProcessDetector } from './detectors/process';

export class SandboxMonitor extends EventEmitter {
  public alerter: Alerter;
  public fsDetector: FilesystemDetector;
  public netDetector: NetworkDetector;
  public procDetector: ProcessDetector;
  private watcher?: chokidar.FSWatcher;
  private running = false;

  constructor(private config: RulesConfig) {
    super();
    this.alerter = new Alerter(config.alerting);

    this.fsDetector = new FilesystemDetector(
      config.rules.filesystem,
      config.sandbox.allowedPaths,
      this.alerter
    );
    this.netDetector = new NetworkDetector(
      config.rules.network,
      config.sandbox.allowedPorts,
      this.alerter
    );
    this.procDetector = new ProcessDetector(
      config.rules.process,
      config.sandbox.allowedProcesses,
      this.alerter
    );
  }

  async start(watchPaths?: string[]): Promise<void> {
    if (this.running) return;
    this.running = true;

    const paths = watchPaths || this.config.sandbox.allowedPaths;
    console.log(`🛡️  Sandbox Guard monitoring: ${paths.join(', ')}`);

    this.watcher = chokidar.watch(paths, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: true,
    });

    this.watcher
      .on('add', path => { this.fsDetector.check(path); this.emit('event', { type: 'fs', path }); })
      .on('change', path => { this.fsDetector.check(path); this.emit('event', { type: 'fs', path }); })
      .on('unlink', path => { this.fsDetector.check(path); this.emit('event', { type: 'fs', path }); });

    this.emit('started');
  }

  stop(): void {
    this.running = false;
    this.watcher?.close();
    this.emit('stopped');
    console.log('🛑 Sandbox Guard stopped');
  }

  isRunning(): boolean {
    return this.running;
  }

  checkFile(path: string): boolean {
    return this.fsDetector.check(path);
  }

  checkNetwork(host: string, port: number): boolean {
    return this.netDetector.checkConnection(host, port);
  }

  checkProcess(command: string, args?: string[]): boolean {
    return this.procDetector.checkSpawn(command, args);
  }

  getAlerts(): Alert[] {
    return this.alerter.getAlerts();
  }
}
