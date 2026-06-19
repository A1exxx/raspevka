// sw.js — офлайн-кэш с правильной стратегией обновления:
//  • HTML/навигация → network-first (всегда свежая версия онлайн; кэш — только фолбэк офлайн).
//    Это критично: index.html ссылается на хэш-имена ассетов, поэтому HTML обязан быть свежим,
//    иначе приложение «залипает» на старом билде.
//  • Хэшированные ассеты (/assets/*) и медиа → cache-first (они неизменяемы по хэшу).
const CACHE = 'raspevka-v3';

self.addEventListener('install', () => { self.skipWaiting(); });

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
  if (url.origin !== self.location.origin) return; // чужие домены (шрифты и т.п.) не трогаем

  const isNavigation = req.mode === 'navigate' || (req.destination === 'document');

  if (isNavigation) {
    // network-first: свежий HTML онлайн, кэш — фолбэк офлайн
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch (err) {
        return (await cache.match(req)) || (await cache.match('./')) || (await cache.match('index.html')) || Response.error();
      }
    })());
    return;
  }

  // cache-first для статики (хэшированные ассеты неизменяемы)
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) { throw err; }
  })());
});
