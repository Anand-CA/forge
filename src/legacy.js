
const plan={Monday:["Chest","Triceps"],Tuesday:["Back","Biceps"],Wednesday:["Rest"],Thursday:["Chest","Shoulders"],Friday:["Biceps","Triceps"],Saturday:["Legs"],Sunday:["Rest"]};
const exercises={Chest:["Barbell Bench Press","Incline Dumbbell Press","Cable Fly"],Triceps:["Rope Pushdown","Overhead Cable Extension","Cable Skull Crusher"],Back:["Lat Pulldown","Seated Cable Row","Chest-Supported Row"],Biceps:["Barbell Curl","Incline Dumbbell Curl","Hammer Curl"],Shoulders:["Cable Lateral Raise","Machine Shoulder Press","Rear Delt Fly"],Legs:["Leg Press","Leg Extension","Seated Leg Curl"]};
const defaults={"Barbell Bench Press":40,"Incline Dumbbell Press":12.5,"Cable Fly":15,"Rope Pushdown":20,"Overhead Cable Extension":15,"Cable Skull Crusher":15,"Lat Pulldown":45,"Seated Cable Row":40,"Chest-Supported Row":20,"Barbell Curl":20,"Incline Dumbbell Curl":10,"Hammer Curl":12.5,"Cable Lateral Raise":7.5,"Machine Shoulder Press":30,"Rear Delt Fly":20,"Leg Press":100,"Leg Extension":40,"Seated Leg Curl":35};
let saved=readJSON("forgeMobile",{}), selected=new Intl.DateTimeFormat("en-US",{weekday:"long"}).format(new Date()), current="";
let customExercises=readJSON("forgeCustomExercises",{});
if(!exercises.Other)exercises.Other=[];
Object.entries(customExercises).forEach(([muscle,names])=>{if(!exercises[muscle])exercises[muscle]=[];names.forEach(e=>{if(!exercises[muscle].includes(e))exercises[muscle].push(e)})});
const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
function getSets(e){
  const value=saved[e];
  if(Array.isArray(value)) return [value[0]??defaults[e]??10,value[1]??defaults[e]??10,value[2]??defaults[e]??10];
  const legacy=typeof value==="number"?value:(defaults[e]??10);
  return [legacy,legacy,legacy];
}
function w(e){return Math.max(...getSets(e))}
function persist(){localStorage.setItem("forgeMobile",JSON.stringify(saved))}
function render(){
let d=new Date();let date=d.toLocaleDateString("en-US",{weekday:"long",day:"numeric",month:"short"});
main.innerHTML=`<div class="eyebrow">${date} · TRAINING LOG</div><h1>What are you<br>training today?</h1>
<div class="day-scroll">${days.map(x=>`<button class="day ${x===selected?"active":""}" onclick="selectDay('${x}')"><small>${x.slice(0,3).toUpperCase()}</small><b>${x}</b><em>${plan[x].join(" + ")}</em></button>`).join("")}</div>
<div id="workoutArea"></div>`;
renderWorkout();
}
function selectDay(d){selected=d;render()}
function renderWorkout(){
let groups=plan[selected], area=document.getElementById("workoutArea");
if(groups[0]==="Rest"){area.innerHTML=`<section class="section rest"><div class="eyebrow">RECOVERY DAY</div><div class="big">Rest today.<br>Come back stronger.</div><p>No workout is scheduled for ${selected}. Recovery is part of progressive overload.</p></section>`;return}
let html=`<section class="section"><div class="section-head"><h2>${groups.join(" + ")}</h2><span>${groups.reduce((a,m)=>a+exercises[m].length,0)} exercises</span></div>`;
let n=0;groups.forEach(m=>exercises[m].forEach(e=>{n++;let sets=getSets(e),last=Math.max(...sets),target=last+2.5;html+=`<article class="exercise"><div class="ex-top"><div><div class="num">${String(n).padStart(2,"0")}</div><div class="muscle">${m}</div><div class="name">${e}</div></div><div class="lastbox">BEST<strong>${last} kg</strong></div></div><div class="target"><div class="target-row"><span>Next target</span><b>${target} kg</b></div><div class="inline-sets"><label class="setbox"><small>Set 1</small><input id="set_${n}_1" type="number" step=".5" value="${sets[0]}" data-original="${sets[0]}"></label><label class="setbox"><small>Set 2</small><input id="set_${n}_2" type="number" step=".5" value="${sets[1]}" data-original="${sets[1]}"></label><label class="setbox"><small>Set 3</small><input id="set_${n}_3" type="number" step=".5" value="${sets[2]}" data-original="${sets[2]}"></label></div><button id="save_${n}" class="save-inline" style="display:none" onclick="saveInline('${e}',${n})">SAVE EXERCISE</button></div></article>`})); 
area.innerHTML=html+`</section><section class="section" style="padding-top:10px"><button class="save" onclick="showAddExercise()">+ ADD EXERCISE</button><div id="addExerciseBox"></div></section>`; area.querySelectorAll(".setbox input").forEach(input=>input.addEventListener("input",()=>updateExerciseSaveState(input.closest(".exercise"))));
}
function showAddExercise(){
const box=document.getElementById("addExerciseBox");
box.innerHTML=`<div class="exercise" style="margin-top:12px;padding:18px"><div class="eyebrow">NEW EXERCISE</div>
<input id="newExerciseName" class="money-input" style="margin-top:10px;font-size:16px" placeholder="Exercise name">
<select id="newExerciseMuscle" class="select-input" style="margin-top:9px"><option>Chest</option><option>Triceps</option><option>Back</option><option>Biceps</option><option>Shoulders</option><option>Legs</option><option>Other</option></select>
<input id="newExerciseWeight" class="select-input" style="margin-top:9px" type="number" step=".5" min="0" placeholder="Starting weight (kg)">
<button class="save" style="margin-top:10px" onclick="addExercise()">ADD TO WORKOUT</button></div>`;
}
function addExercise(){
const name=document.getElementById("newExerciseName").value.trim(), muscle=document.getElementById("newExerciseMuscle").value, weight=Number(document.getElementById("newExerciseWeight").value);
if(!name){toast("Enter an exercise name");return}
if(exercises[muscle].includes(name)){toast("Exercise already exists");return}
exercises[muscle].push(name); defaults[name]=Number.isFinite(weight)&&weight>=0?weight:0;
if(!customExercises[muscle])customExercises[muscle]=[];
customExercises[muscle].push(name);localStorage.setItem("forgeCustomExercises",JSON.stringify(customExercises));
render();toast(name+" added · "+muscle);
}
function updateExerciseSaveState(card){
if(!card)return;
const inputs=[...card.querySelectorAll(".setbox input")];
const changed=inputs.some(input=>Number(input.value)!==Number(input.dataset.original));
const btn=card.querySelector(".save-inline");
if(btn)btn.style.display=changed?"block":"none";
}
function openSheet(e,m){current=e;sheetName.textContent=e;sheetMuscle.textContent=m;let sets=getSets(e);i1.value=sets[0];i2.value=sets[1];i3.value=sets[2];sheetBg.classList.add("open")}
function closeSheet(){sheetBg.classList.remove("open")}
async function saveInline(e,n){
  const vals=[1,2,3]
    .map(s=>Number(document.getElementById(`set_${n}_${s}`).value))
    .filter(v=>Number.isFinite(v)&&v>=0);
  if(vals.length){
    saved[e]=[vals[0]??0,vals[1]??0,vals[2]??0];
    persist();
    await saveWorkoutToCloud(e,saved[e]);
    render();
    toast("Saved · "+saved[e].join(" / ")+" kg");
  }
}
async function saveExercise(){
const vals=[Number(i1.value),Number(i2.value),Number(i3.value)].map(v=>Number.isFinite(v)&&v>=0?v:null);
if(vals.some(v=>v!==null)){saved[current]=[vals[0]??0,vals[1]??0,vals[2]??0];persist();await saveWorkoutToCloud(current,saved[current]);closeSheet();render();toast("Workout saved · "+saved[current].join(" / ")+" kg")}
}
function nav(btn,page){
document.querySelectorAll(".nav button").forEach(x=>x.classList.remove("active"));
btn.classList.add("active");
if(page==="home"){render();return}
if(page==="profile"){
const profile=readJSON("forgeProfile",{name:"",height:"177",weight:"75",goal:"Lean bulk",activity:"Work from home"});
main.innerHTML=`<div class="eyebrow">PROFILE / PERSONAL DATA</div><h1>Build your<br>profile.</h1>
<div class="exercise" style="padding:18px">
<div class="eyebrow">IDENTITY</div>
<input id="profileName" class="money-input" style="font-size:17px;margin-top:10px" placeholder="Your name" value="${escapeHtml(profile.name)}">
</div>
<div class="exercise" style="padding:18px">
<div class="eyebrow">BODY</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:10px">
<label class="eyebrow">HEIGHT CM<input id="profileHeight" class="select-input" style="margin-top:5px" type="number" value="${profile.height}"></label>
<label class="eyebrow">WEIGHT KG<input id="profileWeight" class="select-input" style="margin-top:5px" type="number" step=".1" value="${profile.weight}"></label>
</div></div>
<div class="exercise" style="padding:18px">
<div class="eyebrow">TRAINING GOAL</div>
<select id="profileGoal" class="select-input" style="margin-top:10px">
<option ${profile.goal==="Lean bulk"?"selected":""}>Lean bulk</option><option ${profile.goal==="Muscle gain"?"selected":""}>Muscle gain</option><option ${profile.goal==="Fat loss"?"selected":""}>Fat loss</option><option ${profile.goal==="Maintain"?"selected":""}>Maintain</option>
</select>
<div class="eyebrow" style="margin-top:16px">LIFESTYLE</div>
<select id="profileActivity" class="select-input" style="margin-top:10px">
<option ${profile.activity==="Work from home"?"selected":""}>Work from home</option><option ${profile.activity==="Office"?"selected":""}>Office</option><option ${profile.activity==="Active"?"selected":""}>Active</option>
</select></div>
<button class="save" onclick="saveProfile()">SAVE PROFILE</button>
<div class="exercise" style="margin-top:12px"><div class="eyebrow">ACCOUNT</div><div class="name" style="margin-top:9px">Anonymous Forge account</div><p style="color:var(--muted);font-size:11px;line-height:1.5">Your account is anonymous. Clearing this browser's site data can remove access to this anonymous identity.</p></div>`; return;
}
if(page==="history"){
main.innerHTML=`<div class="eyebrow">SESSION HISTORY</div><h1>Your work,<br>logged.</h1>
<div class="exercise"><div class="name">Workout history</div><p style="color:var(--muted);font-size:12px">Detailed session history will be added next.</p></div>`; return;
}
if(page==="diet"){
main.innerHTML=`<div class="eyebrow">NUTRITION / DAILY ROUTINE</div><h1>Eat for<br>the work.</h1>
<div class="exercise">
<div class="ex-top"><div><div class="muscle">PROFILE</div><div class="name">177 cm · 75 kg</div></div><div class="lastbox">GOAL<strong>LEAN BULK</strong></div></div>
<div class="target"><div class="target-row"><span>Meal consistency</span><b>0 / 5 today</b></div></div>
</div>
<div class="section-head" style="margin-top:22px"><h2>Today's reminders</h2><span>tap to complete</span></div>
${[
["08:30","Breakfast","Oats + milk + peanut butter + banana"],
["13:30","Lunch","Rice + soya + eggs"],
["17:30","Snack","Bread + peanut butter / protein"],
["20:30","Post-workout","Protein + creatine + fluids"],
["22:30","Dinner","Rice + soya + eggs"]
].map((x,i)=>`<div class="exercise" id="meal${i}" onclick="toggleMeal(${i})" style="cursor:pointer">
<div class="ex-top"><div><div class="num">${x[0]}</div><div class="muscle">MEAL ${i+1}</div><div class="name">${x[1]}</div></div><div class="lastbox">○</div></div>
<div style="font-size:11px;color:var(--muted);margin-top:9px">${x[2]}</div></div>`).join("")}
`; initWaterUI(); return;
}
if(page==="todo"){
main.innerHTML=`<div class="eyebrow">PLANNING / MONTHLY TIMELINE</div><h1>Get things<br>done.</h1>
<div class="exercise"><div class="eyebrow">ADD TODO</div><input id="todoText" class="money-input" style="font-size:15px" placeholder="What needs to be done?"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"><input id="todoDate" class="select-input" type="date"><button class="save-inline" style="margin:0" onclick="addTodo()">ADD TODO</button></div><p style="color:var(--muted);font-size:11px;margin-bottom:0">No date = today. Select a date to receive a push reminder on that date.</p></div>
<div class="section-head"><h2>Timeline</h2><span>your tasks</span></div><div id="todoTimeline"></div><div class="section-head" style="margin-top:22px"><h2>Overdue</h2><span>needs attention</span></div><div id="overdueTodos"></div>`; renderTodos(); return;
}
}
function saveProfile(){
const profile={name:document.getElementById("profileName").value.trim(),height:document.getElementById("profileHeight").value,weight:document.getElementById("profileWeight").value,goal:document.getElementById("profileGoal").value,activity:document.getElementById("profileActivity").value};
localStorage.setItem("forgeProfile",JSON.stringify(profile)); toast("Profile saved ✓");
}
function readJSON(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(_){return fallback}}
function escapeHtml(value){const d=document.createElement("div");d.textContent=String(value??"");return d.innerHTML}
const SUPABASE_URL="https://ufbsxvqouogkrkeprlua.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_ax2ZjXT1a7I3zJECFfvCEw_C6iekTgP";
let authSession=null;

function supabaseHeaders(token){
  return {"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+(token||SUPABASE_ANON_KEY),"Content-Type":"application/json"};
}

async function supabaseAuth(path,body){
  const r=await fetch(SUPABASE_URL+"/auth/v1/"+path,{method:"POST",headers:supabaseHeaders(),body:JSON.stringify(body||{})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error_description||d.msg||d.message||"Authentication failed");
  return d;
}

async function startForge(){
  setAuthBusy(true);
  try{
    const existing=JSON.parse(localStorage.getItem("forgeSession")||"null");
    if(existing?.access_token && existing?.user?.id){
      await finishAuth(existing);
      return;
    }
    const d=await supabaseAuth("signup",{});
    if(!d.access_token || !d.user?.id) throw new Error("Could not create anonymous account.");
    await finishAuth(d);
  }catch(e){
    console.error(e);
    setAuthMessage(e.message||"Could not start Forge.");
  }finally{
    setAuthBusy(false);
  }
}

async function finishAuth(d){
  authSession=d;
  localStorage.setItem("forgeSession",JSON.stringify(d));
  document.getElementById("authGate").style.display="none";
  document.getElementById("forgeApp").style.display="block";
  const migrationKey="forgeMigrated_"+d.user.id;
  if(!localStorage.getItem(migrationKey)){
    await migrateLocalData();
    localStorage.setItem(migrationKey,"1");
  }
  await loadCloudData();
  render();
}

function setAuthMessage(m){
  const e=document.getElementById("authMessage");
  if(e)e.textContent=m;
}

function setAuthBusy(b){
  const e=document.getElementById("authSubmit");
  if(e){
    e.disabled=b;
    e.style.opacity=b?".6":"1";
    e.textContent=b?"STARTING…":"START FORGE";
  }
}

function signOut(){
  localStorage.removeItem("forgeSession");
  authSession=null;
  document.getElementById("forgeApp").style.display="none";
  document.getElementById("authGate").style.display="flex";
  setAuthMessage("Start instantly. No email or password required.");
}

async function restoreAuth(){
  try{
    const stored=JSON.parse(localStorage.getItem("forgeSession")||"null");
    if(stored?.access_token && stored?.user?.id){
      authSession=stored;
      document.getElementById("authGate").style.display="none";
      document.getElementById("forgeApp").style.display="block";
      await loadCloudData();
      render();
      return;
    }
  }catch(e){
    console.error("Session restore failed",e);
    localStorage.removeItem("forgeSession");
  }
  document.getElementById("authGate").style.display="flex";
  document.getElementById("forgeApp").style.display="none";
  startForge();
}

async function dbRequest(path,options={}){
  if(!authSession?.access_token)throw new Error("Not signed in");
  const opts={...options,headers:{...supabaseHeaders(authSession.access_token),...(options.headers||{})}};
  const r=await fetch(SUPABASE_URL+"/rest/v1/"+path,opts);
  if(!r.ok)throw new Error(await r.text());
  return r.status===204?null:r.json();
}
async function loadCloudData(){
  try{
    const workouts=await dbRequest("workout_sets?select=workout_date,exercise,set1,set2,set3&order=workout_date.desc");
    const latest={};
    (workouts||[]).forEach(row=>{if(latest[row.exercise]===undefined)latest[row.exercise]=[Number(row.set1),Number(row.set2),Number(row.set3)]});
    if(Object.keys(latest).length){saved=latest;persist();}
    const todos=await dbRequest("todos?select=id,text,due_date,done,created_at&order=due_date.asc,created_at.asc");
    localStorage.setItem("forgeTodos",JSON.stringify((todos||[]).map(t=>({id:t.id,date:t.due_date,text:t.text,done:t.done}))));
  }catch(e){console.error("Cloud load failed",e);toast("Could not load cloud data")}
}
async function saveWorkoutToCloud(exercise,values){
  try{
    await dbRequest("workout_sets?on_conflict=user_id,workout_date,exercise",{
      method:"POST",
      headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},
      body:JSON.stringify({user_id:authSession.user.id,workout_date:localDateString(),exercise,set1:values[0],set2:values[1],set3:values[2]})
    });
  }catch(e){console.error("Workout sync failed",e);toast("Saved locally; cloud sync failed")}
}
async function migrateLocalData(){
  try{
    const localSaved=readJSON("forgeMobile",{});
    for(const exercise of Object.keys(localSaved)){
      const values=getSets(exercise);
      await saveWorkoutToCloud(exercise,values);
    }
    const localTodos=readJSON("forgeTodos",[]);
    for(const todo of localTodos){
      await dbRequest("todos",{method:"POST",headers:{"Prefer":"resolution=ignore-duplicates"},body:JSON.stringify({user_id:authSession.user.id,text:todo.text,due_date:todo.date,done:!!todo.done})}).catch(()=>{});
    }
  }catch(e){console.error("Local migration failed",e)}
}
function getTodos(){return readJSON("forgeTodos",[])}
function localDateString(date=new Date()){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");return `${y}-${m}-${d}`}
async function addTodo(){
  const input=document.getElementById("todoText"),dateInput=document.getElementById("todoDate");
  const text=input?.value.trim();
  const selectedDate=dateInput?.value||localDateString();
  if(!text){toast("Enter a task");return}
  const todos=getTodos();
  const todo={id:"t"+Date.now(),date:selectedDate,text,done:false};
  const savedTodo=await dbRequest("todos",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({user_id:authSession.user.id,text:todo.text,due_date:todo.date,done:false})});
  const cloudTodo=savedTodo?.[0];
  if(cloudTodo)todo.id=cloudTodo.id;
  todos.push(todo);
  localStorage.setItem("forgeTodos",JSON.stringify(todos));
  input.value="";
  if(dateInput)dateInput.value="";
  renderTodos();
  toast("Todo added ✓");
}
async function toggleTodo(id){
  const todos=getTodos().map(t=>t.id===id?{...t,done:!t.done}:t);
  localStorage.setItem("forgeTodos",JSON.stringify(todos));
  const todo=todos.find(t=>t.id===id);
  try{await dbRequest("todos?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({done:todo.done})})}catch(e){console.error("Todo sync failed",e);toast("Saved locally; cloud sync failed")}
  renderTodos()
}
function renderTodos(){
  const timeline=document.getElementById("todoTimeline"),overdueBox=document.getElementById("overdueTodos");
  if(!timeline||!overdueBox)return;
  const today=new Date();today.setHours(0,0,0,0);
  const all=getTodos();
  const upcoming=all.filter(t=>t.done||new Date(t.date+"T00:00:00")>=today),groups={};
  upcoming.forEach(t=>{const key=t.date.slice(0,7);(groups[key]??=[]).push(t)});
  timeline.innerHTML=Object.keys(groups).sort().map((month,i)=>{
    const items=groups[month].sort((a,b)=>a.date.localeCompare(b.date));
    return `<details class="timeline-month" ${i===0?"open":""}><summary>${new Date(month+"-01T00:00:00").toLocaleDateString("en-US",{month:"long",year:"numeric"})}<span>${items.length}</span></summary><div class="timeline-items">${items.map(t=>`<div class="todo-row"><button class="todo-check" onclick="toggleTodo('${t.id}')">${t.done?"✓":""}</button><div><b>${escapeHtml(t.text)}</b><div class="todo-meta">${new Date(t.date+"T00:00:00").toLocaleDateString("en-US",{day:"numeric",month:"short"})}</div></div></div>`).join("")}</div></details>`
  }).join("")||`<div class="exercise"><p style="color:var(--muted);font-size:12px;margin:0">No upcoming todos.</p></div>`;
  const overdue=all.filter(t=>!t.done&&new Date(t.date+"T00:00:00")<today);
  overdueBox.innerHTML=overdue.map(t=>`<div class="exercise overdue"><div class="todo-row"><button class="todo-check" onclick="toggleTodo('${t.id}')">${t.done?"✓":""}</button><div><b>${escapeHtml(t.text)}</b><div class="todo-meta">Overdue · ${new Date(t.date+"T00:00:00").toLocaleDateString("en-US",{day:"numeric",month:"short"})}</div></div></div></div>`).join("")||`<div class="exercise"><p style="color:var(--muted);font-size:12px;margin:0">Nothing overdue.</p></div>`
}

function toast(message){const el=document.getElementById("toast");if(!el)return;el.textContent=message;el.style.display="block";clearTimeout(window.__forgeToast);window.__forgeToast=setTimeout(()=>{el.style.display="none"},2200)}
function urlBase64ToUint8Array(base64String){const padding="=".repeat((4-base64String.length%4)%4),base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/"),raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}



window.startForge=startForge;
window.signOut=signOut;
restoreAuth();
