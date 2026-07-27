const CACHE_NAME = 'santisima-trinidad-cache-v2'; // <--- Incrementado a v2
const urlsToCache = [
  './',
  './index.html',
  './temas.html',
  './busqueda.html',
  './hero.jpg',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Instalar el Service Worker y forzar su activación inmediata
self.addEventListener('install', event => {
  self.skipWaiting(); // <--- Fuerza a activarse sin esperar que se cierren las pestañas
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos cacheados con éxito');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar el Service Worker, tomar control de los clientes y limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    clients.claim().then(() => { // <--- Toma el control inmediato de la página abierta
      return caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME) {
              console.log('Borrando caché antigua:', cache);
              return caches.delete(cache);
            }
          })
        );
      });
    })
  );
});

// Estrategia Network-First (Red primero, luego Caché) para garantizar datos siempre actualizados con F5
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no sean GET (como solicitudes de mapas o externas)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si la descarga fue exitosa, guardamos una copia actualizada en caché y la mostramos
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay red (offline), sirve la respuesta desde la memoria caché
        return caches.match(event.request);
      })
  );
});
