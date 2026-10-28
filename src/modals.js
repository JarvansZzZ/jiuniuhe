import { models, formatPrice, dataNote } from './data.js';

const arrow = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const check = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const closeIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';
const lightning = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 10-13h-8z"/></svg>';

const articles = {
  data: { category:'关于本网站 · 内容说明', title:'让选择透明，让出发简单。', intro:dataNote, sections:[
    ['一份可以体验的选车概念','九牛核是围绕九号、极核、小牛三个品牌制作的独立交互概念。页面提供车型探索、筛选、收藏、参数对比与偏好推荐，与所涉品牌无隶属关系。'],
    ['怎样理解页面中的数字','本次制作未完成官网实时核验。展示价格、车速、续航、功率、电池与其他配置均用于演示对比功能，不应作为购车依据，也不表示当前在售版本的官方规格。不同版本和地区的价格、配置及准入要求可能不同。'],
    ['原创整车视觉','页面整车图片由原创矢量插画组成，仅表达黑色科技、银色运动与暖白都市三种设计风格，不是对应车型的官方产品图片。'],
    ['推荐与记录','选车推荐在本地按照示例预算、场景与配置偏好计算。收藏和对比记录保存在当前浏览器中；不需要登录，也不会上传个人信息。实际选择请结合当地法规、可靠配置资料和到店试骑。']
  ]},
  beginner: { category:'选车入门 · 约 3 分钟', title:'第一次买电摩，先问自己这 5 个问题。', intro:'比起先记住一串参数，更值得先想清楚的，是这台车会怎样进入你的生活。', sections:[
    ['01 / 你每天真正骑多远？','记录一周实际通勤距离，再加上买菜、接人和偶尔绕路的余量。别只按最长的一次出行选车；先满足高频使用，再考虑偶尔发生的需求。'],
    ['02 / 你准备在哪里充电？','购买前确认小区、车库或工作地点的合规充电条件。可提取电池也有重量差异，试着搬一次，比只看宣传页更有帮助。不要把电池带入住宅、电梯或疏散通道充电。'],
    ['03 / 它适合你的身体吗？','到店坐上车，看看双脚能否稳定触地，推行和停车是否轻松。车重、座高、后视镜视野和刹车手感，都会影响每天的使用感受。'],
    ['04 / 当地允许怎样骑？','电动摩托车与电动自行车的登记、驾驶资格、保险及通行要求不同。确认车辆公告类别，并向当地交管部门核实上牌、准驾与限行规则。'],
    ['05 / 预算有没有算完整？','除了购车款，也要计入头盔、防护、登记、保险、停车和日常保养。最后，带着自己的真实路线和需求去试骑，再做决定。']
  ]},
  range: { category:'用车知识 · 约 2 分钟', title:'续航数字，怎么翻译成你的日常？', intro:'同样一台车，冬天和夏天、独骑和载人、拥堵和匀速，骑出来的里程可能很不一样。', sections:[
    ['先看测试条件，再看里程','页面上的续航常有特定的速度、载重和温度前提。不同品牌测试口径不一定相同，因此不宜只按一个最大数字排名。询问经销商测试工况，并寻找接近自己路线的使用记录。'],
    ['给真实生活留一点余量','先用“每天往返距离 × 两次充电间的天数”估算需求，再为天气、绕路、老化和临时出行留出余量。续航规划的目标是从容使用，而不是把每次电量都用到最后。'],
    ['稳定骑行，也是一种节能','平顺加速、提前观察路况、保持合理胎压，都能改善能耗与舒适性。充电和存放应遵循车辆、电池及充电器的使用说明，避免擅自改装电池或电路。'],
    ['把“补能”也纳入比较','电池能否提取、提取后多重、附近是否有合规充电点、厂家建议充电时间是多少，往往比额外几十公里的标称里程更影响日常体验。']
  ]},
  safety: { category:'骑行指南 · 约 3 分钟', title:'每一次出发，都值得认真准备。', intro:'好看的装备可以表达风格，合适的防护才能陪你安心回家。', sections:[
    ['戴好头盔，从扣紧开始','根据实际用途选择符合现行标准、尺寸合适的头盔，并正确扣紧系带。护目镜、手套、能覆盖脚踝的鞋和适当防护衣物，也值得纳入日常装备。'],
    ['出门前，花一分钟看一眼','观察轮胎是否异常、灯光及转向灯是否正常，检查制动手感和后视镜位置。出现异响、漏液或制动异常时，先检修再上路。'],
    ['把视线放远，把车距留足','提前观察路口、车辆盲区与行人动向，在雨天和湿滑路面降低速度、增加距离。任何辅助功能都无法代替你的判断，也无法改变轮胎的物理极限。'],
    ['熟悉车辆，循序渐进','首次骑行前阅读说明书，在合法且安全的场地熟悉起步、转弯和制动。遵守当地通行规定，不超速、不酒驾，不在公共道路进行性能测试。'],
    ['停车和充电，同样需要安全','使用匹配的原装或合规充电设备，在允许的地点充电，避开易燃物和疏散通道。定期检查线缆与插头；异常发热、破损或异味应立即停止使用并联系专业人员。']
  ]}
};

export function initModals({onToggleCompare, onRecommend, getCompareIds, notify = () => {}}) {
  const root = document.createElement('div');
  root.className = 'modal-root';
  root.hidden = true;
  document.body.appendChild(root);
  let previousFocus;
  let previousFocusSelector = '';
  let activeView = '';
  let detailsId = null;
  let detailsTab = 'overview';
  let differencesOnly = false;
  let quizStep = 0;
  let answers = {};
  let ranked = [];
  let originalOverflow = '';

  const close = () => {
    if (root.hidden) return;
    root.hidden = true;
    root.innerHTML = '';
    document.body.style.overflow = originalOverflow;
    activeView = '';
    const focusTarget = previousFocus?.isConnected ? previousFocus : (previousFocusSelector ? document.querySelector(previousFocusSelector) : null);
    (focusTarget || document.querySelector('.header-compare'))?.focus({preventScroll:true});
  };
  const shell = (content, className = '') => {
    const wasHidden = root.hidden;
    const focused = document.activeElement;
    const actionData = !wasHidden && focused?.dataset?.modalAction ? { ...focused.dataset } : null;
    if (wasHidden) {
      previousFocus = focused;
      previousFocusSelector = '';
      if (focused?.id) previousFocusSelector = `#${CSS.escape(focused.id)}`;
      else if (focused?.dataset) {
        const key = ['detail','article','action','brand','favorite','compare'].find(key => focused.dataset[key]);
        if (key) previousFocusSelector = `[data-${key}="${CSS.escape(focused.dataset[key])}"]`;
      }
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    root.hidden = false;
    root.innerHTML = `<section class="modal-panel ${className}" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><button class="modal-close" data-modal-action="close" aria-label="关闭弹窗">${closeIcon}</button>${content}</section>`;
    let focusTarget;
    if (actionData) {
      focusTarget = [...root.querySelectorAll('[data-modal-action]')].find(element => !element.disabled && Object.entries(actionData).every(([key,value]) => element.dataset[key] === value));
    }
    (focusTarget || root.querySelector('.modal-panel')).focus({preventScroll:true});
  };
  const footerNote = () => `<p class="modal-note"><span>i</span>${dataNote}</p>`;
  const selectedModels = () => getCompareIds().map(id => models.find(m => m.id === id)).filter(Boolean);

  function renderCompare() {
    activeView = 'compare';
    const selected = selectedModels();
    const rows = [
      ['price','参考价格',m => `¥ ${formatPrice(m.price)}`],
      ['speed','最高车速',m => `${m.speed} km/h`],
      ['range','参考续航',m => `${m.range} km`],
      ['power','电机峰值功率',m => `${m.power} kW`],
      ['battery','电池配置',m => m.battery],
      ['charge','充电时间',m => m.charge],
      ['brake','制动系统',m => m.brake],
      ['weight','整备质量',m => m.weight],
      ['seat','座高',m => m.seat],
      ['description','更适合谁',m => m.description]
    ].filter(([key]) => !differencesOnly || selected.length < 2 || new Set(selected.map(m=>m[key])).size > 1);
    shell(`<div class="modal-eyebrow">SIDE BY SIDE</div><div class="modal-title-row"><div><h2 id="modal-title">好车，经得起比较。</h2><p class="modal-subtitle">把关注的配置放在一起，选出更合拍的一台。</p></div><span class="modal-count">${selected.length} / 3 台车型</span></div>
    ${selected.length ? `<div class="compare-control"><label class="modal-switch"><input type="checkbox" data-modal-action="diff" ${differencesOnly?'checked':''}><span class="modal-switch-track"></span>只看不同项</label><span>展示参考参数</span></div><div class="compare-table-wrap"><table class="modal-compare-table"><thead><tr><th scope="col">核心维度</th>${selected.map(m=>`<th scope="col"><div class="compare-model"><button data-modal-action="remove-compare" data-id="${m.id}" aria-label="移除${m.brandName}${m.name}" class="compare-remove">${closeIcon}</button><img src="${m.image}" alt="${m.brandName} ${m.name} 原创示意插画"><small>${m.brandName}</small><strong>${m.name}</strong></div></th>`).join('')}</tr></thead><tbody>${rows.map(([key,label,format])=>`<tr><th scope="row">${label}</th>${selected.map(m=>`<td class="${['speed','range','power'].includes(key)&&selected.length>1&&m[key]===Math.max(...selected.map(x=>x[key]))?'compare-best':''} ${key==='description'?'compare-description':''}">${format(m)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${selected.length<3?'<button class="modal-text-btn" data-modal-action="back-explore">＋ 继续添加车型，最多可对比 3 台</button>':''}` : `<div class="compare-empty"><div class="compare-empty-icon">${lightning}</div><h3>你的对比车库，等着第一台车。</h3><p>在车型卡片上点击「加入对比」，或先看看三大品牌的热门选择。</p><button class="modal-primary" data-modal-action="add-trio">加入三款热门车型 ${arrow}</button></div>`}
    ${footerNote()}`, 'modal-wide');
  }

  const questions = [
    {title:'先聊聊，你的购车预算？',subtitle:'选一个舒适的范围，把选择缩小一点。',key:'budget',choices:[
      {value:'15000',title:'1.5 万元以内',detail:'实用优先，轻松入手',icon:'01'},
      {value:'22000',title:'1.5 — 2.2 万元',detail:'配置与体验，都想要',icon:'02'},
      {value:'99999',title:'2.2 万元以上',detail:'为喜欢，留足空间',icon:'03'}]},
    {title:'你最常骑向哪里？',subtitle:'为每天的真实生活，找到更合拍的搭档。',key:'scene',choices:[
      {value:'commute',title:'城市通勤',detail:'穿梭日常，好骑更重要',icon:'↗'},
      {value:'sport',title:'享受骑行',detail:'周末出发，喜欢操控感',icon:'ϟ'},
      {value:'range',title:'走得更远',detail:'减少充电，多一点自由',icon:'∞'}]},
    {title:'最后，你更看重哪一点？',subtitle:'没有统一的最好，只有你的偏爱。',key:'priority',choices:[
      {value:'smart',title:'聪明好用',detail:'解锁、互联，让日常更方便',icon:'⌁'},
      {value:'performance',title:'动力与操控',detail:'出发时，更有底气',icon:'↝'},
      {value:'value',title:'轻松与实用',detail:'把预算花在真实需求上',icon:'◎'}]}
  ];
  function calculateRecommendations() {
    const budget = Number(answers.budget);
    const minimum = budget === 22000 ? 15000 : budget > 22000 ? 22000 : 0;
    let eligible = models.filter(m => m.price > minimum && m.price <= budget);
    if (!eligible.length) eligible = [...models];
    return eligible.map(m=>{
      let score = m.categories.includes(answers.scene)?28:0;
      if (answers.priority==='smart') score+=m.score[2]*0.4;
      if (answers.priority==='performance') score+=(m.score[0]+m.score[3])*0.2;
      if (answers.priority==='value') score+=m.score[4]*0.4;
      if (answers.scene==='range') score+=m.range*0.12;
      if (answers.scene==='commute') score+=m.score[4]*0.08;
      return {model:m,score};
    }).sort((a,b)=>b.score-a.score).map(x=>x.model);
  }
  function renderQuiz() {
    activeView = 'quiz';
    if (quizStep >= questions.length) {
      ranked = calculateRecommendations();
      const m = ranked[0];
      shell(`<div class="modal-eyebrow">YOUR PERFECT MATCH</div><h2 id="modal-title">这一台，和你的生活很合拍。</h2><p class="modal-subtitle">根据预算与偏好，为你找到的推荐。</p><div class="quiz-result"><div class="quiz-result-art"><span class="quiz-match">${check} 为你推荐</span><img src="${m.image}" alt="${m.brandName} ${m.name} 示意插画"></div><div class="quiz-result-copy"><span class="modal-small-label">${m.brandName} · ${m.year}</span><h3>${m.name}</h3><p>${m.description}</p><div class="quiz-result-tags">${m.tags.map(t=>`<span>${t}</span>`).join('')}</div><div class="quiz-result-price">¥ ${formatPrice(m.price)}<small>展示参考价</small></div></div></div><div class="quiz-result-actions"><button class="modal-secondary" data-modal-action="restart-quiz">重新选一次</button><button class="modal-primary" data-modal-action="quiz-recommend" data-id="${m.id}">去看看这台车 ${arrow}</button></div><p class="quiz-algorithm-note">推荐依据：预算范围、使用场景及配置偏好。实际骑乘体验建议到店试骑确认。</p>${footerNote()}`, 'modal-quiz');
      return;
    }
    const q = questions[quizStep];
    shell(`<div class="modal-eyebrow">FIND YOUR RIDE</div><div class="quiz-progress-row"><span>30 秒，找到你的下一程</span><span>0${quizStep+1} <i>/ 03</i></span></div><div class="quiz-progress" aria-label="第 ${quizStep+1} 步，共 3 步">${questions.map((_,i)=>`<span class="${i<=quizStep?'active':''}"></span>`).join('')}</div><h2 id="modal-title">${q.title}</h2><p class="modal-subtitle">${q.subtitle}</p><div class="quiz-choices" role="group" aria-label="${q.title}">${q.choices.map(c=>`<button class="quiz-choice ${answers[q.key]===c.value?'selected':''}" data-modal-action="quiz-choice" data-key="${q.key}" data-value="${c.value}" aria-pressed="${answers[q.key]===c.value}"><span class="quiz-choice-icon">${c.icon}</span><span><strong>${c.title}</strong><small>${c.detail}</small></span><span class="quiz-choice-check">${check}</span></button>`).join('')}</div><div class="quiz-nav"><button class="modal-text-btn" data-modal-action="quiz-prev" ${quizStep===0?'disabled':''}>← 上一步</button><button class="modal-primary" data-modal-action="quiz-next" ${!answers[q.key]?'disabled':''}>${quizStep===2?'看看推荐':'下一步'} ${arrow}</button></div>`, 'modal-quiz');
  }
  function renderDetails() {
    const m = models.find(m=>m.id===detailsId);
    if (!m) return;
    activeView = 'details';
    const chosen = getCompareIds().includes(m.id);
    const specPairs = [['参考价格',`¥ ${formatPrice(m.price)}`],['最高车速',`${m.speed} km/h`],['参考续航',`${m.range} km`],['电机峰值功率',`${m.power} kW`],['电池配置',m.battery],['充电时间',m.charge],['制动系统',m.brake],['整备质量',m.weight],['座高',m.seat]];
    shell(`<div class="modal-eyebrow">MEET YOUR NEXT RIDE</div><div class="detail-heading"><div><span class="modal-small-label">${m.brandName} · ${m.badge}</span><h2 id="modal-title">${m.name}</h2><p class="modal-subtitle">${m.subtitle}</p></div><div class="detail-price">¥ ${formatPrice(m.price)}<small>展示参考价</small></div></div><div class="detail-tabs" role="tablist" aria-label="车型详情"><button role="tab" aria-selected="${detailsTab==='overview'}" class="${detailsTab==='overview'?'active':''}" data-modal-action="details-tab" data-tab="overview">车型概览</button><button role="tab" aria-selected="${detailsTab==='spec'}" class="${detailsTab==='spec'?'active':''}" data-modal-action="details-tab" data-tab="spec">完整参数</button></div>${detailsTab==='overview'?`<div class="detail-overview"><div class="detail-art"><span class="detail-art-word">${m.brand.toUpperCase()}</span><img src="${m.image}" alt="${m.brandName} ${m.name} 原创示意插画"></div><div class="detail-intro"><h3>${m.subtitle}</h3><p>${m.intro}</p><div class="detail-feature-tags">${m.tags.map(t=>`<span>${check}${t}</span>`).join('')}</div><div class="detail-key-specs"><span><strong>${m.speed}<small>km/h</small></strong>最高车速</span><span><strong>${m.range}<small>km</small></strong>参考续航</span><span><strong>${m.power}<small>kW</small></strong>峰值功率</span></div></div></div>`:`<div class="detail-spec-grid">${specPairs.map(([l,v])=>`<div><span>${l}</span><strong>${v}</strong></div>`).join('')}</div>`}<div class="detail-actions"><span>适合你的，才是好车。</span><button class="modal-primary" data-modal-action="detail-compare" data-id="${m.id}">${chosen?check:'＋'} ${chosen?'已加入对比 · 点击移除':'加入对比'}</button></div>${footerNote()}`,'modal-details');
  }
  function renderArticle(id) {
    const article = articles[id] || articles.beginner;
    activeView='article';
    shell(`<div class="modal-eyebrow">RIDE WITH CONFIDENCE</div><span class="article-category">${article.category}</span><h2 id="modal-title">${article.title}</h2><p class="article-lead">${article.intro}</p><div class="article-sections">${article.sections.map(([title,body])=>`<section><h3>${title}</h3><p>${body}</p></section>`).join('')}</div><div class="article-end">好好选车，好好骑行。<span>九牛核 · 骑行指南</span></div>`, 'modal-article');
  }

  root.addEventListener('click',event=>{
    if (event.target===root) return close();
    const button=event.target.closest('[data-modal-action]');
    if (!button||button.disabled) return;
    const action=button.dataset.modalAction;
    if(action==='close'||action==='back-explore') close();
    if(action==='remove-compare') {onToggleCompare(button.dataset.id);renderCompare();}
    if(action==='add-trio') {for(const m of models.slice(0,3)){if(!getCompareIds().includes(m.id))onToggleCompare(m.id);}renderCompare();}
    if(action==='diff') {differencesOnly=button.checked;renderCompare();}
    if(action==='quiz-choice') {answers[button.dataset.key]=button.dataset.value;renderQuiz();root.querySelector(`[data-value="${button.dataset.value}"]`)?.focus({preventScroll:true});}
    if(action==='quiz-prev'&&quizStep>0) {quizStep--;renderQuiz();}
    if(action==='quiz-next'&&answers[questions[quizStep].key]) {quizStep++;renderQuiz();}
    if(action==='restart-quiz') {answers={};quizStep=0;renderQuiz();}
    if(action==='quiz-recommend') {const id=button.dataset.id;close();onRecommend(id);}
    if(action==='details-tab') {detailsTab=button.dataset.tab;renderDetails();root.querySelector(`[data-tab="${detailsTab}"]`)?.focus({preventScroll:true});}
    if(action==='detail-compare') {onToggleCompare(button.dataset.id);renderDetails();}
  });
  document.addEventListener('keydown',event=>{
    if(root.hidden)return;
    if(event.key==='Escape'){event.preventDefault();close();}
    if(event.key==='Tab'){
      const focusable=[...root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length);
      if(!focusable.length){event.preventDefault();return;}
      const first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement)||document.activeElement.classList.contains('modal-panel'))){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){event.preventDefault();first.focus();}
    }
  });
  return {
    openCompare(){differencesOnly=false;renderCompare();},
    openQuiz(){answers={};quizStep=0;renderQuiz();},
    openDetails(id){detailsId=id;detailsTab='overview';renderDetails();},
    openArticle:renderArticle,
    close
  };
}
