/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  통계 계산 — 기술 통계, 상관계수, 선형 회귀(단순·다중), 오차 함수, 결정계수.
 *  오렌지가 안에서 하는 계산을 학생이 따라갈 수 있게 짧은 식으로 적었다.
 */

/** 씨앗이 같으면 늘 같은 순서를 내는 난수 (mulberry32) */
export function 난수(씨앗 = 1) {
  let a = 씨앗 >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 정규분포 난수 (박스-뮬러) */
export function 정규(rnd) {
  let u = 0;
  while (u === 0) u = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
}

export const 합 = (xs) => xs.reduce((a, b) => a + b, 0);
export const 평균 = (xs) => (xs.length ? 합(xs) / xs.length : NaN);

export function 중앙값(xs) {
  if (!xs.length) return NaN;
  const 정렬 = [...xs].sort((a, b) => a - b);
  const m = 정렬.length >> 1;
  return 정렬.length % 2 ? 정렬[m] : (정렬[m - 1] + 정렬[m]) / 2;
}

/** 분산 — 교과서 정의대로 「데이터의 개수」로 나눈다(모분산) */
export function 분산(xs) {
  const m = 평균(xs);
  return 평균(xs.map((x) => (x - m) ** 2));
}
export const 표준편차 = (xs) => Math.sqrt(분산(xs));

/** 사분위수 (선형 보간) — 상자그림에 쓴다 */
export function 사분위(xs, p) {
  const 정렬 = [...xs].sort((a, b) => a - b);
  const 자리 = (정렬.length - 1) * p;
  const 아래 = Math.floor(자리);
  return 정렬[아래] + (정렬[Math.min(아래 + 1, 정렬.length - 1)] - 정렬[아래]) * (자리 - 아래);
}

/** 피어슨 상관계수 r */
export function 상관(xs, ys) {
  const mx = 평균(xs), my = 평균(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}

/** 상관계수 크기에 따른 판정 (교재 표 기준) */
export function 상관정도(r) {
  const a = Math.abs(r);
  if (a === 0) return '전혀 상관이 없다';
  if (a >= 1) return '완벽한 상관이 있다';
  if (a < 0.2) return '거의 상관이 없다';
  if (a < 0.4) return '약한 상관이 있다';
  if (a < 0.6) return '상관이 있다';
  if (a < 0.8) return '강한 상관이 있다';
  return '매우 강한 상관이 있다';
}

/** 단순 선형 회귀 (최소 제곱법) → { 기울기, 절편 } */
export function 단순회귀(xs, ys) {
  const mx = 평균(xs), my = 평균(ys);
  let 위 = 0, 아래 = 0;
  for (let i = 0; i < xs.length; i++) {
    위 += (xs[i] - mx) * (ys[i] - my);
    아래 += (xs[i] - mx) ** 2;
  }
  const 기울기 = 위 / 아래;
  return { 기울기, 절편: my - 기울기 * mx };
}

/**
 * 다중 선형 회귀 (정규방정식, 가우스 소거)
 * X: [[x1, x2, ...], ...]  y: [...]  → { 계수: [b1, b2, ...], 절편 }
 */
export function 다중회귀(X, y) {
  const n = X.length, p = X[0].length;
  // [1, x1, x2, ...] 로 늘린 뒤 (AᵀA) b = Aᵀy 를 푼다
  const A = X.map((행) => [1, ...행]);
  const m = p + 1;
  const M = Array.from({ length: m }, () => new Array(m + 1).fill(0));
  for (let i = 0; i < n; i++) {
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < m; c++) M[r][c] += A[i][r] * A[i][c];
      M[r][m] += A[i][r] * y[i];
    }
  }
  for (let 열 = 0; 열 < m; 열++) {
    let 큰행 = 열;
    for (let r = 열 + 1; r < m; r++) if (Math.abs(M[r][열]) > Math.abs(M[큰행][열])) 큰행 = r;
    [M[열], M[큰행]] = [M[큰행], M[열]];
    for (let r = 0; r < m; r++) {
      if (r === 열) continue;
      const 배 = M[r][열] / M[열][열];
      for (let c = 열; c <= m; c++) M[r][c] -= 배 * M[열][c];
    }
  }
  const b = M.map((행, i) => 행[m] / 행[i]);
  return { 절편: b[0], 계수: b.slice(1) };
}

export const 다중예측 = (모델, 행) => 모델.절편 + 합(모델.계수.map((b, i) => b * 행[i]));

/** 오차 함수와 결정계수 — 실젯값 ys, 예측값 ps */
export function 성능(ys, ps) {
  const n = ys.length;
  const 오차 = ys.map((y, i) => y - ps[i]);
  const MAE = 합(오차.map(Math.abs)) / n;
  const MSE = 합(오차.map((e) => e * e)) / n;
  const my = 평균(ys);
  const SST = 합(ys.map((y) => (y - my) ** 2));
  const SSE = 합(오차.map((e) => e * e));
  return { MAE, MSE, RMSE: Math.sqrt(MSE), R2: 1 - SSE / SST };
}

/**
 * 오렌지 Data Sampler 처럼 「정해진 비율」로 나눈다.
 * 씨앗이 같으면 늘 같게 나뉜다. → { 훈련: [번호...], 시험: [번호...] }
 */
export function 나누기(개수, 비율 = 0.7, 씨앗 = 1) {
  const rnd = 난수(씨앗);
  const 번호 = [...Array(개수).keys()];
  for (let i = 번호.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [번호[i], 번호[j]] = [번호[j], 번호[i]];
  }
  const 몇 = Math.round(개수 * 비율);
  return { 훈련: 번호.slice(0, 몇).sort((a, b) => a - b), 시험: 번호.slice(몇).sort((a, b) => a - b) };
}

/** 최소-최대 정규화와 표준화 */
export function 최소최대(xs) {
  const lo = Math.min(...xs), hi = Math.max(...xs);
  return xs.map((x) => (hi === lo ? 0 : (x - lo) / (hi - lo)));
}
export function 표준화(xs) {
  const m = 평균(xs), sd = 표준편차(xs);
  return xs.map((x) => (sd === 0 ? 0 : (x - m) / sd));
}
