// sw.js — офлайн через runtime-кэш (stale-while-revalidate). Хэши ассетов Vite заранее
// неизвестны, поэтому кэшируем по факту запросов: после первого визита приложение
// открывается без сети. Стартовую страницу отдаём как фолбэк для навигаций офлайн.
const CACHE = 'raspevka-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // чужие домены не трогаем

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) {
      // фоново обновляем кэш (stale-while-revalidate)
      fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); }).catch(() => {});
      return cached;
    }
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      // офлайн-навигация → отдать закэшированную стартовую страницу
      if (req.mode === 'navigate') {
        const fallback = (await cache.match('./')) || (await cache.match('index.html')) || (await cache.match('./index.html'));
        if (fallback) return fallback;
      }
      throw err;
    }
  })());
});
