const staticAssets = [
  // '/',
  // '/index.html',
  // '/web.js',
  // '/manifest.json'
]

const STATIC_CACHE_NAME = 'static-data'
const DYNAMIC_CACHE_NAME = 'dynamic-data'

self.addEventListener('install', async event => {
  // self.skipWaiting()
  const cache = await caches.open(STATIC_CACHE_NAME)
  console.log('install')
  cache.addAll(staticAssets)
})

self.addEventListener('activate', e => {
  console.log('activate')
  e.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
        }).map(function (cacheName) {
          return caches.delete(cacheName)
        })
      )
    })
  )
  return self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  event.respondWith(cacheData(request))
})

async function cacheData (request) {
  const cashedRequest = await caches.match(request)
  if (staticAssets.some(sa => request.url.indexOf(sa) >= 0) || request.headers.get('accept').includes('text/html')) {
    return cashedRequest || networkFirst(request)
  }
  return cashedRequest || networkFirst(request)
}

async function networkFirst (request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  try {
    const response = await fetch(request)
    cache.put(request, response.clone())
    return response
  } catch (error) {
    return await cache.match(request)
  }
}