const CACHE_NAME = 'my-cache-v2'; // Cambia la versión al actualizar la app

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/bundle.js',
        '/static/js/main.chunk.js',
        '/static/js/0.chunk.js',
        '/static/css/main.chunk.css',
        '/static/js/pdf-lib.js', // Si usas pdf-lib
        '/static/js/jspdf.min.js', // Si usas jsPDF
      ]);
    })
  );
});

// Elimina cachés antiguas cuando hay una nueva versión
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  console.log('Service Worker activado');
});

// Intercepta las solicitudes de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Usa la caché si está disponible
      }
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone()); // Guarda en caché
          return networkResponse;
        });
      });
    }).catch(() => {
      console.log('No hay conexión y el recurso no está en caché');
    })
  );
});
