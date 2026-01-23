// Este é um Service Worker básico para permitir a instalação do PWA.

self.addEventListener('install', (event) => {
  console.log('Service Worker: A instalar...');
  // Força o novo service worker a ativar-se
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativo.');
  // Toma controlo de todas as páginas abertas
  event.waitUntil(self.clients.claim());
});

// O navegador exige um "fetch handler" para considerar a app instalável.
// Este é o mais simples possível: apenas passa o pedido para a rede.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- IGNORAR BACKEND/API ---
  // Se for chamada para o Render ou API, não intercepta. Deixa o navegador lidar direto.
  // Isso evita erros de CORS e "Load failed" no Service Worker.
  if (url.hostname.includes('onrender.com') || url.pathname.startsWith('/api') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(fetch(event.request));
});