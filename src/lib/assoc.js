/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  연관 분석 — 빈발 항목 집합(아프리오리)과 연관 규칙(지지도·신뢰도·향상도).
 *  트랜잭션 하나를 비트 묶음(정수)으로 적는다. 항목 i 를 샀으면 i 번째 비트가 1.
 *  항목이 31개 이하일 때만 쓴다(이 앱의 관광 활동은 19개).
 */

const 비트수 = (m) => { let c = 0; while (m) { m &= m - 1; c++; } return c; };
export const 항목들 = (m) => { const r = []; for (let i = 0; m; i++, m >>>= 1) if (m & 1) r.push(i); return r; };

/** 묶음이 들어 있는 트랜잭션 수 */
export function 세기(트랜잭션, 묶음) {
  let c = 0;
  for (const t of 트랜잭션) if ((t & 묶음) === 묶음) c++;
  return c;
}

/**
 * 빈발 항목 집합 — 최소 지지도(0~1) 이상인 묶음을 모두 찾는다.
 * 돌려주는 값: [{ 묶음, 수, 지지도 }]
 */
export function 빈발집합(트랜잭션, 최소지지도, 최대크기 = 31) {
  const N = 트랜잭션.length;
  const 기준 = Math.max(1, Math.ceil(최소지지도 * N - 1e-9));
  const 결과 = [];
  for (const [묶음, 수] of 모든묶음수(트랜잭션)) {
    if (수 >= 기준 && 비트수(묶음) <= 최대크기) 결과.push({ 묶음, 수, 지지도: 수 / N });
  }
  return 결과.sort((a, b) => b.수 - a.수 || a.묶음 - b.묶음);
}

/**
 * 트랜잭션마다 「그 안에서 만들 수 있는 모든 묶음」을 세어 둔다.
 * 한 사람이 고르는 활동은 많아야 열 개 남짓이라(2¹⁰ = 1,024가지) 이 방법이 아프리오리보다 빠르다.
 * 같은 트랜잭션 목록이면 한 번만 센다.
 */
const 기억 = new WeakMap();
function 모든묶음수(트랜잭션) {
  if (기억.has(트랜잭션)) return 기억.get(트랜잭션);
  const 수 = new Map();
  for (const t of 트랜잭션) {
    for (let s = t; s > 0; s = (s - 1) & t) 수.set(s, (수.get(s) || 0) + 1);
  }
  기억.set(트랜잭션, 수);
  return 수;
}

/**
 * 연관 규칙 A → B
 * 지지도 = A·B 가 함께 있는 비율, 신뢰도 = 지지도(A∪B) / 지지도(A),
 * 향상도 = 신뢰도 / 지지도(B)
 */
export function 규칙들(트랜잭션, 빈발, 최소신뢰도) {
  const N = 트랜잭션.length;
  const 지지 = new Map(빈발.map((x) => [x.묶음, x.수]));
  const 결과 = [];
  for (const { 묶음, 수 } of 빈발) {
    if (비트수(묶음) < 2) continue;
    // 묶음을 앞(A)·뒤(B)로 나누는 모든 방법
    for (let A = (묶음 - 1) & 묶음; A > 0; A = (A - 1) & 묶음) {
      const B = 묶음 & ~A;
      const 수A = 지지.get(A), 수B = 지지.get(B);
      if (!수A || !수B) continue;
      const 신뢰도 = 수 / 수A;
      if (신뢰도 < 최소신뢰도) continue;
      결과.push({ A, B, 지지도: 수 / N, 신뢰도, 향상도: 신뢰도 / (수B / N), 수 });
    }
  }
  return 결과;
}
