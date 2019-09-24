/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["404.html","2065d18a6dc3b2d6d4e54b603d680fcf"],["assets/android-chrome-144x144.png","6cfa8556d19947c1670906ccdd59ea8f"],["assets/android-chrome-192x192.png","09a1aaacbbda4715dbf12a764207897d"],["assets/android-chrome-256x256.png","448022c080156e68700a9556f3024b0a"],["assets/android-chrome-36x36.png","954dfee05689ea95b030ea4b63c95cce"],["assets/android-chrome-384x384.png","f9733d9773765b73c6c7bb34b421b95e"],["assets/android-chrome-48x48.png","5cca877e65faf2d42350c775671537ea"],["assets/android-chrome-512x512.png","1487499124216ea41237d8b2bc4d5f76"],["assets/android-chrome-72x72.png","31e985163c5e61d892ad522237101f22"],["assets/android-chrome-96x96.png","932530ba767fbdd87d4ebfd1b420df17"],["assets/apple-touch-icon-1024x1024.png","3dda367752f52c62bed41cfe90dab83a"],["assets/apple-touch-icon-114x114.png","1f38ad857e610a95412303522c937697"],["assets/apple-touch-icon-120x120.png","a4bb63f0bdf5f10bb309a1b1db9bd465"],["assets/apple-touch-icon-144x144.png","c28b4694ad937783b29cfbc1f1126f56"],["assets/apple-touch-icon-152x152.png","81e2f399a46b9796030c1f86ff77e3de"],["assets/apple-touch-icon-167x167.png","e508f9d47e45beea110faa134cdd7fab"],["assets/apple-touch-icon-180x180.png","c6946b44ecfa3b4fb30de9ca1bad0cde"],["assets/apple-touch-icon-57x57.png","156f927432ed0f82b6b3e066e8e46f4b"],["assets/apple-touch-icon-60x60.png","dea08e2c03a683caaa108e65b0f3afb4"],["assets/apple-touch-icon-72x72.png","acc15c0267ace6de57c974489a61965b"],["assets/apple-touch-icon-76x76.png","ed5652795c6d79bed9e4cfbf511bf8a0"],["assets/apple-touch-icon-precomposed.png","c6946b44ecfa3b4fb30de9ca1bad0cde"],["assets/apple-touch-icon.png","c6946b44ecfa3b4fb30de9ca1bad0cde"],["assets/apple-touch-startup-image-1182x2208.png","366302b9ab7192761ca0986374f0311b"],["assets/apple-touch-startup-image-1242x2148.png","8116bf0da1435cfb69c8f95f51dfd165"],["assets/apple-touch-startup-image-1496x2048.png","ba74577ac95a0da313f75720370caadd"],["assets/apple-touch-startup-image-1536x2008.png","59f93f1cffd77a9ac5d7aec624f88fa6"],["assets/apple-touch-startup-image-320x460.png","c93b802d5474070b8af0482532af02e4"],["assets/apple-touch-startup-image-640x1096.png","f1380c707b1145cd311d67f80fc127b8"],["assets/apple-touch-startup-image-640x920.png","65a72e689c88948ecd82805263a57379"],["assets/apple-touch-startup-image-748x1024.png","7a0a60a52048769d20dd7d14d8f384f7"],["assets/apple-touch-startup-image-750x1294.png","00966ba9b7980dcf715549c105eea023"],["assets/apple-touch-startup-image-768x1004.png","27305e5986d66c1b3ad3c135c2b18e7d"],["assets/browser-preview.60f16756cadc38e55e3e3bffc67070cd.png","60f16756cadc38e55e3e3bffc67070cd"],["assets/browser.0086dde3411e7ed961941c6c0f533ce9.png","0086dde3411e7ed961941c6c0f533ce9"],["assets/browserconfig.xml","65debe4af627d3da32044df60314c04e"],["assets/button.4e48d3440a4417b27f340967115cdb77.png","4e48d3440a4417b27f340967115cdb77"],["assets/buttonbar-preview.31f1ea3318f7744dac720c10cce0da8a.png","31f1ea3318f7744dac720c10cce0da8a"],["assets/buttonbar.babe48108285338a29c4463a9f04cb98.png","babe48108285338a29c4463a9f04cb98"],["assets/checkbox.8d5de18fb075d95835d45dcc31c96d71.png","8d5de18fb075d95835d45dcc31c96d71"],["assets/coast-228x228.png","91eb631f28ae6b59b9c5cb4ea5fb0360"],["assets/combobox.07858a343a584d56c6811340d2ab72fe.png","07858a343a584d56c6811340d2ab72fe"],["assets/comment-preview.68cdd08815be26cbbdae96a7ae0837ed.png","68cdd08815be26cbbdae96a7ae0837ed"],["assets/comment.2af16aad4d6cd3298eb57efa069317f8.png","2af16aad4d6cd3298eb57efa069317f8"],["assets/dropdown.aa44a3c326ab9316976ab2bdb4112472.png","aa44a3c326ab9316976ab2bdb4112472"],["assets/favicon-16x16.png","31583078c80e906801446ff1bb2b1d8c"],["assets/favicon-32x32.png","96972315ddfccc4cbf2ddb72d95c1fc2"],["assets/favicon.ico","668f4c7a2c862182f653fcf31b6e902c"],["assets/firefox_app_128x128.png","da58cbba928783927c56a4ace53a3af5"],["assets/firefox_app_512x512.png","a6b05f20c302865cf316f6328f5acc94"],["assets/firefox_app_60x60.png","c16c21d9c0d49c6227c0d86738b93f63"],["assets/heading.71ef52987557087defa95e8881c74f2b.png","71ef52987557087defa95e8881c74f2b"],["assets/horizontalline.df3e658f297e8de141c5a054f6b88585.png","df3e658f297e8de141c5a054f6b88585"],["assets/icomoon.10d68680a98a052fd4b89e07f7af0001.ttf","10d68680a98a052fd4b89e07f7af0001"],["assets/icomoon.353e53223ae417c33d74d1b007d44644.eot","353e53223ae417c33d74d1b007d44644"],["assets/icomoon.4840505430babdaa7069ef30a8cd30f5.svg","4840505430babdaa7069ef30a8cd30f5"],["assets/icomoon.88d5f55ce78ebb41548d639f63d3a6dc.woff","88d5f55ce78ebb41548d639f63d3a6dc"],["assets/image.e5266a0f65d57548bb1d1de3c2bdca17.png","e5266a0f65d57548bb1d1de3c2bdca17"],["assets/label.bae8556bce6a6582dada5eea87acbbbb.png","bae8556bce6a6582dada5eea87acbbbb"],["assets/link.9a2a9926eda1bef51e5504dc9461d03a.png","9a2a9926eda1bef51e5504dc9461d03a"],["assets/logo-square-64.6e5c623fdcdcfb9315b0bca54c6cd4ec.png","6e5c623fdcdcfb9315b0bca54c6cd4ec"],["assets/manifest.json","2d6c735c5bf81f447f62668637a29479"],["assets/manifest.webapp","4f0e74a16bdf8aedd59d151a31bdcc1f"],["assets/mstile-144x144.png","6cfa8556d19947c1670906ccdd59ea8f"],["assets/mstile-150x150.png","dca39a8b87a06210d7833976a682d3be"],["assets/mstile-310x150.png","6019ae9496fea9982267c246fbac2a7f"],["assets/mstile-310x310.png","2f27f46a957247ef10cc39ed16884755"],["assets/mstile-70x70.png","11dc6566e4e6b03ff772b62265cf7834"],["assets/numeric.d5bd2776b1d7c774c6f9ccac94428a32.png","d5bd2776b1d7c774c6f9ccac94428a32"],["assets/paragraph-preview.0f60a26bba8eed6aef3ec1b8633113ae.png","0f60a26bba8eed6aef3ec1b8633113ae"],["assets/paragraph.a2acf770304ca6b2cb5af8cb7c4ec89f.png","a2acf770304ca6b2cb5af8cb7c4ec89f"],["assets/phone.0bb1f3586a67a9d9ec6ef90856e40199.png","0bb1f3586a67a9d9ec6ef90856e40199"],["assets/progress.be5b008affe34b8db84cbd951f42b344.png","be5b008affe34b8db84cbd951f42b344"],["assets/radiobutton-preview.b0508cbe18e336443f224ac679364d64.png","b0508cbe18e336443f224ac679364d64"],["assets/radiobutton.f930c8aa2144ef648bf75c6230c5bc68.png","f930c8aa2144ef648bf75c6230c5bc68"],["assets/rectangle.e3007ab623815576ddab05717dd92b32.png","e3007ab623815576ddab05717dd92b32"],["assets/shape.b75adf0be3c93b6fc7cc7d281d9285da.png","b75adf0be3c93b6fc7cc7d281d9285da"],["assets/slider.fd27bb041d642ba73367b5873fc56e10.png","fd27bb041d642ba73367b5873fc56e10"],["assets/tablet.8452476a21cab241743c6117a70c06c1.png","8452476a21cab241743c6117a70c06c1"],["assets/textarea.69497fd3ad7d4529b67f4eb5d90c1be1.png","69497fd3ad7d4529b67f4eb5d90c1be1"],["assets/textinput.5e8c875edf030ffc70d9942be34c5196.png","5e8c875edf030ffc70d9942be34c5196"],["assets/toggle.2cf99decf1cabd26f2506cbe520fb7d3.png","2cf99decf1cabd26f2506cbe520fb7d3"],["assets/verticalline.142b2edc7261eb391b00db8c1c1eae2e.png","142b2edc7261eb391b00db8c1c1eae2e"],["assets/yandex-browser-50x50.png","f191be84d7a25841c20444346036a5b7"],["assets/yandex-browser-manifest.json","63c4cb833ba7af53e907ab25be1315d8"],["index.html","2065d18a6dc3b2d6d4e54b603d680fcf"],["src.dd5cfa859903f69abebc.css","7990dfa20cb722d799a58310e82cec13"],["src.dd5cfa859903f69abebc.js.LICENSE","6979af93defb1f643a98b463e99a60bf"]];
var cacheName = 'sw-precache-v3-sw-precache-webpack-plugin-' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function (originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function (originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = 'https://mydraft.cc/index.html';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







