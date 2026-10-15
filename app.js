const SUPA_URL="https://azumnbymwhbaltxbphnr.supabase.co"
const SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dW1uYnltd2hiYWx0eGJwaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODAzMDQsImV4cCI6MjEwNzY1NjMwNH0.KXMl7IdCPrwxh8v15WaGIQKA-YIHPGcUKMaxCmNS8r0"
const supa=supabase.createClient(SUPA_URL,SUPA_KEY)
let me=JSON.parse(localStorage.getItem('me')||'null')
let chatWith=null
let g=0
const guides=[{t:"Discutez mondial",d:"Chattez avec le monde entier en temps réel",i:"💬"},{t:"Invitez avec @",d:"Trouvez amis avec @pseudo unique",i:"@"},{t:"Badge validé 15px",d:"Obtenez le rond vert 15px + ✔ 8px",i:"✔️"}]
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active')}
function renderG(){document.getElementById('gT').innerText=guides[g].t;document.getElementById('gD').innerText=guides[g].d;document.getElementById('gIcon').innerHTML=`<div style="font-size:70px">${guides[g].i}</div>`;document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i===g))}
function nextG(){g++;if(g>=3)goAuth();else renderG()}
function goAuth(){if(me){show('main');loadUsers()}else{show('auth')}}
function showGuide(){g=0;renderG();show('guide')}
window.onload=()=>{
renderG();
setTimeout(()=>{show('guide')},3000);
let f=document.getElementById('f');if(f)f.onchange=e=>{let r=new FileReader();r.onload=()=>{document.getElementById('prev').src=r.result;window.photo=r.result};r.readAsDataURL(e.target.files[0])};
let bio=document.getElementById('bio');if(bio)bio.oninput=()=>{document.getElementById('cnt').innerText=bio.value.length+'/100'};
}
function toggleLogin(){let b=document.getElementById('loginBox');b.style.display=b.style.display==='none'?'block':'none'}
async function register(){let p=document.getElementById('pseudo').value.trim();if(!p.startsWith('@'))p='@'+p;let pw=document.getElementById('pass').value.trim();if(!/^[A-Za-z]{4}[0-9]{4}$/.test(pw))return alert('Mot de passe 4 lettres + 4 chiffres ex Abcd1234');let bio=document.getElementById('bio').value.trim();let id=crypto.randomUUID();let {error}=await supa.from('users').insert({id,pseudo:p,mot_de_passe:pw,photo:window.photo||'',bio,badge_vert:false});if(error)return alert(error.message);me={id,pseudo:p,photo:window.photo,bio};localStorage.setItem('me',JSON.stringify(me));show('main');loadUsers()}
async function login(){let p=document.getElementById('lPseudo').value.trim();if(!p.startsWith('@'))p='@'+p;let pw=document.getElementById('lPass').value.trim();let {data}=await supa.from('users').select('*').eq('pseudo',p).single();if(!data||data.mot_de_passe!==pw)return alert('Pseudo ou mot de passe faux');me=data;localStorage.setItem('me',JSON.stringify(me));show('main');loadUsers()}
async function loadUsers(){let {data}=await supa.from('users').select('*');let div=document.getElementById('list');div.innerHTML='';data?.filter(u=>u.pseudo!==me?.pseudo).forEach(u=>{div.innerHTML+=`<div class="card" style="border:none;background:transparent;border-bottom:1px solid #1E293B;border-radius:0;margin:0" onclick="openChat('${u.pseudo}')"><img src="${u.photo||'https://via.placeholder.com/50'}" style="width:50px;height:50px;border-radius:50%;object-fit:cover"><div><b>${u.pseudo} ${u.badge_vert?'<span class=badge15><svg viewBox=0 0 12 12><path d=M2.5 6.5l2.5 2.5 4.5-5 /></svg></span>':''}</b><br><small style=color:#9CA3AF>${u.bio||'Salut j utilise MEIHO'} • 10:42</small></div></div>`})}
function filterUsers(){let q=document.getElementById('search').value.toLowerCase();let cards=document.querySelectorAll('#list.card');cards.forEach(c=>{c.style.display=c.innerText.toLowerCase().includes(q)?'flex':'none'})}
function tab(i){document.querySelectorAll('.b').forEach((b,idx)=>b.classList.toggle('active',idx===i));let l=document.getElementById('list');if(i===0)loadUsers();if(i===1)l.innerHTML='<div style=padding:20px;color:#9CA3AF>Actus: Invitations reçues<br><button onclick=loadInv() style=margin-top:10px;background:#00C950;border:none;padding:8px 12px;border-radius:8px;color:#fff> Voir invitations </button><br><br>Page officielle @officiel_MEIHO en haut</div>';if(i===2)l.innerHTML='<div style=padding:20px;color:#9CA3AF>Communautés: Groupes mondiaux<br><button onclick=newGroup() style=margin-top:10px;background:#2563EB;border:none;padding:8px 12px;border-radius:8px;color:#fff> Créer groupe </button></div>';if(i===3)l.innerHTML='<div style=padding:20px;color:#9CA3AF>Appels récents 📞<br>Vocal + Vidéo<br><button onclick=callVoice() style=margin-top:10px;background:#1E293B;border:none;padding:8px 12px;border-radius:8px;color:#fff> Appel vocal </button></div>'}
function openMenu(){let m=document.getElementById('menu');m.style.display=m.style.display==='block'?'none':'block'}
function openChatMenu(){let m=document.getElementById('chatMenu');m.style.display=m.style.display==='block'?'none':'block'}
function backMain(){show('main');chatWith=null;document.getElementById('menu').style.display='none';document.getElementById('chatMenu').style.display='none'}
function openOfficial(){show('official')}
function openSettings(){show('settings');document.getElementById('sPseudo').innerText=me?.pseudo||'';document.getElementById('sBio').innerText=me?.bio||'';document.getElementById('sPhoto').src=me?.photo||'https://via.placeholder.com/80';if(me?.badge_vert)document.getElementById('sBadge').innerHTML='<span class=badge15><svg viewBox=0 0 12 12><path d=M2.5 6.5l2.5 2.5 4.5-5 /></svg></span>';document.getElementById('menu').style.display='none'}
function openLang(){let l=prompt('Langue: fr / en / zh / es / pt / ar / sw / ln');if(l){localStorage.setItem('lang',l);alert('Langue '+l+' activée from meiho')}}
async function openChat(p){chatWith=p;let {data}=await supa.from('users').select('*').eq('pseudo',p).single();document.getElementById('cName').innerText=p;document.getElementById('cPhoto').src=data?.photo||'https://via.placeholder.com/40';document.getElementById('badgeChat').innerHTML=data?.badge_vert?'<span class=badge15><svg viewBox=0 0 12 12><path d=M2.5 6.5l2.5 2.5 4.5-5 /></svg></span>':'';show('chat');loadMsgs();subscribeTyping()}
async function loadMsgs(){let {data}=await supa.from('messages').select('*').or(`and(from_user.eq.${me.pseudo},to_user.eq.${chatWith}),and(from_user.eq.${chatWith},to_user.eq.${me.pseudo})`).order('heure',{ascending:true});let d=document.getElementById('msgs');d.innerHTML='';data?.forEach(m=>{d.innerHTML+=`<div class="msg ${m.from_user===me.pseudo?'me':'other'}">${m.message}<br><small style=font-size:10px;opacity:.7>${new Date(m.heure).toLocaleTimeString()} ✔✔</small></div>`});d.scrollTop=d.scrollHeight}
async function sendMsg(){let i=document.getElementById('msgI');let t=i.value.trim();if(!t)return;i.value='';await supa.from('messages').insert({id:Date.now().toString(),from_user:me.pseudo,to_user:chatWith,message:t,heure:new Date().toISOString()});loadMsgs()}
let typeT
async function typingOn(){document.getElementById('typing').innerText='en train d écrire...';clearTimeout(typeT);typeT=setTimeout(()=>{document.getElementById('typing').innerText=''},3000);await supa.from('typing').upsert({from_user:me.pseudo,to_user:chatWith,is_typing:true})}
async function subscribeTyping(){supa.channel('typing').on('postgres_changes',{event:'*',schema:'public',table:'typing',filter:`to_user=eq.${me.pseudo}`},payload=>{if(payload.new.from_user===chatWith&&payload.new.is_typing){document.getElementById('typing').innerText='en train d écrire...';setTimeout(()=>document.getElementById('typing').innerText='en ligne',3000)}}).subscribe()}
function subscribe(){document.getElementById('subBtn').innerText='Abonné ✓';document.getElementById('subBtn2').innerText='Abonné ✓';document.getElementById('subBtn').style.background='#1E293B';localStorage.setItem('sub','yes')}
function newGroup(){let n=prompt('Nom du groupe mondial:');if(n){supa.from('groups').insert({id:Date.now().toString(),nom:n,created_by:me.pseudo});alert('Groupe '+n+' créé!')}}
function newContact(){let p=prompt('Entre @pseudo ex @Luc');if(p){if(!p.startsWith('@'))p='@'+p;openChat(p)}}
function focusSearch(){document.getElementById('search').focus()}
async function loadInv(){let {data}=await supa.from('invitations').select('*').eq('to_user',me.pseudo);alert((data?.length||0)+' invitations en attente')}
function logout(){localStorage.clear();location.reload()}
function callVoice(){alert('Appel vocal vers '+chatWith+' 📞')}
function callVideo(){alert('Appel vidéo vers '+chatWith+' 📹')}
function viewContact(){alert('Contact '+chatWith);openChatMenu()}
function blockUser(){if(confirm('Bloquer '+chatWith+'?'))alert('Bloqué');openChatMenu()}
function reportUser(){alert('Signalé '+chatWith);openChatMenu()}
function clearChat(){if(confirm('Vider chat?'))document.getElementById('msgs').innerHTML='';openChatMenu()}
function askBadge(){let t=prompt('Type badge: personnel / entreprise / star');if(t)alert('Demande badge '+t+' envoyée! En attente jaune #FACC15 puis vert 15px')}
function toggleTheme(){alert('Thème Clair #FFFFFF / Sombre #070A14 - défaut sombre')}
function invite(){let link='meiho.me/'+me.pseudo;prompt('Lien invitation:',link)}
function openCamera(){alert('Caméra story 📷')}
