const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');

if (!fs.existsSync(usersFile)) {
    console.error('users.json not found at', usersFile);
    process.exit(1);
}

const raw = fs.readFileSync(usersFile, 'utf8');
let users = [];
try { users = JSON.parse(raw); } catch (e) { console.error('Failed to parse users.json', e.message); process.exit(1); }

for (const u of users) {
    const namePart = (u.name || '').toString().replace(/\s+/g, '');
    const idPart = (u.id || u._id || u.userId || '').toString();
    const prnPart = (u.studentId || u.prn || '').toString();
    const rawPassword = namePart + idPart + prnPart;
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(rawPassword, salt);
    u.password = hashed;
}

fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
console.log('Updated passwords for', users.length, 'users in', usersFile);

// Also output a small mapping file showing the plaintext password format (for admin use only)
const map = users.map(u => ({ id: u.id || u._id, email: u.email || null, plaintextPassword: ((u.name || '').toString().replace(/\s+/g, '')) + (u.id || u._id || '') + (u.studentId || u.prn || '') }));
fs.writeFileSync(path.join(__dirname, '..', '..', 'backend_password_map.json'), JSON.stringify(map, null, 2), 'utf8');
console.log('Wrote password map to project root: backend_password_map.json');
