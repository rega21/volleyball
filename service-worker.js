const CACHE = 'voley-clt-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/src/styles/main.css',
  '/src/assets/Lawn.png',
  '/src/api/client.js',
  '/src/services/players.js',
  '/src/services/ratings.js',
  '/src/services/feedback.js',
  '/src/views/playersView.js',
  '/src/controllers/playersController.js',
  '/src/controllers/ratingsController.js',
  '/src/controllers/partidoController.js',
  '/src/controllers/tabController.js',
  '/src/controllers/menuController.js',
  '/src/controllers/themeController.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Solo cachea GET, deja pasar las requests a Supabase
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
