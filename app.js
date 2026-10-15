const SUPABASE_URL="https://azumnbymwhbaltxbphnr.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dW1uYnltd2hiYWx0eGJwaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODAzMDQsImV4cCI6MjEwNzY1NjMwNH0.KXMl7IdCPrwxh8v15WaGIQKA-YIHPGcUKMaxCmNS8r0";
const supa=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let cur=localStorage.getItem("currentAt")||null,pg=1,currentChat=null,blocked=JSON.parse(localStorage.getItem("blocked")||"[]");

function show(id){document.querySelectorAll(".screen").forEach(s=>{s.classList.remove("active");s.style.display="none";});let e=document.getElementById(id);if(e){e.classList.add("active");e.style.display="flex";}}
setTimeout(()=>{let s=document.getElementById("splash");if(s){s.style.display="none";}if(cur){show("app");loadChats();loadInvits();}else{show("guide");}},3000);
function setPage(n){pg=n;document.querySelectorAll(".page").forEach((p,i)=>p.classList.toggle("active",i+1==n));document.querySelectorAll(".dots span").forEach((d,i)=>d.classList.toggle("active",i+1==n));let b=document.getElementById("nextBtn");if(b)b.textContent=n==3?"Commencer":"Suivant";}
document.getElementById("nextBtn")?.addEventListener("click",()=>{if(pg<3)setPage(pg+1);else show("auth");});
document.getElementById("passer")?.addEventListener("click",()=>show("auth"));
document.getElementById("dot1")?.addEventListener("click",()=>setPage(1));document.getElementById("dot2")?.addEventListener("click",()=>setPage(2));document.getElementById("dot3")?.addEventListener("click",()=>setPage(3));

// AUTH
document.getElementById("editPic")?.addEventListener("click",()=>document.getElementById("fileInput").click());
document.getElementById("bio")?.addEventListener("input",e=>{document.getElementById("counter").textContent=e.target.value.length+"/100";});
document.getElementById("atInput")?.addEventListener("input",e=>{if(!e.target.value.startsWith("@"))e.target.value="@"+e.target.value.replace(/@/g,"");let av=document.getElementById("avatarBox");if(av)av.firstChild.textContent=e.target.value[1]||"M";});
document.getElementById("createBtn")?.addEventListener("click",async()=>{
let at=document.getElementById("atInput").value.trim(),pwd=document.getElementById("pwdInput").value.trim(),bio=document.getElementById("bio").value.trim(),err=document.getElementById("pwdError");
if(!/^[A-Za-z]{4}[0-9]{4}$/.test(pwd)){err.style.display="block";return;}err.style.display="none";
if(at.length<2)return;let {data}=await supa.from("users").select("*").eq("at",at);if(data&&data.length>0){alert("@ déjà pris");return;}
await supa.from("users").insert([{at:at,pwd:pwd,bio:bio,badge:false}]);localStorage.setItem("currentAt",at);cur=at;show("app");loadChats();
});
document.getElementById("goLogin")?.addEventListener("click",()=>{let b=document.getElementById("loginBox");b.style.display=b.style.display=="flex"?"none":"flex";});
document.getElementById("loginBtn")?.addEventListener("click",async()=>{
let at=document.getElementById("loginAt").value.trim(),pwd=document.getElementById("loginPwd").value.trim();
let {data}=await supa.from("users").select("*").eq("at",at).eq("pwd",pwd);if(data&&data.length>0){localStorage.setItem("currentAt",at);cur=at;show("app");loadChats();}else alert("Mauvais @ ou mdp");
});

// CHATS + OFFICIEL
async function loadChats(){let {data}=await supa.from("users").select("*").neq("at",cur);let list=document.getElementById("chatList");if(!list)return;list.innerHTML="";
(data||[]).forEach(u=>{
if(u.at==cur||blocked.includes(u.at))return;
let d=document.createElement("div");d.style.cssText="display:flex;gap:12px;padding:12px;background:#1E293B;margin:8px;border-radius:12px;cursor:pointer;align-items:center";
let badge=u.badge?`<span style="background:#00C950;width:15px;height:15px;border-radius:50%;display:inline-flex;justify-content:center;align-items:center;font-size:8px;color:#fff">✓</span>`:"";
d.innerHTML=`<div style="width:50px;height:50px;background:#070A14;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid #1E293B">${u.at[1].toUpperCase()}</div><div style="flex:1"><b>${u.at}</b> ${badge}<p style="color:#9CA3AF;font-size:12px" class="typing-${u.at}">Dernier message...</p></div><button class="inviteBtn" data-at="${u.at}" style="background:#2563EB;color:#fff;border:none;padding:6px 12px;border-radius:12px;font-size:12px">Inviter</button>`;
d.addEventListener("click",e=>{if(!e.target.classList.contains("inviteBtn"))openChat(u);});
list.appendChild(d);
});
list.querySelectorAll(".inviteBtn").forEach(b=>{b.addEventListener("click",async e=>{e.stopPropagation();let target=e.target.dataset.at;if(blocked.includes(target))return;await supa.from("invitations").insert([{from_at:cur,to_at:target,status:"pending"}]);e.target.textContent="Invité";e.target.style.background="#9CA3AF";});});
}

// INVITATIONS ACTUS - Accepter vert #00C950 Refuser gris #9CA3AF bloqué à jamais
async function loadInvits(){
let {data}=await supa.from("invitations").select("*").eq("to_at",cur).eq("status","pending");
let actus=document.getElementById("navActus");if(!actus)return;
if(data&&data.length>0){actus.innerHTML=`Actus <span style="background:red;width:15px;height:15px;border-radius:50%;display:inline-flex;justify-content:center;font-size:10px">${data.length}</span>`;}
}
document.getElementById("navActus")?.addEventListener("click",async()=>{
let {data}=await supa.from("invitations").select("*").eq("to_at",cur).eq("status","pending");
let html=`<div style="padding:16px"><h3>Invitations</h3>`;
(data||[]).forEach(inv=>{
html+=`<div style="display:flex;justify-content:space-between;background:#1E293B;padding:12px;margin:8px 0;border-radius:12px"><span>${inv.from_at}</span><div><button onclick="acceptInv('${inv.from_at}')" style="background:#00C950;color:#fff;border:none;padding:6px 12px;border-radius:8px;margin-right:8px">Accepter</button><button onclick="refuseInv('${inv.from_at}')" style="background:#9CA3AF;color:#fff;border:none;padding:6px 12px;border-radius:8px">Refuser</button></div></div>`;
});
html+=`</div><button id="closeActus" style="margin:16px;background:#1E293B;color:#fff;border:none;padding:12px;border-radius:12px">Fermer</button>`;
let list=document.getElementById("chatList");list.innerHTML=html;document.getElementById("closeActus").addEventListener("click",()=>loadChats());
});
window.acceptInv=async(fromAt)=>{
await supa.from("invitations").update({status:"accepted"}).eq("from_at",fromAt).eq("to_at",cur);
await supa.from("contacts").insert([{owner:cur,contact:fromAt}]);
alert("Accepté!");loadChats();
};
window.refuseInv=async(fromAt)=>{
await supa.from("invitations").update({status:"refused"}).eq("from_at",fromAt).eq("to_at",cur);
blocked.push(fromAt);localStorage.setItem("blocked",JSON.stringify(blocked));alert("Refusé - bloqué à jamais");loadChats();
};

// CHAT BULLES + COCHES WhatsApp
function openChat(u){
currentChat=u;show("chatView");document.getElementById("chatName").textContent=u.at;document.getElementById("chatAvatar").textContent=u.at[1].toUpperCase();loadMessages(u.at);
}
async function loadMessages(toAt){
let {data}=await supa.from("messages").select("*").or(`and(from_at.eq.${cur},to_at.eq.${toAt}),and(from_at.eq.${toAt},to_at.eq.${cur})`).order("created_at",{ascending:true});
let box=document.getElementById("messages");box.innerHTML="";box.style.cssText="flex:1;overflow:auto;padding:10px;background:#0A0F1E;display:flex;flex-direction:column;gap:8px";
(data||[]).forEach(m=>{
let isMe=m.from_at==cur;
let coche=m.read?"<span style='color:#2563EB'>✓✓</span>":m.delivered?"<span style='color:#9CA3AF'>✓✓</span>":"<span style='color:#9CA3AF'>✓</span>";
let d=document.createElement("div");d.style.cssText=`max-width:60%;padding:10px 12px;border-radius:18px;${isMe?'background:#2563EB;align-self:flex-end;color:#fff':'background:#1E293B;align-self:flex-start;color:#fff'}`;
d.innerHTML=`${m.text}<div style="font-size:10px;color:#9CA3AF;text-align:right;margin-top:4px">${new Date(m.created_at).toLocaleTimeString().slice(0,5)} ${isMe?coche:""}</div>`;
box.appendChild(d);
});box.scrollTop=box.scrollHeight;
}
document.getElementById("sendBtn")?.addEventListener("click",async()=>{
let input=document.getElementById("msgInput"),txt=input.value.trim();if(!txt||!currentChat)return;
await supa.from("messages").insert([{from_at:cur,to_at:currentChat.at,text:txt,delivered:false,read:false}]);
await supa.from("typing").upsert([{user_at:cur,typing:false}]);input.value="";loadMessages(currentChat.at);
});
document.getElementById("msgInput")?.addEventListener("input",async()=>{
await supa.from("typing").upsert([{user_at:cur,typing:true}]);if(window.typingTimeout)clearTimeout(window.typingTimeout);
window.typingTimeout=setTimeout(async()=>{await supa.from("typing").upsert([{user_at:cur,typing:false}]);},3000);
});

// DROPDOWN + BADGE 3 CARTES MEME TEMPS + 5 PLACES + LANGUE 8 + GROUPE 50 MAX
document.getElementById("iconMenu")?.addEventListener("click",()=>{let d=document.getElementById("dropdown");d.style.display=d.style.display=="none"?"block":"none";});
document.getElementById("dropdown")?.addEventListener("click",e=>{
let a=e.target.dataset.a;document.getElementById("dropdown").style.display="none";
if(a=="badge")showBadgePage();if(a=="settings")showSettings();if(a=="lang")showLang();if(a=="logout"){localStorage.clear();location.reload();}if(a=="group")showGroup();
});
function showBadgePage(){
let list=document.getElementById("chatList");
list.innerHTML=`<div style="padding:16px"><h3>Choisis 1 Badge - 5 places gratuites</h3><div style="display:flex;gap:12px;margin-top:16px">
<div class="badgeCard" data-type="perso" style="flex:1;background:#1E293B;padding:16px;border-radius:12px;text-align:center;cursor:pointer;border:2px solid transparent"><p>Personnel</p><small style="color:#9CA3AF">5 libres</small></div>
<div class="badgeCard" data-type="entreprise" style="flex:1;background:#1E293B;padding:16px;border-radius:12px;text-align:center;cursor:pointer;border:2px solid transparent"><p>Entreprise</p><small style="color:#9CA3AF">5 libres</small></div>
<div class="badgeCard" data-type="star" style="flex:1;background:#1E293B;padding:16px;border-radius:12px;text-align:center;cursor:pointer;border:2px solid transparent"><p>Star</p><small style="color:#9CA3AF">5 libres</small></div>
</div><div id="badgeForm" style="margin-top:16px"></div></div>`;
list.querySelectorAll(".badgeCard").forEach(c=>{
c.addEventListener("click",async e=>{
list.querySelectorAll(".badgeCard").forEach(x=>x.style.border="2px solid transparent");e.currentTarget.style.border="2px solid #2563EB";
let type=e.currentTarget.dataset.type;
let {count}=await supa.from("badges").select("*",{count:"exact"}).eq("type",type).eq("status","approved");
let free=5-(count||0);if(free<=0){alert("Plus de place gratuite");return;}
document.getElementById("badgeForm").innerHTML=`<input id="badgeDoc" placeholder="Lien doc / ID" style="width:100%;background:#1E293B;border:none;padding:12px;border-radius:12px;color:#fff"><button id="sendBadge" style="width:100%;margin-top:12px;background:#2563EB;color:#fff;border:none;padding:12px;border-radius:12px">Envoyer demande ${type}</button><p style="color:#00C950;margin-top:8px">Places restantes: ${free} → Badge direct!</p>`;
document.getElementById("sendBadge").addEventListener("click",async()=>{
let doc=document.getElementById("badgeDoc").value;
await supa.from("badges").insert([{user_at:cur,type:type,doc:doc,status:"approved"}]);
await supa.from("users").update({badge:true,badge_type:type}).eq("at",cur);
alert("Badge obtenu direct - 5 places gratuites!");loadChats();
});
});
});
}
function showSettings(){
let list=document.getElementById("chatList");
list.innerHTML=`<div style="padding:0"><div style="padding:16px;display:flex;gap:12px;align-items:center"><div style="width:80px;height:80px;background:#1E293B;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px">${cur?cur[1].toUpperCase():"M"}</div><div><b>${cur}</b><p style="color:#9CA3AF">Mon profil - seulement ici</p></div></div>
<div class="setRow" style="padding:16px;border-bottom:1px solid #1E293B;display:flex;gap:12px;cursor:pointer"><span>🔒</span><div><b>Confidentialité</b><p style="color:#9CA3AF;font-size:12px">Bloqués, chiffré</p></div></div>
<div class="setRow" style="padding:16px;border-bottom:1px solid #1E293B;display:flex;gap:12px;cursor:pointer"><span>🔔</span><div><b>Notifications</b><p style="color:#9CA3AF;font-size:12px">Messages, invitations</p></div></div>
<div class="setRow" style="padding:16px;border-bottom:1px solid #1E293B;display:flex;gap:12px;cursor:pointer" onclick="showBadgePage()"><span>✓</span><div><b>Badge</b><p style="color:#9CA3AF;font-size:12px">3 cartes choisir 1, 5 places gratuites</p></div></div>
<div class="setRow" style="padding:16px;border-bottom:1px solid #1E293B;display:flex;gap:12px;cursor:pointer" onclick="showLang()"><span>🌐</span><div><b>Langue</b><p style="color:#9CA3AF;font-size:12px">Français, English, 中文, Español, Português, العربية, Kiswahili, Lingala</p></div></div>
</div>`;
}
function showLang(){
let list=document.getElementById("chatList");
list.innerHTML=`<div style="padding:16px"><h3>Langue - tout change</h3>
<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
<button onclick="setLang('fr')" style="padding:12px;background:#1E293B;border:none;color:#fff;border-radius:12px;text-align:left">Français</button>
<button onclick="setLang('en')" style="padding:12px;background:#1E293B;border:none;color:#fff;border-radius:12px;text-align:left">English</button>
<button onclick="setLang('zh')" style="padding:12px;background:#1E293B;border:none;color:#fff;border-radius:12px;text-align:left">中文</button>
<button onclick="setLang('es')" style="padding:12px;background:#1E293B;border:none;color:#fff;border-radius:12px;text-align:left">Español</button>
<button onclick="setLang('pt')" style="padding:12px;background:#1E293B;border:none;color:#fff;border-radius:12px;text-align:left">Português</button>
<button onclick="setLang('ar')" style="padding:12px;background:#1E293B;border:none;color:#fff;border-radius:12px;text-align:left">العربية</button>
<button onclick="setLang('sw')" style="padding:12px;background:#1E293B;border:none;color:#fff;border-radius:12px;text-align:left">Kiswahili</button>
<button onclick="setLang('ln')" style="padding:12px;background:#1E293B;border:none;color:#fff;border-radius:12px;text-align:left">Lingala</button>
</div></div>`;
}
window.setLang=(l)=>{localStorage.setItem("lang",l);alert("Langue changée: "+l+" - tout change instant");location.reload();};
function showGroup(){
let list=document.getElementById("chatList");
list.innerHTML=`<div style="padding:16px"><h3>Nouveau Groupe 50 max</h3><input id="groupName" placeholder="Nom groupe" style="width:100%;background:#1E293B;border:none;padding:12px;border-radius:12px;color:#fff;margin-top:12px"><button id="createGroupBtn" style="width:100%;margin-top:12px;background:#2563EB;color:#fff;border:none;padding:12px;border-radius:12px">Créer Groupe 50 max</button><p style="color:#9CA3AF;font-size:12px;margin-top:8px">Photo lettre si pas photo, admin peut ajouter/supprimer</p></div>`;
document.getElementById("createGroupBtn").addEventListener("click",async()=>{
let name=document.getElementById("groupName").value.trim();if(!name)return;
await supa.from("groups").insert([{name:name,owner:cur,members:[cur]}]);alert("Groupe créé 50 max!");loadChats();
});
}

document.getElementById("backBtn")?.addEventListener("click",()=>{show("app");loadChats();});
document.getElementById("subBtn")?.addEventListener("click",function(){this.textContent=this.textContent=="S'abonner"?"Abonné ✓":"S'abonner";});
supa.channel("messages").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},p=>{if(currentChat&& (p.new.from_at==currentChat.at||p.new.to_at==currentChat.at))loadMessages(currentChat.at);}).subscribe();
supa.channel("typing").on("postgres_changes",{event:"*",schema:"public",table:"typing"},p=>{
let t=document.getElementById("typingStatus");if(p.new&&p.new.typing){let el=document.querySelector(`.typing-${p.new.user_at}`);if(el){el.textContent="en train d'écrire...";el.style.color="#00C950";}if(t){t.textContent="en train d'écrire...";t.style.color="#00C950";setTimeout(()=>{if(el)el.textContent="Dernier message...";if(t)t.textContent="";},3000);}}
}).subscribe();
