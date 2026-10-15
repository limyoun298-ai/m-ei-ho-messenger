const SUPA_URL="https://azumnbymwhbaltxbphnr.supabase.co"
const SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dW1uYnltd2hiYWx0eGJwaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODAzMDQsImV4cCI6MjEwNzY1NjMwNH0.KXMl7IdCPrwxh8v15WaGIQKA-YIHPGcUKMaxCmNS8r0"
const supa=supabase.createClient(SUPA_URL,SUPA_KEY)
let me=null, chatWith=null, guideIndex=0
const guides=[
 {t:"Discutez mondial",d:"Chattez avec le monde entier en temps réel"},
 {t:"Invitez avec @",d:"Trouvez vos amis avec @pseudo unique"},
 {t:"Badge validé 15px",d:"Obtenez le badge vert ✔ 15px vérifié"}
]

window.onload=()=>{
 setTimeout(()=>{showScreen('guide');renderGuide()},2000)
 let s=localStorage.getItem('me')
 if(s){me=JSON.parse(s)}
}

function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active')}
function renderGuide(){let g=guides[guideIndex];document.getElementById('guideContent').innerHTML=`<h2 style="text-align:center">${g.t}</h2><p style="text-align:center;color:#9CA3AF;margin-top:10px">${g.d}</p>`;document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===guideIndex))}
document.getElementById('nextGuide').onclick=()=>{guideIndex++;if(guideIndex>=3){if(me) loadMain(); else showScreen('auth')}else renderGuide()}
document.getElementById('skipGuide').onclick=()=>{if(me) loadMain(); else showScreen('auth')}

function showLogin(){document.getElementById('loginBox').style.display='block'}
let photoBase64=""
document.getElementById('photoInput').onchange=e=>{let r=new FileReader();r.onload=()=>{photoBase64=r.result;document.getElementById('previewPhoto').src=photoBase64};r.readAsDataURL(e.target.files[0])}

function validPass(p){return /^[A-Za-z]{4}[0-9]{4}$/.test(p)}

async function register(){
 let pseudo=document.getElementById('pseudo').value.trim()
 let pass=document.getElementById('pass').value.trim()
 let bio=document.getElementById('bio').value.trim()
 if(!pseudo.startsWith('@')) pseudo='@'+pseudo
 if(!validPass(pass)) return alert('Mot de passe: 4 lettres + 4 chiffres ex Abcd1234')
 if(bio.length>100) return alert('Bio 100 max')
 let {data}=await supa.from('users').select('*').eq('pseudo',pseudo).single()
 if(data) return alert('Pseudo déjà pris')
 let id=crypto.randomUUID()
 let {error}=await supa.from('users').insert({id,pseudo,mot_de_passe:pass,photo:photoBase64,bio,badge_vert:false})
 if(error) return alert(error.message)
 me={id,pseudo,photo:photoBase64,bio,badge_vert:false}
 localStorage.setItem('me',JSON.stringify(me))
 loadMain()
}
async function login(){
 let pseudo=document.getElementById('loginPseudo').value.trim()
 let pass=document.getElementById('loginPass').value.trim()
 if(!pseudo.startsWith('@')) pseudo='@'+pseudo
 let {data}=await supa.from('users').select('*').eq('pseudo',pseudo).single()
 if(!data||data.mot_de_passe!==pass) return alert('Pseudo ou pass faux')
 me=data; localStorage.setItem('me',JSON.stringify(me)); loadMain()
}
async function loadMain(){
 showScreen('main')
 let {data:users}=await supa.from('users').select('*')
 let disc=document.getElementById('tab-discussions')
 disc.innerHTML=''
 users.filter(u=>u.pseudo!==me.pseudo).forEach(u=>{
  disc.innerHTML+=`<div class="user-row" onclick="openChat('${u.pseudo}')"><img src="${u.photo||'https://via.placeholder.com/50'}"><div><b>${u.pseudo} ${u.badge_vert?'<span class=badge-verif></span>':''}</b><br><small style="color:#9CA3AF">${u.bio||''}</small></div><small style="margin-left:auto;color:#9CA3AF;font-size:10px">10:42</small></div>`
 })
 loadInvitations()
}
function switchTab(name){
 document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'))
 document.getElementById('tab-'+name).classList.add('active')
 document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'))
 event.currentTarget.classList.add('active')
}
function backToMain(){showScreen('main');chatWith=null}
async function openChat(pseudo){
 chatWith=pseudo
 let {data:u}=await supa.from('users').select('*').eq('pseudo',pseudo).single()
 document.getElementById('chatName').innerText=pseudo
 document.getElementById('chatPhoto').src=u?.photo||'https://via.placeholder.com/40'
 document.getElementById('chatBadge').innerHTML=u?.badge_vert?'<span class=badge-verif></span>':''
 showScreen('chat')
 loadMessages()
 supa.channel('chat-'+Date.now()).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},p=>{
  if((p.new.from_user===me.pseudo&&p.new.to_user===chatWith)||(p.new.from_user===chatWith&&p.new.to_user===me.pseudo)) loadMessages()
 }).subscribe()
}
async function loadMessages(){
 let {data}=await supa.from('messages').select('*').or(`and(from_user.eq.${me.pseudo},to_user.eq.${chatWith}),and(from_user.eq.${chatWith},to_user.eq.${me.pseudo})`).order('heure',{ascending:true})
 let div=document.getElementById('messages');div.innerHTML=''
 data?.forEach(m=>{div.innerHTML+=`<div class="msg ${m.from_user===me.pseudo?'me':'other'}">${m.message}<br><small style="opacity:.7;font-size:10px">${new Date(m.heure).toLocaleTimeString()} ✔✔</small></div>`})
 div.scrollTop=div.scrollHeight
}
async function sendMessage(){
 let txt=document.getElementById('msgInput').value.trim();if(!txt)return
 document.getElementById('msgInput').value=''
 await supa.from('messages').insert({id:crypto.randomUUID(),from_user:me.pseudo,to_user:chatWith,message:txt,heure:new Date().toISOString()})
 loadMessages()
}
let typingTimeout
async function sendTyping(){
 document.getElementById('typingIndicator').innerText=''
 clearTimeout(typingTimeout)
 try{await supa.from('typing').upsert({from_user:me.pseudo,to_user:chatWith,is_typing:true},{onConflict:'from_user,to_user'})}catch(e){}
 typingTimeout=setTimeout(async()=>{try{await supa.from('typing').upsert({from_user:me.pseudo,to_user:chatWith,is_typing:false},{onConflict:'from_user,to_user'})}catch(e){}},3000)
 document.getElementById('typingIndicator').innerText='en train d\'écrire...'
 setTimeout(()=>{document.getElementById('typingIndicator').innerText=''},3000)
}
async function loadInvitations(){
 let {data}=await supa.from('invitations').select('*').eq('to_user',me.pseudo).eq('status','pending')
 let div=document.getElementById('invitationsList');if(!div)return
 div.innerHTML=''
 data?.forEach(inv=>{
  div.innerHTML+=`<div class="user-row"><div><b>${inv.from_user}</b> veut vous ajouter</div><button onclick="acceptInv('${inv.id}')" style="margin-left:auto;background:#00C950;border:none;padding:6px 10px;border-radius:6px;color:#fff">Accepter</button></div>`
 })
 document.getElementById('notifCount').innerText=data?.length?data.length:''
}
async function acceptInv(id){await supa.from('invitations').update({status:'accepted'}).eq('id',id);loadInvitations()}
function toggleMenu(){let m=document.getElementById('topMenu');m.style.display=m.style.display==='block'?'none':'block'}
function openSettings(){alert('Paramètres: Badge 15px, Confidentialité, Thème clair/sombre #FFFFFF/#070A14, Langue 8 langues, Page officielle @officiel_MEIHO - from meiho gris 12px');toggleMenu()}
function changeLangUI(){let l=prompt('Langue: fr,en,zh,es,pt,ar,sw,ln');if(l)localStorage.setItem('lang',l)}
function searchUser(){let p=prompt('Cherche @pseudo ex @Luc');if(p){if(!p.startsWith('@'))p='@'+p;openChat(p)}}
function createGroupUI(){let n=prompt('Nom du groupe');if(n)supa.from('groups').insert({id:crypto.randomUUID(),nom:n,created_by:me.pseudo}).then(()=>alert('Groupe créé'))}
function logout(){localStorage.clear();location.reload()}
