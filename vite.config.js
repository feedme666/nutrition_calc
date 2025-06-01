import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/nutrition_calc/', // GitHubリポジトリ名に合わせる
  plugins: [react()],
})