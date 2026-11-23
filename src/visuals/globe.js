import { presentation, places } from '../content.js';

const W = 900;
const H = 450;
const radians = Math.PI / 180;
const locations = Object.values(places);
const coordinates = point => [(point[0] + 180) / 360 * W, (90 - point[1]) / 180 * H];
let world;
let lastFocus = [154, 12];

function getPolygons(topology) {
  const { scale, translate } = topology.transform;
  const arcs = topology.arcs.map(arc => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return coordinates([x * scale[0] + translate[0], y * scale[1] + translate[1]]);
    });
  });
  const land = topology.objects.land;
  const geometries = land.type === 'GeometryCollection' ? land.geometries : [land];
  return geometries.flatMap(geometry => geometry.type === 'Polygon' ? [geometry.arcs] : geometry.arcs)
    .map(polygon => polygon.map(ring => {
      const points = ring.flatMap(index => index < 0 ? [...arcs[~index]].reverse() : arcs[index]);
      const unwrapped = [points[0]];
      for (const [x, y] of points.slice(1)) {
        const lastX = unwrapped.at(-1)[0];
        unwrapped.push([x + Math.round((lastX - x) / W) * W, y]);
      }
      const first = unwrapped[0], end = unwrapped.at(-1);
      if (Math.abs(end[0] - first[0]) > W / 2) {
        const pole = first[1] > H / 2 ? H : 0;
        unwrapped.push([end[0], pole], [first[0], pole]);
      }
      return unwrapped;
    }));
}

function paintBase(polygons) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#142840';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#29455f';
  ctx.lineWidth = .6;
  for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#778a9c');
  gradient.addColorStop(.25, '#547c82');
  gradient.addColorStop(.6, '#396c69');
  gradient.addColorStop(1, '#697f94');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#86a9b6';
  ctx.lineWidth = .7;
  for (const polygon of polygons) {
    for (const shift of [-W, 0, W]) {
      ctx.beginPath();
      for (const ring of polygon) {
        ctx.moveTo(ring[0][0] + shift, ring[0][1]);
        for (const [x, y] of ring.slice(1)) ctx.lineTo(x + shift, y);
        ctx.closePath();
      }
      ctx.fill('evenodd');
      ctx.stroke();
    }
  }
  return { canvas, pixels: ctx.getImageData(0, 0, W, H).data };
}

function loadWorld() {
  world ??= fetch(new URL(presentation.land, document.baseURI))
    .then(response => {
      if (!response.ok) throw new Error('Map asset unavailable');
      return response.json();
    }).then(topology => paintBase(getPolygons(topology))).catch(() => paintBase([]));
  return world;
}

function drawRoute(ctx, active, all) {
  const displayPoints = locations.map(({ coordinates: point }) => coordinates(point));
  ctx.lineWidth = 2.1;
  for (let i = 1; i < displayPoints.length && (all || i <= active); i++) {
    const [x, y] = displayPoints[i - 1];
    const [a, b] = displayPoints[i];
    const end = a + (a - x > W / 2 ? -W : x - a > W / 2 ? W : 0);
    ctx.strokeStyle = i === active || all ? '#a3cbfb' : '#6484a2';
    ctx.setLineDash([4, 5]);
    for (const shift of [-W, 0, W]) {
      ctx.beginPath();
      ctx.moveTo(x + shift, y);
      ctx.quadraticCurveTo((x + end) / 2 + shift, Math.min(y, b) - 37, end + shift, b);
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);
  displayPoints.forEach(([x, y], i) => {
    if (i > active && !all) return;
    if (i === active && !all) {
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.strokeStyle = '#a2c8f1';
      ctx.stroke();
    }
    ctx.fillStyle = i === active || all ? '#ddedfc' : '#94adc6';
    ctx.beginPath();
    ctx.arc(x, y, i === active ? 6 : 3.3, 0, 2 * Math.PI);
    ctx.fill();
  });
}

const resolution = 320;
let disk;
function getDisk() {
  if (disk) return disk;
  disk = [];
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const u = (x + .5 - resolution / 2) / (resolution / 2);
      const v = (resolution / 2 - y - .5) / (resolution / 2);
      const z2 = 1 - u * u - v * v;
      if (z2 <= 0) continue;
      const z = Math.sqrt(z2);
      const light = .61 + Math.max(0, .45 * z - .39 * u + .22 * v);
      disk.push([4 * (y * resolution + x), u, v, z, light, (1 - z) ** 4]);
    }
  }
  return disk;
}

export function mountGlobe(element, locationId, motion, signal, all = false) {
  const location = places[locationId] || places.shanghai;
  const active = locations.indexOf(location);
  const globe = element.querySelector('.globe-canvas');
  const flat = element.querySelector('.atlas-canvas');
  const marker = element.querySelector('.geo-marker');
  const [longitude, latitude] = location.coordinates;
  return loadWorld().then(({ canvas, pixels }) => {
    if (signal.aborted) return;
    const map = flat.getContext('2d');
    flat.width = W;
    flat.height = H;
    map.drawImage(canvas, 0, 0);
    drawRoute(map, active, all);
    if (motion === 'static') return;
    globe.width = globe.height = resolution;
    const ctx = globe.getContext('2d');
    const frame = ctx.createImageData(resolution, resolution);
    const vectors = getDisk();
    const start = lastFocus;
    lastFocus = location.coordinates;
    const delta = (longitude - start[0] + 540) % 360 - 180;
    const initialTime = performance.now();
    const changed = Math.abs(delta) > .01 || Math.abs(latitude - start[1]) > .01;
    function draw(now) {
      if (signal.aborted) return;
      const progress = motion === 'full' && changed ? Math.min(1, (now - initialTime) / 980) : 1;
      const t = 1 - (1 - progress) ** 3;
      const lon = (start[0] + delta * t) * radians;
      const lat = (start[1] + (latitude - start[1]) * t) * radians;
      const cos = Math.cos(lat), sin = Math.sin(lat);
      for (const [i, u, v, z, light, rim] of vectors) {
        const y = Math.asin(v * cos + z * sin);
        const x = lon + Math.atan2(u, z * cos - v * sin);
        const source = 4 * ((Math.min(H - 1, Math.max(0, ((.5 - y / Math.PI) * H) | 0)) * W) +
          ((((.5 + x / (2 * Math.PI)) * W) | 0) + 2 * W) % W);
        frame.data[i] = pixels[source] * light + rim * 48;
        frame.data[i + 1] = pixels[source + 1] * light + rim * 76;
        frame.data[i + 2] = pixels[source + 2] * light + rim * 117;
        frame.data[i + 3] = 255;
      }
      ctx.putImageData(frame, 0, 0);
      const target = latitude * radians;
      const angle = longitude * radians - lon;
      const visible = Math.sin(target) * sin + Math.cos(target) * cos * Math.cos(angle);
      marker.style.left = `${50 + 50 * Math.cos(target) * Math.sin(angle)}%`;
      marker.style.top = `${50 - 50 * (cos * Math.sin(target) - sin * Math.cos(target) * Math.cos(angle))}%`;
      marker.style.opacity = visible > .08 ? '1' : '0';
      if (progress < 1) requestAnimationFrame(draw);
    }
    draw(initialTime);
  });
}

export function globeMarkup(location, all = false) {
  return `<div class="globe-visual" role="img" aria-label="${all ? '南京、美国、澳大利亚和上海的成长轨迹' : '地球定位于' + location.place}">
    <div class="earth-orbit"></div><div class="earth-disc"><canvas class="globe-canvas"></canvas>
    <div class="geo-marker"><b></b><span>${location.label}</span></div></div>
    <canvas class="atlas-canvas"></canvas></div>`;
}
