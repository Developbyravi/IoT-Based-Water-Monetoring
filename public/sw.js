const CACHE_NAME = 'puredrop-v1';
const API_CACHE_NAME = 'puredrop-api-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

const API_URLS = [
  'https://api.thingspeak.com/channels/3052974/feeds.json?results=1',
  'https://api.thingspeak.com/channels/3052974/feeds.json?results=10'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_CACHE_URLS.filter(url => !url.startsWith('http')));
      })
      .then(() => {
        console.log('Static assets cached successfully');
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests (ThingSpeak)
  if (url.hostname === 'api.thingspeak.com') {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets and navigation requests
  event.respondWith(handleStaticRequest(request));
});

// API request handler with stale-while-revalidate strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Return cached response if available, then update in background
  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
          
          // Notify clients of new data
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'DATA_UPDATE',
                data: 'New sensor data available'
              });
            });
          });
        }
      })
      .catch(error => console.warn('Background API update failed:', error));

    return cachedResponse;
  }

  // If not in cache, try network first
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.warn('Network API request failed:', error);
  }

  // Return offline fallback if no cached data
  return new Response(
    JSON.stringify({
      feeds: [{
        field1: 'N/A',
        field2: 'N/A', 
        field3: 'N/A',
        created_at: new Date().toISOString()
      }],
      channel: {
        name: 'Offline Mode'
      }
    }),
    {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Static request handler with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Network request failed:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/');
      return offlineResponse || new Response('Offline - Please check your connection', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
    
    // Return error response for other requests
    return new Response('Network error occurred', {
      status: 408,
      statusText: 'Network Error'
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-data-sync') {
    event.waitUntil(syncData());
  }
});

// Sync offline data when connection is restored
async function syncData() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    
    // Fetch fresh data for all API endpoints
    for (const apiUrl of API_URLS) {
      try {
        const response = await fetch(apiUrl);
        if (response && response.status === 200) {
          await cache.put(apiUrl, response.clone());
          console.log('Synced data for:', apiUrl);
        }
      } catch (error) {
        console.warn('Failed to sync:', apiUrl, error);
      }
    }

    // Notify all clients that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Data synchronized successfully'
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New water quality alert',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'water-quality-alert',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Dashboard'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Water Quality Alert', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  if (action === 'dismiss') {
    notification.close();
    return;
  }

  // Default action or 'view' action
  event.waitUntil(
    clients.matchAll().then(clients => {
      // Check if app is already open
      for (let client of clients) {
        if (client.url === notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new tab/window if not already open
      if (clients.openWindow) {
        return clients.openWindow(notification.data.url);
      }
    })
  );

  notification.close();
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'water-data-sync') {
    event.waitUntil(syncData());
  }
});

// Share target handling (for future enhancement)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHARE_TARGET') {
    // Handle shared data
    console.log('Received shared data:', event.data);
  }
});
