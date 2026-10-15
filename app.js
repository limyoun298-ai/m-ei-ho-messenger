const SUPA_URL="https://azumnbymwhbaltxbphnr.supabase.co"
const SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dW1uYnltd2hiYWx0eGJwaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODAzMDQsImV4cCI6MjEwNzY1NjMwNH0.KXMl7IdCPrwxh8v15WaGIQKA-YIHPGcUKMaxCmNS8r0"
const supa=supabase.createClient(SUPA_URL,SUPA_KEY)

function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById(id).classList.add('active'); }

let guideIdx=0;
function goGuide(n){
  guideIdx=n;
  document.querySelectorAll('.guide-page').forEach((p,i)=>p.classList.toggle('active',i==n));
  document.querySelectorAll('.guide-dot').forEach((d,i)=>d.classList.toggle('active',i==n));
  const btn=document.querySelector('.next-btn');
  if(btn) btn.textContent=n==2?'Commencer':'Suivant';
}
function nextGuide(){ if(guideIdx<2) goGuide(guideIdx+1); else goAuth(); }
function goAuth(){ show('authScreen'); }

function toggleTheme(){
  document.body.classList.toggle('light');
  localStorage.setItem('meiho_theme', document.body.classList.contains('light')?'light':'dark');
}

document.getElementById('photoInput').addEventListener('change',e=>{
  const file=e.target.files[0];
  if(file){
    const url=URL.createObjectURL(file);
    const av=document.getElementById('profileAvatar');
    av.style.backgroundImage=`url(${url})`;
    av.style.backgroundSize='cover';
    av.textContent='';
  }
});

document.getElementById('bio').addEventListener('input',e=>{
  document.getElementById('bioCount').textContent=e.target.value.length;
});

async function register(e){
  e.preventDefault();
  const pseudo=document.getElementById('pseudo').value.trim();
  const pass=document.getElementById('password').value.trim();
  const bio=document.getElementById('bio').value.trim();
  if(!/^@[A-Za-z0-9_]{3,25}$/.test(pseudo)){ alert('Pseudo doit commencer par @ ex: @Luc'); return; }
  if(!/^[A-Za-z]{4}[0-9]{4}$/.test(pass)){ alert('Mot de passe format Abcd1234: 4 lettres + 4 chiffres'); return; }
  const {data,error}=await supa.from('users').select('*').eq('pseudo',pseudo);
  if(data && data.length>0){ alert('Pseudo déjà pris'); return; }
  const {error: error2}=await supa.from('users').insert([{pseudo,password:pass,bio}]);
  if(!error2){
    localStorage.setItem('meiho_user',pseudo);
    show('mainScreen');
    loadChats();
  } else {
    alert('Erreur création: '+error2.message);
  }
}

async function login(e){
  e.preventDefault();
  const pseudo=document.getElementById('loginPseudo').value.trim();
  const pass=document.getElementById('loginPass').value.trim();
  const {data}=await supa.from('users').select('*').eq('pseudo',pseudo).eq('password',pass);
  if(data && data.length>0){
    localStorage.setItem('meiho_user',pseudo);
    show('mainScreen');
    loadChats();
  } else alert('Pseudo ou mot de passe incorrect');
}

document.getElementById('registerForm').addEventListener('submit',register);
document.getElementById('loginForm').addEventListener('submit',login);

function loadChats(){
  const list=document.getElementById('chatList');
  if(!list) return;
  list.innerHTML='<p style="padding:16px;color:#9CA3AF">Chargement...</p>';
  supa.from('users').select('*').limit(20).then(r=>{
    list.innerHTML='';
    if(r.data && r.data.length>0){
      r.data.forEach(u=>{
        const div=document.createElement('div');
        div.className='official-card';
        div.innerHTML=`<div class="official-avatar-48">${u.pseudo[1]?.toUpperCase()||'U'}</div><div class="official-info"><strong>${u.pseudo} <span class="badge-verified">✓</span></strong><p>${u.bio||''}</p></div>`;
        div.onclick=()=>openChat(u);
        list.appendChild(div);
      });
    } else {
      list.innerHTML='<p style="padding:16px;color:#9CA3AF">Aucun utilisateur. Invite des amis!</p>';
    }
  });
}

function openChat(user){
  const av=document.getElementById('chatAvatar');
  if(av) av.alt=user.pseudo;
  const info=document.querySelector('.chat-top-info span');
  if(info) info.textContent=user.pseudo;
  show('chatScreen');
  loadMessages(user.pseudo);
}

async function loadMessages(to){
  const me=localStorage.getItem('meiho_user');
  const {data}=await supa.from('messages').select('*').or(`and(from.eq.${me},to.eq.${to}),and(from.eq.${to},to.eq.${me})`).order('created_at',{ascending:true});
  const list=document.getElementById('messageList');
  list.innerHTML='';
  if(data){
    data.forEach(m=>{
      const d=document.createElement('div');
      d.className=m.from==me?'message-bubble mine':'message-bubble';
      d.textContent=m.text;
      list.appendChild(d);
    });
    list.scrollTop=list.scrollHeight;
  }
}

async function sendMessage(e){
  e.preventDefault();
  const input=document.getElementById('messageInput');
  const text=input.value.trim();
  if(!text) return;
  const me=localStorage.getItem('meiho_user');
  const toEl=document.querySelector('.chat-top-info span');
  const to=toEl?toEl.textContent:'@officiel_MEIHO';
  await supa.from('messages').insert([{from:me,to,to,text}]);
  input.value='';
  loadMessages(to);
}

document.getElementById('messageForm').addEventListener('submit',sendMessage);

document.getElementById('mainSearch').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();
  document.querySelectorAll('#chatList.official-card').forEach(c=>{
    c.style.display=c.textContent.toLowerCase().includes(q)?'flex':'none';
  });
});

document.getElementById('moreIcon').addEventListener('click',()=>{
  const dd=document.getElementById('dropdownMenu');
  dd.hidden=!dd.hidden;
});

document.querySelectorAll('#dropdownMenu button').forEach(b=>{
  b.addEventListener('click',()=>{
    const t=b.textContent;
    document.getElementById('dropdownMenu').hidden=true;
    if(t.includes('Paramètres')||t.includes('Badge')||t.includes('Confidentialité')||t.includes('Sécurité')) show('settingsScreen');
    if(t.includes('Page officielle')) show('officialScreen');
    if(t.includes('Thème')) toggleTheme();
    if(t.includes('Déconnexion')){ localStorage.clear(); show('authScreen'); }
    if(t.includes('Nouveau groupe')||t.includes('Nouveau contact')){
      const pseudo=prompt('Entre @pseudo:');
      if(pseudo) openChat({pseudo});
    }
  });
});

document.querySelectorAll('.bottom-nav button').forEach(b=>{
  b.addEventListener('click',()=>{
    const p=b.dataset.page;
    document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    if(p=='discussions') show('mainScreen');
    if(p=='actus') show('inviteScreen');
    if(p=='communaute') show('communityScreen');
    if(p=='appel') show('callsScreen');
  });
});

document.getElementById('backChat').addEventListener('click',()=>show('mainScreen'));
document.getElementById('backSettings').addEventListener('click',()=>show('mainScreen'));
document.getElementById('backOfficial').addEventListener('click',()=>show('mainScreen'));

document.querySelectorAll('.subscribe-btn').forEach(btn=>{
  btn.addEventListener('click',function(){
    if(this.textContent.includes('S\'abonner')){
      this.textContent='Abonné ✓';
      this.style.background='#9CA3AF';
      localStorage.setItem('sub','1');
    } else {
      this.textContent='S\'abonner';
      this.style.background='#2563EB';
      localStorage.removeItem('sub');
    }
  });
});

window.onload=()=>{
  setTimeout(()=>{
    if(!localStorage.getItem('meiho_user')) show('guideScreen');
  },2000);
  if(localStorage.getItem('meiho_theme')=='light') document.body.classList.add('light');
  if(localStorage.getItem('sub')=='1'){
    document.querySelectorAll('.subscribe-btn').forEach(b=>{
      b.textContent='Abonné ✓';
      b.style.background='#9CA3AF';
    });
  }
  if(localStorage.getItem('meiho_user')){
    show('mainScreen');
    loadChats();
  }
  goGuide(0);
  }
