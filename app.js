const defaultRoles=[
 ["Mafia",3],["Detective",1],["Doctor",1],["Citizen",8]
];
function $(id){return document.getElementById(id)}
function login(){
 const n=$("name").value.trim(),p=$("phone").value.trim();
 if(!n||!p){alert("اكتب الاسم ورقم الهاتف");return}
 localStorage.setItem("mafiaUser",JSON.stringify({name:n,phone:p}));
 $("login").classList.add("hidden");$("home").classList.remove("hidden");
}
function show(id){
 document.querySelectorAll(".screen").forEach(x=>x.classList.add("hidden"));
 $(id).classList.remove("hidden");
}
function addRole(name="",count=1){
 const row=document.createElement("div");row.className="role";
 row.innerHTML=`<input class="rname" placeholder="اسم الكرت" value="${name}"><input class="rcount" type="number" min="0" value="${count}"><button class="remove" onclick="this.parentElement.remove()">×</button>`;
 $("roles").appendChild(row);
}
function calculate(){
 const players=+$("players").value;
 const rows=[...document.querySelectorAll(".role")].map(r=>({name:r.querySelector(".rname").value.trim(),count:+r.querySelector(".rcount").value})).filter(r=>r.name&&r.count>0);
 let total=rows.reduce((s,r)=>s+r.count,0);
 if(!players||!rows.length){$("distribution").innerHTML='<div class="result">أدخل عدد اللاعبين والكروت المتوفرة.</div>';return}
 let result=rows.map(r=>({...r,used:Math.min(r.count, Math.max(0, Math.floor(r.count*players/total)))}));
 let used=result.reduce((s,r)=>s+r.used,0), left=players-used;
 const sorted=[...result].sort((a,b)=>b.count-a.count);
 for(let i=0;i<left;i++) sorted[i%sorted.length].used++;
 $("distribution").innerHTML='<div class="result"><h3>التوزيع المقترح</h3>'+result.map(r=>`<div>🃏 ${r.name} × <b>${r.used}</b> <small>(المتوفر ${r.count})</small></div>`).join("")+
 `<hr><b>المجموع: ${players} لاعب</b></div>`;
}
(function init(){
 defaultRoles.forEach(x=>addRole(...x));
 const u=JSON.parse(localStorage.getItem("mafiaUser")||"null");
 if(u){$("login").classList.add("hidden");$("home").classList.remove("hidden")}
})();