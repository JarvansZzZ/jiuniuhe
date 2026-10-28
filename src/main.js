import { models, brands, formatPrice, dataNote } from './data.js';
import { initModals } from './modals.js';

const paths = {
 arrow: '<path d="M7 17 17 7M6 7h11v11"/>',
 arrowRight:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 chevron:'<path d="m8 5 7 7-7 7"/>',
 down:'<path d="m6 9 6 6 6-6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
 filter:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="currentColor"/><circle cx="15" cy="17" r="2" fill="currentColor"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 compare:'<rect x="3" y="5" width="7" height="15" rx="1.5"/><rect x="14" y="3" width="7" height="17" rx="1.5"/><path d="M6 10h1m10-2h1M6 14h1m10-2h1m0 4h1"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5z"/>',
 city:'<path d="M3 21V9h7v12m0-16h10v16M1 21h22M6 12h1m-1 4h1m7-7h2m-2 4h2m-2 4h2"/>',
 route:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8m8-4H9"/>',
 range:'<rect x="2" y="7" width="18" height="11" rx="2"/><path d="M23 10v5M6 10v5m4-5v5m4-5v5"/>',
 sparkle:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
 shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 bookmark:'<path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
const readStored = (key, fallback) => {try {const x = JSON.parse(localStorage.getItem(key));return Array.isArray(x) ? x.filter(id=>models.some(m=>m.id===id)) : fallback;} catch{return fallback;}};
const persist = (key, value) => {try {localStorage.setItem(key, JSON.stringify(value));} catch {/* In restricted storage contexts, the current session remains usable. */}};
const state = {brand:'all',category:'all',budget:'all',sort:'recommended',query:'',showAll:false,favorites:readStored('jnh-favorites',[]),compare:readStored('jnh-compare',[]).slice(0,3),favoritesOnly:false};
let toastTimer;
function notify(message) {
 const toast=document.getElementById('toast');
 toast.classList.remove('note-toast');
 toast.innerHTML=`${icon('check')}<span>${message}</span>`;
 toast.classList.add('visible');
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2800);
}
function toggleCompare(id){
 if(state.compare.includes(id)) state.compare=state.compare.filter(x=>x!==id);
 else if(state.compare.length<3) state.compare.push(id);
 else {notify('一次最多对比 3 款车型，请先移除一款');return;}
 persist('jnh-compare',state.compare);
 syncCompare();renderProducts();
}
const modal = initModals({onToggleCompare:toggleCompare,getCompareIds:()=>state.compare,notify,onRecommend:(id)=>{
 state.query=models.find(m=>m.id===id)?.name||'';state.brand='all';state.category='all';state.budget='all';state.showAll=true;state.favoritesOnly=false;
 syncFilters();renderProducts();document.getElementById('explore').scrollIntoView({behavior:'smooth'});
}});

const root=document.getElementById('root');
root.innerHTML=`
 <header class="site-header">
  <div class="header-inner">
   <a class="wordmark" href="#" aria-label="九牛核首页"><span class="logo-symbol"><i></i><i></i><i></i></span><span>九牛核<small>EV RIDERS CLUB</small></span><span class="logo-dot"></span></a>
   <nav class="main-nav" aria-label="主导航"><a href="#explore" class="active">车型探索</a><button data-action="compare">参数对比</button><a href="#guide">选车指南</a><a href="#journal">骑行灵感${icon('arrow')}</a></nav>
   <div class="header-actions"><button class="saved-button" data-action="favorites" aria-label="查看收藏车型">${icon('bookmark')}</button><button class="header-compare" data-action="compare">${icon('compare')}<span>我的对比</span><b id="compare-count">0</b></button><button class="mobile-menu" data-action="menu" aria-label="展开导航">${icon('menu')}</button></div>
  </div>
 </header>
 <main class="page-shell">
  <section class="hero" aria-labelledby="hero-title">
   <div class="hero-grain"></div><div class="hero-grid"></div>
   <div class="hero-copy"><span class="hero-eyebrow"><span></span>三大品牌 · 一站选车</span><h1 id="hero-title">选一台，<br>与自己<span class="hero-em">合拍。</span></h1><p>九号、极核、小牛，三种骑行态度。<br>把复杂参数，变成简单选择。</p><div class="hero-buttons"><a href="#explore" class="button button-lime">探索你的下一程 ${icon('arrow')}</a><button class="hero-quiz" data-action="quiz"><span class="quiz-orbit">${icon('sparkle')}</span>30 秒，帮我选车</button></div><div class="hero-metrics"><div><b>3<small>大</small></b><span>热门电摩品牌</span></div><div><b>6<small>款</small></b><span>精选人气车型</span></div><div><b>5<small>维</small></b><span>看懂核心差异</span></div></div></div>
   <div class="hero-art"><div class="hero-big-word">RIDE.</div><div class="hero-orbit"></div><div class="hero-platform"></div><img src="/images/hero-scooter.svg" alt="银黑色城市电动摩托车原创插画" class="hero-bike" fetchpriority="high"><div class="hero-caption"><span class="green-dot"></span>为城市而生<span class="caption-line"></span>BUILT FOR YOUR CITY</div><span class="hero-art-note">车型风格示意 / CONCEPT VISUAL</span><span class="hero-side-label">SMART. FAST. FREE.</span></div>
   <a class="hero-scroll" href="#explore" aria-label="向下探索">${icon('down')}</a>
  </section>
  <section class="brand-strip" aria-label="按品牌探索">
   ${brands.map((brand,i)=>`<button class="brand-item" data-brand="${brand.id}"><span class="brand-mark ${brand.id}">${brand.id==='ninebot'?'<span class="ninebot-orbit">9</span>ninebot':brand.id==='niu'?'<span class="niu-mark">N</span>NIU':'ZEEHO'}</span><span class="brand-caption"><b>${brand.name}</b><span>${brand.line}</span></span>${icon('arrow')}</button>`).join('')}
  </section>
  <section id="explore" class="explore-section">
   <div class="section-heading"><div><span class="section-kicker"><i></i>FIND YOUR RIDE</span><h2>好骑，也要<span>合你心意。</span></h2></div><p>从第一台，到下一台。<br>找到属于你的城市答案。</p></div>
   <div class="filter-toolbar"><div class="category-tabs" role="group" aria-label="按骑行场景筛选"><button class="selected" data-category="all">${icon('compass')}全部车型</button><button data-category="commute">${icon('city')}城市通勤</button><button data-category="sport">${icon('bolt')}性能玩家</button><button data-category="range">${icon('route')}长续航</button></div><div class="filter-tools"><label class="search-field">${icon('search')}<input id="model-search" placeholder="搜索心仪车型" aria-label="搜索品牌或车型" autocomplete="off"><button data-action="clear-search" aria-label="清空搜索" hidden>${icon('close')}</button></label><button class="filter-toggle" data-action="filter" aria-expanded="false">${icon('filter')}<span>筛选</span><i id="filter-dot" hidden></i></button></div></div>
   <div id="filter-panel" class="filter-panel" hidden><div><span>品牌</span><div class="filter-options">${[{id:'all',name:'全部品牌'},...brands].map(b=>`<button data-filter-brand="${b.id}" class="${b.id==='all'?'selected':''}">${b.name}</button>`).join('')}</div></div><div><span>参考预算</span><div class="filter-options"><button data-budget="all" class="selected">不限</button><button data-budget="15000">1.5 万元以内</button><button data-budget="20000">1.5–2 万元</button><button data-budget="high">2 万元以上</button></div></div><button class="reset-filter" data-action="reset">重置筛选 ${icon('arrowRight')}</button></div>
   <div class="results-toolbar"><span id="results-count">精选 <b>6</b> 款车型，让每次选择都有据可依</span><div><span class="reference-note">${icon('info')}参数为展示参考</span><label class="sort-control"><select id="sort-select" aria-label="车型排序"><option value="recommended">综合推荐</option><option value="price-asc">价格从低到高</option><option value="price-desc">价格从高到低</option><option value="range">续航优先</option><option value="speed">性能优先</option></select>${icon('down')}</label></div></div>
   <div id="product-grid" class="product-grid"></div><div id="show-more-wrap" class="show-more-wrap"><button class="button button-outline" data-action="show-more">探索全部 6 款车型 ${icon('arrowRight')}</button><span>不同的选择，同样热爱出发。</span></div>
  </section>
  <section class="quick-comparison" id="compare-guide"><div class="comparison-heading"><span class="section-kicker"><i></i>THREE BRANDS. YOUR CHOICE.</span><div><h2>各有所长，<span>一眼看懂。</span></h2><button data-action="compare-all" class="text-link">开启三车详细对比 ${icon('arrow')}</button></div></div><div class="brand-strengths">${[
   {name:'九号',en:'SMARTER EVERY DAY',text:'让科技，照顾每一个日常。',icon:'sparkle',trait:'智能体验',pct:96,second:'科技与性能的均衡派',brand:'ninebot'},
   {name:'极核',en:'BORN TO PERFORM',text:'给每一段路，多一点心跳。',icon:'bolt',trait:'运动操控',pct:96,second:'热爱驾驶的行动派',brand:'zeeho'},
   {name:'小牛',en:'MAKE CITY YOURS',text:'把熟悉的城市，骑出新鲜感。',icon:'city',trait:'都市出行',pct:94,second:'日常里的风格派',brand:'niu'}
  ].map((b,i)=>`<article class="strength-card"><span class="strength-number">0${i+1}</span><div class="strength-icon">${icon(b.icon)}</div><div class="strength-title"><h3>${b.name}</h3><span>${b.en}</span></div><p>${b.text}</p><div class="strength-bar"><span>${b.trait}</span><div><i style="width:${b.pct}%"></i></div><b>优势项</b></div><span class="strength-foot">${b.second}</span></article>`).join('')}</div><p class="strength-note">基于品牌产品定位的编辑观点，仅供选车思路参考。</p></section>
  <section class="quiz-banner" id="guide"><div class="quiz-decor"><span></span><span></span>${icon('route')}</div><div><span class="section-kicker">YOUR LIFE. YOUR RIDE.</span><h2>参数很多，<br class="mobile-break">适合你的答案只有一个。</h2><p>告诉我们你的预算与骑行习惯，30 秒找到合拍的那台。</p></div><button class="button button-dark" data-action="quiz">帮我选一台 ${icon('arrow')}</button><span class="quiz-banner-count">01 — 03</span></section>
  <section class="journal-section" id="journal"><div class="section-heading"><div><span class="section-kicker"><i></i>BEYOND THE RIDE</span><h2>出发之前，<span>多懂一点。</span></h2></div><span class="journal-heading-note">一份给城市骑士的轻量指南</span></div><div class="journal-grid"><button class="journal-card" data-article="beginner"><div class="journal-art art-beginner"><span class="art-large-number">01</span><div class="route-map"><span></span><span></span><span></span>${icon('compass')}</div><b>THE FIRST RIDE</b><span class="journal-art-tag">新手入门</span></div><div class="journal-body"><span>选车指南 · 5 分钟阅读</span><h3>第一台电摩，先想清楚这 5 件事 ${icon('arrow')}</h3><p>从驾照、路权到充电，把热爱落到日常。</p></div></button><button class="journal-card" data-article="range"><div class="journal-art art-range"><span class="art-large-number">02</span><div class="battery-graphic"><i></i><i></i><i></i><span></span></div><b>GO A LITTLE FURTHER</b><span class="journal-art-tag">续航研究所</span></div><div class="journal-body"><span>实用干货 · 4 分钟阅读</span><h3>标称续航，为什么和实际不一样？ ${icon('arrow')}</h3><p>看懂影响续航的变量，少一点里程焦虑。</p></div></button><button class="journal-card" data-article="safety"><div class="journal-art art-safety"><span class="art-large-number">03</span><div class="shield-graphic">${icon('shield')}</div><b>RIDE WELL. RIDE SAFE.</b><span class="journal-art-tag">安心骑行</span></div><div class="journal-body"><span>骑行常识 · 3 分钟阅读</span><h3>骑得尽兴，也要每次平安到达 ${icon('arrow')}</h3><p>装备、刹车与骑行习惯，都值得认真对待。</p></div></button></div></section>
 </main>
 <footer class="site-footer"><div class="footer-top"><a class="wordmark" href="#"><span class="logo-symbol"><i></i><i></i><i></i></span><span>九牛核<small>EV RIDERS CLUB</small></span></a><p>让选车简单一点，<br>让每次出发都值得期待。</p><a href="#explore" class="back-top">回到车型探索 ${icon('arrow')}</a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} 九牛核 · 热爱每一程</span><span>独立选车概念网站 · 与所涉品牌无隶属关系</span><button data-action="data-note">数据与素材说明 ${icon('info')}</button></div></footer>
 <div id="compare-dock" class="compare-dock" hidden></div><div id="toast" class="toast" role="status" aria-live="polite"></div>
`;

function productCard(model){
 const selected=state.compare.includes(model.id), favorite=state.favorites.includes(model.id);
 return `<article class="product-card ${selected?'in-compare':''}" data-model="${model.id}"><div class="product-visual ${model.brand}"><span class="product-badge"><i></i>${model.badge}</span><button class="favorite-button ${favorite?'favorited':''}" data-favorite="${model.id}" aria-label="${favorite?'取消收藏':'收藏'} ${model.brandName} ${model.name}" aria-pressed="${favorite}">${icon('heart')}</button><button class="bike-image-button" data-detail="${model.id}" aria-label="了解 ${model.brandName} ${model.name}"><span class="product-backdrop-word">${model.brand==='ninebot'?'NINEBOT':model.brand==='zeeho'?'ZEEHO':'NIU.'}</span><img src="${model.image}" alt="${model.brandName}电摩风格原创示意图" loading="lazy"></button><div class="visual-bottom"><span>${model.brand==='ninebot'?'ninebot':model.brand==='zeeho'?'ZEEHO':'NIU'}<small>${model.year}</small></span><span class="color-dots"><i style="background:${model.color}"></i><i></i><i></i></span></div></div><div class="product-content"><div class="product-name-row"><div><span class="product-brand-name">${model.brandName} ${model.brand==='ninebot'?'NINEBOT':model.brand==='zeeho'?'ZEEHO':'NIU'}</span><h3>${model.name}</h3></div><div class="product-price"><span>展示参考价</span><strong><small>¥</small>${formatPrice(model.price)}</strong></div></div><p class="product-subtitle">${model.subtitle}</p><div class="product-specs"><div><span>${icon('bolt')}最高车速</span><b>${model.speed}<small>km/h</small></b></div><div><span>${icon('range')}参考续航</span><b>${model.range}<small>km</small></b></div><div><span>${icon('compass')}峰值功率</span><b>${model.power}<small>kW</small></b></div></div><div class="product-tags">${model.tags.map(tag=>`<span>${tag}</span>`).join('')}</div><div class="product-card-actions"><button class="add-compare ${selected?'selected':''}" data-compare="${model.id}" aria-pressed="${selected}">${icon(selected?'check':'plus')}${selected?'已加入对比':'加入对比'}</button><button class="detail-link" data-detail="${model.id}">了解车型 ${icon('arrowRight')}</button></div></div></article>`;
}
function renderProducts(){
 let filtered=models.filter(m=>(state.brand==='all'||m.brand===state.brand)&&(state.category==='all'||m.categories.includes(state.category))&&(!state.favoritesOnly||state.favorites.includes(m.id))&&(!state.query||(m.brandName+' '+m.brand+' '+m.name+' '+m.tags.join(' ')).toLowerCase().includes(state.query.toLowerCase()))&&(state.budget==='all'||(state.budget==='15000'?m.price<=15000:state.budget==='20000'?m.price>15000&&m.price<=20000:m.price>20000)));
 if(state.sort==='price-asc')filtered.sort((a,b)=>a.price-b.price);else if(state.sort==='price-desc')filtered.sort((a,b)=>b.price-a.price);else if(state.sort==='range')filtered.sort((a,b)=>b.range-a.range);else if(state.sort==='speed')filtered.sort((a,b)=>b.speed-a.speed);
 const isFiltered=state.brand!=='all'||state.category!=='all'||state.budget!=='all'||!!state.query||state.favoritesOnly||state.sort!=='recommended';
 const displayed=state.showAll||isFiltered?filtered:filtered.slice(0,3);
 document.getElementById('product-grid').innerHTML=displayed.length?displayed.map(productCard).join(''):`<div class="empty-state">${icon(state.favoritesOnly?'heart':'search')}<h3>${state.favoritesOnly?'还没有收藏的车型':'暂时没有匹配的车型'}</h3><p>${state.favoritesOnly?'点击车型右上角的爱心，把心仪的车放在一起。':'试试其他品牌、预算，或换一个搜索关键词。'}</p><button class="button button-dark" data-action="reset">浏览全部车型 ${icon('arrowRight')}</button></div>`;
 document.getElementById('results-count').innerHTML=state.favoritesOnly?`我的收藏 <b>${filtered.length}</b> 款，喜欢的都在这里`:`精选 <b>${filtered.length}</b> 款车型，让每次选择都有据可依`;
 document.getElementById('show-more-wrap').hidden=state.showAll||isFiltered||filtered.length<=3;
 document.querySelector('[data-action="clear-search"]').hidden=!state.query;
 document.getElementById('filter-dot').hidden=state.brand==='all'&&state.budget==='all';
}
function syncFilters(){
 document.querySelectorAll('[data-category]').forEach(btn=>{const active=btn.dataset.category===state.category;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',active);});
 document.querySelectorAll('[data-filter-brand]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.filterBrand===state.brand));
 document.querySelectorAll('[data-budget]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.budget===state.budget));
 document.querySelectorAll('.brand-item').forEach(btn=>btn.classList.toggle('active',btn.dataset.brand===state.brand));
 document.getElementById('model-search').value=state.query;
 document.getElementById('sort-select').value=state.sort;
 document.querySelector('.saved-button').classList.toggle('active',state.favoritesOnly);
}
function syncCompare(){
 document.getElementById('compare-count').textContent=state.compare.length;
 const dock=document.getElementById('compare-dock');dock.hidden=state.compare.length===0;
 dock.innerHTML=`<div class="dock-label">${icon('compare')}<span>对比车库<small>最多加入 3 款车型</small></span></div><div class="dock-models">${state.compare.map(id=>{const m=models.find(m=>m.id===id);return `<div class="dock-model"><img src="${m.image}" alt=""><span>${m.brandName}<b>${m.name}</b></span><button data-compare="${id}" aria-label="移除 ${m.name}">${icon('close')}</button></div>`;}).join('')}${Array.from({length:3-state.compare.length},()=>`<button class="dock-empty" data-action="explore">${icon('plus')}<span>添加车型</span></button>`).join('')}</div><button class="button button-lime" data-action="compare">开始对比 (${state.compare.length}) ${icon('arrowRight')}</button><button class="dock-clear" data-action="clear-compare" aria-label="清空对比">${icon('close')}</button>`;
 document.body.classList.toggle('has-dock',state.compare.length>0);
}
root.addEventListener('click',event=>{
 const btn=event.target.closest('button,[data-brand]');if(!btn)return;
 if(btn.dataset.compare){toggleCompare(btn.dataset.compare);return;}
 if(btn.dataset.favorite){const id=btn.dataset.favorite;const had=state.favorites.includes(id);state.favorites=had?state.favorites.filter(x=>x!==id):[...state.favorites,id];persist('jnh-favorites',state.favorites);renderProducts();notify(had?'已从收藏中移除':'已收藏，点击右上角书签随时查看');return;}
 if(btn.dataset.detail){modal.openDetails(btn.dataset.detail);return;}
 if(btn.dataset.article){modal.openArticle(btn.dataset.article);return;}
 if(btn.dataset.brand){state.brand=state.brand===btn.dataset.brand?'all':btn.dataset.brand;state.favoritesOnly=false;syncFilters();renderProducts();document.getElementById('explore').scrollIntoView({behavior:'smooth'});return;}
 if(btn.dataset.category){state.category=btn.dataset.category;state.favoritesOnly=false;syncFilters();renderProducts();return;}
 if(btn.dataset.filterBrand){state.brand=btn.dataset.filterBrand;syncFilters();renderProducts();return;}
 if(btn.dataset.budget){state.budget=btn.dataset.budget;syncFilters();renderProducts();return;}
 switch(btn.dataset.action){
 case 'compare':modal.openCompare();break;
 case 'quiz':modal.openQuiz();break;
 case 'compare-all':state.compare=['e300p','ae8s','nqigts'];persist('jnh-compare',state.compare);syncCompare();renderProducts();modal.openCompare();break;
 case 'filter':{const panel=document.getElementById('filter-panel');panel.hidden=!panel.hidden;btn.setAttribute('aria-expanded',!panel.hidden);btn.classList.toggle('active',!panel.hidden);break;}
 case 'reset':state.brand='all';state.category='all';state.budget='all';state.query='';state.sort='recommended';state.favoritesOnly=false;state.showAll=false;syncFilters();renderProducts();break;
 case 'show-more':state.showAll=true;renderProducts();break;
 case 'clear-search':state.query='';syncFilters();renderProducts();document.getElementById('model-search').focus();break;
 case 'favorites':state.favoritesOnly=!state.favoritesOnly;state.brand='all';state.category='all';state.budget='all';state.query='';syncFilters();renderProducts();document.getElementById('explore').scrollIntoView({behavior:'smooth'});break;
 case 'menu':{const nav=document.querySelector('.main-nav');const open=nav.classList.toggle('menu-open');btn.setAttribute('aria-expanded',open);break;}
 case 'clear-compare':state.compare=[];persist('jnh-compare',[]);syncCompare();renderProducts();break;
 case 'explore':document.getElementById('explore').scrollIntoView({behavior:'smooth'});break;
 case 'data-note':modal.openArticle('data');break;
 }
});
document.getElementById('model-search').addEventListener('input',event=>{state.query=event.target.value;renderProducts();});
document.getElementById('sort-select').addEventListener('change',event=>{state.sort=event.target.value;renderProducts();});
document.querySelectorAll('.main-nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.main-nav').classList.remove('menu-open')));
const observeSections=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.main-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}});},{rootMargin:'-15% 0px -65% 0px'});
['explore','guide','journal'].forEach(id=>observeSections.observe(document.getElementById(id)));
renderProducts();syncCompare();syncFilters();
