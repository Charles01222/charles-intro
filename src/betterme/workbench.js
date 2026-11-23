import { betterMe } from '../content.js';
import { escapeHtml, header, icon } from '../ui.js';
import { atsView, attachDemo } from './demo.js';

const workspaces = [
  { id: 'overview', label: '工作台总览', icon: 'grid', image: 'overview' },
  { id: 'resume', label: '简历工作室', icon: 'window', image: 'resume', copy: '从同一份事实库维护多版简历，核对经历、切换版式并导出。' },
  { id: 'advisor', label: 'AI 顾问', icon: 'spark', copy: '以岗位要求和真实经历为依据，串起研判、规划、训练与修改建议。' },
  { id: 'atlas', label: '岗位地图', icon: 'pin', image: 'atlas', copy: '从地点和通勤范围出发，把招聘信息放回地图上看。' },
  { id: 'opportunities', label: '机会与投递', icon: 'route', image: 'opportunities', copy: '保存机会、记录投递状态，同时保留每个岗位的下一步。' },
  { id: 'resources', label: '资料库', icon: 'notes', image: 'resources', copy: '汇集面试、简历和职业发展的参考资料。' },
  { id: 'autopilot', label: '自动化工坊', icon: 'settings', image: 'autopilot', copy: '把求职工作拆成可以编排的步骤，关键操作由本人确认。' }
];

const advisorTools = [
  { id: 'ats', label: '岗位研判', image: 'advisor' },
  { id: 'evidence', label: '简历与经历', image: 'evidence', copy: '把修改建议连回已有事实，再决定怎么写。' },
  { id: 'career', label: '职业规划', image: 'career' },
  { id: 'learning', label: '学习提升', image: 'learning', copy: '从目标岗位的差距出发，确定下一步学什么。' },
  { id: 'practice', label: '训练与面试', image: 'practice' },
  { id: 'growth', label: '资料与练习', image: 'growth', copy: '围绕岗位要求整理材料，把学习内容转成练习。' },
  { id: 'studio', label: '演练与证据', image: 'studio', copy: '用演练复盘表现，把有依据的结果留存下来。' },
  { id: 'handoff', label: '外部协作', image: 'handoff', copy: '通过本地连接把核实过的信息交给外部工具，由用户选择提供的内容。' }
];

const paths = [
  { role: '数据产品', why: '已经能理解运营指标，下一步练习把指标变成产品决策。', steps: ['整理两个指标项目的真实证据', '访谈使用方，从需求写到验收标准', '做一个可试用的指标看板并复盘'] },
  { role: '工业软件产品', why: '利用跨团队沟通经验，补现场流程与约束建模。', steps: ['用流程图复盘一项协同任务', '走访现场，梳理异常与调度约束', '交付一个小型任务编排原型'] }
];

const drills = [
  { label: '模拟面试', question: '说一次你用数据推动业务决策的经历。', answer: '周报每次需要从三张表手工汇总。我先和运营核对指标口径，再做了自动汇总的看板。', feedback: ['保留具体动作：核对口径、做出看板。', '补一个可查证的结果，例如上线后的周报耗时或使用记录。'] },
  { label: '专项训练', question: '当业务和技术对指标口径有分歧，你会怎么推进？', answer: '我会先让双方用同一组样例算结果，再定位差异来自哪项定义，最后约定使用场景。', feedback: ['说清楚如何让分歧可重现。', '补上谁确认标准，以及以后怎样发现口径再次漂移。'] }
];

function moduleButton(item, current) {
  return `<button type="button" data-module="${item.id}" ${item.id === current ? 'aria-current="page"' : ''}>${item.icon ? icon(item.icon, 17) : ''}${item.label}</button>`;
}

export function betterMeView(slide) {
  return `<div class="content project-content better-content">
    ${header(slide.chapter.label, slide.title)}
    <div class="mac-window workbench">
      <div class="window-bar"><span class="traffic"><i></i><i></i><i></i></span><span>BetterMe · 职业工作台</span>
        <small>离线演示</small></div>
      <div class="workbench-layout">
        <nav class="workbench-nav" aria-label="BetterMe 功能">
          ${workspaces.map(item => moduleButton(item)).join('')}
        </nav>
        <div class="workbench-pane" id="workbench-pane"></div>
      </div>
      <div class="workbench-foot"><span>虚构示例 · 浏览器本地运行</span><a href="${escapeHtml(betterMe.source)}" target="_blank" rel="noopener noreferrer">BetterMe 源码 ${icon('external', 13)}</a></div>
    </div>
    <dialog class="bench-quicklook" aria-labelledby="quicklook-title">
      <div class="quicklook-window">
        <header class="quicklook-bar">
          <button type="button" class="quicklook-close" data-close-preview aria-label="关闭截图"><span aria-hidden="true">×</span></button>
          <h2 id="quicklook-title"></h2>
          <button type="button" class="quicklook-scale" data-toggle-scale aria-pressed="false">原始大小</button>
        </header>
        <div class="quicklook-image"><img alt=""></div>
      </div>
    </dialog>
  </div>`;
}

function advisorNav(current) {
  return `<nav class="advisor-tools" aria-label="AI 顾问功能">${advisorTools.map(item => moduleButton(item, current)).join('')}</nav>`;
}

function preview(item) {
  return `<figure class="bench-image">
    <button type="button" data-zoom aria-haspopup="dialog" aria-label="放大${item.label}截图">
      <img src="./assets/betterme/${item.image}.webp" alt="${item.label}真实应用截图">
      <span>${icon('fullscreen', 15)} 放大查看</span>
    </button>
  </figure>`;
}

function feature(item) {
  return `<header class="bench-head"><h2>${item.label}</h2><p>${item.copy}</p></header>${preview(item)}`;
}

function overview() {
  return `<div class="bench-overview">
    <header class="bench-head"><h2>把经历、机会和成长放进同一套工具。</h2><p>从整理手上的事实，到准备下一场面试。</p></header>
    <div class="bench-overview-grid">${workspaces.slice(1).map(item =>
      `<button type="button" data-module="${item.id}"><span>${icon(item.icon, 19)} ${item.label}</span><small>${item.copy}</small></button>`).join('')}</div>
  </div>`;
}

function withPreview(contents, item) {
  return `<div class="bench-split"><div class="bench-interaction">${contents}</div>${preview(item)}</div>`;
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

export function mountWorkbench(scene, signal, initial = 'overview') {
  const pane = scene.querySelector('#workbench-pane');
  const nav = scene.querySelector('.workbench-nav');
  const dialog = scene.querySelector('.bench-quicklook');
  const dialogImage = dialog.querySelector('img');
  const dialogTitle = dialog.querySelector('h2');
  const close = dialog.querySelector('[data-close-preview]');
  const scale = dialog.querySelector('[data-toggle-scale]');
  let current = initial;
  let lastAdvisor = advisorTools.some(item => item.id === initial) ? initial : 'ats';
  let panel;
  let pathIndex = 0, expanded = false, drillIndex = 0, stage = 0;

  function draw() {
    panel?.abort();
    panel = new AbortController();
    const advisor = advisorTools.find(item => item.id === current);
    for (const button of nav.querySelectorAll('[data-module]')) {
      if (button.dataset.module === (advisor ? 'advisor' : current)) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    if (advisor) {
      lastAdvisor = current;
      const body = {
        ats: () => withPreview(atsView(), advisor),
        career: () => withPreview(careerDemo(pathIndex, expanded), advisor),
        practice: () => withPreview(practiceDemo(drillIndex, stage), advisor)
      };
      pane.innerHTML = advisorNav(current) + (body[current]?.() || feature(advisor));
      if (current === 'ats') attachDemo(pane, panel.signal);
    } else {
      const item = workspaces.find(entry => entry.id === current);
      pane.innerHTML = current === 'overview' ? withPreview(overview(), item) : feature(item);
    }
  }

  function setNaturalSize(natural) {
    dialog.classList.toggle('is-natural', natural);
    scale.setAttribute('aria-pressed', String(natural));
    scale.textContent = natural ? '适合窗口' : '原始大小';
    dialog.querySelector('.quicklook-image').scrollTo(0, 0);
  }

  close.addEventListener('click', () => dialog.close(), { signal });
  scale.addEventListener('click', () => setNaturalSize(scale.getAttribute('aria-pressed') === 'false'), { signal });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }, { signal });
  scene.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-zoom')) {
      const source = button.querySelector('img');
      dialogImage.src = source.currentSrc || source.src;
      dialogImage.alt = source.alt;
      dialogTitle.textContent = 'BetterMe · ' + source.alt.replace('真实应用截图', '');
      setNaturalSize(false);
      dialog.showModal();
      close.focus();
      return;
    }
    const { module, path, drill } = button.dataset;
    if (module) { current = module === 'advisor' ? lastAdvisor : module; pane.scrollTop = 0; }
    else if (path !== undefined) { pathIndex = Number(path); expanded = false; }
    else if (drill !== undefined) { drillIndex = Number(drill); stage = 0; }
    else if (button.hasAttribute('data-reveal-plan')) expanded = true;
    else if (button.hasAttribute('data-drill-next')) stage++;
    else if (button.hasAttribute('data-drill-reset')) stage = 0;
    else return;

    const focused = pane.contains(button);
    draw();
    if (focused) {
      const sameTab = module && pane.querySelector(`[data-module="${current}"]`);
      const next = sameTab || pane.querySelector('[data-drill-next], [data-drill-reset], [data-reveal-plan], [aria-pressed="true"]') || pane.querySelector('button');
      next?.focus({ preventScroll: true });
    }
  }, { signal });
  signal.addEventListener('abort', () => panel?.abort(), { once: true });
  draw();
}
