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
      o = { module: { uri: c }, exports: t, require: r };
    e[c] = Promise.all(a.map((s) => o[s] || r(s))).then((s) => (i(...s), t));
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
          url: "/_next/static/chunks/08548717.0596547ed527a869.js",
          revision: "0596547ed527a869",
        },
        {
          url: "/_next/static/chunks/0b7b90cd.b5852e5e503d071d.js",
          revision: "b5852e5e503d071d",
        },
        {
          url: "/_next/static/chunks/101-9b7178c0c5726fa3.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/1067-07d541ebd9b3c9c3.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/1076-1577129bf4639963.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/1187-4cd0269a35a49a98.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/1296-9ae33b8c61f49848.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/1347-e3698758fe458b7a.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/1469-f686a4b5b956c075.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/1479-400a81dac6c889f0.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/1664-954eda6dd46b2419.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/1831-7d1a5b16da5e47cc.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/2120-7fcc032bab0ce0df.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/2150-5d256e151ef829fe.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/2169-9b40b01af6350d1b.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/2424.28bd45c463cdb936.js",
          revision: "28bd45c463cdb936",
        },
        {
          url: "/_next/static/chunks/2505-1d6e0fc66b0d6bcd.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/2683-35d9de4f563f99cf.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/2946-7e5b9924db040cd1.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/3007-964766b3a062186a.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/3050-05c775cdb75e4cfc.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/3080-c74324ed3797a7fd.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/3082-b527b62c1bbd14b6.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/3136-5f2c33f062151adf.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/3468-2856c54825537147.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/3534-d5a5806ad1a96feb.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/3745-e7e6a437e9240be9.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/3892-efeb50cbc2108b3a.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/4033.ac1ecd4ce7853976.js",
          revision: "ac1ecd4ce7853976",
        },
        {
          url: "/_next/static/chunks/4129-f7fb45819b3745cb.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/4177-3a5ce37043a3363c.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/4576-263d8c7bffc0ea16.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/4596.9944e222e5c4fca2.js",
          revision: "9944e222e5c4fca2",
        },
        {
          url: "/_next/static/chunks/4766-6227613a538dfa34.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/490-a0a630a1c979d1bf.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/5005-013fb4dc9a8a8c05.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/5106-567f9d3b5e1cf93b.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/5164-234fd21a6e80398f.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/5229.57141ce36c68713a.js",
          revision: "57141ce36c68713a",
        },
        {
          url: "/_next/static/chunks/5574-ec5550679090c4ea.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/5608-f8e63d622cc8c6b1.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/5640-fe509baf993f0b9f.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/5723-0978c6ceac485004.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/59-8b54a48ed3cf3f2c.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/6251-97ec37dd5ad2f247.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/635-44edea362b77014c.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/6710.f6b9ec23d6cc5c23.js",
          revision: "f6b9ec23d6cc5c23",
        },
        {
          url: "/_next/static/chunks/6722-29c561406c860464.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/674a26a7-70e83d0604cf15bb.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/6771-62662c9a34399027.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/6780-9c4526b52b1f1c28.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/6844-33d1203bbbb44168.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/6874-0adaf2aeeddf6f53.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/7257-1aef813e518a455d.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/7262-8e79877bf9205491.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/72a30a16.3a55d8630eb8efbc.js",
          revision: "3a55d8630eb8efbc",
        },
        {
          url: "/_next/static/chunks/7394-59e8d4251f8596c3.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/7412-a47484406bb5e4c8.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/7606-ebba070dda5ea390.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/7771.574a6335d7dc6d60.js",
          revision: "574a6335d7dc6d60",
        },
        {
          url: "/_next/static/chunks/7875-d4f40dd921eb51e7.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/7900-efd3d30823b31de8.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/8172-37f29ffa906c00ee.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/8728-e191b864247ed73d.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/925-f7fb0a7f06f49ac6.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/9279-cc50d2ef95a32ab2.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/9481-0ecdfb43c8a6bde4.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/953-7c55a3e03ab5c39d.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/9629-6436b213a5ee3eda.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/9815-183957b0d7a8d58c.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/9928-beb4c473b4c5ecdf.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/ab5c09eb.120528c7507f694a.js",
          revision: "120528c7507f694a",
        },
        {
          url: "/_next/static/chunks/ad7f724d.b7be9ddcc22d5969.js",
          revision: "b7be9ddcc22d5969",
        },
        {
          url: "/_next/static/chunks/e78312c5-232057edaf434e1f.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/fd9d1056-d2fc5e3717adf4eb.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/framework-cd4c884432166505.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/main-app-663d1c96165305b3.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/main-bfdf37dbfb7faf6f.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Auth/CompleteProfile-1c4902b8c939bb09.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Auth/ForgotPassword-3a7b163948b30564.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Login-62c89b7540725471.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Auth/Register-28c652e34b23aa58.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Auth/ResetPassword-d15c90db1c9548d6.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Cars-b14774218e4a115a.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Cars/%5Bid%5D-6c0448951b663825.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Cars/become-partner-937e251f4c3eefbb.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Cars/dashboard-9f3f8253e4f87dac.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Cart-339fc71259f40142.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders-26758e4e1511797f.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders/viewOrderDetails/%5BorderId%5D-639a041b0df46150.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/CurrentPendingOrders/viewPackageDetails/%5BpackageId%5D-498f797d88c1fd34.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Messages-87154fede5c1fb62.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Messages/%5BorderId%5D-c5cb6263d1686db7.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/MobilePOS/AddStock-8de522d725e1b489.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/MobilePOS/Checkout-c440c79783467383.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/MobilePOS/Connect-3ad0703b15c303c0.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/MobilePOS/Dashboard-e2500d09dad73bf6.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile-410d70f808e029af.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Myprofile/become-shopper-044445ade247fd5c.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Pets-4d3a147b465c3343.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Pets/%5Bid%5D-9a6bab79ec3bc957.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Pets/become-partner-9be927bd565c0f6e.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Pets/dashboard-4d8eba3889680f40.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Earnings-702d71849343ac4f.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/Settings-b993db4a1c7518f2.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/ShopperProfile-6ac226c7927b2f00.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches-faad234b6dfaa44c.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/active-batches/batch/%5Bid%5D-680547b3beb53a9b.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat-75d3f88d552aecb5.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/chat/%5BorderId%5D-a693c64f03b012bf.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices-9d6bda0f64bdab82.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/invoices/%5Bid%5D-f59330ad25bc2b3d.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Plasa/orders/%5Bid%5D-3247998c241d5a00.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Recipes-828b548b99e614e7.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Recipes/%5Bid%5D-8891115640e2e103.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/Reels-221da14b8d49e9e4.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/SelfCheckout-ec2138b33fab6517.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/_app-a3e0301c5e114eea.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/_error-8008506205ce3edf.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/about-b754378a05562bad.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/careers-c7901ceda1861a9d.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/combined-checkout-5adaccd24fd79675.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/contact-d59cc0604fd3668c.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/contracts/%5Bid%5D-508b5d17f604d054.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/dev/logs-f99c5f6e99a919b2.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/index-8023f8b2cc73d4d8.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/life-at-plas-7a0789ab5dacd5bb.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/locations-fa0096845683faac.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/ourTeams-0454367197449daf.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness-80ba0f23dd0c888d.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/BusinessChats-6475d9f25091bebf.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/portal-f6582a17a0f2f48d.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/quote-details-modal-5c2d03b3ced42e4e.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/plasBusiness/store/%5BstoreId%5D-8ce7cade7f59ac7d.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/pos-a16d87c86aebe355.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/pos/register-150485681cf8c2ca.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/restaurant/%5Bid%5D-f1f0505beae13c3e.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/shopper/batch/%5BorderId%5D/details-bc76673074a65839.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/shops-663e1dc735157af4.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/shops/%5Bid%5D-4a8097c9c6af092d.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D-d373afd341d16db8.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D/checkout-8842f88d4029f565.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bid%5D/payment-pending-348bc5795fba625c.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-7c3b5c683ae29952.js",
          revision: "wPssJKDA84hPgYv21BnRo",
        },
        {
          url: "/_next/static/css/5742516f9157e1df.css",
          revision: "5742516f9157e1df",
        },
        {
          url: "/_next/static/css/ea2108b91b7ec9a1.css",
          revision: "ea2108b91b7ec9a1",
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
        {
          url: "/_next/static/wPssJKDA84hPgYv21BnRo/_buildManifest.js",
          revision: "9c120d09696e9152091ce68b9914bfdf",
        },
        {
          url: "/_next/static/wPssJKDA84hPgYv21BnRo/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
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
          url: "/assets/images/auth/login_bg.png",
          revision: "316476de5c17e7912abe143b04f4368c",
        },
        {
          url: "/assets/images/auth/register_bg.png",
          revision: "7ccaf04a97622467822573600f43eb46",
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
          url: "/assets/logos/PlasLogoPNG.png",
          revision: "e6ab7ed70fb1b6d0a380071636c389ee",
        },
        {
          url: "/assets/logos/airtel.svg",
          revision: "9c548b38499237b62ed1c9e98ba8940b",
        },
        {
          url: "/assets/logos/mastercard.svg",
          revision: "36c3808b4e62d7e4c34e50d22583ac44",
        },
        {
          url: "/assets/logos/mtn.svg",
          revision: "b77bfba73294606946a88fe88bb63a5e",
        },
        {
          url: "/assets/logos/plasIcon.png",
          revision: "d2eed5d6a29d67254e0ce0180bec0415",
        },
        {
          url: "/assets/logos/visa.svg",
          revision: "c86d9b5d57c94775409dab911fa1dc82",
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
          url: "/images/cars/hero.png",
          revision: "ddf7fda7824c079d5b66bd424ac1f35a",
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
          url: "/images/mainPageIcons/brand_3d.png",
          revision: "1ed01dd046baf61c49d39c1a68d0661a",
        },
        {
          url: "/images/mainPageIcons/burger.png",
          revision: "1350558ce7e911f4e2f64f0c3c4e4860",
        },
        {
          url: "/images/mainPageIcons/burger_3d.png",
          revision: "dee9ec220ab86b1d84412acdbe2c0b61",
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
          url: "/images/mainPageIcons/pharmacy_3d.png",
          revision: "dbeec5310e57e986573ed1948ce24613",
        },
        {
          url: "/images/mainPageIcons/restaurant.png",
          revision: "90ec8327eb7c43d355268284df1a88b7",
        },
        {
          url: "/images/mainPageIcons/scooter_3d.png",
          revision: "32407ed5d3153ead10eac29b33c5f0db",
        },
        {
          url: "/images/mainPageIcons/tomato.png",
          revision: "db574ede31f8cd438ccb7f80ccb6f172",
        },
        {
          url: "/images/mainPageIcons/tomato_3d.png",
          revision: "18c3492ed0284a814fde23d377665223",
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
          url: "/images/shopper/welcome_hero_v2.png",
          revision: "6d7ab125bd9b99540d26badcb88bbe0e",
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
