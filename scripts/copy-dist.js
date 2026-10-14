import fs from 'fs';
import path from 'path';

const src = path.resolve('frontend', 'dist');
const dest = path.resolve('dist');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log('✓ Successfully copied frontend/dist to root dist directory');
} else {
  console.warn('Warning: frontend/dist was not found to copy');
}
