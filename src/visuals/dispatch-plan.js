export const fleet = [
  { id: '01', start: [0, 4], color: '#63dabf' },
  { id: '02', start: [4, 0], color: '#9bb6ff' },
  { id: '03', start: [8, 2], color: '#dfb0ff' }
];

export const jobs = [
  { id: 'A', title: '加急补料', weight: 5, pickup: [2, 2], drop: [8, 4], from: '总仓发料口', to: '产线 02 上料口' },
  { id: 'B', title: '常规入库', weight: 3, pickup: [4, 2], drop: [2, 0], from: '产线 01 下料口', to: '总仓收货口' },
  { id: 'C', title: '空托盘回收', weight: 1, pickup: [6, 0], drop: [0, 2], from: '产线 01 回收位', to: '总仓托盘位' }
];

const width = 9, height = 7, limit = 40;
export const onRoad = (x, y) => x >= 0 && x < width && y >= 0 && y < height && (x % 2 === 0 || y % 2 === 0);
const steps = [[0, -1], [1, 0], [0, 1], [-1, 0], [0, 0]];
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const at = (path, time) => path[Math.min(time, path.length - 1)];

function conflicts(from, to, time, path) {
  const current = at(path, time);
  const previous = at(path, time - 1);
  return same(to, current) || (same(from, current) && same(to, previous));
}

function earliestRoute(vehicle, job, reserved) {
  const first = { point: vehicle.start, picked: same(vehicle.start, job.pickup), time: 0, previous: null };
  const queue = [first];
  const visited = new Set();
  const safeToPark = (point, time) => reserved.every(path => {
    for (let tick = time; tick <= path.length; tick++) {
      if (same(point, at(path, tick))) return false;
    }
    return !same(point, path.at(-1));
  });

  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (current.picked && same(current.point, job.drop) && safeToPark(current.point, current.time)) {
      const route = [];
      for (let step = current; step; step = step.previous) route.unshift(step.point);
      return route;
    }
    if (current.time >= limit) continue;
    for (const [dx, dy] of steps) {
      const point = [current.point[0] + dx, current.point[1] + dy];
      const time = current.time + 1;
      if (!onRoad(...point) || reserved.some(path => conflicts(current.point, point, time, path))) continue;
      const picked = current.picked || same(point, job.pickup);
      const key = `${point.join(',')},${time},${picked}`;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ point, time, picked, previous: current });
    }
  }
  return null;
}

function permutations(items) {
  return items.length <= 1 ? [items] : items.flatMap((item, index) =>
    permutations(items.filter((_, i) => i !== index)).map(rest => [item, ...rest]));
}

function conflictPoints(routes) {
  const events = [];
  for (let a = 0; a < routes.length; a++) {
    for (let b = a + 1; b < routes.length; b++) {
      const left = routes[a], right = routes[b];
      for (let time = 1; time < Math.max(left.length, right.length); time++) {
        if (conflicts(at(left, time - 1), at(left, time), time, right)) {
          events.push({ time, point: at(left, time), vehicles: [a, b] });
        }
      }
    }
  }
  return events;
}

export function buildDispatchPlan() {
  const orders = permutations(fleet.map((_, index) => index));
  const assignments = permutations(jobs);
  const alternatives = [];
  for (const assignment of assignments) {
    let bestForAssignment;
    for (const order of orders) {
      const routes = [];
      const reserved = [];
      for (const index of order) {
        const path = earliestRoute(fleet[index], assignment[index], reserved);
        if (!path) break;
        routes[index] = path;
        reserved.push(path);
      }
      if (reserved.length !== fleet.length) continue;
      const weighted = routes.reduce((sum, route, index) => sum + assignment[index].weight * (route.length - 1), 0);
      const makespan = Math.max(...routes.map(route => route.length - 1));
      if (!bestForAssignment || weighted < bestForAssignment.weighted ||
          (weighted === bestForAssignment.weighted && makespan < bestForAssignment.makespan)) {
        bestForAssignment = { assignment, order, routes, weighted, makespan };
      }
    }
    if (bestForAssignment) alternatives.push(bestForAssignment);
  }
  alternatives.sort((first, second) => first.weighted - second.weighted || first.makespan - second.makespan);
  const [best, next] = alternatives;
  if (!best) throw new Error('No feasible dispatch plan');
  const baseline = fleet.map((vehicle, index) => earliestRoute(vehicle, best.assignment[index], []));
  return {
    ...best,
    baseline,
    alternativeWeighted: next?.weighted,
    baselineConflicts: conflictPoints(baseline),
    plannedConflicts: conflictPoints(best.routes),
    candidates: assignments.length * orders.length
  };
}
