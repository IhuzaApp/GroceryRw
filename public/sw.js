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
  self.define = (i, c) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[n]) return;
    let o = {};
    const t = (e) => a(e, n),
      r = { module: { uri: n }, exports: o, require: t };
    s[n] = Promise.all(i.map((e) => r[e] || t(e))).then((e) => (c(...e), o));
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
          url: "/_next/static/chunks/101-803d93e4736aeac9.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/1135-ad13cadf8a2f76ef.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/1525-bcd52eea513b8b23.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/1595-8dd7c99ca215355b.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/1607-8327018c054cba06.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/1664-0b52d50e5e92b856.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/2002-fb4e6204c87177fe.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/2027-61cf6a4cadbed674.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/2100-9772f85c9119b970.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/219-581ded41979c23cf.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/2250-233b22ac528a8229.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/2581-a3637d2cb50bc1c2.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/2695.85890ef6d1e7e04d.js",
          revision: "85890ef6d1e7e04d",
        },
        {
          url: "/_next/static/chunks/2754-349c351dbc7d3ce1.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/3050-ea217bd7c68e4ac3.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/3123-b7b86cdc5e381741.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/3170-a68f856ec7d8f5fb.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/3745-a764ca6b1c92f3e8.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/3807-bddb92de436acfa2.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/3892-0fdbd1a4a7893fbc.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/4082-3f8ab1a1f7d3f12b.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/4346-1eb7cae661122b36.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/4551-4b90c2051d6ff987.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/4576-958141d2f0a2d4d5.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/4596.ec2a814535187a30.js",
          revision: "ec2a814535187a30",
        },
        {
          url: "/_next/static/chunks/4666-5ca0510aeafe34a0.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/4718-7537bea1f3e28e95.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/5182-6290c871a8e544ec.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/5424-f42b45a962852dd8.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/5628-fcad494b820baf44.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/5675-dca624ccf4bebb90.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/5966-d527a8c54823451e.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/600-a9bbf9aff3b81211.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/6151-41a196b5ad00623c.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/6641-12cd02649e27698c.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/674a26a7-70e83d0604cf15bb.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/6789-2aa4c86c7c89a2f9.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/6874-55b6bd1ee92cd181.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/6995-ada769b1ee8b4107.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/7257-bbae1f7a17369ddf.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/7378-b045f990c46186e4.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/7771.574a6335d7dc6d60.js",
          revision: "574a6335d7dc6d60",
        },
        {
          url: "/_next/static/chunks/8059-3bac23254fec3e76.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/8117-630d53f4259cef37.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/8172-df40fdbfb73635fb.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/9194-83b950a293b8a466.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/9290-5443de781be36831.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/9410-7c702633d7a79b32.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/9481-47b5444fffab3b06.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/9509-0977a0b1c0843fff.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/9771-7e3ded4a6ae1b6a9.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/fd9d1056-d2fc5e3717adf4eb.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/framework-ee634fceade4acd0.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/main-6c2f17db14d3d2cc.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/main-app-7d1fb5de9f54ff1e.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Login-39bf172c2c5d8647.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Register-fbc50c61dfcb85b7.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Cart-aef9ce16d174e034.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders-a251c23dd35abf07.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders/viewOrderDetails/%5BorderId%5D-68f5eb614ccd1d40.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Messages-c608ef0e7fe75b4b.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Messages/%5BorderId%5D-11736af2dcd2afe7.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile-e73246b5020c68b7.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile/become-shopper-17b6c541a2d2e857.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Earnings-4a27da25160608cd.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Settings-ad6640b4c03149bb.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/ShopperProfile-9208bfe154ff16a1.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches-21ac3d6ba6c7ac2a.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches/batch/%5Bid%5D-881ee74a8d5a7442.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat-eb23fd256b59aa19.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat/%5BorderId%5D-54da58f2d1c57627.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices-efa7df38bd7c91ab.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices/%5Bid%5D-560e347f58a3be7c.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/orders/%5Bid%5D-f99e11019853aebe.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Recipes-8a7474c0c9c813ba.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Recipes/%5Bid%5D-c0a6b1963d88f801.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/Reels-aef316fb9d99c63b.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/_app-88c17f8d3afd1b97.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/_error-8008506205ce3edf.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/about-038f84ec5a7d40b0.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/careers-e95cdb184c30cd44.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/combined-checkout-e34187bf50ec3c3e.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/contact-f86a153b0b320cd5.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/contracts/%5Bid%5D-d4e94a4438ae0e91.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/dev/logs-f546844c32386ba6.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/index-339bd96854f9d80d.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/life-at-plas-3fcb5428d4b9ca37.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/locations-a35a395c8c8855b6.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/ourTeams-df5eb5afd318ba0f.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness-a05e4960e5c01342.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/BusinessChats-72e962fded374d58.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/quote-details-modal-ab525450ffe2fb5a.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/store/%5BstoreId%5D-c92c528ecad96e92.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/pos-33d6749b3bc48e34.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/pos/register-fa0baa93d439e351.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/restaurant/%5Bid%5D-d233f6bb1276785c.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/shopper/batch/%5BorderId%5D/details-ee488ca9b0cf237f.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/shops-f993256e78c15a1a.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/shops/%5Bid%5D-694ce98140759faf.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D-59d68750085bd2ae.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D/checkout-86ad0ad499181992.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D/payment-pending-b7f3d034fa02dfaa.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-1d33f8148b310ba9.js",
          revision: "h7Qp263bDW9XPJoVJCwTo",
        },
        {
          url: "/_next/static/css/0be492d77ab08b9c.css",
          revision: "0be492d77ab08b9c",
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
          url: "/_next/static/h7Qp263bDW9XPJoVJCwTo/_buildManifest.js",
          revision: "054176308b69082a6e14436daebd4feb",
        },
        {
          url: "/_next/static/h7Qp263bDW9XPJoVJCwTo/_ssgManifest.js",
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
