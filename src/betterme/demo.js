import { betterMe } from '../content.js';
import { escapeHtml, header, icon } from '../ui.js';
import { DEMO_ATS_SAMPLE, diagnoseAtsResume } from './ats-diagnostics.js';

export function betterMeView(slide) {
  return `<div class="content project-content better-content">
    ${header('BetterMe · 职业工作台', slide.title)}
    <div class="better-layout">
      <div class="mac-window better-window">
        <div class="window-bar"><span class="traffic"><i></i><i></i><i></i></span><span>BetterMe · ${betterMe.demo}</span>
        <div class="demo-actions">
          <button data-demo="fallback" type="button">简明视图</button>
          <button data-demo="reset" type="button" title="复位示例与诊断">${icon('replay', 14)} 复位</button>
          <button data-action="next" type="button">返回主线</button>
        </div></div>
        <div id="ats-host" class="ats-host"><p class="ats-loading" role="status">正在打开本地诊断…</p></div>
        <div class="demo-disclaimer"><i></i>浏览器本地规则 · 评分表示文本就绪度<span>数据仅作演示</span></div>
      </div>
      <aside class="product-cues" aria-label="产品讲述提示">${betterMe.cues.map(([label, line]) => `<div><h2>${label}</h2><p>${line}</p></div>`).join('')}
      <a href="${escapeHtml(betterMe.source)}" target="_blank" rel="noopener noreferrer">查看 agent-os 源码 ${icon('external', 14)}</a></aside>
    </div>
  </div>`;
}

function compactDemo(host) {
  host.innerHTML = `<div class="compact-demo"><div class="compact-fields">
    <button class="ats-button ats-secondary" type="button" data-sample>载入示例</button>
    <label>简历纯文本<textarea aria-label="简历纯文本" maxlength="18000" spellcheck="false"></textarea></label>
    <label>目标岗位<textarea aria-label="目标岗位" maxlength="10000" spellcheck="false"></textarea></label>
    </div><div class="compact-result" aria-live="polite"></div></div>`;
  const [resume, jd] = host.querySelectorAll('textarea');
  const result = host.querySelector('.compact-result');
  function run() {
    if (!resume.value.trim()) {
      result.innerHTML = '<p>载入虚构履历和岗位，即可查看诊断。</p>';
      return;
    }
    const report = diagnoseAtsResume({ resumeText: resume.value, jdText: jd.value });
    const tokens = values => values.map(value => `<span>${escapeHtml(value)}</span>`).join('') || '暂无';
    result.innerHTML = `<div class="compact-score"><strong>${report.overallScore}</strong> / 100 <span>文本就绪度</span></div>
      <div><h3>已匹配</h3><div class="compact-tokens">${tokens(report.matchedKeywords)}</div></div>
      <div><h3>待核对的岗位词项</h3><div class="compact-tokens missing">${tokens(report.missingKeywords)}</div></div>
      <div><h3>下一步改进</h3><p>${report.missingKeywords.length ? '对照岗位缺口，先核对是否已有真实经历可补充。' : ''} ${escapeHtml(report.findings.find(item => item.severity !== 'pass')?.detail.zh || '检查每项经历是否有清楚、真实的事实依据。')}</p></div>`;
  }
  host.querySelector('[data-sample]').onclick = () => {
    resume.value = DEMO_ATS_SAMPLE.zh.resumeText;
    jd.value = DEMO_ATS_SAMPLE.zh.jdText;
    run();
  };
  [resume, jd].forEach(area => area.addEventListener('input', run));
  run();
}

export function attachDemo(scene, signal) {
  let dispose = () => {};
  let activeRevision = 0;
  let compact = false;
  const host = scene.querySelector('#ats-host');
  const mode = scene.querySelector('[data-demo="fallback"]');
  const reset = scene.querySelector('[data-demo="reset"]');

  async function mount() {
    const revision = ++activeRevision;
    dispose();
    dispose = () => {};
    host.scrollTop = 0;
    host.replaceChildren();
    mode.textContent = compact ? '原版视图' : '简明视图';
    if (compact) {
      compactDemo(host);
      return;
    }
    try {
      const { mountAts } = await import(new URL(betterMe.demoModule, document.baseURI));
      if (!signal.aborted && revision === activeRevision) dispose = mountAts(host);
    } catch {
      if (!signal.aborted && revision === activeRevision) {
        compact = true;
        mode.textContent = '原版视图';
        compactDemo(host);
      }
    }
  }

  mode.onclick = () => { compact = !compact; mount(); };
  reset.onclick = mount;
  signal.addEventListener('abort', () => dispose(), { once: true });
  mount();
}
