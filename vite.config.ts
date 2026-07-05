// vite.config.ts
// 목적: Vite 빌드 설정. base './' 로 지정하여 GitHub Pages 하위 경로 배포에서도 동작.
// 의존성: @vitejs/plugin-react
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', sourcemap: false }
});
