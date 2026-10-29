// ==== FIELD MAPPING: edit this one function if the data schema changes ====
const LAUNCHPAD_DEFAULT = [/floatlaunch\.xyz/i, /(x|twitter)\.com\/floatdotxyz/i];
function normaliseToken(raw) {
  const l = raw.links || {};
  return {
    contractAddress: raw.ca || raw.contractAddress || '',
    ticker: (raw.ticker || '').replace(/^\$/, ''),
    name: raw.name || '',
    image: raw.image || '',
    description: (raw.description || '').trim(),
    aiPitch: (raw.ai_pitch || '').trim(),
    tags: raw.tags || [],
    launchpad: raw.launchpad || '',
    marketCap: raw.market_cap_usd, holders: raw.holders,
    createdTs: raw.created_ts, checkedAt: raw.checked_at,
    flags: raw.flags || {},
    socials: { website: l.website, x: l.x, telegram: l.telegram, other: l.other || [],
               gmgn: (raw.links_external || {}).gmgn },
  };
}
// ==========================================================================

function onYes(token) { console.log('YES', token); toast('Saved (coming soon)'); }

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let tokens = [], idx = 0, busy = false;

function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),1500);}
const fmtUsd=v=>v==null?'–':'$'+(v>=1e6?(v/1e6).toFixed(2)+'M':v>=1e3?(v/1e3).toFixed(1)+'K':Math.round(v));
function age(ts){if(!ts)return'–';const s=Date.now()/1000-ts;return s<3600?Math.max(1,Math.round(s/60))+'m':s<86400?Math.round(s/3600)+'h':Math.round(s/86400)+'d';}
const isDefault=u=>LAUNCHPAD_DEFAULT.some(r=>r.test(u||''));

function imgFallback(img, ticker){
  const tries=[]; const m=img.src.match(/\/ipfs\/(.+)$/);
  if(m) tries.push('https://dweb.link/ipfs/'+m[1],'https://cf-ipfs.com/ipfs/'+m[1]);
  tries.push('https://placehold.co/400x400/1c2130/7c5cff?text=%24'+encodeURIComponent(ticker||'?'));
  img.onerror=()=>{const n=tries.shift(); if(n) img.src=n; else img.onerror=null;};
}

function pill(label,url){ if(!url) return ''; const d=isDefault(url);
  return `<a class="pill${d?' def':''}" href="${esc(url)}" target="_blank" rel="noopener">${label}${d?' <small>(launchpad default)</small>':''}</a>`; }

function render(){
  const deck=$('#deck'); deck.innerHTML='';
  $('#done').hidden = idx < tokens.length;
  $('#counter').textContent = tokens.length ? `${Math.min(idx+1,tokens.length)} / ${tokens.length}` : '';
  if(idx>=tokens.length) return;
  const t=tokens[idx], s=t.socials, f=t.flags, ca=t.contractAddress;
  const text = t.description ? `<div class="desc">${esc(t.description)}</div>` : '';
  const ai = t.aiPitch ? `<div class="ai"><div class="lbl">AI SUMMARY</div><div class="desc">${esc(t.aiPitch)}</div></div>` : '';
  const c=document.createElement('div'); c.className='card';
  c.innerHTML=`<img class="img" alt="${esc(t.ticker)}" src="${esc(t.image)}">
  <div class="body"><div class="tk">$${esc(t.ticker)}${t.launchpad?`<span class="lp">${esc(t.launchpad)}</span>`:''}</div><div class="nm">${esc(t.name)}</div>
  <div class="stats"><div class="stat"><b>${fmtUsd(t.marketCap)}</b><small>MCAP</small></div><div class="stat"><b>${t.holders??'–'}</b><small>HOLDERS</small></div>
  <div class="stat"><b>${age(t.createdTs)}</b><small>AGE</small></div><div class="stat"><b>${age(t.checkedAt)}</b><small>CHECKED</small></div></div>
  <div class="flags"><span>🟢 ${f.green??0}</span><span>🟡 ${f.yellow??0}</span><span>🔴 ${f.red??0}</span></div>
  ${text}${ai}${!text&&!ai?'<div class="muted">No description provided.</div>':''}
  ${t.tags.length?`<div class="tags">${t.tags.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}
  <div class="links">${pill('𝕏 X',s.x)}${pill('✈️ Telegram',s.telegram)}${pill('🌐 Website',s.website)}${s.other.map(u=>pill('🔗 Link',u)).join('')}${pill('📈 GMGN',s.gmgn)}</div>
  ${ca?`<div class="ca"><span>${esc(ca.slice(0,6)+'…'+ca.slice(-6))}</span><button>Copy CA</button></div>`:''}</div>`;
  deck.appendChild(c); imgFallback(c.querySelector('img'), t.ticker);
  const b=c.querySelector('.ca button'); if(b) b.onclick=e=>{e.stopPropagation();copy(ca);};
  drag(c);
}
async function copy(v){try{await navigator.clipboard.writeText(v);}catch{const a=document.createElement('textarea');a.value=v;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();}toast('Contract copied');}

function decide(yes){ if(busy||idx>=tokens.length) return; busy=true;
  if(yes) onYes(tokens[idx]);
  const c=$('.card'); c.style.transform=`translateX(${yes?150:-150}%) rotate(${yes?20:-20}deg)`; c.style.opacity=0;
  setTimeout(()=>{idx++;busy=false;render();},300);
}
function drag(c){ let x0=null,dx=0;
  c.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;x0=e.clientX;dx=0;c.classList.add('drag');c.setPointerCapture(e.pointerId);});
  c.addEventListener('pointermove',e=>{if(x0==null)return;dx=e.clientX-x0;c.style.transform=`translateX(${dx}px) rotate(${dx/20}deg)`;});
  const end=()=>{if(x0==null)return;x0=null;c.classList.remove('drag');if(Math.abs(dx)>100)decide(dx>0);else c.style.transform='';};
  c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
}
$('#no').onclick=()=>decide(false); $('#yes').onclick=()=>decide(true);
$('#restart').onclick=()=>{idx=0;render();};
document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')decide(false);if(e.key==='ArrowRight')decide(true);});
fetch('data/tokens.json').then(r=>r.json()).then(d=>{tokens=(Array.isArray(d)?d:d.tokens||[]).map(normaliseToken);render();})
  .catch(e=>{$('#deck').innerHTML='<p class="muted" style="padding:20px">Failed to load data/tokens.json</p>';console.error(e);});
