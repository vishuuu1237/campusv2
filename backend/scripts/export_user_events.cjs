const fs = require('fs');
const path = require('path');

// Exports all user events from backend/logs/activity.log into a CSV (Excel-friendly)
// Output file: project root -> user_events.csv

const backendDir = path.join(__dirname, '..');
const logsDir = path.join(backendDir, 'logs');
const activityLog = path.join(logsDir, 'activity.log');
const outCsv = path.join(backendDir, '..', 'user_events.csv');

function readActivityLog(filePath) {
    const results = [];
    if (!fs.existsSync(filePath)) return results;
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/).filter(Boolean);
    for (const l of lines) {
        try {
            results.push(JSON.parse(l));
        } catch (e) {
            // ignore malformed lines
        }
    }
    return results;
}

function toCsvRow(arr) {
    return arr.map((v) => {
        if (v === null || v === undefined) return '';
        let s = String(v);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            s = '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }).join(',');
}

function main() {
    const events = readActivityLog(activityLog);
    if (events.length === 0) {
        console.log('No activity log found or log is empty at', activityLog);
        return;
    }

    // columns: userId, username, timestamp, method, path, statusCode, durationMs, ip, raw
    const headers = ['userId', 'username', 'timestamp', 'method', 'path', 'statusCode', 'durationMs', 'ip', 'raw'];
    const rows = [toCsvRow(headers)];

    for (const e of events) {
        const userId = e.userId || e.user || e.user_id || '';
        const username = e.username || e.name || '';
        const timestamp = e.timestamp || e.time || '';
        const method = e.method || e.httpMethod || '';
        const pathField = e.path || e.url || '';
        const statusCode = e.statusCode || e.status || '';
        const durationMs = e.durationMs || e.duration || '';
        const ip = e.ip || '';
        const raw = JSON.stringify(e);

        rows.push(toCsvRow([userId, username, timestamp, method, pathField, statusCode, durationMs, ip, raw]));
    }

    try {
        fs.writeFileSync(outCsv, rows.join('\n'), 'utf8');
        console.log('Wrote user events CSV:', outCsv);
    } catch (err) {
        console.error('Failed to write CSV:', err.message);
    }
}

if (require.main === module) main();

module.exports = { main };
