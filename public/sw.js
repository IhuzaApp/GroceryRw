if (!self.define) {
  let e,
    s = {};
  const a = (a, i) => (
    (a = new URL(a + ".js", i).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, t) => {
    const c =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[c]) return;
    let n = {};
    const r = (e) => a(e, c),
      u = { module: { uri: c }, exports: n, require: r };
    s[c] = Promise.all(i.map((e) => u[e] || r(e))).then((e) => (t(...e), n));
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
          url: "/_next/static/chunks/101-9b7178c0c5726fa3.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1076-5054dcca950c2ff1.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1296-41dd2715225b909c.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1347-ce23251a22ed77ea.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1444-b93d4ae4c0b25e23.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1479-400a81dac6c889f0.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1595-e0b406398e03b706.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1607-8327018c054cba06.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1664-5e540425035f4d49.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1831-210862b8e7459cb0.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/1901-073b035dc9fd773b.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/2169-76049373d4e3b9f5.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/219-d919041bc50562a7.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/2250-ef8ed52037e6ac44.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/2424.28bd45c463cdb936.js",
          revision: "28bd45c463cdb936",
        },
        {
          url: "/_next/static/chunks/2458-3ca740c24f748f75.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/2523-6d1a90d62988ca1a.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/2574-71cd8b2d5ab64c8d.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/2683-af53fcdc5beb1400.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/3050-ea217bd7c68e4ac3.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/3080-68fc024d4975fe34.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/3136-5f2c33f062151adf.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/3285-e443794c212beb31.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/3468-112dc7031b50fea7.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/3534-70937fdf17c212dc.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/3655-ba0c3d793a430652.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/3745-56adf42b4ef0b0ba.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/3892-b6efd36ae62ea85a.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/4033.ac1ecd4ce7853976.js",
          revision: "ac1ecd4ce7853976",
        },
        {
          url: "/_next/static/chunks/4105-66bbc4d20dba140a.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/4177-3a5ce37043a3363c.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/4576-958141d2f0a2d4d5.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/4596.f953299688602b8d.js",
          revision: "f953299688602b8d",
        },
        {
          url: "/_next/static/chunks/490-38abaea5eea0ff19.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/5005-3d0f365d6ef9aa74.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/504-c389042bb07ccd30.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/5164-bc819429f6e05061.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/5484-d7df83d179dfaef2.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/5640-fe509baf993f0b9f.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/5675-d191a02c0289aac3.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/5723-0978c6ceac485004.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/5784-c02737f046ad12de.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/5853-ee2d430ef01dc69a.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/59-885b508819facf88.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/6340-f2f53a60b737046f.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/635-c6ef367614df2012.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/6376-6dc317deb964b785.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/6722-ad7984a145708fe1.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/674a26a7-70e83d0604cf15bb.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/6780-9e86c288c73f874c.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/6874-dee7bbec05aff1bb.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/7055-d69d08c31de19a2c.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/7257-ae0d6ceeda987976.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/7262-f1b7b79e2fef1d31.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/72a30a16.3a55d8630eb8efbc.js",
          revision: "3a55d8630eb8efbc",
        },
        {
          url: "/_next/static/chunks/7394-4e1e146f865010b7.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/7606-d247f4e94f070215.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/7771.574a6335d7dc6d60.js",
          revision: "574a6335d7dc6d60",
        },
        {
          url: "/_next/static/chunks/8172-33244d8fea6c9e46.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/8272-a3dc611016085a8b.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/8286-a1670e8267d44490.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/8728-0e7912f11dc81988.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/8945-e1dacb8a2ecfb78b.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/9279-576b7d63bf52d561.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/9290-bcfdb4c43759ed0f.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/9481-47b5444fffab3b06.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/9815-06799f8f0916de2a.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/ad7f724d.faaaae9526063da4.js",
          revision: "faaaae9526063da4",
        },
        {
          url: "/_next/static/chunks/e78312c5-2f48df182ac23060.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/fd9d1056-d2fc5e3717adf4eb.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/framework-ee634fceade4acd0.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/main-app-663d1c96165305b3.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/main-db65306f82798ede.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Auth/CompleteProfile-fb25892fdbf8eb41.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Login-1e75f88c739ca9e1.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Register-8d5873732e98652d.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Cart-76c1cfca6c7fe7e4.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders-691bc38880e4c430.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders/viewOrderDetails/%5BorderId%5D-1984b2b9eca45c31.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders/viewPackageDetails/%5BpackageId%5D-71d707e89c1d4f79.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Messages-b0744deb009fa195.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Messages/%5BorderId%5D-76b63d8c8b02a246.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/MobilePOS/AddStock-709bad8eb9f2cc2a.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/MobilePOS/Checkout-8de02c9636366f7c.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/MobilePOS/Connect-05c31f1fa61303d9.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/MobilePOS/Dashboard-7263d16702743644.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile-470a64b5b6333c98.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile/become-shopper-ff2b4173b263bdf3.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Earnings-2b33bc3dd162e08a.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Settings-daccdeeeb9bf4987.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/ShopperProfile-7d8d6f937b595890.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches-14cfae74c645dcb3.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches/batch/%5Bid%5D-9fb674bb33bcea91.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat-9b9bf1ca56c2b524.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat/%5BorderId%5D-17f6cd3a2d79d906.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices-f46abdfce0476181.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices/%5Bid%5D-a1cc6d4a78910afd.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/orders/%5Bid%5D-33da5efd2626053d.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Recipes-6bb7fe19a5cf050c.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Recipes/%5Bid%5D-eb2ef28c830644b5.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/Reels-db223d33a0dda686.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/SelfCheckout-c045e7c8ce5f5cbf.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/_app-90f92e791802bad0.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/_error-8008506205ce3edf.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/about-038f84ec5a7d40b0.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/careers-e95cdb184c30cd44.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/combined-checkout-2e089a56c6d5143b.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/contact-609c4dcf24d0434d.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/contracts/%5Bid%5D-fe3c472c39c012f6.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/dev/logs-af2f63253dc92b2d.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/index-19e5e13300516255.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/life-at-plas-3fcb5428d4b9ca37.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/locations-f025e4d258ec9f8d.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/ourTeams-df5eb5afd318ba0f.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness-a05e4960e5c01342.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/BusinessChats-bc47d887226dd0ae.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/portal-f7681272bdb7747a.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/quote-details-modal-457141918d732055.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/store/%5BstoreId%5D-778c7ddf17e916fe.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/pos-db25b0e087ce7bb6.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/pos/register-d859fa0f1564c280.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/restaurant/%5Bid%5D-ac465e14ec11f2ce.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/shopper/batch/%5BorderId%5D/details-63f13f0a03819754.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/shops-e57400d9042c050a.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/shops/%5Bid%5D-b026ef84029e1e88.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D-176280b8dad346cd.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D/checkout-10ac14e8cf85f96b.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D/payment-pending-391ef648f18644ac.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-2f09d9730cd9e0d1.js",
          revision: "gvpHIbuxvH-xUQ0tV7l5W",
        },
        {
          url: "/_next/static/css/1c7c100c0ce88ddb.css",
          revision: "1c7c100c0ce88ddb",
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
          url: "/_next/static/gvpHIbuxvH-xUQ0tV7l5W/_buildManifest.js",
          revision: "c6cfd0e7c9f8245f2aba7d279fb67b7f",
        },
        {
          url: "/_next/static/gvpHIbuxvH-xUQ0tV7l5W/_ssgManifest.js",
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
        { url: "/africa.svg", revision: "fee85594fca5b2cb133141dde919b4c3" },
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
          url: "/assets/images/team/african-dev-1.png",
          revision: "57f4f56aa286325dfe90d0985ee5da8f",
        },
        {
          url: "/assets/images/team/african-dev-2.png",
          revision: "3169ecb85cfad5c313552d03e6ad3950",
        },
        {
          url: "/assets/images/team/ai-dev-1.png",
          revision: "5aa9ae2152c717a24277b2d72bd65e4b",
        },
        {
          url: "/assets/images/team/ai-dev-2.png",
          revision: "f8204648ecbe6deffb01e7b31521b47c",
        },
        {
          url: "/assets/images/team/amina-casual.png",
          revision: "a5956f5f0d455e0a9d7800a91f8a3c0a",
        },
        {
          url: "/assets/images/team/comm-officer.png",
          revision: "9bbd1abfa86c6586a5708078216cf20b",
        },
        {
          url: "/assets/images/team/director-2.png",
          revision: "6e7dcdb579117365414cc3ff08367ba0",
        },
        {
          url: "/assets/images/team/legal-pro.png",
          revision: "533341fdf3c433ea6f33ad7d2c36ec78",
        },
        {
          url: "/assets/images/team/senior-dev-new.png",
          revision: "f0b3c6e0ed0ff5892caed7ea0be9d741",
        },
        {
          url: "/assets/images/team/supply-chain-new.png",
          revision: "07b27e6c87bf67adb4a0f1258684b48b",
        },
        {
          url: "/assets/images/team/support-head.png",
          revision: "9e4738303fd444ef21503fe470ccf97f",
        },
        {
          url: "/assets/images/team/tax-pro.png",
          revision: "0b6ffd0553e3f4abe2028b6ce9b2b20f",
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
        {
          url: "/assets/sounds/reel-background.mp3",
          revision: "24728ae5f42ceaa50cdeb8a702b5f66f",
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
        { url: "/robots.txt", revision: "f5485a305c113be5f948869568531efe" },
        { url: "/sitemap.xml", revision: "72879d1f1b83f21eea255612147eaa9d" },
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
              event: a,
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
