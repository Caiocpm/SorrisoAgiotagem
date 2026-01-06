const CACHE_NAME = 'sorriso-agiotagem-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/mobile.css',
  '/logo.png'
];

// Instalar Service Worker e fazer cache dos arquivos
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aberto');
        return cache.addAll(urlsToCache.filter(url => !url.includes('.jsx')));
      })
      .catch(err => console.log('[Service Worker] Erro ao cachear:', err))
  );
  self.skipWaiting();
});

// Ativar Service Worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estratégia: Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora requisições de chrome-extension e outras origens externas
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clona a resposta porque é um stream que só pode ser consumido uma vez
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Se a rede falhar, tenta buscar do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Se não tiver no cache e for navegação, retorna index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Sincronização em background (para futuras implementações)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);
  // Aqui você pode adicionar lógica para sincronizar dados quando voltar online
});

// Notificações Push (para futuras implementações)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recebido:', event);
  // Aqui você pode adicionar lógica para notificações push
});
