/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  그래프 — 산점도·히스토그램·상자그림·막대. 바깥 라이브러리 없이 SVG 로 직접 그린다.
 */
import { s } from './ui.js';
import { 사분위, 중앙값 } from './stats.js';

/** 군집·범주 색 (오렌지 기본 색과 비슷한 차례) */
export const 색들 = ['#3f7fd4', '#e8702a', '#2fa36b', '#d6454b', '#8e63c7', '#a07040', '#e05fae', '#6b7280', '#c7b000', '#1aa3b5'];

/** 깔끔한 눈금 값 */
export function 눈금(lo, hi, 개수 = 5) {
  if (lo === hi) { lo -= 1; hi += 1; }
  const 대강 = (hi - lo) / 개수;
  const 자릿 = 10 ** Math.floor(Math.log10(대강));
  const 단계 = [1, 2, 2.5, 5, 10].map((m) => m * 자릿).find((d) => d >= 대강) || 자릿 * 10;
  const 시작 = Math.ceil(lo / 단계 - 1e-9) * 단계;
  const 결과 = [];
  for (let v = 시작; v <= hi + 1e-9; v += 단계) 결과.push(Math.round(v * 1e6) / 1e6);
  return 결과;
}

/** 축이 있는 판. → { svg, x(값→px), y(값→px), 판 } */
export function 판만들기({ 너비 = 520, 높이 = 340, x범위, y범위, x이름 = '', y이름 = '', 여백 = { 위: 16, 오른: 18, 아래: 50, 왼: 62 }, x눈금 = true, y눈금 = true }) {
  const [x0, x1] = x범위, [y0, y1] = y범위;
  const W = 너비 - 여백.왼 - 여백.오른, H = 높이 - 여백.위 - 여백.아래;
  const x = (v) => 여백.왼 + ((v - x0) / (x1 - x0)) * W;
  const y = (v) => 여백.위 + H - ((v - y0) / (y1 - y0)) * H;
  const svg = s('svg', { viewBox: `0 0 ${너비} ${높이}`, class: 'chart', role: 'img' });
  svg.append(s('rect', { x: 여백.왼, y: 여백.위, width: W, height: H, class: 'plot-bg' }));
  if (y눈금) for (const v of 눈금(y0, y1)) {
    svg.append(s('line', { x1: 여백.왼, x2: 여백.왼 + W, y1: y(v), y2: y(v), class: 'grid' }));
    svg.append(s('text', { x: 여백.왼 - 8, y: y(v) + 5, class: 'tick', 'text-anchor': 'end' }, 짧게(v)));
  }
  if (x눈금) for (const v of 눈금(x0, x1)) {
    svg.append(s('line', { x1: x(v), x2: x(v), y1: 여백.위, y2: 여백.위 + H, class: 'grid' }));
    svg.append(s('text', { x: x(v), y: 여백.위 + H + 20, class: 'tick', 'text-anchor': 'middle' }, 짧게(v)));
  }
  svg.append(s('text', { x: 여백.왼 + W / 2, y: 높이 - 8, class: 'axis-label', 'text-anchor': 'middle' }, x이름));
  svg.append(s('text', { x: 16, y: 여백.위 + H / 2, class: 'axis-label', 'text-anchor': 'middle', transform: `rotate(-90 16 ${여백.위 + H / 2})` }, y이름));
  const 판 = s('g', {});
  svg.append(판);
  return { svg, x, y, 판, W, H, 여백, 너비, 높이 };
}

const 짧게 = (v) => (Math.abs(v) >= 1000 ? v.toLocaleString() : String(Math.round(v * 1000) / 1000));

/** 범위를 조금 넓혀 점이 테두리에 붙지 않게 */
export function 넓힌범위(값들, 비율 = 0.08) {
  const lo = Math.min(...값들), hi = Math.max(...값들);
  const 폭 = (hi - lo) || 1;
  return [lo - 폭 * 비율, hi + 폭 * 비율];
}

/**
 * 산점도. 점: [{x, y, 색?, 제목?, 큰?}]
 * 선: {기울기, 절편, 글?} 이면 회귀선을 그린다.
 */
export function 산점도(점, { x이름, y이름, 선, 너비, 높이, x범위, y범위, 반지름 = 6, 점누르기 } = {}) {
  const 판 = 판만들기({ 너비, 높이, x이름, y이름, x범위: x범위 || 넓힌범위(점.map((p) => p.x)), y범위: y범위 || 넓힌범위(점.map((p) => p.y)) });
  if (선) {
    const [a, b] = x범위 || 넓힌범위(점.map((p) => p.x));
    판.판.append(s('line', { x1: 판.x(a), y1: 판.y(선.절편 + 선.기울기 * a), x2: 판.x(b), y2: 판.y(선.절편 + 선.기울기 * b), class: 'reg-line' }));
    if (선.글) 판.판.append(s('text', { x: 판.x(b) - 6, y: 판.y(선.절편 + 선.기울기 * b) - 10, class: 'reg-label', 'text-anchor': 'end' }, 선.글));
  }
  점.forEach((p, i) => {
    const c = s('circle', { cx: 판.x(p.x), cy: 판.y(p.y), r: p.큰 ? 반지름 + 3 : 반지름, fill: p.색 || 색들[0], class: 'dot' + (점누르기 ? ' clickable' : ''),
      onclick: 점누르기 ? () => 점누르기(i) : null });
    if (p.제목) c.append(s('title', {}, p.제목));
    판.판.append(c);
  });
  // 회귀선은 판.svg 를 마지막에 붙여 점 위에 보이게 한다
  return 판;
}

/** 히스토그램. 묶음: [{이름, 값들, 색}] (여럿이면 쌓아 그린다), 비율=true 면 Show probabilities */
export function 히스토그램(묶음, { 구간수 = 12, x이름 = '', 너비, 높이, 비율 = false, 범위 } = {}) {
  const 모든값 = 묶음.flatMap((g) => g.값들);
  const [lo, hi] = 범위 || [Math.min(...모든값), Math.max(...모든값)];
  const 폭 = (hi - lo) / 구간수 || 1;
  const 칸 = Array.from({ length: 구간수 }, () => 묶음.map(() => 0));
  묶음.forEach((g, gi) => g.값들.forEach((v) => {
    const i = Math.min(구간수 - 1, Math.max(0, Math.floor((v - lo) / 폭)));
    칸[i][gi]++;
  }));
  const 높이값 = 칸.map((c) => {
    const 합 = c.reduce((a, b) => a + b, 0);
    return 비율 ? c.map((v) => (합 ? v / 합 : 0)) : c;
  });
  const 최대 = 비율 ? 1 : Math.max(1, ...높이값.map((c) => c.reduce((a, b) => a + b, 0)));
  const 판 = 판만들기({ 너비, 높이, x이름, y이름: 비율 ? '비율(Probability)' : '개수(Frequency)', x범위: [lo, hi], y범위: [0, 최대 * 1.08] });
  높이값.forEach((c, i) => {
    let 바닥 = 0;
    c.forEach((v, gi) => {
      if (!v) return;
      const x0 = 판.x(lo + i * 폭), x1 = 판.x(lo + (i + 1) * 폭);
      판.판.append(s('rect', { x: x0 + 1, width: Math.max(1, x1 - x0 - 2), y: 판.y(바닥 + v), height: 판.y(바닥) - 판.y(바닥 + v), fill: 묶음[gi].색 || 색들[gi], class: 'bar' },
        s('title', {}, `${묶음[gi].이름 || ''} ${짧게(lo + i * 폭)}~${짧게(lo + (i + 1) * 폭)}: ${비율 ? Math.round(v * 100) + '%' : v + '개'}`)));
      바닥 += v;
    });
  });
  return 판;
}

/** 상자그림 (가로). 묶음: [{이름, 값들, 색}] */
export function 상자그림(묶음, { x이름 = '', 너비 = 520, 줄높이 = 34, 범위 } = {}) {
  const 모든값 = 묶음.flatMap((g) => g.값들);
  const [lo, hi] = 범위 || 넓힌범위(모든값, 0.04);
  const 높이 = 묶음.length * 줄높이 + 66;
  const 판 = 판만들기({ 너비, 높이, x이름, x범위: [lo, hi], y범위: [0, 묶음.length], y눈금: false, 여백: { 위: 10, 오른: 18, 아래: 50, 왼: 62 } });
  묶음.forEach((g, i) => {
    if (!g.값들.length) return;
    const 가운데 = 판.y(묶음.length - i - 0.5);
    const q1 = 사분위(g.값들, 0.25), q3 = 사분위(g.값들, 0.75), md = 중앙값(g.값들);
    const 수염 = 1.5 * (q3 - q1);
    const 안 = g.값들.filter((v) => v >= q1 - 수염 && v <= q3 + 수염);
    const 아래끝 = Math.min(...안), 위끝 = Math.max(...안);
    const 색 = g.색 || 색들[i];
    판.판.append(
      s('text', { x: 판.여백.왼 - 8, y: 가운데 + 5, class: 'tick', 'text-anchor': 'end' }, g.이름),
      s('line', { x1: 판.x(아래끝), x2: 판.x(위끝), y1: 가운데, y2: 가운데, stroke: 색, 'stroke-width': 2 }),
      s('rect', { x: 판.x(q1), width: Math.max(2, 판.x(q3) - 판.x(q1)), y: 가운데 - 11, height: 22, fill: 색, 'fill-opacity': 0.28, stroke: 색, 'stroke-width': 2, rx: 3 },
        s('title', {}, `${g.이름} — 중앙값 ${짧게(md)}, 상자 ${짧게(q1)}~${짧게(q3)}`)),
      s('line', { x1: 판.x(md), x2: 판.x(md), y1: 가운데 - 13, y2: 가운데 + 13, stroke: '#111', 'stroke-width': 3 }),
    );
    for (const v of g.값들) if (v < q1 - 수염 || v > q3 + 수염) 판.판.append(s('circle', { cx: 판.x(v), cy: 가운데, r: 3, fill: 'none', stroke: 색 }));
  });
  return 판;
}

/** 세로 막대. 항목: [{이름, 값, 색?}] */
export function 막대(항목, { y이름 = '', 너비 = 520, 높이 = 300, 최대, 글자 = (v) => 짧게(v) } = {}) {
  const 큰값 = 최대 ?? Math.max(...항목.map((a) => a.값)) * 1.15;
  const 판 = 판만들기({ 너비, 높이, y이름, x범위: [0, 항목.length], y범위: [0, 큰값 || 1], x눈금: false });
  항목.forEach((a, i) => {
    const x0 = 판.x(i + 0.15), x1 = 판.x(i + 0.85);
    판.판.append(
      s('rect', { x: x0, width: x1 - x0, y: 판.y(a.값), height: 판.y(0) - 판.y(a.값), fill: a.색 || 색들[0], class: 'bar' }),
      s('text', { x: (x0 + x1) / 2, y: 판.y(a.값) - 6, class: 'bar-label', 'text-anchor': 'middle' }, 글자(a.값)),
      s('text', { x: (x0 + x1) / 2, y: 판.y(0) + 20, class: 'tick', 'text-anchor': 'middle' }, a.이름),
    );
  });
  return 판;
}
