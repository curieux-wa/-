/* ===== i18n/dyn.js — محرك ترجمة شامل عند اختيار الإنجليزية =====
   - قاموس ثابت (نصوص الواجهة والإشارات والولايات) يعمل دون إنترنت
   - ترجمة تلقائية للنصوص المتغيرة (محتوى قاعدة البيانات) مع كاش محلي دائم
   - يعمل على الـ DOM فقط: لا يغيّر الخطوط ولا التنسيق، ويعيد النص العربي الأصلي عند الرجوع للعربية
   - لا يمسّ أي حقل قابل للتحرير (contenteditable / input / textarea) فلا يتأثر ما يُحفظ في قاعدة البيانات */
(function(){
"use strict";
var DICT_SRC={
"ممنوع المرور": "No entry",
"ممنوع الدوران": "No U-turn",
"تحديد السرعة 30": "Speed limit 30",
"تحديد السرعة 50": "Speed limit 50",
"تحديد السرعة 40": "Speed limit 40",
"تحديد السرعة 60": "Speed limit 60",
"تحديد السرعة 80": "Speed limit 80",
"تحديد السرعة 100": "Speed limit 100",
"تحديد السرعة 120": "Speed limit 120",
"ممنوع التوقف": "No stopping",
"قف": "Stop",
"ممر الراجلين": "Pedestrian crossing",
"طريق ضيق": "Road narrows",
"طريق زلق": "Slippery road",
"منعطف خطير": "Dangerous bend",
"مدرسة": "School",
"اتجاه إجباري يمين": "Turn right only",
"اتجاه إجباري أمام": "Ahead only",
"اتجاه إجباري يسار": "Turn left only",
"اتجاه إجباري للأسفل": "Mandatory direction (down)",
"موقف السيارات": "Parking",
"المستشفى": "Hospital",
"طريق سيار": "Motorway",
"اتجاه الطريق": "Route direction",
"المسافات": "Distances",
"وهران": "Oran",
"45 كم": "45 km",
"محطة وقود": "Fuel station",
"الضوء الأحمر": "Red light",
"الضوء الأصفر": "Yellow light",
"الضوء الأخضر": "Green light",
"خط متصل": "Solid line",
"خط متقطع": "Dashed line",
"ممر الراجلين (علامة أرضية)": "Pedestrian crossing (road marking)",
"سهم أرضي": "Road arrow",
"ممنوع الدخول (اتجاه ممنوع)": "No entry (wrong way)",
"أشغال عمومية": "Road works",
"مفترق طرق خطير (الأولوية لليمين)": "Dangerous junction (priority to the right)",
"أولوية المرور في المفترق القادم": "Priority at the next junction",
"ممر سكة حديدية بحواجز": "Railway crossing with barriers",
"ممر سكة حديدية بدون حواجز": "Railway crossing without barriers",
"تساقط الحجارة": "Falling rocks",
"منحدر خطير": "Steep descent",
"طريق ذو اتجاهين": "Two-way traffic",
"إشارات ضوئية أمامك": "Traffic lights ahead",
"مرور حيوانات أليفة أو برية": "Domestic or wild animals crossing",
"ممنوع المرور في الاتجاهين": "No traffic in both directions",
"ممنوع الانعطاف يميناً": "No right turn",
"ممنوع الانعطاف يساراً": "No left turn",
"ممنوع التجاوز": "No overtaking",
"ممنوع التجاوز للشاحنات": "No overtaking for trucks",
"ممنوع مرور الشاحنات": "No trucks",
"ممنوع استعمال المنبه الصوتي": "No use of horn",
"نهاية جميع الممنوعات": "End of all prohibitions",
"افسح الطريق (ترك المرور)": "Give way",
"طريق ذو أولوية": "Priority road",
"نهاية الطريق ذي الأولوية": "End of priority road",
"الالتزام أقصى اليمين": "Keep right",
"الالتزام أقصى اليسار": "Keep left",
"دوران إجباري في المدار": "Roundabout (mandatory)",
"ممر إجباري للحافلات": "Bus lane (mandatory)",
"مسلك إجباري للدراجات": "Cycle lane (mandatory)",
"سرعة دنيا إجبارية": "Minimum speed",
"نهاية الطريق السيار": "End of motorway",
"طريق ذو اتجاه واحد": "One-way road",
"طريق مسدود": "Dead end",
"ممهل (مطب صناعي)": "Speed bump",
"الضوء الأصفر المتقطع": "Flashing yellow light",
"خط مختلط (متصل ومتقطع)": "Mixed line (solid and dashed)",
"خط التوقف (عند إشارة قف)": "Stop line (at a stop sign)",
"أسهم التوجيه الأرضية": "Road direction arrows",
"يُمنع دخول جميع المركبات من هذا الاتجاه (طرق ذات اتجاه واحد أو مخارج).": "All vehicles are prohibited from entering from this direction (one-way roads or exits).",
"يُمنع الانعطاف أو الدوران في هذا الاتجاه.": "Turning or making a U-turn in this direction is prohibited.",
"تمنع السير بسرعة تتجاوز 30 كم/سا.": "Driving faster than 30 km/h is prohibited.",
"تمنع السير بسرعة تتجاوز 40 كم/سا.": "Driving faster than 40 km/h is prohibited.",
"تمنع السير بسرعة تتجاوز 50 كم/سا.": "Driving faster than 50 km/h is prohibited.",
"تمنع السير بسرعة تتجاوز 60 كم/سا.": "Driving faster than 60 km/h is prohibited.",
"تمنع السير بسرعة تتجاوز 80 كم/سا.": "Driving faster than 80 km/h is prohibited.",
"تمنع السير بسرعة تتجاوز 100 كم/سا.": "Driving faster than 100 km/h is prohibited.",
"تمنع السير بسرعة تتجاوز 120 كم/سا.": "Driving faster than 120 km/h is prohibited.",
"يُمنع توقف أو وقوف المركبات على هذا الجانب من الطريق.": "Stopping or parking vehicles on this side of the road is prohibited.",
"توقف إجباري قبل خط التوقف أو الملتقى وإعطاء الأولوية لمن له حق المرور.": "Mandatory stop before the stop line or junction, giving priority to those with the right of way.",
"تنبيه بوجود ممر للراجلين أمامك، خفّض سرعتك وأعطِ الأولوية.": "Warning: a pedestrian crossing ahead. Reduce your speed and give priority.",
"خطوط بيضاء على الطريق تحدد مكان عبور الراجلين، أعطِهم الأولوية.": "White lines on the road marking where pedestrians cross. Give them priority.",
"الطريق يضيق في المقطع القادم، انتبه للمركبات القادمة.": "The road narrows in the next section. Watch for oncoming vehicles.",
"قد يكون سطح الطريق زلقاً، خفّض السرعة وتجنب الفرملة المفاجئة.": "The road surface may be slippery. Reduce speed and avoid sudden braking.",
"منعطف حاد أمامك، خفّض السرعة.": "Sharp bend ahead. Reduce speed.",
"قرب مؤسسة تعليمية، انتبه لعبور الأطفال.": "Near an educational institution. Watch for children crossing.",
"يجب على المركبات السير نحو اليمين فقط.": "Vehicles must proceed to the right only.",
"يجب على المركبات السير إلى الأمام فقط.": "Vehicles must proceed straight ahead only.",
"يجب على المركبات السير نحو اليسار فقط.": "Vehicles must proceed to the left only.",
"يجب اتباع الاتجاه المبيّن بالسهم فقط.": "Follow only the direction shown by the arrow.",
"مكان مخصص لوقوف المركبات.": "An area reserved for parking vehicles.",
"يدل على وجود مستشفى أو مركز إسعاف قريب.": "Indicates a nearby hospital or first-aid centre.",
"بداية طريق سيار (سريع).": "Start of a motorway (expressway).",
"يبيّن الاتجاه المؤدي إلى الوجهة.": "Shows the direction leading to the destination.",
"يبيّن اسم الوجهة والمسافة المتبقية إليها.": "Shows the destination name and the remaining distance to it.",
"محطة لتزويد المركبات بالوقود.": "A station for refuelling vehicles.",
"توقف إجباري خلف خط التوقف.": "Mandatory stop behind the stop line.",
"يُمنع تجاوزه أو عبوره.": "Crossing or overtaking over it is prohibited.",
"يُسمح بتجاوزه عند توفر الأمان.": "Crossing is allowed when it is safe.",
"يوجّه المركبات إلى المسار المسموح به.": "Directs vehicles to the permitted lane.",
"أشغال على الطريق أمامك، خفّض سرعتك وانتبه للعمال والآليات.": "Road works ahead. Reduce your speed and watch for workers and machinery.",
"مفترق طرق بلا أولوية مبيّنة: أعطِ الأولوية للمركبات القادمة من اليمين.": "A junction with no marked priority: give way to vehicles coming from the right.",
"أنت على طريق ذي أولوية في المفترق القادم، مع بقاء الحذر.": "You are on a priority road at the next junction; stay cautious.",
"تقاطع مع سكة حديدية مزوّد بحواجز، توقف عند إغلاقها.": "Crossing with a railway equipped with barriers. Stop when they are closed.",
"تقاطع مع سكة حديدية بلا حواجز، انتبه جيداً وتأكد من خلو السكة.": "Crossing with a railway without barriers. Be very careful and make sure the track is clear.",
"احتمال تساقط حجارة من المنحدرات المجاورة، كن حذراً.": "Rocks may fall from the neighbouring slopes. Be careful.",
"منحدر شديد أمامك، استعمل علبة السرعات المنخفضة وخفّض السرعة.": "Steep descent ahead. Use a low gear and reduce speed.",
"الطريق بعد هذه الإشارة يصبح ذا اتجاهين، التزم أقصى اليمين.": "After this sign the road becomes two-way. Keep to the far right.",
"إشارات ضوئية للمرور أمامك، استعد للتوقف.": "Traffic lights ahead. Be ready to stop.",
"احتمال عبور حيوانات الطريق، خفّض السرعة.": "Animals may cross the road. Reduce speed.",
"يُمنع مرور جميع المركبات في الاتجاهين.": "All vehicles are prohibited in both directions.",
"يُمنع الانعطاف إلى اليمين عند المفترق القادم.": "Turning right at the next junction is prohibited.",
"يُمنع الانعطاف إلى اليسار عند المفترق القادم.": "Turning left at the next junction is prohibited.",
"يُمنع تجاوز المركبات ذات المحركين أو أكثر على هذا المقطع.": "Overtaking vehicles with two or more engines is prohibited on this section.",
"يُمنع على الشاحنات تجاوز المركبات الأخرى.": "Trucks are prohibited from overtaking other vehicles.",
"يُمنع دخول الشاحنات إلى هذا الطريق.": "Trucks are prohibited from entering this road.",
"يُمنع استعمال المنبه الصوتي إلا في حالة الخطر الوشيك.": "Use of the horn is prohibited except in case of imminent danger.",
"انتهاء مفعول جميع الممنوعات المفروضة سابقاً.": "All previously imposed prohibitions end here.",
"أعطِ الأولوية للمركبات على الطريق الذي تدخله وتوقف عند الحاجة.": "Give priority to vehicles on the road you are entering and stop if necessary.",
"أنت على طريق ذي أولوية في المفترقات القادمة.": "You are on a priority road at the upcoming junctions.",
"انتهاء الأولوية، طبّق قواعد الأولوية العادية في المفترقات.": "Priority ends. Apply the normal priority rules at junctions.",
"يجب البقاء في أقصى الجهة اليمنى من الطريق.": "You must stay on the far right side of the road.",
"يجب البقاء في أقصى الجهة اليسرى من الطريق.": "You must stay on the far left side of the road.",
"يجب الدوران حول المدار في الاتجاه المبيّن بالأسهم.": "You must go around the roundabout in the direction shown by the arrows.",
"مسلك مخصص للحافلات فقط، لا يجوز لباقي المركبات استعماله.": "A lane reserved for buses only; other vehicles may not use it.",
"مسلك مخصص للدراجات الهوائية فقط.": "A lane reserved for bicycles only.",
"يُمنع السير بسرعة تقل عن السرعة المبيّنة على هذا الطريق.": "Driving slower than the speed shown on this road is prohibited.",
"انتهاء الطريق السيار، طبّق قواعد الطرق العادية.": "End of the motorway. Apply the rules of ordinary roads.",
"الطريق ذو اتجاه واحد فقط، لا يجوز السير عكسه.": "The road is one-way only; driving against it is not allowed.",
"الطريق لا مخرج له في نهايته.": "The road has no exit at its end.",
"ممهل أمامك، خفّض سرعتك قبل المرور فوقه.": "Speed bump ahead. Reduce your speed before crossing it.",
"انتبه وتقدّم بحذر، وأعطِ الأولوية وفق إشارات الطريق.": "Be attentive and proceed with caution, giving priority according to the road signs.",
"يُسمح بتجاوزه من جهة الخط المتقطع فقط.": "Crossing is allowed only from the dashed-line side.",
"يجب التوقف التام خلف هذا الخط عند إشارة قف أو الضوء الأحمر.": "You must come to a complete stop behind this line at a stop sign or red light.",
"تبيّن الاتجاهات المسموحة في المسار، اختر مسارك مسبقاً.": "Shows the permitted directions in the lane. Choose your lane in advance.",
"أدرار": "Adrar",
"الشلف": "Chlef",
"الأغواط": "Laghouat",
"أم البواقي": "Oum El Bouaghi",
"باتنة": "Batna",
"بجاية": "Béjaïa",
"بسكرة": "Biskra",
"بشار": "Béchar",
"البليدة": "Blida",
"البويرة": "Bouira",
"تمنراست": "Tamanrasset",
"تبسة": "Tébessa",
"تلمسان": "Tlemcen",
"تيارت": "Tiaret",
"تيزي وزو": "Tizi Ouzou",
"الجزائر": "Algiers",
"الجلفة": "Djelfa",
"جيجل": "Jijel",
"سطيف": "Sétif",
"سعيدة": "Saïda",
"سكيكدة": "Skikda",
"سيدي بلعباس": "Sidi Bel Abbès",
"عنابة": "Annaba",
"قالمة": "Guelma",
"قسنطينة": "Constantine",
"المدية": "Médéa",
"مستغانم": "Mostaganem",
"المسيلة": "M'Sila",
"معسكر": "Mascara",
"ورقلة": "Ouargla",
"البيض": "El Bayadh",
"إليزي": "Illizi",
"برج بوعريريج": "Bordj Bou Arréridj",
"بومرداس": "Boumerdès",
"الطارف": "El Tarf",
"تندوف": "Tindouf",
"تيسمسيلت": "Tissemsilt",
"الوادي": "El Oued",
"خنشلة": "Khenchela",
"سوق أهراس": "Souk Ahras",
"تيبازة": "Tipaza",
"ميلة": "Mila",
"عين الدفلى": "Aïn Defla",
"النعامة": "Naâma",
"عين تموشنت": "Aïn Témouchent",
"غرداية": "Ghardaïa",
"غليزان": "Relizane",
"تيميمون": "Timimoun",
"برج باجي مختار": "Bordj Badji Mokhtar",
"أولاد جلال": "Ouled Djellal",
"بني عباس": "Béni Abbès",
"عين صالح": "In Salah",
"عين قزام": "In Guezzam",
"تقرت": "Touggourt",
"جانت": "Djanet",
"المغير": "El M'Ghair",
"المنيعة": "El Menia",
"قانون تنسيق النقل والمرور": "Transport and Traffic Law",
"المخالفات · الوثائق · التجهيزات": "Violations · Documents · Equipment",
"الفهرس": "Index",
"الإشعارات": "Notifications",
"وضع التعديل": "Edit mode",
"بحث": "Search",
"ابحث في المخالفات والنصوص والعقوبات…": "Search violations, texts and penalties…",
"أحدث إصدار في السيرفر": "Latest version on the server",
"إصدار هذا الجهاز": "This device version",
"جديد": "New",
"دخول المشرف": "Admin login",
"سجّل دخولك لإدارة المخالفات والوثائق ومتابعة المستخدمين": "Sign in to manage violations and documents and follow up users",
"البريد الإلكتروني": "Email",
"كلمة السر": "Password",
"إظهار كلمة السر": "Show password",
"إظهار": "Show",
"إخفاء": "Hide",
"دخول": "Login",
"إلغاء": "Cancel",
"مخالفات النقل العمومي للمسافرين": "Public passenger transport violations",
"مخالفات النقل العمومي للبضائع": "Public goods transport violations",
"مخالفات النقل العمومي لسيارات الأجرة (فردية + جماعية)": "Public taxi transport violations (individual + collective)",
"مخالفات نقل المواد الخطيرة": "Dangerous goods transport violations",
"مخالفات النقل الاستثنائي": "Exceptional transport violations",
"لا يوجد اتصال بالخادم — لم يُحفظ": "No server connection — not saved",
"تم الحفظ ✓": "Saved ✓",
"تعذّر الحفظ (تحقق من الصلاحيات أو الاتصال)": "Could not save (check permissions or connection)",
"تعذّر الحفظ": "Could not save",
"جاري تجهيز الاتصال…": "Preparing the connection…",
"تعذّر تحميل خدمة الدخول — أعد تحميل الصفحة": "Could not load the login service — reload the page",
"جارٍ الدخول…": "Signing in…",
"تعذّر الاتصال بالخادم — أعد تحميل الصفحة": "Could not connect to the server — reload the page",
"تم الدخول": "Signed in",
"خطأ في الشبكة": "Network error",
"بيانات الدخول غير صحيحة": "Incorrect login details",
"المعدات الأساسية": "Essential equipment",
"الملصقات الإجبارية": "Mandatory stickers",
"الشارّات والعلامات المميزة": "Distinctive badges and marks",
"حذف": "Delete",
"جاري الاتصال بالخادم…": "Connecting to the server…",
"— أعد تحميل الصفحة": "— reload the page",
"إصدار مطلوب:": "Required version:",
"تعذّر البث": "Broadcast failed",
"سيتم حذف كل صفوف هذا الجدول فقط (باقي البطاقات لا تتأثر). متابعة؟": "All rows of this table only will be deleted (other cards are not affected). Continue?",
"تمت إعادة ضبط الجدول": "Table has been reset",
"لا يوجد ما يُتراجع عنه": "Nothing to undo",
"تم التراجع": "Undone",
"لا يوجد ما يُعاد": "Nothing to redo",
"تمت الإعادة": "Redone",
"يتوفر تحديث — جارٍ التحميل…": "Update available — loading…",
"تعذّر تعليم البلاغ": "Could not mark the report",
"تعذّر إرسال الرد": "Could not send the reply",
"تم تسجيل الدخول بحساب المشرف من جهاز آخر، لذلك أُنهيت جلستك على هذا الجهاز.": "The admin account was signed in from another device, so your session on this device was ended.",
"استعادة النص الافتراضي؟": "Restore the default text?",
"تعديل": "Edit",
"إغلاق": "Close",
"خطر": "Danger",
"منع": "Prohibition",
"أولوية": "Priority",
"إجبار": "Mandatory",
"إرشاد": "Guidance",
"ضوئية": "Light signals",
"أرضية": "Road markings",
"تم استلام بلاغكم وجارٍ دراسته. شكراً لتعاونكم.": "Your report has been received and is being reviewed. Thank you for your cooperation.",
"تمت معالجة الملاحظة المذكورة في التحديث القادم. شكراً لتبليغكم.": "The reported issue will be addressed in the next update. Thank you for reporting.",
"نرجو تزويدنا بمزيد من التفاصيل (القسم، رقم المخالفة، لقطة شاشة) لنتمكن من المساعدة.": "Please provide more details (section, violation number, screenshot) so that we can help.",
"وصل إلى المشرف": "Received by the admin",
"تمت مراجعته": "Reviewed",
"تم الرد": "Replied",
"مخالفات من الدرجة الأولى (3000 دج)": "First-degree violations (3000 DA)",
"المخالفات من الدرجة الأولى وعقوباتها.": "First-degree violations and their penalties.",
"مخالفات من الدرجة الثانية (4000 دج)": "Second-degree violations (4000 DA)",
"المخالفات من الدرجة الثانية وعقوباتها.": "Second-degree violations and their penalties.",
"مخالفات من الدرجة الثالثة (7000 دج)": "Third-degree violations (7000 DA)",
"المخالفات من الدرجة الثالثة وعقوباتها.": "Third-degree violations and their penalties.",
"مخالفات من الدرجة الرابعة (10000 دج)": "Fourth-degree violations (10000 DA)",
"المخالفات من الدرجة الرابعة وعقوباتها.": "Fourth-degree violations and their penalties.",
"مخالفات الدرجة الخامسة": "Fifth-degree violations",
"المخالفات من الدرجة الخامسة وعقوباتها.": "Fifth-degree violations and their penalties.",
"الجرائم المتعلقة بالسياقة": "Driving-related offences",
"الجرائم المرتبطة بسلوك السائق أثناء السياقة.": "Offences related to the driver's behaviour while driving.",
"الجرائم المتعلقة بالمركبة": "Vehicle-related offences",
"الجرائم المرتبطة بحالة المركبة وتجهيزاتها ووثائقها.": "Offences related to the vehicle's condition, equipment and documents.",
"جرائم مختلفة": "Miscellaneous offences",
"جرائم أخرى متعلقة بقانون المرور.": "Other offences related to the traffic law.",
"الرقم": "No.",
"التعيين": "Designation",
"طبيعة المخالفة": "Nature of violation",
"طبيعة المخالفات": "Nature of violations",
"منصوص عليها": "Legal text",
"معاقب عليها": "Penalty",
"الإجراءات": "Actions",
"المخالفات": "Violations",
"المنصوصة": "Legal text",
"المعاقبة": "Penalty",
"هذا التطبيق اجتهاد شخصي ولا يمثل أي جهة حكومية أو رسمية.": "This app is a personal effort and does not represent any governmental or official body.",
"يعتمد المحتوى على النصوص والمراجع التنظيمية والقانونية المنشورة في الجريدة الرسمية للجمهورية الجزائرية الديمقراطية الشعبية لأغراض التوعية والاطلاع فقط، ولا يُغني عن الرجوع إلى النصوص الرسمية أو الجهات المختصة.": "The content relies on the regulatory and legal texts published in the Official Gazette of the People's Democratic Republic of Algeria for awareness and information purposes only, and does not replace consulting the official texts or the competent authorities.",
"لا يقوم التطبيق بجمع بيانات شخصية غير ضرورية، ولا يتحمل أي مسؤولية عن كيفية استعمال المعلومات الواردة فيه.": "The app does not collect unnecessary personal data and bears no responsibility for how the information it contains is used.",
"↑ وادي تليلات - وهران": "↑ Oued Tlelat - Oran",
"قانون تنسيق النقل": "Transport Coordination Law",
"الدرك الوطني": "National Gendarmerie",
"استعد للتوقف؛ لا تدخل التقاطع إن كان بإمكانك التوقف بأمان.": "Get ready to stop; do not enter the junction if you can stop safely.",
"يُسمح بالمرور مع الانتباه للراجلين وحركة التقاطع.": "Proceeding is allowed while watching for pedestrians and junction traffic."
};
var RULES=[["^إشارة · (.+)$", "Sign · $1"], ["^الآن$", "Just now"], ["^منذ (\\d+) د$", "$1 min ago"], ["^منذ (\\d+) س$", "$1 h ago"], ["^منذ (\\d+) يوم$", "$1 d ago"], ["^تم النسخ: (.+)$", "Copied: $1"], ["^(\\d+) مخالفة جديدة$", "$1 new violation(s)"], ["^عرض المزيد \\((\\d+)\\)$", "Show more ($1)"]];
var AR=/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
var ATTRS=["placeholder","title","aria-label","alt","data-placeholder"];
var SKIP="script,style,noscript,input,textarea:not([readonly]),[contenteditable],[data-notx],[data-lang],.notx";
var TX_K="tc_tx_cache_v3",CH=420,BATCH_CH=1500,BATCH_N=8,CONC=3,CAP=2300000;
function isEn(){try{return typeof pref!=="undefined"&&pref&&pref.lang==="en"}catch(e){return false}}
function nrm(s){return String(s==null?"":s).replace(/\s+/g," ").trim()}
var DICT=Object.create(null);Object.keys(DICT_SRC).forEach(function(k){DICT[nrm(k)]=DICT_SRC[k]});
var RX=RULES.map(function(r){return[new RegExp(r[0]),r[1]]});
/* ---------- الكاش (نفس صيغة الكاش السابق ليُعاد استخدامه) ---------- */
function hash(s){s=String(s||"");var h=0;for(var i=0;i<s.length;i++)h=((h<<5)-h)+s.charCodeAt(i)|0;return "t"+Math.abs(h).toString(36)+"_"+s.length}
var mem=null,saveT=0;
function load(){if(mem)return mem;try{mem=JSON.parse(localStorage.getItem(TX_K)||"{}")||{}}catch(e){mem={}}return mem}
function bad(s){s=String(s||"");var u=s.toUpperCase();return !s||u.indexOf("MYMEMORY WARNING")>-1||u.indexOf("USAGELIMITS")>-1||u.indexOf("QUERY LENGTH LIMIT")>-1||u.indexOf("PLEASE CONTACT")>-1||u.indexOf("NEXT AVAILABLE")>-1||u.indexOf("TO TRANSLATE MORE")>-1||/https?:\/\//i.test(s)||s.length>1600}
function persist(){clearTimeout(saveT);saveT=setTimeout(function(){var c=load(),str;try{str=JSON.stringify(c);
 if(str.length>CAP){var ks=Object.keys(c).sort(function(a,b){return(c[a].translation_updated_at||0)-(c[b].translation_updated_at||0)});
  var n=Math.floor(ks.length*0.35);for(var i=0;i<n;i++)delete c[ks[i]];str=JSON.stringify(c)}
 localStorage.setItem(TX_K,str)}catch(e){}},1200)}
function cget(u){var e=load()[hash(u)];return(e&&e.text_en&&e.last_translated_ar===u&&!bad(e.text_en))?e.text_en:null}
function cput(u,en){load()[hash(u)]={text_ar:u,text_en:en,last_translated_ar:u,translation_updated_at:Date.now()};persist()}
/* ---------- البحث عن ترجمة (قاموس ← قواعد ← كاش) ---------- */
function lookup(u){
 var k=nrm(u);if(!k)return null;
 if(DICT[k]!==undefined)return DICT[k];
 for(var i=0;i<RX.length;i++){var m=RX[i][0].exec(k);if(m){return RX[i][1].replace(/\$(\d)/g,function(_,d){var g=m[d]||"";if(!AR.test(g))return g;var t=lookup(g);return t===null?g:t})}}
 if(same[k])return k;
 return cget(k);
}
function splitLong(u){var parts=u.match(/[^.؟!؛;\n]+[.؟!؛;]?\s*/g)||[u],out=[],cur="";
 parts.forEach(function(p){if(p.length>CH){if(cur){out.push(cur);cur=""}for(var i=0;i<p.length;i+=CH)out.push(p.slice(i,i+CH));return}
  if((cur+p).length>CH){out.push(cur);cur=p}else cur+=p});if(cur)out.push(cur);return out}
/* سطر واحد → {t:النص, miss:[وحدات ناقصة]} */
function tLine(line){
 if(!AR.test(line))return{t:line,miss:[]};
 var m=line.match(/^(\s*)([\s\S]*?)(\s*)$/),lead=m[1],core=m[2],trail=m[3];
 var d=lookup(core);if(d!==null)return{t:lead+d+trail,miss:[]};
 var e=core.match(/^([^\u0600-\u06FFA-Za-z]*)([\s\S]*?)([^\u0600-\u06FFA-Za-z]*)$/),pre=e[1],mid=e[2],suf=e[3];
 if(!AR.test(mid))return{t:line,miss:[]};
 d=lookup(mid);if(d!==null)return{t:lead+pre+d+suf+trail,miss:[]};
 var miss=[],chunks=mid.length>CH?splitLong(mid):[mid],out=chunks.map(function(c){
  if(!AR.test(c))return c;var cm=c.match(/^(\s*)([\s\S]*?)(\s*)$/),r=lookup(cm[2]);
  if(r===null){miss.push(cm[2]);return c}return cm[1]+r+cm[3]}).join("");
 return{t:lead+pre+out+suf+trail,miss:miss}}
function tStr(s){var lines=String(s).split("\n"),miss=[],out=lines.map(function(l){var r=tLine(l);if(r.miss.length)miss=miss.concat(r.miss);return r.t});return{t:out.join("\n"),miss:miss}}
/* ---------- جلب الترجمة من الشبكة ---------- */
var inflight=Object.create(null),failed=Object.create(null),same=Object.create(null),fails=0,pauseUntil=0,running=0,gtxDown=0,gtxFails=0;
function timeoutFetch(url,opt,ms){var c=typeof AbortController!=="undefined"?new AbortController():null,t=setTimeout(function(){c&&c.abort()},ms||12000);
 opt=opt||{};if(c)opt.signal=c.signal;return fetch(url,opt).then(function(r){clearTimeout(t);return r},function(e){clearTimeout(t);throw e})}
function gtxParse(j){if(!j||!j[0])throw new Error("gtx empty");return j[0].map(function(x){return x&&x[0]?x[0]:""}).join("")}
function gtx(q){
 if(Date.now()<gtxDown)return Promise.reject(new Error("gtx down"));
 var body="client=gtx&sl=ar&tl=en&dt=t&q="+encodeURIComponent(q);
 return timeoutFetch("https://translate.googleapis.com/translate_a/single",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:body}).then(function(r){if(!r.ok)throw new Error("gtx "+r.status);return r.json()}).then(gtxParse).catch(function(e){
  if(q.length>300)throw e;
  return timeoutFetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q="+encodeURIComponent(q)).then(function(r){if(!r.ok)throw new Error("gtx "+r.status);return r.json()}).then(gtxParse)
 }).then(function(t){gtxFails=0;return t},function(e){if(++gtxFails>=2){gtxDown=Date.now()+2*60*1000;gtxFails=0}throw e})}
function mm(q){return timeoutFetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(q.slice(0,450))+"&langpair=ar|en").then(function(r){return r.json()}).then(function(j){
  var t=((j&&j.responseData&&j.responseData.translatedText)||"").trim();if(bad(t))throw new Error("mm bad");return t})}
function one(u){return gtx(u).catch(function(){return mm(u)}).then(function(t){t=String(t||"").trim();if(!t||bad(t))throw new Error("bad");return t})}
function runBatch(units){
 function singles(){var p=Promise.resolve();units.forEach(function(u){p=p.then(function(){return one(u).then(function(t){ok(u,t)},function(){ko(u)})})});return p}
 if(units.length===1)return one(units[0]).then(function(t){ok(units[0],t)},function(){ko(units[0])});
 return gtx(units.join("\n")).then(function(res){var parts=res.replace(/\n+$/,"").split("\n");
  if(parts.length!==units.length)return singles();
  units.forEach(function(u,i){var t=(parts[i]||"").trim();if(t&&!bad(t))ok(u,t);else ko(u)})},function(){return singles()})}
function ok(u,t){fails=0;delete inflight[u];if(t.toLowerCase()===u.toLowerCase()){same[nrm(u)]=1;return}cput(nrm(u),t)}
function ko(u){delete inflight[u];failed[u]=Date.now();if(++fails>=8){pauseUntil=Date.now()+5*60*1000;fails=0}}
/* ---------- المعلّقات: عقد DOM تنتظر ترجمة ---------- */
var pending=new Map(),recs=new WeakMap(),done=new Set(),arecs=new WeakMap(),adone=new Set(),flushT=0,pumpT=0;
function skipEl(el){try{return !el||(el.closest&&el.closest(SKIP))}catch(e){return false}}
function svgFit(node,w0){var p=node.parentNode;if(!p||!p.getComputedTextLength||!w0)return;
 try{var w1=p.getComputedTextLength();if(w1>w0*1.02){p.setAttribute("textLength",String(w0));p.setAttribute("lengthAdjust","spacingAndGlyphs");p.setAttribute("data-txfit","1")}}catch(e){}}
function doText(node){
 var v=node.nodeValue,r=recs.get(node);
 if(r){if(v===r.en)return;if(v!==r.ar){r=null;recs.delete(node)}}
 if(!AR.test(v))return;
 var p=node.parentNode;if(!p||skipEl(p))return;
 var ar=r?r.ar:v,res=tStr(ar);
 if(res.t!==v){var w0=0;try{if(p.getComputedTextLength)w0=p.getComputedTextLength()}catch(e){}
  recs.set(node,{ar:ar,en:res.t});node.nodeValue=res.t;done.add(node);if(w0)svgFit(node,w0)}
 else if(!r)recs.set(node,{ar:ar,en:v});
 if(res.miss.length)pending.set(node,1);else pending.delete(node)}
function doEl(el){
 if(el.nodeType!==1||skipEl(el))return;
 for(var i=0;i<ATTRS.length;i++){var a=ATTRS[i],v=el.getAttribute(a);if(v&&AR.test(v)){var ar0=arecs.get(el)||{},rr=ar0[a];
   if(rr&&v===rr.en)continue;var res=tStr(v);if(res.t!==v){ar0[a]={ar:v,en:res.t};arecs.set(el,ar0);adone.add(el);el.setAttribute(a,res.t)}}}
 if(el.tagName==="TEXTAREA"&&el.hasAttribute("readonly")){var tv=el.value;if(tv&&AR.test(tv)&&el.dataset.txAr===undefined){var rs=tStr(tv);if(rs.t!==tv){el.dataset.txAr=tv;el.value=rs.t;adone.add(el)}}}}
function walk(root){
 if(!root)return;
 if(root.nodeType===3){doText(root);return}
 if(root.nodeType!==1&&root.nodeType!==11)return;
 if(root.nodeType===1){if(skipEl(root))return;doEl(root)}
 var tw=document.createTreeWalker(root,5,null),n;
 while((n=tw.nextNode())){if(n.nodeType===3)doText(n);else doEl(n)}}
function sweep(){if(!isEn())return;walk(document.body);var h=document.querySelector("head title");if(h&&h.firstChild)doText(h.firstChild);schedulePump()}
/* ---------- المضخّة: تجمع الوحدات الناقصة وتجلبها ---------- */
function schedulePump(){if(pumpT)return;pumpT=setTimeout(function(){pumpT=0;pump()},60)}
function collect(){var units=[],chars=0,seen=Object.create(null);
 for(var it=pending.keys(),n=it.next();!n.done;n=it.next()){var node=n.value;
  if(!node.isConnected){pending.delete(node);continue}
  var r=recs.get(node);if(!r){pending.delete(node);continue}
  var res=tStr(r.ar);if(!res.miss.length){applyOne(node);continue}
  for(var i=0;i<res.miss.length;i++){var u=res.miss[i];if(seen[u]||inflight[u]||(failed[u]&&Date.now()-failed[u]<60000))continue;seen[u]=1;
   if(units.length&&(units.length>=BATCH_N||chars+u.length>BATCH_CH))return units;units.push(u);chars+=u.length}
  if(units.length>=BATCH_N)return units}
 return units}
function applyOne(node){var r=recs.get(node);if(!r||!node.isConnected){pending.delete(node);return}
 var res=tStr(r.ar);if(node.nodeValue===r.en||node.nodeValue===r.ar){var p=node.parentNode,w0=0;try{if(p&&p.getComputedTextLength&&!p.getAttribute("data-txfit"))w0=p.getComputedTextLength()}catch(e){}
  r.en=res.t;node.nodeValue=res.t;done.add(node);if(w0)svgFit(node,w0)}
 if(!res.miss.length)pending.delete(node)}
function applyAll(){if(!isEn())return;var arr=Array.from(pending.keys());arr.forEach(applyOne);
 /* نصوص الخصائص/textarea: إعادة محاولة */
 }
function pump(){
 if(!isEn())return;
 if(Date.now()<pauseUntil)return;
 if(typeof navigator!=="undefined"&&navigator.onLine===false)return;
 while(running<CONC){var units=collect();if(!units.length)break;
  units.forEach(function(u){inflight[u]=1});running++;
  runBatch(units).then(function(){},function(){}).then(function(){running--;clearTimeout(flushT);flushT=setTimeout(function(){applyAll();schedulePump()},150)})}
}
/* ---------- المراقب ---------- */
var mo=null;
function start(){
 if(!mo&&typeof MutationObserver!=="undefined"){
  mo=new MutationObserver(function(list){if(!isEn())return;
   for(var i=0;i<list.length;i++){var m=list[i];
    if(m.type==="childList"){for(var j=0;j<m.addedNodes.length;j++)walk(m.addedNodes[j])}
    else if(m.type==="characterData")doText(m.target);
    else if(m.type==="attributes")doEl(m.target)}
   schedulePump()});
  mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS})}
 sweep()}
function restore(){
 done.forEach(function(n){var r=recs.get(n);if(r&&n.isConnected&&n.nodeValue===r.en)n.nodeValue=r.ar;recs.delete(n)});done.clear();pending.clear();
 adone.forEach(function(el){var o=arecs.get(el);if(o){Object.keys(o).forEach(function(a){if(el.getAttribute(a)===o[a].en)el.setAttribute(a,o[a].ar)})}arecs.delete(el);
  if(el.dataset&&el.dataset.txAr!==undefined){el.value=el.dataset.txAr;delete el.dataset.txAr}});adone.clear();
 document.querySelectorAll("[data-txfit]").forEach(function(e){e.removeAttribute("textLength");e.removeAttribute("lengthAdjust");e.removeAttribute("data-txfit")})}
function setLang(){if(isEn())start();else restore()}
/* ---------- واجهات عامة (تحلّ محل المحرك القديم) ---------- */
window.TXD={lookup:lookup,sweep:sweep,restore:restore,setLang:setLang,dict:DICT};
window.tx=function(ar){ar=String(ar==null?"":ar);if(!ar||!isEn())return ar;var r=tStr(ar);return r.t};
window.txFetch=function(ar){ar=nrm(ar);if(!ar||!isEn())return Promise.resolve(ar);var r=tStr(ar);if(!r.miss.length)return Promise.resolve(r.t);
 return one(ar).then(function(t){cput(ar,t);return t},function(){return ar})};
window.txEnsure=function(){return Promise.resolve()};
window.txCollectPage=function(){return[]};
window.retranslateUI=function(){
 try{applyPref()}catch(e){}
 try{if(typeof showT==="function"){showT._drawn={};showT._busy=0}}catch(e){}
 try{showSection._drawn=0;showSection._busy=0}catch(e){}
 try{if(typeof showSigns==="function"){showSigns._done=0;showSigns._txing=0}}catch(e){}
 setLang();
 try{if(typeof route==="function")route()}catch(e){}
 try{if(location.hash==="#settings"&&typeof showSettings==="function")showSettings()}catch(e){}
 if(isEn()){try{document.title=lookup(document.title)||document.title}catch(e){}sweep()}
 else{try{document.title="قانون تنسيق النقل والمرور"}catch(e){}}
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setLang);else setLang();
window.addEventListener("online",function(){schedulePump()});
})();
