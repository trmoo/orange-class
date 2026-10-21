/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  프로젝트 1-1·1-2 연습 데이터 만들기.  `node tools/make_health.mjs`
 *  실제 서울시 통계가 아니라 「교재의 분석 결과와 비슷한 성질」을 갖도록 새로 만든 값이다.
 *    수면(주중평균 전체) ↔ 비만율 r ≈ −0.92
 *    아침 결식률 ↔ 비만율 r ≈ 0.90, 패스트푸드 섭취율 ↔ 비만율 r ≈ 0.96
 *    수면 ↔ 아침 결식률 r ≈ −0.84
 *  씨앗을 바꿔 가며 목표에 가장 가까운 값을 찾고 src/data/health.js 에 글자 그대로 적는다.
 */
import { writeFileSync } from 'node:fs';
import { 난수, 정규, 상관 } from '../src/lib/stats.js';

const 둘째 = (x) => Math.round(x * 100) / 100;
const 첫째 = (x) => Math.round(x * 10) / 10;

function 만들기(씨앗) {
  const rnd = 난수(씨앗);
  const 연도 = []; for (let y = 2007; y <= 2024; y++) 연도.push(y);
  // 바탕 흐름: 해가 갈수록 비만율이 오르고 수면이 줄어든다(+ 흔들림)
  const t = 연도.map((y) => (y - 2007) / 17);
  const 비만 = t.map((x) => 첫째(8.6 + 5.6 * x + 0.55 * 정규(rnd)));
  const 수면 = t.map((x, i) => 둘째(6.55 - 0.55 * x - 0.03 * (비만[i] - 11) + 0.07 * 정규(rnd)));
  const 결식 = t.map((x, i) => 첫째(21 + 14 * x + 0.9 * (비만[i] - (8.6 + 5.6 * x)) + 1.6 * 정규(rnd)));
  const 패스트 = t.map((x, i) => 첫째(9.5 + 15 * x + 1.6 * (비만[i] - (8.6 + 5.6 * x)) + 0.9 * 정규(rnd)));
  return { 연도, 비만, 수면, 결식, 패스트 };
}

function 점수(d) {
  // 비만은 2008~, 식생활은 2009~ 부터 있다
  const 겹 = (from) => d.연도.map((y, i) => (y >= from ? i : -1)).filter((i) => i >= 0);
  const a = 겹(2008), b = 겹(2009);
  const 고르기 = (xs, 번호) => 번호.map((i) => xs[i]);
  const r1 = 상관(고르기(d.수면, a), 고르기(d.비만, a));
  const r2 = 상관(고르기(d.결식, b), 고르기(d.비만, b));
  const r3 = 상관(고르기(d.패스트, b), 고르기(d.비만, b));
  const r4 = 상관(고르기(d.수면, b), 고르기(d.결식, b));
  return { r1, r2, r3, r4, 거리: Math.abs(r1 + 0.92) + Math.abs(r2 - 0.90) + Math.abs(r3 - 0.96) + Math.abs(r4 + 0.84) };
}

let 최선 = null;
for (let 씨앗 = 1; 씨앗 < 200000; 씨앗++) {
  const d = 만들기(씨앗), p = 점수(d);
  if (!최선 || p.거리 < 최선.p.거리) 최선 = { 씨앗, d, p };
  if (p.거리 < 0.012) break;
}
const { d, p, 씨앗 } = 최선;
console.log('씨앗', 씨앗, Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v.toFixed(3)])));

// 다른 열(남·여·주말 등)은 전체 값에서 조금씩 비켜 만든다 — 표를 진짜처럼 보이게 할 뿐 분석에는 안 쓴다
const rnd = 난수(씨앗 + 1);

const 수면표 = d.연도.map((y, i) => ({
  시점: String(y), '주중평균 전체': d.수면[i],
  '주중평균 남학생': 둘째(d.수면[i] + 0.12 + 0.04 * 정규(rnd)), '주중평균 여학생': 둘째(d.수면[i] - 0.12 + 0.04 * 정규(rnd)),
  '주말평균 전체': 둘째(d.수면[i] + 1.6 + 0.08 * 정규(rnd)), '주관적 건강인지율 전체': 첫째(68 - 6 * ((y - 2007) / 17) + 1.2 * 정규(rnd)),
}));
const 비만표 = d.연도.filter((y) => y >= 2008).map((y) => {
  const i = d.연도.indexOf(y);
  return {
    시점: String(y), '비만율 전체': d.비만[i],
    '비만율 남학생': 첫째(d.비만[i] + 3.1 + 0.4 * 정규(rnd)), '비만율 여학생': 첫째(d.비만[i] - 3.2 + 0.4 * 정규(rnd)),
    '체중감소 노력률 전체': 첫째(41 + 4 * ((y - 2008) / 16) + 1.5 * 정규(rnd)),
  };
});
const 식생활표 = d.연도.filter((y) => y >= 2009).map((y) => {
  const i = d.연도.indexOf(y);
  return {
    시점: String(y), '주5일 이상 아침식사 결식률 전체': d.결식[i],
    '주5일 이상 아침식사 결식률 남학생': 첫째(d.결식[i] + 1.5 + 0.8 * 정규(rnd)),
    '주3회 이상 패스트푸드 섭취율 전체': d.패스트[i],
    '주3회 이상 패스트푸드 섭취율 남학생': 첫째(d.패스트[i] + 2.4 + 0.8 * 정규(rnd)),
    '하루 1회 이상 과일 섭취율 전체': 첫째(24 - 6 * ((y - 2009) / 15) + 1.3 * 정규(rnd)),
  };
});

writeFileSync('src/data/health.js', `/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  프로젝트 1-1·1-2 연습 데이터 — tools/make_health.mjs 가 만든다(손으로 고치지 말 것).
 *  ※ 실제 서울시 통계가 아니다. 교재의 분석 결과와 비슷한 성질을 갖도록 새로 만든 연습용 값이다.
 *    실제 분석은 서울열린데이터광장에서 내려받은 자료로 오렌지에서 한다.
 */
export const 수면표 = ${JSON.stringify(수면표)};
export const 비만표 = ${JSON.stringify(비만표)};
export const 식생활표 = ${JSON.stringify(식생활표)};
`);
console.log('src/data/health.js 를 썼습니다.');
