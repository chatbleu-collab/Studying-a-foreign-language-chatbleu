/*
 * sw.js — 서비스워커
 * 목적: 오프라인 지원 + 홈 화면 추가(설치형 PWA) 조건 충족.
 * 전략:
 *   - 사전 캐시(PRECACHE): 앱 셸의 고정 파일(index.html, 매니페스트, 아이콘).
 *   - 런타임 캐시: Vite 빌드 산출물은 파일명에 해시가 붙어 매번 바뀌므로,
 *     같은 출처(same-origin)의 GET 요청을 "받아본 즉시 캐시"하는 방식으로 대응.
 *   - 네비게이션 요청은 네트워크 우선, 실패 시 캐시된 index.html 반환(오프라인 진입).
 * 의존성: 없음(순수 JS). index.html 의 main.tsx 에서 상대경로 'sw.js' 로 등록됨.
 * 주의: 캐시 버전(CACHE_VERSION)을 올리면 이전 캐시가 activate 단계에서 정리된다.
 * 배포: 이 구조를 HTTPS 환경(GitHub Pages 등)에 올리면 모바일 브라우저에서
 *       자동으로 홈 화면 추가 프롬프트가 표시된다. iOS/Android 실기기에서 테스트할 것.
 */

const CACHE_VERSION = 'alc-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // 외부 API 호출(Gemini 등)은 캐시하지 않는다.
  if (url.origin !== self.location.origin) return;

  // 페이지 이동: 네트워크 우선 → 실패 시 캐시된 index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 정적 자산: 캐시 우선 → 없으면 네트워크 후 캐시에 저장
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
