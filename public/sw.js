if (!self.define) {
  let s,
    e = {};
  const n = (n, a) => (
    (n = new URL(n + ".js", a).href),
    e[n] ||
      new Promise((e) => {
        if ("document" in self) {
          const s = document.createElement("script");
          (s.src = n), (s.onload = e), document.head.appendChild(s);
        } else (s = n), importScripts(n), e();
      }).then(() => {
        let s = e[n];
        if (!s) throw new Error(`Module ${n} didn’t register its module`);
        return s;
      })
  );
  self.define = (a, i) => {
    const c =
      s ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (e[c]) return;
    let t = {};
    const r = (s) => n(s, c),
      l = { module: { uri: c }, exports: t, require: r };
    e[c] = Promise.all(a.map((s) => l[s] || r(s))).then((s) => (i(...s), t));
  };
}
define(["./workbox-1bb06f5e"], function (s) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "434af078512000203212119bf342c673",
        },
        {
          url: "/_next/static/aF0q9yn9nlpQzJgHlsnKP/_buildManifest.js",
          revision: "1caa6052371dd2c9bfb628c14642816a",
        },
        {
          url: "/_next/static/aF0q9yn9nlpQzJgHlsnKP/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/0b7b90cd.b5852e5e503d071d.js",
          revision: "b5852e5e503d071d",
        },
        {
          url: "/_next/static/chunks/1135-2a4dff101eb82fc2.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/1509-73572c59a3b20d14.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/1525-9cee807715309dd8.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/1595-81b1d87b877a21c3.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/1664-0b52d50e5e92b856.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/1880-72403e2eabe1c32e.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/1881-3988708e6ac915bb.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/2100-25eb844c39263197.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/219-28928ad7e76979bc.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/2250-e0decd37630d9b10.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/2354-afbf7f73327638ea.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/2401-53b98e887071af6d.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/2424.28bd45c463cdb936.js",
          revision: "28bd45c463cdb936",
        },
        {
          url: "/_next/static/chunks/2553-b36d2b4cdf4d6bff.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/2695.85890ef6d1e7e04d.js",
          revision: "85890ef6d1e7e04d",
        },
        {
          url: "/_next/static/chunks/2754-7377c9764ee91221.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/3050-ea217bd7c68e4ac3.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/3136-2e9c5a7e6ab52738.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/3510-eb705ac39beba030.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/3745-fd8d61fd537d6602.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/3807-2d8429a39d148d0a.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/3875-a750c77bc4058cc5.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/3892-25f262600c86391c.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/4033.ac1ecd4ce7853976.js",
          revision: "ac1ecd4ce7853976",
        },
        {
          url: "/_next/static/chunks/4082-88f8f233fb823436.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/4194-5e67cccb95113f2e.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/4266.adc7605ee3d4fd0c.js",
          revision: "adc7605ee3d4fd0c",
        },
        {
          url: "/_next/static/chunks/4270-ac2d64de5d440059.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/4666-d3444593a5085927.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/5164-dfd6a13d5db73390.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/5182-1dcfd165ae5619e3.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/5424-5cd82892e94c1bcc.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/5628-fcad494b820baf44.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/5640-fe509baf993f0b9f.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/5675-dca624ccf4bebb90.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/5793-711b8cf73cf0d999.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/6284-ea95fb403446b2ae.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/635-c6ef367614df2012.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/6461-0e4b772d987fe4cf.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/674a26a7-70e83d0604cf15bb.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/6874-55b6bd1ee92cd181.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/707-a7f835a09d9b606c.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/7257-ae0d6ceeda987976.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/72a30a16.3a55d8630eb8efbc.js",
          revision: "3a55d8630eb8efbc",
        },
        {
          url: "/_next/static/chunks/7378-9419fb272b99fdf4.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/7451-b9b2ed7f65747682.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/8117-df7138f41d53cd81.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/8172-1b29ee6625f3abc7.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/8491.930a360f8c0cd5fe.js",
          revision: "930a360f8c0cd5fe",
        },
        {
          url: "/_next/static/chunks/8605-b9ccea45c8d65bc3.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/8945-e1dacb8a2ecfb78b.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/8972-ff4813c0eafd46b8.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/9194-83b950a293b8a466.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/9290-780450bae40fd86b.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/9656-551aa989458ccd2f.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/9771-1539e180e28b5bef.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/9829-217e5226136fb8f6.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/9928-ce10eae85f17fa04.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/ad7f724d.faaaae9526063da4.js",
          revision: "faaaae9526063da4",
        },
        {
          url: "/_next/static/chunks/e78312c5-2f48df182ac23060.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/fd9d1056-d2fc5e3717adf4eb.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/framework-ee634fceade4acd0.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/main-6c2f17db14d3d2cc.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/main-app-7d1fb5de9f54ff1e.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Login-39bf172c2c5d8647.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Register-5b6b9e5e4491aace.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Cart-c42f57673a72ff2e.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders-197c8c2c9c898250.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders/viewOrderDetails/%5BorderId%5D-3f5f8ee702f6b431.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Messages-aa047907797a78d8.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Messages/%5BorderId%5D-0e9a1714c0b0a2c7.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile-d8ea1cf3f12c8ad0.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile/become-shopper-902de1f14b3049c0.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Earnings-f88c50b49ccc495e.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Settings-329b373bf165f6d8.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/ShopperProfile-e9e55e28734c07ac.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches-c5a7019ab4c8a126.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches/batch/%5Bid%5D-6c3c461f165a7079.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat-e1f3e29680914ca9.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat/%5BorderId%5D-850719b5b8838f25.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices-c379a3073d84107a.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices/%5Bid%5D-34f2a7db35393308.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/orders/%5Bid%5D-91b37202433b0719.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Recipes-882e42e768b57892.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Recipes/%5Bid%5D-1e64834ec821c395.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/Reels-2829d39797ef37a7.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/_app-b6518b886eebb914.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/_error-8008506205ce3edf.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/about-3043d62f3a344a24.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/combined-checkout-c71bbbf65b3ed032.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/contact-b9492968e60ca6f7.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/contracts/%5Bid%5D-e108ada12dc24890.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/dev/logs-4beb67dc0aad49b8.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/index-0da5e5d84d814aec.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/life-at-plas-aadbc96d338df847.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness-fa00418de173f970.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/BusinessChats-a67ec70801bca553.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/quote-details-modal-457141918d732055.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/store/%5BstoreId%5D-d22494eeb3bcfc37.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/restaurant/%5Bid%5D-588aaa3b80a9ecee.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/shopper/batch/%5BorderId%5D/details-6f6501b617a2dfe1.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/shops-1cb6a4ecbc1cdd8d.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/shops/%5Bid%5D-12d0f8e6e0df2cba.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D-9fc06f9541dc54c8.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D/checkout-306204b6b567cc03.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D/payment-pending-30556d9d85d76cf9.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-c39f757a6ea95765.js",
          revision: "aF0q9yn9nlpQzJgHlsnKP",
        },
        {
          url: "/_next/static/css/11fe1b189100802c.css",
          revision: "11fe1b189100802c",
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
          url: "/assets/images/Liquor.jpg",
          revision: "cb122992f5630940823e056d4090388a",
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
          url: "/assets/images/beauty.avif",
          revision: "99e1d11e10f659fee559e3c21a1a41a0",
        },
        {
          url: "/assets/images/becomePatern.jpg",
          revision: "e8a29d45091f6c94054ea3c88360c99c",
        },
        {
          url: "/assets/images/carreer.jpg",
          revision: "3762205f2c860eaa7c3d27e489e30ec7",
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
          url: "/images/mainPageIcons/brand.png",
          revision: "38b4fdd5aace290881c0ee7d873f9805",
        },
        {
          url: "/images/mainPageIcons/burger.png",
          revision: "1350558ce7e911f4e2f64f0c3c4e4860",
        },
        {
          url: "/images/mainPageIcons/delivery-man.png",
          revision: "c918d7153661797b6bfb3cacbc787244",
        },
        {
          url: "/images/mainPageIcons/fast-shipping.png",
          revision: "156ea63cfa898bfda2c74d7d4d991518",
        },
        {
          url: "/images/mainPageIcons/first-aid-kit.png",
          revision: "4d01bb2e5807b55ae517972feb7e3ca7",
        },
        {
          url: "/images/mainPageIcons/groceries.png",
          revision: "22fb56c0dc3497d7fa80dd0122d6f94e",
        },
        {
          url: "/images/mainPageIcons/payment-terminal.png",
          revision: "6b4121580613d50d61e7f22730132b22",
        },
        {
          url: "/images/mainPageIcons/pet-shop.png",
          revision: "3af69b56356a6fc0f805bcdf8879567e",
        },
        {
          url: "/images/mainPageIcons/restaurant.png",
          revision: "90ec8327eb7c43d355268284df1a88b7",
        },
        {
          url: "/images/mainPageIcons/tomato.png",
          revision: "db574ede31f8cd438ccb7f80ccb6f172",
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
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      "/",
      new s.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: s,
              response: e,
              event: n,
              state: a,
            }) =>
              e && "opaqueredirect" === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: "OK",
                    headers: e.headers,
                  })
                : e,
          },
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new s.CacheFirst({
        cacheName: "google-fonts",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /^https:\/\/fonts\.gstatic\.com\/.*/i,
      new s.CacheFirst({
        cacheName: "google-fonts-static",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new s.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new s.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new s.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new s.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new s.RangeRequestsPlugin(),
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /\.(?:mp4)$/i,
      new s.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new s.RangeRequestsPlugin(),
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /\.(?:js)$/i,
      new s.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /\.(?:css|less)$/i,
      new s.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /^https:\/\/.*\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new s.StaleWhileRevalidate({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new s.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new s.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new s.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    s.registerRoute(
      /^https:\/\/.*\.(?:js|css|mjs)$/i,
      new s.StaleWhileRevalidate({
        cacheName: "external-js-css-assets",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    );
});
