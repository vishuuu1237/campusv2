import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const rootDist = path.join(repoRoot, 'dist');
const frontendDist = path.join(repoRoot, 'frontend', 'dist');

// If frontend/dist has the built assets, copy to root dist
if (fs.existsSync(frontendDist) && fs.existsSync(path.join(frontendDist, 'index.html'))) {
  fs.cpSync(frontendDist, rootDist, { recursive: true });
  console.log('✓ Successfully synced build assets from frontend/dist to root dist/');
} else if (fs.existsSync(rootDist) && fs.existsSync(path.join(rootDist, 'index.html'))) {
  fs.cpSync(rootDist, frontendDist, { recursive: true });
  console.log('✓ Successfully synced build assets from root dist/ to frontend/dist');
} else {
  console.warn('Warning: No built index.html found in dist or frontend/dist');
}
