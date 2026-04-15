import { SandboxMonitor } from '../src/monitor';
import { loadRules } from '../src/rules';

describe('SandboxMonitor', () => {
  let monitor: SandboxMonitor;

  beforeEach(() => {
    monitor = new SandboxMonitor(loadRules());
  });

  afterEach(() => {
    monitor.stop();
  });

  test('detects access to /etc/passwd', () => {
    const detected = monitor.checkFile('/etc/passwd');
    expect(detected).toBe(true);
    expect(monitor.getAlerts().length).toBeGreaterThan(0);
    expect(monitor.getAlerts()[0].severity).toBe('critical');
  });

  test('detects SSH key access', () => {
    const detected = monitor.checkFile('/home/user/.ssh/id_rsa');
    expect(detected).toBe(true);
  });

  test('allows access within sandbox', () => {
    const detected = monitor.checkFile('/tmp/sandbox/data.txt');
    expect(detected).toBe(false);
  });

  test('detects suspicious network connections', () => {
    const detected = monitor.checkNetwork('evil.ngrok.io', 443);
    expect(detected).toBe(true);
  });

  test('detects reverse shell ports', () => {
    const detected = monitor.checkNetwork('localhost', 4444);
    expect(detected).toBe(true);
  });

  test('allows normal HTTP traffic', () => {
    const detected = monitor.checkNetwork('api.example.com', 443);
    expect(detected).toBe(false);
  });

  test('detects sudo attempts', () => {
    const detected = monitor.checkProcess('sudo', ['rm', '-rf', '/']);
    expect(detected).toBe(true);
  });

  test('detects reverse shell spawn', () => {
    const detected = monitor.checkProcess('bash', ['-i']);
    expect(detected).toBe(true);
  });

  test('allows whitelisted processes', () => {
    const detected = monitor.checkProcess('node', ['app.js']);
    expect(detected).toBe(false);
  });
});
