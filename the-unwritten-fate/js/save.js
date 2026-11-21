/* ===== SAVE MANAGER (swap Store for a cloud adapter later; today it is local only) ===== */
const KEY="unwritten-fate-v4";
const Store={load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}},
save(d){try{localStorage.setItem(KEY,JSON.stringify(d));return true}catch(e){return false}},
clear(){try{localStorage.removeItem(KEY)}catch(e){}}};
const fresh=()=>({scene:null,leaf:0,trail:[],vis:[],log:[],flags:{},found:[],done:[],started:false});
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const saved=Store.load()||{};
let st=Object.assign(fresh(),saved.st||{}),opt=Object.assign({motion:reduce?"off":"on",size:1.15},saved.opt||{});
const $=s=>document.querySelector(s),SC=Object.keys(STORY.scenes),N=SC.length;
const has=k=>st.flags[k]||st.found.includes(k);
const persist=()=>Store.save({st,opt});
const vis=s=>s.p.filter(p=>typeof p==="string"||has(p[0])).map(p=>typeof p==="string"?p:p[1]);
function pages(l){const o=[];let c=[],n=0;l.forEach(p=>{const w=p.split(" ").length;if(c.length&&n+w>165){o.push(c);c=[];n=0}c.push(p);n+=w});if(c.length)o.push(c);return o}
const PG=id=>pages(vis(STORY.scenes[id]));
let TOT=0;const OFF={};SC.forEach(k=>{OFF[k]=TOT;TOT+=pages(STORY.scenes[k].p.filter(p=>typeof p==="string")).length});
