/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  k-평균 군집 분석과 실루엣 계수.
 *  오렌지 3.40 k-Means 위젯과 같은 순서로 계산한다:
 *    ① Normalize columns(평균 0·표준편차 1로 표준화) → ② 빈칸은 그 열의 평균으로 채움
 *    → ③ k-means++ 로 처음 중심을 고르고 → ④ 할당·중심 이동을 되풀이(Re-runs 10번 중 가장 좋은 것)
 */
import { 난수 } from './stats.js';

const 거리2 = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2; return s; };

/** 열마다 표준화하고 빈칸(null·NaN)은 평균(=0)으로 채운다 */
export function 준비(행들, 정규화 = true) {
  const p = 행들[0].length;
  const 평균들 = [], 편차들 = [];
  for (let j = 0; j < p; j++) {
    const 값 = 행들.map((r) => r[j]).filter((v) => Number.isFinite(v));
    const m = 값.reduce((a, b) => a + b, 0) / 값.length;
    const sd = Math.sqrt(값.reduce((a, b) => a + (b - m) ** 2, 0) / 값.length) || 1;
    평균들.push(m); 편차들.push(sd);
  }
  const 결과 = 행들.map((r) => r.map((v, j) => {
    const 값 = Number.isFinite(v) ? v : 평균들[j];
    return 정규화 ? (값 - 평균들[j]) / 편차들[j] : 값;
  }));
  return { 행들: 결과, 평균들, 편차들 };
}

/** k-means++ 로 첫 중심 고르기 */
function 처음중심(X, k, rnd) {
  const 중심 = [X[Math.floor(rnd() * X.length)].slice()];
  const d = X.map((x) => 거리2(x, 중심[0]));
  while (중심.length < k) {
    const 전체 = d.reduce((a, b) => a + b, 0);
    let 뽑기 = rnd() * 전체, i = 0;
    while (i < X.length - 1 && 뽑기 > d[i]) { 뽑기 -= d[i]; i++; }
    중심.push(X[i].slice());
    for (let j = 0; j < X.length; j++) d[j] = Math.min(d[j], 거리2(X[j], 중심[중심.length - 1]));
  }
  return 중심;
}

/** 한 번의 k-평균 → { 군집:[번호], 중심:[[...]], SSE } */
export function k평균한번(X, k, rnd, 최대반복 = 300) {
  let 중심 = 처음중심(X, k, rnd);
  let 군집 = new Array(X.length).fill(-1);
  for (let 반복 = 0; 반복 < 최대반복; 반복++) {
    let 바뀜 = false;
    for (let i = 0; i < X.length; i++) {
      let 가장 = 0, 가장d = Infinity;
      for (let c = 0; c < k; c++) { const dd = 거리2(X[i], 중심[c]); if (dd < 가장d) { 가장d = dd; 가장 = c; } }
      if (군집[i] !== 가장) { 군집[i] = 가장; 바뀜 = true; }
    }
    if (!바뀜) break;
    중심 = 중심.map((옛, c) => {
      const 속한 = X.filter((_, i) => 군집[i] === c);
      if (!속한.length) return 옛;
      return 옛.map((_, j) => 속한.reduce((a, r) => a + r[j], 0) / 속한.length);
    });
  }
  const SSE = X.reduce((a, x, i) => a + 거리2(x, 중심[군집[i]]), 0);
  return { 군집, 중심, SSE };
}

/** Re-runs 만큼 돌려 SSE 가 가장 작은 결과를 고른다 */
export function k평균(X, k, { 씨앗 = 0, 다시 = 10 } = {}) {
  const rnd = 난수(씨앗 + k * 7919);
  let 최선 = null;
  for (let t = 0; t < 다시; t++) {
    const 결과 = k평균한번(X, k, rnd);
    if (!최선 || 결과.SSE < 최선.SSE) 최선 = 결과;
  }
  return 정렬(최선, X);
}

/** 군집 번호를 「크기가 큰 순서」로 다시 매겨 C1, C2… 가 실행마다 같게 한다 */
function 정렬(결과, X) {
  const k = 결과.중심.length;
  const 크기 = Array.from({ length: k }, (_, c) => 결과.군집.filter((g) => g === c).length);
  const 순서 = [...Array(k).keys()].sort((a, b) => 크기[b] - 크기[a] || 결과.중심[a][0] - 결과.중심[b][0]);
  const 새번호 = new Array(k);
  순서.forEach((옛, 새) => { 새번호[옛] = 새; });
  return { 군집: 결과.군집.map((c) => 새번호[c]), 중심: 순서.map((c) => 결과.중심[c]), SSE: 결과.SSE, X };
}

/** 데이터 포인트마다의 실루엣 계수와 평균 */
export function 실루엣(X, 군집) {
  const k = Math.max(...군집) + 1;
  const 값 = X.map((x, i) => {
    const 평균거리 = new Array(k).fill(0), 개수 = new Array(k).fill(0);
    for (let j = 0; j < X.length; j++) {
      if (i === j) continue;
      평균거리[군집[j]] += Math.sqrt(거리2(x, X[j]));
      개수[군집[j]]++;
    }
    const 내 = 군집[i];
    if (개수[내] === 0) return 0;
    const a = 평균거리[내] / 개수[내];
    let b = Infinity;
    for (let c = 0; c < k; c++) if (c !== 내 && 개수[c]) b = Math.min(b, 평균거리[c] / 개수[c]);
    return (b - a) / Math.max(a, b);
  });
  return { 값, 평균: 값.reduce((a, b) => a + b, 0) / 값.length };
}
