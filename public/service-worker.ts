/* eslint-disable @typescript-eslint/no-explicit-any */
// public/service-worker.ts
/// <reference lib="webworker" />

const CACHE_NAME = 'rastreamento-carga-cache-v1';
const urlsToCache = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aberto!');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        }).filter(Boolean)
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'backgroundLocationUpdate') {
    const locationData: any = event.data.payload;
    console.log('Localização recebida do app (Service Worker):', locationData);
    // Aqui você pode adicionar lógica para enviar para uma API, se necessário no futuro
  }
});