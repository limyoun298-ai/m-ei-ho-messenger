const SUPABASE_URL="https://azumnbymwhbaltxbphnr.supabase.co"
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dW1uYnltd2hiYWx0eGJwaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODAzMDQsImV4cCI6MjEwNzY1NjMwNH0.KXMl7IdCPrwxh8v15WaGIQKA-YIHPGcUKMaxCmNS8r0"
const supa=supabase.createClient(SUPABASE_URL,SUPABASE_KEY)
let cur=localStorage.getItem("currentAt")||null,page=1,typingTimer=null
const tables=["users","messages","invitations","badges","contacts","groups","settings","typing"]
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));let e=document.getElementById(id);if(e){e.classList.add("active");e.style.display="flex"}}
setTimeout(()=>{document.getElementById("splash").classList.remove("active");document.getElementById("splash").style.display="none";show("guide")},3000)
function setPage(n){page=n;document.querySelectorAll(".page").forEach((p,i)=>p.classList.toggle("active",i+1==n));document.querySelectorAll(".dots span").forEach((d,i)=>d.classList.toggle("active",i+1==n));document.getElementById("nextBtn").textContent=n==3?"Commencer":"Suivant"}
document.getElementById("nextBtn").addEventListener("click",()=>{if(page<3)setPage(page+1);else{show("auth")}})
document.getElementById("pass
