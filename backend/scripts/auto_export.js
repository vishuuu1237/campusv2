import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Watches backend data and logs directories and runs the export script on changes.
export default function startAutoExport(baseDir) {
    const backendDir = baseDir || path.join(process.cwd(), __dirname, '..');
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

        console.log('Auto-export: running export script...');
        const proc = spawn(process.execPath, [exportScript], { cwd: backendDir, stdio: 'inherit' });
        proc.on('error', (err) => console.error('Auto-export failed to start:', err.message));
        proc.on('exit', (code) => console.log('Auto-export finished with code', code));
    }

    function scheduleExport() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            try { runExport(); } catch (e) { console.error('Auto-export error:', e.message); }
        }, debounceMs);
    }

    function watchPath(p) {
        try {
            if (!fs.existsSync(p)) return;
            fs.watch(p, { recursive: true }, (eventType, filename) => {
                // Some editors trigger many events; debounce
                scheduleExport();
            });
            console.log('Auto-export: watching', p);
        } catch (e) {
            console.warn('Auto-export: failed to watch', p, e.message);
        }
    }

    // Watch multiple locations
    watchPath(dataDir);
    watchPath(configDataDir);
    watchPath(logsDir);

    // Also run once at startup
    scheduleExport();
}
