/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  6단원 — 프로젝트 2 「군집 분석으로 기온별 옷차림 표를 그려보자」
 *  성취기준 [12데과03-03] · 학습 요소: 군집 분석, k-평균 군집 분석 · 교과서 132~147쪽
 *  날씨 데이터는 기상자료개방포털의 서울 2024년 실제 관측값이다(src/data/seoul2024.js — 학생이 내려받는 csv 와 같다).
 *  군집 결과는 오렌지 3.40 k평균군집화와 같은 계산으로 미리 셈해 두어, 학생의 오렌지 화면과 군집 번호·실루엣이 같다.
 */
import { h, s, 채우기, md, 수, 창, 조사 } from '../lib/ui.js';
import { 다푼모습 } from '../lib/capture.js';
import { 퀴즈, 순서, 짝짓기, 쓰기, 알림줄 } from '../lib/games.js';
import { 끝냄, 끝났나, 상태, 저장, 글읽기, 글쓰기 } from '../lib/store.js';
import { 평균, 중앙값, 사분위, 표준편차 } from '../lib/stats.js';
import { 히스토그램, 산점도, 막대, 색들 } from '../lib/chart.js';
import { 흐름조립, 위젯창, 묶음상자, 라디오, 열고르기, 데이터표 } from '../lib/orange.js';
import { 준비, 실루엣 } from '../lib/kmeans.js';
import { 카드, 말풍선, 고르기단추, 교재메모 } from './common.js';
import { 활동목록, 마무리카드 } from './finish.js';
import { 프로젝트카드 } from './project.js';
import { 날들 as 서울날들, 속성, 오렌지군집 } from '../data/seoul2024.js';
import { 날씨csv } from '../data/csv.js';

const 마침 = (열쇠) => { 끝냄(열쇠); document.dispatchEvent(new CustomEvent('activity-done', { detail: 열쇠 })); };

// 재원이가 SNS 에서 본 「기온별 옷차림 표」 (첫 카드) — 인터넷에 널리 도는 그림이라 만든 사람을 알 수 없다(LICENSE 에 밝힘).
// import 대신 new URL 을 쓴다 — 시험(node)이 이 파일을 불러와도 그림을 읽지 않고, 빌드에서는 data: 주소로 한 파일 안에 들어간다.
const 옷차림그림 = new URL('../assets/outfit-chart.jpg', import.meta.url).href;
const 옷차림그림설명 = '기온별 옷차림 표 — 28℃ 이상 민소매·반팔·반바지, 27~23℃ 반팔·얇은 셔츠·면바지, 22~20℃ 블라우스·긴팔 티·슬랙스, '
  + '19~17℃ 얇은 가디건·니트·맨투맨·후드, 16~12℃ 재킷·가디건·청바지, 11~9℃ 트렌치코트·야상·기모바지, 8~5℃ 울 코트·히트텍·가죽 옷, 4℃ 이하 패딩·누빔 옷·목도리';
const 옷차림그림크게 = () => 창('🌡️ 재원이가 SNS 에서 본 기온별 옷차림 표', h('div', {},
  h('img', { src: 옷차림그림, alt: 옷차림그림설명, class: 'sns-big' }),
  h('p', { class: 'small muted' }, '인터넷에 널리 도는 그림이라 만든 사람을 알 수 없어요.')));

/**
 * 「메타 정보가 적힌 윗줄」 이 무엇인지 보여 주는 엑셀 모양 표 (단계 2 카드의 팝업).
 * 1~11행은 기상자료개방포털 csv 의 메타 정보 줄 형식 그대로, 12행부터의 숫자는 서울 2024년 실제 값(날씨들)이다.
 * 긴 글은 엑셀처럼 옆 칸으로 넘쳐 보이게 colspan 으로 잇는다.
 */
function 메타표() {
  const 열 = ['A', 'B', 'C', 'D'];
  const 메타줄 = [
    [], ['조건별분석'], ['[검색조건]'],
    [null, '분류 : 지상'], [null, '요소 : 기온'], [null, '검색구분 : 일'], [null, '지역/지점명 : 서울'],
    [null, '기간 : 2024 ~ 2024년 01 ~ 12월 01 ~ 31일'], [], [], [],
  ];
  // 넘친 글은 그 칸부터 D 열까지 한 칸으로 잇는다
  const 메타칸 = (줄) => {
    const i = 줄.findIndex((v) => v);
    if (i < 0) return 열.map(() => h('td', {}));
    return [...Array.from({ length: i }, () => h('td', {})), h('td', { colspan: 열.length - i, class: 'xl-spill' }, 줄[i])];
  };
  const 날들 = 날씨들().slice(0, 4);
  return h('table', { class: 'xl-sheet', 'aria-label': '기상자료개방포털에서 받은 csv 를 엑셀로 연 모습 — 1~11행 메타 정보, 12행부터 데이터' },
    h('thead', {}, h('tr', {}, h('th', { class: 'xl-corner' }), 열.map((c) => h('th', {}, c)), h('th', { class: 'xl-ann-head' }))),
    h('tbody', {},
      메타줄.map((줄, i) => h('tr', { class: 'xl-meta' },
        h('th', { class: 'xl-no' }, String(i + 1)), 메타칸(줄),
        i === 0 ? h('td', { rowspan: 메타줄.length, class: 'xl-ann del' }, h('b', {}, '메타 정보'), h('br'), '1~11행', h('br'), '→ 지운다') : null)),
      h('tr', { class: 'xl-head' },
        h('th', { class: 'xl-no' }, '12'), ['지점번호', '지점명', '일시', '평균기온(°C)'].map((v) => h('td', {}, v)),
        h('td', { rowspan: 날들.length + 1, class: 'xl-ann keep' }, h('b', {}, '데이터'), h('br'), '12행부터', h('br'), '→ 남긴다')),
      날들.map((d, i) => h('tr', {},
        h('th', { class: 'xl-no' }, String(13 + i)),
        h('td', {}, '108'), h('td', {}, '서울'), h('td', { class: 'xl-num' }, d.일시), h('td', { class: 'xl-num' }, 수(d.값[1], 1))))));
}

/**
 * 정리를 마친 서울 2024년 날씨 csv 를 내려받는다 (단계 2 카드).
 * 받은 파일 그대로(CP949 바이트)를 base64 로 담아 두었으니, 글자로 바꾸지 않고 바이트를 그대로 파일로 만든다.
 * ⚠ BOM 을 붙이거나 UTF-8 로 바꾸면 받은 파일과 달라진다.
 */
function 날씨csv내려받기() {
  const 바이트 = Uint8Array.from(atob(날씨csv.b64), (c) => c.charCodeAt(0));
  const 주소 = URL.createObjectURL(new Blob([바이트], { type: 'text/csv' }));
  const a = h('a', { href: 주소, download: 날씨csv.이름 });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(주소), 2000);
}

const 메타정보보기 = () => 창('🔎 메타 정보란?', h('div', { class: 'meta-pop' },
  h('figure', {},
    메타표(),
    h('figcaption', { class: 'small muted' }, '받은 csv 를 엑셀로 연 모습을 다시 그렸어요. 숫자는 서울 2024년의 실제 값이고, 실제 파일에는 최고기온·최저기온 같은 열이 더 이어져요.')),
  h('div', {},
    h('p', {}, md('**메타 정보(메타 데이터)** 는 「데이터에 대한 데이터」 예요. 받은 csv 의 **1~11행** 에는 이 자료를 **어떤 조건으로 뽑았는지** 가 적혀 있어요.')),
    h('ul', { class: 'small' },
      h('li', {}, md('분류 **지상** · 요소 **기온** · 검색구분 **일** · 지점 **서울** · 기간 **2024년 1월 1일 ~ 12월 31일**')),
      h('li', {}, md('진짜 데이터는 **12행** 의 속성 이름(지점번호·지점명·일시·평균기온…)부터 시작해요.'))),
    h('p', {}, md('오렌지는 **맨 윗줄을 속성 이름** 으로 읽어요. 메타 정보 줄이 남아 있으면 속성 이름과 값이 제자리를 찾지 못해요. 그래서 **1~11행을 드래그해 지우고 저장** 해요.')),
    h('div', { class: 'tip' }, md('💡 지우기 전에 한 번 읽어 보세요. **내가 고른 지역·기간의 자료가 맞는지** 확인하는 단서예요.')))));

// 날씨 366일 — 기상자료개방포털 서울 2024년 실제 관측값 (2026-11-15 사용자 지시로 연습용 값에서 바꿈)
let 날씨 = null;
export const 날씨들 = () => (날씨 ||= 서울날들.map(([일시, ...값]) => ({ 일시, 값 })));

/**
 * k 별 군집 결과 — 오렌지 3.40 의 k평균군집화와 같은 계산으로 미리 셈해 둔 것(tools/make_seoul2024.py).
 * 학생이 오렌지에서 보는 군집 번호(C1~)·실루엣 점수와 같게 하려고 브라우저에서 다시 셈하지 않는다
 * (k-평균은 출발점에 따라 답이 갈려, 같은 방법으로 셈해도 오렌지와 다른 묶음이 나올 수 있다).
 * 시험이 이 군집 번호로 실루엣을 다시 셈해 적어 둔 값과 같은지 본다.
 */
const 기억 = new Map();
export function 군집(k, 정규화 = true) {
  const 열쇠 = `${k}-${정규화}`;
  if (!기억.has(열쇠)) {
    const r = 오렌지군집[정규화 ? '정규화' : '그대로'][k];
    기억.set(열쇠, { 군집: [...r.군집].map(Number), 실: r.실 });
  }
  return 기억.get(열쇠);
}
export const 가장좋은k = () => [2, 3, 4, 5, 6, 7, 8].reduce((a, k) => (군집(k).실 > 군집(a).실 ? k : a), 2);

/** 속성 j 의 값들 — 강수량 빈칸은 비가 오지 않은 날이라 0, 나머지 속성의 빈칸(측정 못 함)은 뺀다 */
const 속성값들 = (날들, j) => 날들.map((d) => d.값[j] ?? (j === 0 ? 0 : null)).filter((v) => v !== null);

/** 군집마다 속성 평균과 전체 평균을 견준 화살표 (↑ 높음 · ↓ 낮음 · − 비슷) */
export function 군집특징(k) {
  const r = 군집(k), 일 = 날씨들();
  const 전체 = 속성.map((_, j) => 평균(속성값들(일, j)));
  const 폭 = 속성.map((_, j) => { const v = 속성값들(일, j); return Math.max(...v) - Math.min(...v); });
  return Array.from({ length: k }, (_, c) => {
    const 날들 = 일.filter((_, i) => r.군집[i] === c);
    const 평 = 속성.map((_, j) => 평균(속성값들(날들, j)));
    const 화살 = 평.map((v, j) => { const d = (v - 전체[j]) / 폭[j]; return d > 0.12 ? '↑' : d < -0.12 ? '↓' : '−'; });
    const 달 = 날들.map((d) => Number(d.일시.slice(5, 7)));
    return { c, 수: 날들.length, 평, 화살, 비온날: 날들.filter((d) => d.값[0] !== null).length, 많은달: 최빈달(달) };
  });
}
const 최빈달 = (달들) => { const 셈 = {}; for (const m of 달들) 셈[m] = (셈[m] || 0) + 1; return Object.entries(셈).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => `${m}월`).join('·'); };

/**
 * 학생이 정한 k — 「k 는 몇 개가 좋을까?」 카드나 k-Means 카드의 실루엣 표에서 고른다.
 * 고르지 않았으면 실루엣이 가장 높은 k. 산점도·Box Plot·옷차림 표·결과 정리 카드가 이 k 로 그린다.
 */
export const 내k = () => { const k = Number(글읽기('u6.k')); return Number.isInteger(k) && k >= 2 && k <= 8 ? k : 가장좋은k(); };

/**
 * 기온별 옷차림 단계 — 인터넷에 널리 도는 「기온별 옷차림 표」 의 기온 구간을 바탕으로 옷 이름은 새로 정리한 예시다.
 * 최소: 이 단계가 시작되는 기온(℃). 위에서부터 처음으로 「기온 ≥ 최소」 인 단계가 그 기온의 단계다.
 */
export const 옷차림단계 = [
  { 단계: 1, 기온: '28℃ 이상', 최소: 28, 옷: '민소매·반팔·반바지·얇은 원피스' },
  { 단계: 2, 기온: '23~27℃', 최소: 23, 옷: '반팔·얇은 셔츠·반바지·면바지' },
  { 단계: 3, 기온: '20~22℃', 최소: 20, 옷: '얇은 긴팔·얇은 가디건·면바지' },
  { 단계: 4, 기온: '17~19℃', 최소: 17, 옷: '맨투맨·얇은 니트·가디건·청바지' },
  { 단계: 5, 기온: '12~16℃', 최소: 12, 옷: '재킷·후드·가디건·청바지' },
  { 단계: 6, 기온: '9~11℃', 최소: 9, 옷: '트렌치코트·야상·니트' },
  { 단계: 7, 기온: '5~8℃', 최소: 5, 옷: '코트·두꺼운 니트·내복' },
  { 단계: 8, 기온: '4℃ 이하', 최소: -Infinity, 옷: '패딩·두꺼운 코트·목도리·장갑' },
];
export const 단계찾기 = (기온) => 옷차림단계.find((d) => 기온 >= d.최소).단계;
const 옷차림표 = () => h('table', { class: 'kv small' },
  h('thead', {}, h('tr', {}, h('th', {}, '단계'), h('th', {}, '기온'), h('th', {}, '옷차림 예'))),
  h('tbody', {}, 옷차림단계.map((d) => h('tr', {}, h('td', {}, `${d.단계}단계`), h('td', {}, d.기온), h('td', {}, d.옷)))));
const 옷차림표보기 = () => 창('🌡️ 기온별 옷차림 표', h('div', {}, 옷차림표(),
  h('p', { class: 'small muted' }, '인터넷에 널리 도는 표의 기온 구간을 바탕으로 새로 정리한 예시예요. 사람마다 느끼는 온도가 달라요.')));

/**
 * 옷차림 표 카드의 저장 열쇠 — 종류: n 이름 · o 옷 · s 옷차림 단계.
 * k 를 바꾸면 군집이 통째로 달라지므로 k 마다 따로 둔다. 실루엣이 가장 높은 k 는 예전 열쇠(n0·o0)를 그대로 써서 전에 적은 것이 남는다.
 */
export const 옷열쇠 = (k, 종류, c) => (k === 가장좋은k() ? `${종류}${c}` : `k${k}${종류}${c}`);

/** 계절 — 3~5월 봄 · 6~8월 여름 · 9~11월 가을 · 12~2월 겨울 */
const 계절들 = ['봄', '여름', '가을', '겨울'];
const 계절 = (달) => (달 >= 3 && 달 <= 5 ? 0 : 달 >= 6 && 달 <= 8 ? 1 : 달 >= 9 && 달 <= 11 ? 2 : 3);

/** 군집 × 달 날 수 — [군집][0~11] */
export function 달별군집(k) {
  const r = 군집(k), 표 = Array.from({ length: k }, () => new Array(12).fill(0));
  날씨들().forEach((d, i) => { 표[r.군집[i]][Number(d.일시.slice(5, 7)) - 1]++; });
  return 표;
}

/**
 * 같은 달에 두 군집이 고르게 섞여 있는 달과 두 군집 — 둘째로 많은 군집의 날 수가 가장 큰 달을 고른다.
 * 두 군집의 평균에서 (전체 범위에 견주어) 가장 크게 다른 속성 번호도 함께 낸다. 섞인 달이 없으면 null.
 */
export function 섞인달(k) {
  const 표 = 달별군집(k), 특징 = 군집특징(k), 일 = 날씨들();
  let 고른 = null;
  for (let m = 0; m < 12; m++) {
    const [a, b] = 표.map((줄, c) => [c, 줄[m]]).sort((x, y) => y[1] - x[1]);
    if (b && b[1] > 0 && (!고른 || b[1] > 고른.둘째수)) 고른 = { 달: m + 1, 가: a[0], 나: b[0], 둘째수: b[1] };
  }
  if (!고른) return null;
  const 폭 = 속성.map((_, j) => { const v = 속성값들(일, j); return Math.max(...v) - Math.min(...v); });
  const 차 = 속성.map((_, j) => Math.abs(특징[고른.가].평[j] - 특징[고른.나].평[j]) / 폭[j]);
  return { ...고른, 다른속성: 차.indexOf(Math.max(...차)) };
}

const 짧은속성 = ['강수량', '평균기온', '평균풍속', '일조합'];

/**
 * 색을 흰색과 섞는다 — 비율 % 만큼 그 색. CSS 의 color-mix() 를 쓰지 않는 까닭: 활동 정리 PDF 를 만드는 html2canvas 가
 * color-mix 의 계산값(color(srgb …))을 읽지 못해 14번 카드에서 PDF 만들기가 통째로 멈췄다(2026-11-09)
 */
const 흰색과섞기 = (색, 비율) => {
  const p = Math.max(0, Math.min(100, 비율)) / 100;
  const [r, g, b] = [1, 3, 5].map((i) => Math.round(parseInt(색.slice(i, i + 2), 16) * p + 255 * (1 - p)));
  return `rgb(${r}, ${g}, ${b})`;
};

/** 군집 이름과 조사 —군(0, '이가') → 'C1이', 군(1, '이가') → 'C2가' (숫자는 읽는 소리로 받침을 가린다) */
const 군 = (c, 짝) => `C${c + 1}${짝 ? 조사(`C${c + 1}`, 짝) : ''}`;

/** 오렌지 박스플롯 한 줄에 쓰는 값 — 평균·표준편차·사분위·가장 작은/큰 값 */
export function 상자읽기(값들) {
  return { 평균: 평균(값들), 표준편차: 표준편차(값들), q1: 사분위(값들, 0.25), 중앙: 중앙값(값들), q3: 사분위(값들, 0.75), 최소: Math.min(...값들), 최대: Math.max(...값들) };
}

/** 오렌지 박스플롯 모양을 흉내 낸 한 줄 그림 — 점선(가장 작은~큰 값) · 파란 상자(사분위) · 진한 파란 선(평균 ± 표준편차) · 노란 선(중앙값) */
function 오렌지상자(v, 이름) {
  const 너비 = 520, 왼 = 24, 오른 = 너비 - 24;
  const lo = Math.floor(v.최소 - 2), hi = Math.ceil(v.최대 + 2);
  const x = (t) => 왼 + ((t - lo) / (hi - lo)) * (오른 - 왼);
  const y = 66, 눈금 = [];
  for (let t = Math.ceil(lo / 5) * 5; t <= hi; t += 5) 눈금.push(t);
  return s('svg', { viewBox: `0 0 ${너비} 150`, class: 'orange-box', role: 'img', 'aria-label': `${이름} 평균기온 박스플롯` },
    s('text', { x: x(v.평균), y: 30, 'text-anchor': 'middle', class: 'ob-label' }, s('tspan', { fill: '#5a2bd6' }, `${이름}: `), `${수(v.평균, 3)} ± ${수(v.표준편차, 2)}`),
    s('line', { x1: x(v.최소), x2: x(v.최대), y1: y, y2: y, stroke: '#3333cc', 'stroke-width': 1.5, 'stroke-dasharray': '2 3' }),
    s('rect', { x: x(v.q1), y: y - 11, width: Math.max(2, x(v.q3) - x(v.q1)), height: 22, fill: '#6aa6f8' }),
    s('line', { x1: x(v.평균 - v.표준편차), x2: x(v.평균 + v.표준편차), y1: y, y2: y, stroke: '#1010b0', 'stroke-width': 2.5 }),
    s('line', { x1: x(v.평균), x2: x(v.평균), y1: y - 11, y2: y + 11, stroke: '#1010b0', 'stroke-width': 2.5 }),
    s('line', { x1: x(v.중앙), x2: x(v.중앙), y1: y - 11, y2: y + 11, stroke: '#f2cf1d', 'stroke-width': 3 }),
    [v.q1, v.중앙, v.q3].map((t, i) => s('text', { x: x(t) + [-8, 0, 8][i], y: y + 28, 'text-anchor': ['end', 'middle', 'start'][i], class: 'ob-num' }, 수(t, 1))),
    s('line', { x1: 왼, x2: 오른, y1: 122, y2: 122, stroke: '#888', 'stroke-width': 2 }),
    눈금.map((t) => s('text', { x: x(t), y: 140, 'text-anchor': 'middle', class: 'ob-num' }, String(t))));
}

/** 눈금 간격을 1·2·2.5·5 × 10ⁿ 가운데 알맞은 것으로 고른다 */
function 좋은간격(대략) {
  const 자리 = 10 ** Math.floor(Math.log10(대략 || 1));
  return [1, 2, 2.5, 5, 10].map((m) => m * 자리).find((d) => d >= 대략) || 10 * 자리;
}

/**
 * 오렌지 3.40 박스플롯처럼 여러 줄을 한 그림에 — 줄마다 점선(가장 작은~큰 값) · 파란 상자(사분위) ·
 * 진한 파란 선(평균 ± 표준편차) · 노란 선(중앙값).
 *  · 이름표(Annotate): 켜면 위에 「C1: 평균 ± 표준편차」, 아래에 사분위·중앙값 숫자를 적는다(끄면 이름만).
 *  · 비교: '평균' · '중앙값' 이면 줄마다 그 값 자리에 세로선을 위아래로 그어 줄끼리 견주게 한다. '없음' 이면 긋지 않는다.
 * 줄들: [{ 이름, 색, 값들 }] — 값이 없는 줄은 「값 없음」 만 적는다.
 */
function 오렌지상자들(줄들, { 이름표 = true, 비교 = '평균', 변수이름 = '' } = {}) {
  const 너비 = 600, 왼 = 22, 오른 = 너비 - 22, 위 = 6;
  const 촘촘 = 줄들.length > 5;
  const 줄높이 = 이름표 ? (촘촘 ? 48 : 58) : (촘촘 ? 34 : 42), 상자 = 촘촘 ? 14 : 20;
  const 읽음 = 줄들.map((z) => ({ ...z, v: z.값들.length ? 상자읽기(z.값들) : null }));
  const 끝값 = 읽음.filter((z) => z.v).flatMap((z) => [z.v.최소, z.v.최대]);
  const 간격 = 좋은간격(((Math.max(...끝값) - Math.min(...끝값)) || 1) / 7);
  const lo = Math.floor(Math.min(...끝값) / 간격) * 간격, hi = Math.ceil(Math.max(...끝값) / 간격) * 간격;
  const x = (t) => 왼 + ((t - lo) / (hi - lo || 1)) * (오른 - 왼);
  const 바닥 = 위 + 읽음.length * 줄높이 + 4, 높이 = 바닥 + 40;
  const 자릿수 = 간격 < 1 ? 2 : 1;
  const 가운데 = (i) => 위 + i * 줄높이 + (이름표 ? 18 : 12) + 상자 / 2;
  const 눈금 = [];
  for (let t = lo; t <= hi + 간격 / 2; t += 간격) 눈금.push(+t.toFixed(4));
  const 비교선 = 비교 === '없음' ? [] : 읽음.filter((z) => z.v).map((z) => s('line', {
    x1: x(비교 === '평균' ? z.v.평균 : z.v.중앙), x2: x(비교 === '평균' ? z.v.평균 : z.v.중앙), y1: 위, y2: 바닥,
    stroke: z.색 || '#1010b0', 'stroke-width': 1.2, 'stroke-opacity': 0.7, 'stroke-dasharray': 비교 === '평균' ? '' : '4 3' }));
  return s('svg', { viewBox: `0 0 ${너비} ${높이}`, class: 'orange-box bp-plot', role: 'img', 'aria-label': `${변수이름} 박스플롯` },
    비교선,
    읽음.map((z, i) => {
      const y = 가운데(i), 반 = 상자 / 2;
      const 이름글 = s('tspan', { fill: z.색 || '#5a2bd6' }, z.이름);
      if (!z.v) return s('text', { x: 왼, y: y + 4, class: 'ob-num' }, 이름글, '  (값 없음)');
      const v = z.v;
      // Annotate — 아래 숫자는 서로 가까우면(28px 안) 겹치지 않게 사분위 쪽을 뺀다
      const 아래숫자 = !이름표 ? [] : [[v.q1, -6, 'end'], [v.중앙, 0, 'middle'], [v.q3, 6, 'start']]
        .filter(([t], j) => j === 1 || Math.abs(x(t) - x(v.중앙)) >= 28)
        .map(([t, 밀기, 맞춤]) => s('text', { x: x(t) + 밀기, y: y + 반 + 13, 'text-anchor': 맞춤, class: 'ob-num' }, 수(t, 자릿수)));
      return s('g', {},
        s('text', { x: 이름표 ? Math.min(Math.max(x(v.평균), 70), 너비 - 70) : 왼, y: y - 반 - 5, 'text-anchor': 이름표 ? 'middle' : 'start', class: 'ob-label' },
          이름글, 이름표 ? `: ${수(v.평균, 3)} ± ${수(v.표준편차, 2)}` : ''),
        s('line', { x1: x(v.최소), x2: x(v.최대), y1: y, y2: y, stroke: '#3333cc', 'stroke-width': 1.5, 'stroke-dasharray': '2 3' }),
        s('rect', { x: x(v.q1), y: y - 반, width: Math.max(2, x(v.q3) - x(v.q1)), height: 상자, fill: '#6aa6f8' }),
        s('line', { x1: x(v.평균 - v.표준편차), x2: x(v.평균 + v.표준편차), y1: y, y2: y, stroke: '#1010b0', 'stroke-width': 2.5 }),
        s('line', { x1: x(v.평균), x2: x(v.평균), y1: y - 반, y2: y + 반, stroke: '#1010b0', 'stroke-width': 2.5 }),
        s('line', { x1: x(v.중앙), x2: x(v.중앙), y1: y - 반, y2: y + 반, stroke: '#f2cf1d', 'stroke-width': 3 }),
        아래숫자);
    }),
    s('line', { x1: 왼, x2: 오른, y1: 바닥, y2: 바닥, stroke: '#888', 'stroke-width': 1.5 }),
    눈금.map((t) => s('text', { x: x(t), y: 바닥 + 16, 'text-anchor': 'middle', class: 'ob-num' }, String(t))),
    s('text', { x: 너비 / 2, y: 바닥 + 34, 'text-anchor': 'middle', class: 'ob-num' }, 변수이름));
}

/**
 * 날마다의 실루엣 — 오렌지 k평균군집화가 내보내는 「실루엣 (Silhouette)」 열과 같은 값.
 * 오렌지는 실루엣 s 를 그대로 내보내지 않고 arctan(s)/π + 0.5 로 바꿔 0~1 사이에 둔다(owkmeans.py).
 * 정규화하고 빈칸을 평균으로 채운 표 위에서 잰다(오렌지와 같은 차례). k 마다 한 번만 셈한다.
 */
const 실루엣기억 = new Map();
export function 날마다실루엣(k) {
  if (!실루엣기억.has(k)) {
    const { 행들 } = 준비(날씨들().map((d) => d.값), true);
    실루엣기억.set(k, 실루엣(행들, 군집(k).군집).값.map((v) => Math.atan(v) / Math.PI + 0.5));
  }
  return 실루엣기억.get(k);
}

/** 열별 통계량(Column Statistics) 창의 값 — 빈칸(?)은 빼고 센다 */
export const 속성통계 = () => 속성.map((이름, j) => {
  const 일 = 날씨들(), v = 일.map((d) => d.값[j]).filter((x) => x !== null);
  return { 이름, 짧은: 짧은속성[j], 평균: 평균(v), 중앙: 중앙값(v), 최소: Math.min(...v), 최대: Math.max(...v), 빈: 일.length - v.length };
});

// 속성마다 뜻과 단위 — 첫 행을 예로 읽어 준다
function 속성뜻보기() {
  const 첫 = 날씨들()[0];
  return 창('📖 속성마다 뜻과 단위 (한 행 = 하루)', h('div', {},
    h('table', { class: 'kv small' },
      h('thead', {}, h('tr', {}, h('th', {}, '속성'), h('th', {}, '뜻'), h('th', {}, '단위'))),
      h('tbody', {},
        h('tr', {}, h('td', {}, '일시'), h('td', {}, '관측한 날짜'), h('td', {}, '날짜')),
        h('tr', {}, h('td', {}, '강수량'), h('td', {}, '하루 동안 내린 비(눈)의 양. 기상자료개방포털 자료는 비가 오지 않은 날을 빈칸(?)으로 두고, 0.0 은 비가 왔지만 0.1mm 가 안 된 날이에요'), h('td', {}, 'mm')),
        h('tr', {}, h('td', {}, '평균기온'), h('td', {}, '하루의 평균 기온'), h('td', {}, '℃')),
        h('tr', {}, h('td', {}, '평균풍속'), h('td', {}, '하루의 평균 바람 세기'), h('td', {}, 'm/s')),
        h('tr', {}, h('td', {}, '일조합'), h('td', {}, '하루 동안 햇빛이 구름에 가리지 않고 비친 시간을 모두 더한 것'), h('td', {}, '시간(hr)')))),
    h('p', { class: 'small' }, md(`예) 첫 행 **${첫.일시}** — 강수량 ${첫.값[0] ?? '?'} · 평균기온 ${첫.값[1]}℃ · 평균풍속 ${첫.값[2]}m/s · 일조합 ${첫.값[3]}시간 → **비가 아주 조금 오고 해가 4시간쯤 난 쌀쌀한 겨울날**`))));
}
const 옷들 = ['🩳 반바지', '👕 반팔', '👚 얇은 긴팔', '🧥 가디건', '🧶 니트', '🧥 코트', '🧣 패딩·목도리', '☂️ 우산', '🧢 모자', '🕶️ 선글라스', '🌬️ 바람막이', '🥾 장화'];

// ── 6단원 활동 정리 PDF (2026-11-09 사용자 지시) — 1~17번 카드의 활동 + 18번 마무리 카드의 작업 화면 ──
export const PDF활동 = 활동목록([
  [2, 'u6.download', '기상 자료 받는 순서'], [2, 'u6.columns-pick', '자료마다 가져올 열'], [3, 'u6.flow', '위젯 흐름 만들기'],
  [4, 'u6.missing', '데이터 살펴보기 퀴즈'], [5, 'u6.select', '쓸 속성 고르기'], [5, 'u6.target-q', 'Target 과 비지도 학습'],
  [6, 'u6.dist', '분포 살펴보기'], [7, 'u6.range', '속성마다 범위 셈하기'], [7, 'u6.norm-why', '정규화 까닭 쓰기'], [7, 'u6.range-q', '거리를 좌우하는 속성'],
  [8, 'u6.kmeans', '실루엣 점수 보기'], [9, 'u6.k-pick', 'k 정하기'], [9, 'u6.k-q', '실루엣 최고 k 만 정답일까'], [9, 'u6.k-why', 'k 와 그 까닭 쓰기'],
  [10, 'u6.impute', 'Impute 위젯 자리'], [11, 'u6.count-q', '군집별 날 수'], [12, 'u6.boxplot', '속성 바꿔 상자그림 보기'],
  [13, 'u6.box-read', '박스플롯 읽기'], [14, 'u6.month-q', '군집마다 어느 계절'], [15, 'u6.fill', '군집별 날 수·평균 채우기'], [16, 'u6.outfit', '나만의 옷차림 표'],
  [17, 'u6.summary', '분석 결과 정리 문장'], [17, 'u6.same-temp', '(2) 기온은 비슷한데 다른 군집'], [17, 'u6.why-cluster', '(3) 좋은 점과 아쉬운 점'],
], { 카드: 18, 열쇠: 'u6.shot' });   // 2026-11-16 — 15번 빈칸 채우기를 넣고 옛 17번(체감온도) 카드를 뺐다

export default {
  id: 'u6', 번호: 6, 활동: PDF활동, 색: '#2fa36b', 갈래: '프로젝트 2 · 군집 분석',
  제목: '날씨와 옷차림', 부제: '군집 분석으로 기온별 옷차림 표를 그려보자',
  카드: [
    카드('재원이의 아침 고민', '이야기', (몸) => {
      // 세 칸 — 말풍선 · 재원이가 본 그림 · 프로젝트의 길
      채우기(몸, h('div', { class: 'story3' },
        h('div', {},
          말풍선('👦', '재원', ['계절이 바뀔 때마다 옷장 앞에서 고민이야. 반팔? 긴팔? 겉옷은?', 'SNS 에서 이 「기온별 옷차림 표」 를 봤는데, **기온이 같아도** 바람이 불거나 비가 오면 훨씬 춥더라.']),
          말풍선('🍊', '선생님', '기온 하나가 아니라 **비·바람·햇볕** 까지 함께 보고, **비슷한 날씨끼리 묶어** 보면 어떨까? 그게 **군집 분석** 이야.')),
        h('figure', { class: 'sns-pic' },
          h('button', { type: 'button', class: 'sns-pic-btn', onclick: 옷차림그림크게, title: '누르면 크게 보여요', 'aria-label': '기온별 옷차림 표 크게 보기' },
            h('img', { src: 옷차림그림, alt: 옷차림그림설명 })),
          h('figcaption', { class: 'small muted' }, '재원이가 SNS 에서 본 표 · 누르면 크게 보여요', h('br'), '(인터넷에 널리 도는 그림 · 만든 사람 모름)')),
        h('div', { class: 'box' },
          h('table', { class: 'kv small' }, h('tbody', {},
            h('tr', {}, h('th', {}, '단원'), h('td', {}, 'Ⅲ. 데이터 모델링과 평가 — 03. 군집 분석')),
            h('tr', {}, h('th', {}, '성취기준'), h('td', {}, '[12데과03-03] 데이터 속성의 유사성을 재고 분석해 군집을 만들고, 군집 분석 결과의 의미를 해석한다.')),
            h('tr', {}, h('th', {}, '학습 요소'), h('td', {}, '군집 분석, k-평균 군집 분석')))),
          h('h3', { style: { marginTop: '10px' } }, '🗺️ 이번 프로젝트의 길'),
          h('ol', { class: 'small' },
            h('li', {}, '문제 정의 — 여러 기상 요소로 상황에 맞는 옷차림 고르기'),
            h('li', {}, '기상자료개방포털에서 기온·강수량·바람·일조 자료 받아 합치기'),
            h('li', {}, '분석에 쓸 속성 고르기'),
            h('li', {}, 'Distributions(히스토그램)로 분포 보기'),
            h('li', {}, 'k-평균 군집 분석 → Box Plot 으로 군집 특징 보기'),
            h('li', {}, '군집별 옷차림 표를 만들어 나누기')))));
    }, '교재 36쪽'),

    카드('단계 2 · 기상 자료 모으기', '활동', (몸) => {
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', {}, md('**기상자료개방포털** (data.kma.go.kr) 에서 자료를 받는 순서를 맞혀 보세요.')),
          순서(['기상자료개방포털에 접속한다', '[기후통계분석] → [통계분석] → [조건별통계] 를 고른다', '내 지역(지점)·기간(일 단위, 1년)을 조건으로 정한다', '[csv] 로 내려받는다', '파일을 열어 메타 정보가 적힌 윗줄을 지우고 저장한다'], { 열쇠: 'u6.download' }),
          h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn small', onclick: 메타정보보기 }, '🔎 메타 정보란?'),
            h('span', { class: 'small muted' }, '사이트 메뉴 이름은 바뀔 수 있어요.'))),
        h('div', {},
          h('p', {}, md('기온 말고도 **강수량·바람·일조일사** 자료를 같은 조건으로 받아, 필요한 열만 한 파일에 모아요. 어느 자료에서 어떤 열을 가져올까요?')),
          짝짓기([
            { 왼: '🌧️ 강수량 자료', 답: '강수량(mm)' },
            { 왼: '🌡️ 기온 자료', 답: '평균기온(℃)' },
            { 왼: '🌬️ 바람 자료', 답: '평균풍속(m/s)' },
            { 왼: '☀️ 일조일사 자료', 답: '일조합(hr)' },
          ], 속성, { 열쇠: 'u6.columns-pick' }),
          h('div', { class: 'tip' }, '💡 교재와 다른 속성(습도, 최저기온 등)을 골라도 좋아요!'),
          // 정리를 마친 실제 관측값 — 직접 받기 어려울 때 이 파일로 오렌지 실습을 시작한다.
          // ⚠ 1280×720 에서 왼쪽 순서 맞추기를 다 풀면 왼쪽 칸이 꽉 차므로 이 칸에 한 줄 단추로 둔다
          h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn small green', onclick: 날씨csv내려받기, title: `${날씨csv.이름} 내려받기` }, '📥 정리를 마친 파일 내려받기'),
            h('span', { class: 'small muted' }, 날씨csv.이름)),
          h('p', { class: 'muted small' }, md(`위 네 열을 모은 **실제 관측값**(서울 2024년 ${날씨csv.줄}일, 출처: 기상청 기상자료개방포털)이에요. 이 단원의 그래프·군집도 이 파일로 그렸어요.`)))));
    }, '교재 37~38쪽'),

    카드('오렌지에서 위젯 흐름 만들기', '오렌지', (몸) => {
      채우기(몸,
        h('p', { class: 'small' }, md('이번 프로젝트의 **전체 위젯 흐름** 이에요. 할 일을 읽고 알맞은 위젯을 차례로 이어 보세요.')),
        // ⚠ 자리(x·y)는 오른쪽 네 위젯(85 간격)의 이름이 아래 위젯 동그라미와 겹치지 않게 맞춘 값이다
        흐름조립([
          { id: 'f', 위젯: 'File', 부제: '날씨', 부모: [], 할일: '모아 둔 **날씨 csv** 를 불러와요.', x: 70, y: 175 },
          { id: 'dt', 위젯: 'Data Table', 부모: ['f'], 할일: '데이터를 **표로 확인** 해요. (빈칸 ? 도 찾아봐요)', x: 230, y: 60 },
          { id: 'sc', 위젯: 'Select Columns', 부모: ['f'], 할일: '분석에 쓸 **속성만 골라요**.', x: 230, y: 250 },
          { id: 'di', 위젯: 'Distributions', 부모: ['sc'], 할일: '속성마다 **분포(히스토그램)** 를 봐요.', x: 440, y: 50 },
          { id: 'cs', 위젯: 'Column Statistics', 부모: ['sc'], 할일: '속성마다 **가장 작은 값·가장 큰 값** 을 표로 봐요.', x: 440, y: 165 },
          { id: 'km', 위젯: 'k-Means', 부모: ['sc'], 할일: '비슷한 날끼리 **k 개 군집으로 묶어요**.', x: 440, y: 290 },
          { id: 'sp', 위젯: 'Scatter Plot', 부모: ['km'], 할일: '색을 **군집 (Cluster)** 으로 바꿔 군집을 점으로 봐요.', x: 670, y: 40 },
          { id: 'd2', 위젯: 'Distributions', 부제: '군집별', 부모: ['km'], 할일: '변수를 **군집 (Cluster)** 으로 골라 군집마다 **며칠** 인지 세요.', x: 670, y: 125 },
          { id: 'bp', 위젯: 'Box Plot', 부모: ['km'], 할일: '군집마다 속성의 **상자그림** 을 견줘요.', x: 670, y: 210 },
          { id: 'dt2', 위젯: 'Data Table', 부제: '군집별', 부모: ['km'], 할일: '군집마다 **어떤 날짜** 가 묶였는지 표로 봐요.', x: 670, y: 295 },
        ], { 열쇠: 'u6.flow', 팔레트: ['File', 'Data Table', 'Select Columns', 'Column Statistics', 'Merge Data', 'Scatter Plot', 'Distributions', 'Box Plot', 'Linear Regression', 'k-Means', 'Test and Score'], 높이: 370, 너비: 860 }));
    }, '교재 39~43쪽'),

    카드('Data Table — 데이터 살펴보기', '오렌지', (몸) => {
      const 일 = 날씨들();
      const 빈칸 = 일.filter((d) => d.값[0] === null).length;
      채우기(몸, h('div', { class: 'two wide-left' },
        데이터표(['일시', ...속성], 일.map((d) => [d.일시, ...d.값]), { 최대행: 10, 메타: [0], 설명: `${일.length} instances · 4 features · 일시(meta)` }),
        h('div', {},
          h('p', {}, md(`서울 2024년 실제 데이터는 **${일.length}일** (2024년은 윤년!) × **4개 속성** 이에요. 강수량 칸에 **?** 가 많지요?`)),
          h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn small', onclick: 속성뜻보기 }, '📖 속성마다 뜻과 단위')),
          퀴즈([
            { 질문: '이 데이터는 몇 행(날), 일시까지 몇 열일까요?', 보기: [`${일.length}행 · 5열`, `${일.length}행 · 4열`, `5행 · ${일.length}열`], 답: 0,
              해설: `표 아래 「${일.length} instances · 4 features · 일시(meta)」 를 읽어요. 한 행이 하루이고, 날씨 속성 4개에 일시까지 5열이에요.` },
            { 질문: `강수량이 ? 인 날이 ${빈칸}일이에요. 이 빈칸은 무엇일 가능성이 높을까요?`, 보기: ['측정을 못 한 날', '비가 오지 않은 날'], 답: 1, 해설: `기상자료개방포털 자료는 비가 안 온 날의 강수량을 빈칸으로 둬요. 평균풍속·일조합에도 ? 가 ${일.filter((d) => d.값[2] === null).length}일씩 있는데, 그건 측정을 못 한 날이에요. 빈칸의 뜻은 **메타 데이터(자료 설명)** 로 꼭 확인해요.`, 힌트: '366일 가운데 비 오는 날이 얼마나 될지 생각해 보세요.' },
            { 질문: '빈칸의 뜻이 「0mm」 라면 알맞은 처리는?', 보기: ['평균으로 채운다', '0 으로 채운다', '그 날을 지운다'], 답: 1, 해설: `평균(약 ${수(속성통계()[0].평균, 0)}mm)으로 채우면 비 안 온 날이 비 온 날처럼 바뀌어요. 다음다음 카드에서 그 차이를 직접 봐요.` },
          ], { 열쇠: 'u6.missing' }))));
    }, '교재 39쪽'),

    카드('Select Columns — 쓸 속성 고르기', '오렌지', (몸) => {
      채우기(몸, h('div', { class: 'two wide-left' },
        열고르기(['일시', ...속성], { 일시: 'Metas', ...Object.fromEntries(속성.map((k) => [k, 'Features'])) }, { 열쇠: 'u6.select', 처음: { 일시: 'Features', ...Object.fromEntries(속성.map((k) => [k, 'Features'])) } }),
        h('div', {},
          h('p', {}, md('군집은 **네 기상 요소** 로 만들어요. 날짜(일시)는 계산에 쓰지 않으니 **Metas** 로 옮겨요.')),
          h('div', { class: 'tip' }, md('💡 군집 분석에는 **Target(종속 변수)이 없어요.** 정답 없이 비슷한 것끼리 묶기만 하기 때문이에요. 회귀 분석과 가장 다른 점이에요.')),
          퀴즈([
            { 질문: '이번 분석에서 **Target** 칸에 넣을 속성이 필요할까요?', 보기: ['필요 없다', '필요하다'], 답: 0, 해설: '맞힐 정답이 없어요. 속성 값이 가까운 날끼리 스스로 묶어요.' },
            { 질문: '정답(Target) 없이 비슷한 데이터끼리 묶는 학습은?', 보기: ['비지도 학습', '지도 학습', '강화 학습'], 답: 0,
              해설: '회귀·분류는 정답이 있는 데이터로 배우는 **지도 학습**(예: 광고비 → 매출), 군집 분석은 정답 없이 묶는 **비지도 학습** 이에요.' },
          ], { 열쇠: 'u6.target-q' }))));
    }, '교재 39~40쪽'),

    카드('Distributions — 분포 살펴보기', '오렌지', (몸) => {
      const 일 = 날씨들();
      let 속성번호 = 다푼모습('u6.dist') ? 1 : 0, 구간 = 14;   // 캡처 모드 — 끝냈으면 다른 속성(평균기온)을 본 모습
      const 그림 = h('div', {}), 설명 = h('div', {});
      const 그리기 = () => {
        const 값들 = 일.map((d) => d.값[속성번호]).filter((v) => v !== null);
        채우기(그림, 히스토그램([{ 이름: 속성[속성번호], 값들, 색: '#2fa36b' }], { 구간수: 구간, x이름: 속성[속성번호], 너비: 520, 높이: 300 }).svg);
        // 설명 속 숫자는 모두 실제 데이터로 셈한다 — 빈칸(?)은 오렌지처럼 빼고 그린다
        채우기(설명, h('p', {}, md([
          `빈칸이 아닌 **${값들.length}일** 가운데 **${값들.filter((v) => v <= 10).length}일** 이 **10mm 이하** 인데 **${수(Math.max(...값들), 1)}mm** 같은 큰비도 있어요. 오른쪽으로 꼬리가 길어요.`,
          `겨울(**${수(Math.min(...값들), 1)}℃**)부터 한여름(**${수(Math.max(...값들), 1)}℃**)까지 **넓게** 퍼져 있어요. 봉우리가 둘인 것 같기도 하지요?`,
          `대부분 **2m/s 근처** 에 몰려 있고(1.5~3m/s 가 ${값들.filter((v) => v >= 1.5 && v <= 3).length}일), **5m/s 이상** 인 날은 ${값들.filter((v) => v >= 5).length}일뿐이에요.`,
          `해가 거의 안 난 날(2시간 미만 ${값들.filter((v) => v < 2).length}일)과 맑은 날(8시간 이상 ${값들.filter((v) => v >= 8).length}일)로 나뉘는 모습이 보여요.`,
        ][속성번호])));
        if (속성번호 > 0) 마침('u6.dist');
      };
      그리기();
      채우기(몸, h('div', { class: 'two wide-right' },
        h('div', {},
          위젯창('Distributions',
            묶음상자('Variable', 고르기단추(짧은속성, 속성번호, (i) => { 속성번호 = i; 그리기(); })),
            h('label', { class: 'slider-row' }, 'Bin width', (() => { const r = h('input', { type: 'range', min: 5, max: 30, value: 구간 }); r.addEventListener('input', () => { 구간 = Number(r.value); 그리기(); }); return r; })())),
          설명,
          h('p', { class: 'small muted' }, '💡 Distributions 에서 Fitted distribution 을 Normal 로 고르면 정규분포 곡선을 겹쳐 볼 수 있어요.')),
        그림));
    }, '교재 39~40쪽'),

    // 열별 통계량(Column Statistics) 창에서 가장 작은 값·가장 큰 값을 읽어 범위를 견주고, 그것을 근거로 정규화가 왜 필요한지 쓴다
    카드('값의 범위 견주기 — 왜 정규화할까?', '오렌지', (몸) => {
      const 통계 = 속성통계();
      const 범위 = (t) => t.최대 - t.최소;
      const 넓은 = 통계.reduce((a, b) => (범위(b) > 범위(a) ? b : a)), 좁은 = 통계.reduce((a, b) => (범위(b) < 범위(a) ? b : a));
      const 단위 = ['mm', '℃', 'm/s', '시간'];
      const 다함 = 끝났나('u6.range');
      const 칸들 = 통계.map((t) => h('input', { type: 'text', class: 'blank', inputmode: 'decimal', size: 5, 'aria-label': `${t.짧은} 범위`, value: 다함 ? 수(범위(t), 1) : '' }));
      const 줄 = 알림줄();
      const 확인 = () => {
        let 맞음 = 0;
        칸들.forEach((inp, j) => {
          const 글 = inp.value.trim(), ok = 글 !== '' && Math.abs(Number(글) - 범위(통계[j])) <= 0.051;
          inp.classList.toggle('ok', ok); inp.classList.toggle('bad', !ok);
          if (ok) 맞음++;
        });
        if (맞음 === 통계.length) { 줄.맞음(`맞았어요! **${넓은.짧은}** 범위가 **${좁은.짧은}** 의 **${Math.round(범위(넓은) / 범위(좁은))}배** 예요.`); 마침('u6.range'); }
        else 줄.틀림(`${통계.length}칸 중 ${맞음}칸 맞았어요. 범위 = **Max. − Min.** 이에요. 왼쪽 창에서 읽어 보세요.`);
      };
      if (다함) 줄.맞음(`범위가 가장 넓은 것은 **${넓은.짧은}** 이에요.`);
      // 정규화 까닭 쓰기의 모범답안 — 띄어쓰기 빼고 10글자 이상 쓰면 칸 아래에 보인다(2026-11-15 사용자 지시).
      // 숫자는 어림해 적는다 — 옆 (1) 의 범위 정답(Max. − Min.)을 그대로 알려 주지 않게
      const 단위of = (t) => 단위[통계.indexOf(t)];
      // 학생이 학습지에 적는 말투로(2026-11-16 사용자 지시) — 굵은 글씨 없이 「~다」 로 끝내고, 칸의 예시 틀(○○ 은 범위가 …인데 …)을 따른다
      // ⚠ 1280×720 에서 왼쪽 칸에 세 줄까지만 들어간다 — 길게 늘리면 카드가 넘친다
      const 모범답안 = `${넓은.짧은}${조사(넓은.짧은, '은는')} 범위가 약 ${Math.round(범위(넓은) / 10) * 10}${단위of(넓은)}인데 ${좁은.짧은}${조사(좁은.짧은, '은는')} 약 ${Math.round(범위(좁은))}${단위of(좁은)}밖에 안 돼서 `
        + `${Math.floor(범위(넓은) / 범위(좁은) / 10) * 10}배 넘게 차이가 난다. 그래서 정규화하지 않으면 거리를 잴 때 ${넓은.짧은} 차이가 거의 다 차지해서 `
        + '나머지 속성들은 군집을 나누는 데 별 영향을 못 준다.';
      const 통계창 = 위젯창({ 이름: 'Column Statistics', 제목: '열별 통계량 (Column Statistics)', 작게: true },
        h('div', { class: 'ow-table-wrap' }, h('table', { class: 'ow-table' },
          h('thead', {}, h('tr', {}, ['열', '평균', '중앙값', 'Min.', 'Max.', 'Missing'].map((t) => h('th', {}, t)))),
          h('tbody', {}, 통계.map((t) => h('tr', {}, h('td', { class: 'name' }, h('span', { class: 'ow-type' }, 'N'), ` ${t.이름}`),
            h('td', {}, 수(t.평균, 3)), h('td', {}, 수(t.중앙, 1)), h('td', {}, 수(t.최소, 1)), h('td', {}, 수(t.최대, 1)), h('td', {}, `${t.빈} (${Math.round((t.빈 / 날씨들().length) * 100)} %)`)))))),
        h('div', { class: 'ow-foot' }, h('label', { class: 'ow-radio' }, h('input', { type: 'checkbox', checked: true, disabled: true }), ' 자동 전송 (Send Automatically)'), h('span', { class: 'ow-count' }, `⇥ ${날씨들().length}`)));
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          통계창,
          h('div', { class: 'concept' }, md('**정규화** — 단위·크기가 달라도 같은 무게로 견주게 값을 바꾸기. k-Means 의 **열 정규화** 는 속성마다 **평균 0, 표준편차 1** 로 바꿔요.')),
          h('div', { class: 'norm-why' }, 쓰기('u6.norm-why', { 안내: '표를 근거로, 거리를 재기 전에 **정규화해야 하는 까닭** 을 적어 보세요.', 줄수: 2, 예시: '예) ○○ 은 범위가 …인데 ○○ 은 …라서, 정규화하지 않으면 …',
            답안: 모범답안, 답안글자: 10, 답안제목: '💡 모범답안 — ' }))),
        h('div', {},
          h('p', { class: 'write-label' }, md('**(1)** 열 선택에 **열별 통계량** 을 이으면 속성마다 Min.·Max. 가 나와요. 속성마다 **범위(Max. − Min.)** 를 셈해 보세요.')),
          h('table', { class: 'kv small calc' },
            h('thead', {}, h('tr', {}, h('th', {}, '속성'), h('th', {}, '단위'), h('th', { class: 'num' }, '범위'))),
            h('tbody', {}, 통계.map((t, j) => h('tr', {}, h('td', {}, t.짧은), h('td', {}, 단위[j]), h('td', { class: 'num' }, 칸들[j]))))),
          h('div', { class: 'row check' }, h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '정답 확인'), 줄),
          퀴즈([
            { 질문: '정규화하지 않고 거리를 재면, 군집을 가르는 데 **가장 큰 힘** 을 쓰는 속성은?', 보기: 짧은속성, 답: 통계.indexOf(넓은),
              해설: `거리는 숫자 차이로 재요. 범위가 ${수(범위(넓은), 1)}인 ${넓은.짧은}${조사(넓은.짧은, '이가')} 거리를 거의 다 차지해요.` },
          ], { 열쇠: 'u6.range-q', 번호: '(2)' }))));
    }, '교재 39~41쪽'),

    카드('k-Means — 몇 개로 묶을까?', '오렌지', (몸) => {
      const 최고 = 가장좋은k();
      let 정규화 = true, 고른k = 내k();
      const 목록 = h('div', { class: 'km-sil' }), 그림 = h('div', {}), 줄 = 알림줄();
      const 출력 = h('span', { class: 'ow-count' });
      const 그리기 = () => {
        const 결과들 = [2, 3, 4, 5, 6, 7, 8].map((k) => ({ k, 실: 군집(k, 정규화).실 }));
        const 최고k = 결과들.reduce((a, b) => (b.실 > a.실 ? b : a)).k;
        const 최고실 = Math.max(...결과들.map((r) => r.실));
        // 줄을 누르면 오렌지처럼 그 k 의 결과가 다음 위젯으로 넘어간다 — 이 앱에서는 뒤 카드(산점도·Box Plot·옷차림 표)가 그 k 로 그린다
        // 한국어판 오렌지처럼 — 왼쪽 회색 칸에 k, 오른쪽에 점수와 그 아래 하늘색 막대, 고른 줄은 파랗게
        채우기(목록, 결과들.map(({ k, 실 }) => h('button', {
          type: 'button', class: `km-row${k === 고른k ? ' on' : ''}`, 'aria-pressed': String(k === 고른k), 'aria-label': `k = ${k}, 실루엣 ${수(실, 3)}`,
          onclick: () => { 고른k = k; if (정규화) 글쓰기('u6.k', String(k)); 그리기(); },
        }, h('span', { class: 'km-k' }, String(k)),
        h('span', { class: 'km-score' }, 수(실, 3), h('span', { class: 'km-bar', style: { width: `${Math.max(0, 실) / 최고실 * 85}%` } })))));
        // 상태 줄 — 들어온 줄 수 ⇥ 와 나가는 두 표(데이터 · 중심점)의 줄 수 ↦. 중심점 표는 군집 수만큼 줄이 있다
        출력.textContent = `⇥ ${날씨들().length}   ↦ ${날씨들().length} | ${고른k}`;
        const r = 군집(고른k, 정규화), 일 = 날씨들();
        채우기(그림, 산점도(일.map((d, i) => ({ x: d.값[1], y: d.값[2], 색: 색들[r.군집[i]] })), { x이름: 속성[1], y이름: 속성[2], 너비: 460, 높이: 250, 반지름: 4 }).svg,
          h('div', { class: 'legend' }, Array.from({ length: 고른k }, (_, c) => h('span', { style: { '--c': 색들[c] } }, `C${c + 1} (${r.군집.filter((g) => g === c).length}일)`))));
        if (!정규화) 줄.틀림(`정규화를 끄면 숫자 범위가 큰 속성(강수량 0~${수(속성통계()[0].최대, 0)}mm)이 거리를 좌우해요. 군집이 거의 「비가 많이 온 날 / 나머지」 로만 갈려요.`);
        else 줄.알림(`가장 높은 것은 **k = ${최고k}** — 줄을 누르면 그 k 로 정해져요(지금 ${내k()}).`);
        if (정규화) 마침('u6.kmeans');
      };
      const 상자 = h('input', { type: 'checkbox', checked: true });
      상자.addEventListener('change', () => { 정규화 = 상자.checked; 그리기(); });
      그리기();
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          // 한국어판 오렌지 3.40 의 「k평균군집화」 창 (2026-11-15 사용자가 보낸 화면대로) — 바꿀 수 있는 것은 열 정규화와 k 고르기뿐, 나머지는 모양만
          위젯창({ 이름: 'k-Means', 제목: 'k평균군집화', 작게: true },
            h('div', { class: 'km-grid' },
              h('div', {},
                묶음상자('군집 수',
                  h('div', { class: 'km-line' }, h('label', { class: 'ow-radio off' }, h('input', { type: 'radio', disabled: true }), ' 고정:'), h('input', { type: 'number', class: 'ow-spin', value: 4, disabled: true, 'aria-label': '고정 군집 수' })),
                  h('div', { class: 'km-line' }, h('label', { class: 'ow-radio' }, h('input', { type: 'radio', checked: true, disabled: true }), ' 시작 (From)'), h('input', { type: 'number', class: 'ow-spin', value: 2, disabled: true, 'aria-label': '시작' }),
                    h('span', {}, '끝 (To)'), h('input', { type: 'number', class: 'ow-spin', value: 8, disabled: true, 'aria-label': '끝' }))),
                묶음상자('전처리 (Preprocessing)', h('label', { class: 'ow-radio' }, 상자, ' 열 정규화 (Normalize columns)')),
                묶음상자('초기화 방식',
                  h('select', { class: 'ow-combo full', disabled: true, 'aria-label': '초기화 방식' }, h('option', {}, 'KMeans++로 초기화')),
                  h('div', { class: 'km-line' }, h('span', { class: 'km-label' }, '재실행 횟수:'), h('input', { type: 'number', class: 'ow-spin', value: 10, disabled: true, 'aria-label': '재실행 횟수' })),
                  h('div', { class: 'km-line' }, h('span', { class: 'km-label' }, '최대 반복 횟수:'), h('input', { type: 'number', class: 'ow-spin', value: 300, disabled: true, 'aria-label': '최대 반복 횟수' }))),
                h('div', { class: 'km-apply' }, h('input', { type: 'checkbox', checked: true, disabled: true, 'aria-label': '자동 적용' }), h('button', { type: 'button', class: 'ow-btn', disabled: true }, '자동 적용 (Apply automatically)'))),
              묶음상자('실루엣 점수 (Silhouette Scores)', 목록)),
            h('div', { class: 'ow-foot' }, 출력)),
          줄),
        h('div', {}, 그림,
          교재메모(`교재 41쪽처럼 **k = ${최고}** 이 가장 높아요. 교재 그림(0.306)과 셋째 자리가 조금 다른 것은 오렌지 판마다 k-평균의 출발점이 달라서예요. 실루엣이 가장 높지 않아도 쓰기 편한 k 를 고를 수 있어요.`))));
    }, '교재 41쪽'),

    // 실루엣 점수만이 아니라 「쓸모」 로도 k 를 고른다 — k 마다 군집의 평균기온이 옷차림 몇 단계로 갈리는지 보여 준다
    카드('k 는 몇 개가 좋을까? — 점수와 쓸모', '활동', (몸) => {
      const 최고 = 가장좋은k();
      let 보기k = 내k();
      const 단추줄 = h('div', { class: 'seg' }), 표자리 = h('div', {}), 지금 = h('p', { class: 'small k-now' }), 줄 = 알림줄();
      const 그리기 = () => {
        채우기(단추줄, [2, 3, 4, 5, 6, 7, 8].map((k) => h('button', { type: 'button', class: k === 보기k ? 'on' : '', 'aria-pressed': String(k === 보기k), onclick: () => { 보기k = k; 줄.지우기(); 그리기(); } }, `k = ${k}`)));
        const 특징 = 군집특징(보기k), 단계수 = new Set(특징.map((f) => 단계찾기(f.평[1]))).size;
        채우기(표자리,
          h('p', { class: 'small' }, md(`실루엣 **${수(군집(보기k).실, 3)}**${보기k === 최고 ? ' (가장 높음)' : ''} · 군집 ${보기k}개의 평균기온이 옷차림 **${단계수}단계** 로 갈려요.`)),
          h('table', { class: 'kv small k-table' },
            h('thead', {}, h('tr', {}, ['군집', '날 수', '평균기온', '일조합', '많은 달', '옷차림'].map((t) => h('th', {}, t)))),
            h('tbody', {}, 특징.map((f) => h('tr', {}, h('td', { style: { color: 색들[f.c], fontWeight: 800 } }, `C${f.c + 1}`), h('td', { class: 'num' }, `${f.수}일`),
              h('td', { class: 'num' }, `${수(f.평[1], 1)}℃`), h('td', { class: 'num' }, `${수(f.평[3], 1)}h`), h('td', {}, f.많은달), h('td', {}, `${단계찾기(f.평[1])}단계`))))));
        채우기(지금, md(`지금 정한 k : **${내k()}** — 산점도·Box Plot·옷차림 표 카드가 이 k 로 그려져요.`));
      };
      const 정하기 = () => { 글쓰기('u6.k', String(보기k)); 마침('u6.k-pick'); 줄.맞음(`**k = ${보기k}** 로 정했어요. 아래에 그렇게 정한 까닭을 적어 두세요.`); 그리기(); };
      그리기();
      if (다푼모습('u6.k-pick')) 줄.맞음(`**k = ${내k()}** 로 정했어요.`);   // 캡처 모드
      채우기(몸, h('div', { class: 'two wide-left' },
        h('div', {},
          h('div', { class: 'row' }, 단추줄),
          표자리,
          h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', onclick: 정하기 }, '✅ 이 k 로 정하기'), h('button', { type: 'button', class: 'btn small', onclick: 옷차림표보기 }, '🌡️ 기온별 옷차림 표')),
          지금, 줄),
        h('div', {},
          퀴즈([{ 질문: `실루엣 점수가 가장 높은 **k = ${최고}** 만 정답일까요?`, 보기: ['아니다 — 또렷함과 함께 **쓸모** 도 본다', '그렇다 — 가장 높은 k 만 쓴다', 'k 는 클수록 언제나 좋다'], 답: 0,
            해설: 'k 가 작으면 「여름/겨울」 처럼 너무 크게 묶이고, 너무 크면 며칠짜리 군집으로 쪼개져요. 점수가 크게 떨어지지 않는 범위에서 **옷차림 단계로 쓰기 알맞은 개수** 를 골라요.' }], { 열쇠: 'u6.k-q' }),
          쓰기('u6.k-why', { 안내: '내가 고른 **k** 와 그렇게 정한 까닭을 적어 보세요.', 줄수: 3, 예시: '예) k = ○ — 실루엣 점수는 …지만, 옷차림을 …단계로 나눌 수 있어서' }))));
    }, '교재 41쪽'),

    카드('Normalize columns 와 빈칸 처리', '개념', (몸) => {
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'lead' }, md('1단원에서 「k-평균 전에는 정규화가 필요하다」 고 배웠지요. 그런데 오렌지 흐름에는 정규화 위젯이 없었어요. 왜일까요?')),
          h('div', { class: 'concept' }, md('오렌지 3.40 의 **k평균군집화** 위젯 안에 **열 정규화 (Normalize columns)** 칸이 있고, **처음부터 켜져 있어요**. 위젯이 계산하기 전에 속성마다 평균 0·표준편차 1 로 바꿔 줘요.')),
          h('div', { class: 'warn' }, md(`그리고 빈칸(?)은 위젯이 **그 속성의 평균으로** 채워서 계산해요. 강수량의 빈칸은 「비가 안 온 날」 이라, 비 안 온 날이 평균만큼(약 ${수(속성통계()[0].평균, 0)}mm) 비가 온 날로 계산되는 셈이에요.`)),
          // 2026-11-15 사용자 질문 — 「여전히 ? 로 나오는데?」. 오렌지 소스(owkmeans.py)에서 확인: 채운 표는 계산에만 쓰고, 내보내는 데이터는 들어온 원래 데이터에 군집·실루엣 열만 붙인 것이다
          h('p', { class: 'small muted' }, md('💡 채운 값은 **계산할 때만** 써요. 위젯이 내보내는 데이터는 원래 데이터에 **군집 (Cluster)·실루엣 (Silhouette)** 열만 붙인 것이라, 뒤의 데이터 테이블에는 **? 가 그대로** 보여요.'))),
        h('div', {},
          h('p', {}, md('빈칸을 0 으로 채우고 싶다면 k-Means 앞에 **Impute** 위젯을 붙여요.')),
          위젯창('Impute', 묶음상자('Default Method', 라디오('imp', ["Don't impute", 'Average/Most frequent', 'Fixed values; numeric variables:'], 2, () => {}), h('div', { class: 'small muted' }, '→ 값에 0 을 넣는다'))),
          퀴즈([{ 질문: '강수량 빈칸을 0 으로 채우는 Impute 위젯은 흐름의 어디에 둘까요?', 보기: ['Select Columns 와 k-Means 사이', 'k-Means 와 Box Plot 사이'], 답: 0, 해설: '군집을 계산하기 전에 빈칸을 채워야 해요.' }], { 열쇠: 'u6.impute' }),
          h('p', { class: 'small muted' }, '이 앱의 군집 결과도 오렌지와 똑같이 빈칸을 평균으로 채워 셈한 것이라 오렌지 화면과 같아요. 0 으로 채우는 것은 스스로 해 볼 거리로 남겨요.'))));
    }, '교재 41쪽'),

    카드('산점도와 데이터 분포로 군집 보기', '오렌지', (몸) => {
      const k = 내k(), r = 군집(k), 일 = 날씨들();
      const 크기 = Array.from({ length: k }, (_, c) => r.군집.filter((g) => g === c).length);
      const 큰 = 크기.indexOf(Math.max(...크기));
      const 그림 = 산점도(일.map((d, i) => ({ x: d.값[1], y: d.값[3], 색: 색들[r.군집[i]], 제목: `${d.일시} · C${r.군집[i] + 1}` })), { x이름: 속성[1], y이름: 속성[3], 너비: 560, 높이: 280, 반지름: 3.5 }).svg;
      // 높이 176 — 옮겨 온 데이터 분포 팁까지 1280×720 카드에 들게(190 이면 퀴즈를 푼 뒤 2px 넘쳤다)
      const 막대들 = 막대(크기.map((n, c) => ({ 이름: `C${c + 1}`, 값: n, 색: 색들[c] })), { y이름: '날 수', 너비: 560, 높이: 176 }).svg;
      // 데이터 분포의 Split by·Show probabilities 팁 (2026-11-16 박스플롯 카드에서 옮겨 옴) — 바람 센 날이 한 군집에 모여 있으면 그 군집을 적는다
      const 센날 = 일.map((d, i) => [d.값[2], r.군집[i]]).filter(([w]) => w !== null && w >= 5);
      const 센군 = new Set(센날.map(([, c]) => c));
      const 센예 = 센날.length && 센군.size === 1 ? `「5m/s 이상인 ${센날.length}일은 모두 ${군([...센군][0])}」` : '「5m/s 이상인 날은 어느 군집인지」';
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          위젯창({ 이름: 'Scatter Plot', 제목: '산점도 (Scatter Plot)', 작게: true },
            h('div', { class: 'ow-line' }, 'X축: ', h('b', {}, '평균기온'), ' · Y축: ', h('b', {}, '일조합'), ' · 색 (Color): ', h('b', {}, '군집 (Cluster)')),
            그림,
            h('div', { class: 'legend' }, 크기.map((n, c) => h('span', { style: { '--c': 색들[c] } }, `C${c + 1} (${n}일)`)))),
          h('p', { class: 'small muted' }, md(`💡 k-Means 는 **속성 4개** 로 거리를 쟀는데 산점도는 **2개** 만 보여 줘서 다른 색 점이 섞여 보여요. (k = ${k}) 날 수를 표로 보려면 **피벗 테이블 (Pivot Table)** 의 Rows 를 **군집 (Cluster)** 으로 두어요.`))),
        h('div', {},
          위젯창({ 이름: 'Distributions', 제목: '데이터 분포 (Distributions) (1)', 작게: true },
            h('div', { class: 'ow-line' }, '변수 선택: ', h('b', {}, '군집 (Cluster)')),
            막대들),
          퀴즈([
            { 질문: '막대의 높이(날 수)를 모두 더하면?', 보기: [`${일.length}`, `${k}`, '100'], 답: 0,
              해설: `하루는 꼭 한 군집에만 들어가니 모두 더하면 ${일.length}일이에요. 가장 많은 것은 ${군(큰)} (${크기[큰]}일) — 오렌지는 막대에 마우스를 올리면 수를 보여 줘요.` },
          ], { 열쇠: 'u6.count-q' }),
          h('p', { class: 'small muted' }, md(`💡 변수 **평균풍속** · Split by **군집 (Cluster)** · Show probabilities 를 켜면 ${센예} 같은 비율도 보여요.`)))));
    }, '교재 41~43쪽'),

    // 한국어판 오렌지 3.40 「박스플롯」 창 (2026-11-16 사용자가 보낸 화면대로) — 변수 선택 · 하위 그룹 · 표시(Annotate · 비교)
    카드('Box Plot — 군집마다 어떤 날씨일까?', '오렌지', (몸) => {
      const k = 내k();
      const r = 군집(k), 일 = 날씨들();
      // 변수 목록 — 오렌지처럼 메타(일시 · 군집 · 실루엣) 다음에 속성 넷. 일시·군집은 이 카드에서 고르지 않는다
      const 변수들 = [
        { 이름: '일시', 종류: 't', 끔: true },
        { 이름: '군집 (Cluster)', 종류: 'c', 끔: true },
        { 이름: '실루엣 (Silhouette)', 종류: 'n', 값: (i) => 날마다실루엣(k)[i] },
        ...속성.map((이름, j) => ({ 이름, 종류: 'n', 값: (i) => 일[i].값[j] })),
      ];
      const 하위들 = [{ 이름: '없음', 종류: '' }, { 이름: '군집 (Cluster)', 종류: 'c' }];
      const 기본 = 변수들.findIndex((v) => v.이름 === 속성[1]);   // 평균기온
      let 고른 = 기본, 나눔 = 1, 이름표 = true, 비교 = '평균';
      const 그림 = h('div', {}), 설명 = h('p', { class: 'small muted bp-note' });
      const 그리기 = () => {
        const v = 변수들[고른], 날 = 일.map((_, i) => i);
        const 값있음 = (i) => v.값(i) !== null && v.값(i) !== undefined;   // 오렌지처럼 빈칸(?)은 빼고 그린다
        const 줄들 = 나눔
          ? Array.from({ length: k }, (_, c) => ({ 이름: `C${c + 1}`, 색: 색들[c], 값들: 날.filter((i) => r.군집[i] === c && 값있음(i)).map((i) => v.값(i)) }))
          : [{ 이름: '전체', 색: '#5a2bd6', 값들: 날.filter(값있음).map((i) => v.값(i)) }];
        채우기(그림, 오렌지상자들(줄들, { 이름표, 비교, 변수이름: v.이름 }));
        const 비교글 = { 평균: '세로선 = 줄마다 **평균** 자리(평균 비교)', 중앙값: '점선 = 줄마다 **중앙값** 자리(중앙값 비교)', 없음: '비교 안 함 — 세로선 없이 상자만' }[비교];
        const 덧글 = v.이름 === 속성[0] ? ' · 강수량은 빈칸(비 안 온 날)을 빼고 그려 **비 온 날만** 남아요.'
          : v.이름.startsWith('실루엣') ? ' · 실루엣은 오렌지가 0~1 로 바꾼 값이에요(0.5 보다 크면 제 군집에 잘 들어간 날).' : '';
        채우기(설명, md(비교글 + 덧글));
        if (고른 !== 기본) 마침('u6.boxplot');
      };
      // 오렌지 목록 상자 — 누르면 그 줄이 파랗게 골라진다(고를 수 없는 줄은 흐리게)
      const 목록 = (항목들, 지금, 바꿈) => h('div', { class: 'bp-list', role: 'listbox' }, 항목들.map((v, i) => h('button', {
        type: 'button', class: `bp-item${i === 지금 ? ' on' : ''}`, disabled: v.끔 || null, role: 'option', 'aria-selected': String(i === 지금),
        title: v.끔 ? '이 카드에서는 고르지 않아요' : null,
        onclick: (e) => {
          바꿈(i);
          e.currentTarget.parentElement.querySelectorAll('.bp-item').forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', String(j === i)); });
          그리기();
        },
      }, v.종류 ? h('span', { class: `ow-type ${v.종류}` }, { t: 'T', c: 'C', n: 'N' }[v.종류]) : null, ` ${v.이름}`)));
      const 찾기칸 = (이름) => h('input', { type: 'text', class: 'ow-filter', placeholder: 'Filter...', disabled: true, 'aria-label': 이름 });
      const 정렬칸 = (글) => h('label', { class: 'ow-radio off bp-sort' }, h('input', { type: 'checkbox', disabled: true }), ` ${글}`);
      const 주석상자 = h('input', { type: 'checkbox', checked: true });
      주석상자.addEventListener('change', () => { 이름표 = 주석상자.checked; 그리기(); });
      const 창 = 위젯창({ 이름: 'Box Plot', 제목: '박스플롯', 작게: true },
        묶음상자('변수 선택 (Variable)', 찾기칸('변수 찾기'), 목록(변수들, 고른, (i) => { 고른 = i; }), 정렬칸('하위 그룹과의 관련성 순으로 정렬')),
        묶음상자('하위 그룹 (Subgroups)', 찾기칸('하위 그룹 찾기'), 목록(하위들, 나눔, (i) => { 나눔 = i; }), 정렬칸('변수와의 관련성 순으로 정렬')),
        묶음상자('표시', h('label', { class: 'ow-radio' }, 주석상자, ' Annotate'),
          라디오('bp-compare', ['비교 안 함', '중앙값 비교', '평균 비교'], 2, (i) => { 비교 = ['없음', '중앙값', '평균'][i]; 그리기(); })),
        h('div', { class: 'ow-foot' }, h('span', { class: 'ow-count' }, `⇥ ${일.length}`)));
      그리기();
      const 특징 = 군집특징(k);
      채우기(몸, h('div', { class: 'bp-grid' },
        창,
        h('div', {}, 그림, 설명),
        h('div', {},
          h('p', { class: 'small' }, md('속성을 바꿔 가며 군집마다 상자가 어디 있는지 보세요. 전체 평균보다 높으면 ↑, 낮으면 ↓ 로 정리했어요.')),
          // 세 칸 배치의 좁은 오른쪽 칸에 들도록 머리글을 두 글자로 줄인다
          h('table', { class: 'kv small' }, h('thead', {}, h('tr', {}, h('th', {}, ''), ['강수', '기온', '풍속', '일조'].map((t) => h('th', { class: 'center' }, t)), h('th', {}, '많은 달'))),
            h('tbody', {}, 특징.map((f) => h('tr', {}, h('th', { style: { color: 색들[f.c] } }, `C${f.c + 1}`), f.화살.map((a) => h('td', { class: 'center' }, a)), h('td', { class: 'small' }, f.많은달))))))));
    }, '교재 41~43쪽'),

    // 오렌지 박스플롯은 상자그림 모양이 교과서 그림과 조금 다르다 — 평균 ± 표준편차 막대와 중앙값 선을 함께 그린다
    카드('Box Plot 읽는 법', '개념', (몸) => {
      const k = 내k(), r = 군집(k), 일 = 날씨들();
      const 크기 = Array.from({ length: k }, (_, c) => r.군집.filter((g) => g === c).length);
      const c = 크기.indexOf(Math.max(...크기));
      const 값들 = 일.filter((_, i) => r.군집[i] === c).map((d) => d.값[1]);
      const 보기 = 상자읽기(값들);
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          위젯창({ 이름: 'Box Plot', 제목: '박스플롯', 작게: true },
            h('div', { class: 'ow-line' }, '변수 선택: ', h('b', {}, '평균기온'), ' · 하위 그룹: ', h('b', {}, '군집 (Cluster)'), ' · 표시: ', h('b', {}, '평균 비교')),
            오렌지상자(보기, `C${c + 1}`)),
          h('p', { class: 'small muted' }, md(`C${c + 1} (${값들.length}일) 의 평균기온 하나만 크게 그렸어요. 오렌지에서는 군집마다 이런 상자가 한 줄씩 그려져요.`)),
          h('table', { class: 'kv small' }, h('tbody', {},
            h('tr', {}, h('th', {}, '평균 ± 표준편차'), h('td', { class: 'num' }, `${수(보기.평균, 3)} ± ${수(보기.표준편차, 2)}`)),
            h('tr', {}, h('th', {}, '상자의 양 끝 · 중앙값'), h('td', { class: 'num' }, `${수(보기.q1, 1)} ~ ${수(보기.q3, 1)} · ${수(보기.중앙, 1)}`)),
            h('tr', {}, h('th', {}, '가장 작은 값 ~ 가장 큰 값'), h('td', { class: 'num' }, `${수(보기.최소, 1)} ~ ${수(보기.최대, 1)}`))))),
        h('div', {},
          h('p', {}, md('그림에서 보이는 것과 그 뜻을 짝지어 보세요.')),
          짝짓기([
            { 왼: `위쪽 글자 「${수(보기.평균, 3)} ± …」 의 **앞 수**`, 답: '평균' },
            { 왼: '**±** 뒤의 수', 답: '표준편차(값이 퍼진 정도)' },
            { 왼: '🟦 파란 **상자**', 답: '가운데 50 % 의 날이 든 범위' },
            { 왼: '🟨 노란 **세로선**', 답: '중앙값' },
            { 왼: '진한 파란 **가로선**', 답: '평균 ± 표준편차 범위' },
            { 왼: '양쪽 **점선**', 답: '가장 작은 값 ~ 가장 큰 값' },
          ], ['평균', '표준편차(값이 퍼진 정도)', '가운데 50 % 의 날이 든 범위', '중앙값', '평균 ± 표준편차 범위', '가장 작은 값 ~ 가장 큰 값'], { 열쇠: 'u6.box-read' }),
          h('p', { class: 'small muted' }, md('💡 **표시** 를 「평균 비교」 로 두면 군집마다 평균 자리에 세로선이 그어져, 군집끼리 평균을 한눈에 견줄 수 있어요.')))));
    }, '교재 42쪽'),

    // k-Means 뒤에 데이터 테이블을 이으면 맨 앞에 군집 (Cluster) 열이 붙는다 — 군집마다 어느 달이 많은지 보면 계절이 드러난다
    카드('군집마다 어느 날짜일까?', '오렌지', (몸) => {
      const k = 내k(), r = 군집(k), 일 = 날씨들(), 표 = 달별군집(k), 특징 = 군집특징(k);
      // 오렌지 데이터 테이블처럼 — 열 이름을 누르면 그 열로 정렬, 한 번 더 누르면 반대 순서, 「원래 순서로 복원」 으로 날짜 순서(2026-11-16 사용자 지시)
      // 열 차례는 오렌지 출력과 같다 — 메타(일시 · 군집 · 실루엣) 다음에 속성 넷
      const 열이름들 = ['일시', '군집 (Cluster)', '실루엣 (Silhouette)', ...속성];
      const 실 = 날마다실루엣(k);
      let 정렬열 = null, 방향 = 1;
      const 표자리 = h('div', {});
      const 줄들 = 일.map((d, i) => ({ i, c: r.군집[i], d }));
      // 열마다 정렬 열쇠 — 군집은 번호(C1, C2 …), 일시는 날짜 글자, 나머지는 값. 빈칸(?)은 어느 방향이든 맨 아래
      const 열쇠 = (z, j) => (j === 0 ? z.d.일시 : j === 1 ? z.c : j === 2 ? 실[z.i] : z.d.값[j - 3]);
      const 표그리기 = () => {
        const 차례 = 정렬열 === null ? 줄들 : [...줄들].sort((a, b) => {
          const x = 열쇠(a, 정렬열), y = 열쇠(b, 정렬열);
          if (x === null || y === null) return x === y ? a.i - b.i : x === null ? 1 : -1;
          const 차 = typeof x === 'string' ? x.localeCompare(y) : x - y;
          return 차 * 방향 || a.i - b.i;   // 같은 값끼리는 원래(날짜) 순서
        });
        // 머리글은 「군집 (Cluster)」·「실루엣 (Silhouette)」 만 두 줄로 꺾어 표가 칸 안에 들게 한다
        채우기(표자리, 데이터표(열이름들.map((t) => t.replace(' (', '\n(')), 차례.map(({ i, c, d }) => [d.일시, `C${c + 1}`, 수(실[i], 3), ...d.값]), {
          스크롤: true, 메타: [0, 1, 2], 줄번호: 차례.map((z) => z.i + 1), 정렬열, 정렬방향: 방향,
          머리누름: (j) => { if (정렬열 === j) 방향 = -방향; else { 정렬열 = j; 방향 = 1; } 표그리기(); },
          설명: `${일.length} instances · 4 features · 3 meta${정렬열 === null ? '' : ` · ${열이름들[정렬열]} ${방향 > 0 ? '오름차순' : '내림차순'}`}` }));
      };
      표그리기();
      // 군집마다 한 계절이 가장 뚜렷한 군집을 하나 골라 묻는다
      const 계절수 = 표.map((줄) => [0, 1, 2, 3].map((s) => 줄.reduce((합, n, m) => 합 + (계절(m + 1) === s ? n : 0), 0)));
      const 뚜렷 = 계절수.map((줄, c) => ({ c, s: 줄.indexOf(Math.max(...줄)), 비율: Math.max(...줄) / 줄.reduce((a, b) => a + b, 0) })).filter((x) => 특징[x.c].수 >= 10).sort((a, b) => b.비율 - a.비율)[0];
      const 섞임 = 섞인달(k);
      const 문항 = [{ 질문: `${군(뚜렷.c, '이가')} 가장 많이 나오는 계절은?`, 보기: 계절들, 답: 뚜렷.s, 고정: true, 해설: `${군(뚜렷.c, '은는')} ${특징[뚜렷.c].많은달}에 많아요.` }];
      if (섞임) {
        const [가, 나] = [특징[섞임.가], 특징[섞임.나]], j = 섞임.다른속성, 단위 = ['mm', '℃', 'm/s', 'h'][j];
        문항.push({ 질문: `${섞임.달}월에는 ${군(섞임.가, '과와')} ${군(섞임.나, '이가')} 섞여 있어요. 두 군집을 가르는 속성은?`, 보기: 짧은속성, 답: j,
          해설: `${짧은속성[j]} 평균이 ${수(가.평[j], 1)}${단위} 와 ${수(나.평[j], 1)}${단위} 로 크게 달라요. 같은 달이라도 다른 속성으로 갈려요.` });
      }
      const 최대 = Math.max(...표.flat());
      채우기(몸, h('div', { class: 'two wide-left' },
        h('div', {},
          위젯창({ 이름: 'Data Table', 제목: '데이터 테이블 (Data Table) (2)', 작게: true },
            표자리,
            h('div', { class: 'ow-line' }, h('button', { type: 'button', class: 'ow-btn restore', onclick: () => { 정렬열 = null; 방향 = 1; 표그리기(); } }, '원래 순서로 복원 (Restore Original Order)'))),
          h('ul', { class: 'small dt-how' },
            h('li', {}, md('표 위쪽의 **군집 (Cluster)** 열 이름을 누르면 C1, C2, … 순서로 정렬돼요. 한 번 더 누르면 반대 순서로 바뀌어요. 다른 열(일시·강수량 …)도 이름을 누르면 그 열로 정렬돼요. 원래 날짜 순서로 돌아가려면 **원래 순서로 복원 (Restore Original Order)** 을 눌러요.')),
            h('li', {}, md('같은 군집끼리 모인 행을 내려 보면서 **날짜(일시)가 어느 달에 많은지**, 속성마다 군집별로 어떻게 다른지 확인해요. 박스플롯에서 본 군집의 특징과 맞는지도 살펴보세요.')))),
        h('div', {},
          h('table', { class: 'kv small month-grid' }, h('caption', {}, `달마다 군집별 날 수 (k = ${k})`),
            h('thead', {}, h('tr', {}, h('th', {}, ''), Array.from({ length: 12 }, (_, m) => h('th', { class: 'num' }, `${m + 1}월`)))),
            h('tbody', {}, 표.map((줄, c) => h('tr', {}, h('th', { style: { color: 색들[c] } }, `C${c + 1}`),
              줄.map((n) => h('td', { class: 'num', style: { background: n ? 흰색과섞기(색들[c], 12 + (n / 최대) * 70) : '' } }, n || '')))))),
          퀴즈(문항, { 열쇠: 'u6.month-q' }))));
    }, '교재 43쪽'),

    // 14번과 옷차림 표 사이 빈칸 채우기 (2026-11-16 사용자 지시) — 군집마다 날 수·평균을 오렌지 위젯에서 찾아 적는다.
    // 다 비우지 않는다 — 줄마다 숫자 칸 하나만 돌아가며 비워(C1 날 수 · C2 기온 · C3 풍속 · C4 일조 · C5 날 수 …)
    // 데이터 분포와 박스플롯 세 변수를 골고루 열어 보게 하고, 설명 칸은 줄을 걸러 비운다(나머지 줄은 화살표로 만든 예시 문장).
    카드('군집마다 날 수와 평균 채우기', '활동', (몸) => {
      const k = 내k(), 특징 = 군집특징(k);
      const 표 = (상태.notes['u6.fill'] ||= {});
      const 열쇠 = (c, 열) => `${k}:${c}:${열}`;   // k 를 바꾸면 군집이 통째로 달라지므로 k 마다 따로 둔다
      // 숫자 칸 넷 — 날 수(데이터 분포의 막대) · 평균(박스플롯 Annotate 「C1: 평균 ± 표준편차」 의 앞 수)
      const 열들 = [
        { 이름: '날 수', 출처: '데이터 분포', 값: (f) => f.수, 허용: 0 },
        { 이름: '평균기온', 출처: '평균 (℃) · 박스플롯', 값: (f) => f.평[1], 허용: 0.051 },
        { 이름: '평균풍속', 출처: '평균 (m/s) · 박스플롯', 값: (f) => f.평[2], 허용: 0.051 },
        { 이름: '일조합', 출처: '평균 (hr) · 박스플롯', 값: (f) => f.평[3], 허용: 0.051 },
      ];
      // 예시 문장 — 군집 특징 화살표(전체 평균보다 ↑·↓)로 학생이 쓸 법한 말을 만든다
      const 날씨말 = (f) => {
        const [비, 기온, 바람, 해] = f.화살, t = f.평[1], 조각 = [];
        if (비 === '↑') 조각.push(['비가 많이 오고', '비가 많이 오는']);
        조각.push(기온 === '↑' ? (t >= 23 ? ['덥고', '더운'] : ['따뜻하고', '따뜻한']) : 기온 === '↓' ? (t <= 5 ? ['춥고', '추운'] : ['쌀쌀하고', '쌀쌀한']) : ['선선하고', '선선한']);
        if (바람 === '↑') 조각.push(['바람이 세고', '바람이 센']); else if (바람 === '↓') 조각.push(['바람이 약하고', '바람이 약한']);
        if (해 === '↑') 조각.push(['맑고', '맑은']); else if (해 === '↓') 조각.push(['흐리고', '흐린']);
        return `${조각.map((p, i) => p[i === 조각.length - 1 ? 1 : 0]).join(' ')} 날`;
      };
      const 줄 = 알림줄(), 칸들 = [];
      const 합칸 = h('td', { class: 'num' });
      // 날 수 합계 — 채워 둔 칸과 학생이 적은 칸을 더한다(다 맞으면 366)
      const 합계 = () => { 합칸.textContent = `${특징.reduce((합, f) => 합 + (f.c % 4 === 0 ? (Number(표[열쇠(f.c, 0)]) || 0) : f.수), 0)}일`; };
      const 행들 = 특징.map((f) => {
        const 빈열 = f.c % 4, 설명빈 = f.c % 2 === 1;
        const 숫자칸 = 열들.map((열, j) => {
          if (j !== 빈열) return h('td', { class: 'num fill-given' }, j === 0 ? `${f.수}일` : 수(열.값(f), 1));
          const 칸 = h('input', { type: 'text', class: 'blank fill-in', inputmode: 'decimal', value: 표[열쇠(f.c, j)] ?? '', 'aria-label': `C${f.c + 1} ${열.이름}` });
          칸.addEventListener('input', () => { 표[열쇠(f.c, j)] = 칸.value; 저장(); 합계(); });
          칸들.push({ 칸, 맞나: () => 칸.value.trim() !== '' && Math.abs(Number(칸.value) - 열.값(f)) <= 열.허용 });   // Number('') 은 0 — 빈칸을 먼저 거른다
          return h('td', { class: 'num' }, 칸, j === 0 ? ' 일' : '');
        });
        let 설명칸 = h('td', { class: 'fill-given' }, 날씨말(f));
        if (설명빈) {
          const 칸 = h('input', { type: 'text', class: 'blank fill-desc', value: 표[열쇠(f.c, 'd')] ?? '', placeholder: '기온·바람·햇빛은 어떤가요?', 'aria-label': `C${f.c + 1} 어떤 날씨인가요` });
          칸.addEventListener('input', () => { 표[열쇠(f.c, 'd')] = 칸.value; 저장(); });
          칸들.push({ 칸, 맞나: () => 칸.value.replace(/\s/g, '').length >= 4 });
          설명칸 = h('td', {}, 칸);
        }
        return h('tr', {}, h('th', {}, h('span', { class: 'fill-c', style: { background: 색들[f.c] } }, `C${f.c + 1}`)), 숫자칸, 설명칸);
      });
      const 확인 = () => {
        let 맞음 = 0;
        for (const z of 칸들) { const ok = z.맞나(); z.칸.classList.toggle('ok', ok); z.칸.classList.toggle('bad', !ok); if (ok) 맞음++; }
        if (맞음 === 칸들.length) { 줄.맞음(`모두 채웠어요! 날 수를 다 더하면 **${날씨들().length}일** 이에요.`); 마침('u6.fill'); }
        else 줄.틀림(`${칸들.length}칸 중 ${맞음}칸 맞았어요. 날 수는 **데이터 분포**(변수 선택: 군집) 막대, 평균은 **박스플롯**(하위 그룹: 군집 · Annotate)의 「C1: 평균 ± …」 앞 수예요. 소수 첫째 자리까지만 적어도 돼요.`);
      };
      합계();
      if (다푼모습('u6.fill')) 확인();   // 캡처 모드 — 맞힌 칸을 초록으로
      채우기(몸,
        h('p', { class: 'write-label' }, md(`**(1)** 군집마다(k = ${k}) 묶인 **날 수와 평균** 을 오렌지에서 찾아 빈칸을 채우고, 그 군집이 **어떤 날씨인지** 설명해 보세요. 채워진 칸은 내 오렌지 화면과 맞춰 보는 데 쓰세요.`)),
        h('table', { class: 'kv small fill-table' },
          h('thead', {}, h('tr', {}, h('th', {}, '군집'),
            열들.map((열) => h('th', { class: 'center' }, 열.이름, h('br'), h('small', {}, 열.출처))),
            h('th', {}, '어떤 날씨인가요?', h('br'), h('small', {}, '기온은 높은지 낮은지, 바람·햇빛은 어떤지')))),
          h('tbody', {}, 행들,
            h('tr', { class: 'fill-total' }, h('th', {}, '합계'), 합칸, h('td', { colspan: 4 }, h('small', {}, `날 수를 모두 더하면 ${날씨들().length}일이 되어야 해요.`))))),
        h('div', { class: 'row check' }, h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '정답 확인'), 줄));
    }, '교재 41~43쪽'),

    카드('나만의 옷차림 표 만들기', '활동', (몸) => {
      const k = 내k();
      const 특징 = 군집특징(k);
      const 표 = (상태.notes['u6.outfit'] ||= {});
      const 열 = (종류, c) => 옷열쇠(k, 종류, c);
      const 줄 = 알림줄();
      // 옷차림 단계는 평균기온의 단계와 한 단계까지 달라도 받는다(사람마다 느끼는 온도가 다르다)
      const 단계맞나 = (f) => { const v = Number(표[열('s', f.c)]); return v > 0 && Math.abs(v - 단계찾기(f.평[1])) <= 1; };
      const 다됐나 = () => {
        if (특징.every((g) => (표[열('o', g.c)] || []).length && 단계맞나(g))) { 줄.맞음('모든 군집에 옷차림 단계와 옷을 정했어요! 화면을 캡처해 친구와 나눠 보세요.'); 마침('u6.outfit'); }
      };
      const 칸들 = 특징.map((f) => {
        const 이름칸 = h('input', { type: 'text', class: 'blank', style: { width: '100%', textAlign: 'left' }, value: 표[열('n', f.c)] || '', placeholder: '군집 이름 (예: 쌀쌀한 바람)', 'aria-label': `C${f.c + 1} 이름` });
        이름칸.addEventListener('input', () => { 표[열('n', f.c)] = 이름칸.value; 저장(); });
        const 단계칸 = h('select', { class: 'pick stage-pick', 'aria-label': `C${f.c + 1} 옷차림 단계` }, h('option', { value: '' }, '— 옷차림 단계 —'),
          옷차림단계.map((d) => h('option', { value: d.단계, selected: String(d.단계) === String(표[열('s', f.c)]) }, `${d.단계}단계 · ${d.기온}`)));
        const 단계표시 = () => { const 골랐나 = 단계칸.value !== ''; 단계칸.classList.toggle('ok', 골랐나 && 단계맞나(f)); 단계칸.classList.toggle('bad', 골랐나 && !단계맞나(f)); };
        단계칸.addEventListener('change', () => {
          표[열('s', f.c)] = 단계칸.value; 저장(); 단계표시();
          if (단계칸.value && !단계맞나(f)) 줄.틀림(`${군(f.c, '은는')} 평균기온이 **${수(f.평[1], 1)}℃** 예요. 기온별 옷차림 표에서 그 기온의 단계를 찾아보세요.`);
          else { 줄.지우기(); 다됐나(); }
        });
        단계표시();
        const 옷칸 = h('div', { class: 'outfits' }, 옷들.map((o) => {
          const 켬 = (표[열('o', f.c)] || []).includes(o);
          return h('button', {
            type: 'button', class: `chip small${켬 ? ' picked' : ''}`,
            onclick: (e) => {
              const 목록 = (표[열('o', f.c)] ||= []);
              const i = 목록.indexOf(o);
              if (i >= 0) 목록.splice(i, 1); else 목록.push(o);
              e.currentTarget.classList.toggle('picked'); 저장();
              다됐나();
            },
          }, o);
        }));
        return h('div', { class: 'outfit-card', style: { borderColor: 색들[f.c] } },
          h('div', { class: 'outfit-head', style: { background: 색들[f.c] } }, `C${f.c + 1} · ${f.수}일 · ${f.많은달}`),
          h('div', { class: 'small outfit-stat' }, `🌡️${수(f.평[1], 1)}℃ · 🌬️${수(f.평[2], 1)}m/s · ☀️${수(f.평[3], 1)}h · ☔${f.비온날}일`),
          이름칸, 단계칸, 옷칸);
      });
      채우기(몸,
        h('div', { class: 'row' },
          h('p', { class: 'small grow' }, md(`군집마다(k = ${k}) 날씨를 보고 **이름을 붙이고, 옷차림 단계와 옷을 골라** 나만의 옷차림 표를 완성하세요. 햇빛이 적은(흐리거나 비 오는) 군집엔 ☂️ 우산, 햇빛이 강한 군집엔 🧢 모자·🕶️ 선글라스를 더해요.`)),
          h('button', { type: 'button', class: 'btn small', onclick: 옷차림표보기 }, '🌡️ 기온별 옷차림 표')),
        h('div', { class: 'outfit-grid one-row' }, 칸들), 줄);
    }, '교재 43~45쪽'),

    카드('결과 정리하고 나누기', '활동', (몸) => {
      const k = 내k(), 특징 = 군집특징(k), 일 = 날씨들();
      const 입력 = (열쇠, 크기, 이름) => { const 칸 = h('input', { type: 'text', class: 'blank', size: 크기, value: 글읽기(열쇠), 'aria-label': 이름 }); 칸.addEventListener('input', () => 글쓰기(열쇠, 칸.value)); return 칸; };
      const k칸 = 입력('u6.sum-k', 2, '군집 수'), 온도칸 = 입력('u6.sum-t', 4, '평균기온'), 옷칸 = 입력('u6.sum-o', 12, '옷차림');
      const 군칸 = h('select', { class: 'pick', 'aria-label': '군집' }, h('option', { value: '' }, '군집'), 특징.map((f) => h('option', { value: f.c, selected: 글읽기('u6.sum-c') === String(f.c) }, `C${f.c + 1}`)));
      군칸.addEventListener('change', () => 글쓰기('u6.sum-c', 군칸.value));
      const 줄 = 알림줄();
      const 확인 = () => {
        const c = 군칸.value === '' ? -1 : Number(군칸.value);
        // Number('') 은 0 이라 빈칸을 먼저 거른다
        const k맞음 = k칸.value.trim() !== '' && Number(k칸.value) === k;
        const 온도맞음 = c >= 0 && 온도칸.value.trim() !== '' && Math.abs(Number(온도칸.value) - 특징[c].평[1]) <= 1, 옷있음 = 옷칸.value.trim() !== '';
        k칸.classList.toggle('ok', k맞음); k칸.classList.toggle('bad', !k맞음);
        온도칸.classList.toggle('ok', 온도맞음); 온도칸.classList.toggle('bad', !온도맞음);
        옷칸.classList.toggle('ok', 옷있음); 옷칸.classList.toggle('bad', !옷있음);
        if (k맞음 && 온도맞음 && 옷있음) { 줄.맞음('정리 문장을 완성했어요!'); 마침('u6.summary'); }
        else 줄.틀림(!k맞음 ? `지금 정한 군집 수는 **${k}** 예요.` : c < 0 ? '군집을 하나 고르세요.' : !온도맞음 ? `${군(c, '은는')} 평균기온을 Box Plot 이나 옷차림 표 카드에서 다시 읽어 보세요.` : '어울리는 옷차림을 적어 보세요.');
      };
      if (다푼모습('u6.summary')) 확인();   // 캡처 모드 — 맞힌 칸을 초록으로
      // 평균기온이 가장 가까운 두 군집 — (2) 를 생각할 실마리로 보여 준다
      let 짝 = null;
      for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) { const d = Math.abs(특징[a].평[1] - 특징[b].평[1]); if (!짝 || d < 짝.d) 짝 = { a, b, d }; }
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'write-label' }, md('**(1)** 빈칸을 채워 분석 결과를 정리해 보세요.')),
          h('div', { class: 'summary-line' }, `2024년 서울의 날씨 ${일.length}일을 k-평균 군집화로 묶었더니 `, k칸, '개의 군집으로 나뉘었다. 그중 ', 군칸, ' 군집은 평균기온이 약 ', 온도칸, '℃이므로 ', 옷칸, ' 차림이 좋다.'),
          h('div', { class: 'row check' }, h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '정답 확인'), 줄),
          쓰기('u6.same-temp', { 안내: `**(2)** 평균기온은 비슷한데 옷차림·준비물을 다르게 정한 군집이 있나요? 기온 말고 어떤 속성 때문인가요?`, 줄수: 2,
            예시: 짝 ? `실마리) ${군(짝.a, '과와')} ${군(짝.b)}의 평균기온은 ${수(특징[짝.a].평[1], 1)}℃·${수(특징[짝.b].평[1], 1)}℃ 예요.` : '' })),
        h('div', {},
          쓰기('u6.why-cluster', { 안내: '**(3)** 기온만 보고 옷을 고를 때와 비교해, 군집 분석으로 옷차림을 정하면 무엇이 좋은가요? 아쉬운 점이나 더 넣고 싶은 데이터(체감온도·미세먼지·다른 해의 날씨 등)도 적어 보세요.', 줄수: 5 }))));
    }, '교재 44~45쪽'),

    // 2026-11-09 사용자 지시 — 메인 실습을 마치면(내 프로젝트 앞) 오렌지3 작업 화면을 붙이고 활동 정리 PDF 를 받는다(finish.js)
    마무리카드(PDF활동, { 결과창: 'k-Means·박스플롯' }),

    프로젝트카드('u6', '군집 분석', '최적의 군집 개수를 찾아보고, 성능(실루엣 계수 등)을 확인해 보세요.', { 내려받기단추: false }),
  ],
};
