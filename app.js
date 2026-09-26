const KEY="mtas_v1";
const demo={
 user:null, role:"player", gender:null,
 settings:{registration:true,fee:1},
 games:[{id:1,title:"Mafia Night #1",date:"2026-10-01",time:"20:00",capacity:20,closed:false}],
 votes:{"2026-10-01 20:00":0},
 players:[],
 standings:{men:[],women:[]},
 cards:[{name:"شيخ المافيا",team:"Mafia"},{name:"مافيا",team:"Mafia"},{name:"دكتور",team:"Town"},{name:"محقق",team:"Town"},{name:"مواطن",team:"Town"}],
 finance:[]
};
let db=JSON.parse(localStorage.getItem(KEY)||"null")||demo;
db.admin=db.admin||{username:"admin",password:"Mafia1234"};
db.session=db.session||null;
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(t){let x=document.createElement("div");x.className="toast";x.textContent=t;document.body.append(x);setTimeout(()=>x.remove(),2200)}
function login(){
 const name=document.querySelector("#name").value.trim(), phone=document.querySelector("#phone").value.trim(), gender=document.querySelector("#gender").value;
 if(!name||!phone||!gender)return toast("أكمل البيانات");
 const exists=db.players.find(p=>p.phone===phone);
 if(exists && exists.gender!==gender)return toast("هذا الرقم مسجل في قسم آخر");
 if(exists && exists.banned)return toast("هذا الحساب محظور");
 db.user=exists||{id:Date.now(),name,phone,gender,attendance:{},points:0,banned:false};
 if(!exists)db.players.push(db.user); else {db.user.name=name;db.user.gender=gender;}
 db.gender=gender; db.role="player"; db.session={type:"player",id:db.user.id}; save(); render();
}
function adminLogin(){
 const u=document.querySelector("#adminUser").value.trim(), p=document.querySelector("#adminPass").value;
 if(u!==db.admin.username||p!==db.admin.password)return toast("اسم المستخدم أو كلمة السر غير صحيحة");
 db.user={name:"Admin"};db.role="admin";db.session={type:"admin"};save();render();
}
function logout(){db.user=null;db.role="player";db.session=null;save();render()}
function showAdminLogin(){document.querySelector("#loginBox").classList.add("hidden");document.querySelector("#adminBox").classList.remove("hidden")}
function showPlayerLogin(){document.querySelector("#adminBox").classList.add("hidden");document.querySelector("#loginBox").classList.remove("hidden")}

function vote(v){db.user.attendance[1]=v;let p=db.players.find(x=>x.id===db.user.id);if(p)p.attendance[1]=v;save();render();toast("تم حفظ اختيارك")}
function tab(t){document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x.dataset.tab===t));document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("hidden",x.dataset.page!==t))}
function sendChat(){
 const i=document.querySelector("#chatInput");if(!i.value.trim())return;
 const k="chat_"+db.gender;db[k]=db[k]||[];db[k].push({name:db.user.name,text:i.value.trim(),me:true});save();renderChat();i.value="";
}
function renderChat(){
 const k="chat_"+db.gender;const arr=db[k]||[{name:"الإدارة",text:"أهلاً بكم في شات Mafia Talat Alshamale"}];
 const box=document.querySelector("#messages");if(!box)return;
 box.innerHTML=arr.map(m=>`<div class="msg ${m.me?"me":""}"><b>${esc(m.name)}</b><div>${esc(m.text)}</div><small>الآن</small></div>`).join("");
 box.scrollTop=box.scrollHeight;
}
function addCard(){
 const n=document.querySelector("#cardName").value.trim(),team=document.querySelector("#cardTeam").value;
 if(!n)return toast("اكتب اسم الكرت");db.cards.push({name:n,team});save();render();toast("تمت إضافة الكرت");
}
function distribute(){
 const count=+document.querySelector("#playerCount").value||0;if(!count)return toast("أدخل عدد اللاعبين");
 if(db.cards.length<count)return toast("عدد الكروت أقل من عدد اللاعبين");
 let a=[...db.cards].sort(()=>Math.random()-.5).slice(0,count);
 document.querySelector("#distribution").innerHTML=a.map((c,i)=>`<div class="list-item row"><b>لاعب ${i+1}</b><span class="pill">${esc(c.name)}</span></div>`).join("");
}
function addGame(){
 const d=document.querySelector("#gd").value,t=document.querySelector("#gt").value,c=+document.querySelector("#gc").value||20;
 if(!d||!t)return toast("حدد التاريخ والوقت");db.games.unshift({id:Date.now(),title:"Mafia Night #"+(db.games.length+1),date:d,time:t,capacity:c,closed:false});save();render();toast("تم إنشاء اللعبة");
}
function addFinance(){
 const amount=+document.querySelector("#fa").value||0,note=document.querySelector("#fn").value||"رسوم لعبة";db.finance.unshift({amount,note,date:new Date().toLocaleDateString("ar-JO")});save();render();toast("تم تسجيل الإيراد");
}
function setWinner(){
 const n=document.querySelector("#winner").value.trim(),g=document.querySelector("#winnerGender").value,pts=+document.querySelector("#winnerPts").value||0;if(!n)return toast("اكتب اسم الفائز");
 db.standings[g]=db.standings[g]||[];let x=db.standings[g].find(p=>p.name===n);if(!x)db.standings[g].push(x={name:n,points:0,wins:0});x.points+=pts;x.wins++;save();render();toast("تم تسجيل النتيجة");
}
function render(){
 const app=document.querySelector("#app");
 if(db.session && db.session.type==="player"){const u=db.players.find(x=>x.id===db.session.id);if(u){db.user=u;db.gender=u.gender;db.role="player";}}
 if(db.session && db.session.type==="admin"){db.user={name:"Admin"};db.role="admin";}
 if(!db.user){app.innerHTML=`<div class="splash"><div class="splash-box"><img class="logo" src="assets/logo.png" alt="Talat Alshamale"><div class="brand">Mafia Talat Alshamale</div><div class="sub">نظام تنظيم مسابقات المافيا</div><div id="loginBox" class="panel">
 <div class="field"><label>الاسم</label><input id="name" placeholder="اكتب اسمك"></div>
 <div class="field"><label>رقم الهاتف</label><input id="phone" inputmode="tel" placeholder="07xxxxxxxx"></div>
 <div class="field"><label>القسم</label><select id="gender"><option value="">اختر</option><option value="men">رجال</option><option value="women">إناث</option></select></div>
 <button class="btn primary full" onclick="login()">دخول وإنشاء الحساب</button>
 <button class="btn ghost full" style="margin-top:8px" onclick="showAdminLogin()">دخول الإدارة</button>
 </div>
 <div id="adminBox" class="panel hidden">
 <h3>🔐 دخول الإدارة</h3><div class="field"><label>اسم المستخدم</label><input id="adminUser" autocomplete="username" placeholder="Username"></div><div class="field"><label>كلمة السر</label><input id="adminPass" type="password" autocomplete="current-password" placeholder="Password"></div><button class="btn primary full" onclick="adminLogin()">دخول</button><button class="btn ghost full" style="margin-top:8px" onclick="showPlayerLogin()">رجوع لتسجيل اللاعبين</button>
 </div></div></div>`;return}
 if(db.role==="admin")return renderAdmin();
 renderPlayer();
}
function shell(content,nav){
 return `<div class="top"><div class="top-in"><div class="mini"><img src="assets/logo.png"><div><strong>Mafia Talat Alshamale</strong><small>${db.gender==="men"?"رجال":"إناث"}</small></div></div><button class="btn ghost" onclick="logout()">خروج</button></div></div><main class="wrap">${nav}<div>${content}</div></main>`;
}
function renderPlayer(){
 const g=db.gender,stand=[...(db.standings[g]||[])].sort((a,b)=>b.points-a.points),game=db.games[0];
 const content=`<section class="grid">
 <div class="col-12"><div class="card hero"><div class="eyebrow">الفعالية القادمة</div><h1>${esc(game.title)}</h1><div class="muted">${game.date} — ${game.time}</div><div class="actions"><button class="btn success" onclick="vote('yes')">🟢 أستطيع الحضور</button><button class="btn warn" onclick="vote('maybe')">🟡 ربما</button><button class="btn danger" onclick="vote('no')">🔴 لا أستطيع</button></div></div></div>
 <div class="col-4"><div class="card"><div class="muted">نقاطي</div><div class="stat gold">${db.user.points||0}</div></div></div>
 <div class="col-4"><div class="card"><div class="muted">الألعاب</div><div class="stat">${db.games.length}</div></div></div>
 <div class="col-4"><div class="card"><div class="muted">الحالة</div><div class="stat">${db.user.attendance?.[game.id]==="yes"?"✓":db.user.attendance?.[game.id]==="maybe"?"؟":"—"}</div></div></div>
 <div class="col-6"><div class="card"><div class="row"><h3>🏆 المتصدرون</h3><span class="pill">${g==="men"?"رجال":"إناث"}</span></div><div class="list">${stand.length?stand.slice(0,5).map((p,i)=>`<div class="rank"><div class="rank-no">${i+1}</div><b>${esc(p.name)}</b><span class="gold">${p.points} نقطة</span></div>`).join(""):"لا توجد نتائج بعد"}</div></div></div>
 <div class="col-6"><div class="card chat"><div class="row"><h3>💬 الشات</h3><span class="pill">${g==="men"?"رجال":"إناث"}</span></div><div id="messages" class="messages"></div><div class="chatbar"><input id="chatInput" placeholder="اكتب رسالة..."><button class="btn primary" onclick="sendChat()">إرسال</button></div></div></div>
 </section>`;
 const nav=`<div class="nav"><button class="active">الرئيسية</button></div>`;
 document.querySelector("#app").innerHTML=shell(content,nav);renderChat();
}
function renderAdmin(){
 const total=db.finance.reduce((s,x)=>s+x.amount,0), men=db.players.filter(p=>p.gender==="men").length,women=db.players.filter(p=>p.gender==="women").length;
 const content=`<section class="grid">
 <div class="col-12"><div class="card hero"><div class="eyebrow">لوحة الإدارة</div><h1>مركز التحكم</h1><div class="muted">إدارة الألعاب، اللاعبين، الكروت، المسابقات والشات والإيرادات.</div></div></div>
 <div class="col-4"><div class="card"><div class="muted">اللاعبون — رجال</div><div class="stat">${men}</div></div></div><div class="col-4"><div class="card"><div class="muted">اللاعبون — إناث</div><div class="stat">${women}</div></div></div><div class="col-4"><div class="card"><div class="muted">إجمالي الإيرادات</div><div class="stat gold">${total} JD</div></div></div>
 <div class="col-6"><div class="card"><h3>📅 إنشاء لعبة</h3><div class="field"><label>التاريخ</label><input id="gd" type="date"></div><div class="field"><label>الوقت</label><input id="gt" type="time"></div><div class="field"><label>عدد المقاعد</label><input id="gc" type="number" value="20"></div><button class="btn primary" onclick="addGame()">إنشاء الموعد</button></div></div>
 <div class="col-6"><div class="card"><h3>💰 رسوم الاشتراك / الإيراد</h3><div class="field"><label>المبلغ JD</label><input id="fa" type="number" step="0.01" placeholder="مثال 20"></div><div class="field"><label>الوصف</label><input id="fn" placeholder="رسوم لعبة اليوم"></div><button class="btn primary" onclick="addFinance()">تسجيل الإيراد</button><div class="list" style="margin-top:10px">${db.finance.slice(0,5).map(x=>`<div class="list-item row"><span>${esc(x.note)}</span><b class="gold">${x.amount} JD</b></div>`).join("")||"لا توجد سجلات"}</div></div></div>
 <div class="col-6"><div class="card"><h3>🎴 إعداد الكروت</h3><div class="field"><label>اسم الكرت</label><input id="cardName" placeholder="مثال: حرباء المافيا"></div><div class="field"><label>الفريق</label><select id="cardTeam"><option>Mafia</option><option>Town</option><option>Neutral</option></select></div><button class="btn primary" onclick="addCard()">إضافة كرت</button><div class="list" style="margin-top:10px">${db.cards.map((c,i)=>`<div class="list-item row"><span>${i+1}. ${esc(c.name)}</span><span class="pill">${esc(c.team)}</span></div>`).join("")}</div></div></div>
 <div class="col-6"><div class="card"><h3>🎲 توزيع الأدوار</h3><div class="field"><label>عدد اللاعبين</label><input id="playerCount" type="number" placeholder="مثال 15"></div><button class="btn primary" onclick="distribute()">توزيع عشوائي</button><div id="distribution" class="list" style="margin-top:10px"></div></div></div>
 <div class="col-12"><div class="card"><h3>🏆 تسجيل فائز ونقاط</h3><div class="grid"><div class="col-4"><div class="field"><label>اسم الفائز</label><input id="winner" placeholder="اسم اللاعب"></div></div><div class="col-4"><div class="field"><label>القسم</label><select id="winnerGender"><option value="men">رجال</option><option value="women">إناث</option></select></div></div><div class="col-4"><div class="field"><label>النقاط</label><input id="winnerPts" type="number" value="10"></div></div></div><button class="btn primary" onclick="setWinner()">حفظ النتيجة</button></div></div>
 <div class="col-12"><div class="card"><div class="row"><h3>👥 المشتركين وأرقام الهواتف</h3><span class="pill">${db.players.length} مشترك</span></div><div class="list">${db.players.length?db.players.map(p=>`<div class="list-item row"><span><b>${esc(p.name)}</b> <span class="pill">${p.gender==="men"?"رجال":"إناث"}</span></span><span class="muted" dir="ltr">${esc(p.phone)}</span></div>`).join(""):"لا يوجد مشتركون بعد"}</div></div></div>
 <div class="col-12"><div class="card"><h3>🔔 رسائل خارج التطبيق</h3><div class="muted">هذه الوظيفة تحتاج Push Notifications حقيقية (Firebase/Web Push) حتى تصل الرسالة والجهاز مغلق. نقدر ربطها في المرحلة القادمة مع تحديد رجال/إناث أو أشخاص محددين.</div><div class="actions"><button class="btn ghost" onclick="toast('سيتم تفعيل الإشعارات الخارجية عند ربط خدمة Push')">تجهيز الإشعارات</button></div></div></div>
 </section>`;
 const nav=`<div class="nav"><button class="active">الرئيسية</button><button onclick="toast('إدارة الشات متاحة في النسخة المتصلة بقاعدة البيانات')">الشات</button><button onclick="toast('صفحة اللاعبين')">اللاعبون</button></div>`;
 document.querySelector("#app").innerHTML=shell(content,nav);
}
render();
