const defaultRoles=[
 ["Mafia",3],["Detective",1],["Doctor",1],["Citizen",8]
];

// للتجربة المحلية فقط.
// في النسخة الحقيقية يجب نقل هذه الصلاحيات إلى Backend وعدم وضعها داخل JavaScript.
const ADMIN_NAME="Mohammed";
const ADMIN_PHONE="0780932336";

let selectedGender=null;
let currentUser=null;

function $(id){return document.getElementById(id)}

function selectGender(gender){
  selectedGender=gender;
  document.querySelectorAll(".gender-btn").forEach(b=>b.classList.remove("selected"));
  document.querySelector(`[data-gender="${gender}"]`).classList.add("selected");
}

function login(){
 const n=$("name").value.trim(),p=$("phone").value.trim();
 if(!n||!p){alert("اكتب الاسم ورقم الهاتف");return}
 if(!selectedGender){alert("اختر شباب أو فتيات أولاً");return}

 currentUser={name:n,phone:p,gender:selectedGender,role:"player"};
 localStorage.setItem("mafiaUser",JSON.stringify(currentUser));
 enterApp();
}

function showAdminLogin(){show("adminLogin")}

function adminLogin(){
 const n=$("adminName").value.trim(),p=$("adminPhone").value.trim();
 if(n!==ADMIN_NAME || p!==ADMIN_PHONE){
   alert("بيانات الإدارة غير صحيحة");
   return;
 }
 currentUser={name:n,phone:p,role:"admin"};
 localStorage.setItem("mafiaUser",JSON.stringify(currentUser));
 enterApp();
}

function enterApp(){
 $("login").classList.add("hidden");
 $("adminLogin").classList.add("hidden");
 $("home").classList.remove("hidden");

 const isAdmin=currentUser.role==="admin";
 $("roleBadge").textContent=isAdmin?"إدارة":(currentUser.gender==="male"?"شباب":"فتيات");
 $("welcome").innerHTML=isAdmin
   ? `<h1>أهلاً ${escapeHtml(currentUser.name)} 👑</h1><p>لوحة الإدارة الخاصة بالكافيه</p>`
   : `<h1>أهلاً ${escapeHtml(currentUser.name)} 👋</h1>`;
 $("genderNotice").textContent=isAdmin
   ? "لديك صلاحيات الإدارة."
   : currentUser.gender==="male"
      ? "أنت داخل مساحة الشباب. شات الفتيات غير ظاهر لك."
      : "أنت داخل مساحة الفتيات. شات الشباب غير ظاهر لك.";

 document.querySelectorAll(".admin-only").forEach(x=>x.classList.toggle("hidden",!isAdmin));
 $("chatTileTitle").textContent=isAdmin?"الشات":"شات "+(currentUser.gender==="male"?"الشباب":"الفتيات");

 if(isAdmin) $("adminCurrent").textContent=currentUser.name;
}

function openMyChat(){
 if(!currentUser){show("login");return}
 show("chat");
 const isAdmin=currentUser.role==="admin";
 const gender=isAdmin?"male":currentUser.gender;
 $("chatTitle").textContent=isAdmin?"💬 إدارة الشات":"💬 شات "+(gender==="male"?"الشباب":"الفتيات");
 $("chatPrivacy").textContent=isAdmin
   ? "الإدارة ترى غرف الشات للإشراف."
   : "🔒 هذه الغرفة مخصصة لفئتك فقط. لا يتم عرض الغرفة الأخرى هنا.";
 renderChat(gender);
}

function renderChat(gender){
 const key="mafiaChat_"+gender;
 const messages=JSON.parse(localStorage.getItem(key)||"[]");
 $("chatMessages").innerHTML=messages.length
   ? messages.map(m=>`<div class="chat-msg"><small>${escapeHtml(m.name)}</small>${escapeHtml(m.text)}</div>`).join("")
   : "<p>لا توجد رسائل بعد.</p>";
}

function sendMessage(){
 if(!currentUser)return;
 const text=$("chatInput").value.trim();
 if(!text)return;
 const gender=currentUser.role==="admin"?"male":currentUser.gender;
 const key="mafiaChat_"+gender;
 const messages=JSON.parse(localStorage.getItem(key)||"[]");
 messages.push({name:currentUser.name,text});
 localStorage.setItem(key,JSON.stringify(messages));
 $("chatInput").value="";
 renderChat(gender);
}

function logout(){
 localStorage.removeItem("mafiaUser");
 currentUser=null; selectedGender=null;
 $("roleBadge").textContent="زائر";
 document.querySelectorAll(".screen").forEach(x=>x.classList.add("hidden"));
 $("login").classList.remove("hidden");
 document.querySelectorAll(".gender-btn").forEach(b=>b.classList.remove("selected"));
}

function show(id){
 document.querySelectorAll(".screen").forEach(x=>x.classList.add("hidden"));
 $(id).classList.remove("hidden");
}

function addRole(name="",count=1){
 const row=document.createElement("div");row.className="role";
 row.innerHTML=`<input class="rname" placeholder="اسم الكرت" value="${escapeHtml(name)}"><input class="rcount" type="number" min="0" value="${count}"><button class="remove" onclick="this.parentElement.remove()">×</button>`;
 $("roles").appendChild(row);
}

function calculate(){
 const players=+$("players").value;
 const rows=[...document.querySelectorAll(".role")].map(r=>({name:r.querySelector(".rname").value.trim(),count:+r.querySelector(".rcount").value})).filter(r=>r.name&&r.count>0);
 let total=rows.reduce((s,r)=>s+r.count,0);
 if(!players||!rows.length){$("distribution").innerHTML='<div class="result">أدخل عدد اللاعبين والكروت المتوفرة.</div>';return}
 let result=rows.map(r=>({...r,used:Math.min(r.count,Math.max(0,Math.floor(r.count*players/total)))}));
 let used=result.reduce((s,r)=>s+r.used,0),left=players-used;
 const sorted=[...result].sort((a,b)=>b.count-a.count);
 for(let i=0;i<left;i++)sorted[i%sorted.length].used++;
 $("distribution").innerHTML='<div class="result"><h3>التوزيع المقترح</h3>'+result.map(r=>`<div>🃏 ${escapeHtml(r.name)} × <b>${r.used}</b> <small>(المتوفر ${r.count})</small></div>`).join("")+`<hr><b>المجموع: ${players} لاعب</b></div>`;
}

function escapeHtml(value){
 return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

(function init(){
 defaultRoles.forEach(x=>addRole(...x));
 const u=JSON.parse(localStorage.getItem("mafiaUser")||"null");
 if(u){currentUser=u;enterApp()}
})();