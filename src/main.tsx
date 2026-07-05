/*
 * main.tsx — 엔트리 포인트
 * 역할: React 렌더 + 서비스 워커 등록.
 * 주의: SW 는 상대 경로('sw.js')로 등록해 GitHub Pages 하위 경로 배포에서도 동작.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProvider } from './store/AppContext';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

// PWA 서비스 워커 등록 (HTTPS 또는 localhost 에서만 활성)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      /* SW 등록 실패는 앱 동작에 치명적이지 않음(오프라인 캐시만 비활성) */
    });
  });
}
