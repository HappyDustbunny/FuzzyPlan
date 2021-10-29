
let FP_CACHE = 'FP-cache';
let CACHED_URLS = [
  '200px-A_SVG_semicircle_heart_empty.svg.png',
  '200px-A_SVG_semicircle_heart.svg.png',
  '200px-Flag_of_Denmark.png',
  '200px-Flag_of_the_United_Kingdom.png',
  'FPlogo.png'
  // 'FuzzyPlan20211002.css',
  // 'FuzzyPlan20211002.js',
  // 'instructions_dk.html',
  // 'instructions.html',
  // 'main.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(FP_CACHE).then(function(cache) {
      return cache.addAll(CACHED_URLS);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Fetch request for: ', event.request.url);
  event.respondWith( caches.match(event.request) );
})
