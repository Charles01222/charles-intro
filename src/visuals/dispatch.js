import { header } from '../ui.js';

export function dispatchView(slide) {
  return `<div class="content project-content dispatch-content">
    ${header('2026– · 上海 · 工厂调度', slide.title)}
    <div class="mac-window dispatch-window">
      <div class="window-bar"><span class="traffic"><i></i><i></i><i></i></span><span>搬运任务调度</span><small>概念示意</small></div>
      <div class="dispatch-layout">
        <svg class="factory" viewBox="0 0 680 280" role="img" aria-label="车辆接单，交汇处先后通过，完成搬运">
          <defs><pattern id="factory-grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0v22" fill="none" stroke="#dbe3ed"/></pattern></defs>
          <rect x="0" y="1" width="680" height="278" rx="16" fill="url(#factory-grid)"/>
          <path d="M94 156H589M332 53V230" stroke="#dce5ef" stroke-width="52" stroke-linecap="round"/>
          <path d="M94 156H589M332 53V230" fill="none" stroke="#aabacc" stroke-dasharray="6 8"/>
          <circle cx="332" cy="156" r="32" fill="#c8d5e6" fill-opacity=".48" stroke="#9badc5" stroke-dasharray="4 5"/>
          <rect x="66" y="130" width="57" height="52" rx="12" fill="#e3eefe" stroke="#82a3d0" stroke-width="2"/>
          <rect x="562" y="130" width="57" height="52" rx="12" fill="#dcf2ee" stroke="#6b9c96" stroke-width="2"/>
          <rect x="307" y="38" width="50" height="40" rx="9" fill="#e7e9f2" stroke="#9cabc0" stroke-width="2"/>
          <rect x="307" y="214" width="50" height="40" rx="9" fill="#e7e9f2" stroke="#9cabc0" stroke-width="2"/>
          <text x="95" y="211" text-anchor="middle">取货</text><text x="590" y="211" text-anchor="middle">交付</text>
          <text x="362" y="116">交汇区</text>
          <g class="factory-cart cart-a"><rect x="-18" y="-12" width="36" height="24" rx="6" fill="#4d73ba"/><rect x="-11" y="-7" width="14" height="14" rx="2" fill="#c0d5fa"/><path d="M10 -4v8" stroke="#fff" stroke-width="2"/></g>
          <g class="factory-cart cart-b"><rect x="-12" y="-18" width="24" height="36" rx="6" fill="#4e998f"/><rect x="-7" y="-5" width="14" height="14" rx="2" fill="#c2eee2"/><path d="M-4 -11h8" stroke="#fff" stroke-width="2"/></g>
        </svg>
        <div class="factory-cues"><div><i></i>真实环境有约束</div><div><i></i>多个对象需要协同</div><div><i></i>系统需要稳定运行</div></div>
      </div>
      <ol class="factory-steps">${['任务出现','车辆接单','路径交汇','协调通行','完成搬运'].map((item, index) => `<li style="--i:${index}">${item}</li>`).join('')}</ol>
    </div>
  </div>`;
}
