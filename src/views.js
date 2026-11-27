import { profile, places } from './content.js';
import { escapeHtml, header, icon } from './ui.js';
import { globeMarkup } from './visuals/globe.js';

const name = () => `${escapeHtml(profile.name)} <span>/</span> ${escapeHtml(profile.englishName)}`;

export function intro(slide) {
  return `<div class="hero content ${slide.identity ? 'hero-opening' : 'departure'}${slide.portrait ? ' has-portrait' : ''}">
    <div class="hero-copy">
      <div class="eyebrow"><i></i> ${escapeHtml(slide.chapter.label)}</div>
      ${slide.identity ? `<h1>${escapeHtml(profile.name)} <small>/ ${escapeHtml(profile.englishName)}</small></h1>` :
        `<p class="hero-name">${name()}</p><h1>${escapeHtml(slide.title)}</h1>`}
      ${slide.line ? `<p class="hero-line rise">${escapeHtml(slide.line)}</p>` : ''}
    </div>
    ${slide.portrait ? `<figure class="opening-portrait"><img src="${escapeHtml(profile.portrait)}" width="640" height="931" alt="李宜阳的证件照"></figure>` : ''}
    ${slide.subtitle ? `<p class="opening-subtitle rise">${escapeHtml(slide.subtitle)}</p>` : ''}
  </div>`;
}

function journeyStory(story) {
  return `<div class="journey-story${story.photo ? ' has-life-photo' : ''}">
    ${story.photo ? `<img class="journey-life-photo" src="${escapeHtml(story.photo)}" alt="${escapeHtml(story.photoAlt)}">` : ''}
    <ul>${story.beats.map(beat => `<li>${escapeHtml(beat)}</li>`).join('')}</ul>
    <img class="journey-illustration" src="${escapeHtml(story.illustration)}" alt="">
  </div>`;
}

export function mapView(slide) {
  const loc = places[slide.location];
  const entries = Object.entries(places);
  const current = entries.findIndex(([id]) => id === slide.location);
  return `<div class="content journey">
    <div class="journey-split">
      <div class="journey-copy${slide.story ? ' has-story' : ''}">
        <div class="eyebrow"><i></i> ${escapeHtml(slide.chapter.label)}</div>
        <div class="coordinates">${escapeHtml(loc.alias)}</div>
        <div class="location-name">${icon('pin', 22)} ${escapeHtml(loc.place)} <span>${escapeHtml(loc.year)}</span></div>
        <h1>${escapeHtml(slide.title)}</h1>
        ${slide.story ? journeyStory(slide.story) : `<p>${escapeHtml(slide.line || loc.detail)}</p>`}
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
  return `<div class="content ending">
    <div class="folio-spread">
      <div class="folio-page folio-left">
        ${header(slide.chapter.label, slide.title)}
        <div class="folio-identity">
          <p class="folio-name">${name()}</p>
          <a href="mailto:${escapeHtml(profile.email)}">${icon('mail', 18)}<span>${escapeHtml(profile.email)}</span></a>
        </div>
      </div>
      <div class="folio-page folio-right">
        <figure class="folio-qr">
          <img src="${escapeHtml(qr.image)}" width="734" height="734" alt="李宜阳的微信联系二维码">
          <figcaption>${escapeHtml(qr.label)}</figcaption>
        </figure>
        <p>${escapeHtml(profile.invitation)}</p>
      </div>
      <div class="folio-turn" aria-hidden="true"><div class="folio-cover"></div><div class="folio-cover-lining"></div></div>
    </div>
  </div>`;
}

export function transitionView(type) {
  if (type === 'arrival') return `<div class="cinematic arrival" aria-hidden="true"><div class="cinema-galaxy"><i></i></div></div>`;
  return `<div class="cinematic folio-transition" aria-hidden="true">
    <div class="folio-route">
      ${globeMarkup(places.shanghai, true)}
      <p>南京 · 美国 · 墨尔本 · 上海</p>
    </div></div>`;
}
