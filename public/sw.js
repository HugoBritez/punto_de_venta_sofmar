// Service Worker para manejar actualizaciones PWA
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      self.clients.claim().then(() => {
        // Notificar a todos los clientes que el service worker se ha actualizado
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_UPDATED' });
          });
        });
      })
    );
  });

// Placeholder para que vite-plugin-pwa inyecte el manifiesto
self.__WB_MANIFEST;