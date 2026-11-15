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

// 6단원 「단계 2 · 기상 자료 모으기」 에서 내려받게 하는 정리 데이터 — 기상자료개방포털의 서울 2024년 일자료.
// ⚠ 이 파일은 CP949(한글 윈도우) 인코딩이다. 브라우저는 CP949 로 다시 인코딩하지 못하므로
//   글자가 아니라 **바이트를 base64 로** 담아, 내려받은 파일이 받은 파일과 바이트까지 같게 한다.
const 날씨이름 = '2024_서울_날씨_정리데이터.csv';
const 날씨바이트 = readFileSync(new URL(`../data/${날씨이름}`, import.meta.url));
const 날씨행 = new TextDecoder('euc-kr').decode(날씨바이트).split(/\r?\n/).filter((r) => r.trim());
const 날씨 = {
  이름: 날씨이름, 출처: '기상청 기상자료개방포털(data.kma.go.kr) 서울 2024년 일자료', 인코딩: 'cp949',
  머리: 날씨행[0], 줄: 날씨행.length - 1, 열: 날씨행[0].split(',').length,
  처음: 날씨행[1].split(',')[0], 끝: 날씨행.at(-1).split(',')[0], 바이트수: 날씨바이트.length,
  b64: 날씨바이트.toString('base64'),
};
console.log(`${날씨이름} — 자료 ${날씨.줄}줄 · 열 ${날씨.열}개 · ${날씨.처음}~${날씨.끝} · ${날씨.바이트수}바이트(CP949)`);
줄들.push(`export const 날씨csv = ${JSON.stringify(날씨, null, 2)};`);

writeFileSync(new URL('../src/data/csv.js', import.meta.url), `/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  내려받게 하는 csv — tools/make_csv.mjs 가 data/ 의 파일로 만든다. 손으로 고치지 말 것.
 *  · 4단원 두 개(수면csv·비만csv): 서울열린데이터광장(data.seoul.go.kr) 통계표의 값, 머리글만 한 줄로 정리한 수정본이다.
 *  · 6단원 하나(날씨csv): 기상청 기상자료개방포털의 서울 2024년 일자료를 정리한 파일. CP949 바이트를 base64 로 담았다.
 *  (4·5단원 앱 안의 그래프·회귀에 쓰는 연습 데이터는 health.js 의 새로 만든 값이라 위 두 파일과 다르다.
 *   6단원은 날씨csv 와 같은 실제 값을 seoul2024.js 로 쓴다 — tools/make_seoul2024.py)
 */
${줄들.join('\n\n')}
`);
console.log('src/data/csv.js 를 만들었습니다.');
