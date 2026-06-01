const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const backendDir = path.join(__dirname, '..');
const dataDir = path.join(backendDir, 'data');
const configDataDir = path.join(backendDir, 'config', 'data');
const logsDir = path.join(backendDir, 'logs');
const exportScript = path.join(backendDir, 'scripts', 'export_clients.cjs');

let timer = null;
const debounceMs = 500;

function runExport() {
    if (!fs.existsSync(exportScript)) {
        console.warn('Export script not found:', exportScript);
        return;
    }
    console.log(new Date().toISOString(), 'Running export...');
    const proc = spawn(process.execPath, [exportScript], { cwd: backendDir, stdio: 'inherit' });
    proc.on('error', (err) => console.error('Export failed to start:', err.message));
    proc.on('exit', (code) => console.log('Export finished with code', code));
}

function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; runExport(); }, debounceMs);
}

function watchIfExists(p) {
    try {
        if (!fs.existsSync(p)) return console.log('Path not found (watch skipped):', p);
        fs.watch(p, { recursive: true }, (ev, fn) => { schedule(); });
        console.log('Watching', p);
    } catch (e) {
        console.warn('Watch failed for', p, e.message);
    }
}

// Start
console.log('Starting export watcher.');
watchIfExists(dataDir);
watchIfExists(configDataDir);
watchIfExists(logsDir);
// initial run
runExport();

// keep process alive
process.stdin.resume();
