const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

async function run() {
  const dataDir = path.join(__dirname, '..', 'data');
  const filePath = path.join(dataDir, 'users.json');

  const raw = await fs.readFile(filePath, 'utf8');
  const users = JSON.parse(raw || '[]');

  const backupPath = filePath + '.bak.' + Date.now();
  await fs.writeFile(backupPath, JSON.stringify(users, null, 2), 'utf8');
  console.log('Backup written to', backupPath);

  let changed = 0;
  for (const u of users) {
    const pw = (u.password || '').toString();
    // bcrypt hashes start with $2a$, $2b$, or $2y$
    if (!pw.startsWith('$2')) {
      const hashed = await bcrypt.hash(pw, 10);
      u.password = hashed;
      changed++;
    }
  }

  if (changed === 0) {
    console.log('No plaintext passwords found. Nothing to do.');
    return;
  }

  await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
  console.log(`Hashed ${changed} passwords and updated ${filePath}`);
}

run().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
