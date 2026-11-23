export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const paths = {
  orbit: '<ellipse cx="12" cy="12" rx="10" ry="5.4" transform="rotate(-35 12 12)"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="19.3" cy="5.3" r="1.5" fill="currentColor" stroke="none"/>',
  next: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  prev: '<path d="M19 12H5m6 6-6-6 6-6"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  fullscreen: '<path d="M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5"/>',
  notes: '<path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 5h6m-6 4h6m-6 4h4"/>',
  replay: '<path d="M3 11a9 9 0 1 1 1.5 6M3 5v6h6"/>',
  skip: '<path d="m4 6 7 6-7 6zm9 0 7 6-7 6z"/>',
  hide: '<path d="M5 12h14"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="#131e32"/><circle cx="15" cy="17" r="2" fill="#131e32"/>',
  fingerprint: '<path d="M4 11a8 8 0 1 1 16 0c0 4-.7 7-2 9M7 11a5 5 0 0 1 10 0c0 4-.7 7-2.4 10M10 11a2 2 0 1 1 4 0c0 5-1.2 8-3 10M7 14c0 2-.8 3.7-2 5m5-5c0 2.8-.9 5.1-2.1 6.4"/>',
  window: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18m-14-2h.1m3 0h.1m-3 6h6m-6 3h10"/>',
  route: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H17a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h8.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  qr: '<path d="M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5"/>',
  pin: '<path d="M18 10c0 4-6 9-6 9s-6-5-6-9a6 6 0 1 1 12 0Z"/><circle cx="12" cy="10" r="2"/>',
  external: '<path d="M13 5h6v6m0-6-8 8m6 1v5H5V7h5"/>',
  person: '<circle cx="12" cy="8" r="3"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/>',
  scan: '<path d="M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5m3-3h10"/>',
  spark: '<path d="m12 3 2.1 6.9L21 12l-6.9 2.1L12 21l-2.1-6.9L3 12l6.9-2.1z"/>',
  check: '<path d="m5 12 4 4L19 6"/>'
};

export const icon = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;

export function header(label, title, line = '') {
  return `<header class="section-head"><div class="eyebrow"><i></i>${escapeHtml(label)}</div>
    <h1>${escapeHtml(title)}</h1>${line ? `<p>${escapeHtml(line)}</p>` : ''}</header>`;
}
