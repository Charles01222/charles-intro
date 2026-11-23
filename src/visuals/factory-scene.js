import { fleet, jobs, onRoad } from './dispatch-plan.js';

const field = { width: 9, height: 7 };
const trackPoint = (path, step) => path[Math.min(step, path.length - 1)];
const equalPoint = (a, b) => a[0] === b[0] && a[1] === b[1];

export function drawFactory(context, data, stage, time) {
  const { width, height } = context.canvas;
  const background = context.createRadialGradient(width * .49, height * .33, 30, width * .49, height * .42, width * .62);
  background.addColorStop(0, '#2a4459');
  background.addColorStop(.66, '#132a3c');
  background.addColorStop(1, '#0b1a28');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  const project = (x, y, z = 0) => [486 + 88 * (x - .64 * y), 174 + 34 * (x + y) - z * 62];

  function mark(points, closed) {
    context.beginPath();
    context.moveTo(...project(...points[0]));
    for (const point of points.slice(1)) context.lineTo(...project(...point));
    if (closed) context.closePath();
  }

  function polygon(points, color, outline) {
    mark(points, true);
    context.fillStyle = color;
    context.fill();
    if (outline) { context.strokeStyle = outline; context.lineWidth = 1.2; context.stroke(); }
  }

  function path(points, color, thickness, dash = []) {
    mark(points, false);
    context.strokeStyle = color;
    context.lineJoin = context.lineCap = 'round';
    context.lineWidth = thickness;
    context.setLineDash(dash);
    context.stroke();
    context.setLineDash([]);
  }

  function rect(x, y, w, d, color, z = 0, stroke) {
    polygon([[x-w,y-d,z],[x+w,y-d,z],[x+w,y+d,z],[x-w,y+d,z]], color, stroke);
  }

  function box(x, y, w, d, h, colors, floor = 0, angle = 0) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const point = ([u,v], z) => [x+u*cos-v*sin,y+u*sin+v*cos,z];
    const corners = [[-w,-d],[w,-d],[w,d],[-w,d]];
    const low = corners.map(c => point(c, floor));
    const high = corners.map(c => point(c, floor + h));
    const visible = corners.map((_, i) => {
      const j = (i + 1) % corners.length;
      return { i, j, depth: (low[i][0] + low[i][1] + low[j][0] + low[j][1]) / 2 };
    }).sort((a, b) => a.depth - b.depth).slice(2);
    for (const {i,j} of visible) polygon([low[i],low[j],high[j],high[i]], colors[1 + i % 2]);
    polygon(high, colors[0], '#dceaff36');
  }

  function tag(point, label, tone, svgSize = 17) {
    const [x, y] = project(...point);
    context.font = `700 ${svgSize}px system-ui,sans-serif`;
    const w = context.measureText(label).width + 15;
    context.fillStyle = '#122635f4';
    context.beginPath();
    context.roundRect(x - w/2, y - svgSize - 3, w, svgSize + 9, 5);
    context.fill();
    context.fillStyle = tone;
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.fillText(label, x, y);
  }

  function steelRack(x, y, loaded) {
    rect(x+.05,y+.07,.37,.41,'#10233388');
    const steel = ['#8494a4','#4c647c','#334b62'];
    const crate = ['#d6ae75','#9a724b','#765638'];
    for (const level of [.03, .48, .90]) {
      box(x,y,.34,.32,.065,steel,level);
      if (loaded || level !== .48) {
        box(x-.12,y+.03,.10,.18,.23,crate,level+.07);
        box(x+.14,y-.04,.09,.14,.19,['#a7bdc4','#657d8d','#4b6172'],level+.07);
      }
    }
    for (const dx of [-.33,.33]) for (const dy of [-.30,.30]) {
      box(x+dx,y+dy,.025,.025,1.06,steel);
    }
    path([[x-.33,y+.32,.95],[x+.33,y+.32,.95]], '#e0ad66', 3.4);
  }

  function machine(x, y, tone) {
    rect(x+.04,y+.07,.44,.44,'#091c2e55');
    box(x,y,.39,.40,.09,['#84929f','#526371','#374958']);
    box(x-.04,y-.07,.32,.31,.78,['#dce5e9','#8d9fac','#647b8c'],.10);
    box(x-.07,y+.245,.20,.024,.33,['#527a8b','#2b5269','#254357'],.31);
    path([[x-.19,y+.274,.55],[x-.02,y+.274,.55]], '#94c8d2', 2.3);
    box(x+.25,y+.235,.065,.036,.28,['#637f8b','#304856','#253d50'],.38);
    path([[x+.21,y+.274,.57],[x+.29,y+.274,.57]], tone, 3.5);
    box(x-.18,y-.20,.033,.033,.16,['#f1c370','#b18b45','#8d6b3b'],.88);
    box(x-.18,y-.20,.037,.037,.065,['#8ee7bd','#4d9f7c','#327f6a'],1.04);
    path([[x-.30,y+.245,.18],[x+.27,y+.245,.18]], '#e0a05a', 3.4);
  }

  function conveyor(x, y) {
    const steel = ['#7f94a2','#435b6d','#324b5c'];
    box(x,y,.36,.23,.08,steel,.22);
    for (const dx of [-.29,-.19,-.09,.01,.11,.21,.31]) {
      path([[x+dx,y-.19,.31],[x+dx,y+.19,.31]], '#b9c7cb', 2.5);
    }
    for (const dx of [-.26,.26]) box(x+dx,y,.042,.16,.22,steel);
  }

  function trolley(x, y, rotation, tone, loaded, emptyPallet) {
    const cos = Math.cos(rotation), sin = Math.sin(rotation);
    const position = (u,v) => [x+u*cos-v*sin,y+u*sin+v*cos];
    const component = (u,v,w,d,h,colors,z) => box(...position(u,v),w,d,h,colors,z,rotation);
    const rim = [[-.40,-.29],[.42,-.29],[.42,.29],[-.40,.29]].map(([u,v]) => position(u,v));
    polygon(rim, '#0a1929b5');
    const tires = ['#314050','#142333','#0f1b2a'];
    for (const u of [-.22,.22]) for (const v of [-.22,.22]) component(u,v,.085,.045,.085,tires,.015);
    component(0,0,.33,.218,.09,['#4f626f','#202f3d','#192634'],.06);
    component(-.02,0,.28,.205,.125,['#aebbc4','#697d8c','#465e73'],.145);
    component(.285,0,.041,.198,.08,['#d5a259','#8d643d','#745638'],.130);
    component(-.304,0,.028,.192,.062,['#d5a259','#8d643d','#745638'],.116);
    component(.20,0,.045,.082,.045,['#172d41','#172831','#101b2a'],.276);
    for (const v of [-.142,.142]) component(.326,v,.010,.031,.020,['#d5f5fe','#a9e3ef','#7dc0d2'],.185);
    component(-.06,0,.093,.031,.009,[tone,tone,tone],.271);
    if (loaded) {
      const wood = ['#dfbd8b','#9f7650','#805f43'];
      for (const v of [-.12,0,.12]) component(-.07,v,.17,.035,.054,wood,.271);
      if (!emptyPallet) {
        component(-.07,0,.135,.134,.20,['#dcb77d','#a37e52','#85643e'],.326);
        component(-.025,0,.018,.134,.01,['#ead4ac','#b09975','#a08461'],.526);
      }
    }
  }

  box(4,3,4.62,3.62,.16,['#41576a','#172b42','#293e57'],-.25);
  box(4,3,4.59,3.59,.11,['#637b8c','#354e63','#233d54'],-.11);
  for (let y=0; y<field.height; y++) {
    for (let x=0; x<field.width; x++) {
      const road = onRoad(x,y);
      rect(x,y,.492,.492,road ? ((x+y)%2 ? '#5b7180' : '#576f7e') : '#344e62',.004,'#a9bcc21e');
      if (!road) rect(x,y,.40,.40,'#263f54',.008,'#98afbe42');
      if (road && y%2===0 && x%2===1) path([[x-.32,y,.013],[x+.32,y,.013]], '#c3d2d393', 1.6, [5,5]);
      if (road && x%2===0 && y%2===1) path([[x,y-.32,.013],[x,y+.32,.013]], '#c3d2d393', 1.6, [5,5]);
    }
  }
  path([[-.51,-.51,.022],[8.51,-.51,.022],[8.51,6.51,.022],[-.51,6.51,.022],[-.51,-.51,.022]], '#ccd7d58c', 1.7);
  path([[1.03,.58,.024],[.58,.58,.024],[.58,1.44,.024],[1.43,1.44,.024]], '#e0b16b', 2.3);
  path([[6.53,3.52,.022],[7.46,3.52,.022],[7.46,5.48,.022],[6.56,5.48,.022]], '#b1d6d2', 2.2);

  for (const [x,y] of [[4,2],[6,2],[8,4],[2,0],[0,2],[2,2],[6,0]]) {
    for (const offset of [-.22,-.08,.06,.20]) path([[x-.37,y+offset,.023],[x-.25,y+offset,.023]], '#dfe6e489', 2.4);
  }
  if (stage === 1) data.baseline.forEach(route => path(route, '#e8c39e9e', 3.2, [5,7]));
  if (stage >= 1) data.routes.forEach((route, i) => {
    path(route, '#17293786', 7.4);
    path(route, fleet[i].color + (stage === 1 ? 'cc' : 'a6'), 4.0);
  });

  const objects = [
    [1,1,() => steelRack(1,1,true)], [3,1,() => steelRack(3,1,false)],
    [5,1,() => machine(5,1,'#99e2ca')], [7,1,() => conveyor(7,1)],
    [7,3,() => machine(7,3,'#82d4e3')], [7,5,() => conveyor(7,5)],
    [1,5,() => steelRack(1,5,false)], [3,5,() => machine(3,5,'#91ded0')],
    [5,5,() => conveyor(5,5)], [3,3,() => conveyor(3,3)]
  ].map(([x,y,paint]) => ({ depth:x+y, paint }));

  [[1,1,1.42,'总仓'],[5,1,1.46,'产线 01'],[7,3,1.48,'产线 02']].forEach(([x,y,z,label]) =>
    objects.push({ depth:x+y+.40, paint:() => tag([x,y,z],label,'#edf2f8',20) }));

  for (const job of jobs) {
    for (const [kind, point] of [['取',job.pickup],['送',job.drop]]) {
      const [x,y]=point;
      rect(x,y,.29,.27,kind === '取' ? '#f1ca8836' : '#8fe3ce2b',.029, kind === '取' ? '#efc485de' : '#8fe3cecf');
      const id = job.id + ' ' + kind;
      objects.push({depth:x+y+.12,paint:() => tag([x,y,.35],id,'#f6e2ae',15)});
    }
  }
  const step = Math.floor(time);
  for (const [index, vehicle] of fleet.entries()) {
    const route = data.routes[index];
    const [x,y] = trackPoint(route,step);
    const [nextX,nextY] = trackPoint(route,step+1);
    const [prevX,prevY] = trackPoint(route,Math.max(0,step-1));
    const [dx,dy] = nextX !== x || nextY !== y ? [nextX-x,nextY-y] : [x-prevX,y-prevY];
    const px=x+(nextX-x)*(time%1), py=y+(nextY-y)*(time%1);
    const task = data.assignment[index];
    const pickedAt = route.findIndex(point => equalPoint(point,task.pickup));
    const loaded = time >= pickedAt && time < route.length-1;
    objects.push({depth:px+py+.37,paint:() =>
      trolley(px,py,Math.atan2(dy,dx),vehicle.color,loaded,task.id==='C')});
    objects.push({depth:px+py+.58,paint:() => tag([px,py,.78],'AGV '+vehicle.id,vehicle.color,18)});
  }
  objects.sort((a,b) => a.depth-b.depth).forEach(({paint}) => paint());

  for (const collision of data.baselineConflicts) {
    if (stage !== 1 && !(stage === 2 && Math.abs(time-collision.time)<1.1)) continue;
    const [x,y] = project(...collision.point);
    context.beginPath();
    context.ellipse(x,y,29,15,0,0,2*Math.PI);
    context.strokeStyle = '#ffc387';
    context.lineWidth = 3.4;
    context.stroke();
    tag([...collision.point,-.38],stage===1 ? '独立最短路 · 会车冲突' : '已错开通行','#ffd2ad',17);
  }
}
