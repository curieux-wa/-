/* v28: الرئيسية 3D + قانون المرور + موسوعة الإشارات */
(function(){
const T_SECS_AR=[["مخالفات من الدرجة الأولى (3000 دج)","المخالفات من الدرجة الأولى وعقوباتها."],["مخالفات من الدرجة الثانية (4000 دج)","المخالفات من الدرجة الثانية وعقوباتها."],["مخالفات من الدرجة الثالثة (7000 دج)","المخالفات من الدرجة الثالثة وعقوباتها."],["مخالفات من الدرجة الرابعة (10000 دج)","المخالفات من الدرجة الرابعة وعقوباتها."],["مخالفات الدرجة الخامسة","المخالفات من الدرجة الخامسة وعقوباتها."],["الجرائم المتعلقة بالسياقة","الجرائم المرتبطة بسلوك السائق أثناء السياقة."],["الجرائم المتعلقة بالمركبة","الجرائم المرتبطة بحالة المركبة وتجهيزاتها ووثائقها."],["جرائم مختلفة","جرائم أخرى متعلقة بقانون المرور."]];
const T_SECS=()=>[1,2,3,4,5,6,7,8].map(i=>[tr("tSec"+i),tr("tSec"+i+"b")]);
const T_HIDE=4;const T_COLS=()=>pref.lang==="en"?["No.","Designation","Nature of violation","Legal text","Penalty","Actions"]:["الرقم","التعيين","طبيعة المخالفة","منصوص عليها","معاقب عليها","الإجراءات"];
/* ===== ترجمة المحتوى عند اختيار الإنجليزية (كاش محلي + حماية من أخطاء الحصة) ===== */
const TX_K="tc_tx_cache_v3";
const txLoad=()=>{try{return JSON.parse(localStorage.getItem(TX_K)||"{}")||{}}catch(_){return{}}};
const txSave=c=>{try{localStorage.setItem(TX_K,JSON.stringify(c))}catch(_){}};
const txHash=s=>{s=String(s||"");let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h)+s.charCodeAt(i)|0;return "t"+Math.abs(h).toString(36)+"_"+s.length};
/** رفض ردود تحذير الحصة أو الروابط أو النصوص غير الصالحة */
const txIsBad=s=>{s=String(s||"");const u=s.toUpperCase();
 return !s||u.includes("MYMEMORY WARNING")||u.includes("USAGELIMITS")||u.includes("QUERY LENGTH LIMIT")||
  u.includes("PLEASE CONTACT")||u.includes("NEXT AVAILABLE")||u.includes("TO TRANSLATE MORE")||
  /https?:\/\//i.test(s)||s.length>800};
/** تنظيف الكاش من الترجمات التالفة (مرة عند التحميل) */
(function txPurge(){try{
  const c=txLoad();let n=0;
  Object.keys(c).forEach(k=>{const e=c[k];if(!e||txIsBad(e.text_en)||(e.last_translated_ar&&e.text_en===e.last_translated_ar)){delete c[k];n++}});
  if(n)txSave(c);
  /* مسح الإصدارات القديمة التالفة */
  try{localStorage.removeItem("tc_tx_cache_v1");localStorage.removeItem("tc_tx_cache_v2")}catch(_){}
}catch(_){}})();
/** عرض نص: en من الكاش الصالح فقط، وإلا الأصل العربي */
window.tx=function(ar){ar=String(ar==null?"":ar);if(!ar)return"";if(typeof pref==="undefined"||pref.lang!=="en")return ar;
 const c=txLoad(),k=txHash(ar),e=c[k];
 if(e&&e.text_en&&e.last_translated_ar===ar&&!txIsBad(e.text_en))return e.text_en;
 return ar};
/** ترجمة نص واحد — لا تُخزَّن رسائل التحذير */
window.txFetch=async function(ar){ar=String(ar==null?"":ar).trim();if(!ar)return"";if(typeof pref==="undefined"||pref.lang!=="en")return ar;
 const c=txLoad(),k=txHash(ar),e=c[k];
 if(e&&e.text_en&&e.last_translated_ar===ar&&!txIsBad(e.text_en))return e.text_en;
 /* إيقاف مؤقت عند استنفاد الحصة */
 if(window._txQuotaUntil&&Date.now()<window._txQuotaUntil)return ar;
 try{
  const url="https://api.mymemory.translated.net/get?q="+encodeURIComponent(ar.slice(0,450))+"&langpair=ar|en";
  const r=await fetch(url);const j=await r.json();
  const en=((j&&j.responseData&&j.responseData.translatedText)||"").trim();
  if(txIsBad(en)){
   window._txQuotaUntil=Date.now()+30*60*1000; /* توقف 30 دقيقة */
   if(c[k]){delete c[k];txSave(c)}
   return ar}
  if(en&&en.toLowerCase()!==ar.toLowerCase()){
   c[k]={text_ar:ar,text_en:en,last_translated_ar:ar,translation_updated_at:Date.now()};
   txSave(c);return en}
 }catch(err){console.warn("tx",err)}
 return ar};
/** ترجمة دفعة محدودة للعناصر المطلوبة فقط */
window.txEnsure=async function(list){if(typeof pref==="undefined"||pref.lang!=="en")return;
 if(window._txQuotaUntil&&Date.now()<window._txQuotaUntil)return;
 const need=[];const seen=new Set();
 (list||[]).forEach(s=>{s=String(s||"").trim();if(!s||s.length>450||seen.has(s))return;seen.add(s);
  const c=txLoad(),e=c[txHash(s)];if(!(e&&e.text_en&&e.last_translated_ar===s&&!txIsBad(e.text_en)))need.push(s)});
 const batch=need.slice(0,12); /* عناصر مرئية فقط — حد منخفض */
 for(let i=0;i<batch.length;i++){
  if(window._txQuotaUntil&&Date.now()<window._txQuotaUntil)break;
  await window.txFetch(batch[i]);
  await new Promise(r=>setTimeout(r,250));
 }
};
window.txCollectPage=function(){const out=[];
 try{document.querySelectorAll("#app .vt,#app .tvt,#app .fl p,#app .sgi b").forEach(el=>{const t=(el.textContent||"").trim();if(t.length>1&&t.length<300&&!txIsBad(t))out.push(t)})}catch(_){}
 return out};

const T_IMG=[1,2,3,4,5,6,7,8].map(n=>"img/t-"+n+".jpg");
const TK="tc_traffic_v2";const DEF=()=>JSON.parse(JSON.stringify(window.TRAFFIC_DEFAULT));let TD;try{TD=JSON.parse(localStorage.getItem(TK))}catch(e){}
if(Array.isArray(TD)&&TD.length===7){TD.splice(4,0,DEF()[4]);try{localStorage.setItem(TK,JSON.stringify(TD))}catch(e){}}
if(!Array.isArray(TD)||TD.length!==8)TD=DEF();window.TD=TD;
const cacheT=()=>{try{localStorage.setItem(TK,JSON.stringify(TD))}catch(e){}};
let tTimer=null;
const pushT=()=>{if(!window.cloud||!window.cloud.save)return;window.cloud.save("traffic","traffic",[],{json:JSON.stringify(TD)}).then(()=>{try{toast("تم الحفظ ✓")}catch(e){}}).catch(()=>{try{toast("تعذّر الحفظ (تحقق من الصلاحيات أو الاتصال)")}catch(e){}})};
const saveT=now=>{cacheT();if(!isAdmin||!editing)return;clearTimeout(tTimer);if(now)pushT();else tTimer=setTimeout(pushT,700)};
window.applyTraffic=x=>{try{const a=JSON.parse(x&&x.json);if(!Array.isArray(a)||a.length!==8)return;
 if(isAdmin&&editing)return;
 TD=a;cacheT();if(/^t[1-8]$/.test(location.hash.slice(1)))route()}catch(e){}};
/* رسوم الإشارات (SVG) */
const R='<circle cx="32" cy="32" r="28" fill="#fff" stroke="#d32f2f" stroke-width="7"/>',
 TRI=i=>`<path d="M32 5L61 56H3z" fill="#fff" stroke="#d32f2f" stroke-width="6" stroke-linejoin="round"/>${i}`,
 BL=i=>`<circle cx="32" cy="32" r="29" fill="#1565c0"/>${i}`,
 AR='<path d="M14 32h32M34 18l14 14-14 14" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 INF=(c,i)=>`<rect x="5" y="5" width="54" height="54" rx="7" fill="${c}" stroke="#fff" stroke-width="3"/>${i}`,
 svgT=(t,x,y,s,c)=>`<text x="${x}" y="${y}" font-size="${s}" font-weight="800" fill="${c||'#fff'}" text-anchor="middle" font-family="Arial">${t}</text>`;
const S={
 prohibit:[["ممنوع المرور",R+'<rect x="14" y="27" width="36" height="10" fill="#d32f2f"/>'],["ممنوع الدوران",R+'<path d="M22 46V28a8 8 0 0 1 16 0v4M30 26l8 8 6-8" stroke="#111" stroke-width="5" fill="none"/><path d="M14 50L50 14" stroke="#d32f2f" stroke-width="5"/>'],["تحديد السرعة 30",R+svgT("30",32,41,24,"#111")],["تحديد السرعة 50",R+svgT("50",32,41,24,"#111")],["ممنوع التوقف",'<circle cx="32" cy="32" r="29" fill="#1565c0" stroke="#d32f2f" stroke-width="6"/><path d="M14 50L50 14M14 14l36 36" stroke="#d32f2f" stroke-width="6"/>'],["قف",'<path d="M20 4h24l16 16v24L44 60H20L4 44V20z" fill="#d32f2f" stroke="#fff" stroke-width="3"/>'+svgT("قف",32,40,20)]],
 danger:[["ممر الراجلين",TRI('<circle cx="32" cy="26" r="3.5"/><path d="M32 31v10M32 34l-6 6M32 34l6 5M32 41l-5 8M32 41l5 8" stroke="#111" stroke-width="3.5" fill="none"/>')],["طريق ضيق",TRI('<path d="M24 50V24M40 50V24M24 24l4 8M40 24l-4 8" stroke="#111" stroke-width="3.5" fill="none"/>')],["طريق زلق",TRI('<path d="M22 46c4-6 8-6 12-12s2-8 6-12M26 50c4-4 6-4 10-8" stroke="#111" stroke-width="3.5" fill="none"/>')],["منعطف خطير",TRI('<path d="M26 50c8-10-6-14 6-26M28 28l4-6 5 6" stroke="#111" stroke-width="3.5" fill="none"/>')],["مدرسة",TRI('<circle cx="26" cy="30" r="3"/><circle cx="38" cy="30" r="3"/><path d="M26 34v10M38 34v10" stroke="#111" stroke-width="3.5"/>')]],
 force:[["اتجاه إجباري يمين",BL(AR)],["اتجاه إجباري أمام",BL('<g transform="rotate(-90 32 32)">'+AR+'</g>')],["اتجاه إجباري يسار",BL('<g transform="rotate(180 32 32)">'+AR+'</g>')],["اتجاه إجباري للأسفل",BL('<g transform="rotate(90 32 32)">'+AR+'</g>')]],
 guide:[["موقف السيارات",INF("#1565c0",svgT("P",32,46,38))],["المستشفى",INF("#1565c0",'<rect x="26" y="14" width="12" height="36" fill="#fff"/><rect x="14" y="26" width="36" height="12" fill="#d32f2f"/>')],["طريق سيار",INF("#1565c0",'<path d="M14 54L28 10h8l14 44M32 18v8M32 32v8M32 46v6" stroke="#fff" stroke-width="3" fill="none"/>')],["اتجاه الطريق",INF("#2e7d32",'<path d="M12 36h36M38 24l12 12-12 12" stroke="#fff" stroke-width="6" fill="none"/>')],["المسافات",INF("#2e7d32",svgT("وهران",32,28,13)+svgT("45 كم",32,48,13))],["محطة وقود",INF("#1565c0",'<rect x="16" y="14" width="20" height="36" rx="2" fill="#fff"/><path d="M36 22h8v18" stroke="#fff" stroke-width="4" fill="none"/>')]],
 light:[["الضوء الأحمر",'<rect x="18" y="4" width="28" height="56" rx="8" fill="#222"/><circle cx="32" cy="16" r="8" fill="#e53935"/><circle cx="32" cy="32" r="8" fill="#444"/><circle cx="32" cy="48" r="8" fill="#444"/>'],["الضوء الأصفر",'<rect x="18" y="4" width="28" height="56" rx="8" fill="#222"/><circle cx="32" cy="16" r="8" fill="#444"/><circle cx="32" cy="32" r="8" fill="#fbc02d"/><circle cx="32" cy="48" r="8" fill="#444"/>'],["الضوء الأخضر",'<rect x="18" y="4" width="28" height="56" rx="8" fill="#222"/><circle cx="32" cy="16" r="8" fill="#444"/><circle cx="32" cy="32" r="8" fill="#444"/><circle cx="32" cy="48" r="8" fill="#43a047"/>']],
 ground:[["خط متصل",'<rect x="4" y="4" width="56" height="56" rx="6" fill="#444"/><rect x="29" y="4" width="6" height="56" fill="#fff"/>'],["خط متقطع",'<rect x="4" y="4" width="56" height="56" rx="6" fill="#444"/><path d="M32 8v10M32 25v10M32 42v10" stroke="#fff" stroke-width="6"/>'],["ممر الراجلين (علامة أرضية)",'<rect x="4" y="4" width="56" height="56" rx="6" fill="#444"/><path d="M12 8v48M22 8v48M32 8v48M42 8v48M52 8v48" stroke="#fff" stroke-width="5"/>'],["سهم أرضي",'<rect x="4" y="4" width="56" height="56" rx="6" fill="#444"/><path d="M32 52V16M20 28l12-14 12 14" stroke="#fff" stroke-width="7" fill="none"/>']]
};
const DESC={"ممنوع المرور":"يُمنع دخول جميع المركبات من هذا الاتجاه (طرق ذات اتجاه واحد أو مخارج).","ممنوع الدوران":"يُمنع الانعطاف أو الدوران في هذا الاتجاه.","تحديد السرعة 30":"تمنع السير بسرعة تتجاوز 30 كم/سا.","تحديد السرعة 50":"تمنع السير بسرعة تتجاوز 50 كم/سا.","ممنوع التوقف":"يُمنع توقف أو وقوف المركبات على هذا الجانب من الطريق.","قف":"توقف إجباري قبل خط التوقف أو الملتقى وإعطاء الأولوية لمن له حق المرور.","ممر الراجلين":"تنبيه بوجود ممر للراجلين أمامك، خفّض سرعتك وأعطِ الأولوية.","ممر الراجلين (علامة أرضية)":"خطوط بيضاء على الطريق تحدد مكان عبور الراجلين، أعطِهم الأولوية.","طريق ضيق":"الطريق يضيق في المقطع القادم، انتبه للمركبات القادمة.","طريق زلق":"قد يكون سطح الطريق زلقاً، خفّض السرعة وتجنب الفرملة المفاجئة.","منعطف خطير":"منعطف حاد أمامك، خفّض السرعة.","مدرسة":"قرب مؤسسة تعليمية، انتبه لعبور الأطفال.","اتجاه إجباري يمين":"يجب على المركبات السير نحو اليمين فقط.","اتجاه إجباري أمام":"يجب على المركبات السير إلى الأمام فقط.","اتجاه إجباري يسار":"يجب على المركبات السير نحو اليسار فقط.","اتجاه إجباري للأسفل":"يجب اتباع الاتجاه المبيّن بالسهم فقط.","موقف السيارات":"مكان مخصص لوقوف المركبات.","المستشفى":"يدل على وجود مستشفى أو مركز إسعاف قريب.","طريق سيار":"بداية طريق سيار (سريع).","اتجاه الطريق":"يبيّن الاتجاه المؤدي إلى الوجهة.","المسافات":"يبيّن اسم الوجهة والمسافة المتبقية إليها.","محطة وقود":"محطة لتزويد المركبات بالوقود.","الضوء الأحمر":"توقف إجباري خلف خط التوقف.","الضوء الأصفر":"استعد للتوقف؛ لا تدخل التقاطع إن كان بإمكانك التوقف بأمان.","الضوء الأخضر":"يُسمح بالمرور مع الانتباه للراجلين وحركة التقاطع.","خط متصل":"يُمنع تجاوزه أو عبوره.","خط متقطع":"يُسمح بتجاوزه عند توفر الأمان.","سهم أرضي":"يوجّه المركبات إلى المسار المسموح به.","سهم أرضي ":"يوجّه المركبات إلى المسار المسموح به."};
const SF="tc_sign_fav";let SFV=[];try{SFV=JSON.parse(localStorage.getItem(SF))||[]}catch(e){}
const saveSF=()=>{try{localStorage.setItem(SF,JSON.stringify(SFV))}catch(e){}};

/* ===== إضافات موسوعة الإشارات (v31) ===== */
{const i=SFV.indexOf("ممنوع المرور");if(i>-1){SFV[i]="ممنوع الدخول (اتجاه ممنوع)";saveSF()}}
S.prohibit[0][0]="ممنوع الدخول (اتجاه ممنوع)";
const K="#111",RD="#d32f2f",YL="#fbc02d",
 mir=s=>`<g transform="translate(64 0) scale(-1 1)">${s}</g>`,
 TURN='<path d="M24 46V30h12M31 22l9 8-9 8" stroke="#111" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M15 15L49 49" stroke="#d32f2f" stroke-width="5"/>',
 SPD=n=>R+svgT(n,32,n.length>2?39:41,n.length>2?18:24,K),
 DIAG='<path d="M18 46L46 18M24 50L50 24M12 40L40 12" stroke="#111" stroke-width="3.5"/>',
 BG='<rect x="4" y="4" width="56" height="56" rx="6" fill="#444"/>',
 DM=(a,b,c)=>`<path d="M32 2L62 32L32 62L2 32z" fill="#111"/><path d="M32 6L58 32L32 58L6 32z" fill="#fff"/>${a?`<path d="M32 12L52 32L32 52L12 32z" fill="${b}"/>`:""}${c||""}`,
 KEEP='<path d="M20 20L44 44M44 27v17H27" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
S.danger.push(
["أشغال عمومية",TRI('<circle cx="27" cy="27" r="3"/><path d="M27 31l5 8-6 9M32 39l8-3M38 30l-6 6" stroke="#111" stroke-width="3" fill="none"/><path d="M36 48l6-8 6 8z" fill="#111"/>')],
["مفترق طرق خطير (الأولوية لليمين)",TRI('<path d="M32 22v28M20 37h24" stroke="#111" stroke-width="3.5"/>')],
["أولوية المرور في المفترق القادم",TRI('<path d="M32 22v28" stroke="#111" stroke-width="6"/><path d="M20 37h24" stroke="#111" stroke-width="2.5"/>')],
["ممر سكة حديدية بحواجز",TRI('<path d="M24 26v22M40 26v22" stroke="#111" stroke-width="3"/><rect x="22" y="30" width="20" height="4" fill="#111"/><rect x="22" y="38" width="20" height="4" fill="#111"/>')],
["ممر سكة حديدية بدون حواجز",TRI('<rect x="20" y="34" width="22" height="10" fill="#111"/><rect x="38" y="28" width="6" height="16" fill="#111"/><rect x="22" y="28" width="4" height="6" fill="#111"/><circle cx="26" cy="47" r="3" fill="#111"/><circle cx="38" cy="47" r="3" fill="#111"/>')],
["تساقط الحجارة",TRI('<path d="M22 48l22-14v14z" fill="#111"/><circle cx="30" cy="30" r="3.5" fill="#111"/><circle cx="38" cy="26" r="3" fill="#111"/><circle cx="25" cy="38" r="3" fill="#111"/>')],
["منحدر خطير",TRI('<path d="M20 28L46 46H20z" fill="#111"/>'+svgT("10%",38,31,9,K))],
["طريق ذو اتجاهين",TRI('<path d="M26 48V26M20 32l6-8 6 8" stroke="#111" stroke-width="3.5" fill="none"/><path d="M38 24v22M32 40l6 8 6-8" stroke="#d32f2f" stroke-width="3.5" fill="none"/>')],
["إشارات ضوئية أمامك",TRI('<rect x="26" y="24" width="12" height="25" rx="4" fill="#111"/><circle cx="32" cy="30" r="3.2" fill="#e53935"/><circle cx="32" cy="36.5" r="3.2" fill="#fbc02d"/><circle cx="32" cy="43" r="3.2" fill="#43a047"/>')],
["مرور حيوانات أليفة أو برية",TRI('<rect x="22" y="32" width="20" height="9" rx="4" fill="#111"/><circle cx="43" cy="31" r="4" fill="#111"/><path d="M26 41v8M32 41v8M38 41v8M22 36l-5-4M43 27l-2-6M43 27l4-5" stroke="#111" stroke-width="3" fill="none"/>')]);
S.prohibit.push(
["ممنوع المرور في الاتجاهين",R],
["ممنوع الانعطاف يميناً",R+TURN],
["ممنوع الانعطاف يساراً",R+mir(TURN)],
["تحديد السرعة 40",SPD("40")],["تحديد السرعة 60",SPD("60")],["تحديد السرعة 80",SPD("80")],["تحديد السرعة 100",SPD("100")],["تحديد السرعة 120",SPD("120")],
["ممنوع التجاوز",R+'<rect x="16" y="24" width="14" height="22" rx="3" fill="#d32f2f"/><rect x="34" y="24" width="14" height="22" rx="3" fill="#111"/>'],
["ممنوع التجاوز للشاحنات",R+'<rect x="16" y="28" width="12" height="18" rx="3" fill="#d32f2f"/><rect x="32" y="20" width="16" height="26" rx="2" fill="#111"/><rect x="32" y="20" width="16" height="7" fill="#555"/>'],
["ممنوع مرور الشاحنات",R+'<rect x="14" y="26" width="22" height="14" fill="#111"/><path d="M38 30h6l4 5v5H38z" fill="#111"/><circle cx="22" cy="43" r="3.5" fill="#111"/><circle cx="42" cy="43" r="3.5" fill="#111"/>'],
["ممنوع استعمال المنبه الصوتي",R+'<path d="M18 28h8l12-8v24l-12-8h-8z" fill="#111"/><path d="M14 50L50 14" stroke="#d32f2f" stroke-width="5"/>'],
["نهاية جميع الممنوعات",'<circle cx="32" cy="32" r="28" fill="#fff" stroke="#777" stroke-width="4"/>'+DIAG]);
S.priority=[
["افسح الطريق (ترك المرور)",'<path d="M3 8h58L32 58z" fill="#fff" stroke="#d32f2f" stroke-width="6" stroke-linejoin="round"/>'],
["طريق ذو أولوية",DM(1,YL)],
["نهاية الطريق ذي الأولوية",DM(0,"",DIAG)]];
S.force.push(
["الالتزام أقصى اليمين",BL(KEEP)],
["الالتزام أقصى اليسار",BL(mir(KEEP))],
["دوران إجباري في المدار",BL('<circle cx="32" cy="32" r="14" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="20 9.3"/><g fill="#fff"><path d="M41 30h10l-5 9z" transform="rotate(70 32 32)"/><path d="M41 30h10l-5 9z" transform="rotate(190 32 32)"/><path d="M41 30h10l-5 9z" transform="rotate(310 32 32)"/></g>')],
["ممر إجباري للحافلات",BL('<rect x="15" y="18" width="34" height="24" rx="4" fill="#fff"/><rect x="19" y="22" width="26" height="9" rx="2" fill="#1565c0"/><circle cx="22" cy="46" r="4" fill="#fff"/><circle cx="42" cy="46" r="4" fill="#fff"/>')],
["مسلك إجباري للدراجات",BL('<circle cx="21" cy="40" r="8" fill="none" stroke="#fff" stroke-width="3"/><circle cx="43" cy="40" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M21 40l8-14h10l4 14M29 26l6 14h-14M36 22h6" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/>')],
["سرعة دنيا إجبارية",BL(svgT("40",32,41,24))]);
S.guide.push(
["نهاية الطريق السيار",INF("#1565c0",'<path d="M14 54L28 10h8l14 44M32 18v8M32 32v8M32 46v6" stroke="#fff" stroke-width="3" fill="none"/><path d="M10 54L54 10" stroke="#d32f2f" stroke-width="5"/>')],
["طريق ذو اتجاه واحد",INF("#1565c0",'<path d="M32 52V16M20 28l12-12 12 12" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')],
["طريق مسدود",INF("#1565c0",'<rect x="29" y="18" width="6" height="34" fill="#fff"/><rect x="14" y="12" width="36" height="7" fill="#d32f2f"/>')],
["ممهل (مطب صناعي)",INF("#1565c0",'<path d="M10 44h12a10 10 0 0 1 20 0h12" stroke="#fff" stroke-width="5" fill="none"/>')]);
S.light.push(["الضوء الأصفر المتقطع",'<rect x="18" y="4" width="28" height="56" rx="8" fill="#222"/><circle cx="32" cy="16" r="8" fill="#444"/><circle cx="32" cy="32" r="8" fill="#fbc02d"/><circle cx="32" cy="48" r="8" fill="#444"/><path d="M6 32h8M50 32h8M10 21l6 5M54 21l-6 5M10 43l6-5M54 43l-6-5" stroke="#fbc02d" stroke-width="3"/>']);
S.ground.push(
["خط مختلط (متصل ومتقطع)",BG+'<path d="M27 4v56" stroke="#fff" stroke-width="3.5"/><path d="M37 8v10M37 25v10M37 42v10" stroke="#fff" stroke-width="3.5"/>'],
["خط التوقف (عند إشارة قف)",BG+'<rect x="8" y="26" width="48" height="8" fill="#fff"/>'],
["أسهم التوجيه الأرضية",BG+'<path d="M24 52V38H12M18 30l-8 8 8 8M40 52V38h12M46 30l8 8-8 8" stroke="#fff" stroke-width="5" fill="none" stroke-linejoin="round"/>']);
Object.assign(DESC,{
"ممنوع الدخول (اتجاه ممنوع)":"يُمنع دخول جميع المركبات من هذا الاتجاه (طرق ذات اتجاه واحد أو مخارج).",
"أشغال عمومية":"أشغال على الطريق أمامك، خفّض سرعتك وانتبه للعمال والآليات.",
"مفترق طرق خطير (الأولوية لليمين)":"مفترق طرق بلا أولوية مبيّنة: أعطِ الأولوية للمركبات القادمة من اليمين.",
"أولوية المرور في المفترق القادم":"أنت على طريق ذي أولوية في المفترق القادم، مع بقاء الحذر.",
"ممر سكة حديدية بحواجز":"تقاطع مع سكة حديدية مزوّد بحواجز، توقف عند إغلاقها.",
"ممر سكة حديدية بدون حواجز":"تقاطع مع سكة حديدية بلا حواجز، انتبه جيداً وتأكد من خلو السكة.",
"تساقط الحجارة":"احتمال تساقط حجارة من المنحدرات المجاورة، كن حذراً.",
"منحدر خطير":"منحدر شديد أمامك، استعمل علبة السرعات المنخفضة وخفّض السرعة.",
"طريق ذو اتجاهين":"الطريق بعد هذه الإشارة يصبح ذا اتجاهين، التزم أقصى اليمين.",
"إشارات ضوئية أمامك":"إشارات ضوئية للمرور أمامك، استعد للتوقف.",
"مرور حيوانات أليفة أو برية":"احتمال عبور حيوانات الطريق، خفّض السرعة.",
"ممنوع المرور في الاتجاهين":"يُمنع مرور جميع المركبات في الاتجاهين.",
"ممنوع الانعطاف يميناً":"يُمنع الانعطاف إلى اليمين عند المفترق القادم.",
"ممنوع الانعطاف يساراً":"يُمنع الانعطاف إلى اليسار عند المفترق القادم.",
"تحديد السرعة 40":"تمنع السير بسرعة تتجاوز 40 كم/سا.",
"تحديد السرعة 60":"تمنع السير بسرعة تتجاوز 60 كم/سا.",
"تحديد السرعة 80":"تمنع السير بسرعة تتجاوز 80 كم/سا.",
"تحديد السرعة 100":"تمنع السير بسرعة تتجاوز 100 كم/سا.",
"تحديد السرعة 120":"تمنع السير بسرعة تتجاوز 120 كم/سا.",
"ممنوع التجاوز":"يُمنع تجاوز المركبات ذات المحركين أو أكثر على هذا المقطع.",
"ممنوع التجاوز للشاحنات":"يُمنع على الشاحنات تجاوز المركبات الأخرى.",
"ممنوع مرور الشاحنات":"يُمنع دخول الشاحنات إلى هذا الطريق.",
"ممنوع استعمال المنبه الصوتي":"يُمنع استعمال المنبه الصوتي إلا في حالة الخطر الوشيك.",
"نهاية جميع الممنوعات":"انتهاء مفعول جميع الممنوعات المفروضة سابقاً.",
"افسح الطريق (ترك المرور)":"أعطِ الأولوية للمركبات على الطريق الذي تدخله وتوقف عند الحاجة.",
"طريق ذو أولوية":"أنت على طريق ذي أولوية في المفترقات القادمة.",
"نهاية الطريق ذي الأولوية":"انتهاء الأولوية، طبّق قواعد الأولوية العادية في المفترقات.",
"الالتزام أقصى اليمين":"يجب البقاء في أقصى الجهة اليمنى من الطريق.",
"الالتزام أقصى اليسار":"يجب البقاء في أقصى الجهة اليسرى من الطريق.",
"دوران إجباري في المدار":"يجب الدوران حول المدار في الاتجاه المبيّن بالأسهم.",
"ممر إجباري للحافلات":"مسلك مخصص للحافلات فقط، لا يجوز لباقي المركبات استعماله.",
"مسلك إجباري للدراجات":"مسلك مخصص للدراجات الهوائية فقط.",
"سرعة دنيا إجبارية":"يُمنع السير بسرعة تقل عن السرعة المبيّنة على هذا الطريق.",
"نهاية الطريق السيار":"انتهاء الطريق السيار، طبّق قواعد الطرق العادية.",
"طريق ذو اتجاه واحد":"الطريق ذو اتجاه واحد فقط، لا يجوز السير عكسه.",
"طريق مسدود":"الطريق لا مخرج له في نهايته.",
"ممهل (مطب صناعي)":"ممهل أمامك، خفّض سرعتك قبل المرور فوقه.",
"الضوء الأصفر المتقطع":"انتبه وتقدّم بحذر، وأعطِ الأولوية وفق إشارات الطريق.",
"خط مختلط (متصل ومتقطع)":"يُسمح بتجاوزه من جهة الخط المتقطع فقط.",
"خط التوقف (عند إشارة قف)":"يجب التوقف التام خلف هذا الخط عند إشارة قف أو الضوء الأحمر.",
"أسهم التوجيه الأرضية":"تبيّن الاتجاهات المسموحة في المسار، اختر مسارك مسبقاً."});

const ALL=[];
const sg=(a,cat)=>a.map(x=>{const k=ALL.push({n:x[0],svg:x[1],cat})-1;return `<div class="sgi" data-sg="${k}" role="button" tabindex="0"><svg viewBox="0 0 64 64">${x[1]}</svg><b>${esc(window.tx(x[0]))}</b><small>${esc(cat)}</small></div>`}).join("");
function sgModal(k){const x=ALL[k];let m=document.getElementById("sgm");if(!m){m=document.createElement("div");m.id="sgm";m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px";document.body.appendChild(m)}
 const fv=()=>SFV.includes(x.n);
 m.style.display="flex";m.onclick=e=>{if(e.target===m)m.style.display="none"};
 m.innerHTML=`<div style="background:var(--surface);border:2px solid var(--accent);border-radius:14px;padding:20px;max-width:340px;width:100%;text-align:center"><svg viewBox="0 0 64 64" style="width:110px;height:110px">${x.svg}</svg><h3 style="color:var(--accent);margin:8px 0">${esc(window.tx(x.n))}</h3><small class="mu">${esc(x.cat)}</small><p style="line-height:1.7">${esc(window.tx(DESC[x.n]||"—"))}</p><div class="bar" style="justify-content:center"><button class="btn" id="sgf">${fv()?tr("remFav"):tr("addFav")}</button><button class="btn" id="sgx">${tr("close")}</button></div></div>`;
 document.getElementById("sgx").onclick=()=>m.style.display="none";
 document.getElementById("sgf").onclick=()=>{const i=SFV.indexOf(x.n);i>-1?SFV.splice(i,1):SFV.push(x.n);saveSF();sgModal(k)}}
document.addEventListener("click",e=>{const c=e.target.closest&&e.target.closest("[data-sg]");if(c)sgModal(+c.dataset.sg)});
/* ===== المفضلة الموحّدة + بحث شامل + إخلاء المسؤولية (v33) ===== */
const EN=()=>pref&&pref.lang==="en";
const isX=k=>k.startsWith("sg|")?SFV.includes(k.slice(3)):favs.includes(k);
function xfBtn(k){return `<button class="st" type="button" data-xf="${esc(k)}" aria-label="★">${ic("star",isX(k)?"fill":"")}</button>`}
function xfToggle(k){if(k.startsWith("sg|")){const n=k.slice(3),i=SFV.indexOf(n);i>-1?SFV.splice(i,1):SFV.push(n);saveSF()}
 else{const i=favs.indexOf(k);i>-1?favs.splice(i,1):favs.push(k);W("tc_fav",favs);try{window.cloud&&window.cloud.syncFavorites&&window.cloud.syncFavorites(favs)}catch(e){}}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-xf]");if(!b)return;e.preventDefault();e.stopPropagation();
 const k=b.dataset.xf;xfToggle(k);if(location.hash==="#fav")window.showFav();else b.innerHTML=ic("star",isX(k)?"fill":"")},true);
const oD=window.showDocs;
window.showDocs=function(i){oD(i);if(editing)return;app.querySelectorAll(".dc").forEach((dc,k)=>{const t=String(docs[i][k]||"").trim();if(t)dc.insertAdjacentHTML("beforeend",xfBtn("g|"+i+"|"+t))})};
const oE=window.showEquipCat;
window.showEquipCat=function(i){oE(i);if(editing)return;const keys=eqKeys(i),c=equip[i];app.querySelectorAll("details.vc").forEach((d,di)=>{const k=keys[di],dcs=d.querySelectorAll(".vb .dc");(c.items[k]||[]).forEach((x,ki)=>{const t=String(x).trim();if(dcs[ki]&&t)dcs[ki].insertAdjacentHTML("beforeend",xfBtn("e|"+i+"|"+k+"|"+t))})})};
window.showFav=function(){cur=null;curG=null;curE=null;let cards="";
 const card=(cat,title,meta,href,key,legacy)=>{const a=legacy?`data-favx="${esc(key)}"`:`data-xf="${esc(key)}"`;
  return `<div class="fav-card"><div class="fav-card-header"><span class="fav-card-cat">${cat}</span><button class="st" type="button" ${a}>${ic("star","fill")}</button></div><div class="fav-card-title">${title}</div>${meta||""}<div class="bar">${href}</div></div>`};
 const mt=(l,v)=>v?`<div class="fav-card-meta"><span class="mu">${l}:</span> ${esc(v)}</div>`:"";
 const op=(h,o)=>`<a class="btn" href="${h}"${o?` data-open="${o}"`:""}>${tr("open")}</a>`;
 data.forEach((s,i)=>s.rows.forEach((r,ri)=>{if(!isFav(i,r))return;const C=COLS(),key=sKey(i,r);cards+=card(`${i+1}. ${esc(short(i)||s.title)}`,esc(TC_TXT(r[0]).replace(/\n/g," ")||fName(r)),mt(C[1],TC_TXT(r[1]))+mt(C[2],TC_TXT(r[2]))+mt(C[3],TC_TXT(r[3])),op("#s"+(i+1),"s|"+i+"|"+ri),key)}));
 docs.forEach((l,i)=>l.forEach(x=>{const t=String(x).trim();if(!t||!favs.includes("g|"+i+"|"+t))return;cards+=card(`${tr("guide")} — ${esc(short(i))}`,esc(t),"",op("#g"+(i+1)),"g|"+i+"|"+t)}));
 equip.forEach((c,i)=>eqKeys(i).forEach(k=>(c.items[k]||[]).forEach(x=>{const t=String(x).trim();const key="e|"+i+"|"+k+"|"+t;if(!t||!favs.includes(key))return;cards+=card(`${tr("equip")} — ${esc(short(i))} · ${esc((c.labels&&c.labels[k])||k)}`,esc(t),"",op("#e"+(i+1)),key)})));
 TD.forEach((s,i)=>i===T_HIDE?0:s.rows.forEach((r,ri)=>{const nm=tKey(r);const key="t|"+i+"|"+nm;if(!nm||!favs.includes(key))return;cards+=card(esc(T_SECS()[i][0]),esc(tTitle(r)),mt(T_COLS()[1],TC_TXT(r[1]))+mt(T_COLS()[3],TC_TXT(r[3]))+mt(T_COLS()[4],TC_TXT(r[4]))+mt(T_COLS()[5],TC_TXT(r[5])),op("#t"+(i+1),"t|"+i+"|"+ri),key)}));
 ALL.forEach((x,k)=>{if(!SFV.includes(x.n))return;cards+=card(`إشارة · ${esc(x.cat)}`,`<span style="display:flex;gap:10px;align-items:center"><svg viewBox="0 0 64 64" style="width:44px;height:44px">${x.svg}</svg>${esc(x.n)}</span>`,"",`<button class="btn" type="button" data-sg="${k}">${tr("open")}</button>`,"sg|"+x.n)});
 app.innerHTML=`<h2 class="t">${tr("fav")}</h2><div class="fav-grid">${cards||`<div class="fav-empty">${tr("favEmpty")}</div>`}</div>`};
/* بحث شامل: كل الأقسام + جداول المرور + الإشارات */
window.search=function(q){const nq=norm(q.trim());if(!nq){route();return}
 $("home").style.display="";let h=`<h2 class="t">${tr("res")}</h2><div id="res">`,n=0;
 data.forEach((s,i)=>{s.rows.forEach(r=>{if(isDiv(r)||!(r.some(c=>norm(c).includes(nq))||norm(s.title).includes(nq)))return;n++;
  h+=`<div class="hit"><a href="#s${i+1}" style="color:inherit;text-decoration:none"><b>${i+1}. ${hl(s.title,q)}</b></a>`+COLS().map((c,ci)=>r[ci]?`<div><span class="mu">${c}:</span> ${hl(r[ci],q)}</div>`:"").join("")+"</div>"})});
 docs.forEach((l,i)=>l.forEach(x=>{if(!norm(x).includes(nq))return;n++;h+=`<div class="hit"><a href="#g${i+1}" style="color:inherit;text-decoration:none"><b>${tr("guide")} — ${esc(short(i))}</b></a><div>${hl(x,q)}</div></div>`}));
 equip.forEach((c,i)=>eqKeys(i).forEach(k=>(c.items[k]||[]).forEach(x=>{if(!norm(String(x)).includes(nq))return;n++;h+=`<div class="hit"><a href="#e${i+1}" style="color:inherit;text-decoration:none"><b>${tr("equip")} — ${esc(short(i))} · ${esc((c.labels&&c.labels[k])||k)}</b></a><div>${hl(x,q)}</div></div>`})));
 TD.forEach((s,i)=>i===T_HIDE?0:(()=>{const FM=tFillMap(s.rows);s.rows.forEach(r=>{if(isDiv(r)||!(r.some(c=>norm(String(c)).includes(nq))||norm(T_SECS()[i][0]).includes(nq)))return;n++;
  const H=t=>hl(t,q);
  h+=`<div class="hit"><a href="#t${i+1}" style="color:inherit;text-decoration:none"><b>${T_NUM(i)}. ${H(T_SECS()[i][0])}</b></a>`+T_COLS().map((c,ci)=>{const v=tCol(r[ci]).filter(t=>t&&t!==HR);return v.length?`<div><span class="mu">${c}:</span> ${v.map(H).join("<br>")}</div>`:""}).join("")+"</div>"})})());
 ALL.forEach((x,k)=>{if(!(norm(x.n).includes(nq)||norm(DESC[x.n]||"").includes(nq)))return;n++;
  h+=`<div class="hit" data-sg="${k}" role="button" tabindex="0" style="display:flex;gap:10px;align-items:center;cursor:pointer"><svg viewBox="0 0 64 64" style="width:44px;height:44px;flex:none">${x.svg}</svg><div><b>${hl(x.n,q)}</b><div class="mu">إشارة · ${esc(x.cat)}</div></div></div>`});
 app.innerHTML=h+(n?"":`<p class="empty">${tr("none")}</p>`)+"</div>"};
/* إخلاء المسؤولية */
const DISC_AR=["هذا التطبيق اجتهاد شخصي ولا يمثل أي جهة حكومية أو رسمية.","يعتمد المحتوى على النصوص والمراجع التنظيمية والقانونية المنشورة في الجريدة الرسمية للجمهورية الجزائرية الديمقراطية الشعبية لأغراض التوعية والاطلاع فقط، ولا يُغني عن الرجوع إلى النصوص الرسمية أو الجهات المختصة.","لا يقوم التطبيق بجمع بيانات شخصية غير ضرورية، ولا يتحمل أي مسؤولية عن كيفية استعمال المعلومات الواردة فيه."],
 DISC_EN=["This app is a personal effort and does not represent any governmental or official body.","The content is based on regulatory and legal texts published in the Official Gazette of the People’s Democratic Republic of Algeria, for awareness and information purposes only. It does not replace the official texts or the competent authorities.","The app does not collect unnecessary personal data, and bears no responsibility for how the information it contains is used."];
let DISC_C=null;try{DISC_C=JSON.parse(localStorage.getItem("tc_disc"))}catch(_){}
const discText=en=>{const c=DISC_C&&DISC_C[en?"en":"ar"];return Array.isArray(c)&&c.length?c:(en?DISC_EN:DISC_AR)};
window.onDisc=x=>{if(!x)return;DISC_C={ar:Array.isArray(x.ar)?x.ar.map(String):[],en:Array.isArray(x.en)?x.en.map(String):[]};try{localStorage.setItem("tc_disc",JSON.stringify(DISC_C))}catch(_){}
 const m=document.getElementById("dscm");if(m&&m.style.display!=="none"&&!m._ed)showDisc()};
if(window._discRaw)window.onDisc(window._discRaw);
function showDisc(ed){let m=document.getElementById("dscm");if(!m){m=document.createElement("div");m.id="dscm";document.body.appendChild(m)}
 const en=EN(),adm=!!isAdmin,editing_=ed===true&&adm;m._ed=editing_;m.dir=en?"ltr":"rtl";m.style.display="flex";
 const head=`<h3>${AI("warn")} ${tr("discTitle")}</h3>`;
 if(editing_){
  m.innerHTML=`<div class="dsc-card" role="dialog" aria-modal="true">${head}<label class="dsc-l">${tr("discArLabel")}<textarea id="dsca" rows="8">${esc(discText(false).join("\n\n"))}</textarea></label><label class="dsc-l">${tr("discEnLabel")}<textarea id="dsce" dir="ltr" rows="8">${esc(discText(true).join("\n\n"))}</textarea></label><div class="bar" style="justify-content:center;flex-wrap:wrap"><button class="btn primary" type="button" id="dscs">${tr("discSave")}</button><button class="btn" type="button" id="dscr">${tr("discRestore")}</button><button class="btn" type="button" id="dscc">${tr("discCancel")}</button></div></div>`;
  const parse=v=>String(v||"").split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  const save=(ar,enx)=>{if(!window.cloud||!window.cloud.save){toast("جاري الاتصال بالخادم…");return}
   window.cloud.save("disclaimer","disclaimer",[],{ar,en:enx}).then(()=>{window.onDisc({ar,en:enx});m._ed=false;showDisc();toast("تم الحفظ ✓")}).catch(()=>toast("تعذّر الحفظ"))};
  document.getElementById("dscs").onclick=()=>save(parse(document.getElementById("dsca").value),parse(document.getElementById("dsce").value));
  document.getElementById("dscr").onclick=()=>{if(confirm("استعادة النص الافتراضي؟"))save([],[])};
  document.getElementById("dscc").onclick=()=>{m._ed=false;showDisc()};
  return}
 m.innerHTML=`<div class="dsc-card" role="dialog" aria-modal="true">${head}${discText(en).map(p=>`<p>${esc(p)}</p>`).join("")}<div class="bar" style="justify-content:center">${adm?`<button class="btn" type="button" id="dsce_">${AI("edit")} ${en?"Edit":"تعديل"}</button>`:""}<button class="btn" type="button" id="dscx">${en?"Close":"إغلاق"}</button></div></div>`;
 const close=()=>{m.style.display="none"};document.getElementById("dscx").onclick=close;m.onclick=ev=>{if(ev.target===m)close()};
 const eb=document.getElementById("dsce_");if(eb)eb.onclick=()=>showDisc(true)}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const m=document.getElementById("dscm");if(m)m.style.display="none"}});
const oS=window.showSettings;
window.showSettings=function(){oS();const b=document.getElementById("discBtn");if(b)b.onclick=showDisc};
/* بطاقات الكاروسيل (رسوم) */
const BUS='<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a90d9"/><stop offset="1" stop-color="#cfe6f7"/></linearGradient></defs><rect width="200" height="300" fill="url(#sk)"/><rect y="200" width="200" height="100" fill="#555"/><path d="M100 200l-8 100M100 200l8 100" stroke="#ddd" stroke-width="3"/><rect x="20" y="70" width="95" height="130" rx="10" fill="#f2f2f2" stroke="#999"/><rect x="28" y="95" width="79" height="55" rx="5" fill="#35505f"/><rect x="26" y="78" width="83" height="14" rx="3" fill="#111" stroke="#e3c98d"/><text x="70" y="89" font-size="7.2" font-weight="800" fill="#ffc107" text-anchor="middle" font-family="Cairo,Arial">↑ وادي تليلات - وهران</text><circle cx="38" cy="180" r="6" fill="#ffe9a0"/><circle cx="98" cy="180" r="6" fill="#ffe9a0"/><rect x="125" y="95" width="60" height="105" rx="4" fill="#eee"/><rect x="128" y="100" width="54" height="40" fill="#b9d3e6"/><rect x="25" y="228" width="85" height="52" rx="3" fill="#f5f5f5" transform="rotate(-8 60 250)"/><text x="68" y="252" font-size="11" font-weight="800" fill="#16221e" text-anchor="middle" font-family="Cairo,Arial" transform="rotate(-8 60 250)">قانون تنسيق النقل</text><rect x="125" y="262" width="55" height="9" rx="3" fill="#7a4a21"/><rect x="143" y="248" width="35" height="14" rx="3" fill="#a8742f"/></svg>';
const TRF='<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice"><rect width="200" height="300" fill="#8ec1e8"/><rect y="150" width="200" height="150" fill="#666"/><path d="M100 150L40 300M100 150L160 300" stroke="#eee" stroke-width="3" stroke-dasharray="10 8"/><rect x="48" y="150" width="104" height="150" fill="#2e4d2c"/><circle cx="100" cy="95" r="22" fill="#d9a77a"/><path d="M78 88a22 22 0 0 1 44 0z" fill="#2e5a2a"/><rect x="62" y="116" width="76" height="110" rx="10" fill="#2e5a2a"/><rect x="72" y="140" width="56" height="30" rx="4" fill="#1b1b1b"/><text x="100" y="161" font-size="12" font-weight="800" fill="#fff" text-anchor="middle" font-family="Cairo,Arial">الدرك الوطني</text><circle cx="160" cy="130" r="16" fill="#d32f2f" stroke="#fff" stroke-width="3"/></svg>';
const SGN='<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice"><rect width="200" height="300" fill="#8ec1e8"/><rect y="230" width="200" height="70" fill="#666"/><g transform="translate(18 30) scale(1.2)"><path d="M20 4h24l16 16v24L44 60H20L4 44V20z" fill="#d32f2f" stroke="#fff" stroke-width="3"/><text x="32" y="40" font-size="20" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">قف</text></g><g transform="translate(110 30) scale(1.2)">'+TRI('<circle cx="32" cy="26" r="3.5"/><path d="M32 31v10M32 34l-6 6M32 34l6 5M32 41l-5 8M32 41l5 8" stroke="#111" stroke-width="3.5" fill="none"/>')+'</g><g transform="translate(18 130) scale(1.2)">'+BL(AR)+'</g><g transform="translate(110 130) scale(1.2)">'+R+svgT("30",32,41,24,"#111")+'</g></svg>';
const IM=n=>`<img src="img/home-${n}.jpg" alt="" style="width:100%;height:100%;object-fit:cover;display:block" draggable="false">`;
const CARDS=()=>[[tr("cardSigns"),tr("cardSignsB"),IM("signs"),"#signs"],[tr("cardTransport"),`<b>${tr("cardTransportB1")}</b><b>${tr("cardTransportB2")}</b>`,IM("transport"),"#transport"],[tr("cardTraffic"),tr("cardTrafficB"),IM("traffic"),"#traffic"]];
let pos=1;
function homeHTML(){const cnt=[ALL.length,data.reduce((a,x)=>a+x.rows.filter(T_FILLED).length,0),TD.reduce((a,x)=>a+x.rows.filter(T_FILLED).length,0)];
 return `<div class="c3" id="c3">${CARDS().map((c,i)=>`<div class="k" data-i="${i}"><b class="sn">${i+1}</b><b class="cnt2">${cnt[i]}</b><div class="kh">${c[0]}</div><div class="kb">${c[2]}</div><div class="kf"><i class="ar">‹</i><span class="kt">${c[1]}</span></div></div>`).join("")}</div><div class="dots">${CARDS().map((_,i)=>`<i data-d="${i}"></i>`).join("")}</div>`}
function paint(){document.querySelectorAll("#c3 .k").forEach(k=>{const i=+k.dataset.i;k.className="k "+(i===pos?"c":i<pos?"l":"r")});document.querySelectorAll(".dots i").forEach(d=>d.classList.toggle("on",+d.dataset.d===pos))}
function bind(){const b=document.getElementById("c3");let x0=null,moved=false;
 b.addEventListener("pointerdown",e=>{x0=e.clientX;moved=false});
 b.addEventListener("pointerup",e=>{if(x0===null)return;const d=e.clientX-x0;x0=null;
  if(Math.abs(d)>40){moved=true;pos=Math.max(0,Math.min(2,pos+(d<0?1:-1)));paint()}});
 b.addEventListener("click",e=>{if(moved){moved=false;return}const k=e.target.closest(".k");if(!k)return;const i=+k.dataset.i;if(i===pos)location.hash=CARDS()[i][3];else{pos=i;paint()}});
 document.querySelectorAll(".dots i").forEach(d=>d.onclick=()=>{pos=+d.dataset.d;paint()});paint()}
const oldIndex=window.showIndex||showIndex;
const fileHero=k=>`<div class="fhero" data-notr="0"><h1>${tr(k)}</h1></div>`;
window.fileHero=fileHero;
window.showTransport=function(){oldIndex();app.insertAdjacentHTML("afterbegin",fileHero("cardTransport"))};
/* عناوين الأدلة في سطر واحد: تصغير الخط تلقائياً عند الحاجة */
function fit1(){app.querySelectorAll("h2.fit1>span,.lead.fit1,.sec h3 span:last-child,.vc .vt").forEach(el=>{el.style.whiteSpace="nowrap";el.style.overflow="hidden";el.style.minWidth="0";if(!el.classList.contains("lead")&&!el.classList.contains("tt"))el.style.flex="1";el.style.fontSize="";let z=parseFloat(getComputedStyle(el).fontSize);const min=el.classList.contains("tt")?9:Math.max(9,z*.5);
  const box=el.clientWidth?el:el.parentElement;let g=40;while(el.scrollWidth>el.clientWidth+1&&z>min&&g--){z-=.5;el.style.fontSize=z+"px"}})}
["showEquip","showEquipCat"].forEach(n=>{const o=window[n];window[n]=function(){o.apply(this,arguments);fit1();document.fonts&&document.fonts.ready.then(fit1)}});
window.showIndex=function(){cur=null;curG=null;curE=null;app.innerHTML=homeHTML();bind();scrollTo(0,0)};
let _tSnap=null;const _tIdx=()=>{const m=location.hash.slice(1).match(/^t([1-8])$/);return m?+m[1]-1:-1};
app.addEventListener("focusin",e=>{const t=e.target,i=_tIdx();if(i<0||!(isAdmin&&editing)||!t.dataset||t.dataset.tr===undefined)return;_tSnap={i,s:JSON.stringify(TD[i].rows)}});
const flushT=()=>{if(!_tSnap)return;const sn=_tSnap;_tSnap=null;if(JSON.stringify(TD[sn.i].rows)!==sn.s)TCUndo.push("t"+sn.i,sn.s)};
app.addEventListener("focusout",e=>{const t=e.target;if(t.dataset&&t.dataset.tr!==undefined)flushT()});
const T_NUM=i=>i+1-(i>T_HIDE?1:0);
const T_FILLED=r=>!isDiv(r)&&r.some(c=>String(c).trim()&&c!==HR);
function showTraffic(){app.innerHTML=fileHero("cardTraffic")+`<h2 class="t hb">${backLink("#")}<span>${tr("trafficTable")}</span></h2><div class="tg">${T_SECS().map((s,i)=>i===T_HIDE?"":`<a href="#t${i+1}"><b class="sn">${T_NUM(i)}</b><b class="cnt2">${TD[i].rows.filter(T_FILLED).length}</b><img src="${T_IMG[i]}" alt="" loading="lazy" draggable="false"><span>${s[0]}</span></a>`).join("")}</div>`}
/* الهيكل الموحد لبطاقة المخالفة (العرض العادي + البحث): العنوان · طبيعة المخالفات · المنصوصة · الإجراءات */
const tClean=v=>String(v==null?"":v).replace(/(^|\s)(?:\+↑|[+×✕✖─])(?=\s|$)/g,"$1").replace(/\s{2,}/g," ").trim();
const tCol=c=>TC_PARSE(c).map(it=>tClean(it.t));
const tLn=c=>tCol(c).filter(x=>x&&x!==HR);
function tInfo(r){const A=tCol(r[2]),L=tCol(r[3]),P=tCol(r[4]),C=tCol(r[5]),N=Math.max(A.length,L.length,P.length,C.length),vs=[];
 for(let k=0;k<N;k++){const v={t:A[k]||"",law:L[k]||"",pen:P[k]||"",act:C[k]||""};if(v.t||v.law||v.pen||v.act)vs.push(v)}
 return{num:tLn(r[0]).join(" "),nm:tLn(r[1]).join(" · "),vs,key:String(r[1]||r[2]||"").trim()}}
/* تعبئة تلقائية: أي خلية (منصوص عليها / معاقب عليها / الإجراءات) فارغة تأخذ قيمة أقرب مخالفة أعلاها، ولا تُعدَّل بيانات الجدول نفسها */
function tFillMap(rows){const M=new Map(),last={law:"",pen:"",act:""};
 rows.forEach(r=>{if(isDiv(r)){last.law=last.pen=last.act="";return}const x=tInfo(r);
  x.vs.forEach(v=>["law","pen","act"].forEach(f=>{if(v[f])last[f]=v[f];else if(last[f])v[f]=last[f]}));M.set(r,x)});return M}
/* قالب موحد: [الرقم]- التعيين: [..] ثم طبيعة المخالفات: 1- ... (منصوص عليها / معاقب عليها / الإجراءات لكل مخالفة) */
const tHead=(x,f)=>`${x.num?f(x.num)+"- ":""}${x.nm?f(x.nm):"//"}`;
const tViol=(x,f)=>{const fd=(lb,v)=>`<div class="tvf"><span class="mu">${lb}:</span> ${v?f(v):"//"}</div>`;
 return `<div class="tvh"><span class="mu">${tr("natureViol")}:</span></div>`+(x.vs.length?x.vs.map((v,k)=>`<div class="tv"><div class="tvt">${k+1}- ${v.t?f(v.t):"//"}</div>${fd(T_COLS()[3],v.law)}${fd(T_COLS()[4],v.pen)}${fd(T_COLS()[5],v.act)}</div>`).join(""):`<div class="tv">//</div>`)};
const tKey=r=>String(r[0]||"").trim()||String(r[1]||r[2]||"").trim();
const tTitle=r=>{const n=TC_TXT(r[0]).replace(/\n/g," "),m=TC_TXT(r[2]||r[1]).split("\n")[0];const s=(n?n+"- ":"")+m;return (pref&&pref.lang==="en"&&typeof tx==="function")?window.tx(s):s};
function tCards(i){return TC_CARDS(TD[i].rows,{k:ri=>"t"+i+"-"+ri,id:r=>TC_NID("t",i,r),title:tTitle,key:r=>tKey(r)?"t|"+i+"|"+tKey(r):"",f:[[T_COLS()[1],1],[T_COLS()[2],2],[T_COLS()[3],3],[T_COLS()[4],4],[T_COLS()[5],5]]})}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-tview]");if(!b)return;const m=location.hash.slice(1).match(/^t([1-8])$/);if(!m)return;pref.view=b.dataset.tview;W("tc_pref",pref);showT(+m[1]-1)});
/* ترقيم ذكي: يكمل الرقم الأخير تلقائياً (12→13 ، 12-1→12-2 ، 12 أ→12 ب) */
const T_AB=["أ","ب","ج","د","هـ","و","ز","ح","ط","ي","ك","ل","م","ن"];
function tNext(rows){const live=rows.filter(r=>!isDiv(r));let last="";
 for(let k=live.length-1;k>=0;k--){const t=tCol(live[k][0]).find(x=>x&&x!==HR);if(t){last=t;break}}
 if(!last)return String(live.length+1);
 let m=last.match(/^(.*\d)(\s*[-.]?\s*)(أ|ب|ج|د|هـ|ه|و|ز|ح|ط|ي|ك|ل|م|ن|[a-zA-Z])$/);
 if(m){const L=m[3];let n=T_AB.indexOf(L==="ه"?"هـ":L);
  if(n>-1&&n<T_AB.length-1)return m[1]+m[2]+T_AB[n+1];
  if(/^[a-zA-Z]$/.test(L)&&L.toLowerCase()!=="z")return m[1]+m[2]+String.fromCharCode(L.charCodeAt(0)+1)}
 m=last.match(/^(.*?)(\d+)$/);if(m)return m[1]+(parseInt(m[2],10)+1);
 return String(live.length+1)}
/* جدول بسيط (وضع العرض): صف واحد لكل مخالفة، نص صافٍ بلا خطوط صفراء ولا تقسيم داخلي */
function tPlain(rows,i){return rows.filter(T_FILLED).map(r=>{const key=String(r[1]||r[2]||"").trim();
 return `<tr>${[0,1,2,3,4,5].map(c=>`<td>${esc(tCol(r[c]).filter(t=>t&&t!==HR).join("\n"))}</td>`).join("")}<td class="sc">${key?xfBtn("t|"+i+"|"+key):""}</td></tr>`}).join("")}
function showT(i){const ce=!!(isAdmin&&editing),tbl=ce||pref.view==="table";
 /* ترجمة صفوف هذا القسم عند الإنجليزية */
 if(pref.lang==="en"&&typeof window.txEnsure==="function"&&!showT._busy){const list=[];(TD[i].rows||[]).forEach(r=>(r||[]).forEach(c=>{if(c)list.push(String(c))}));if(TD[i].note)list.push(String(TD[i].note));
  if(list.length){showT._busy=1;window.txEnsure(list).then(()=>{showT._busy=0;if(location.hash==="#t"+(i+1)){showT._drawn=showT._drawn||{};if(!showT._drawn[i]){showT._drawn[i]=1;showT(i)}}}).catch(()=>{showT._busy=0})}}
TD[i].rows=TD[i].rows.filter(r=>!isDiv(r));const d=TD[i];
 const noteBox=(ce||(d.note||"").trim())?`<details class="note-box note-fold" id="tnotefold"><summary><span class="nf-dot" aria-hidden="true"></span><span class="nf-t">${tr("noteImportant")}</span><span class="nf-ar" aria-hidden="true">▾</span></summary><label>${ce?tr("noteLabelEdit"):tr("noteLabel")}</label><textarea id="tnote" ${ce?"":"readonly"} placeholder="${tr("notePh")}">${esc(d.note||"")}</textarea></details>`:"";
 app.innerHTML=`<div class="sec"><h3>${backLink("#traffic")}<span class="n">${T_NUM(i)}</span>${T_SECS()[i][0]}</h3><p class="lead">${T_SECS()[i][1]}</p>${noteBox}${ce?"":TC_SEG("data-tview",tbl)}${tbl?"":tCards(i)}${tbl&&ce?TC_CTL("tadd","tundo","t"+i):""}${tbl?`<p class="hint" id="hint">↔ ${tr("scroll")}</p><div class="wrap" style="margin-top:6px"><table class="d tt" style="min-width:900px"><thead><tr>${T_COLS().map(c=>`<th>${c}</th>`).join("")}${ce?'<th class="sc">حذف</th>':'<th class="sc">★</th>'}</tr></thead><tbody>${TC_PLAIN(d.rows,6,{p:"t",edit:ce,id:r=>TC_NID("t",i,r),sc:(r,ri)=>ce?`<button class="btn" data-tdel="${ri}" title="حذف" aria-label="حذف">×</button>`:TC_STAR(tKey(r)?"t|"+i+"|"+tKey(r):"")})}</tbody></table></div>`:""}</div>`;
 chkHint();alignHR();
 const nb=$("tnote");if(nb){const grow=()=>{nb.style.height="auto";nb.style.height=nb.scrollHeight+"px"};grow();nb.addEventListener("input",grow);addEventListener("resize",grow,{once:true});document.fonts&&document.fonts.ready.then(grow);const nf=$("tnotefold");if(nf)nf.addEventListener("toggle",()=>{if(nf.open)grow()})}
 if(!ce)return;
 $("tnote").oninput=e=>{TD[i].note=e.target.value;saveT()};
 $("tadd").onclick=()=>{flushT();TCUndo.push("t"+i,JSON.stringify(TD[i].rows));TD[i].rows.push([tNext(TD[i].rows),"","","","",""]);saveT(true);showT(i)};
 $("tundo").onclick=()=>{flushT();const sn=TCUndo.pop("t"+i);if(sn===undefined){toast("لا يوجد ما يُتراجع عنه");return}TCUndo.pushR("t"+i,JSON.stringify(TD[i].rows));TD[i].rows=JSON.parse(sn);saveT(true);showT(i);toast("تم التراجع")};
 $("tredo").onclick=()=>{flushT();const sn=TCUndo.popR("t"+i);if(sn===undefined){toast("لا يوجد ما يُعاد");return}TCUndo.pushU("t"+i,JSON.stringify(TD[i].rows));TD[i].rows=JSON.parse(sn);saveT(true);showT(i);toast("تمت الإعادة")}}
/* تعديل جداول المرور: تفويض الأحداث (يقرأ دائماً TD الحالي) */
function tOp(i,op,r,c,k){flushT();const rows=TD[i].rows;TCUndo.push("t"+i,JSON.stringify(rows));const R=TC_OP(rows[r][c],op,k);rows[r][c]=R.v;saveT(true);showT(i);if(R.f>=0)TC_FOCUS(app,`[data-tr="${r}"][data-tc="${c}"][data-l="${R.f}"]`)}
app.addEventListener("input",e=>{const t=e.target,i=_tIdx();if(i<0||!(isAdmin&&editing)||!t.dataset||t.dataset.tr===undefined)return;
 TD[i].rows[+t.dataset.tr][+t.dataset.tc]=t.dataset.l!==undefined?TC_SETLINE(TD[i].rows[+t.dataset.tr][+t.dataset.tc],+t.dataset.l,t.textContent):t.textContent;saveT()});
app.addEventListener("keydown",e=>{const t=e.target,i=_tIdx();if(e.key!=="Enter"||i<0||!(isAdmin&&editing)||!t.dataset||t.dataset.l===undefined||t.dataset.tr===undefined)return;e.preventDefault();tOp(i,"p",+t.dataset.tr,+t.dataset.tc,+t.dataset.l)});
app.addEventListener("click",e=>{const i=_tIdx();if(i<0||!(isAdmin&&editing))return;const rb=e.target.closest&&e.target.closest("[data-reset]");
 if(rb&&rb.dataset.reset==="t"+i){if(!confirm("سيتم حذف كل صفوف هذا الجدول فقط (باقي البطاقات لا تتأثر). متابعة؟"))return;flushT();TCUndo.push("t"+i,JSON.stringify(TD[i].rows));TD[i].rows=[["1","","","","",""]];saveT(true);showT(i);toast("تمت إعادة ضبط الجدول");return}
 const b=e.target.closest&&e.target.closest("[data-tdel],[data-tlop]");if(!b)return;
 if(b.dataset.tdel!==undefined){flushT();TCUndo.push("t"+i,JSON.stringify(TD[i].rows));TD[i].rows.splice(+b.dataset.tdel,1);saveT(true);showT(i);return}
 if(b.dataset.tlop!==undefined){const[op,r,c,k]=b.dataset.tlop.split("|");tOp(i,op,+r,+c,+k)}});
function showSigns(){ALL.length=0;let ix=0;const g=(t,a,c)=>`<div class="sgh"><b class="sn">${++ix}</b>${t}<b class="cnt2">${a.length}</b></div><div class="sgg">${sg(a,c)}</div>`;
 app.innerHTML=`<h2 class="t hb">${backLink("#")}<span>${tr("signsTitle")}</span></h2>${g(tr("sgDanger"),S.danger,tr("sgTagDanger"))}${g(tr("sgProhibit"),S.prohibit,tr("sgTagProhibit"))}${g(tr("sgPriority"),S.priority,tr("sgTagPriority"))}${g(tr("sgForce"),S.force,tr("sgTagForce"))}${g(tr("sgGuide"),S.guide,tr("sgTagGuide"))}<div class="sgh"><b class="sn">6</b>${tr("sgLightGround")}<b class="cnt2">${S.light.length+S.ground.length}</b></div><p class="mu">${tr("sgLight")}</p><div class="sgg">${sg(S.light,tr("sgTagLight"))}</div><p class="mu">${tr("sgGround")}</p><div class="sgg">${sg(S.ground,tr("sgTagGround"))}</div>`;
 if(pref.lang==="en"&&typeof txEnsure==="function"&&!showSigns._txing){showSigns._txing=1;const list=[];Object.keys(DESC).forEach(k=>{list.push(k);list.push(DESC[k])});Object.keys(S).forEach(k=>(S[k]||[]).forEach(x=>list.push(x[0])));
  txEnsure(list).then(()=>{showSigns._txing=0;if(location.hash==="#signs"&&pref.lang==="en"){const once=showSigns._done;showSigns._done=1;if(!once)showSigns()}}).catch(()=>{showSigns._txing=0})}
}
const CATN={danger:"خطر",prohibit:"منع",priority:"أولوية",force:"إجبار",guide:"إرشاد",light:"ضوئية",ground:"أرضية"};ALL.length=0;Object.keys(CATN).forEach(k=>sg(S[k],CATN[k]));
/* ===== الإشعارات: شارة حمراء على الجرس + تمييز البطاقات الجديدة (غير المفتوحة) ===== */
const SEEN_K="tc_seen";
const seenSet=(()=>{let a=[];try{a=JSON.parse(localStorage.getItem(SEEN_K))||[]}catch(_){}return new Set(a)})();
const saveSeen=()=>{try{localStorage.setItem(SEEN_K,JSON.stringify([...seenSet]))}catch(_){}};
const nInit=k=>{try{return localStorage.getItem("tc_seen_init_"+k)==="1"}catch(_){return false}};
const nid=(kind,i,r)=>kind==="s"?"s"+i+"|"+TC_TXT(r[0]).replace(/\s+/g," ").slice(0,80):"t"+i+"|"+tKey(r)+"|"+TC_TXT(r[2]).replace(/\s+/g," ").slice(0,40);
window.TC_NID=nid;
function nRows(kind){const out=[];
 if(kind==="s")data.forEach((s,i)=>s.rows.forEach((r,ri)=>{if(isDiv(r)||!String(r[0]||"").trim())return;out.push({id:nid("s",i,r),kind:"s",i,ri,g:"s"+i,gt:short(i)||s.title,t:TC_TXT(r[0]).replace(/\n/g," ")})}));
 else TD.forEach((s,i)=>{if(i===T_HIDE)return;s.rows.forEach((r,ri)=>{if(!T_FILLED(r))return;out.push({id:nid("t",i,r),kind:"t",i,ri,g:"t"+i,gt:T_SECS()[i][0],t:tTitle(r)})})});
 return out}
/* أول مزامنة للجهاز = خط الأساس (لا تُعدّ الموجود قديماً جديداً) */
function nBase(kind){if(nInit(kind))return;nRows(kind).forEach(x=>seenSet.add(x.id));saveSeen();try{localStorage.setItem("tc_seen_init_"+kind,"1")}catch(_){}}
const newList=()=>isAdm()?[]:[...(nInit("s")?nRows("s"):[]),...(nInit("t")?nRows("t"):[])].filter(x=>!seenSet.has(x.id));
window.TC_ISNEW=id=>!!id&&!isAdm()&&nInit(id[0])&&!seenSet.has(id);
function replyNotifs(){try{const a=JSON.parse(localStorage.getItem("tc_myrep")||"[]");const seen=+(localStorage.getItem("tc_myrep_seen")||0);return (Array.isArray(a)?a:[]).filter(x=>x.reply&&(x.rat||0)>seen)}catch(_){return[]}}
function updBadge(){const nV=newList().length,nR=replyNotifs().length,n=nV+nR,el=$("nb");if(!el)return;const tx=n>99?"99+":String(n);
 if(!n){el.hidden=true;return}
 const ch=el.textContent!==tx||el.hidden;el.textContent=tx;el.hidden=false;if(ch){el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop")}
 const bb=$("bb");if(bb)bb.setAttribute("aria-label",tr("notifsTitle")+" — "+n)}
function markSeen(id){if(!id||seenSet.has(id))return;seenSet.add(id);saveSeen();updBadge()}
document.addEventListener("toggle",e=>{const d=e.target;if(d&&d.matches&&d.matches("details.vc[data-nid]")&&d.open){markSeen(d.dataset.nid);d.classList.remove("is-new")}},true);
document.addEventListener("click",e=>{const r=e.target.closest&&e.target.closest("tr[data-nid]");if(r&&!e.target.closest("[data-xf]")){markSeen(r.dataset.nid);r.classList.remove("is-new")}});
function showNotifs(){app.className="";setNav("");$("home").style.display="none";scrollTo(0,0);
 const L=newList(),R=replyNotifs(),G=new Map();L.forEach(x=>{if(!G.has(x.g))G.set(x.g,{t:x.gt,items:[]});G.get(x.g).items.push(x)});
 let h=`<div class="sec"><h3>${backLink("#")}<span>${AI("bell")} ${tr("notifsTitle")}</span></h3>`;
 if(R.length){h+=`<div class="ngrp nrep"><div class="nghd"><span>${AI("reply")} ${tr("notifsReplyTitle")}</span><span class="nbadge inl">${R.length}</span></div>`;
  R.forEach(x=>{h+=`<div class="nrow nreply"><div class="nrt"><b>${tr("notifsReplyLead")}</b><small class="mu">${dtTxt(x.rat||x.at||0)}</small></div><p class="mu">${esc(String(x.msg||"").slice(0,100))}</p><div class="rrep"><b>${tr("repAdminReply")}</b><p>${esc(x.reply||"")}</p></div></div>`});
  h+=`</div>`}
 if(!L.length&&!R.length)h+=`<p class="empty">${tr("notifsEmpty")}</p>`;
 if(L.length){h+=`<p class="lead">${L.length} ${tr("notifsLead")}</p><div class="bar"><button class="btn" id="nclr" type="button">${AI("check")} ${tr("notifsMarkAll")}</button></div>`;
  G.forEach(g=>{h+=`<div class="ngrp"><div class="nghd"><span>${esc(g.t)}</span><span class="nbadge inl">${g.items.length}</span></div>`+g.items.map(x=>`<a class="nrow" href="${x.kind==="t"?"#t"+(x.i+1):"#s"+(x.i+1)}" data-open="${x.kind}|${x.i}|${x.ri}"><span class="nd" aria-hidden="true"></span><span>${esc(x.t||"—")}</span></a>`).join("")+`</div>`})}
 app.innerHTML=h+"</div>";
 /* عند فتح قائمة الجرس: علّم ردود المشرف كمقروءة */
 if(R.length){const mx=Math.max(0,...R.map(x=>x.rat||0),LS("tc_myrep_seen",0));LW("tc_myrep_seen",mx);updBadge()}
 const c=$("nclr");if(c)c.onclick=()=>{newList().forEach(x=>seenSet.add(x.id));saveSeen();updBadge();showNotifs()}}
{const ar=window.applyRemote;window.applyRemote=l=>{ar(l);nBase("s");updBadge();if(location.hash==="#notifs")showNotifs()}}
{const at=window.applyTraffic;window.applyTraffic=x=>{at(x);nBase("t");updBadge();if(location.hash==="#notifs")showNotifs()}}
{const bb=$("bb");if(bb)bb.onclick=()=>{location.hash="#notifs"}}
/* ===== لوحة الإدارة: الأجهزة / سجل العمليات / بلاغات المستخدمين ===== */
const LS=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(_){return d}},LW=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const fmtDev=v=>{v=String(v||"").replace(/\D/g,"");return v.length===8?v.slice(0,4)+"-"+v.slice(4):v};
const agoTxt=ms=>{const s=Math.max(0,Math.round((Date.now()-ms)/1000));if(s<60)return tr("agoNow");if(s<3600)return tr("agoMin")+Math.floor(s/60)+tr("agoMinU");if(s<86400)return tr("agoHour")+Math.floor(s/3600)+tr("agoHourU");return tr("agoDay")+Math.floor(s/86400)+tr("agoDayU")};
const dtTxt=ms=>{try{return new Date(ms).toLocaleString(pref.lang==="en"?"en":"ar",{dateStyle:"short",timeStyle:"short"})}catch(_){return new Date(ms).toLocaleString()}};
function uaInfo(u){u=String(u||"");const os=/Android/i.test(u)?"Android":/iPhone|iPad|iPod/i.test(u)?"iOS":/Windows/i.test(u)?"Windows":/Mac OS|Macintosh/i.test(u)?"macOS":/Linux/i.test(u)?"Linux":tr("deviceOs");
 const br=/Edg\//.test(u)?"Edge":/OPR\/|Opera/.test(u)?"Opera":/Firefox\//.test(u)?"Firefox":/Chrome\//.test(u)?"Chrome":/Safari\//.test(u)?"Safari":"";return{os,br}}
document.addEventListener("click",e=>{const c=e.target.closest&&e.target.closest("[data-copy]");if(!c)return;e.preventDefault();e.stopPropagation();
 const t=c.dataset.copy;const done=()=>{toast(tr("copied")+fmtDev(t));c.classList.add("ok");setTimeout(()=>c.classList.remove("ok"),1200)};
 try{navigator.clipboard.writeText(t).then(done,()=>toast(t))}catch(_){toast(t)}},true);

/* --- الأجهزة --- */
function renderDevices(list,tid,emptyKey){const el=$(tid||"stD");if(!el)return;
 if(!list.length){el.innerHTML=`<p class="empty">${tr(emptyKey||"devEmpty")}</p>`;return}
 const banned=window._banned||{};
 el.innerHTML=list.map(x=>{const ago=Math.round((Date.now()-x.ts)/1000),on=ago<150,u=uaInfo(x.ua);
  let id=String(x.dev||x.id||"").replace(/\D/g,"");
  if(!id&&x.id){const raw=String(x.id).replace(/\D/g,"");if(raw.length>=8)id=raw.slice(0,8)}
  x.admin=!!(id&&window._admDev&&id===String(window._admDev).replace(/\D/g,""));
  const isBan=!!(id&&banned[id]);
  const banBtn=id?`<button class="btn ban-btn${isBan?" unban":""}" type="button" data-ban="${id}" data-banned="${isBan?1:0}" title="${isBan?tr("unban"):tr("ban")}" aria-label="${isBan?tr("unban"):tr("ban")}">${isBan?AI("unban"):AI("ban")}</button>`:"";
  const idBlock=id
   ?`<b dir="ltr"${x.admin?' class="nf"':""}>${fmtDev(id)}</b>${x.admin?`<span class="admtag">${tr("adminTag")}</span>`:""}<span class="cpslot">${banBtn}${x.admin?"":`<button class="btn cp" type="button" data-copy="${id}" aria-label="${tr("copy")}">${AI("copy")} ${tr("copy")}</button>`}</span>`
   :`<b dir="ltr" class="mu">— <small>(${esc(String(x.id||"").slice(0,8))}…)</small></b>`;
  return `<div class="dvc${isBan?" banned":""}"><div class="dvh"><span class="dot ${on?"on":"off"}"></span><b>${on?tr("devOnlineNow"):tr("devInactive")}</b><small class="mu">${agoTxt(x.ts)} · ${dtTxt(x.ts)}</small></div>
  <div class="dvid"><span class="mu">${tr("devIdLabel")}</span>${idBlock}</div>
  <div class="dvm"><span>${AI("device")} ${esc(u.os)}${u.br?" · "+esc(u.br):""}</span>${x.lang?`<span>${AI("globe")} ${esc(String(x.lang).toUpperCase())}</span>`:""}${isBan?`<span class="ban-tag">${tr("ban")}</span>`:""}</div></div>`}).join("")}

/* --- سجل العمليات: مختصر + تبويبات (أسبوعي / شهري / سنوي) --- */
const OPT=()=>[["w",tr("opsWeek"),7],["m",tr("opsMonth"),30],["y",tr("opsYear"),365]];let opsTab="w",opsLim=8;
function opText(a){a=String(a||"—");let m=a.match(/^broadcast:(.*?)(?:→(\d{8}))?$/);if(m)return{i:"megaphone",t:m[2]?tr("opBroadcastTo")+fmtDev(m[2])+(m[1]?" ("+m[1]+")":""):tr("opBroadcast")+(m[1]?" ("+m[1]+")":"")};if(/^reply:/.test(a))return{i:"reply",t:tr("opReply")};return{i:"history",t:a}}
function renderOps(ops){const el=$("stO");if(!el)return;window._ops=ops;const _OPT=OPT();
 const now=Date.now(),days=_OPT.find(t=>t[0]===opsTab)[2],cut=now-days*864e5;
 const L=ops.map(x=>({a:x.a,ms:Date.parse(x.t)||0})).filter(x=>x.ms>=cut).sort((p,q)=>q.ms-p.ms);
 const tabs=_OPT.map(t=>{const n=ops.filter(x=>(Date.parse(x.t)||0)>=now-t[2]*864e5).length;return `<button type="button" class="${opsTab===t[0]?"on":""}" data-optab="${t[0]}">${t[1]} <small>${n}</small></button>`}).join("");
 let body="";
 if(!L.length)body=`<p class="empty">${tr("opsEmpty")}</p>`;
 else if(opsTab==="y"){const g={};L.forEach(x=>{const d=new Date(x.ms),k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");g[k]=(g[k]||0)+1});
  body=Object.keys(g).sort().reverse().map(k=>{const[yy,mm]=k.split("-");let n;try{n=new Date(+yy,+mm-1,1).toLocaleDateString(pref.lang==="en"?"en":"ar",{month:"long",year:"numeric"})}catch(_){n=k}return `<div class="opm"><span>${esc(n)}</span><b>${g[k]}</b></div>`}).join("")}
 else{let last="",h="";L.slice(0,opsLim).forEach(x=>{const d=new Date(x.ms),dk=d.toDateString();if(dk!==last){last=dk;let dl;try{dl=d.toLocaleDateString(pref.lang==="en"?"en":"ar",{weekday:"short",day:"numeric",month:"short"})}catch(_){dl=dk}h+=`<div class="opd">${esc(dl)}</div>`}
   h+=`<div class="opr"><span class="opt">${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}</span><span>${(o=>AI(o.i)+" "+esc(o.t))(opText(x.a))}</span></div>`});
  body=h+(L.length>opsLim?`<div class="bar" style="justify-content:center"><button class="btn" type="button" data-opsmore="1">${tr("opsMore")} (${L.length-opsLim})</button></div>`:"")}
 el.innerHTML=`<div class="optabs" role="tablist">${tabs}</div><div class="ops">${body}</div>`}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-optab],[data-opsmore]");if(!t)return;e.stopPropagation();
 if(t.dataset.optab){opsTab=t.dataset.optab;opsLim=8}else opsLim+=10;renderOps(window._ops||[])},true);

/* --- بلاغات المستخدمين: حالات + رد المشرف --- */
const RST=()=>[["new",tr("repNew")],["reviewed",tr("repReviewed")],["replied",tr("repReplied")]];let repTab="new";const repOpen=new Set(),repDraft={};
const RTPL=["تم استلام بلاغكم وجارٍ دراسته. شكراً لتعاونكم.","تمت معالجة الملاحظة المذكورة في التحديث القادم. شكراً لتبليغكم.","نرجو تزويدنا بمزيد من التفاصيل (القسم، رقم المخالفة، لقطة شاشة) لنتمكن من المساعدة."];
function renderReports(list){const el=$("stR");if(!el)return;window._reps=list;
 const ae=document.activeElement;if(ae&&ae.tagName==="TEXTAREA"&&el.contains(ae)){window._repPend=true;return}window._repPend=false;
 const cnt={new:0,reviewed:0,replied:0};list.forEach(r=>{cnt[r.status]=(cnt[r.status]||0)+1});
 const _RST=RST();
 const tabs=_RST.map(t=>`<button type="button" class="${repTab===t[0]?"on":""}" data-rtab="${t[0]}">${t[1]} <small>${cnt[t[0]]||0}</small></button>`).join("");
 const L=list.filter(r=>r.status===repTab);
 const card=r=>{const id=esc(r.id),open=repOpen.has(r.id);
  return `<div class="rep rcard" data-rid="${id}"><div class="rh"><b>${esc(r.name||"—")}</b><span class="mu">${dtTxt(r.at||0)}</span></div>
  ${r.dev?`<div class="rdev">${tr("devIdLabel")}: <b dir="ltr">${fmtDev(r.dev)}</b> <button class="btn cp" type="button" data-copy="${esc(String(r.dev).replace(/\D/g,""))}" aria-label="${tr("copy")}">${AI("copy")}</button></div>`:""}
  <p>${esc(r.msg||"")}</p>
  ${r.reply?`<div class="rrep"><b>${tr("repAdminReply")}</b> <small class="mu">${dtTxt(r.repliedAt||0)}</small><p>${esc(r.reply)}</p></div>`:""}
  <div class="bar">${r.status==="new"?`<button class="btn" type="button" data-rmark="${id}">${tr("repMark")}</button>`:""}<button class="btn primary" type="button" data-rrep="${id}">${r.reply?AI("edit")+" "+tr("repEditReply"):AI("reply")+" "+tr("repReply")}</button></div>
  <div class="rbox" ${open?"":"hidden"}><div class="rtpl">${RTPL.map((t,i)=>`<button type="button" class="chip" data-rtpl="${i}" data-for="${id}">${esc(t.slice(0,26))}…</button>`).join("")}</div>
  <textarea data-rtxt="${id}" rows="3" placeholder="${tr("repReplyPh")}">${esc(repDraft[r.id]!=null?repDraft[r.id]:(r.reply||""))}</textarea>
  <div class="bar"><button class="btn primary" type="button" data-rsend="${id}">${AI("check")} ${tr("repSendReply")}</button><button class="btn" type="button" data-rrep="${id}">${tr("repCancel")}</button></div></div></div>`};
 el.innerHTML=`<div class="optabs" role="tablist">${tabs}</div>`+(L.length?L.map(card).join(""):`<p class="empty">${tr("repEmpty")}</p>`)}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-rtab],[data-rrep],[data-rtpl],[data-rsend]");if(!t)return;e.stopPropagation();
 if(t.dataset.rtab){repTab=t.dataset.rtab;renderReports(window._reps||[]);return}
 if(t.dataset.rrep){const id=t.dataset.rrep;repOpen.has(id)?repOpen.delete(id):repOpen.add(id);window._repPend=false;renderReports(window._reps||[]);return}
 if(t.dataset.rtpl!=null){const id=t.dataset.for,ta=document.querySelector(`textarea[data-rtxt="${CSS.escape(id)}"]`);if(ta){ta.value=RTPL[+t.dataset.rtpl];repDraft[id]=ta.value;ta.focus()}return}
 if(t.dataset.rsend){const id=t.dataset.rsend,ta=document.querySelector(`textarea[data-rtxt="${CSS.escape(id)}"]`),txt=ta?ta.value.trim():"";
  if(!txt){toast(tr("repWriteFirst"));return}
  if(!window.cloud||!window.cloud.replyReport){toast(tr("repConnecting"));return}
  t.disabled=true;window.cloud.replyReport(id,txt).then(()=>{delete repDraft[id];repOpen.delete(id);repTab="replied";toast(tr("repSentOk"));if(window.cloud.logOp)window.cloud.logOp("reply:"+id.slice(0,6))}).catch(()=>{toast(tr("repSendFail"));t.disabled=false})}},true);
document.addEventListener("input",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.rtxt!=null)repDraft[t.dataset.rtxt]=t.value});
document.addEventListener("focusout",e=>{if(e.target&&e.target.dataset&&e.target.dataset.rtxt!=null)setTimeout(()=>{if(window._repPend)renderReports(window._reps||[])},400)});

/* --- شارات الأيقونات الثلاث + شارة تبويب الإعدادات --- */
function setB(id,n,pulse){const b=$(id);if(!b)return;if(!n){b.hidden=true;return}const t=n>99?"99+":String(n),ch=b.hidden||b.textContent!==t;b.textContent=t;b.hidden=false;if(ch&&pulse){b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop")}}
function updAdmBadges(o){
 const devs=(o.devices||[]).map(x=>String(x.dev||x.id));let known=LS("tc_adm_dev",null);if(known===null){known=devs;LW("tc_adm_dev",known)}
 const nD=devs.filter(x=>!known.includes(x)).length;
 const ops=(o.ops||[]).map(x=>Date.parse(x.t)||0);let ots=LS("tc_adm_ops",null);if(ots===null){ots=Date.now();LW("tc_adm_ops",ots)}
 const nO=ops.filter(x=>x>ots).length;
 const nR=(o.reports||[]).filter(r=>r.status==="new").length;
 setB("bD",nD,1);setB("bO",nO,1);setB("bR",nR,1);
 const rn=$("rN");if(rn){const prev=window._prevNewRep;rn.hidden=!nR;if(prev!=null&&nR>prev)toast(tr("newReportToast"));window._prevNewRep=nR}
 const tot=nD+nO+nR,st=document.querySelector('#nav a[data-h="settings"]');
 if(st){let b=st.querySelector(".nbadge");if(!b){b=document.createElement("span");b.className="nbadge";st.style.position="relative";st.appendChild(b)}b.hidden=!tot;b.textContent=tot>99?"99+":tot}}
function clearOn(id,fn){const d=$(id);if(d&&!d._cb){d._cb=1;d.addEventListener("toggle",()=>{if(d.open){fn();const o=window._lastStats;if(o)updAdmBadges(o)}})}}
window.showStats=o=>{window._lastStats=o;window._admDev=o.admDev||"";window._banned=o.banned||window._banned||{};const A=$("stA"),T=$("stT");if(A)A.textContent=o.active;if(T)T.textContent=o.users;
 renderDevices(o.devices||[]);renderDevices(o.offline||[],"stF","devOffEmpty");const bf=$("bF");if(bf){bf.hidden=!(o.offline||[]).length;bf.textContent=(o.offline||[]).length;bf.classList.remove("adm-b")}renderOps(o.ops||[]);renderReports(o.reports||[]);
 clearOn("dvD",()=>LW("tc_adm_dev",(window._lastStats.devices||[]).map(x=>String(x.dev||x.id))));
 clearOn("dvO",()=>LW("tc_adm_ops",Date.now()));
 updAdmBadges(o)};
{const sa=window.setAdmin;window.setAdmin=function(v){sa.apply(this,arguments);if(!v){const b=document.querySelector('#nav a[data-h="settings"] .nbadge');if(b)b.hidden=true}}}

/* --- حظر / فك حظر الأجهزة --- */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ban]");if(!b||!isAdmin)return;e.preventDefault();e.stopPropagation();
 const id=String(b.dataset.ban||"").replace(/\D/g,"");if(!id||id.length!==8)return;
 const was=b.dataset.banned==="1";
 if(!confirm(was?tr("unbanConfirm"):tr("banConfirm")))return;
 b.disabled=true;
 const go=was?(window.cloud&&window.cloud.unbanDevice):(window.cloud&&window.cloud.banDevice);
 if(!go){toast(tr("banFail"));b.disabled=false;return}
 go(id).then(()=>{
  window._banned=window._banned||{};
  if(was)delete window._banned[id];else window._banned[id]=1;
  if(window.cloud&&window.cloud.logOp)window.cloud.logOp((was?"unban:":"ban:")+id);
  toast(was?tr("unbanOk"):tr("banOk"));
  const o=window._lastStats;if(o){o.banned=window._banned;window.showStats(o)}
 }).catch(()=>{toast(tr("banFail"));b.disabled=false})},true);

/* --- تنبيه إنهاء الجلسة عند الدخول من جهاز آخر --- */
window.onAdminKicked=function(){let m=document.getElementById("kickm");if(!m){m=document.createElement("div");m.id="kickm";m.className="kick-m";document.body.appendChild(m)}
 m.dir=pref.lang==="en"?"ltr":"rtl";m.style.display="flex";
 m.innerHTML=`<div class="dsc-card kick-c" role="alertdialog" aria-modal="true"><div class="kick-i">${AI("warn")}</div><h3>${tr("kickTitle")}</h3><p>${tr("kickBody")}</p><p class="mu">${tr("kickHint")}</p><div class="bar" style="justify-content:center"><button class="btn primary" type="button" id="kickok">${tr("kickOk")}</button></div></div>`;
 document.getElementById("kickok").onclick=()=>{m.style.display="none"}};
/* --- بلاغاتي (للمستخدم): تأكيد الوصول + ردّ المشرف --- */
const MYK="tc_myrep";
window.addMyReport=r=>{const a=LS(MYK,[]);a.unshift({id:r.id,msg:String(r.msg||"").slice(0,120),at:r.at||Date.now(),st:"new"});LW(MYK,a.slice(0,30))};
const STX={new:["وصل إلى المشرف","st-new","check"],reviewed:["تمت مراجعته","st-rev","eye"],replied:["تم الرد","st-rep","reply"]};
async function refreshMine(){const a=LS(MYK,[]);if(!a.length||!window.cloud||!window.cloud.getReports)return a;
 try{const res=await window.cloud.getReports(a.map(x=>x.id));res.forEach(r=>{const x=a.find(y=>y.id===r.id);if(x){x.st=r.status;x.reply=r.reply;x.rat=r.repliedAt}});LW(MYK,a)}catch(_){}return a}
window.renderMyReports=async function(){const box=$("myrep");if(!box)return;
 const draw=a=>{box.innerHTML=a.length?`<b>بلاغاتي</b>`+a.map(x=>{const s=STX[x.st]||STX.new;return `<div class="myr"><div class="myh"><span class="chip ${s[1]}">${AI(s[2])} ${s[0]}</span><small class="mu">${dtTxt(x.at)}</small></div><p>${esc(x.msg||"")}</p>${x.reply?`<div class="rrep"><b>ردّ المشرف</b><p>${esc(x.reply)}</p></div>`:""}</div>`}).join(""):"";box.hidden=!a.length};
 draw(LS(MYK,[]));const a=await refreshMine();draw(a);const seen=LS("tc_myrep_seen",0),mx=Math.max(0,...a.map(x=>x.rat||0));if(mx>seen)LW("tc_myrep_seen",mx)};
{const sh=window.showHelp;window.showHelp=function(){sh.apply(this,arguments);const d=document.createElement("div");d.className="report-box";d.id="myrep";d.hidden=true;app.appendChild(d);window.renderMyReports()}}
/* إشعار عند وصول ردّ جديد على بلاغ المستخدم */
(function chk(n){if(!LS(MYK,[]).length)return;if(!(window.cloud&&window.cloud.getReports)){if(n<20)setTimeout(()=>chk(n+1),1500);return}
 refreshMine().then(()=>{updBadge();if(location.hash==="#notifs")showNotifs()})})(0);
setInterval(()=>{if(LS(MYK,[]).length&&window.cloud&&window.cloud.getReports)refreshMine().then(()=>updBadge())},60000);
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("[data-open]");if(!a)return;e.preventDefault();
 const[k,i,ri]=a.dataset.open.split("|");pref.view="cards";W("tc_pref",pref);window._openCard=k==="t"?"t"+i+"-"+ri:i+"-"+ri;
 const h=k==="t"?"#t"+(+i+1):"#s"+(+i+1);if(location.hash===h)route();else location.hash=h});
function _applyOpen(){const k=window._openCard;if(!k)return;window._openCard=null;const d=app.querySelector(`details.vc[data-k="${k}"]`);if(!d)return;d.open=true;try{d.scrollIntoView({block:"center"})}catch(_){}}
const oldRoute=route;
const route2=function(){const h=location.hash.slice(1);let m;
 if(h==="notifs"){showNotifs();return}
 if(h==="transport"){app.className=editing?"edit":"";setNav("");window.showTransport();return}
 if(h==="traffic"||h==="signs"||(m=h.match(/^t([1-8])$/))){app.className=editing?"edit":"";setNav("");$("home").style.display="none";scrollTo(0,0);if(m&&+m[1]-1===T_HIDE){location.replace("#traffic");return}h==="traffic"?showTraffic():h==="signs"?showSigns():showT(m[1]-1);return}
 oldRoute()};
/* سهم الرجوع الموحّد في الهيدر: يظهر فقط داخل الصفحات الفرعية */
const SUBPAGE=/^(s\d+|g\d+|e\d+|t[1-8]|traffic|transport|signs|guide|equip|help|notifs)$/;
function syncBack(){const hb=$("home");if(!hb)return;const sub=canBack();
 hb.style.display=sub?"":"none";hb.setAttribute("aria-label",tr("back"));hb.setAttribute("title",tr("back"))}
/* ===== سجل التنقل الداخلي + دالة الرجوع الموحّدة (قانون تنسيق النقل وقانون المرور وبقية الصفحات) =====
   الرجوع خطوة واحدة: 1) إغلاق آخر بطاقة فتحها المستخدم  2) العودة للصفحة السابقة في السجل  3) المستوى الأعلى  4) الرئيسية */
const HS=[location.hash],CS=[];let _bk=false;
document.addEventListener("toggle",ev=>{const d=ev.target;if(!d||d.tagName!=="DETAILS"||!d.classList.contains("vc"))return;const i=CS.indexOf(d);
 if(d.open){if(i<0)CS.push(d)}else if(i>=0)CS.splice(i,1);syncBack()},true);
addEventListener("hashchange",()=>{const h=location.hash;CS.length=0;
 if(_bk){_bk=false;return}
 if(HS.length>1&&HS[HS.length-2]===h)HS.pop();            /* رجوع المتصفح/الجهاز */
 else if(HS[HS.length-1]!==h)HS.push(h);
 if(HS.length>60)HS.shift()});
const canBack=()=>!!(CS.length||HS.length>1&&location.hash.slice(1)!==""||SUBPAGE.test(location.hash.slice(1))||($("q")&&$("q").value.trim()));
function handleBack(){const q=$("q");
 if(window.TCOV&&TCOV.open()){history.back();return}
 if(q&&q.value.trim()){q.value="";route();return}
 while(CS.length){const d=CS.pop();if(d.isConnected&&d.open){d.open=false;syncBack();return}}
 const cur=location.hash;
 if(HS.length>1){HS.pop();const p=HS[HS.length-1];if(p!==cur){history.back();setTimeout(()=>{if(location.hash===cur){_bk=true;location.hash=p.replace(/^#/,"")}},300);return}}
 const a=app.querySelector(".sec>h3 .back,h2.t.hb .back"),href=a?a.getAttribute("href"):"#",nh=href&&href!=="#"?href.slice(1):"";
 if(cur.slice(1)===nh)route();else{HS.length=0;HS.push(nh?"#"+nh:"");location.hash=nh}}
window.handleBack=handleBack;
{const hb=$("home");if(hb)hb.onclick=handleBack}
window.route=function(){route2();_applyOpen();updBadge();syncBack()};
/* ===== زر الرجوع (Hardware/System) عبر History API =====
   كل طبقة مفتوحة (نافذة تسجيل الدخول، نافذة الإشارة، شريط البحث، بطاقة مفتوحة) تدفع حالة pushState؛
   وpopstate يغلق آخر طبقة. التنقل بين الأقسام/الإشعارات/الملف/الإعدادات/المفضلة يعتمد على سجل الـ hash الأصلي.
   إن لم تكن هناك طبقة مفتوحة يتصرف الرجوع طبيعياً (خطوة للخلف ثم الخروج من التطبيق). */
(function(){
  const sbar=$("sbar"),qq=$("q");
  const scan=()=>{const a=[];
    const dl=$("dlg");if(dl&&dl.open)a.push({k:"dlg",close:()=>{try{dl.close()}catch(_){}}});
    const sg=document.getElementById("sgm");if(sg&&sg.style.display==="flex")a.push({k:"sgm",close:()=>{sg.style.display="none"}});
    if(sbar&&sbar.classList.contains("on"))a.push({k:"sbar",close:()=>{sbar.classList.remove("on");if(qq)qq.value="";route()}});
    CS.forEach(d=>{if(d.isConnected&&d.open)a.push({k:d,close:()=>{d.open=false;syncBack()}})});
    return a};
  let stack=[],pushed=0,ign=false,sched=0;
  const sync=()=>{sched=0;const keys=scan().map(o=>o.k),before=stack.length;
    stack=stack.filter(k=>keys.includes(k));const removed=before-stack.length;
    keys.forEach(k=>{if(!stack.includes(k)){stack.push(k);try{history.pushState({tcov:1},"")}catch(_){}pushed++}});
    if(removed>0&&pushed>stack.length){const d=pushed-stack.length;pushed=stack.length;ign=true;setTimeout(()=>{ign=false},700);history.go(-d)}};
  const req=()=>{if(!sched){sched=1;setTimeout(sync,0)}};
  addEventListener("popstate",e=>{
    if(ign){ign=false;return}
    if(stack.length){const k=stack.pop();pushed=Math.max(0,pushed-1);const o=scan().find(x=>x.k===k);if(o)o.close();req();return}
    if(pushed===0&&e.state&&e.state.tcov)history.back()});   /* إدخال قديم تُرك بعد تغيّر الـ hash: تجاوزه */
  addEventListener("hashchange",()=>{stack=[];pushed=0;req()});
  new MutationObserver(req).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["style","class","open"]});
  document.addEventListener("toggle",req,true);document.addEventListener("close",req,true);
  window.TCOV={open:()=>stack.length>0,sync};
  req()})();
route();
})();

/* شريط علوي مدمج (سهم الرجوع + الأزرار الأربعة) عند النزول داخل الجدول، وشفافية 0.7 للأزرار */
(function(){
  const root=document.documentElement;let last=scrollY,tick=false;
  const H3=()=>app.querySelector(".sec>h3"),CTL=()=>app.querySelector(".bar.ed.tb-ctl");
  function mbarOn(h,ctl){if(ctl._pl)return;const cs=getComputedStyle(ctl),pl=document.createElement("div");pl.className="tb-pl";
    pl.style.height=ctl.offsetHeight+"px";pl.style.margin=cs.marginTop+" 0 "+cs.marginBottom;
    const mb=document.createElement("div");mb.className="mbar";mb.style.minHeight=h.offsetHeight+"px";
    ctl.parentNode.insertBefore(pl,ctl);mb.appendChild(ctl);
    ctl._pl=pl;ctl._mb=mb;h.style.visibility="hidden";app.appendChild(mb);dispatchEvent(new Event("tc-pin"))}
  function mbarOff(h,ctl){if(!ctl._pl)return;const pl=ctl._pl;pl.parentNode.insertBefore(ctl,pl);pl.remove();
    if(ctl._mb)ctl._mb.remove();ctl._pl=ctl._mb=null;if(h)h.style.visibility=""}
  const HD=document.querySelector("header");
  function hdrSync(){if(!HD||root.classList.contains("kb"))return;const hh=HD.offsetHeight;if(hh>0)root.style.setProperty("--hdrh",hh+"px")}
  hdrSync();addEventListener("load",hdrSync);if(window.ResizeObserver&&HD)new ResizeObserver(hdrSync).observe(HD);
  function upd(){tick=false;const y=scrollY,h=H3(),ctl=CTL(),d=y-last;
    root.classList.toggle("scrolled",y>30);
    if(h&&h.querySelector(".back")&&h.parentElement.querySelector("table.d,.vc")){
      if(ctl){
        const kb=root.classList.contains("kb");
        if(kb||(y>70&&d>4))mbarOn(h,ctl);
        else if((d<-4||y<=40)&&ctl._pl)mbarOff(h,ctl)}
    }
    if(!root.classList.contains("kb")){root.style.setProperty("--h3h",(h?h.offsetHeight:48)+"px");hdrSync()}
    last=y}
  addEventListener("scroll",()=>{if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});
  addEventListener("resize",()=>{if(!root.classList.contains("kb"))upd()});
  document.addEventListener("touchstart",e=>{const b=e.target.closest&&e.target.closest(".tb-ctl");if(!b)return;b.classList.add("touch");clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove("touch"),1800)},{passive:true});
  new MutationObserver(()=>{last=scrollY;setTimeout(upd,0)}).observe(app,{childList:true});
  upd();
  /* لوحة المفاتيح: تبقى الأزرار الأربعة ظاهرة في سطر واحد فوق الجدول، ويُخفى شريط التنقل السفلي بدل أن يرتفع فوق الكيبورد */
  const ed=t=>t&&t.closest&&t.closest("#app")&&t.matches&&t.matches("textarea,input,[contenteditable],[contenteditable] *");
  const vv=window.visualViewport;let kt=0;
  let kl=0;const kLoop=()=>{if(!root.classList.contains("kb")){kl=0;return}pin();kl=requestAnimationFrame(kLoop)};
  const kbSet=on=>{if(root.classList.contains("kb")===on)return;root.classList.toggle("kb",on);if(on&&!kl)kl=requestAnimationFrame(kLoop);setTimeout(upd,0)};
  const vvSync=()=>{if(!vv)return;root.style.setProperty("--vvt",Math.max(0,vv.offsetTop)+"px");
    if(vv.height<innerHeight*.78&&ed(document.activeElement))kbSet(true)};
  document.addEventListener("focusin",e=>{if(ed(e.target)){clearTimeout(kt);kbSet(true);vvSync()}});
  document.addEventListener("focusout",()=>{clearTimeout(kt);kt=setTimeout(()=>{if(!ed(document.activeElement))kbSet(false)},250)});
  /* زر الانتقال لأسفل الجدول */
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-scroll-bottom]");if(!b)return;e.preventDefault();
    const t=app.querySelector("table.d"),w=t&&t.closest(".wrap")||t;
    const y=w?w.getBoundingClientRect().bottom+scrollY-innerHeight+120:document.documentElement.scrollHeight;
    scrollTo({top:Math.max(0,Math.max(y,0)),behavior:"smooth"});
},true);
  /* تثبيت الشريط (position:fixed) بأبعاد visualViewport: أعلى المنطقة المرئية وبعرضها، بلا انزلاق مع الكيبورد */
  const pin=()=>{if(!vv)return;const w=Math.min(vv.width,980),x=vv.offsetLeft+(vv.width-w)/2;
    root.style.setProperty("--vvt",Math.max(0,vv.offsetTop)+"px");
    root.style.setProperty("--vvx",x+"px");root.style.setProperty("--vvw",w+"px");
    const sc=app.querySelector(".sec");if(sc){const r=sc.getBoundingClientRect();root.style.setProperty("--mbx",(r.left+13)+"px");root.style.setProperty("--mbw",Math.max(0,r.width-26)+"px")}};
  addEventListener("tc-pin",pin);addEventListener("resize",pin);addEventListener("orientationchange",pin);
  let pt=0;const pinBurst=()=>{pin();cancelAnimationFrame(pt);let n=0;const f=()=>{pin();if(++n<30)pt=requestAnimationFrame(f)};pt=requestAnimationFrame(f)};
  if(vv){vv.addEventListener("resize",pinBurst);vv.addEventListener("scroll",pin);addEventListener("scroll",pin,{passive:true});
    document.addEventListener("focusin",pinBurst);document.addEventListener("focusout",pinBurst);pin()}
  if(vv){vv.addEventListener("resize",()=>{vvSync();if(vv.height>=innerHeight*.9&&!ed(document.activeElement))kbSet(false)});vv.addEventListener("scroll",vvSync)}
})();
