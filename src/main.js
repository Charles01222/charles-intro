import { presentation, profile, slides } from './content.js';
import { escapeHtml, icon } from './ui.js';
import { intro, mapView, wrapView, endingView, transitionView } from './views.js';
import { mountGlobe } from './visuals/globe.js';
import { researchView } from './visuals/research.js';
import { dispatchView, mountDispatch } from './visuals/dispatch.js';
import { betterMeView, mountWorkbench } from './betterme/workbench.js';

const screen = document.querySelector('#app');
const hasPresenterNotes = document.documentElement.dataset.audience === 'presenter';
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* The presentation works without storage. */ } }
};
const channel = 'yiyang-next-orbit-slide';
const systemReduced = matchMedia('(prefers-reduced-motion: reduce)');
const preferredMotion = ['system', 'full', 'reduced', 'static'];
const betterMeLinks = { '#betterme-career': 'career', '#betterme-practice': 'practice', '#betterme-wrap': 'overview' };
const currentRoute = () => {
  const hash = window.location.hash;
  const target = ['#team', '#collaborate'].includes(hash) ? '#ending' : Object.hasOwn(betterMeLinks, hash) ? '#betterme' : hash;
  const index = slides.findIndex(slide => '#' + slide.id === target);
  return index < 0 ? 0 : index;
};
let index = currentRoute();
let mode = storage.get('yiyang-orbit-motion') || presentation.defaultMotion;
if (!preferredMotion.includes(mode)) mode = 'system';
let controller, cinemaController, cinemaTimer;
let controlsHidden = false;
let menu = '';
let notesWindow;
let focusedAction;

const automatic = () => navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency < 4 ? 'static'
  : systemReduced.matches ? 'reduced' : 'full';
const motion = () => mode === 'system' ? automatic() : mode;

const views = {
  intro,
  map: mapView,
  research: researchView,
  'research-wrap': slide => wrapView(slide, '研究收束', 'fingerprint', ['行为', '表示', '规律', '决策']),
  betterme: betterMeView,
  dispatch: dispatchView,
  ending: endingView
};

function actionButton(action, label, symbol, extra = '') {
  return `<button type="button" class="quiet button-${action}" data-action="${action}" title="${label}" aria-label="${label}" ${extra}>${icon(symbol, 18)}<span>${label}</span></button>`;
}

screen.innerHTML = `<div class="space-backdrop" aria-hidden="true"></div>
  <header class="top is-control">
    <div class="brand"><span class="brand-icon">${icon('orbit', 25)}</span><div><strong>${escapeHtml(profile.name)} <span>/</span> ${escapeHtml(profile.englishName)}</strong><small>${escapeHtml(profile.event)}</small></div></div>
    <div class="top-actions">
      ${actionButton('chapters', '章节', 'grid', 'aria-expanded="false" aria-controls="control-menu"')}
      ${hasPresenterNotes ? actionButton('notes', '备注', 'notes') : ''}
      ${actionButton('settings', '设置', 'settings', 'aria-expanded="false" aria-controls="control-menu"')}
      ${actionButton('fullscreen', '全屏', 'fullscreen', 'aria-pressed="false"')}
    </div>
  </header>
  <main id="stage" tabindex="-1"></main>
  <div id="cinematic"></div>
  <div class="control-menu is-control" id="control-menu" hidden></div>
  <footer class="bottom is-control">
    <nav class="chapters" aria-label="章节进度"></nav>
    <div class="bottom-actions"></div>
  </footer>
  <button class="restore-controls" data-action="hide" type="button" aria-label="显示演讲控制" title="显示演讲控制 (H)" hidden>${icon('settings', 19)}</button>
  <span class="sr-only" role="status" id="status"></span>`;

const stage = screen.querySelector('#stage');
const controls = screen.querySelector('.bottom-actions');
const buttons = screen.querySelector('.chapters');
buttons.style.setProperty('--chapter-count', presentation.chapters.length);
const cineHost = screen.querySelector('#cinematic');
const controlMenu = screen.querySelector('#control-menu');
const status = screen.querySelector('#status');

function updateMenu() {
  controlMenu.hidden = !menu || controlsHidden;
  screen.querySelectorAll('.top [aria-expanded]').forEach(button => button.setAttribute('aria-expanded', String(menu === button.dataset.action)));
  if (controlMenu.hidden) return;
  if (menu === 'chapters') {
    controlMenu.innerHTML = `<h2>章节导航</h2><div class="menu-list">${presentation.chapters.map(chapter =>
      `<button data-go="${escapeHtml(chapter.slides[0].id)}" type="button"><span>${escapeHtml(chapter.label)}</span><small>${Math.floor(chapter.seconds / 60)}:${String(chapter.seconds % 60).padStart(2, '0')}</small></button>`).join('')}</div>`;
  } else {
    const modes = [['system', '跟随设备'], ['full', '完整动效'], ['reduced', '减弱动效'], ['static', '静态星空与二维地图']];
    controlMenu.innerHTML = `<h2>演讲设置</h2><fieldset><legend>动效强度</legend>${modes.map(([value, label]) =>
      `<label><input type="radio" name="motion" value="${value}" ${mode === value ? 'checked' : ''}> ${label}</label>`).join('')}</fieldset>
      <div class="shortcuts"><span>← / →　上一步 / 下一步</span><span>R　重播　 ·　 S　跳过动画</span><span>F　全屏　 ·　 H　隐藏控件</span></div>`;
  }
}

function updateControls() {
  const slide = slides[index];
  buttons.innerHTML = presentation.chapters.map((chapter, i) => `<button type="button" data-go="${escapeHtml(chapter.slides[0].id)}"
    class="${i < slide.chapterIndex ? 'past' : ''}" ${i === slide.chapterIndex ? 'aria-current="step"' : ''}><i></i><span>${escapeHtml(chapter.label)}</span></button>`).join('');
  const last = index === slides.length - 1;
  const label = slide.action || '下一步';
  controls.innerHTML = `<div class="utility">
    ${actionButton('replay', '重播', 'replay')}
    ${actionButton('skip', '跳过动画', 'skip')}
    ${actionButton('hide', '隐藏控件', 'hide')}
  </div><div class="navigation">
    ${actionButton('prev', '上一步', 'prev', index === 0 ? 'disabled' : '')}
    <button type="button" class="primary" data-action="next" ${last ? 'hidden' : ''}>${escapeHtml(label)}${icon('next', 19)}</button>
  </div>`;
  updateMenu();
}

function finishCinema() {
  cinemaController?.abort();
  clearTimeout(cinemaTimer);
  cineHost.replaceChildren();
  screen.classList.remove('cinema-active');
}

function cinema(type, currentMotion) {
  finishCinema();
  cinemaController = new AbortController();
  cineHost.innerHTML = transitionView(type);
  screen.classList.add('cinema-active');
  if (type === 'folio') mountGlobe(cineHost, 'shanghai', currentMotion === 'static' ? 'static' : 'reduced', cinemaController.signal, true);
  const duration = type === 'folio'
    ? (currentMotion === 'full' ? 2690 : 900)
    : (currentMotion === 'full' ? 1170 : 650);
  cinemaTimer = setTimeout(finishCinema, duration);
}

function render({ animate = true, transition = false, preserveMenu = false } = {}) {
  finishCinema();
  controller?.abort();
  controller = new AbortController();
  const slide = slides[index];
  if (!preserveMenu) menu = '';
  const currentMotion = animate ? motion() : motion() === 'static' ? 'static' : 'reduced';
  screen.dataset.motion = currentMotion;
  screen.toggleAttribute('data-skipped', !animate);
  screen.dataset.view = slide.view;
  screen.style.setProperty('--galaxy', `url("${new URL(presentation.galaxy, document.baseURI).href}")`);
  stage.innerHTML = views[slide.view](slide);
  if (slide.view === 'map') mountGlobe(stage, slide.location, currentMotion, controller.signal);
  if (slide.view === 'betterme') mountWorkbench(stage, controller.signal, betterMeLinks[location.hash]);
  if (slide.view === 'dispatch') mountDispatch(stage, { signal: controller.signal, motion: currentMotion, animate });
  if (transition && animate && slide.transition) cinema(slide.transition, currentMotion);
  updateControls();
  storage.set(channel, slide.id);
  if (notesWindow && !notesWindow.closed) notesWindow.postMessage({ slide: slide.id }, location.origin);
  status.textContent = `${slide.chapter.label}，${slide.title}`;
  if (focusedAction) {
    (controls.querySelector(`[data-action="${focusedAction}"]:not(:disabled):not([hidden])`) || stage).focus({ preventScroll: true });
    focusedAction = '';
  }
}

function go(target, transition = false) {
  if (target < 0 || target >= slides.length) return;
  if (target === index) {
    menu = '';
    updateMenu();
    return;
  }
  index = target;
  history.pushState(null, '', '#' + slides[index].id);
  render({ transition });
}

function openNotes() {
  const url = new URL('./notes.html', document.baseURI);
  url.hash = slides[index].id;
  notesWindow = open(url, 'yiyang_presenter_notes', 'popup,width=740,height=770');
  if (!notesWindow) status.textContent = '浏览器阻止了备注窗口，请允许弹窗后再次打开。';
  else notesWindow.focus();
}

function act(action) {
  switch (action) {
    case 'next': go(index + 1, true); break;
    case 'prev': go(index - 1); break;
    case 'replay': render({ transition: true }); break;
    case 'skip':
      if (slides[index].view === 'betterme') finishCinema();
      else render({ animate: false });
      break;
    case 'chapters':
    case 'settings':
      menu = action === menu ? '' : action;
      updateMenu();
      if (menu) controlMenu.querySelector('button, input')?.focus({ preventScroll: true });
      break;
    case 'fullscreen':
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {
        status.textContent = '此窗口无法进入全屏。';
      });
      break;
    case 'hide':
      controlsHidden = !controlsHidden;
      screen.classList.toggle('hide-controls', controlsHidden);
      screen.querySelector('.restore-controls').hidden = !controlsHidden;
      menu = '';
      updateMenu();
      break;
    case 'notes': openNotes(); break;
  }
}

screen.addEventListener('click', event => {
  const control = event.target.closest('button[data-action], button[data-go]');
  if (!control || control.disabled) {
    if (menu && !controlMenu.contains(event.target)) { menu = ''; updateMenu(); }
    return;
  }
  const move = control.dataset.go;
  if (move) go(slides.findIndex(slide => slide.id === move));
  else {
    const action = control.dataset.action;
    if (controls.contains(control) && ['prev', 'next', 'skip', 'replay'].includes(action)) focusedAction = action;
    act(action);
    focusedAction = '';
  }
});

controlMenu.addEventListener('change', event => {
  if (event.target.name !== 'motion') return;
  mode = event.target.value;
  storage.set('yiyang-orbit-motion', mode);
  // Avoid replacing active demo inputs purely to change animation settings.
  if (slides[index].view === 'betterme') screen.dataset.motion = motion();
  else render({ preserveMenu: true });
  controlMenu.querySelector('input:checked')?.focus({ preventScroll: true });
});

const keys = { ArrowRight: 'next', ArrowDown: 'next', PageDown: 'next', ArrowLeft: 'prev', ArrowUp: 'prev', PageUp: 'prev', r: 'replay', s: 'skip', f: 'fullscreen', h: 'hide' };
window.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]')) return;
  if (event.key === 'Escape' && menu) {
    const action = menu;
    menu = '';
    updateMenu();
    screen.querySelector(`.top [data-action="${action}"]`)?.focus();
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat ||
      event.target.closest('textarea, input, select, [contenteditable], [role="textbox"]')) return;
  const action = keys[event.key] || keys[event.key.toLowerCase()];
  if (!action) return;
  event.preventDefault();
  act(action);
});
window.addEventListener('hashchange', () => {
  const target = currentRoute();
  if (index !== target || slides[target].view === 'betterme') { index = target; render(); }
});
document.addEventListener('fullscreenchange', () => {
  screen.querySelector('[data-action="fullscreen"]').setAttribute('aria-pressed', String(!!document.fullscreenElement));
});
systemReduced.addEventListener('change', () => {
  if (mode === 'system' && slides[index].view !== 'betterme') render();
});

render();
