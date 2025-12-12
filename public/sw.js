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
      d = { module: { uri: n }, exports: c, require: r };
    s[n] = Promise.all(i.map((e) => d[e] || r(e))).then((e) => (a(...e), c));
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
          url: "/_next/static/Mj5Hy-XvAYtBbAQH5_dee/_buildManifest.js",
          revision: "9a6b411ffde2ef12e97875c4ed23d0ff",
        },
        {
          url: "/_next/static/Mj5Hy-XvAYtBbAQH5_dee/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/0b7b90cd.b5852e5e503d071d.js",
          revision: "b5852e5e503d071d",
        },
        {
          url: "/_next/static/chunks/1133-c1c961c1f041a6ed.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/1135-0a1bb6cbb26e2368.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/1194-a3fb079e88625508.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/1328-1d15a6715aaeb795.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/134-ab175909a52fd32f.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/1392-4d764dd0b88bb962.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/1525-dd7b7589f3da28ab.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/1607-8327018c054cba06.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/1664-b8b44184c8453caa.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/2581-9330e301ad0578e3.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/2695.85890ef6d1e7e04d.js",
          revision: "85890ef6d1e7e04d",
        },
        {
          url: "/_next/static/chunks/3022-7ee5769f0ae48828.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/3057-80e6a5899348eee0.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/3757-8dbeb26ee024901e.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/3823-7c4198ef127c8fba.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/3892-0c762955747252a4.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/4203-f1f70fe86ac705ac.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/4342-2c3f0a9af8d5dbda.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/4551-4b90c2051d6ff987.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/4596.5c8359300297affe.js",
          revision: "5c8359300297affe",
        },
        {
          url: "/_next/static/chunks/4629-89509f11d221b8ae.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/5182-039555cf454f6afc.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/5324-346d694c2e98ed68.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/5424-4966ad109f6621d4.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/5675-0dd9af052764939d.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/5959-c1b13764ca852d98.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/6513-bcbcb8e0b865cfd5.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/7264-e573a8bf9c221f28.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/7378-d5c2d4707ff96c4a.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/7380-312df5294879b32e.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/741-5c4e4612ba1ca7da.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/7456-50d84b0d9cc2f307.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/7642-338651ab46c58442.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/7895-7678b5ac4b10a5b6.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/8114-099395c605d56c34.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/8172-ef314199c0efd401.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/8298-bf617d55cbc74790.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/8599-0695b1fa49fce87d.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/8919-1100251b2c8ce9de.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/9194-38afd3bcd430c0f4.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/9476-44d810d3e9886f97.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/9728-3ab4a48daa2dcd3c.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/9750-b2bdf4dcd90fa543.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/9936-99fe083dda753bae.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/997-d6111a4ed504394d.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/fd9d1056-d2fc5e3717adf4eb.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/framework-81e04675b2f7c5bf.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/main-8357ff53e4b9d7f6.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/main-app-663d1c96165305b3.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Login-0994dc7825cbfbc2.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Register-1cb46aba4c522626.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Cart-666e4fe6e68495f3.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders-01e9873fb38b7027.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders/viewOrderDetails/%5BorderId%5D-eafa7563fb9f75de.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Messages-be74711ea83d29f0.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Messages/%5BorderId%5D-987e9e3e586d6c51.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile-a182944d169ffb14.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile/become-shopper-1a3e095f69e4357b.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Earnings-6c40231243b60848.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Settings-c1bfc68bf4d8d4f1.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/ShopperProfile-f59a111bd91b99f0.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches-2c83ccc62e018574.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches/batch/%5Bid%5D-aeff269388d48849.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat-02878acbd1ff0a70.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat/%5BorderId%5D-0fb9a0f20b5579b9.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices-9ec26e85395c48ac.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices/%5Bid%5D-522888b6754f8055.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/orders/%5Bid%5D-26ed8224cb800bd2.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Recipes-b0844c8fdc14c2b3.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Recipes/%5Bid%5D-f53cf05ed710d2a4.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/Reels-e0b38932626400d7.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/_app-92804a8bd6bfc2ef.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/_error-8008506205ce3edf.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/dev/logs-b9e7a6d62f171d1d.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/index-c293ba605e646fb8.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness-5180c26da3cc7576.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/BusinessChats-4e976dc9898b5e40.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/quote-details-modal-be225411a720531e.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/store/%5BstoreId%5D-6f6e8a67b95ab259.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/restaurant/%5Bid%5D-ed89b9e81c47dc0d.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/shopper/batch/%5BorderId%5D/details-7b2cd2e657c8dc3e.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/shops-261f03a98acc4fb1.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/shops/%5Bid%5D-b5fa9048315afb5d.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/test-connection-305b4b85b40e8564.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/test-redirect-207b7539088b175a.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/pages/test/websocket-2e44d4043528ee4f.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-911fa84c93c3d01d.js",
          revision: "Mj5Hy-XvAYtBbAQH5_dee",
        },
        {
          url: "/_next/static/css/030f3887bbb898a4.css",
          revision: "030f3887bbb898a4",
        },
        {
          url: "/_next/static/css/5742516f9157e1df.css",
          revision: "5742516f9157e1df",
        },
        {
          url: "/_next/static/css/fc1c9daac70c093b.css",
          revision: "fc1c9daac70c093b",
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
          url: "/assets/images/mobileheaderbg.jpg",
          revision: "e3eff87ef204326894255ca6cfeca053",
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
          url: "/assets/images/restaurantImage.webp",
          revision: "7c4ab24a6071be51595af609368a4bd7",
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
          revision: "fe91a535cc05693e6b3a4179f689d226",
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
          url: "/images/restaurantDish.png",
          revision: "e96890a391bdef237d559d48b41db9f5",
        },
        {
          url: "/images/shop-placeholder.jpg",
          revision: "be733cb690aae457158b1c33a061e360",
        },
        {
          url: "/images/userProfile.png",
          revision: "1ce10035f8560c8a2cbc4e2db0ea7b1c",
        },
        { url: "/manifest.json", revision: "57fc33553c69e34175ea6d65d7202675" },
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
