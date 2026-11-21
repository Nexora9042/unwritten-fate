/* ===== UI HELPERS ===== */
let tt;function toast(m){const t=$("#toast");t.textContent=m;t.classList.remove("hide");clearTimeout(tt);tt=setTimeout(()=>t.classList.add("hide"),2800)}
function applyOpt(){document.body.dataset.motion=opt.motion;document.documentElement.style.setProperty("--fs",opt.size+"rem")}
/* ===== LANDING ===== */
function landing(){
const fl=Array.from({length:9},(_,i)=>`<i class="fl" style="left:${8+i*10}%;animation-delay:-${i*2.4}s;animation-duration:${19+i*2}s"></i>`).join("");
$("#landing").innerHTML=fl+`<svg class="motif" viewBox="0 0 340 170" aria-hidden="true"><path d="M170 40C130 22 70 24 20 40v100c50-16 110-18 150 0 40-18 100-16 150 0V40c-50-16-110-18-150 0z" fill="#E8DFC9" stroke="#C5A66A" stroke-width="2"/><path d="M170 40v100" stroke="#176B78" stroke-width="4"/><path d="M40 70c30-8 80-8 110 0M40 90c30-8 80-8 110 0M190 70c30-8 80-8 110 0" stroke="#4F9A9A" fill="none" opacity=".6"/><path d="M60 158c40-10 80 10 120 0s80-10 100 0" stroke="#4F9A9A" fill="none"/><circle cx="238" cy="96" r="6" fill="#082F3D"/><path d="M238 82c-5 8-7 11-7 14a7 7 0 0014 0c0-3-2-6-7-14z" fill="#082F3D"/></svg>
<h1>The <span>·</span>Unwritten Fate</h1><p class="tag">Of the seventh, nothing was ever written.</p>
<button class="cta" id="start">${st.started?"Continue Reading":"Begin Reading"}</button>
<p class="sub">You are the Seventh Vessel. Every choice is yours.</p>`;
$("#start").onclick=()=>{st.started&&st.scene?go(st.scene,true,st.leaf):go(STORY.start)};
}
/* ===== ENGINE ===== */
function view(v){$("#landing").classList.toggle("hide",v!=="landing");$("#reader").classList.toggle("hide",v!=="read");if(v==="landing")landing()}
function go(id,keep,leaf){
const s=STORY.scenes[id];st.scene=id;st.leaf=leaf||0;st.started=true;
if(!keep&&st.trail[st.trail.length-1]!==id)st.trail.push(id);
if(!st.vis.includes(id))st.vis.push(id);
for(let c=0;c<s.c;c++)if(!st.done.includes(c))st.done.push(c);
if(s.end&&!st.done.includes(s.c))st.done.push(s.c);
const nw=(s.f||[]).filter(k=>!st.found.includes(k));
nw.forEach(k=>st.found.push(k));
persist();view("read");render();
if(nw.length)toast("Journal updated: "+nw.map(k=>STORY.lore[k].t).join(", "));
}
function choose(sc,i){const c=STORY.scenes[sc].ch[i];
st.log=st.log.filter(l=>l.sc!==sc);st.log.push({sc,i,t:c.log||c.t});
[].concat(c.set||[]).forEach(k=>st.flags[k]=true);go(c.to)}
function back(){if(st.leaf>0){st.leaf--;persist();render();return}if(st.trail.length>1){st.trail.pop();const p=st.trail[st.trail.length-1];go(p,true,PG(p).length-1)}}
function render(){
const id=st.scene,s=STORY.scenes[id],ch=STORY.chapters.find(c=>c.id===s.c),pgs=PG(id);
st.leaf=Math.min(st.leaf||0,pgs.length-1);const lf=st.leaf,last=lf===pgs.length-1,pg=(OFF[id]+lf)*2+1;
const picked=(st.log.find(l=>l.sc===id)||{}).i;
const paras=pgs[lf].map(p=>p[0]==="~"?`<blockquote class="q">${p.slice(1)}</blockquote>`:`<p>${p}</p>`).join("");
const nxt=`<button class="opt nxt" id="nx"><b>→</b><span>Turn the page</span></button>`;
let tail=nxt;
if(last){if(s.end)tail=`<div class="orn">❦</div><p class="end">The telling ends: ${s.end}</p>`;
else if(s.ch&&s.ch.length)tail=`<p class="ask">What will you do?</p>`+s.ch.map((c,i)=>{const lock=c.need&&!has(c.need),L="ABC"[i];
return lock?`<button class="opt" disabled><b>${L}.</b><span><span class="lock">▮▮▮▮▮▮</span> ${c.hint}</span></button>`
:`<button class="opt ${picked===i?"on":""}" data-i="${i}"><b>${L}.</b><span>${c.t}</span></button>`}).join("");
else if(!s.nx)tail=""}
$("#reader").innerHTML=`<div class="book"><div class="pg l"><div class="sym">${ch.sym}</div><div class="num">${ch.n}</div><h2>${ch.title}</h2><div class="orn">❦</div><p class="epi">${ch.epi}</p><div class="pn">${pg}</div></div><div class="spine"></div>
<div class="pg r turn">${lf?`<h2 class="run">${s.title}</h2>`:`<h2>${s.title}</h2><div class="orn">◆</div>`}<div class="txt ${lf?"":"f"}">${paras}</div>${tail}<div class="pn">${pg+1}</div></div></div>
<div class="ctl"><button id="bk" ${lf===0&&st.trail.length<2?"disabled":""}>Previous page</button><button id="sv">Save</button><button data-p="index">Index</button>${s.end?'<button id="again">Begin again</button>':""}<span>Pages ${pg}–${pg+1} of ${TOT*2}</span></div>`;
document.querySelectorAll("#reader .opt[data-i]").forEach(b=>b.onclick=()=>choose(id,+b.dataset.i));
if($("#nx"))$("#nx").onclick=()=>{if(!last){st.leaf++;persist();render()}else go(s.nx)};
$("#bk").onclick=back;$("#sv").onclick=()=>toast(persist()?"Saved on this device only (browser storage).":"Could not save: browser storage is unavailable.");
if($("#again"))$("#again").onclick=restartNow;
document.querySelectorAll("#reader [data-p]").forEach(b=>b.onclick=()=>panel(b.dataset.p));
window.scrollTo(0,0);
}
function restartNow(){Store.clear();st=fresh();closeP();view("landing");toast("Book reset. Your pages are blank again.")}
/* ===== PANELS: INDEX, JOURNAL, ARCHIVE, SETTINGS ===== */
const closeP=()=>$("#panel").classList.add("hide");
function panel(kind,tab){
const P=$("#panel");let h="";
const head=t=>`<button class="x" id="cl" aria-label="Close">✕</button><h3>${t}</h3>`;
if(kind==="index"){h=head("Index");
STORY.chapters.forEach(c=>{const ids=SC.filter(k=>STORY.scenes[k].c===c.id),seen=ids.filter(k=>st.vis.includes(k)),open=seen.length>0,cur=open&&STORY.scenes[st.scene]&&STORY.scenes[st.scene].c===c.id;
h+=`<div class="ch"><span class="rn">${c.n}</span><span class="tt">${c.sym} ${open?c.title:"Sealed chapter"}</span><small>${!open?"Locked: reach it through your choices":st.done.includes(c.id)?"Completed":"Unlocked"}${cur?" · You are here":""}</small>
${open?`<div><div class="bar"><i style="width:${seen.length/ids.length*100}%"></i></div><div class="pgs">${seen.map(k=>`<button data-sc="${k}" class="${k===st.scene?"cur":""}">${STORY.scenes[k].title} (p. ${OFF[k]*2+1})</button>`).join("")}</div></div>`:""}</div>`});
h+=`<p><small>Revisiting a page lets you choose differently. Your other progress is kept.</small></p>`}
if(kind==="journal"||kind==="archive"){const j=kind==="journal";h=head(j?"The Journal":"The Archive")+`<div class="tabs"><button class="${j?"on":""}" data-p="journal">Notes</button><button class="${j?"":"on"}" data-p="archive">Archive</button></div>`;
const ids=Object.keys(STORY.lore);
if(j){const f=ids.filter(k=>st.found.includes(k));h+=f.length?f.map(k=>{const e=STORY.lore[k];return`<div class="nt"><span class="cat">${e.cat}</span><h4>${e.t}</h4><p>${e.d}</p></div>`}).join(""):"<p>Nothing written yet. Begin reading and the pages will start filling.</p>";
h+=`<div class="orn">❦</div><h4 style="font:500 1.5rem Caveat,cursive;margin:0">Decisions made</h4>`+(st.log.length?st.log.map(l=>`<p>p. ${OFF[l.sc]*2+1}: ${l.t}</p>`).join(""):"<p>None yet.</p>")}
else{[...new Set(ids.map(k=>STORY.lore[k].cat))].forEach(c=>{h+=`<div class="orn">${c}</div>`;ids.filter(k=>STORY.lore[k].cat===c).forEach(k=>{const e=STORY.lore[k];h+=st.found.includes(k)?`<div class="nt"><h4>${e.t}</h4><p>${e.d}</p></div>`:`<div class="nt"><h4 class="lock">▮▮▮▮▮▮▮▮</h4><p class="lock">Sealed. Keep reading.</p></div>`})});h+=`<p><small>${st.found.length} of ${ids.length} entries uncovered.</small></p>`}}
if(kind==="settings"){h=head("Settings")+`<div class="set"><span>Page motion and drifting paper</span><button class="sm" id="mo">${opt.motion==="on"?"On":"Off"}</button></div>
<div class="set"><span>Text size</span><span><button class="sm" id="s1">A−</button> <button class="sm" id="s2">A+</button></span></div>
<div class="set"><span>Save now<br><small>Saved in this browser only. There is no cloud save.</small></span><button class="sm" id="sv2">Save</button></div>
<div class="set"><span>Restart the book</span><span id="rs"><button class="sm" id="r1">Restart…</button></span></div>`}
P.innerHTML=`<div class="sheet">${h}</div>`;P.classList.remove("hide");$("#cl").onclick=closeP;$("#cl").focus();
P.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>panel(b.dataset.p));
P.querySelectorAll("[data-sc]").forEach(b=>b.onclick=()=>{closeP();go(b.dataset.sc,true)});
if(kind==="settings"){$("#mo").onclick=()=>{opt.motion=opt.motion==="on"?"off":"on";applyOpt();persist();panel("settings")};
$("#s1").onclick=()=>{opt.size=Math.max(.95,opt.size-.1);applyOpt();persist()};$("#s2").onclick=()=>{opt.size=Math.min(1.6,opt.size+.1);applyOpt();persist()};
$("#sv2").onclick=()=>toast(persist()?"Saved on this device only (browser storage).":"Could not save: browser storage is unavailable.");
$("#r1").onclick=()=>{$("#rs").innerHTML=`Erase all progress? <button class="sm" id="r2">Yes, erase</button> <button class="sm" id="r3">Keep it</button>`;$("#r2").onclick=restartNow;$("#r3").onclick=()=>panel("settings")}}}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeP();if($("#panel").classList.contains("hide")&&!$("#reader").classList.contains("hide")){const b=$(e.key==="ArrowRight"?"#nx":e.key==="ArrowLeft"?"#bk":"#none");if(b&&!b.disabled)b.click()}});
document.querySelectorAll("#bar [data-p]").forEach(b=>b.onclick=()=>panel(b.dataset.p));
$("#bar .brand").onclick=()=>view("landing");
applyOpt();view("landing");
setInterval(()=>st.started&&persist(),20000);
