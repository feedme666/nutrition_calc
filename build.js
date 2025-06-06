import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

const distDir = 'dist';

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}

try {
  execSync('npx vite build', { stdio: 'inherit' });
} catch (err) {
  console.error('Error during build:', err);
  process.exit(1);
}
