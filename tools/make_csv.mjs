/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  4단원에서 내려받게 하는 csv 두 개를 앱 안으로 옮겨 적는다.  `npm run csv`
 *  data/ 의 파일(서울열린데이터광장 통계표를 머리글 한 줄로 정리한 수정본)을 읽어 src/data/csv.js 를 만든다.
 *  앱이 dist/index.html 한 파일로 열리므로 csv 도 글자로 담아 두고, 내려받을 때 파일로 바꾼다.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const 파일들 = [
  { 열쇠: '수면csv', 이름: '청소년 평균수면시간 및 주관적 건강인지율(수정본).csv', 통계표: '서울시 청소년 평균수면시간 및 주관적 건강인지율 통계' },
  { 열쇠: '비만csv', 이름: '청소년 비만 및 체중조절(수정본).csv', 통계표: '서울시 청소년 비만 및 체중조절 통계' },
];

const 줄들 = 파일들.map(({ 열쇠, 이름, 통계표 }) => {
  // 앞의 BOM 은 떼어 두고, 내려받을 때 다시 붙인다(엑셀이 한글을 UTF-8 로 읽게 하는 표시)
  const 글 = readFileSync(new URL(`../data/${이름}`, import.meta.url), 'utf8').replace(/^﻿/, '');
  const 행 = 글.split(/\r?\n/).filter((r) => r.trim());
  const 열수 = 행[0].split(',').length;
  const 연도 = 행.slice(1).map((r) => r.split(',')[0]);
  console.log(`${이름} — 자료 ${행.length - 1}줄 · 열 ${열수}개 · ${연도[0]}~${연도.at(-1)}`);
  return `export const ${열쇠} = ${JSON.stringify({ 이름, 통계표, 줄: 행.length - 1, 열: 열수, 처음: +연도[0], 끝: +연도.at(-1), 글 }, null, 2)};`;
});

writeFileSync(new URL('../src/data/csv.js', import.meta.url), `/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  4단원에서 내려받게 하는 csv 두 개 — tools/make_csv.mjs 가 data/ 의 파일로 만든다. 손으로 고치지 말 것.
 *  값은 서울열린데이터광장(data.seoul.go.kr) 통계표의 것이고, 머리글만 한 줄로 정리한 수정본이다.
 *  (앱 안의 그래프·회귀에 쓰는 연습 데이터는 health.js 의 새로 만든 값이라 이 파일과 다르다)
 */
${줄들.join('\n\n')}
`);
console.log('src/data/csv.js 를 만들었습니다.');
