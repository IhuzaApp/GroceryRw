if (!self.define) {
  let e,
    s = {};
  const t = (t, i) => (
    (t = new URL(t + ".js", i).href),
    s[t] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = t), (e.onload = s), document.head.appendChild(e);
        } else (e = t), importScripts(t), s();
      }).then(() => {
        let e = s[t];
        if (!e) throw new Error(`Module ${t} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, a) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[n]) return;
    let c = {};
    const r = (e) => t(e, n),
      _ = { module: { uri: n }, exports: c, require: r };
    s[n] = Promise.all(i.map((e) => _[e] || r(e))).then((e) => (a(...e), c));
  };
}
define(["./workbox-1bb06f5e"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "434af078512000203212119bf342c673",
        },
        {
          url: "/_next/static/chunks/0b7b90cd.b5852e5e503d071d.js",
          revision: "b5852e5e503d071d",
        },
        {
          url: "/_next/static/chunks/1135-0a1bb6cbb26e2368.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/1194-a3fb079e88625508.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/1328-1d15a6715aaeb795.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/1392-4d764dd0b88bb962.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/1427-b88e6a19703bb863.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/1562-7ca4044d5b21f198.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/1607-8327018c054cba06.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/1664-b8b44184c8453caa.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/2422-4270071c428d70dc.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/2581-9330e301ad0578e3.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/2695.85890ef6d1e7e04d.js",
          revision: "85890ef6d1e7e04d",
        },
        {
          url: "/_next/static/chunks/2868-e214bdd62a4929d4.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/3022-ed7116e07eb484ba.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/3170-96714b2d5be54f92.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/3528-14cde70433ca6e90.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/3823-7c4198ef127c8fba.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/3852-602af3abf9bc2776.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/3892-0c762955747252a4.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/4338-22fff725db6a6abd.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/4342-2c3f0a9af8d5dbda.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/4551-4b90c2051d6ff987.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/4596.f518ff10274a3aa3.js",
          revision: "f518ff10274a3aa3",
        },
        {
          url: "/_next/static/chunks/5182-1675603d91ceed1f.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/5324-5e9729cc258c0cd2.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/5675-0dd9af052764939d.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/5959-728cda4ca1372cf7.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/65-fe197090898208fd.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/6513-bcbcb8e0b865cfd5.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/6873-9e3696a6cf5cc9a5.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/700-4eb4cbf4a28a5f12.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/7378-d5c2d4707ff96c4a.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/7380-f71c64586534c9f5.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/7456-50d84b0d9cc2f307.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/7675-a1b0cf51082b60a3.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/8114-315951d95f90c91f.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/8298-bf617d55cbc74790.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/8328-0cded17beaaaae3a.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/9194-82977d8edda641fe.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/9476-44d810d3e9886f97.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/9495-c47e5615874299b0.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/9588-10937dd14bb467c9.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/9708-39684b1418bd897d.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/9936-7b3b5e9a219fcaf7.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/fd9d1056-d2fc5e3717adf4eb.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/framework-81e04675b2f7c5bf.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/main-8357ff53e4b9d7f6.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/main-app-663d1c96165305b3.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Login-d6012ea87c0b1383.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Register-1cb46aba4c522626.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Cart-e2f1908566941d1a.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders-7ffdb8fe0561633d.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders/viewOrderDetails/%5BorderId%5D-d93af8542790664d.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Messages-534a7365e5d8ce0e.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Messages/%5BorderId%5D-987e9e3e586d6c51.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile-232066f155241a9f.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile/become-shopper-e7914c785f70e3c0.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Earnings-2e06d2b292b3ff25.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Settings-4e12e3a9f596a3db.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/ShopperProfile-4bb9f2bce21ec318.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches-78c4648dd0709d2e.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches/batch/%5Bid%5D-8fb7fb1f0a3edfbe.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat-df34ea8f20c84bea.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat/%5BorderId%5D-5ab3fbb8a34f8884.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices-7fb2a6c8655e8fef.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices/%5Bid%5D-0349c974a161d0fb.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/orders/%5Bid%5D-e5afbbb7b04154c1.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Recipes-3689f7531f9d832f.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Recipes/%5Bid%5D-7d7429ccede9fb42.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/Reels-2da789d767ee356e.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/_app-14c4644f9e537a4c.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/_error-8008506205ce3edf.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/dev/logs-ed5c5150554aa9b7.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/index-46869f53b4db0905.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/restaurant/%5Bid%5D-b858d5e2daabea59.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/shops-481ef09472f78fb0.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/shops/%5Bid%5D-47b3c7b99fd40948.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/test-connection-d2ec22ac9827a90e.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/pages/test-redirect-207b7539088b175a.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-940cf9dfd532bc55.js",
          revision: "etZqrA_t_FOKOw1MB7M_M",
        },
        {
          url: "/_next/static/css/5742516f9157e1df.css",
          revision: "5742516f9157e1df",
        },
        {
          url: "/_next/static/css/e9607a9432709a35.css",
          revision: "e9607a9432709a35",
        },
        {
          url: "/_next/static/css/fc1c9daac70c093b.css",
          revision: "fc1c9daac70c093b",
        },
        {
          url: "/_next/static/etZqrA_t_FOKOw1MB7M_M/_buildManifest.js",
          revision: "4d66eb7df0012656be644ab66aeb5012",
        },
        {
          url: "/_next/static/etZqrA_t_FOKOw1MB7M_M/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/media/layers-2x.9859cd12.png",
          revision: "9859cd12",
        },
        {
          url: "/_next/static/media/layers.ef6db872.png",
          revision: "ef6db872",
        },
        {
          url: "/_next/static/media/marker-icon.d577052a.png",
          revision: "d577052a",
        },
        { url: "/app-icon.png", revision: "e160019ffb8bbdd8cfaeba1f2ff03c7e" },
        {
          url: "/assets/Videos/coverr-shopping-for-fresh-fruits-1080p.mp4",
          revision: "02e1856ffe45b7bc9f445b27e43bd90f",
        },
        {
          url: "/assets/icons/Butchery.png",
          revision: "dc8d368bf62c4f17e4a10cc784db07db",
        },
        {
          url: "/assets/icons/bakery.png",
          revision: "ec7093da4af18d9a2ea40b2ddc3e6812",
        },
        {
          url: "/assets/icons/drinks.png",
          revision: "b16adaf988964af5a4c455fa98b47489",
        },
        {
          url: "/assets/icons/fruits.png",
          revision: "987e65a832170c9f03f3169181e0809a",
        },
        {
          url: "/assets/icons/hygien.png",
          revision: "d921cbd9d7470024b190343d8a6af097",
        },
        {
          url: "/assets/icons/pets.png",
          revision: "529c9e6c552d82239a42b6e616ad257b",
        },
        {
          url: "/assets/icons/shop.png",
          revision: "62299e7f6ca1c6be1c77c849eab9a39b",
        },
        {
          url: "/assets/icons/shopIcon.png",
          revision: "dddb5700034f7bdf5f5e02c5b066e239",
        },
        {
          url: "/assets/icons/snacks.png",
          revision: "e0f15da77bef891daf54ea62c3bff116",
        },
        {
          url: "/assets/icons/vegitables.png",
          revision: "30b1ee1ffe80437d9a192e5e80c18992",
        },
        {
          url: "/assets/images/Bakery.webp",
          revision: "c4257cc36f4c7a90cc6003d910c41426",
        },
        {
          url: "/assets/images/Butcher.webp",
          revision: "943dfb33e0d0bcbffef54b2fa3905573",
        },
        {
          url: "/assets/images/OrganicShop.jpg",
          revision: "e1e57a6715e36e21e54c6fc57b72e9e7",
        },
        {
          url: "/assets/images/backeryImage.jpg",
          revision: "b31765b2eafd30f2f7490bf30ab2014d",
        },
        {
          url: "/assets/images/chip.png",
          revision: "04b96cc01a3486a195b5c932e82eca12",
        },
        {
          url: "/assets/images/delicatessen.jpeg",
          revision: "54d354d3de5ceb996e24b6efc9764ef6",
        },
        {
          url: "/assets/images/profile.jpg",
          revision: "8ad924455c396fb81c6ac55fcdab41c0",
        },
        {
          url: "/assets/images/publicMarket.jpg",
          revision: "c99f0890a2abf84353b67e4e469cbad9",
        },
        {
          url: "/assets/images/shopping.jpg",
          revision: "bc3ce59176e588e6439608bcbb5a06e9",
        },
        {
          url: "/assets/images/shopsImage.jpg",
          revision: "cd7d8de97282a47bec0d5d2d8e125240",
        },
        {
          url: "/assets/images/superMarkets.jpg",
          revision: "8fd14e0ba308c44767dadc78dadf78e0",
        },
        {
          url: "/assets/logos/PlasIcon.png",
          revision: "cd1dedf5ea161ccd4ad0be76ac99a91a",
        },
        {
          url: "/assets/logos/PlasLogo.svg",
          revision: "45249efd5eacaa9440cb3d7c8433240d",
        },
        {
          url: "/assets/logos/PlasLogoPNG.png",
          revision: "b57c84d411af7da0f4edfe488dcc062c",
        },
        {
          url: "/assets/sounds/newMessage.mp3",
          revision: "93e16838ba935995b13e6bdb05ebf93e",
        },
        { url: "/favicon.ico", revision: "c30c7d42707a47a3f4591831641e50dc" },
        {
          url: "/firebase-messaging-sw.js",
          revision: "851483ba489e938782c3390717830d63",
        },
        {
          url: "/icon-128x128.png",
          revision: "810cf2910bbafb7dfb8b96e1ff73985a",
        },
        {
          url: "/icon-144x144.png",
          revision: "7970bce73b1f1b6a26c149df6f684467",
        },
        {
          url: "/icon-152x152.png",
          revision: "72a2fb327947435227fe720c46c96fc6",
        },
        {
          url: "/icon-192x192.png",
          revision: "be057baac45dbe078b8612ae2573d379",
        },
        {
          url: "/icon-384x384.png",
          revision: "6c656838f652fafa5c946d62040b842e",
        },
        {
          url: "/icon-512x512.png",
          revision: "43920cdd683277f0de811acee700b551",
        },
        {
          url: "/icon-72x72.png",
          revision: "1e0da8531c01e03cf2605f6a3b268c2c",
        },
        {
          url: "/icon-96x96.png",
          revision: "20154f98e9cf50b296cddc306bd30a22",
        },
        {
          url: "/images/ProfileImage.png",
          revision: "ffe613ad8991b9ce590c536ece85b592",
        },
        {
          url: "/images/groceryPlaceholder.png",
          revision: "36e3d1f5f0368395a225126f89ec975a",
        },
        {
          url: "/images/shop-placeholder.jpg",
          revision: "be733cb690aae457158b1c33a061e360",
        },
        {
          url: "/images/userProfile.png",
          revision: "1ce10035f8560c8a2cbc4e2db0ea7b1c",
        },
        { url: "/manifest.json", revision: "5c53ce7661dcf6c1586c9ed16dbaa9b5" },
        {
          url: "/notifySound.mp3",
          revision: "8b27319049898514ea8031ce3a3f63ac",
        },
        {
          url: "/placeholder.svg",
          revision: "243098b109a59a642ae8465d67d4b24a",
        },
        { url: "/vercel.svg", revision: "4b4f1876502eb6721764637fe5c41702" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: t,
              state: i,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.gstatic\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-static",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/.*\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/.*\.(?:js|css|mjs)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "external-js-css-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    );
});
