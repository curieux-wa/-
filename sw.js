/* FCM في نفس الـ SW الرئيسي */
importScripts("https://www.gstatic.com/firebasejs/13.3.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.3.0/firebase-messaging-compat.js");
const TC_DEFAULT_URL="https://t.me/TansiqElna9Lldzl";
try{
  firebase.initializeApp({
    apiKey:"AIzaSyA7XoSoggcC-VJ91f3jTmTKBGv4rGS54LE",
    authDomain:"transport-coordination.firebaseapp.com",
    projectId:"transport-coordination",
    storageBucket:"transport-coordination.firebasestorage.app",
    messagingSenderId:"348267439556",
    appId:"1:348267439556:web:19b55bdf6b7228e719f091"
  });
  const __msg=firebase.messaging();
  __msg.onBackgroundMessage(function(payload){
    const data=(payload&&payload.data)||{};
    const note=(payload&&payload.notification)||{};
    const title=note.title||data.title||"قانون تنسيق النقل والمرور";
    const body=note.body||data.body||data.msg||"لديك إشعار جديد";
    const url=data.url||data.link||data.click_action||(note&&note.click_action)||TC_DEFAULT_URL;
    const notifData=Object.assign({},data,{url:url});
    return self.registration.showNotification(title,{
      body:body,icon:"/icons/icon-192.png",badge:"/icons/icon-192.png",
      data:notifData,tag:data.tag||"tc-fcm",renotify:true,dir:"rtl",lang:"ar"
    });
  });
}catch(e){console.error("fcm-sw",e)}

self.addEventListener("notificationclick",function(event){
  event.notification.close();
  const data=(event.notification&&event.notification.data)||{};
  const url=data.url||data.link||data.click_action||TC_DEFAULT_URL;
  event.waitUntil(
    clients.matchAll({type:"window",includeUncontrolled:true}).then(function(list){
      for(let i=0;i<list.length;i++){
        const c=list[i];
        if(c.url&&c.url.indexOf(url)!==-1&&"focus" in c)return c.focus();
      }
      if(clients.openWindow)return clients.openWindow(url);
    })
  );
});

/* إصدار جديد: tc-app-v38 — شبكة أولاً + تحديث فوري عند التنبيه */
const C="tc-app-v41";
const FILES=["./","./index.html","./extra.css","./extra.js","./traffic-data.js","./reset.html","./splash.jpg","./manifest.json","./i18n/ar.js","./i18n/en.js","./i18n/dyn.js","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png","./icons/maskable-512.png","./icons/logo-128.png","./img/home-signs.jpg","./img/home-transport.jpg","./img/home-traffic.jpg","./img/emblem.png","./img/cat-1.webp","./img/cat-2.webp","./img/cat-3.webp","./img/cat-4.webp","./img/cat-5.webp"];
self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"}))))
    .then(()=>self.skipWaiting())
  );
});
self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))
    .then(()=>self.clients.claim())
  );
});
self.addEventListener("message",e=>{
  const t=e.data&&e.data.type;
  if(t==="SKIP_WAITING"){self.skipWaiting();return}
  if(t==="FORCE_UPDATE"){
    e.waitUntil(
      caches.keys().then(k=>Promise.all(k.map(x=>caches.delete(x))))
      .then(()=>self.skipWaiting())
    );
  }
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  // لا تعترض طلبات Firebase/CDN الخارجية — اتركها للمتصفح
  if(u.origin!==location.origin)return;

  const path=u.pathname;
  // ملفات حساسة: شبكة أولاً دائماً
  const critical=
    path.endsWith("/") ||
    path==="" ||
    /(?:^|\/)(index\.html|sw\.js|manifest\.json)$/.test(path) ||
    /\/i18n\/[^/]+\.js$/.test(path) ||
    path.includes("sw.js") || path.includes("reset.html");

  if(critical){
    // شبكة أولاً، لكن إن تأخرت أكثر من 0.8 ثانية نعرض النسخة المحفوظة فوراً (لتظهر شاشة الافتتاح مباشرة)
    const net=fetch(new Request(e.request,{cache:"reload"})).then(r=>{
      if(r&&r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c)).catch(()=>{})}
      return r;
    });
    const fb=()=>caches.match(e.request,{ignoreSearch:true});
    const slow=new Promise(res=>setTimeout(()=>fb().then(m=>res(m||net)),800));
    e.respondWith(Promise.race([net.catch(fb),slow]).then(r=>r||net));
    e.waitUntil(net.catch(()=>{}));
    return;
  }

  e.respondWith(
    caches.match(e.request,{ignoreSearch:true}).then(m=>m||fetch(e.request,{cache:"reload"}).then(r=>{
      if(r&&(r.ok||r.type==="opaque")){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c)).catch(()=>{})}
      return r;
    }))
  );
});

// splash image updated
