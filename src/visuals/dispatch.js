import { header, icon } from '../ui.js';
import { buildDispatchPlan, fleet, jobs, onRoad } from './dispatch-plan.js';

const stages = [
  ['指派任务', '距离、任务权重和预计完成时间一起进入指派决策。'],
  ['预约路径', '先比较各车单独走最短路时可能发生的冲突，再给道路分配通行时隙。'],
  ['协调通行', '加急车保留直行路线，回收车改走北侧通道，两车错开通过。'],
  ['完成核对', '按时隙核对完成情况。短任务可以并行先完成，冲突时优先保护高权重任务。']
];

let plan;
const routePoint = (path, time) => path[Math.min(time, path.length - 1)];
const equals = (a, b) => a[0] === b[0] && a[1] === b[1];

export function dispatchView(slide) {
  return `<div class="content project-content dispatch-content">
    ${header(slide.chapter.label, slide.title)}
    <div class="mac-window dispatch-window">
      <div class="window-bar"><span class="traffic"><i></i><i></i><i></i></span><span>自动化工厂 · AGV 调度台</span><small>教学仿真</small></div>
      <div class="dispatch-console">
        <div class="dispatch-visual">
          <canvas class="dispatch-canvas" width="960" height="570" role="img" aria-label="三维轴测工厂，三台 AGV 在库区道路搬运并按预约错峰通行"></canvas>
          <div class="dispatch-legend"><span><i></i>取货／交付站</span><span><i></i>预约路线</span><span><i></i>潜在冲突点</span></div>
        </div>
        <aside class="dispatch-details" aria-label="调度策略">
          <div class="dispatch-story"><h2></h2><p></p></div>
          <div class="dispatch-tasks"></div>
          <div class="dispatch-metrics"></div>
        </aside>
      </div>
      <div class="dispatch-controls">
        <nav aria-label="调度分镜">${stages.map(([name], i) => `<button type="button" data-dispatch-stage="${i}" ${i === 0 ? 'aria-current="step"' : ''}>${name}</button>`).join('')}</nav>
        <div class="dispatch-play"><button type="button" data-dispatch-play>${icon('replay', 15)} <span>播放协同</span></button><span class="dispatch-tick" aria-live="off"></span></div>
      </div>
    </div>
  </div>`;
}

function drawFactory(context, data, stage, time) {
  const { width, height } = context.canvas;
  const ground = context.createLinearGradient(0, 0, width, height);
  ground.addColorStop(0, '#122b34');
  ground.addColorStop(1, '#081721');
  context.fillStyle = ground;
  context.fillRect(0, 0, width, height);
  const project = (x, y, z = 0) => [358 + 68 * (x - .67 * y), 101 + 27 * (x + y) - z * 44];

  function polygon(points, color, outline) {
    context.beginPath();
    points.forEach((point, index) => context[index === 0 ? 'moveTo' : 'lineTo'](...project(...point)));
    context.closePath();
    context.fillStyle = color;
    context.fill();
    if (outline) { context.strokeStyle = outline; context.lineWidth = 1; context.stroke(); }
  }

  function box(x, y, w, d, h, top, front, side, floor = 0) {
    const a = [x - w, y - d], b = [x + w, y - d], c = [x + w, y + d], e = [x - w, y + d];
    const high = point => [...point, floor + h];
    const low = point => [...point, floor];
    polygon([low(b), low(c), high(c), high(b)], side);
    polygon([low(e), low(c), high(c), high(e)], front);
    polygon([high(a), high(b), high(c), high(e)], top, '#d3e9e432');
  }

  function path(points, color, thickness, dash = []) {
    context.beginPath();
    points.forEach((point, index) => context[index === 0 ? 'moveTo' : 'lineTo'](...project(...point)));
    context.strokeStyle = color;
    context.lineJoin = context.lineCap = 'round';
    context.lineWidth = thickness;
    context.setLineDash(dash);
    context.stroke();
    context.setLineDash([]);
  }

  function tag(point, label, tone, small = false) {
    const [x, y] = project(...point);
    context.font = `700 ${small ? 16 : 19}px system-ui,sans-serif`;
    const length = context.measureText(label).width;
    context.fillStyle = '#08161eee';
    context.fillRect(x - length / 2 - 8, y - 18, length + 16, 25);
    context.fillStyle = tone;
    context.textAlign = 'center';
    context.fillText(label, x, y);
  }

  polygon([[-.66,-.66,-.23],[8.66,-.66,-.23],[8.66,6.66,-.23],[-.66,6.66,-.23]], '#070f16');
  polygon([[-.66,-.66],[8.66,-.66],[8.66,6.66],[-.66,6.66]], '#23424c', '#4b7379');
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 9; x++) {
      const road = onRoad(x, y);
      polygon([[x-.49,y-.49],[x+.49,y-.49],[x+.49,y+.49],[x-.49,y+.49]],
        road ? '#31535e' : '#1e3a46', road ? '#52778144' : '#74939455');
      if (road && x % 2 === 0 && y % 2 === 0) {
        polygon([[x-.21,y-.21],[x+.21,y-.21],[x+.21,y+.21],[x-.21,y+.21]], '#73959945');
      }
    }
  }
  if (stage === 1) {
    data.baseline.forEach(route => path(route, '#b0a7a16c', 3, [6, 7]));
  }
  if (stage >= 1) {
    data.routes.forEach((route, index) => path(route, fleet[index].color + (stage === 1 ? 'a5' : '80'), stage === 1 ? 4 : 3));
  }
  const props = [];
  for (let y = 1; y < 7; y += 2) {
    for (let x = 1; x < 9; x += 2) {
      props.push({ depth: x + y, paint: () => {
        box(x, y, .34, .36, .10, '#53717a', '#264650', '#34545b');
        box(x, y, .28, .30, .65, '#708c89', '#365c60', '#476d6d', .10);
        path([[x-.23,y+.31,.40],[x+.23,y+.31,.40]], '#709596', 2);
      } });
    }
  }
  jobs.forEach(job => {
    for (const [kind, point] of [['取', job.pickup], ['送', job.drop]]) {
      const [x,y] = point;
      polygon([[x-.31,y-.31,.02],[x+.31,y-.31,.02],[x+.31,y+.31,.02],[x-.31,y+.31,.02]], '#b6dfc143', '#c4e8d184');
      props.push({ depth: x + y, paint: () => tag([x,y,.40], job.id + kind, '#d6f7df', true) });
    }
  });

  for (let i = 0; i < fleet.length; i++) {
    const route = data.routes[i];
    const [x, y] = routePoint(route, Math.floor(time));
    const [nextX, nextY] = routePoint(route, Math.ceil(time));
    const px = x + (nextX - x) * (time % 1), py = y + (nextY - y) * (time % 1);
    const tone = fleet[i].color;
    props.push({ depth: px + py + .35, paint: () => {
      polygon([[px-.37,py-.31],[px+.37,py-.31],[px+.37,py+.31],[px-.37,py+.31]], '#07101970');
      box(px, py, .30, .23, .24, tone, tone + 'a0', tone + '80');
      const pickup = route.findIndex(point => equals(point, data.assignment[i].pickup));
      if (time >= pickup && time < route.length - 1) box(px, py, .155, .13, .22, '#e8c588', '#a67543', '#c6965c', .24);
      tag([px,py,.74], 'AGV ' + fleet[i].id, tone);
    } });
  }
  props.sort((a,b) => a.depth - b.depth).forEach(prop => prop.paint());
  if (stage === 1 || (stage === 2 && Math.abs(time - data.baselineConflicts[0]?.time) < 1.1)) {
    data.baselineConflicts.forEach(({ point }) => {
      const [x,y] = project(...point);
      context.beginPath();
      context.ellipse(x, y, 26, 14, -.05, 0, 2 * Math.PI);
      context.strokeStyle = '#ffb17c';
      context.lineWidth = 3;
      context.stroke();
      tag([...point, -.43], stage === 1 ? '最短路会车冲突' : '已错开通行', '#ffcb9f');
    });
  }
}

export function mountDispatch(scene, { signal, motion, animate }) {
  plan ??= buildDispatchPlan();
  const context = scene.querySelector('canvas').getContext('2d');
  const heading = scene.querySelector('.dispatch-story h2');
  const description = scene.querySelector('.dispatch-story p');
  const taskList = scene.querySelector('.dispatch-tasks');
  const metrics = scene.querySelector('.dispatch-metrics');
  const play = scene.querySelector('[data-dispatch-play]');
  const tick = scene.querySelector('.dispatch-tick');
  const buttons = [...scene.querySelectorAll('[data-dispatch-stage]')];
  let stage = animate ? 0 : 3;
  let time = animate ? 0 : plan.makespan;
  let running = false, frame = 0, previous = 0, lastTick = -1;
  const animated = motion === 'full';

  function draw(details = false) {
    if (context) drawFactory(context, plan, stage, time);
    const step = Math.floor(time);
    if (!details && step === lastTick) return;
    lastTick = step;
    scene.querySelector('.dispatch-console').dataset.stage = String(stage);
    buttons.forEach((button, index) => {
      if (index === stage) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    heading.textContent = stages[stage][0];
    description.textContent = stages[stage][1];
    play.querySelector('span').textContent = running ? '暂停' : animated ? (stage === 3 ? '重播协同' : '播放协同') : '推进一时隙';
    tick.textContent = `时隙 ${step} / ${plan.makespan}`;
    taskList.innerHTML = jobs.map(job => {
      const index = plan.assignment.indexOf(job);
      const done = step >= plan.routes[index].length - 1;
      return `<div class="dispatch-task"><b style="--car:${fleet[index].color}">${job.id}</b><span><strong>${job.title}</strong><small>权重 ${job.weight} · AGV ${fleet[index].id}</small></span><small>${done ? '已送达' : stage === 0 ? '已指派' : '已预约'}</small></div>`;
    }).join('');
    metrics.innerHTML = stage === 0
      ? `<span>${plan.candidates} 组指派与预约候选</span><strong>加权完工 ${plan.weighted}</strong><small>另一指派 ${plan.alternativeWeighted}</small>`
      : `<span>示意路网的规划结果</span><strong>${plan.baselineConflicts.length} → ${plan.plannedConflicts.length} 处冲突</strong><small>加权完工指标 ${plan.weighted}</small>`;
  }

  function select(next) {
    running = false;
    cancelAnimationFrame(frame);
    stage = next;
    time = next === 3 ? plan.makespan : 0;
    draw(true);
  }

  function update(now) {
    if (signal.aborted || !running) return;
    if (previous) time = Math.min(plan.makespan, time + (now - previous) / 540);
    previous = now;
    if (time >= plan.makespan) { select(3); return; }
    draw();
    frame = requestAnimationFrame(update);
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => select(index), { signal }));
  play.addEventListener('click', () => {
    if (running) { running = false; cancelAnimationFrame(frame); draw(true); return; }
    if (stage !== 2) { stage = 2; time = 0; }
    if (animated) { running = true; previous = 0; frame = requestAnimationFrame(update); }
    else {
      time = Math.min(plan.makespan, time + 1);
      if (time === plan.makespan) stage = 3;
    }
    draw(true);
  }, { signal });
  signal.addEventListener('abort', () => cancelAnimationFrame(frame), { once: true });
  draw(true);
}
