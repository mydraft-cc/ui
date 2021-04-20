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

var precacheConfig = [["404.html","f41ab7f865d1f22a0f9c2375ef18857b"],["assets/android-chrome-144x144.png","6cfa8556d19947c1670906ccdd59ea8f"],["assets/android-chrome-192x192.png","09a1aaacbbda4715dbf12a764207897d"],["assets/android-chrome-256x256.png","448022c080156e68700a9556f3024b0a"],["assets/android-chrome-36x36.png","954dfee05689ea95b030ea4b63c95cce"],["assets/android-chrome-384x384.png","f9733d9773765b73c6c7bb34b421b95e"],["assets/android-chrome-48x48.png","5cca877e65faf2d42350c775671537ea"],["assets/android-chrome-512x512.png","1487499124216ea41237d8b2bc4d5f76"],["assets/android-chrome-72x72.png","31e985163c5e61d892ad522237101f22"],["assets/android-chrome-96x96.png","932530ba767fbdd87d4ebfd1b420df17"],["assets/apple-touch-icon-1024x1024.png","3dda367752f52c62bed41cfe90dab83a"],["assets/apple-touch-icon-114x114.png","1f38ad857e610a95412303522c937697"],["assets/apple-touch-icon-120x120.png","a4bb63f0bdf5f10bb309a1b1db9bd465"],["assets/apple-touch-icon-144x144.png","c28b4694ad937783b29cfbc1f1126f56"],["assets/apple-touch-icon-152x152.png","81e2f399a46b9796030c1f86ff77e3de"],["assets/apple-touch-icon-167x167.png","e508f9d47e45beea110faa134cdd7fab"],["assets/apple-touch-icon-180x180.png","c6946b44ecfa3b4fb30de9ca1bad0cde"],["assets/apple-touch-icon-57x57.png","156f927432ed0f82b6b3e066e8e46f4b"],["assets/apple-touch-icon-60x60.png","dea08e2c03a683caaa108e65b0f3afb4"],["assets/apple-touch-icon-72x72.png","acc15c0267ace6de57c974489a61965b"],["assets/apple-touch-icon-76x76.png","ed5652795c6d79bed9e4cfbf511bf8a0"],["assets/apple-touch-icon-precomposed.png","c6946b44ecfa3b4fb30de9ca1bad0cde"],["assets/apple-touch-icon.png","c6946b44ecfa3b4fb30de9ca1bad0cde"],["assets/apple-touch-startup-image-1125x2436.png","6724c42f03641bffae23735665ea377d"],["assets/apple-touch-startup-image-1136x640.png","489b0834be3c9b8288fffba3d0d6aad5"],["assets/apple-touch-startup-image-1242x2208.png","afbec27bcc5a71b85f8c1a14dfb52a8d"],["assets/apple-touch-startup-image-1242x2688.png","1bf01499d24507cf40c6ddee310e2924"],["assets/apple-touch-startup-image-1334x750.png","6254ce200fe13e6d7fae612514970193"],["assets/apple-touch-startup-image-1536x2048.png","b36dea817ec76da469588fb32090a892"],["assets/apple-touch-startup-image-1620x2160.png","cd607607b8455125af8e873893886388"],["assets/apple-touch-startup-image-1668x2224.png","7868ebcb32ca7aed5c08c50d9c28583c"],["assets/apple-touch-startup-image-1668x2388.png","08adff05b5f3f2cf6050f718e0cde06e"],["assets/apple-touch-startup-image-1792x828.png","45cf8d43107fb2da619e36ef9c857386"],["assets/apple-touch-startup-image-2048x1536.png","097d7e9ce67610771eacc3d9307e7124"],["assets/apple-touch-startup-image-2048x2732.png","7b0b2f538694d7ab9a078ba06610ec8c"],["assets/apple-touch-startup-image-2160x1620.png","515e330a593ae9cd24e49952c0416255"],["assets/apple-touch-startup-image-2208x1242.png","aa10a3595a73fd9114ecc544c4318eda"],["assets/apple-touch-startup-image-2224x1668.png","f270e8eba2b33d35fb9321fb1d601450"],["assets/apple-touch-startup-image-2388x1668.png","3620f76220ad1cbfb102fd5dcc052c51"],["assets/apple-touch-startup-image-2436x1125.png","3d248809f9774580b1f173060927afb3"],["assets/apple-touch-startup-image-2688x1242.png","4b25ef73e8ccea59710159767a1b0006"],["assets/apple-touch-startup-image-2732x2048.png","5f32ad0d77dcb2f1b4c1310f45a9276a"],["assets/apple-touch-startup-image-640x1136.png","1cec274cafa7ed5ce35399204cc38cc6"],["assets/apple-touch-startup-image-750x1334.png","f3ee397e1d59a2b97eef8ad2b689a5d8"],["assets/apple-touch-startup-image-828x1792.png","30c6617f2afc5e98727010d32e3d10ca"],["assets/browser-preview.bcb47d89f1ad793979405ae69a624983.png","60f16756cadc38e55e3e3bffc67070cd"],["assets/browser.62092c939e6f798222f8e4090983d084.png","0086dde3411e7ed961941c6c0f533ce9"],["assets/browserconfig.xml","2ed8250f0c8ea86f0251039b25f70f75"],["assets/button.8b6daa0252161fe4e76ee6ed12c62660.png","4e48d3440a4417b27f340967115cdb77"],["assets/buttonbar-preview.db04be4cf2db43d21c88f5e294b73f35.png","31f1ea3318f7744dac720c10cce0da8a"],["assets/buttonbar.84c26f3472a538e1ecf45edc113b01ce.png","babe48108285338a29c4463a9f04cb98"],["assets/checkbox.2ed567bb578993270ac32015f5d1ae17.png","8d5de18fb075d95835d45dcc31c96d71"],["assets/coast-228x228.png","91eb631f28ae6b59b9c5cb4ea5fb0360"],["assets/combobox.0deded8f595b34aa72a45d88dd9a9496.png","07858a343a584d56c6811340d2ab72fe"],["assets/comment-preview.c2eb4d7a67e60cd0ff846d10d871018a.png","68cdd08815be26cbbdae96a7ae0837ed"],["assets/comment.b3b22ebd09ca94856e1c4e1040c212f3.png","2af16aad4d6cd3298eb57efa069317f8"],["assets/dropdown.0df3d87702af0c724db8164bd1ad4cbc.png","aa44a3c326ab9316976ab2bdb4112472"],["assets/favicon-16x16.png","31583078c80e906801446ff1bb2b1d8c"],["assets/favicon-32x32.png","96972315ddfccc4cbf2ddb72d95c1fc2"],["assets/favicon-48x48.png","5cca877e65faf2d42350c775671537ea"],["assets/favicon.ico","668f4c7a2c862182f653fcf31b6e902c"],["assets/firefox_app_128x128.png","da58cbba928783927c56a4ace53a3af5"],["assets/firefox_app_512x512.png","a6b05f20c302865cf316f6328f5acc94"],["assets/firefox_app_60x60.png","c16c21d9c0d49c6227c0d86738b93f63"],["assets/heading.786cb4425e1c12435efdc4e5877cddcb.png","71ef52987557087defa95e8881c74f2b"],["assets/horizontalline.62590f8bc1ece6dcdcd341b8c1544fd5.png","df3e658f297e8de141c5a054f6b88585"],["assets/horizontalscrollbar.842aa12c06cb16e77983a4d21d1fefc2.png","3eec2dfe829f488db0d6264bb4be8bbf"],["assets/icomoon.1291259fc167d3808db2b69930ecf642.svg","4840505430babdaa7069ef30a8cd30f5"],["assets/icomoon.a732de6cc142d5d5b3c5d88c367de790.woff","88d5f55ce78ebb41548d639f63d3a6dc"],["assets/icomoon.bbaada0279b360e2ec3fecf270ce47d4.eot","353e53223ae417c33d74d1b007d44644"],["assets/icomoon.c48960517fe2c3e68f454106708e0918.ttf","10d68680a98a052fd4b89e07f7af0001"],["assets/image.c8817f2e29c599ae489e6a849cb270c7.png","e5266a0f65d57548bb1d1de3c2bdca17"],["assets/label.d828ab9f457590f77cc99ce0efd66bb0.png","bae8556bce6a6582dada5eea87acbbbb"],["assets/link.b8889d7a0f5dc8d013ed89b392980205.png","9a2a9926eda1bef51e5504dc9461d03a"],["assets/logo-square-64.45614b8d4ef1947872625657a17bbd94.png","6e5c623fdcdcfb9315b0bca54c6cd4ec"],["assets/manifest.json","4e27e1e3cc4b0b4e19e79fc84bcf2bcb"],["assets/manifest.webapp","0b53c8f913b06862803a825d59697c40"],["assets/mstile-144x144.png","6cfa8556d19947c1670906ccdd59ea8f"],["assets/mstile-150x150.png","7dd1b1e144a6feb852134d2f59418035"],["assets/mstile-310x150.png","2a3493cbed6a6e302f3290ea0b8680f2"],["assets/mstile-310x310.png","9499fb0eb02f0b2f66795bc14b40b0d8"],["assets/mstile-70x70.png","9c0886941a42567bb0304109516de604"],["assets/numeric.9fd0afc02da2a296226f2813412ef703.png","d5bd2776b1d7c774c6f9ccac94428a32"],["assets/paragraph-preview.c80736fc1976882f634709aac134031c.png","0f60a26bba8eed6aef3ec1b8633113ae"],["assets/paragraph.70bb85be87528354a8ed9b0076a024d3.png","a2acf770304ca6b2cb5af8cb7c4ec89f"],["assets/phone.a00068b4773774dad7d9745f2a9197c3.png","0bb1f3586a67a9d9ec6ef90856e40199"],["assets/progress.079613001591b4d52a732b08125495a3.png","be5b008affe34b8db84cbd951f42b344"],["assets/radiobutton-preview.a4dbce6fb4c607ced43355580cf4c360.png","b0508cbe18e336443f224ac679364d64"],["assets/radiobutton.7fb896e3149592c643a431018810a620.png","f930c8aa2144ef648bf75c6230c5bc68"],["assets/rectangle.8ea2f344501a0387adbda6de70d64034.png","e3007ab623815576ddab05717dd92b32"],["assets/shape.3763603b5fc525b5dd7dbb8396ad7915.png","b75adf0be3c93b6fc7cc7d281d9285da"],["assets/slider.009855487fd292320bba333f60beee12.png","fd27bb041d642ba73367b5873fc56e10"],["assets/tablet.feddd05b4f501a43aa27bdb61a8402d8.png","8452476a21cab241743c6117a70c06c1"],["assets/tabs.d6b5ced8aff35617dad3471218016570.png","49a7c4e8199636df894cceefd143c9cd"],["assets/textarea.8d380753650f2299662c1719ae88fd98.png","69497fd3ad7d4529b67f4eb5d90c1be1"],["assets/textinput.8ee359166f13446da11df18c9b157b63.png","5e8c875edf030ffc70d9942be34c5196"],["assets/toggle.39b11f77a28d6f0b5876f88e8c755fb4.png","2cf99decf1cabd26f2506cbe520fb7d3"],["assets/verticalline.90d7c88ee4b6da350bb6f4d0fe579193.png","142b2edc7261eb391b00db8c1c1eae2e"],["assets/verticalscrollbar.6ec117f54c7c6dd20ec4167720f16a2d.png","cd4ff5410831c3253c9441ad19d3e8bc"],["assets/yandex-browser-50x50.png","f191be84d7a25841c20444346036a5b7"],["assets/yandex-browser-manifest.json","bfb844ca315539e8a5a8429a36978be3"],["index.html","f41ab7f865d1f22a0f9c2375ef18857b"],["src.96ad128c59e5aa9c5aa0.js.LICENSE.txt","5a8ba7898a506e66dde761eee1685ff9"],["src.css","cbcc46821c08f328aa03f5702cbad218"]];
var cacheName = 'sw-precache-v3-sw-precache-webpack-plugin-' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function(originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function(originalResponse) {
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

var createCacheKey = function(originalUrl, paramName, paramValue,
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

var isPathWhitelisted = function(whitelist, absoluteUrlString) {
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

var stripIgnoredUrlParameters = function(originalUrl,
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







