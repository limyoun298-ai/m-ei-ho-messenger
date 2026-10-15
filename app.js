const SUPA_URL="https://azumnbymwhbaltxbphnr.supabase.co"
const SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dW1uYnltd2hiYWx0eGJwaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODAzMDQsImV4cCI6MjEwNzY1NjMwNH0.KXMl7IdCPrwxh8v15WaGIQKA-YIHPGcUKMaxCmNS8r0"
const supa=supabase.createClient(SUPA_URL,SUPA_KEY)
let me=JSON.parse(localStorage.getItem('me')||'null')
window.onload=()=>{setTimeout(()=>{if(me){show('main');loadUsers()}else{show('auth')}},2000)}
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active')}
async function register(){let p=document.getElementById('pseudo').value.trim();if(!p.startsWith('@'))p='@'+p;let pass=document.getElementById('pass').value.trim();let id=crypto.randomUUID();let {error}=await supa.from('users').insert({id,pseudo:p,mot_de_passe:pass});if(error)return alert(error.message);me={id,pseudo:p};localStorage.setItem('me',JSON.stringify(me));show('main');loadUsers()}
async function loadUsers(){let {data}=await supa.from('users').select('*');let div=document.getElementById('list');div.innerHTML='';data.filter(u=>u.pseudo!==me.pseudo).forEach(u=>{div.innerHTML+=`<div class="user-row" style="padding:14px 16px;border-bottom:1px solid #1E293B;display:flex;gap:12px"><img src="${u.photo||'https://via.placeholder.com/52'}" style="width:52px;height:52px;border-radius:50%"><div><b>${u.pseudo} ${u.badge_vert?'<span class=badge-verif><svg viewBox=0 0 12 12><path d=M2 6l3 3l5-6 /></svg></span>':''}</b><br><small style=color:#9CA3AF>Salut j utilise MEIHO</small></div></div>`})}
function toggleMenu(){let m=document.getElementById('topMenu');m.style.display=m.style.display==='block'?'none':'block'}
function searchUser(){let p=prompt('Cherche @');if(p)alert('Recherche '+p)}
