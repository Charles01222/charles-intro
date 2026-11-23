import { profile, places } from './content.js';
import { escapeHtml, header, icon } from './ui.js';
import { globeMarkup } from './visuals/globe.js';

const name = () => `${escapeHtml(profile.name)} <span>/</span> ${escapeHtml(profile.englishName)}`;

export function intro(slide) {
  return `<div class="hero content ${['perspectives', 'departure'].includes(slide.id) ? 'departure' : ''}">
    <div class="hero-copy">
      <div class="eyebrow"><i></i> ${escapeHtml(slide.chapter.label)}</div>
      <p class="hero-name">${name()}</p>
      <h1>${escapeHtml(slide.title)}</h1>
      ${slide.line ? `<p class="hero-line rise">${escapeHtml(slide.line)}</p>` : ''}
    </div>
  </div>`;
}

export function mapView(slide) {
  const loc = places[slide.location];
  const entries = Object.entries(places);
  const current = entries.findIndex(([id]) => id === slide.location);
  return `<div class="content journey">
    <div class="journey-split">
      <div class="journey-copy">
        <div class="eyebrow"><i></i> ${escapeHtml(slide.chapter.label)}</div>
        <div class="coordinates">${escapeHtml(loc.alias)}</div>
        <div class="location-name">${icon('pin', 22)} ${escapeHtml(loc.place)} <span>${escapeHtml(loc.year)}</span></div>
        <h1>${escapeHtml(slide.title)}</h1>
        ${slide.line || slide.location !== 'nanjing' ? `<p>${escapeHtml(slide.line || loc.detail)}</p>` : ''}
      </div>
      ${globeMarkup(loc)}
    </div>
    <nav class="journey-nodes" aria-label="成长地点">${entries.map(([id, point], index) => `
      <button class="journey-node ${index < current ? 'visited' : ''}" data-go="${escapeHtml(id)}" ${index === current ? 'aria-current="step"' : ''}><i></i>
      <span>${escapeHtml(point.year)}</span><strong>${escapeHtml(point.label)}</strong><small>${escapeHtml(point.detail)}</small></button>`).join('')}</nav>
    </div>`;
}

export function wrapView(slide, label, symbol, details = []) {
  return `<div class="content synthesis"><div class="wrap-icon">${icon(symbol, 55)}</div>
    ${header(label, slide.title, slide.line)}
    ${details.length ? `<ol class="wrap-sequence">${details.map(item => `<li>${item}</li>`).join('')}</ol>` : ''}
  </div>`;
}

export function endingView(slide) {
  const { qr } = profile;
  return `<div class="hero content ending"><div class="hero-copy">
    ${header(slide.chapter.label, slide.title)}
    <div class="contact-card">
      <div class="contact-info"><div class="contact-icon">${icon('mail', 24)}</div>
        <div class="contact-name">${name()}</div>
        <a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>
        <p>${escapeHtml(profile.invitation)}</p>
      </div>
      <div class="qr-box">
        ${qr.image ? `<div class="qr-tile"><img src="${escapeHtml(qr.image)}" alt="${escapeHtml(qr.label || '联系二维码')}"></div>` :
          `<div class="qr-tile qr-placeholder">${icon('qr', 32)}<span>二维码预留</span></div>`}
        ${qr.label ? `<small>${escapeHtml(qr.label)}</small>` : ''}
      </div>
    </div>
  </div><div class="blank-book" aria-hidden="true"><i></i><i></i></div></div>`;
}

export function transitionView(type) {
  if (type === 'arrival') return `<div class="cinematic arrival" aria-hidden="true"><div class="cinema-galaxy"><i></i></div></div>`;
  return `<div class="cinematic universe" aria-hidden="true">
    <div class="universe-route">${globeMarkup(places.shanghai, true)}<div>南京 · 美国 · 澳洲 · 上海</div></div>
    <div class="fingertip">
      <div class="small-universe"></div>
      <svg viewBox="0 0 420 240" fill="none" aria-hidden="true"><defs><linearGradient id="hand-fade" x1="200" y1="85" x2="340" y2="224" gradientUnits="userSpaceOnUse"><stop stop-color="#c0d7ff"/><stop offset="1" stop-color="#334b72" stop-opacity="0"/></linearGradient></defs>
      <path d="M413 225c-35-14-55-25-82-54-17-18-34-36-62-35l-46 4c-11 1-20 7-18 14 2 7 6 9 21 8l23-2m106 61c-13-3-28-7-44-19l-44-32c-12-8-26-10-42-8l-65 10c-10 1-22-1-29-8l-46-47c-8-8-21-10-26-2-4 6 0 12 7 22l41 52c13 17 31 25 52 23l69-5" stroke="url(#hand-fade)" stroke-linecap="round" stroke-width="2.4"/>
      <path d="m209 155-55-1-37-30c-8-7-16-9-23-5m123 45-57-1-26-22" stroke="url(#hand-fade)" stroke-linecap="round" stroke-width="1.5"/>
      </svg>
    </div></div>`;
}
