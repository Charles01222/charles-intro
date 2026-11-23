import { betterMe } from '../content.js';
import { escapeHtml, header, icon } from '../ui.js';
import { atsView, attachDemo } from './demo.js';

const workspaces = [
  { id: 'resume', label: '简历工作室', icon: 'window', image: 'resume', copy: '从同一份事实库维护多版简历，核对经历、切换版式并导出。' },
  { id: 'advisor', label: 'AI 顾问', icon: 'spark', image: 'advisor', copy: '以岗位要求和真实经历为依据，串起研判、规划、训练与修改建议。' },
  { id: 'atlas', label: '岗位地图', icon: 'pin', image: 'atlas', copy: '从地点和通勤范围出发，把招聘信息放回地图上看。' },
  { id: 'opportunities', label: '机会与投递', icon: 'route', image: 'opportunities', copy: '保存机会、记录投递状态，同时保留每个岗位的下一步。' },
  { id: 'resources', label: '资料库', icon: 'notes', copy: '把岗位材料、准备笔记和可复用的练习证据集中管理。', items: ['岗位材料', '学习笔记', '练习证据'] },
  { id: 'autopilot', label: '自动化工坊', icon: 'settings', image: 'autopilot', copy: '把求职工作拆成可以编排的步骤，关键操作由本人确认。' }
];

const advisorTools = [
  { id: 'ats', label: '岗位研判' },
  { id: 'evidence', label: '简历与经历', copy: '把每条修改建议连回已有事实，先核对经历，再决定怎么写。', items: ['经历事实', '岗位要求', '改写建议'] },
  { id: 'career', label: '职业规划', slide: 'betterme-career' },
  { id: 'learning', label: '学习提升', copy: '把岗位差距变成学习任务，保存资料、练习结果和可复用证据。', items: ['待补能力', '资料与练习', '演练与证据'] },
  { id: 'practice', label: '训练与面试', slide: 'betterme-practice' },
  { id: 'handoff', label: '外部协作', copy: '通过本地连接将核实过的信息交给外部工具，由用户选择提供的内容。', items: ['核实事实', '本地连接', '人工确认'] }
];

const paths = [
  { role: '数据产品', why: '已经能理解运营指标，下一步练习把指标变成产品决策。', steps: ['整理两个指标项目的真实证据', '访谈使用方，从需求写到验收标准', '做一个可试用的指标看板并复盘'] },
  { role: '工业软件产品', why: '利用跨团队沟通经验，补现场流程与约束建模。', steps: ['用流程图复盘一项协同任务', '走访现场，梳理异常与调度约束', '交付一个小型任务编排原型'] }
];

const drills = [
  { label: '模拟面试', question: '说一次你用数据推动业务决策的经历。', answer: '周报每次需要从三张表手工汇总。我先和运营核对指标口径，再做了自动汇总的看板。', feedback: ['保留具体动作：核对口径、做出看板。', '补一个可查证的结果，例如上线后的周报耗时或使用记录。'] },
  { label: '专项训练', question: '当业务和技术对指标口径有分歧，你会怎么推进？', answer: '我会先让双方用同一组样例算结果，再定位差异来自哪项定义，最后约定使用场景。', feedback: ['说清楚如何让分歧可重现。', '补上谁确认标准，以及以后怎样发现口径再次漂移。'] }
];

function moduleButton(item, current, slideId) {
  const route = item.slide && item.slide !== slideId ? `data-go="${item.slide}"` : `data-module="${item.id}"`;
  return `<button type="button" ${route} ${item.id === current ? 'aria-current="page"' : ''}>${item.icon ? icon(item.icon, 17) : ''}${item.label}</button>`;
}

export function betterMeView(slide) {
  return `<div class="content project-content better-content">
    ${header(slide.chapter.label, slide.title)}
    <div class="mac-window workbench">
      <div class="window-bar"><span class="traffic"><i></i><i></i><i></i></span><span>BetterMe · 职业工作台</span>
        <small>离线演示</small></div>
      <div class="workbench-layout">
        <nav class="workbench-nav" aria-label="BetterMe 功能">
          <button type="button" ${slide.module === 'overview' ? 'data-module="overview"' : 'data-go="betterme"'} ${slide.module === 'overview' ? 'aria-current="page"' : ''}>${icon('grid',17)} 工作台总览</button>
          ${workspaces.map(item => moduleButton(item, slide.module)).join('')}
          <div class="workbench-focus">${advisorTools.filter(item => item.slide).map(item => moduleButton(item, slide.module, slide.id)).join('')}</div>
        </nav>
        <div class="workbench-pane" id="workbench-pane"></div>
      </div>
      <div class="workbench-foot"><span>虚构示例 · 浏览器本地运行</span><a href="${escapeHtml(betterMe.source)}" target="_blank" rel="noopener noreferrer">BetterMe 源码 ${icon('external', 13)}</a></div>
    </div>
  </div>`;
}

function advisorNav(current, slideId) {
  return `<nav class="advisor-tools" aria-label="AI 顾问功能">${advisorTools.map(item => moduleButton(item, current, slideId)).join('')}</nav>`;
}

function feature(item, slideId) {
  return `<header class="bench-head"><h2>${item.label}</h2><p>${item.copy}</p></header>
    ${item.id === 'advisor' ? advisorNav(item.id, slideId) : ''}
    ${item.image ? `<figure class="bench-image"><img src="./assets/betterme/${item.image}.webp" alt="${item.label}产品截图"><figcaption>产品截图</figcaption></figure>` :
      `<div class="bench-summary">${item.items.map(name => `<span>${name}</span>`).join('')}</div>`}`;
}

function overview() {
  return `<div class="bench-overview">
    <header class="bench-head"><h2>把经历、机会和成长放进同一套工具。</h2><p>从整理手上的事实，到准备下一场面试。</p></header>
    <div class="bench-overview-grid">${workspaces.map(item =>
      `<button type="button" data-module="${item.id}"><span>${icon(item.icon, 19)} ${item.label}</span><small>${item.copy}</small></button>`).join('')}</div>
    ${advisorNav('overview')}
  </div>`;
}

function choiceButtons(records, active, kind) {
  return `<div class="bench-choices">${records.map((entry, index) =>
    `<button type="button" data-${kind}="${index}" aria-pressed="${active === index}">${entry.role || entry.label}</button>`).join('')}</div>`;
}

function careerDemo(selection, expanded) {
  const path = paths[selection];
  return `<div class="bench-demo">
    <header class="bench-head"><h2>职业规划</h2><p>林然 · 做过运营分析，希望更靠近产品，每周可投入 8 小时。</p></header>
    ${choiceButtons(paths, selection, 'path')}
    <div class="bench-result"><strong>${path.role}</strong><p>${path.why}</p>
      ${expanded ? `<ol class="career-steps">${path.steps.map((step, i) => `<li><span>第 ${i + 1} 阶段</span>${step}</li>`).join('')}</ol>` :
        '<button class="bench-primary" data-reveal-plan type="button">展开准备路线</button>'}
    </div>
  </div>`;
}

function practiceDemo(selection, stage) {
  const drill = drills[selection];
  return `<div class="bench-demo">
    <header class="bench-head"><h2>训练与面试</h2><p>围绕数据产品方向，练一题，再复盘一题。</p></header>
    ${choiceButtons(drills, selection, 'drill')}
    <div class="bench-result practice-result"><strong>${drill.question}</strong>
      ${stage > 0 ? `<p class="demo-answer"><span>示例回答</span>${drill.answer}</p>` : ''}
      ${stage === 2 ? `<ul class="demo-feedback">${drill.feedback.map(item => `<li>${item}</li>`).join('')}</ul><button type="button" data-drill-reset class="bench-primary">重练这题</button>` :
        `<button type="button" data-drill-next class="bench-primary">${stage ? '查看复盘要点' : '展示示例回答'}</button>`}
    </div>
  </div>`;
}

export function mountWorkbench(scene, slide, signal) {
  const pane = scene.querySelector('#workbench-pane');
  const nav = scene.querySelector('.workbench-nav');
  let current = slide.module;
  let panel;
  let pathIndex = 0, expanded = false, drillIndex = 0, stage = 0;

  function draw() {
    panel?.abort();
    panel = new AbortController();
    for (const button of nav.querySelectorAll('[data-module], [data-go]')) {
      const selected = button.dataset.module === current || advisorTools.some(item => item.id === current && item.slide === button.dataset.go);
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    if (current === 'career') pane.innerHTML = careerDemo(pathIndex, expanded);
    else if (current === 'practice') pane.innerHTML = practiceDemo(drillIndex, stage);
    else if (current === 'overview') pane.innerHTML = overview();
    else if (current === 'ats') {
      pane.innerHTML = advisorNav(current, slide.id) + atsView();
      attachDemo(pane, panel.signal);
    } else {
      const item = [...workspaces, ...advisorTools].find(entry => entry.id === current);
      pane.innerHTML = (advisorTools.includes(item) ? advisorNav(current, slide.id) : '') + feature(item, slide.id);
    }
  }

  scene.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const { module, path, drill } = button.dataset;
    if (module) current = module;
    else if (path !== undefined) { pathIndex = Number(path); expanded = false; }
    else if (drill !== undefined) { drillIndex = Number(drill); stage = 0; }
    else if (button.hasAttribute('data-reveal-plan')) expanded = true;
    else if (button.hasAttribute('data-drill-next')) stage++;
    else if (button.hasAttribute('data-drill-reset')) stage = 0;
    else return;

    const focused = pane.contains(button);
    draw();
    if (focused) {
      const next = pane.querySelector('[data-drill-next], [data-drill-reset], [data-reveal-plan], [aria-pressed="true"], button');
      next?.focus({ preventScroll: true });
    }
  }, { signal });
  signal.addEventListener('abort', () => panel?.abort(), { once: true });
  draw();
}
