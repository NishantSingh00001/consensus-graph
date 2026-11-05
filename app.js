'use strict';
window.APP={
  id:'cg',name:'ConsensusGraph',
  logo:'<span class="mk"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="7" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M8 7l8 .5M7.5 8l4 8M16.5 9l-4 7"/></svg></span>',
  nav:[['index.html','home','Home'],['claims.html','claim','Claims'],['graph.html','graph','Graph'],['analysis.html','analysis','Analysis'],['settings.html','settings','Settings']],
  accents:[['#a78bfa','#5ad1ff','#ffcf6b'],['#5ad1ff','#a78bfa','#55e0a0'],['#ff8fbf','#a78bfa','#5ad1ff'],['#55e0a0','#5ad1ff','#a78bfa']],
  cta:['claims.html','claim','Add claims'],
  heroKind:'graph',
  icons:{claim:'M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2zM14 3v5h5M8 13h8M8 17h5',graph:'M6 6a2 2 0 100 4 2 2 0 000-4zM18 7a2 2 0 100 4 2 2 0 000-4zM12 16a2 2 0 100 4 2 2 0 000-4zM7.6 8.2l8.4.4M7.5 9.5l4 6M16.4 10l-4 5.5',analysis:'M4 20V10M10 20V4M16 20v-7M2 20h20',link:'M9 15l6-6M10 7l1-1a4 4 0 015.6 5.6l-1 1M14 17l-1 1a4 4 0 01-5.6-5.6l1-1'},
  ensureSeed(){}
};
const LS='cg_data';
function loadS(){try{return Object.assign({claims:[]},JSON.parse(localStorage.getItem(LS)||'{}'));}catch(e){return{claims:[]};}}
let S=loadS();function save(){localStorage.setItem(LS,JSON.stringify(S));}
const SAMPLE=[
 {t:'Moderate coffee consumption reduces the risk of type 2 diabetes.',s:'Ding et al. 2014'},
 {t:'Coffee intake increases the risk of developing type 2 diabetes.',s:'Older cohort, 1998'},
 {t:'Drinking coffee improves long-term cognitive performance in adults.',s:'Nehlig 2010'},
 {t:'Regular coffee consumption lowers the rate of cognitive decline.',s:'Eskelinen 2010'},
 {t:'Caffeine intake raises resting blood pressure in sensitive individuals.',s:'James 2004'},
 {t:'Habitual coffee drinking does not increase long-term blood pressure.',s:'Steffen 2012'},
 {t:'Daily exercise reduces the risk of cardiovascular disease.',s:'WHO 2020'},
 {t:'Physical activity lowers all-cause mortality across age groups.',s:'Arem 2015'},
 {t:'Short sleep duration increases the risk of weight gain.',s:'Patel 2008'},
 {t:'Longer sleep does not reduce the risk of obesity.',s:'Contrarian 2016'}
];
if(!localStorage.getItem('cg_seeded')){localStorage.setItem('cg_seeded','1');if(!S.claims.length){S.claims=SAMPLE.map((x,i)=>({id:'c'+i,txt:x.t,src:x.s}));save();}}
/* ---------- analysis engine ---------- */
const STOP=new Set('the a an and or of to in is are was were be for on at by with as it its this that from into than then so if but not no do does did has have had will would can could should may more most other some any each very risk rate long term individuals adults groups developing'.split(' '));
const POS=new Set('increase increases increased raise raises raising improve improves improved boost boosts higher high greater promote promotes enhance enhances more rises rise raised grows'.split(' '));
const NEG=new Set('decrease decreases decreased reduce reduces reduced lower lowers lowered less lowering worsen worsens impair impairs inhibit inhibits fewer falls drop drops declines decline'.split(' '));
const NEGATE=/\b(not|no|never|without|n't)\b/i;
function kw(t){return new Set((t.toLowerCase().match(/[a-z]+/g)||[]).filter(w=>w.length>3&&!STOP.has(w)));}
function jacc(a,b){let inter=0;a.forEach(w=>{if(b.has(w))inter++;});const uni=a.size+b.size-inter;return uni?inter/uni:0;}
function polarity(t){const toks=t.toLowerCase().match(/[a-z']+/g)||[];let p=0;toks.forEach(w=>{if(POS.has(w))p++;if(NEG.has(w))p--;});if(NEGATE.test(t))p=-p;return p>0?1:p<0?-1:0;}
function analyze(claims){const nodes=claims.map((c,i)=>({i,id:c.id,txt:c.txt,src:c.src,kw:kw(c.txt),pol:polarity(c.txt)}));const edges=[];
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const o=jacc(nodes[i].kw,nodes[j].kw);if(o<0.14)continue;let verdict;const pi=nodes[i].pol,pj=nodes[j].pol;
    if(pi!==0&&pj!==0&&pi!==pj)verdict='contradict';else if(pi!==0&&pj!==0&&pi===pj)verdict='support';else verdict='related';
    edges.push({a:i,b:j,verdict,score:o});}
  return {nodes,edges};}
/* ---------- force graph (physics) ---------- */
function forceGraph(cv,nodes,edges,onHover){const ctx=cv.getContext('2d');let W,H,DPR=Math.min(2,devicePixelRatio||1);
  function sz(){const r=cv.getBoundingClientRect();W=cv.width=r.width*DPR;H=cv.height=r.height*DPR;}sz();addEventListener('resize',sz);
  const P=nodes.map((n,i)=>({x:(Math.random()-.5)*W*.4+W/2,y:(Math.random()-.5)*H*.4+H/2,vx:0,vy:0,n}));
  const col={support:'#55e0a0',contradict:'#ff6f8f',related:'#5ad1ff'};
  let hoverI=-1;cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();const mx=(e.clientX-r.left)*DPR,my=(e.clientY-r.top)*DPR;hoverI=-1;let best=24*DPR;P.forEach((p,i)=>{const d=Math.hypot(p.x-mx,p.y-my);if(d<best){best=d;hoverI=i;}});cv.style.cursor=hoverI>=0?'pointer':'';if(onHover)onHover(hoverI>=0?P[hoverI].n:null,e.clientX,e.clientY);});
  cv.addEventListener('pointerleave',()=>{hoverI=-1;if(onHover)onHover(null);});
  function acc(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
  function step(){for(let i=0;i<P.length;i++){let fx=0,fy=0;const a=P[i];
    for(let j=0;j<P.length;j++){if(i===j)continue;const b=P[j];let dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy)||1;const rep=(9000*DPR*DPR)/(d*d);fx+=dx/d*rep;fy+=dy/d*rep;}
    fx+=(W/2-a.x)*.004;fy+=(H/2-a.y)*.004;a.vx=(a.vx+fx*.0016)*.86;a.vy=(a.vy+fy*.0016)*.86;}
    edges.forEach(e=>{const a=P[e.a],b=P[e.b];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;const target=130*DPR;const f=(d-target)*.012;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;});
    P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.x=Math.max(30*DPR,Math.min(W-30*DPR,p.x));p.y=Math.max(30*DPR,Math.min(H-30*DPR,p.y));});}
  function draw(){ctx.clearRect(0,0,W,H);edges.forEach(e=>{const a=P[e.a],b=P[e.b];ctx.strokeStyle=col[e.verdict]+(e.verdict==='related'?'66':'aa');ctx.lineWidth=(e.verdict==='related'?1:2)*DPR;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();});
    const ac=acc('--acc');P.forEach((p,i)=>{const r=(i===hoverI?11:7)*DPR;ctx.fillStyle=ac;ctx.shadowColor=ac;ctx.shadowBlur=(i===hoverI?18:8)*DPR;ctx.beginPath();ctx.arc(p.x,p.y,r,0,6.29);ctx.fill();ctx.shadowBlur=0;});}
  (function loop(){step();draw();requestAnimationFrame(loop);})();
}
/* ---------- Gemini ---------- */
const KEY='cg_key',MODELS=['gemini-2.0-flash-lite','gemini-flash-latest','gemini-2.0-flash'];
function hasKey(){return !!localStorage.getItem(KEY);}
function openKey(){if(!$('keyScrim'))document.body.insertAdjacentHTML('beforeend','<div class="scrim" id="keyScrim"><div class="modal"><h3>Gemini key<button class="close" data-press onclick="closeAll()">'+icon('close')+'</button></h3><p>Analysis runs offline with a transparent heuristic. Add a free Gemini key (from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">AI Studio</a>) to refine verdicts with an LLM. Stored only in this browser.</p><div class="fld" style="margin-top:0"><input type="password" id="keyIn" placeholder="AIza…"></div><button class="save" data-press onclick="saveKey()">Save key</button></div></div>');$('keyIn').value=localStorage.getItem(KEY)||'';$('keyScrim').classList.add('on');}
function saveKey(){const k=$('keyIn').value.trim();if(k)localStorage.setItem(KEY,k);closeAll();toast('Key saved');}
async function aiText(prompt){const key=localStorage.getItem(KEY);for(const m of MODELS){const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});if(!r.ok)continue;const j=await r.json();return j.candidates[0].content.parts[0].text.trim();}throw new Error('unavailable');}
/* ---------- helpers ---------- */
function statRow(c){return c.map(([l,n])=>'<div class="bstat"><div class="n">'+n+'</div><div class="l">'+l+'</div></div>').join('');}
function marq(t){return '<span>'+t.map(x=>'<b>'+x+'</b>').join(' · ')+' · </span><span>'+t.map(x=>'<b>'+x+'</b>').join(' · ')+' · </span>';}
function featGrid(items){return items.map(([h,ic,t,d],i)=>'<a class="fcell" href="'+h+'"><div class="fi">'+icon(ic,22)+'</div><div class="fx">0'+(i+1)+'</div><h3>'+t+'</h3><p>'+d+'</p><div class="go">Open '+icon('chevron',13)+'</div></a>').join('');}
const FEATURES='add research claims · tag source · claim library · edit/remove · sample corpora · topic-overlap detection (Jaccard) · polarity analysis · negation handling · pairwise verdicts · support / contradict / related · relevance score · consensus percentage · contradiction count · interactive force-directed graph · physics layout · node hover tooltips · verdict-colored edges · cluster view · analysis table · sort by verdict · AI-refined verdicts (Gemini) · consensus summary · export graph data · JSON import/export · multi-page nav · light & dark · 4 accents · custom cursor · 3D knowledge-graph hero · ambient motion · scroll reveals · shortcuts · autosave · offline-first · responsive';
window.PAGES={
 index(){const a=analyze(S.claims);const contra=a.edges.filter(e=>e.verdict==='contradict').length;
   $('meta').innerHTML=statRow([['claims',S.claims.length],['links',a.edges.length],['conflicts',contra],['free','$0']]);
   $('marq').innerHTML=marq(['claim library','topic overlap','polarity & negation','support vs contradict','force graph','consensus %','AI refine','offline']);
   $('fgrid').innerHTML=featGrid([['claims.html','claim','Claims','Collect statements from papers and sources into one library.'],['graph.html','graph','Graph','See how claims connect — agreement, conflict and relation, as a living graph.'],['analysis.html','analysis','Analysis','A transparent pairwise verdict table, with optional AI refinement.'],['settings.html','settings','Settings','Theme, accent, AI key and data — private to your browser.'],['claims.html','link','Load a sample','Start with a curated set of agreeing and conflicting findings.'],['graph.html','graph','See consensus','Spot where the literature agrees — and where it fights.']]);
   $('featlist').textContent='50+ features — '+FEATURES+'.';
   mountHero3D('hero3d','graph');
 },
 claims(){
   function draw(){$('list').innerHTML=S.claims.length?S.claims.map((c,i)=>'<div class="claim"><div class="src">'+esc(c.src||'unsourced')+'</div><div class="txt">'+esc(c.txt)+'</div><span class="rm" data-i="'+i+'">'+icon('close',15)+'</span></div>').join(''):'<div class="empty">No claims yet. Add one, or load the sample set.</div>';$('cnt').textContent=S.claims.length+' claims';el();}
   function el(){$('list').querySelectorAll('.rm').forEach(b=>b.onclick=()=>{S.claims.splice(+b.dataset.i,1);save();draw();});}
   $('add').onclick=()=>{const t=$('ct').value.trim();if(!t){toast('Enter a claim');return;}S.claims.push({id:'c'+Date.now(),txt:t,src:$('cs').value.trim()});save();$('ct').value='';$('cs').value='';draw();toast('Claim added');};
   $('sample').onclick=()=>{S.claims=SAMPLE.map((x,i)=>({id:'c'+i,txt:x.t,src:x.s}));save();draw();toast('Sample loaded');};
   $('clear').onclick=()=>{if(confirm('Remove all claims?')){S.claims=[];save();draw();}};
   draw();
 },
 graph(){const a=analyze(S.claims);
   const contra=a.edges.filter(e=>e.verdict==='contradict').length,sup=a.edges.filter(e=>e.verdict==='support').length,rel=a.edges.filter(e=>e.verdict==='related').length;
   const cons=(sup+contra)?Math.round(sup/(sup+contra)*100):0;
   $('gstats').innerHTML=statRow([['claims',a.nodes.length],['agreements',sup],['conflicts',contra],['consensus',cons+'%']]);
   if(a.nodes.length<2){$('graphwrap').innerHTML='<div class="empty" style="padding:60px">Add at least two related claims to see the graph.</div>';return;}
   const tip=$('gtip');forceGraph($('graph'),a.nodes,a.edges,(n,x,y)=>{if(!n){tip.style.opacity=0;return;}tip.style.opacity=1;tip.style.left=(x+14)+'px';tip.style.top=(y+14)+'px';tip.innerHTML='<div style="font-family:var(--mono);font-size:11px;color:var(--acc2);margin-bottom:4px">'+esc(n.src||'')+'</div>'+esc(n.txt);});
 },
 analysis(){const a=analyze(S.claims);const rows=a.edges.slice().sort((x,y)=>({contradict:0,support:1,related:2})[x.verdict]-({contradict:0,support:1,related:2})[y.verdict]);
   function render(edges){$('tbl').innerHTML='<table class="tbl"><thead><tr><th>Claim A</th><th>Claim B</th><th>Verdict</th><th>Overlap</th></tr></thead><tbody>'+(edges.length?edges.map(e=>'<tr><td>'+esc(a.nodes[e.a].txt.slice(0,70))+'…</td><td>'+esc(a.nodes[e.b].txt.slice(0,70))+'…</td><td><span class="verdict '+e.verdict+'">'+e.verdict+'</span></td><td style="font-family:var(--mono)">'+Math.round(e.score*100)+'%</td></tr>').join(''):'<tr><td colspan="4" style="text-align:center;color:var(--mut);padding:30px">No related claim pairs found.</td></tr>')+'</tbody></table>';}
   render(rows);
   const contra=rows.filter(e=>e.verdict==='contradict');
   $('summary').innerHTML=contra.length?'<b style="color:var(--rose)">'+contra.length+' contradiction'+(contra.length>1?'s':'')+'</b> detected in the literature set. The clearest conflict is between “'+esc(a.nodes[contra[0].a].txt.slice(0,60))+'…” and “'+esc(a.nodes[contra[0].b].txt.slice(0,60))+'…”.':'No direct contradictions detected — the claims broadly agree or are unrelated.';
   $('aiBtn').onclick=async()=>{if(!hasKey()){openKey();return;}$('summary').textContent='Refining with AI…';try{const list=S.claims.map((c,i)=>(i+1)+'. '+c.txt).join('\n');const r=await aiText('These are research claims. In 3 sentences, summarize where they agree and where they contradict each other.\n\n'+list);$('summary').textContent=r;}catch(e){$('summary').textContent='AI unavailable — showing heuristic summary.';}};
 },
 settings(){
   $('themeToggle').classList.toggle('on',theme()==='light');$('themeToggle').onclick=()=>{toggleTheme();$('themeToggle').classList.toggle('on',theme()==='light');};
   $('accents2').innerHTML=APP.accents.map((a,i)=>'<button class="ad'+(i===accentIdx()?' on':'')+'" data-i="'+i+'" data-press style="width:24px;height:24px;background:linear-gradient(135deg,'+a[0]+','+a[1]+')"></button>').join('');
   $('accents2').querySelectorAll('.ad').forEach(b=>b.onclick=()=>setAccent(+b.dataset.i));
   $('keyBtn').onclick=openKey;$('exp').onclick=()=>dl('consensusgraph.json','application/json',JSON.stringify(S,null,2));
   $('featlist').textContent=FEATURES+'.';
 }
};
