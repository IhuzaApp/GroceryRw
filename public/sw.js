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
  self.define = (i, c) => {
    const a =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[a]) return;
    let n = {};
    const r = (e) => t(e, a),
      b = { module: { uri: a }, exports: n, require: r };
    s[a] = Promise.all(i.map((e) => b[e] || r(e))).then((e) => (c(...e), n));
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
          url: "/_next/static/EL9tYNeHqbxpkJb009Bde/_buildManifest.js",
          revision: "9b074fb1705bb6330bff535fbf0b123c",
        },
        {
          url: "/_next/static/EL9tYNeHqbxpkJb009Bde/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/0b7b90cd.b5852e5e503d071d.js",
          revision: "b5852e5e503d071d",
        },
        {
          url: "/_next/static/chunks/1135-caa95ca77c8fd26a.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/1328-1d15a6715aaeb795.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/134-9493432f60c81306.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/148-831eae5cd6bf1c46.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/1525-dd7b7589f3da28ab.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/1607-8327018c054cba06.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/1664-b8b44184c8453caa.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/2581-9330e301ad0578e3.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/2695.85890ef6d1e7e04d.js",
          revision: "85890ef6d1e7e04d",
        },
        {
          url: "/_next/static/chunks/3057-80e6a5899348eee0.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/3715-252ab77744594287.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/3757-8dbeb26ee024901e.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/3892-0c762955747252a4.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/4342-2c3f0a9af8d5dbda.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/4551-4b90c2051d6ff987.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/4596.5c8359300297affe.js",
          revision: "5c8359300297affe",
        },
        {
          url: "/_next/static/chunks/5164-3693204d71fd92e3.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/5182-039555cf454f6afc.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/5324-346d694c2e98ed68.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/5675-0dd9af052764939d.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/5959-c1b13764ca852d98.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/6316-10afb016130c2833.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/6513-bcbcb8e0b865cfd5.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/656-9c33110886fd9721.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/6815-a5de5c406d2459ac.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/7264-01523f31cbf0a36b.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/7378-d5c2d4707ff96c4a.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/7380-038ea95f5c60e4ca.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/741-5c4e4612ba1ca7da.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/7456-50d84b0d9cc2f307.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/7642-338651ab46c58442.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/7699-60c57164b294a6ed.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/7895-7f79e4f12a2d8102.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/8059-a383a207905f2b3f.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/81-b0d939a72d3884fc.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/8114-099395c605d56c34.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/8172-ef314199c0efd401.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/8538-731d4f3e9cab5e8b.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/8599-0695b1fa49fce87d.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/9194-a395929b065035eb.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/920-06e6ddbc6fda1da5.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/9425-38484ab47ca2dc2a.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/9476-b2253abc478c0122.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/9644-b004707d1999efea.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/9695-652cc98166950624.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/9728-3ab4a48daa2dcd3c.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/9731-f7b39ee4c1caa10f.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/9750-b2bdf4dcd90fa543.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/9936-99fe083dda753bae.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/fd9d1056-d2fc5e3717adf4eb.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/framework-81e04675b2f7c5bf.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/main-8357ff53e4b9d7f6.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/main-app-663d1c96165305b3.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Login-0994dc7825cbfbc2.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Register-1cb46aba4c522626.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Cart-848bd4f3816c84b2.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders-a67304afef4dd8ef.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders/viewOrderDetails/%5BorderId%5D-a23f7833e39c93d6.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Messages-9c47e9296f80ae6d.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Messages/%5BorderId%5D-b2edda1db00ad1d9.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile-a4e441b1e4eeca40.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile/become-shopper-1dd1b53a1b45f6d9.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Earnings-f9c831ddd12a8f28.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Settings-511ae465ac8bbc55.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/ShopperProfile-820d66cf1bec4d45.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches-2c83ccc62e018574.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches/batch/%5Bid%5D-c05b583dc0ef7ec8.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat-02878acbd1ff0a70.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat/%5BorderId%5D-8bc37ccf47e80493.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices-9ec26e85395c48ac.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices/%5Bid%5D-522888b6754f8055.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/orders/%5Bid%5D-26ed8224cb800bd2.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Recipes-3881807e8edea6e4.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Recipes/%5Bid%5D-807f385fc26d418c.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/Reels-ce8e0e6c3cdde21b.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/_app-24fac004a8677146.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/_error-8008506205ce3edf.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/dev/logs-e83c6f5393d0546b.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/index-d2e19efcfab9db87.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness-bcb6316a618716f6.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/BusinessChats-b59887b38718bea2.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/quote-details-modal-457141918d732055.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/store/%5BstoreId%5D-07d3c32885bf891c.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/restaurant/%5Bid%5D-706d34a0a709c90e.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/shopper/batch/%5BorderId%5D/details-7b2cd2e657c8dc3e.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/shops-559c17b77dbb2f16.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/shops/%5Bid%5D-72524ad70d9e7f85.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D-9eb5654f84cba857.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D/checkout-feb718830e2cbb34.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/test-connection-42b27e68963cb423.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/test-deepseek-5382a948f6c0beaf.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/test-redirect-207b7539088b175a.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/pages/test/websocket-2e44d4043528ee4f.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-e6394212aede9fce.js",
          revision: "EL9tYNeHqbxpkJb009Bde",
        },
        {
          url: "/_next/static/css/30dc199af7a9b769.css",
          revision: "30dc199af7a9b769",
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
