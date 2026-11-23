import { header, icon } from '../ui.js';
import { buildDispatchPlan, fleet, jobs } from './dispatch-plan.js';
import { drawFactory } from './factory-scene.js';

const stages = [
  ['指派任务', '距离、任务权重和预计完成时间一起进入指派决策。'],
  ['预约路径', '先比较各车单独走最短路时可能发生的冲突，再给道路分配通行时隙。'],
  ['协调通行', '加急车保留直行路线，回收车改走北侧通道，两车错开通过。'],
  ['完成核对', '按时隙核对完成情况。短任务可以并行先完成，冲突时优先保护高权重任务。']
];

let plan;

export function dispatchView(slide) {
  return `<div class="content project-content dispatch-content">
    ${header(slide.chapter.label, slide.title)}
    <div class="mac-window dispatch-window">
      <div class="window-bar"><span class="traffic"><i></i><i></i><i></i></span><span>自动化工厂 · AGV 调度台</span><small>教学仿真</small></div>
      <div class="dispatch-console">
        <div class="dispatch-visual">
          <canvas class="dispatch-canvas" width="1280" height="740" role="img" aria-label="三维轴测自动化工厂，三台 AGV 在总仓和产线机台的取送点之间搬运"></canvas>
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
      return `<div class="dispatch-task"><b style="--car:${fleet[index].color}">${job.id}</b><span><strong>${job.title}</strong><small>权重 ${job.weight} · AGV ${fleet[index].id}</small><small class="dispatch-transfer">${job.from} → ${job.to}</small></span><small>${done ? '已送达' : stage === 0 ? '已指派' : '已预约'}</small></div>`;
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
