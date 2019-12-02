importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
    console.log(`Workbox is loaded`);

    workbox.core.skipWaiting();
    workbox.core.clientsClaim();

    workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

    workbox.routing.registerRoute(
        /\.(?:css|js|html|ico|json)$/,
        new workbox.strategies.StaleWhileRevalidate({
            // Use a custom cache name.
            cacheName: 'washow-cache',
        })
    );

    workbox.routing.registerRoute(
        new RegExp('/fonts/.+'),
        new workbox.strategies.StaleWhileRevalidate({
            // Use a custom cache name.
            cacheName: 'washow-cache',
        })
    );

    workbox.routing.registerRoute(
        // Cache image files.
        /\.(?:png|jpg|jpeg|svg|gif)$/,
        // Use the cache if it's available.
        new workbox.strategies.CacheFirst({
            // Use a custom cache name.
            cacheName: 'washow-image-cache',
            plugins: [
                new workbox.expiration.Plugin({
                    // Cache only 20 images.
                    maxEntries: 20,
                    // Cache for a maximum of a week.
                    maxAgeSeconds: 7 * 24 * 60 * 60,
                })
            ],
        })
    );
} else {
    console.log(`Workbox didn't load`);
}

