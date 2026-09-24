import { useEffect, useMemo, useState } from 'react'

const SUPABASE_URL='https://ufbsxvqouogkrkeprlua.supabase.co'
const SUPABASE_ANON_KEY='sb_publishable_ax2ZjXT1a7I3zJECFfvCEw_C6iekTgP'
const plan={Monday:['Chest','Triceps'],Tuesday:['Back','Biceps'],Wednesday:['Rest'],Thursday:['Chest','Shoulders'],Friday:['Biceps','Triceps'],Saturday:['Legs'],Sunday:['Rest']}
const baseExercises={Chest:['Barbell Bench Press','Incline Dumbbell Press','Cable Fly'],Triceps:['Rope Pushdown','Overhead Cable Extension','Cable Skull Crusher'],Back:['Lat Pulldown','Seated Cable Row','Chest-Supported Row'],Biceps:['Barbell Curl','Incline Dumbbell Curl','Hammer Curl'],Shoulders:['Cable Lateral Raise','Machine Shoulder Press','Rear Delt Fly'],Legs:['Leg Press','Leg Extension','Seated Leg Curl'],Other:[]}
const defaults={'Barbell Bench Press':40,'Incline Dumbbell Press':12.5,'Cable Fly':15,'Rope Pushdown':20,'Overhead Cable Extension':15,'Cable Skull Crusher':15,'Lat Pulldown':45,'Seated Cable Row':40,'Chest-Supported Row':20,'Barbell Curl':20,'Incline Dumbbell Curl':10,'Hammer Curl':12.5,'Cable Lateral Raise':7.5,'Machine Shoulder Press':30,'Rear Delt Fly':20,'Leg Press':100,'Leg Extension':40,'Seated Leg Curl':35}
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const defaultDiet=[
  {id:'breakfast',time:'08:30',name:'Breakfast',food:'Oats + milk + peanut butter + banana'},
  {id:'lunch',time:'13:30',name:'Lunch',food:'Rice + soya + eggs'},
  {id:'snack',time:'17:30',name:'Snack',food:'Bread + peanut butter / protein'},
  {id:'post-workout',time:'20:30',name:'Post-workout',food:'Protein + creatine + fluids'},
  {id:'dinner',time:'22:30',name:'Dinner',food:'Rice + soya + eggs'}
]
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}}
const getToken=t=>(typeof t==='string'?t:t?.access_token)||SUPABASE_ANON_KEY
const headers=t=>({apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+getToken(t),'Content-Type':'application/json'})
async function auth(){const old=read('forgeSession',null);if(old?.access_token&&old.access_token.split('.').length===3)return old;localStorage.removeItem('forgeSession');const r=await fetch(SUPABASE_URL+'/auth/v1/signup',{method:'POST',headers:headers(),body:'{}'});const d=await r.json();if(!r.ok)throw Error(d.msg||d.error_description||'Authentication failed');localStorage.setItem('forgeSession',JSON.stringify(d));return d}
async function db(token,path,options={}){const r=await fetch(SUPABASE_URL+'/rest/v1/'+path,{...options,headers:{...headers(token),...(options.headers||{})}});if(!r.ok)throw Error(await r.text());return r.status===204?null:r.json()}

function AuthGate({onReady}){const [busy,setBusy]=useState(false);const [error,setError]=useState('');const start=async()=>{setBusy(true);setError('');try{const s=await auth();onReady(s)}catch(e){setError(e.message)}finally{setBusy(false)}};return <div className="authGate"><div className="authCard"><div className="logo">FORGE<span>●</span></div><div className="eyebrow authEyebrow">WELCOME TO FORGE</div><h1>Train.<br/>Track.<br/>Forge.</h1><p>Start instantly. No email or password required.</p>{error&&<p className="error">{error}</p>}<button className="save" disabled={busy} onClick={start}>{busy?'STARTING…':'START FORGE'}</button><small>Forge creates a private anonymous account on this device.</small></div></div>}

function ExerciseCard({name,muscle,saved,onSave,onDelete,onEdit,config,onConfigUpdate}){
  const [swiped,setSwiped]=useState(false);
  const [isEditing,setIsEditing]=useState(false);
  const [editName,setEditName]=useState(name);
  const [editMuscle,setEditMuscle]=useState(muscle);
  const setsCount=Math.max(1,Number(config?.sets)||3);
  const reps=Number(config?.reps)||8;
  const baseWeight=Number(defaults[name]??10);
  const initialWeights=Array.from({length:setsCount},(_,i)=>Number(saved?.[name]?.[i]??baseWeight));
  const [values,setValues]=useState(initialWeights);

  useEffect(()=>{
    setValues(Array.from({length:Math.max(1,Number(config?.sets)||3)},(_,i)=>Number(saved?.[name]?.[i]??defaults[name]??10)));
    setEditName(name);
    setEditMuscle(muscle);
  },[name,muscle,saved,config?.sets]);

  const best=Math.max(...values.map(Number));
  const changed=values.length!==setsCount || values.some((v,i)=>Number(v)!==Number(saved?.[name]?.[i]??defaults[name]??10));

  const handleEditSubmit=()=>{
    if(!editName.trim())return;
    onEdit(name,muscle,editName.trim(),editMuscle);
    setIsEditing(false);
    setSwiped(false);
  };

  if(isEditing){
    return <article className="exercise">
      <div className="eyebrow">EDIT EXERCISE</div>
      <input className="money-input" placeholder="Exercise name" value={editName} onChange={e=>setEditName(e.target.value)}/>
      <select className="select-input" style={{marginTop:'8px'}} value={editMuscle} onChange={e=>setEditMuscle(e.target.value)}>
        {Object.keys(baseExercises).map(x=><option key={x} value={x}>{x}</option>)}
      </select>
      <div className="edit-actions">
        <button className="save-inline" onClick={handleEditSubmit}>SAVE CHANGES</button>
        <button className="save-inline cancel-btn" onClick={()=>{setEditName(name);setEditMuscle(muscle);setIsEditing(false)}}>CANCEL</button>
      </div>
    </article>;
  }

  return <article className={'exercise swipeCard '+(swiped?'swiped':'')} onTouchStart={e=>{e.currentTarget._x=e.touches[0].clientX}} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-e.currentTarget._x;if(dx<-50)setSwiped(true);if(dx>50)setSwiped(false)}}>
    <div className="swipeActions">
      <button className="editSwipe" onClick={()=>{setIsEditing(true);setSwiped(false)}}>EDIT</button>
      <button className="deleteSwipe" onClick={()=>onDelete(name,muscle)}>DELETE</button>
    </div>
    <div className="exerciseContent">
      <div className="ex-top">
        <div>
          <div className="muscle-row"><span className="muscle">{muscle}</span><button className="edit-chip" title="Edit exercise" onClick={()=>setIsEditing(true)}>✎</button></div>
          <div className="name">{name}</div>
          <div className="exercise-target">{setsCount} sets · {reps} reps</div>
        </div>
        <div className="lastbox">BEST<strong>{best} kg</strong></div>
      </div>
      <div className="target">
        <div className="target-row"><span>Next target</span><b>{best+2.5} kg</b></div>
        <div className="inline-sets" style={{gridTemplateColumns:setsCount<=3?'repeat(3,1fr)':setsCount===4?'repeat(4,1fr)':'repeat(4,1fr)'}}>
          {values.map((v,i)=><label className="setbox" key={i}><small>Set {i+1}</small><input type="number" step=".5" value={v} onChange={e=>{const x=[...values];x[i]=e.target.value;setValues(x)}}/></label>)}
        </div>
        {changed&&<button className="save-inline" onClick={()=>onSave(name,values.map(v=>Number(v)||0))}>SAVE EXERCISE</button>}
      </div>
    </div>
  </article>;
}

function Workout({day,setDay,saved,onSave,onAdd,onDelete,onEdit,exercises,exerciseConfig,onConfigUpdate}){
  const groups=plan[day];
  return <><div className="eyebrow">{new Date().toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'short'})} · TRAINING LOG</div><h1>What are you<br/>training today?</h1><div className="day-scroll">{days.map(d=><button className={'day '+(d===day?'active':'')} onClick={()=>setDay(d)} key={d}><small>{d.slice(0,3).toUpperCase()}</small><b>{d}</b><em>{plan[d].join(' + ')}</em></button>)}</div>{groups[0]==='Rest'?<section className="section rest"><div className="eyebrow">RECOVERY DAY</div><div className="big">Rest today.<br/>Come back stronger.</div></section>:<section className="section"><div className="section-head"><h2>{groups.join(' + ')}</h2><span>{groups.reduce((n,m)=>n+(exercises[m]?.length||0),0)} exercises</span></div>{groups.flatMap(m=>(exercises[m]||[]).map(e=><ExerciseCard key={m+e} name={e} muscle={m} saved={saved} onSave={onSave} onDelete={onDelete} onEdit={onEdit} config={exerciseConfig[e]} onConfigUpdate={onConfigUpdate} />))}</section>}<AddExercise onAdd={onAdd}/></>;
}

function AddExercise({onAdd}){const [open,setOpen]=useState(false);const [name,setName]=useState('');const [muscle,setMuscle]=useState('Chest');const [weight,setWeight]=useState('');if(!open)return <button className="save addBtn" onClick={()=>setOpen(true)}>+ ADD EXERCISE</button>;return <div className="exercise"><div className="eyebrow">NEW EXERCISE</div><input className="money-input" placeholder="Exercise name" value={name} onChange={e=>setName(e.target.value)}/><select className="select-input" value={muscle} onChange={e=>setMuscle(e.target.value)}>{Object.keys(baseExercises).map(x=><option key={x}>{x}</option>)}</select><input className="select-input" type="number" step=".5" placeholder="Starting weight (kg)" value={weight} onChange={e=>setWeight(e.target.value)}/><button className="save" onClick={()=>{if(name.trim())onAdd(name.trim(),muscle,Number(weight)||0);setName('');setOpen(false)}}>ADD TO WORKOUT</button></div>}

function Profile({session,onProfileUpdate}){
  const meta=session?.user?.user_metadata;
  const [p,setP]=useState(()=>{
    const local=read('forgeProfile',{name:'',height:'177',weight:'75',goal:'Lean bulk',activity:'Work from home'});
    return {
      name:meta?.name??local?.name??'',
      height:meta?.height??local?.height??'177',
      weight:meta?.weight??local?.weight??'75',
      goal:meta?.goal??local?.goal??'Lean bulk',
      activity:meta?.activity??local?.activity??'Work from home'
    };
  });
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    if(meta?.name||meta?.height){
      setP(prev=>({
        name:meta.name??prev.name,
        height:meta.height??prev.height,
        weight:meta.weight??prev.weight,
        goal:meta.goal??prev.goal,
        activity:meta.activity??prev.activity
      }));
    }
  },[meta]);

  const save=async()=>{
    setSaving(true);
    localStorage.setItem('forgeProfile',JSON.stringify(p));
    if(session?.access_token&&session?.user?.id){
      try{
        await db(session,'profiles?on_conflict=id',{
          method:'POST',
          headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
          body:JSON.stringify({id:session.user.id,display_name:p.name})
        });
        const r=await fetch(SUPABASE_URL+'/auth/v1/user',{
          method:'PUT',
          headers:headers(session),
          body:JSON.stringify({data:{name:p.name,height:p.height,weight:p.weight,goal:p.goal,activity:p.activity}})
        });
        if(r.ok){
          const updated=await r.json();
          if(updated?.id){
            const nextSession={...session,user:updated};
            localStorage.setItem('forgeSession',JSON.stringify(nextSession));
            onProfileUpdate?.(nextSession);
          }
        }
      }catch(e){
        console.error('Profile cloud sync failed',e);
      }
    }
    setSaving(false);
    alert('Profile saved ✓');
  };

  return <><div className="eyebrow">PROFILE / PERSONAL DATA</div><h1>Build your<br/>profile.</h1><div className="exercise"><div className="eyebrow">IDENTITY</div><input className="money-input" placeholder="Your name" value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></div><div className="exercise"><div className="eyebrow">BODY</div><div className="profileGrid"><input className="select-input" type="number" value={p.height} onChange={e=>setP({...p,height:e.target.value})}/><input className="select-input" type="number" value={p.weight} onChange={e=>setP({...p,weight:e.target.value})}/></div></div><div className="exercise"><div className="eyebrow">TRAINING GOAL</div><select className="select-input" value={p.goal} onChange={e=>setP({...p,goal:e.target.value})}>{['Lean bulk','Muscle gain','Fat loss','Maintain'].map(x=><option key={x}>{x}</option>)}</select><div className="eyebrow">LIFESTYLE</div><select className="select-input" value={p.activity} onChange={e=>setP({...p,activity:e.target.value})}>{['Work from home','Office','Active'].map(x=><option key={x}>{x}</option>)}</select></div><button className="save" disabled={saving} onClick={save}>{saving?'SAVING…':'SAVE PROFILE'}</button></>;
}

function Diet({diet}){
  const p=read('forgeProfile',{height:'177',weight:'75',goal:'Lean bulk'});
  return <><div className="eyebrow">NUTRITION / DAILY ROUTINE</div><h1>Eat for<br/>the work.</h1>
    <div className="exercise"><div className="ex-top"><div><div className="muscle">PROFILE</div><div className="name">{p.height} cm · {p.weight} kg</div></div><div className="lastbox">GOAL<strong>{p.goal.toUpperCase()}</strong></div></div></div>
    {diet.map((m,i)=><div className="exercise" key={m.id||i}><div className="ex-top"><div><div className="num">{m.time}</div><div className="muscle">MEAL {i+1}</div><div className="name">{m.name}</div></div></div><div className="mealText">{m.food}</div></div>)}
  </>;
}

function ForgeAI({session,day,exercises,exerciseConfig,diet,onExerciseAction,onDietAction}){
  const [open,setOpen]=useState(false);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [messages,setMessages]=useState([{role:'assistant',text:'I can change your workout and diet. Try “make bench press 4 sets of 8” or “replace my snack with Greek yogurt and fruit”.'}]);

  const context={
    today:day,
    exercises:Object.entries(exercises).flatMap(([muscle,names])=>(names||[]).map(name=>({name,muscle,...(exerciseConfig[name]||{sets:3,reps:8})}))),
    diet
  };

  const send=async()=>{
    const text=message.trim();
    if(!text||busy)return;
    setMessages(x=>[...x,{role:'user',text}]);
    setMessage('');
    setBusy(true);
    try{
      const r=await fetch(SUPABASE_URL+'/functions/v1/forge-ai',{
        method:'POST',
        headers:headers(session),
        body:JSON.stringify({message:text,context})
      });
      const data=await r.json();
      if(!r.ok)throw Error(data?.error||'AI request failed');
      if(data.type==='tool_call'){
        const result=data.tool==='update_exercise'||data.tool==='add_exercise'||data.tool==='delete_exercise'||data.tool==='replace_exercise'
          ? onExerciseAction(data.tool,data.arguments||{})
          : onDietAction(data.tool,data.arguments||{});
        setMessages(x=>[...x,{role:'assistant',text:result||'Done. I updated Forge.'}]);
      }else{
        setMessages(x=>[...x,{role:'assistant',text:data.reply||'Done.'}]);
      }
    }catch(e){
      setMessages(x=>[...x,{role:'assistant',text:e.message||'Something went wrong.'}]);
    }finally{setBusy(false)}
  };

  if(!open)return <button className="ai-fab" onClick={()=>setOpen(true)}><span>✦</span> FORGE AI</button>;

  return <div className="ai-panel">
    <div className="ai-head"><div><div className="eyebrow">FORGE AI</div><h2>Tell Forge what to change.</h2></div><button className="close" onClick={()=>setOpen(false)}>×</button></div>
    <div className="ai-messages">{messages.map((m,i)=><div key={i} className={'ai-message '+m.role}>{m.text}</div>)}</div>
    <div className="ai-compose"><input className="money-input" placeholder="e.g. Make bench press 4 × 8" value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}}/><button className="save" disabled={busy} onClick={send}>{busy?'THINKING…':'SEND'}</button></div>
  </div>;
}

function Todo({token}){const [todos,setTodos]=useState(read('forgeTodos',[]));const [text,setText]=useState('');const [date,setDate]=useState('');const add=async()=>{if(!text.trim())return;const due=date||new Date().toISOString().slice(0,10);try{const r=await db(token,'todos',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:token.user.id,text:text.trim(),due_date:due,done:false})});const t=r?.[0];setTodos(x=>[...x,{id:t?.id||Date.now(),text:text.trim(),date:due,done:false}]);setText('');setDate('')}catch(e){console.error(e);localStorage.removeItem('forgeSession');window.location.reload()}};const toggle=async t=>{const next=!t.done;setTodos(x=>x.map(a=>a.id===t.id?{...a,done:next}:a));try{await db(token,'todos?id=eq.'+encodeURIComponent(t.id),{method:'PATCH',body:JSON.stringify({done:next})})}catch{}};useEffect(()=>localStorage.setItem('forgeTodos',JSON.stringify(todos)),[todos]);return <><div className="eyebrow">PLANNING / MONTHLY TIMELINE</div><h1>Get things<br/>done.</h1><div className="exercise"><div className="eyebrow">ADD TODO</div><input className="money-input" placeholder="What needs to be done?" value={text} onChange={e=>setText(e.target.value)}/><div className="todoAdd"><input className="select-input" type="date" value={date} onChange={e=>setDate(e.target.value)}/><button className="save-inline" onClick={add}>ADD TODO</button></div></div><div className="section-head"><h2>Timeline</h2></div>{todos.sort((a,b)=>a.date.localeCompare(b.date)).map(t=><div className="exercise todoRow" key={t.id}><button className="todo-check" onClick={()=>toggle(t)}>{t.done?'✓':''}</button><div><b className={t.done?'done':''}>{t.text}</b><div className="todo-meta">{t.date}</div></div></div>)}</>}

const loadExercises=()=>{
  const stored=read('forgeExercises',null);
  if(stored&&typeof stored==='object'&&Object.keys(stored).length)return stored;
  const legacy=read('forgeCustomExercises',{});
  const merged={};
  for(const m of Object.keys(baseExercises)){
    merged[m]=Array.from(new Set([...(baseExercises[m]||[]),...(legacy[m]||[])]));
  }
  for(const m of Object.keys(legacy)){
    if(!merged[m])merged[m]=[...legacy[m]];
  }
  return merged;
};

export default function App(){
  const [session,setSession]=useState(()=>{const s=read('forgeSession',null);return s?.access_token?.split('.').length===3?s:null});
  const [page,setPage]=useState('home');
  const [day,setDay]=useState(new Intl.DateTimeFormat('en-US',{weekday:'long'}).format(new Date()));
  const [saved,setSaved]=useState(read('forgeMobile',{}));
  const [exercises,setExercises]=useState(loadExercises);
  const [exerciseConfig,setExerciseConfig]=useState(()=>read('forgeExerciseConfig',{}));
  const [diet,setDiet]=useState(()=>read('forgeDiet',defaultDiet));

  useEffect(()=>{
    if(!session?.access_token)return;
    fetch(SUPABASE_URL+'/auth/v1/user',{headers:headers(session)})
      .then(r=>r.ok?r.json():null)
      .then(u=>{
        if(u?.user_metadata&&(u.user_metadata.name||u.user_metadata.height)){
          const m=u.user_metadata;
          const current=read('forgeProfile',{});
          const merged={
            name:m.name??current.name??'',
            height:m.height??current.height??'177',
            weight:m.weight??current.weight??'75',
            goal:m.goal??current.goal??'Lean bulk',
            activity:m.activity??current.activity??'Work from home'
          };
          localStorage.setItem('forgeProfile',JSON.stringify(merged));
          setSession(s=>s?{...s,user:u}:s);
        }
      })
      .catch(()=>{});
  },[session?.access_token]);

  const updateExerciseConfig=(name,patch)=>{
    setExerciseConfig(prev=>{
      const current=prev[name]||{sets:3,reps:8};
      const next={...prev,[name]:{...current,...patch}};
      localStorage.setItem('forgeExerciseConfig',JSON.stringify(next));
      return next;
    });
  };

  const onExerciseAction=(tool,args)=>{
    const findName=()=>Object.values(exercises).flat().find(x=>x.toLowerCase()===String(args.exercise||'').toLowerCase())||args.exercise;
    if(tool==='update_exercise'){
      const oldName=findName();
      if(!oldName||!Object.values(exercises).flat().some(x=>x===oldName))return 'I could not find that exercise in your workout.';
      const newName=(args.newName||oldName).trim();
      const newMuscle=args.muscle||Object.keys(exercises).find(m=>(exercises[m]||[]).includes(oldName))||'Other';
      if(newName!==oldName||newMuscle!==Object.keys(exercises).find(m=>(exercises[m]||[]).includes(oldName))){
        const oldMuscle=Object.keys(exercises).find(m=>(exercises[m]||[]).includes(oldName))||'Other';
        const next={...exercises};
        next[oldMuscle]=(next[oldMuscle]||[]).filter(x=>x!==oldName);
        next[newMuscle]=Array.from(new Set([...(next[newMuscle]||[]),newName]));
        setExercises(next);
        localStorage.setItem('forgeExercises',JSON.stringify(next));
        if(newName!==oldName)setSaved(prev=>{const n={...prev};if(n[oldName]!==undefined){n[newName]=n[oldName];delete n[oldName]}localStorage.setItem('forgeMobile',JSON.stringify(n));return n});
        if(newName!==oldName||newMuscle!==oldMuscle)updateExerciseConfig(newName,{...(exerciseConfig[oldName]||{}),...(args.sets?{sets:Number(args.sets)}:{}),...(args.reps?{reps:Number(args.reps)}:{})});
      }
      updateExerciseConfig(newName,{sets:args.sets?Math.max(1,Math.min(12,Number(args.sets))):Number(exerciseConfig[oldName]?.sets||3),reps:args.reps?Math.max(1,Math.min(100,Number(args.reps))):Number(exerciseConfig[oldName]?.reps||8)});
      if(args.weight!==undefined){
        const count=Number(args.sets||exerciseConfig[oldName]?.sets||3);
        setSaved(prev=>{const n={...prev,[newName]:Array.from({length:count},()=>Number(args.weight)||0)};localStorage.setItem('forgeMobile',JSON.stringify(n));return n});
      }
      return `Updated ${newName} to ${args.sets||exerciseConfig[oldName]?.sets||3} sets × ${args.reps||exerciseConfig[oldName]?.reps||8} reps.`;
    }
    if(tool==='add_exercise'){
      const name=String(args.name||args.exercise||'').trim();
      if(!name)return 'I need an exercise name.';
      add(name,args.muscle||'Other',Number(args.weight)||0);
      updateExerciseConfig(name,{sets:Number(args.sets)||3,reps:Number(args.reps)||8});
      return `Added ${name} to your workout.`;
    }
    if(tool==='delete_exercise'){
      const name=findName();
      const muscle=Object.keys(exercises).find(m=>(exercises[m]||[]).includes(name));
      if(!muscle)return 'I could not find that exercise.';
      remove(name,muscle);
      return `Deleted ${name}.`;
    }
    if(tool==='replace_exercise'){
      const oldName=findName();
      const oldMuscle=Object.keys(exercises).find(m=>(exercises[m]||[]).includes(oldName));
      if(oldMuscle)remove(oldName,oldMuscle);
      const newName=String(args.newName||args.name||'').trim();
      if(newName)add(newName,args.muscle||'Other',Number(args.weight)||0);
      if(newName)updateExerciseConfig(newName,{sets:Number(args.sets)||3,reps:Number(args.reps)||8});
      return newName?`Replaced ${oldName} with ${newName}.`:'I need the replacement exercise name.';
    }
    return 'I could not apply that workout change.';
  };

  const onDietAction=(tool,args)=>{
    const norm=x=>String(x||'').toLowerCase();
    if(tool==='update_meal'){
      const idx=diet.findIndex(m=>norm(m.id)===norm(args.meal)||norm(m.name)===norm(args.meal)||norm(m.food).includes(norm(args.meal)));
      if(idx<0)return 'I could not find that meal.';
      const next=diet.map((m,i)=>i===idx?{...m,time:args.time||m.time,name:args.newName||args.name||m.name,food:args.food||args.items||m.food}:m);
      setDiet(next);localStorage.setItem('forgeDiet',JSON.stringify(next));
      return `Updated ${next[idx].name}.`;
    }
    if(tool==='add_meal'){
      const item={id:'meal-'+Date.now(),time:args.time||'12:00',name:args.name||'Meal',food:args.food||args.items||''};
      const next=[...diet,item].sort((a,b)=>a.time.localeCompare(b.time));
      setDiet(next);localStorage.setItem('forgeDiet',JSON.stringify(next));
      return `Added ${item.name}.`;
    }
    if(tool==='delete_meal'){
      const idx=diet.findIndex(m=>norm(m.id)===norm(args.meal)||norm(m.name)===norm(args.meal));
      if(idx<0)return 'I could not find that meal.';
      const next=diet.filter((_,i)=>i!==idx);setDiet(next);localStorage.setItem('forgeDiet',JSON.stringify(next));
      return `Deleted ${diet[idx].name}.`;
    }
    if(tool==='replace_meal'){
      const idx=diet.findIndex(m=>norm(m.id)===norm(args.meal)||norm(m.name)===norm(args.meal));
      if(idx<0)return 'I could not find that meal.';
      const old=diet[idx], item={...old,id:old.id,time:args.time||old.time,name:args.name||args.newName||old.name,food:args.food||args.items||old.food};
      const next=diet.map((m,i)=>i===idx?item:m);setDiet(next);localStorage.setItem('forgeDiet',JSON.stringify(next));
      return `Replaced ${old.name}.`;
    }
    return 'I could not apply that diet change.';
  };

  const save=async(name,values)=>{const next={...saved,[name]:values};setSaved(next);localStorage.setItem('forgeMobile',JSON.stringify(next));if(session)try{await db(session,'workout_sets?on_conflict=user_id,workout_date,exercise',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:session.user.id,workout_date:new Date().toISOString().slice(0,10),exercise:name,set1:values[0],set2:values[1],set3:values[2]})})}catch(e){console.error(e)}};

  const remove=async(name,muscle)=>{
    const next={...exercises,[muscle]:(exercises[muscle]||[]).filter(x=>x!==name)};
    setExercises(next);
    localStorage.setItem('forgeExercises',JSON.stringify(next));
    setSaved(x=>{const n={...x};delete n[name];localStorage.setItem('forgeMobile',JSON.stringify(n));return n});
  };

  const add=(name,muscle,weight)=>{
    if(!name)return;
    const trimmed=name.trim();
    if(!trimmed)return;
    if((exercises[muscle]||[]).includes(trimmed))return;
    const next={...exercises,[muscle]:[...(exercises[muscle]||[]),trimmed]};
    setExercises(next);
    localStorage.setItem('forgeExercises',JSON.stringify(next));
    if(weight){
      const nextSaved={...saved,[trimmed]:[weight,weight,weight]};
      setSaved(nextSaved);
      localStorage.setItem('forgeMobile',JSON.stringify(nextSaved));
    }
  };

  const edit=async(oldName,oldMuscle,newName,newMuscle)=>{
    if(!newName)return;
    const trimmed=newName.trim();
    if(!trimmed)return;

    const next={...exercises};
    next[oldMuscle]=(next[oldMuscle]||[]).filter(x=>x!==oldName);
    const targetList=next[newMuscle]||[];
    if(!targetList.includes(trimmed)){
      next[newMuscle]=[...targetList,trimmed];
    }
    setExercises(next);
    localStorage.setItem('forgeExercises',JSON.stringify(next));

    if(trimmed!==oldName){
      setSaved(x=>{
        const n={...x};
        if(n[oldName]!==undefined){
          n[trimmed]=n[oldName];
          delete n[oldName];
        }
        localStorage.setItem('forgeMobile',JSON.stringify(n));
        return n;
      });
      if(session?.user?.id){
        try{
          await db(session,'workout_sets?user_id=eq.'+session.user.id+'&exercise=eq.'+encodeURIComponent(oldName),{
            method:'PATCH',
            headers:{Prefer:'return=minimal'},
            body:JSON.stringify({exercise:trimmed})
          });
        }catch(e){
          console.error('Failed to sync exercise rename to Supabase:',e);
        }
      }
    }
  };

  if(!session)return <AuthGate onReady={setSession}/>;
  return <div className="app"><header className="topbar"><div className="logo">FORGE<span>●</span></div><div className="iconbtn">●</div></header><main>{page==='home'&&<Workout day={day} setDay={setDay} saved={saved} onSave={save} onAdd={add} onDelete={remove} onEdit={edit} exercises={exercises} exerciseConfig={exerciseConfig} onConfigUpdate={updateExerciseConfig}/>} {page==='profile'&&<Profile session={session} onProfileUpdate={setSession}/>}{page==='diet'&&<Diet diet={diet}/>} {page==='ai'&&<ForgeAI session={session} day={day} exercises={exercises} exerciseConfig={exerciseConfig} diet={diet} onExerciseAction={onExerciseAction} onDietAction={onDietAction}/>} {page==='todo'&&<Todo token={session}/>}</main><div className="bottom"><nav className="nav">{[['home','⌂','Today'],['profile','◉','Profile'],['diet','⌁','Diet'],['ai','✦','AI'],['todo','✓','Todo']].map(([id,icon,label])=><button className={page===id?'active':''} onClick={()=>setPage(id)} key={id}><i>{icon}</i>{label}</button>)}</nav></div></div>;
}