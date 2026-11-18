import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the same build works on Vercel, GitHub Pages, or any subpath.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', sourcemap: false },
});