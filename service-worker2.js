if(!self.define){let e,s={};const a=(a,r)=>(a=new URL(a+".js",r).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(r,c)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let n={};const l=e=>a(e,i),d={module:{uri:i},exports:n,require:l};s[i]=Promise.all(r.map((e=>d[e]||l(e)))).then((e=>(c(...e),n)))}}define(["./workbox-129ffb81"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"./019a43261c4d542abf75.eot?5u9dt5",revision:null},{url:"./149842402257fb64dd0e.ttf?5u9dt5",revision:null},{url:"./404.html",revision:"dfeb18041cfa2a7c2584f5b375e4c478"},{url:"./6933fec3d6e6200f38dc.woff?5u9dt5",revision:null},{url:"./assets/android-chrome-144x144.png",revision:"6cfa8556d19947c1670906ccdd59ea8f"},{url:"./assets/android-chrome-192x192.png",revision:"09a1aaacbbda4715dbf12a764207897d"},{url:"./assets/android-chrome-256x256.png",revision:"448022c080156e68700a9556f3024b0a"},{url:"./assets/android-chrome-36x36.png",revision:"954dfee05689ea95b030ea4b63c95cce"},{url:"./assets/android-chrome-384x384.png",revision:"f9733d9773765b73c6c7bb34b421b95e"},{url:"./assets/android-chrome-48x48.png",revision:"5cca877e65faf2d42350c775671537ea"},{url:"./assets/android-chrome-512x512.png",revision:"1487499124216ea41237d8b2bc4d5f76"},{url:"./assets/android-chrome-72x72.png",revision:"31e985163c5e61d892ad522237101f22"},{url:"./assets/android-chrome-96x96.png",revision:"932530ba767fbdd87d4ebfd1b420df17"},{url:"./assets/apple-touch-icon-1024x1024.png",revision:"3dda367752f52c62bed41cfe90dab83a"},{url:"./assets/apple-touch-icon-114x114.png",revision:"1f38ad857e610a95412303522c937697"},{url:"./assets/apple-touch-icon-120x120.png",revision:"a4bb63f0bdf5f10bb309a1b1db9bd465"},{url:"./assets/apple-touch-icon-144x144.png",revision:"c28b4694ad937783b29cfbc1f1126f56"},{url:"./assets/apple-touch-icon-152x152.png",revision:"81e2f399a46b9796030c1f86ff77e3de"},{url:"./assets/apple-touch-icon-167x167.png",revision:"e508f9d47e45beea110faa134cdd7fab"},{url:"./assets/apple-touch-icon-180x180.png",revision:"c6946b44ecfa3b4fb30de9ca1bad0cde"},{url:"./assets/apple-touch-icon-57x57.png",revision:"156f927432ed0f82b6b3e066e8e46f4b"},{url:"./assets/apple-touch-icon-60x60.png",revision:"dea08e2c03a683caaa108e65b0f3afb4"},{url:"./assets/apple-touch-icon-72x72.png",revision:"acc15c0267ace6de57c974489a61965b"},{url:"./assets/apple-touch-icon-76x76.png",revision:"ed5652795c6d79bed9e4cfbf511bf8a0"},{url:"./assets/apple-touch-icon-precomposed.png",revision:"c6946b44ecfa3b4fb30de9ca1bad0cde"},{url:"./assets/apple-touch-icon.png",revision:"c6946b44ecfa3b4fb30de9ca1bad0cde"},{url:"./assets/apple-touch-startup-image-1125x2436.png",revision:"6724c42f03641bffae23735665ea377d"},{url:"./assets/apple-touch-startup-image-1136x640.png",revision:"489b0834be3c9b8288fffba3d0d6aad5"},{url:"./assets/apple-touch-startup-image-1242x2208.png",revision:"afbec27bcc5a71b85f8c1a14dfb52a8d"},{url:"./assets/apple-touch-startup-image-1242x2688.png",revision:"1bf01499d24507cf40c6ddee310e2924"},{url:"./assets/apple-touch-startup-image-1334x750.png",revision:"6254ce200fe13e6d7fae612514970193"},{url:"./assets/apple-touch-startup-image-1536x2048.png",revision:"b36dea817ec76da469588fb32090a892"},{url:"./assets/apple-touch-startup-image-1620x2160.png",revision:"cd607607b8455125af8e873893886388"},{url:"./assets/apple-touch-startup-image-1668x2224.png",revision:"7868ebcb32ca7aed5c08c50d9c28583c"},{url:"./assets/apple-touch-startup-image-1668x2388.png",revision:"08adff05b5f3f2cf6050f718e0cde06e"},{url:"./assets/apple-touch-startup-image-1792x828.png",revision:"45cf8d43107fb2da619e36ef9c857386"},{url:"./assets/apple-touch-startup-image-2048x1536.png",revision:"097d7e9ce67610771eacc3d9307e7124"},{url:"./assets/apple-touch-startup-image-2048x2732.png",revision:"7b0b2f538694d7ab9a078ba06610ec8c"},{url:"./assets/apple-touch-startup-image-2160x1620.png",revision:"515e330a593ae9cd24e49952c0416255"},{url:"./assets/apple-touch-startup-image-2208x1242.png",revision:"aa10a3595a73fd9114ecc544c4318eda"},{url:"./assets/apple-touch-startup-image-2224x1668.png",revision:"f270e8eba2b33d35fb9321fb1d601450"},{url:"./assets/apple-touch-startup-image-2388x1668.png",revision:"3620f76220ad1cbfb102fd5dcc052c51"},{url:"./assets/apple-touch-startup-image-2436x1125.png",revision:"3d248809f9774580b1f173060927afb3"},{url:"./assets/apple-touch-startup-image-2688x1242.png",revision:"4b25ef73e8ccea59710159767a1b0006"},{url:"./assets/apple-touch-startup-image-2732x2048.png",revision:"5f32ad0d77dcb2f1b4c1310f45a9276a"},{url:"./assets/apple-touch-startup-image-640x1136.png",revision:"1cec274cafa7ed5ce35399204cc38cc6"},{url:"./assets/apple-touch-startup-image-750x1334.png",revision:"f3ee397e1d59a2b97eef8ad2b689a5d8"},{url:"./assets/apple-touch-startup-image-828x1792.png",revision:"30c6617f2afc5e98727010d32e3d10ca"},{url:"./assets/browser-preview.bcb47d89f1ad793979405ae69a624983.png",revision:null},{url:"./assets/browser.62092c939e6f798222f8e4090983d084.png",revision:null},{url:"./assets/browserconfig.xml",revision:"6b9febff1eb49f1662476afc3e8c6d77"},{url:"./assets/button.8b6daa0252161fe4e76ee6ed12c62660.png",revision:null},{url:"./assets/buttonbar-preview.db04be4cf2db43d21c88f5e294b73f35.png",revision:null},{url:"./assets/buttonbar.84c26f3472a538e1ecf45edc113b01ce.png",revision:null},{url:"./assets/checkbox.2ed567bb578993270ac32015f5d1ae17.png",revision:null},{url:"./assets/coast-228x228.png",revision:"91eb631f28ae6b59b9c5cb4ea5fb0360"},{url:"./assets/combobox.0deded8f595b34aa72a45d88dd9a9496.png",revision:null},{url:"./assets/comment-preview.c2eb4d7a67e60cd0ff846d10d871018a.png",revision:null},{url:"./assets/comment.b3b22ebd09ca94856e1c4e1040c212f3.png",revision:null},{url:"./assets/dropdown.0df3d87702af0c724db8164bd1ad4cbc.png",revision:null},{url:"./assets/favicon-16x16.png",revision:"31583078c80e906801446ff1bb2b1d8c"},{url:"./assets/favicon-32x32.png",revision:"96972315ddfccc4cbf2ddb72d95c1fc2"},{url:"./assets/favicon-48x48.png",revision:"5cca877e65faf2d42350c775671537ea"},{url:"./assets/favicon.ico",revision:"668f4c7a2c862182f653fcf31b6e902c"},{url:"./assets/firefox_app_128x128.png",revision:"da58cbba928783927c56a4ace53a3af5"},{url:"./assets/firefox_app_512x512.png",revision:"a6b05f20c302865cf316f6328f5acc94"},{url:"./assets/firefox_app_60x60.png",revision:"c16c21d9c0d49c6227c0d86738b93f63"},{url:"./assets/heading.786cb4425e1c12435efdc4e5877cddcb.png",revision:null},{url:"./assets/horizontalline.62590f8bc1ece6dcdcd341b8c1544fd5.png",revision:null},{url:"./assets/horizontalscrollbar.842aa12c06cb16e77983a4d21d1fefc2.png",revision:null},{url:"./assets/icomoon.1291259fc167d3808db2b69930ecf642.svg",revision:null},{url:"./assets/image.c8817f2e29c599ae489e6a849cb270c7.png",revision:null},{url:"./assets/label.d828ab9f457590f77cc99ce0efd66bb0.png",revision:null},{url:"./assets/link.b8889d7a0f5dc8d013ed89b392980205.png",revision:null},{url:"./assets/list.7571b81a001f226a3ec70bdfffa7f69a.png",revision:null},{url:"./assets/logo-square-64.45614b8d4ef1947872625657a17bbd94.png",revision:null},{url:"./assets/manifest.json",revision:"28ba9d27128aeb362ae5353465ad6f2c"},{url:"./assets/manifest.webapp",revision:"0bb2fe3d75b8c879f583c9f5428ab5b6"},{url:"./assets/mstile-144x144.png",revision:"6cfa8556d19947c1670906ccdd59ea8f"},{url:"./assets/mstile-150x150.png",revision:"7dd1b1e144a6feb852134d2f59418035"},{url:"./assets/mstile-310x150.png",revision:"2a3493cbed6a6e302f3290ea0b8680f2"},{url:"./assets/mstile-310x310.png",revision:"9499fb0eb02f0b2f66795bc14b40b0d8"},{url:"./assets/mstile-70x70.png",revision:"9c0886941a42567bb0304109516de604"},{url:"./assets/numeric.9fd0afc02da2a296226f2813412ef703.png",revision:null},{url:"./assets/paragraph-preview.c80736fc1976882f634709aac134031c.png",revision:null},{url:"./assets/paragraph.70bb85be87528354a8ed9b0076a024d3.png",revision:null},{url:"./assets/phone.a00068b4773774dad7d9745f2a9197c3.png",revision:null},{url:"./assets/progress.079613001591b4d52a732b08125495a3.png",revision:null},{url:"./assets/radiobutton-preview.a4dbce6fb4c607ced43355580cf4c360.png",revision:null},{url:"./assets/radiobutton.7fb896e3149592c643a431018810a620.png",revision:null},{url:"./assets/rectangle.8ea2f344501a0387adbda6de70d64034.png",revision:null},{url:"./assets/shape.3763603b5fc525b5dd7dbb8396ad7915.png",revision:null},{url:"./assets/slider.009855487fd292320bba333f60beee12.png",revision:null},{url:"./assets/tablet.feddd05b4f501a43aa27bdb61a8402d8.png",revision:null},{url:"./assets/tabs.d6b5ced8aff35617dad3471218016570.png",revision:null},{url:"./assets/textarea.8d380753650f2299662c1719ae88fd98.png",revision:null},{url:"./assets/textinput.8ee359166f13446da11df18c9b157b63.png",revision:null},{url:"./assets/toggle.39b11f77a28d6f0b5876f88e8c755fb4.png",revision:null},{url:"./assets/verticalline.90d7c88ee4b6da350bb6f4d0fe579193.png",revision:null},{url:"./assets/verticalscrollbar.6ec117f54c7c6dd20ec4167720f16a2d.png",revision:null},{url:"./assets/yandex-browser-50x50.png",revision:"f191be84d7a25841c20444346036a5b7"},{url:"./assets/yandex-browser-manifest.json",revision:"1fa786b96e710d40404b454e3f54141c"},{url:"./de70db52764c8ea764ef.svg?5u9dt5",revision:null},{url:"./index.html",revision:"dfeb18041cfa2a7c2584f5b375e4c478"},{url:"./src.36bd979c.js",revision:null},{url:"./src.36bd979c.js.LICENSE.txt",revision:"b7e940f92c33a93c928088afc9c2d385"},{url:"./src.css",revision:"9c0bfbb0eca1e0ddad8d9cec7c3d9e9f"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("https://mydraft.cc/index.html")))}));