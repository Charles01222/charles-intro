import { research } from '../content.js';
import { escapeHtml, header } from '../ui.js';

const bots = [
  { name: '偏爱重复', color: 'blue', eyes: 'round', moves: ['石', '石', '石', '石'], bars: [95, 22, 81, 32, 68, 25, 84, 32] },
  { name: '按顺序变换', color: 'violet', eyes: 'wide', moves: ['石', '剪', '布', '石'], bars: [55, 73, 35, 81, 30, 67, 44, 90] },
  { name: '看上一轮调整', color: 'teal', eyes: 'round', moves: ['石', '布', '石', '剪'], bars: [86, 25, 73, 42, 67, 30, 79, 42] },
  { name: '不太固定', color: 'sand', eyes: 'wide', moves: ['剪', '布', '布', '石'], bars: [32, 57, 91, 32, 48, 76, 35, 59] }
];

function bot({ color, eyes }, size = 112) {
  return `<svg class="robot tone-${color}" width="${size}" height="${size}" viewBox="0 0 128 123" aria-hidden="true">
    <ellipse class="robot-floor" cx="64" cy="113" rx="38" ry="5"/>
    <path d="M45 96v10h-9m47-10v10h9M32 74l-13 12m77-12 13 12" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <rect x="36" y="64" width="56" height="38" rx="15" class="robot-body"/>
    <path d="M59 87h10" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M64 29V16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="64" cy="13" r="5" fill="currentColor"/>
    <rect x="23" y="41" width="12" height="20" rx="5" class="robot-body"/><rect x="93" y="41" width="12" height="20" rx="5" class="robot-body"/>
    <rect x="29" y="28" width="70" height="50" rx="${eyes === 'wide' ? 14 : 21}" class="robot-body"/>
    <rect x="37" y="38" width="54" height="28" rx="12" class="robot-face"/>
    <path d="${eyes === 'wide' ? 'M48 54h7m18 0h7' : 'M50 50v6m28-6v6'}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
}

function moves(items) {
  return `<div class="moves">${items.map((move, index) => `<span style="--i:${index}">${move}</span>`).join('')}</div>`;
}

function fingerprint(item) {
  return `<div class="fingerprint tone-${item.color}" aria-label="简化策略指纹">${item.bars.map((height, index) => `<i style="--bar:${height}%;--i:${index}"></i>`).join('')}</div>`;
}

function cardGrid(id) {
  return `<div class="robot-grid">${bots.map((item, index) => `
    <article class="robot-card tone-${item.color} rise" style="--i:${index}">
      ${bot(item)}<strong>${item.name}</strong>
      ${id === 'represent' ? fingerprint(item) : moves(item.moves)}
      ${id === 'imitate' ? `<div class="learner"><span aria-hidden="true">↓</span><b>学习小助手</b><small>情境 ＋ 动作</small></div>` : ''}
    </article>`).join('')}</div>`;
}

function space(id) {
  const clustered = id !== 'compare';
  const initial = [[28, 41, 'blue'], [42, 55, 'teal'], [72, 31, 'violet'], [61, 75, 'sand']];
  const points = clustered ? [[32, 42, 'blue'], [37, 52, 'teal'], [67, 41, 'violet'], [49, 75, 'sand']] :
    initial;
  return `<div class="strategy-space" role="img" aria-label="策略空间示意，行为越相似的点越接近">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${clustered ? '<ellipse class="space-zone" cx="34" cy="48" rx="14" ry="20"/><ellipse class="space-zone zone-b" cx="67" cy="41" rx="10" ry="15"/><ellipse class="space-zone zone-c" cx="49" cy="75" rx="10" ry="13"/>' : '<path class="space-near" d="M28 41 42 55"/><path class="space-far" d="M28 41 72 31"/>'}
      ${id === 'apply' ? '<path class="space-infer" d="M15 66 32 42m-17 24 22-14"/><path class="space-alternative" d="M15 66 49 75"/>' : ''}
    </svg>
    ${points.map(([x, y, color], index) => `<div class="strategy-point tone-${color} ${id === 'cluster' ? 'gather' : 'rise'}" style="--x:${x}%;--y:${y}%;--from-x:${initial[index][0]}%;--from-y:${initial[index][1]}%;--i:${index}"><i></i>${id === 'compare' ? `<small>${bots[index].name}</small>` : ''}</div>`).join('')}
    ${id === 'apply' ? '<div class="strategy-point new-point" style="--x:15%;--y:66%"><i></i><small>新行为</small></div><div class="uncertain">仍可能不确定</div>' : ''}
    <span class="space-caption">策略空间 · 位置与距离示意</span>
    </div>`;
}

function researchBoard(id) {
  if (id === 'observe' || id === 'imitate' || id === 'represent') return cardGrid(id);
  if (id === 'apply') return `<div class="apply-board"><div class="apply-robot rise">${bot({ color: 'new', eyes: 'round' }, 96)}<strong>陌生对手</strong>${moves(['石', '石', '剪'])}<small>预设观察</small></div>${space(id)}</div>`;
  return `<div class="compare-board"><div class="fingerprint-list">${bots.map(item => `<div>${bot(item, 36)}${fingerprint(item)}</div>`).join('')}</div>${space(id)}</div>`;
}

const captions = {
  observe: '就像有人按计划做事，有人会根据反馈随时调整。',
  imitate: '从记录里学选手的行为规律，先看“发生了什么”和“它做了什么”。',
  represent: '色条把不同情境里的动作概率做了可视化简化。',
  compare: '策略距离依据动作分布计算。机器人外观只是识别标记。',
  cluster: '从记住某一个选手，转向理解一类行为模式。',
  apply: '已知规律 → 初步判断 → 随观察修正 → 帮助选择应对方式'
};

export function researchView(slide) {
  const id = slide.researchId;
  const current = research.findIndex(item => item.id === id);
  return `<div class="content project-content research-content">
    ${header('墨大研究项目 · 重复石头剪刀布', slide.title, slide.line)}
    <div class="mac-window research-window"><div class="window-bar"><span class="traffic"><i></i><i></i><i></i></span>
      <span>策略实验室</span><small>研究原理示意</small></div>
      <div class="research-board board-${id}">${researchBoard(id)}<p class="board-caption">${captions[id]}</p></div>
    </div>
    <div class="research-meta"><ol class="steps" aria-label="研究分镜进度">${research.map((item, index) => `<li ${index === current ? 'aria-current="step"' : ''} class="${index < current ? 'complete' : ''}"><i></i>${item.label}</li>`).join('')}</ol>
      <div class="research-tags">${(slide.tags || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
    </div>
    </div>`;
}
