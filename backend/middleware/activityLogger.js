const fs = require('fs');
const path = require('path');

// Middleware that logs each request as a JSON line in backend/logs/activity.log
// Logged fields: timestamp, userId, username (if available), method, path, statusCode, durationMs, ip
// Usage: in your `server.js` or app entry: `const activityLogger = require('./middleware/activityLogger'); app.use(activityLogger());`

module.exports = function activityLogger(options = {}) {
    const logFile = options.logFile || path.join(__dirname, '..', 'logs', 'activity.log');
    // ensure directory exists
    try { fs.mkdirSync(path.dirname(logFile), { recursive: true }); } catch (e) { }

    return function (req, res, next) {
        const start = process.hrtime();
        const startTime = new Date().toISOString();

        function onFinish() {
            res.removeListener('finish', onFinish);
            const diff = process.hrtime(start);
            const durationMs = Math.round((diff[0] * 1e3) + (diff[1] / 1e6));

            // try to infer user info
            let userId = null;
            let username = null;
            if (req.user) {
                userId = req.user.id || req.user._id || null;
                username = req.user.username || req.user.name || null;
            } else if (req.body && (req.body.userId || req.body.email || req.body.username)) {
                userId = req.body.userId || null;
                username = req.body.username || req.body.email || null;
            }

            const entry = {
                timestamp: startTime,
                method: req.method,
                path: req.originalUrl || req.url,
                statusCode: res.statusCode,
                durationMs,
                ip: req.ip || req.connection && req.connection.remoteAddress || null,
                userId,
                username
            };

            const line = JSON.stringify(entry) + '\n';
            fs.appendFile(logFile, line, (err) => {
                if (err) console.error('Failed to write activity log:', err);
            });
        }

        res.on('finish', onFinish);
        next();
    };
};
