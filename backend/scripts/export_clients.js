const fs = require('fs');
const path = require('path');

// Export client data to CSV (Excel-friendly).
// Tries to read:
// - backend/config/data/users.json
// - backend/config/data/orders.json
// - backend/logs/activity.log (JSON lines)
// Produces: backend/client_data.csv

const projectRoot = path.join(__dirname, '..');
const dataDir = path.join(projectRoot, 'config', 'data');
const altDataDir = path.join(projectRoot, 'data');

function resolveDataFile(name) {
    const p1 = path.join(dataDir, name);
    if (fs.existsSync(p1)) return p1;
    const p2 = path.join(altDataDir, name);
    if (fs.existsSync(p2)) return p2;
    return p1; // default to primary path (may not exist)
}

const usersFile = resolveDataFile('users.json');
const ordersFile = resolveDataFile('orders.json');
const activityLog = path.join(projectRoot, '..', 'logs', 'activity.log');
// note: if your logs are in backend/logs/activity.log adjust path
const fallbackActivityLog = path.join(projectRoot, 'logs', 'activity.log');
const outCsv = path.join(projectRoot, '..', 'client_data.csv');

function safeReadJson(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Failed to read/parse JSON', filePath, err.message);
        return null;
    }
}

function readActivityLog(filePath) {
    const results = [];
    if (!fs.existsSync(filePath)) return results;
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/).filter(Boolean);
    for (const l of lines) {
        try {
            results.push(JSON.parse(l));
        } catch (e) {
            // ignore parse errors
        }
    }
    return results;
}

function toCsvRow(arr) {
    return arr.map((v) => {
        if (v === null || v === undefined) return '';
        let s = String(v);
        // escape quotes
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            s = '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }).join(',');
}

function main() {
    const users = safeReadJson(usersFile) || [];
    const orders = safeReadJson(ordersFile) || [];

    let logs = readActivityLog(activityLog);
    if (logs.length === 0) logs = readActivityLog(fallbackActivityLog);

    // index orders by user id (try different keys)
    const ordersByUser = {};
    for (const o of orders) {
        const uid = o.userId || o.user || o.buyerId || o.user_id || o.userId;
        if (!uid) continue;
        ordersByUser[uid] = ordersByUser[uid] || [];
        ordersByUser[uid].push(o);
    }

    // index logs by userId
    const logsByUser = {};
    for (const L of logs) {
        const uid = L.userId || L.user || L.user_id || null;
        if (!uid) continue;
        logsByUser[uid] = logsByUser[uid] || [];
        logsByUser[uid].push(L);
    }

    const headers = [
        'id', 'username', 'email', 'createdAt', 'lastLogin', 'loginCount', 'tasksDone', 'totalTimeSpentMs', 'ordersCount', 'lastOrderDate'
    ];

    const rows = [toCsvRow(headers)];

    // If users is an object with ids as keys, convert
    let usersList = users;
    if (users && typeof users === 'object' && !Array.isArray(users)) {
        usersList = Object.keys(users).map(k => users[k]);
    }

    for (const u of (usersList || [])) {
        const id = u.id || u._id || u.userId || u.email || '';
        const username = u.username || u.name || u.fullname || '';
        const email = u.email || '';
        const createdAt = u.createdAt || u.created_at || '';

        const userLogs = logsByUser[id] || [];
        // lastLogin: find last entry with method POST to /login or similar
        const loginEntries = userLogs.filter(x => (x.path && x.path.toLowerCase().includes('login')) || (x.action && x.action === 'login'));
        const lastLogin = loginEntries.length ? loginEntries[loginEntries.length - 1].timestamp : (userLogs.length ? userLogs[userLogs.length - 1].timestamp : '');
        const loginCount = loginEntries.length;

        const tasksDone = userLogs.length;
        const totalTimeSpentMs = userLogs.reduce((s, x) => s + (x.durationMs || 0), 0);

        const userOrders = ordersByUser[id] || [];
        const ordersCount = userOrders.length;
        const lastOrderDate = userOrders.length ? (userOrders.reduce((a, b) => (new Date(a.createdAt || a) > new Date(b.createdAt || b)) ? a : b).createdAt || '') : '';

        const row = [id, username, email, createdAt, lastLogin, loginCount, tasksDone, totalTimeSpentMs, ordersCount, lastOrderDate];
        rows.push(toCsvRow(row));
    }

    try {
        fs.writeFileSync(outCsv, rows.join('\n'), 'utf8');
        console.log('Wrote CSV:', outCsv);
    } catch (err) {
        console.error('Failed to write CSV:', err.message);
    }
}

if (require.main === module) main();

module.exports = { main };
