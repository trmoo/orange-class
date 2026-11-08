/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  4단원 — 프로젝트 1-1 「회귀 분석으로 수면 시간에 따른 비만율을 확인해 보자」
 *  성취기준 [12데과03-02] · 학습 요소: 선형 회귀 · 교과서 108~131쪽
 *  데이터는 연습용으로 새로 만든 값이다(src/data/health.js).
 */
import { h, s, 채우기, md, 수, 창 } from '../lib/ui.js';
import { 퀴즈, 순서, 짝짓기, 쓰기, 자기평가, 알림줄 } from '../lib/games.js';
import { 끝냄, 끝났나, 글읽기, 글쓰기 } from '../lib/store.js';
import { 다푼모습 } from '../lib/capture.js';
import { 상관, 상관정도, 단순회귀, 성능, 나누기, 난수, 백분율오차 } from '../lib/stats.js';
import { 산점도, 색들 } from '../lib/chart.js';
import { 흐름조립, 위젯창, 위젯연결도, 묶음상자, 라디오, 열고르기, 데이터표, 위젯글 } from '../lib/orange.js';
import { 카드, 말풍선, 슬라이더, 교재메모 } from './common.js';
import { 수면표, 비만표, 합치기, 수면비만, 수면열, 비만열 } from './health.js';
import { 활동지내려받기 } from './project.js';
import { 수면csv, 비만csv } from '../data/csv.js';

const 마침 = (열쇠) => { 끝냄(열쇠); document.dispatchEvent(new CustomEvent('activity-done', { detail: 열쇠 })); };
const 표값 = (표) => 표.행.map((r) => 표.열.map((k) => r[k]));

// Data Sampler 「Replicable (deterministic) sampling」 을 켰을 때 쓰는 씨앗
const 고정씨앗 = 4;
// 비율: 샘플 데이터 비율(기본 70 %). 오렌지처럼 샘플 수를 올림으로 센다 — 17개의 70 % 는 반올림·올림 모두 12개라 뒤 카드 값은 그대로다
export function 훈련과시험(행, 씨앗, 비율 = 0.7) {
  const x = 행.map((r) => r[수면열]), y = 행.map((r) => r[비만열]);
  const 나눔 = 나누기(행.length, 비율, 씨앗, true);
  const 모델 = 단순회귀(나눔.훈련.map((i) => x[i]), 나눔.훈련.map((i) => y[i]));
  const 점수 = 성능(나눔.시험.map((i) => y[i]), 나눔.시험.map((i) => 모델.절편 + 모델.기울기 * x[i]));
  return { 나눔, 모델, 점수, x, y };
}

/** 홀드아웃을 여러 번 — 씨앗 하나 = 한 번 나눈 것. 시험 데이터로 낸 R² 들을 돌려준다 */
export const 홀드아웃여러번 = (행, 씨앗들) => 씨앗들.map((s) => 훈련과시험(행, s).점수.R2);

/**
 * k-겹 교차 검증 — 섞은 차례대로 k 묶음(폴드)에 돌려 담고, 한 묶음씩 시험으로 쓴다(나머지로 학습).
 * 판마다 나온 예측을 모두 모아 한꺼번에 점수를 낸다 — 오렌지 Test and Score 도 이렇게 낸다.
 * k 가 데이터 수와 같으면 LOOCV(하나 빼고 검증)이고, 그때는 섞는 차례와 상관없이 늘 같은 값이 나온다.
 */
export function 교차검증(행, k, 씨앗 = 1) {
  const x = 행.map((r) => r[수면열]), y = 행.map((r) => r[비만열]);
  const n = 행.length, rnd = 난수(씨앗);
  const 섞음 = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [섞음[i], 섞음[j]] = [섞음[j], 섞음[i]]; }
  const 묶음 = new Array(n);
  섞음.forEach((v, i) => { 묶음[v] = i % k; });
  const 예측 = new Array(n);
  const 판들 = [];
  for (let f = 0; f < k; f++) {
    const 학습 = [], 시험 = [];
    for (let i = 0; i < n; i++) (묶음[i] === f ? 시험 : 학습).push(i);
    const 모델 = 단순회귀(학습.map((i) => x[i]), 학습.map((i) => y[i]));
    for (const i of 시험) 예측[i] = 모델.절편 + 모델.기울기 * x[i];
    판들.push({ 학습, 시험, 모델 });
  }
  return { 묶음, 판들, 예측, 점수: 성능(y, 예측) };
}

/**
 * 모델 검증 및 평가(Test and Score) 의 평가 방법마다 나오는 점수.
 * train: 전체로 배우고 전체로 잼(10번 카드 ① 통계적) · cv: 전체를 k-겹으로 돌아가며 · loo: 하나씩 빼고 ·
 * test: 샘플 데이터로 배우고 남은 데이터로 잼(13번 카드, 12번 카드의 예측 결과 보기와 같은 점수)
 */
export function 평가방법점수(행, 방법, k = 5, 씨앗 = 1) {
  if (방법 === 'test') return 훈련과시험(행, 고정씨앗).점수;
  if (방법 === 'loo') return 교차검증(행, 행.length).점수;
  if (방법 === 'cv') return 교차검증(행, k, 씨앗).점수;
  const x = 행.map((r) => r[수면열]), y = 행.map((r) => r[비만열]);
  const m = 단순회귀(x, y);
  return 성능(y, x.map((v) => m.절편 + m.기울기 * v));
}

/**
 * 예측 결과 보기(Predictions) 창에 나오는 시험 데이터 줄 — 오렌지의 error 는 「차이 (예측값 - 실제값)」 라서
 * stats.js 의 성능()(실제값 − 예측값) 과 부호가 반대다. 점수에는 MAPE·sMAPE 도 함께 담는다.
 */
export function 시험예측(행, 씨앗 = 고정씨앗) {
  const { 나눔, 모델, 점수, x, y } = 훈련과시험(행, 씨앗);
  const 줄들 = 나눔.시험.map((i) => {
    const p = 모델.절편 + 모델.기울기 * x[i];
    return { 시점: 행[i].시점, x: x[i], y: y[i], p, e: p - y[i] };
  });
  return { 줄들, 모델, 점수: { ...점수, ...백분율오차(줄들.map((r) => r.y), 줄들.map((r) => r.p)) } };
}

/**
 * 같은 데이터를 두 가지로 분석한 점수.
 *  통계: 데이터 전체로 회귀식을 만들고 그 전체로 다시 잰다(오렌지 「학습 데이터로 직접 평가」).
 *  기계: 7 : 3 으로 나눠 70 % 로 학습하고, 학습에 안 쓴 30 % 로 잰다(고정 씨앗 — 11번 카드와 같은 표본).
 *  나쁜MSE·나쁜R2: 씨앗 1~번 으로 나눠 본 기계학습 점수 가운데 통계적 점수보다 나빴던 횟수(홀드아웃 카드와 같은 씨앗).
 */
export function 두분석(행, 씨앗 = 고정씨앗, 번 = 100) {
  const x = 행.map((r) => r[수면열]), y = 행.map((r) => r[비만열]);
  const 전체 = 단순회귀(x, y);
  const 통계 = 성능(y, x.map((v) => 전체.절편 + 전체.기울기 * v));
  const 기계 = 훈련과시험(행, 씨앗).점수;
  const 여러 = Array.from({ length: 번 }, (_, i) => 훈련과시험(행, i + 1).점수);
  return { 통계, 기계, 번, 나쁜MSE: 여러.filter((p) => p.MSE > 통계.MSE).length, 나쁜R2: 여러.filter((p) => p.R2 < 통계.R2).length };
}

/**
 * 처음 보는 데이터(unseen data) — 오렌지에서 파일 불러오기로 여는 csv.
 * ⚠ 속성 이름이 실제 수면 csv(src/data/csv.js)의 것과 글자까지 같아야 오렌지가 학습한 모델로 예측한다(시험이 지킨다).
 * 값은 배운 범위 안·바로 밖·멀리 밖이 섞이게 골랐다 — 연습 데이터(5.94~6.60)와 실제 데이터(5.8~6.3) 어느 쪽으로 해도 세 판단이 다 나온다.
 */
const 새값 = [5.5, 6.0, 6.2, 6.5, 7.0, 8.0];
export const 새데이터 = {
  이름: '새로운 데이터(수면시간).csv', 열: '전체 주중 평균 수면시간 (시간)', 값: 새값,
  글: ['전체 주중 평균 수면시간 (시간)', ...새값.map((v) => v.toFixed(1))].join('\r\n') + '\r\n',
};
/** 예측을 믿어도 될까 — 0 믿을 만함(배운 범위 안) · 1 조심(범위 밖이지만 있을 법한 값) · 2 믿기 어려움(범위 밖이고 비만율로 나올 수 없는 값) */
export const 믿음판정 = (x, p, 최소, 최대) => (x >= 최소 && x <= 최대 ? 0 : p < 0 || p > 100 ? 2 : 1);

// 두 분석 견주기 카드의 「내 오렌지 결과」 칸 — 활동지에도 옮겨 적는다
const 내지표 = [['mse', 'MSE'], ['mae', 'MAE'], ['r2', 'R²']];
const 내분석 = [['stat', '① 통계적 회귀 분석'], ['ml', '② 기계학습 기반 회귀 분석']];
const 내결과글 = () => 내분석.map(([갈래, 이름]) => {
  const 값들 = 내지표.map(([k]) => 글읽기(`u4.my-${갈래}-${k}`).trim());
  return 값들.some(Boolean) ? `${이름}: ${내지표.map(([, 글], i) => `${글} ${값들[i] || '—'}`).join(' · ')}` : '';
}).filter(Boolean).join('\n');

const 학습색 = 색들[0], 시험색 = '#e8702a';

// R² 점 그림 — 점 하나가 한 번 나눈 것. 0.05 칸마다 쌓고, 0 보다 작은 것은 왼쪽 「0 미만」 칸에 모은다
function 점분포(값들, 표시 = []) {
  const 칸 = (v) => (v < 0 ? -1 : Math.min(19, Math.floor(v / 0.05)));
  const 개수 = new Map();
  const 점 = 값들.map((v) => { const c = 칸(v); const k = 개수.get(c) || 0; 개수.set(c, k + 1); return [c, k]; });
  const 왼 = 76, 오 = 540, 바닥 = 34 + Math.max(8, ...개수.values()) * 8;
  const 칸X = (c) => (c < 0 ? 34 : 왼 + (c + 0.5) * ((오 - 왼) / 20));
  const 값X = (v) => 왼 + Math.max(0, Math.min(1, v)) * (오 - 왼);
  return s('svg', { viewBox: `0 0 560 ${바닥 + 22}`, class: 'r2-dots', role: 'img', 'aria-label': `홀드아웃 ${값들.length}번의 R² 분포` },
    s('line', { x1: 14, x2: 오, y1: 바닥, y2: 바닥, stroke: '#999' }),
    s('line', { x1: 왼 - 12, x2: 왼 - 12, y1: 18, y2: 바닥, stroke: '#ccc', 'stroke-dasharray': '3 3' }),
    [0, 0.5, 1].map((v) => s('text', { x: 값X(v), y: 바닥 + 16, 'text-anchor': 'middle', class: 'r2-tick' }, String(v))),
    s('text', { x: 34, y: 바닥 + 16, 'text-anchor': 'middle', class: 'r2-tick' }, '0 미만'),
    점.map(([c, k]) => s('circle', { cx: 칸X(c), cy: 바닥 - 5 - k * 8, r: 3.4, fill: c < 0 ? '#d6454b' : 학습색 })),
    표시.map((m) => [
      s('line', { x1: 값X(m.값), x2: 값X(m.값), y1: 14, y2: 바닥, stroke: m.색, 'stroke-width': 2, 'stroke-dasharray': '5 3' }),
      s('text', { x: 값X(m.값) + (m.쪽 === 'end' ? -4 : 4), y: 12, 'text-anchor': m.쪽 || 'start', class: 'r2-mark', fill: m.색 }, m.글)]));
}

// 평가 격자 — 한 줄이 한 판(또는 학습·시험), 한 칸이 한 해. 앞해 다음에 (틈을 두고) 뒤해를 둔다.
// 줄: [{ 이름, 칸: (i) => '학' | '시' | '-', 흐림? }] — 파랑 학습 · 주황 시험 · 회색 쓰지 않음
function 평가격자(줄들, 앞해, 뒤해 = [], { 앞이름 = '', 뒤이름 = '' } = {}) {
  const 해들 = [...앞해, ...뒤해], n = 해들.length, 틈 = 뒤해.length ? 10 : 0;
  const 왼 = 46, 칸w = (560 - 왼 - 2 - 틈) / n, 칸h = Math.min(24, 150 / 줄들.length), 위 = 앞이름 ? 30 : 18;
  const x = (i) => 왼 + i * 칸w + (i >= 앞해.length ? 틈 : 0);
  const 글크기 = Math.min(12, 칸h - 1);
  const 색 = { 학: 학습색, 시: 시험색, '-': '#e4e4e4' };
  return s('svg', { viewBox: `0 0 560 ${위 + 줄들.length * 칸h + 2}`, class: 'cv-grid', role: 'img', 'aria-label': `평가 격자 — ${줄들.length}줄` },
    앞이름 ? s('text', { x: x(0), y: 10, class: 'cv-year', 'font-weight': 700 }, 앞이름) : null,
    뒤이름 ? s('text', { x: x(앞해.length), y: 10, class: 'cv-year', 'font-weight': 700 }, 뒤이름) : null,
    해들.map((t, i) => s('text', { x: x(i) + 칸w / 2, y: 위 - 6, 'text-anchor': 'middle', class: 'cv-year' }, t)),
    줄들.map((줄, f) => {
      const y = 위 + f * 칸h;
      return s('g', { opacity: 줄.흐림 ? 0.2 : 1 },
        s('text', { x: 왼 - 6, y: y + 칸h / 2 + 글크기 * 0.35, 'text-anchor': 'end', class: 'cv-round', 'font-size': 글크기 }, 줄.이름),
        해들.map((_, i) => s('rect', { x: x(i) + 1, y: y + 1, width: 칸w - 2, height: 칸h - 2, rx: 3, fill: 색[줄.칸(i)] })));
    }));
}

/**
 * 한국어판 「모델 검증 및 평가 (Test and Score)」 창 — 평가 방법 여섯 가지와 딸린 칸.
 * 방법 열쇠: cv 교차 검증 · feature · random 무작위 샘플링 · loo · train 학습 데이터로 직접 평가 · test 별도 테스트 데이터로 평가.
 * 켬 에 든 방법만 고를 수 있고, 고르면 바뀜(열쇠) 을 부른다. 간단: true 면 흐린 방법의 딸린 칸을 빼서 창을 짧게 한다.
 * 폴드칸 을 주면 폴드 수를 그 칸(고를 수 있는 select)으로 둔다.
 */
function 평가창({ 이름 = 'tas', 처음 = 'cv', 켬 = ['cv', 'random', 'loo', 'train', 'test'], 바뀜, 폴드칸, 간단 = false } = {}, ...아래) {
  const 방법 = (열쇠, 글) => {
    const 잠김 = !켬.includes(열쇠);
    const b = h('input', { type: 'radio', name: 이름, checked: 열쇠 === 처음, disabled: 잠김 });
    if (!잠김) b.addEventListener('change', () => 바뀜?.(열쇠));
    return h('label', { class: `ow-radio${잠김 ? ' off' : ''}` }, b, ` ${글}`);
  };
  const 고름 = (글, 값) => h('div', { class: 'ow-sub' }, 글, h('select', { class: 'ow-combo', disabled: true, 'aria-label': 글 }, h('option', {}, 값)));
  const 상자 = (글, 켬2) => h('div', { class: 'ow-sub' }, h('label', { class: 'ow-check' }, h('input', { type: 'checkbox', checked: 켬2, disabled: true }), ` ${글}`));
  return 위젯창({ 이름: 'Test and Score', 제목: '모델 검증 및 평가 (Test and Score)', 작게: true },
    h('div', { class: 'ow-radios' },
      방법('cv', '교차 검증 (Cross validation)'),
      폴드칸 ? h('div', { class: 'ow-sub' }, '폴드 수: (Number of folds:)', 폴드칸) : 고름('폴드 수: (Number of folds:)', '5'),
      간단 ? null : 상자('클래스 비율 유지', false),
      방법('feature', 'feature 기준 교차 검증'),
      간단 ? null : h('div', { class: 'ow-sub' }, h('select', { class: 'ow-combo full', disabled: true, 'aria-label': 'feature 기준 교차 검증에 쓸 속성' }, h('option', {}, ''))),
      방법('random', '무작위 샘플링 (Random sampling)'),
      간단 ? null : [고름('반복 횟수: (Repeat train/test:)', '10'), 고름('학습 데이터 비율: (Training set size:)', '66 %'), 상자('클래스 비율 유지', true)],
      방법('loo', 'LOOCV (하나 빼고 검증) (Leave one out)'),
      방법('train', '학습 데이터로 직접 평가 (Test on train data)'),
      방법('test', '별도 테스트 데이터로 평가 (Test on test data)')),
    ...아래);
}

/** 모델 검증 및 평가 창 아래의 점수 표 한 줄 */
const 점수표 = (p) => h('table', { class: 'kv small score-row' },
  h('thead', {}, h('tr', {}, ['Model', 'MSE', 'RMSE', 'MAE', 'R2'].map((t) => h('th', { class: t === 'Model' ? '' : 'num' }, t)))),
  h('tbody', {}, h('tr', { class: 'hl' }, h('td', {}, '선형회귀'), [p.MSE, p.RMSE, p.MAE, p.R2].map((v) => h('td', { class: 'num' }, 수(v, 3))))));

// csv 를 파일로 내려받게 한다 — 앞에 BOM 을 붙여야 엑셀로 열 때 한글이 깨지지 않는다
function csv내려받기(자료) {
  const 주소 = URL.createObjectURL(new Blob(['﻿' + 자료.글], { type: 'text/csv;charset=utf-8' }));
  const a = h('a', { href: 주소, download: 자료.이름 });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(주소), 2000);
}

// 4단원 활동지 — 이 단원에서 쓴 글(합치는 기준·전문가 의견·더 넣을 속성)과 자기평가를 한 장에 담는다
const 평가문장 = '단순 선형 회귀 분석으로 수면 시간과 비만율 사이의 선형 관계를 분석할 수 있다.';
function 활동지4() {
  return 활동지내려받기({
    제목: '수면 시간과 비만율 — 4단원 활동지',
    파일이름: '4단원_수면시간과비만율',
    칸들: [
      { 제목: '1. 두 데이터를 합치는 기준 속성', 물음: '비만율 데이터와 수면시간 데이터는 어떤 속성을 기준으로 하나로 통합할 수 있을까요?', 답: 글읽기('u4.merge-key') },
      { 제목: '2. 그 속성을 기준으로 정한 이유', 답: 글읽기('u4.merge-why') },
      { 제목: '3. 내 오렌지 결과 — 두 분석의 평가 지표', 물음: '통계적 회귀 분석과 기계학습 기반 회귀 분석에서 나온 MSE · MAE · R²', 답: 내결과글() },
      { 제목: '4. 두 분석의 성능 차이와 그 까닭', 물음: '두 분석의 성능은 어떻게 달랐고, 왜 그런 차이가 났을까?', 답: 글읽기('u4.compare-why') },
      { 제목: '5. 처음 보는 데이터의 예측 — 믿을 만한 것과 믿기 어려운 것', 물음: '새로운 데이터로 예측한 값 가운데 믿을 만한 것과 믿기 어려운 것, 그리고 그 까닭', 답: 글읽기('u4.unseen-why') },
      { 제목: '6. 전문가 의견 — 제목과 출처', 물음: '인터넷에서 찾은 수면과 비만에 관한 전문가 의견(공공기관·병원·논문)의 제목과 출처', 답: 글읽기('u4.expert-title') },
      { 제목: '7. 전문가 의견 — 내용 요약', 답: 글읽기('u4.expert-body') },
      { 제목: '8. 더 넣고 싶은 속성', 물음: '수면 시간 말고 비만에 영향을 줄 속성을 하나 더 넣는다면?', 답: 글읽기('u4.more-attr') },
      { 제목: '9. 자기평가', 물음: 평가문장, 답: 글읽기('u4.self'), 빈글: '(아직 고르지 않음)' },
    ],
  });
}

// 6번 카드의 두 위젯 흐름 — 사용자가 준 오렌지 캔버스 화면(통계적 회귀분석 / 기계학습 기반 회귀분석) 그대로다.
//  ① 통계적: 열 선택의 데이터 전체를 모델 검증 및 평가(Test and Score)에 넣고, 선형회귀는 학습 알고리즘(Learner)으로만 넘긴다.
//  ② 기계학습: 데이터 샘플링으로 7 : 3 을 나누고 **성능 평가는 예측 결과 보기(Predictions)** 로 한다 — Test and Score 를 쓰지 않는다.
//     예측 결과 보기 (1) 에는 처음 보는 데이터(Unseen data)를 불러와 이어 예측만 한다.
// 위젯 이름·선 글은 한국어판 오렌지 화면 그대로다. 두 흐름의 앞부분은 자리까지 같게 두고, ② 에서는 미리 놓아 둔다.
// ⚠ 자리(x·y)와 선 글의 t·아래 는 1280×720 에서 글끼리·글과 위젯이 겹치지 않게 재어 맞춘 값이다. 고치면 다시 잴 것.
const 나눔없음 = '통계적 회귀 분석은 데이터를 나누지 않고 **전체** 를 써요.';
export const 위젯흐름 = {
  앞부분: [
    { id: 'f1', 위젯: 'File', 이름줄: ['수면시간'], 부모: [], 할일: '**수면 시간** csv 파일을 불러와요.', x: 45, y: 68 },
    { id: 'f2', 위젯: 'File', 이름줄: ['비만율'], 부모: [], 할일: '**비만율** csv 파일도 불러와요.', x: 45, y: 262 },
    { id: 'mg', 위젯: 'Merge Data', 이름줄: ['데이터 병합(열/조인)', '(Merge Data)'], 부모: ['f1', 'f2'], 할일: '두 파일을 **시점으로 맞춰 합쳐요**.', x: 205, y: 165,
      신호: { f1: { 글: '데이터 (Data)', t: 0.4 }, f2: { 글: '데이터 (Data) → Extra Data', t: 0.46 } } },
    { id: 'sc', 위젯: 'Select Columns', 이름줄: ['열 선택', '(Select Columns)'], 부모: ['mg'], 할일: '분석에 쓸 **속성만 골라요**.', x: 355, y: 165, 신호: { mg: '데이터 (Data)' } },
    { id: 'sp', 위젯: 'Scatter Plot', 이름줄: ['산점도 (Scatter Plot)'], 부모: ['sc'], 할일: '두 속성의 관계를 **산점도** 로 봐요.', x: 505, y: 40, 신호: { sc: '데이터 (Data)' } },
  ],
  통계: [
    { id: 'lr', 위젯: 'Linear Regression', 이름줄: ['선형회귀'], 부모: [], 할일: '회귀 모델을 만드는 **학습 알고리즘** 을 놓아요. 데이터는 잇지 않아요.', x: 665, y: 88,
      오답: { 'Data Sampler': 나눔없음, 'Predictions': '아직 모델이 없어요. 회귀 모델을 만드는 위젯부터 놓아요.' } },
    { id: 'ts', 위젯: 'Test and Score', 이름줄: ['모델 검증 및 평가', '(Test and Score)'], 부모: ['sc', 'lr'], 할일: '데이터 **전체** 와 학습 알고리즘을 받아 **성능(결정계수)을 확인** 해요.', x: 845, y: 165,
      신호: { sc: '데이터 (Data)', lr: '학습 알고리즘 (Learner)' },
      오답: { 'Predictions': '통계적 회귀 분석에서는 데이터와 학습 알고리즘을 함께 받아 **평가하는** 위젯을 써요.', 'Data Sampler': 나눔없음 } },
  ],
  기계: [
    { id: 'ds', 위젯: 'Data Sampler', 이름줄: ['데이터 샘플링', '(Data Sampler)'], 부모: ['sc'], 할일: '데이터를 **학습 7 : 평가 3** 으로 나눠요.', x: 505, y: 165, 신호: { sc: '데이터 (Data)' } },
    { id: 'lr', 위젯: 'Linear Regression', 이름줄: ['선형회귀'], 부모: ['ds'], 할일: '**샘플 데이터(70 %)** 로 선형 회귀 모델을 학습해요.', x: 655, y: 40, 신호: { ds: { 글: '샘플 데이터 → 데이터 (Data)', t: 0.55 } } },
    { id: 'pr', 위젯: 'Predictions', 이름줄: ['예측 결과 보기', '(Predictions)'], 부모: ['ds', 'lr'], 할일: '모델로 **남은 데이터(30 %)** 를 예측하고 **성능을 확인** 해요.', x: 865, y: 165,
      신호: { ds: { 글: '남은 데이터 (Remaining Data) → 데이터 (Data)', 아래: true }, lr: { 글: '모델 (Model) → Predictors', t: 0.42 } },
      오답: { 'Test and Score': '기계학습 기반 회귀 분석에서는 **예측 결과 보기 (Predictions)** 로 남은 데이터를 예측하고, 그 성능 점수로 평가해요.' } },
    { id: 'f3', 위젯: 'File', 이름줄: ['파일 불러오기 (File)'], 부모: [], 할일: '모델이 **처음 보는 데이터(Unseen data)** 를 불러와요.', x: 660, y: 272 },
    { id: 'pr1', 위젯: 'Predictions', 이름줄: ['예측 결과 보기', '(Predictions) (1)'], 부모: ['lr', 'f3'], 할일: '처음 보는 데이터의 **비만율을 예측** 해요.', x: 865, y: 272,
      신호: { lr: { 글: '모델 (Model) → Predictors', t: 0.3, 아래: true }, f3: { 글: '데이터 (Data)', t: 0.4 } },
      오답: { 'Test and Score': '이번에는 평가가 아니라 **예측** 이에요. 처음 보는 데이터에는 정답(비만율)이 없을 수도 있어요.' } },
  ],
};
// ── 1~19번 카드 활동 정리 PDF (2026-11-09 사용자 지시) ─────────────────────────────
// 1~19번 카드의 활동을 모두 맞혀야(끝내야) 받을 수 있다. 카드 번호는 1부터. 학번·이름은 파일 이름과 PDF 첫 쪽에만 들어가고 저장하지 않는다.
export const PDF활동 = [
  [2, 'u4.define', '문제 정의 퀴즈'], [3, 'u4.download', '데이터 내려받는 순서'], [4, 'u4.header', '머리글 두 줄을 한 줄로'],
  [6, 'u4.flow-stat', '① 통계적 회귀 분석 흐름'], [6, 'u4.flow-ml', '② 기계학습 기반 회귀 분석 흐름'],
  [7, 'u4.merge-key', '(1) 합치는 기준 속성'], [7, 'u4.merge-why', '(2) 그 까닭 쓰기'], [7, 'u4.merge', '일치하는 행 쌍만 찾기'],
  [8, 'u4.columns', '쓸 속성 고르기'], [9, 'u4.scatter', '회귀선 표시'], [9, 'u4.scatter-q', '상관계수 해석'],
  [10, 'u4.model', '학습 데이터로 직접 평가'], [11, 'u4.split', '(1) 행 수 읽기'],
  [12, 'u4.pred-error', '(1) 세 줄 옮겨 적고 오차 구하기'], [12, 'u4.pred-score', '(2) 평가 지표 적기'],
  [13, 'u4.tas-link', '선 바꿔 잇기'], [13, 'u4.tas-test', '별도 테스트 데이터로 평가'],
  [14, 'u4.holdout', '100번 나눠 보기'], [14, 'u4.resample-q', '결과를 믿을 만하게 하려면'],
  [15, 'u4.compare-q', '두 분석 견주기 퀴즈'], [15, 'u4.compare-why', '차이와 까닭 쓰기'],
  [16, 'u4.extrapolate', '범위 밖을 예측해 보기'],
  [17, 'u4.unseen-cmp', '시험 데이터와 견주기'], [17, 'u4.unseen-q', '선형회귀에 잇지 않는 까닭'],
  [18, 'u4.unseen-judge', '믿을 만한지 가리기'], [18, 'u4.unseen-why', '까닭 쓰기'],
  [19, 'u4.interpret', '결과 해석 퀴즈'],
].map(([카드, 열쇠, 이름]) => ({ 카드, 열쇠, 이름 }));

/** 파일 이름 — 「학번 이름_수면 시간과 비만율.pdf」. 파일 이름에 못 쓰는 글자는 _ 로 바꾼다 */
export const PDF파일이름 = (학번, 이름) => {
  const 다듬기 = (t) => String(t).trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ');
  return `${다듬기(학번)} ${다듬기(이름)}_수면 시간과 비만율.pdf`;
};

async function PDF받기(단추) {
  const 제목들 = u4단원.카드.map((c) => c.제목);
  const 남은 = PDF활동.filter((a) => !끝났나(a.열쇠));
  // 2026-11-09 사용자 지시 — 다 끝내지 않아도 받을 수 있다. 남은 활동이 있으면 한 번 알려 주고 묻는다
  if (남은.length) {
    const 보일 = 남은.slice(0, 8);
    const 예 = await 창('📄 아직 끝내지 않은 활동이 있어요', h('div', {},
      h('p', {}, md(`남은 활동 **${남은.length}개** — 그래도 받을 수 있어요. 끝낸 활동은 **다 푼 모습** 으로, 남은 활동은 **지금 모습 그대로** 담겨요.`)),
      h('ul', { class: 'small pdf-left' }, 보일.map((a) => h('li', {}, `${a.카드}번 「${제목들[a.카드 - 1]}」 — ${a.이름}`)),
        남은.length > 보일.length ? h('li', { class: 'muted' }, `… 그 밖에 ${남은.length - 보일.length}개`) : null)),
    [{ 글: '그만두기', 값: false }, { 글: '그래도 받기', 값: true, 주: true }]);
    if (!예) return;
  }
  const 학번칸 = h('input', { type: 'text', class: 'code-input', inputmode: 'numeric', placeholder: '예) 20315', 'aria-label': '학번' });
  const 이름칸 = h('input', { type: 'text', class: 'code-input', placeholder: '예) 홍길동', 'aria-label': '이름' });
  const 줄 = 알림줄();
  let 학번 = '', 이름 = '';
  for (;;) {
    const 예 = await 창('📄 1~19번 활동 정리 PDF 내려받기', h('div', { class: 'pdf-ask' },
      h('p', {}, '학번과 이름을 넣으세요. 파일 이름과 PDF 첫 쪽에만 들어가고 이 앱에는 저장되지 않아요.'),
      h('label', {}, '학번 ', 학번칸), h('label', {}, '이름 ', 이름칸), 줄),
    [{ 글: '그만두기', 값: false }, { 글: '내려받기', 값: true, 주: true }]);
    if (!예) return;
    학번 = 학번칸.value.trim(); 이름 = 이름칸.value.trim();
    if (학번 && 이름) break;
    줄.틀림('학번과 이름을 모두 넣어 주세요.');
  }
  const 글 = 단추.textContent;
  단추.disabled = true; 단추.textContent = '⏳ PDF 만드는 중…';
  try {
    const { 활동PDF } = await import('./u4-pdf.js');
    await 활동PDF({ 학번, 이름, 파일이름: PDF파일이름(학번, 이름), 진행: (n, 모두) => { 단추.textContent = `⏳ 카드 캡처 중… (${n}/${모두})`; } });
  } finally { 단추.disabled = false; 단추.textContent = 글; }
}

const u4단원 = {
  id: 'u4', 번호: 4, 색: '#3f7fd4', 갈래: '프로젝트 1-1 · 단순 선형 회귀',
  제목: '수면 시간과 비만율', 부제: '회귀 분석으로 수면 시간에 따른 비만율을 확인해 보자',
  카드: [
    카드('채원이의 고민', '이야기', (몸) => {
      채우기(몸, h('div', { class: 'two wide-left' },
        h('div', {},
          말풍선('🧑‍🎓', '채원', ['새해에는 꼭 살을 빼기로 했어. 작년 교복이 꽉 끼거든…', '운동도 식단도 어렵던데, **잠을 잘 자면 살이 빠진다** 는 말이 정말일까? 밤새운 다음 날엔 이상하게 과자가 당기긴 했어.']),
          말풍선('🍊', '선생님', '궁금하면 **데이터로 직접 확인** 해 보자! 독립 변수 하나로 종속 변수를 설명하는 **단순 선형 회귀 분석** 을 쓰면 돼.')),
        h('div', { class: 'box' },
          h('table', { class: 'kv small' }, h('tbody', {},
            h('tr', {}, h('th', {}, '단원'), h('td', {}, 'Ⅲ. 데이터 모델링과 평가 — 02. 회귀 분석')),
            h('tr', {}, h('th', {}, '성취기준'), h('td', {}, '[12데과03-02] 같은 데이터를 통계적 회귀 모델과 기계학습 회귀 모델로 분석해 결과 해석을 비교한다.')),
            h('tr', {}, h('th', {}, '학습 요소'), h('td', {}, '선형 회귀')))),
          h('h3', { style: { marginTop: '10px' } }, '🗺️ 이번 프로젝트의 길'),
          h('ol', { class: 'small' },
            h('li', {}, '문제 정의 — 수면 시간과 비만은 관계가 있을까?'),
            h('li', {}, '서울열린데이터광장에서 「수면 시간」·「비만율」 데이터를 받아 합치기'),
            h('li', {}, '분석에 쓸 속성만 고르기'),
            h('li', {}, '산점도로 상관관계 보기'),
            h('li', {}, '단순 선형 회귀 모델을 만들고 성능 확인'),
            h('li', {}, '결과를 해석하고 나누기')))));
    }, '교재 18쪽'),

    카드('단계 1 · 문제 정의하기', '활동', (몸) => {
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'lead' }, md('문제를 분명한 문장으로 적으면 **어떤 데이터가 필요한지** 가 보여요.')),
          h('div', { class: 'concept' }, md('**문제** : "잠이 부족하면 살이 찌기 쉽고, 잘 자면 살이 빠진다"는 주장이 사실인지 단순 선형 회귀 분석으로 확인하려고 한다.\n**독립 변수** : 평균 수면 시간\n**종속 변수** : 비만율'))),
        퀴즈([
          { 질문: '이 프로젝트에서 **종속 변수** 는?', 보기: ['평균 수면 시간', '비만율', '연도(시점)'], 답: 1, 해설: '수면 시간의 영향을 받는(받는다고 가정한) 쪽이 비만율이에요.' },
          { 질문: '이 문제를 풀려면 어떤 데이터가 필요할까요?', 보기: ['연도별 청소년 평균 수면 시간과 연도별 비만율', '우리 반 친구들의 키와 몸무게', '서울의 연도별 기온'], 답: 0, 해설: '두 데이터를 「연도(시점)」 로 맞춰 합치면 돼요.' },
          { 질문: '데이터 과학으로 풀 수 있는 문제로 고친 것은?', 보기: ['잠이 몸에 좋을까?', '연도별 평균 수면 시간이 줄면 비만율이 늘어날까?'], 답: 1, 해설: '무엇을 재고 견줄지 분명해야 데이터로 답할 수 있어요.' },
        ], { 열쇠: 'u4.define' })));
    }, '교재 19쪽'),

    카드('단계 2 · 데이터 내려받기', '활동', (몸) => {
      채우기(몸,
        h('p', {}, md('**서울열린데이터광장** (data.seoul.go.kr) 에서 두 데이터를 받아요. 「수면 시간」 자료를 받는 순서를 맞혀 보세요.')),
        순서(['서울열린데이터광장에 접속한다', '검색창에 「수면시간」 을 입력한다', '「서울시 청소년 평균수면시간 및 주관적 건강인지율 통계」 를 고른다', '[시점] 에서 연도를 2007~2024 로 정한다', '[통계표 조회] 를 누른다', 'csv 형식으로 내려받는다'], { 열쇠: 'u4.download' }),
        h('div', { class: 'tip' }, '💡 「비만」 으로 검색해 「서울시 청소년 비만 및 체중조절 통계」 도 같은 방법으로 받아요. (연도 2006~2024)'),
        h('p', { class: 'muted small' }, '사이트 화면과 메뉴 이름은 바뀔 수 있어요. 이 앱의 연습 데이터는 실제 통계가 아니라 새로 만든 값이에요.'));
    }, '교재 19~20쪽'),

    카드('머리글 두 줄을 한 줄로', '활동', (몸) => {
      const 줄1 = ['시점', '주중평균', '', '', '주말평균'];
      const 줄2 = ['', '전체', '남학생', '여학생', '전체'];
      const 결과 = h('div', {});
      const 줄 = 알림줄();
      // 스프레드시트처럼 칸마다 선을 긋고 왼쪽에 줄 번호를 단다 — 「첫 줄·둘째 줄」 이 눈에 보이게
      const 표 = (머리, 둘째) => h('table', { class: 'kv sheet' },
        h('thead', {}, h('tr', {}, h('th', { class: 'row-no' }, ''), ['A', 'B', 'C', 'D', 'E'].map((c) => h('th', { class: 'col-no' }, c)))),
        h('tbody', {},
          h('tr', {}, h('th', { class: 'row-no' }, 1), 머리.map((m) => h('td', { class: 'head-cell' }, m))),
          둘째 ? h('tr', {}, h('th', { class: 'row-no' }, 2), 둘째.map((m) => h('td', { class: 'head-cell' }, m))) : null,
          h('tr', {}, h('th', { class: 'row-no' }, 둘째 ? 3 : 2), ['2024', '6.01', '6.14', '5.88', '7.62'].map((v) => h('td', { class: 'num' }, v)))));
      // 지금 보이는 표가 어떤 모습인지 이름표를 함께 단다 — 세 모습을 오가며 견주기 쉽게
      const 보이기 = (이름, 머리, 둘째) => 채우기(결과, h('p', { class: 'muted small' }, 이름), 표(머리, 둘째));
      const 처음 = () => { 보이기('📄 처음 내려받은 csv', 줄1, 줄2); 줄.지우기(); };
      처음();
      if (다푼모습('u4.header')) { 보이기('② 직접 이어 적고 둘째 줄을 지운 뒤', ['시점', '주중평균 전체', '주중평균 남학생', '주중평균 여학생', '주말평균 전체']); 줄.맞음('첫 줄과 둘째 줄을 **직접 이어 적고** 둘째 줄을 지웠어요.'); }
      // 표는 카드 너비를 다 쓰게 한 줄에 두고, 고치는 단추는 그 아래에 둔다 — 속성명이 잘리지 않게
      채우기(몸,
        h('p', {}, md('내려받은 csv 를 열면 **머리글이 두 줄** 이에요. 오렌지는 **첫 줄만 속성명** 으로 읽으니 한 줄로 만들어야 해요.')),
        결과,
        h('p', {}, md('어떻게 고칠까요? **①·② 두 방법** 을 눌러 결과를 견주어 보세요. **처음 상태 보기** 를 누르면 내려받은 그대로로 돌아가요.')),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn', onclick: 처음 }, '↺ 처음 상태 보기'),
          h('button', { type: 'button', class: 'btn', onclick: () => { 보이기('① 엑셀 「병합」 단추를 누른 뒤', ['시점', '주중평균', '주중평균', '주중평균', '주말평균']); 줄.틀림('엑셀 **병합하고 가운데 맞춤** 은 두 번째 줄의 내용(전체·남학생·여학생)을 지워 버려요. 그러면 속성명이 서로 같아져 구별할 수 없어요!'); } }, '① 엑셀 「병합」 단추'),
          h('button', { type: 'button', class: 'btn primary', onclick: () => { 보이기('② 직접 이어 적고 둘째 줄을 지운 뒤', ['시점', '주중평균 전체', '주중평균 남학생', '주중평균 여학생', '주말평균 전체']); 줄.맞음('첫 줄과 둘째 줄을 **직접 이어 적고** 둘째 줄을 지웠어요. 속성명이 모두 달라졌어요!'); 마침('u4.header'); } }, '② 직접 이어 적고 둘째 줄 지우기')),
        줄,
        h('p', { class: 'muted small' }, '이 앱은 두 낱말 사이에 띄어쓰기를 넣었어요. 교재 화면처럼 붙여 써도(주중평균전체) 괜찮아요.'));
    }, '교재 20쪽'),

    카드('비만율 데이터도 같은 방법으로', '활동', (몸) => {
      const 받기단추 = (자료) => h('button', { type: 'button', class: 'btn csv-btn', onclick: () => csv내려받기(자료) },
        h('span', {}, `⬇ ${자료.이름}`), h('small', { class: 'muted' }, `${자료.처음}~${자료.끝}년 · 자료 ${자료.줄}줄 · 열 ${자료.열}개`));
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'lead' }, md(`**「청소년 비만 및 체중조절」** 데이터도 **「청소년 평균수면시간 및 주관적 건강인지율」** 데이터와 **같은 방법** 으로 내려받아 정리해요.`)),
          h('table', { class: 'kv small' },
            h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, '😴 수면 시간'), h('th', {}, '⚖️ 비만율'))),
            h('tbody', {},
              h('tr', {}, h('th', {}, '검색어'), h('td', {}, '수면시간'), h('td', {}, '비만')),
              h('tr', {}, h('th', {}, '통계표'), h('td', {}, 수면csv.통계표), h('td', {}, 비만csv.통계표)),
              h('tr', {}, h('th', {}, '[시점]'), h('td', {}, `${수면csv.처음}~${수면csv.끝}`), h('td', {}, `${비만csv.처음}~${비만csv.끝}`)),
              h('tr', {}, h('th', {}, '받는 형식'), h('td', {}, 'csv'), h('td', {}, 'csv')),
              h('tr', {}, h('th', {}, '정리'), h('td', {}, '머리글 두 줄 → 한 줄'), h('td', {}, '머리글 두 줄 → 한 줄')))),
          h('div', { class: 'tip' }, md('💡 비만율 파일도 머리글이 두 줄이에요. 엑셀 **병합 단추** 는 쓰지 말고, 첫 줄과 둘째 줄을 **직접 이어 적은 뒤** 둘째 줄을 지워요.'))),
        h('div', {},
          h('h3', {}, '📥 정리를 마친 파일 내려받기'),
          h('p', { class: 'small' }, '머리글을 한 줄로 정리해 둔 수정본이에요. 직접 내려받기 어렵거나 시간이 모자라면 이 두 파일로 바로 오렌지 실습을 시작해도 돼요.'),
          h('div', { class: 'csv-btns' }, 받기단추(수면csv), 받기단추(비만csv)),
          h('p', { class: 'muted small' }, md(`출처: 서울열린데이터광장(data.seoul.go.kr) 「${수면csv.통계표}」·「${비만csv.통계표}」. 머리글만 한 줄로 고쳤어요.`)),
          h('div', { class: 'warn' }, md(`이 두 파일은 **실제 통계** 예요. 앱 안의 그래프·표는 연습용으로 새로 만든 값이라 숫자와 줄 수가 조금 달라요. (실제 비만율 파일은 **${비만csv.처음}년** 부터 있어서, Find matching 으로 합치면 앱의 17줄보다 한 줄 많은 **18줄** 이 돼요.)`)))));
    }, '교재 19~20쪽'),

    카드('오렌지에서 위젯 흐름 만들기', '오렌지', (몸) => {
      // 같은 데이터를 두 가지로 분석한다 — 흐름 자료는 위의 위젯흐름 에 있다
      const 팔레트 = ['File', 'Data Table', 'Merge Data', 'Select Columns', 'Select Rows', 'Scatter Plot', 'Distributions', 'Data Sampler', 'Linear Regression', 'k-Means', 'Test and Score', 'Predictions'];
      const 흐름들 = [
        {
          이름: '① 통계적 회귀 분석', 열쇠: 'u4.flow-stat',
          설명: '데이터 **전체** 로 회귀식을 만들고, 그 식이 데이터를 얼마나 잘 설명하는지 **모델 검증 및 평가** 로 확인해요.',
          만들기: (다됨) => 흐름조립([...위젯흐름.앞부분, ...위젯흐름.통계], {
            열쇠: 'u4.flow-stat', 팔레트, 높이: 345, 너비: 930, 글돌리기: true, 다됨,
            끝글: '선형회귀는 **학습 알고리즘 (Learner)** 으로만 넘겨요. 모델 검증 및 평가에서 **학습 데이터로 직접 평가** 를 고르면 전체 데이터로 만든 회귀식의 결정계수가 나와요.',
          }),
        },
        {
          이름: '② 기계학습 기반 회귀 분석', 열쇠: 'u4.flow-ml',
          설명: '**7 : 3** 으로 나눠 학습하고, 학습에 안 쓴 **30 %** 를 **예측 결과 보기** 로 평가해요. 앞부분은 ① 과 같아요.',
          만들기: (다됨) => 흐름조립(위젯흐름.기계, {
            열쇠: 'u4.flow-ml', 팔레트, 높이: 345, 너비: 930, 글돌리기: true, 다됨, 미리: 위젯흐름.앞부분,
            끝글: '예측 결과 보기의 **성능 점수 표시** 를 켜면 학습에 쓰지 않은 **남은 데이터(30 %)** 로 낸 MSE·RMSE·MAE·R² 가 나와요. **(1)** 은 처음 보는 데이터의 비만율을 예측해요.',
          }),
        },
      ];
      // 두 흐름을 미리 다 만들어 두고 보이는 것만 바꾼다 — 흐름을 오가도 이어 둔 데까지 남는다
      const 자리 = h('div', {}), 단추줄 = h('div', { class: 'seg', role: 'group', 'aria-label': '분석 방법 고르기' }), 설명 = h('p', { class: 'small' });
      let 지금 = 끝났나('u4.flow-stat') && !끝났나('u4.flow-ml') ? 1 : 0;
      const 고르기 = (i) => {
        지금 = i;
        채우기(단추줄, 흐름들.map((f, j) => h('button', { type: 'button', class: j === i ? 'on' : '', 'aria-pressed': String(j === i), onclick: () => 고르기(j) },
          `${f.이름}${끝났나(f.열쇠) ? ' ✅' : ''}`)));
        채우기(설명, md(흐름들[i].설명));
        흐름들.forEach((f, j) => { f.판.hidden = j !== i; });
      };
      const 다됨 = () => { if (흐름들.every((f) => 끝났나(f.열쇠))) 마침('u4.flow'); 고르기(지금); };
      for (const f of 흐름들) { f.판 = h('div', {}, f.만들기(다됨)); 자리.append(f.판); }
      고르기(지금);
      채우기(몸, h('div', { class: 'flow-switch' }, 단추줄, 설명), 자리);
    }, '교재 21~24쪽'),

    카드('Merge Data — 두 파일 합치기', '오렌지', (몸) => {
      let 방식 = 다푼모습('u4.merge') ? 1 : 0;
      // (1) 에서 기준 속성을 맞혀야 Row matching 이 채워지고 합친 결과가 보인다 — 오렌지도 기준을 정해야 합친다
      let 기준 = 끝났나('u4.merge-key');
      const 결과 = h('div', {}), 줄 = 알림줄(), 답줄 = 알림줄();
      const 짝칸 = h('div', { class: 'row' }), 줄수 = h('span', { class: 'ow-count', title: '들어온 줄 수 (Data | Extra Data) · 나간 줄 수' });
      const 그리기 = () => {
        const 고름 = (글) => h('select', { class: 'pick', disabled: true, 'aria-label': 'Row matching 속성' }, h('option', {}, 글));
        채우기(짝칸, 고름(기준 ? '시점' : '?'), ' matches ', 고름(기준 ? '시점' : '?'));
        if (!기준) {
          채우기(줄수, `⇥ ${수면표.length} | ${비만표.length}  ↦ ?`);
          채우기(결과, h('p', { class: 'muted small' }, '(1) 에서 두 데이터를 합칠 기준 속성을 정하면 합친 결과가 보여요.'));
          줄.지우기();
          return;
        }
        const 표 = 합치기(수면표, 비만표, 방식);
        const 빈줄 = 표.행.filter((r) => 표.열.some((k) => r[k] === null)).length;
        채우기(줄수, `⇥ ${수면표.length} | ${비만표.length}  ↦ ${표.행.length}`);
        채우기(결과, 데이터표(표.열, 표값(표), { 최대행: 2, 설명: `🗒️ Data Table 로 본 결과 — ${표.행.length}줄 × ${표.열.length - 1}개 속성 (+ 시점)${빈줄 ? ` · 빈칸 있는 줄 ${빈줄}개` : ''}` }));
        if (방식 === 1) { 줄.맞음('두 파일에 **모두 있는 해(2008~2024)** 만 남아 **17줄**, 빈칸이 없어요. 이 프로젝트는 이 방식을 써요.'); 마침('u4.merge'); }
        else if (방식 === 0) 줄.틀림('Data(수면) 파일의 줄을 모두 남겨요. 비만율이 없는 **2007년** 이 빈칸(?)으로 남았어요.');
        else 줄.틀림('두 파일의 줄을 모두 남겨 **2007년** 이 빈칸(?)이에요. **Preprocess** 의 **Remove rows with missing values.** 로 지워야 해요.');
      };
      const 기준칸 = h('input', { type: 'text', class: 'write key-input', placeholder: '기준이 되는 속성 이름', 'aria-label': '기준이 되는 속성 이름', value: 글읽기('u4.merge-key') });
      기준칸.addEventListener('input', () => 글쓰기('u4.merge-key', 기준칸.value));
      const 확인 = () => {
        const 글 = 기준칸.value.replace(/[\s「」"'()]/g, '');
        if (!글) { 답줄.틀림('속성 이름을 먼저 적어 보세요.'); return; }
        if (글.includes('시점')) 답줄.맞음('맞아요! 기준 속성은 **시점** 이에요. 그 까닭은 (2) 에 적어 보세요.');
        else if (/연도|년도/.test(글)) 답줄.맞음('맞아요, 연도예요! 다만 파일 속 속성 이름은 **「시점」** 이에요.');
        else { 답줄.틀림('두 파일에 **똑같이 들어 있는** 속성을 찾아보세요. 수면 시간 파일과 비만율 파일의 **첫 열** 을 견주어 보면 보여요.'); return; }
        기준 = true; 마침('u4.merge-key'); 그리기();
      };
      기준칸.addEventListener('keydown', (e) => { if (e.key === 'Enter') 확인(); });
      그리기();
      if (기준) 답줄.맞음('기준 속성: **시점**');
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          위젯연결도([
            { id: 'f1', 위젯: 'File', 이름줄: ['파일 불러오기 (File)'], x: 85, y: 40 },
            { id: 'f2', 위젯: 'File', 이름줄: ['파일 불러오기 (File) (1)'], x: 85, y: 138 },
            { id: 'mg', 위젯: 'Merge Data', 이름줄: ['데이터 병합(열/조인)', '(Merge Data)'], x: 258, y: 89 },
          ], [
            { 부터: 'f1', 까지: 'mg', 글: '데이터 (Data)' },
            { 부터: 'f2', 까지: 'mg', 글: '데이터 (Data) → Extra Data' },
          ], { 너비: 336, 높이: 192, 키: 138 }),
          h('p', { class: 'small muted fig-cap' }, '파일 불러오기 (File) 위젯 두 개를 데이터 병합(열/조인) (Merge Data) 위젯에 연결하기'),
          h('label', { class: 'write-wrap' }, h('span', { class: 'write-label' }, md('**(1)** 비만율 데이터와 수면시간 데이터는 **어떤 속성** 을 기준으로 하나로 통합할 수 있을까요?')),
            h('div', { class: 'row' }, 기준칸, h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '확인'))),
          답줄,
          // 2026-11-09 사용자 지시 — 5글자 이상 쓰면 예시 답안이 칸 아래에 나온다
          쓰기('u4.merge-why', { 안내: '**(2)** 그 속성을 기준으로 정한 이유를 적어 보세요.', 줄수: 2,
            답안: '두 파일에 모두 있는 **시점(연도)** 으로 같은 해의 수면 시간과 비만율을 한 줄로 짝지을 수 있으니까.' })),
        h('div', {},
          위젯창({ 이름: 'Merge Data', 제목: '데이터 병합(열/조인) (Merge Data)', 작게: true },
            묶음상자('병합 방식', 라디오('merge', ['추가 데이터(Extra)의 열 덧붙이기 (Left Join)', '일치하는 행 쌍만 찾기 (Inner Join)', '테이블 이어붙이기 (Outer Join)'], 방식, (i) => { 방식 = i; 그리기(); })),
            묶음상자('Row matching', 짝칸),
            h('div', { class: 'ow-foot' }, h('label', { class: 'ow-radio' }, h('input', { type: 'checkbox', checked: true, disabled: true }), ' 자동 적용 (Apply automatically)'), 줄수)),
          h('p', { class: 'small muted fig-cap' }, md('데이터 병합(열/조인) (Merge Data) 창 — 먼저 이은 수면 파일이 **Data**, 나중 것이 **Extra Data** 예요.')),
          결과, 줄)));
    }, '교재 21쪽'),

    카드('Select Columns — 쓸 속성만 고르기', '오렌지', (몸) => {
      const 표 = 수면비만();
      const 답 = { [수면열]: 'Features', [비만열]: 'Target', 시점: 'Metas' };
      채우기(몸, h('div', { class: 'two wide-left' },
        열고르기(표.열, 답, { 열쇠: 'u4.columns', 처음: Object.fromEntries(표.열.map((k) => [k, 'Features'])) }),
        h('div', {},
          h('p', {}, md('합친 표에는 속성이 많아요. 이번 분석에 쓸 것만 알맞은 상자로 옮기세요.')),
          h('table', { class: 'kv small' }, h('tbody', {},
            h('tr', {}, h('th', {}, 'Features'), h('td', {}, md('독립 변수 → **주중평균 전체** (남녀 학생의 주중 평균 수면 시간)'))),
            h('tr', {}, h('th', {}, 'Target'), h('td', {}, md('종속 변수 → **비만율 전체**'))),
            h('tr', {}, h('th', {}, 'Metas'), h('td', {}, md('계산에는 안 쓰지만 함께 보고 싶은 것 → **시점**'))),
            h('tr', {}, h('th', {}, 'Ignored'), h('td', {}, '나머지는 모두 여기로')))),
          h('div', { class: 'tip' }, '💡 오렌지는 csv 를 읽을 때 숫자 열을 모두 Features 로 넣어 둬요. 시점(연도)도 숫자라 처음엔 Features 에 있어요.'))));
    }, '교재 22쪽'),

    카드('단계 4 · Scatter Plot 으로 관계 보기', '오렌지', (몸) => {
      const 표 = 수면비만();
      const x = 표.행.map((r) => r[수면열]), y = 표.행.map((r) => r[비만열]);
      const r = 상관(x, y), 선 = 단순회귀(x, y);
      const 그림 = h('div', {});
      const 상자 = h('input', { type: 'checkbox', checked: 다푼모습('u4.scatter') });
      const 그리기 = () => {
        채우기(그림, 산점도(표.행.map((row) => ({ x: row[수면열], y: row[비만열], 제목: `${row.시점}년` })), {
          x이름: '주중평균 전체 (시간)', y이름: '비만율 전체 (%)', 너비: 520, 높이: 280, 반지름: 7,
          선: 상자.checked ? { ...선, 글: `r = ${수(r, 2)}` } : null,
        }).svg);
        if (상자.checked) 마침('u4.scatter');
      };
      상자.addEventListener('change', 그리기);
      그리기();
      채우기(몸, h('div', { class: 'two wide-left' },
        h('div', {}, 그림),
        h('div', {},
          위젯창('Scatter Plot',
            묶음상자('Axes', h('div', {}, 'Axis x: ', h('b', {}, '주중평균 전체')), h('div', {}, 'Axis y: ', h('b', {}, '비만율 전체'))),
            묶음상자('Plot Properties', h('label', { class: 'ow-radio' }, 상자, ' 회귀선 표시 (Show regression line)'), h('div', { class: 'small muted' }, '👆 켜면 회귀선과 상관계수 r 이 함께 보여요.'))),
          퀴즈([
            { 질문: `r = ${수(r, 2)} 를 해석하면?`, 보기: ['수면 시간이 늘수록 비만율이 낮아지는 매우 강한 음의 상관', '수면 시간이 늘수록 비만율도 높아지는 양의 상관', '거의 상관이 없다'], 답: 0, 해설: `|r| ≥ 0.8 이고 부호가 − 라서 「${상관정도(r)}」 (음의 방향)이에요.`, 힌트: '부호는 방향, 크기는 세기예요.' },
          ], { 열쇠: 'u4.scatter-q' }))));
    }, '교재 22쪽'),

    // ① 통계적 회귀 분석 — 6번 카드 ① 흐름. 데이터 전체(17개)로 회귀식을 만들고, 모델 검증 및 평가의 「학습 데이터로 직접 평가」 로
    //   그 식이 같은 데이터를 얼마나 잘 설명하는지 본다. 2026-11-08 사용자 정정 지시로 10~13번을 이렇게 나눴다:
    //   10 ① 통계적(Test and Score · 학습 데이터로 직접 평가) → 11·12 ② 기계학습(홀드아웃 + 예측 결과 보기) →
    //   13 Test and Score 로 하는 ② (별도 테스트 데이터로 평가, 선 바꿔 잇기) → … → 맨 끝 ⭐ 심화 교차 검증
    카드('단계 5 · ① 통계적 회귀 분석 — 모델 검증 및 평가', '오렌지', (몸) => {
      const 표 = 수면비만();
      const x = 표.행.map((r) => r[수면열]), y = 표.행.map((r) => r[비만열]);
      const 식 = 단순회귀(x, y), 통계 = 평가방법점수(표.행, 'train');
      const 결과 = h('div', {}), 줄 = 알림줄();
      const 안내 = {
        cv: '교차 검증은 맨 끝 **⭐ 심화 카드** 에서 다뤄요. 통계적 회귀 분석은 **전체 데이터로 만든 회귀식** 을 **같은 데이터** 로 확인해요.',
        random: '무작위 샘플링은 데이터를 나눠 시험하는 방법이에요. 통계적 회귀 분석은 데이터를 **나누지 않아요**.',
        loo: 'LOOCV 도 데이터를 나눠 돌아가며 시험하는 교차 검증이에요. 맨 끝 **⭐ 심화 카드** 에서 다뤄요.',
        test: '이 흐름에는 **테스트 데이터** 가 이어져 있지 않아요. 떼어 둔 데이터로 시험하는 것은 **② 기계학습 기반 회귀 분석**(11~13번 카드)이에요.',
      };
      const 바뀜 = (m) => {
        if (m === 'train') {
          채우기(결과, 점수표(통계));
          줄.맞음(`R² **${수(통계.R2, 3)}** — 회귀식이 비만율 변화의 약 **${Math.round(통계.R2 * 100)} %** 를 설명해요(**설명력**).`);
          마침('u4.model');
        } else { 채우기(결과); 줄.틀림(안내[m]); }
      };
      if (끝났나('u4.model')) 채우기(결과, 점수표(통계));
      if (다푼모습('u4.model')) 줄.맞음(`R² **${수(통계.R2, 3)}** — 회귀식이 비만율 변화의 약 **${Math.round(통계.R2 * 100)} %** 를 설명해요(**설명력**).`);
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('div', { class: 'concept' }, md(`**① 통계적 회귀 분석** — 데이터를 나누지 않고 **전체 ${표.행.length}개** 로 회귀식을 만들고, 그 식이 데이터를 얼마나 잘 설명하는지 확인해요. 오른쪽 창에서 **알맞은 평가 방법** 을 골라 보세요.`)),
          산점도(표.행.map((row) => ({ x: row[수면열], y: row[비만열], 제목: `${row.시점}년` })), {
            x이름: '주중평균 전체 (시간)', y이름: '비만율 전체 (%)', 너비: 560, 높이: 175, 반지름: 6, 선: { ...식, 글: '회귀선' } }).svg,
          h('p', { class: 'small muted' }, md(`회귀식: 비만율 = ${수(식.기울기, 2)} × 수면 시간 + ${수(식.절편, 2)} (전체 ${표.행.length}개로 만듦)`)),
          위젯연결도([
            { id: 'sc', 위젯: 'Select Columns', 이름줄: ['열 선택'], x: 60, y: 40 },
            { id: 'lr', 위젯: 'Linear Regression', 이름줄: ['선형회귀'], x: 60, y: 128 },
            { id: 'ts', 위젯: 'Test and Score', 이름줄: ['모델 검증 및 평가', '(Test and Score)'], x: 300, y: 84 },
          ], [
            { 부터: 'sc', 까지: 'ts', 글: '데이터 (Data)' },
            { 부터: 'lr', 까지: 'ts', 글: '학습 알고리즘 (Learner)' },
          ], { 너비: 380, 높이: 176, 키: 155 })),
        h('div', {},
          평가창({ 이름: 'tas-stat', 바뀜, 처음: 다푼모습('u4.model') ? 'train' : 'cv' }, 결과),
          줄)));
    }, '교재 23쪽'),

    // ② 기계학습 기반 회귀 분석 (1) — 홀드아웃: 데이터 샘플링으로 데이터를 나눠 두기. 학습지(PDF) STEP 1 의 행 수 읽기 문항을 둔다
    카드('② 기계학습 기반 회귀 분석 (1) — 홀드아웃으로 데이터 나누기', '오렌지', (몸) => {
      const 표 = 수면비만();
      // 고정 비율 막대는 이 카드 안에서만 움직인다(2026-11-08 사용자 지시) — 50~90 %. 12번 카드부터는 70 % 로 나눈 고정 표본으로 셈한다
      let 고정 = true, 씨앗 = 고정씨앗, 비율 = 70;
      const 그림 = h('div', {});
      const 줄수 = h('span', { class: 'ow-count', title: '들어온 줄 수 · 나간 줄 수 (샘플 데이터 | 남은 데이터)' });
      const 비율글 = h('span', { class: 'ow-pct' }, '70 %');
      // 막대를 70 % 에서 옮기면 오른쪽 아래 설명 줄을 「12번부터는 70 %」 안내로 바꾼다(창 안에 넣으면 카드가 넘친다)
      const 비율알림 = h('p', { class: 'small muted fig-cap' });
      const 그리기 = () => {
        const { 나눔, 모델 } = 훈련과시험(표.행, 씨앗, 비율 / 100);
        채우기(줄수, `⇥ ${표.행.length}  ↦ ${나눔.훈련.length} | ${나눔.시험.length}`);
        채우기(비율글, `${비율} %`);
        비율알림.classList.toggle('ratio-note', 비율 !== 70);
        채우기(비율알림, md(비율 === 70 ? '6번 카드 ② 흐름 그대로예요. 점수는 다음 카드의 **예측 결과 보기** 에서 확인해요.'
          : `⚠ **12번 카드부터는 70 %** 로 나눈 표본으로 셈해요. 오렌지에서도 70 % 로 맞춰 두세요.`));
        채우기(그림, 산점도(표.행.map((row, i) => ({ x: row[수면열], y: row[비만열], 색: 나눔.시험.includes(i) ? 시험색 : 학습색, 큰: 나눔.시험.includes(i) })), {
          x이름: '주중평균 전체 (시간)', y이름: '비만율 전체 (%)', 너비: 460, 높이: 245, 반지름: 6, 선: { ...모델, 글: '회귀선' } }).svg,
        h('div', { class: 'legend' }, h('span', { style: { '--c': 학습색 } }, `샘플 데이터 ${나눔.훈련.length}개 (${비율} %) — 배우기`), h('span', { style: { '--c': 시험색 } }, `남은 데이터 ${나눔.시험.length}개 (${100 - 비율} %) — 시험`)));
      };
      const 비율막대 = h('input', { type: 'range', class: 'ow-slider', min: 50, max: 90, step: 5, value: 70, 'aria-label': '고정 비율', title: '이 카드에서는 50~90 % 사이로 움직여요' });
      비율막대.addEventListener('input', () => { 비율 = Number(비율막대.value); 그리기(); });
      const 고정상자 = h('input', { type: 'checkbox', checked: true });
      고정상자.addEventListener('change', () => { 고정 = 고정상자.checked; if (고정) { 씨앗 = 고정씨앗; 그리기(); } });
      그리기();
      // 한국어판 오렌지의 데이터 샘플링 창 — 이 활동에서 쓰는 것은 「고정 비율」 과 「재현 가능한 샘플링」 뿐이라 나머지는 잠가 둔다
      const 끔 = (글) => h('label', { class: 'ow-radio off' }, h('input', { type: 'radio', disabled: true }), ` ${글}`);
      const 칸 = (글, 값) => h('div', { class: 'ow-sub' }, 글, h('input', { type: 'number', class: 'ow-spin', value: 값, disabled: true, 'aria-label': 글 }));
      const 샘플링창 = 위젯창({ 이름: 'Data Sampler', 제목: '데이터 샘플링 (Data Sampler)', 작게: true },
        묶음상자('샘플링 유형',
          h('label', { class: 'ow-radio' }, h('input', { type: 'radio', checked: true, disabled: true }), ' 데이터의 고정 비율:'),
          h('div', { class: 'ow-sub' }, 비율막대, 비율글),
          끔('고정 샘플 크기'),
          칸('인스턴스 수:', 1),
          h('div', { class: 'ow-sub' }, h('label', { class: 'ow-radio off' }, h('input', { type: 'checkbox', disabled: true }), ' 복원 추출(중복 허용)')),
          끔('교차 검증'),
          칸('부분집합(폴드) 수:', 10),
          칸('미사용 부분집합:', 1),
          끔('부트스트랩')),
        묶음상자('옵션',
          h('label', { class: 'ow-radio' }, 고정상자, ' 재현 가능한(결정론적) 샘플링'),
          h('label', { class: 'ow-radio off' }, h('input', { type: 'checkbox', disabled: true }), ' 층화 샘플링 (가능한 경우)')),
        h('button', { type: 'button', class: 'ow-btn wide', onclick: () => { if (!고정) 씨앗 = Math.floor(Math.random() * 1e6); 그리기(); } }, '데이터 샘플링'),
        h('div', { class: 'ow-foot' }, 줄수));
      // 창 맨 아래 줄 수를 읽는다 — 전체 · 샘플 데이터 · 남은 데이터. 막대를 움직였으면 그 비율로 나뉜 수가 정답이다
      const 행수들 = () => { const 나눔 = 훈련과시험(표.행, 고정씨앗, 비율 / 100).나눔; return [표.행.length, 나눔.훈련.length, 나눔.시험.length]; };
      const 행수 = [['전체 데이터', '열 선택에서 들어온 데이터'], ['샘플 데이터 (Data Sample)', '모델이 배우는 데이터'], ['남은 데이터 (Remaining Data)', '모델을 시험하는 데이터']];
      const 다함 = 끝났나('u4.split');
      const 칸들 = 행수.map(([이름], i) => h('input', { type: 'text', class: 'blank', inputmode: 'numeric', size: 3, 'aria-label': `${이름} 행 수`, value: 다함 ? String(행수들()[i]) : '' }));
      const 줄 = 알림줄();
      const 확인 = () => {
        let 맞음 = 0;
        const 답 = 행수들();
        칸들.forEach((inp, i) => { const ok = inp.value.trim() !== '' && Number(inp.value) === 답[i]; inp.classList.toggle('ok', ok); inp.classList.toggle('bad', !ok); if (ok) 맞음++; });
        if (맞음 === 칸들.length) { 줄.맞음('맞았어요! 샘플 데이터는 **선형회귀** 로, 남은 데이터는 **예측 결과 보기** 로 보내요.'); 마침('u4.split'); }
        else 줄.틀림('데이터 샘플링 창 맨 아래 **⇥ 들어온 수 ↦ 샘플 | 남은 수** 를 읽어 보세요.');
      };
      if (다함) 줄.맞음('샘플 데이터는 **선형회귀** 로, 남은 데이터는 **예측 결과 보기** 로 보내요.');
      채우기(몸, h('div', { class: 'ds-grid' },
        h('div', {},
          h('div', { class: 'concept' }, md('**② 기계학습 기반 회귀 분석** 은 데이터를 **나눠** 배우고 시험해요. **홀드아웃(hold-out)** — 데이터 일부를 처음부터 **떼어 두고(hold out)** 학습에는 쓰지 않았다가, 모델을 다 만든 뒤 그 데이터로 시험을 보는 방법이에요.')),
          h('div', { class: 'tip' }, md('🧸 **쉽게 말하면** — 문제집으로 공부하고, 선생님이 숨겨 둔 문제로 시험 보기.')),
          그림),
        샘플링창,
        h('div', {},
          h('p', { class: 'write-label' }, md('**(1)** 데이터 샘플링 창 아래에 나온 **행 수** 를 적어 보세요.')),
          h('table', { class: 'kv small calc' },
            h('tbody', {}, 행수.map(([이름, 뜻], i) => h('tr', {}, h('td', {}, h('b', {}, 이름), h('br'), h('small', { class: 'muted' }, 뜻)), h('td', { class: 'num' }, 칸들[i]))))),
          h('div', { class: 'row check' }, h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '정답 확인'), 줄),
          위젯연결도([
            { id: 'ds', 위젯: 'Data Sampler', 이름줄: ['데이터 샘플링'], x: 55, y: 98 },
            { id: 'lr', 위젯: 'Linear Regression', 이름줄: ['선형회귀'], x: 180, y: 36 },
            { id: 'pr', 위젯: 'Predictions', 이름줄: ['예측 결과 보기'], x: 290, y: 126 },
          ], [
            { 부터: 'ds', 까지: 'lr', 글: '샘플 데이터' },
            { 부터: 'ds', 까지: 'pr', 글: '남은 데이터' },
            { 부터: 'lr', 까지: 'pr', 글: '모델' },
          ], { 너비: 336, 높이: 186, 키: 150 }),
          비율알림)));
    }, '교재 23쪽'),

    // ② 기계학습 흐름의 평가 — 예측 결과 보기(Predictions) 창을 읽는다. 학생 학습지(PDF) 의 두 문항을 그대로 중심에 둔다(2026-11-08 사용자 지시):
    //  (1) 창에 나온 시험 데이터 위에서부터 세 줄을 옮겨 적고 오차를 구한다 — 다 맞히면 창의 error 열이 열린다
    //  (2) 창 아래 성능 점수(평가 지표)를 적는다 — 성능 점수 표시는 처음부터 켜 둔다
    // Test and Score 와 견주는 문항·MAPE 뜻을 묻는 문항은 사용자 지시로 뺐다.
    카드('② 기계학습 기반 회귀 분석 (2) — 예측 결과 보기로 평가하기', '오렌지', (몸) => {
      const 표 = 수면비만();
      const { 줄들, 점수 } = 시험예측(표.행);
      const 한자리 = (v) => 수(v, 1);
      const 셈할줄 = 줄들.slice(0, 3);
      let 풀림 = 끝났나('u4.pred-error');
      const 창표 = h('div', {}), 점수칸 = h('div', {});
      const 점수상자 = h('input', { type: 'checkbox', checked: true });
      const 창그리기 = () => 채우기(창표, 데이터표(['선형회귀', 'error', 비만열, 수면열, '시점'],
        줄들.map((r) => [한자리(r.p), 풀림 ? 한자리(r.e) : null, 한자리(r.y), 수(r.x, 2), r.시점]),
        { 대상: [2], 메타: [4], 설명: `시험 데이터(남은 데이터) ${줄들.length}줄${풀림 ? '' : ' · error 는 (1) 을 풀면 열려요'}` }));
      const 지표 = [['MSE', '평균제곱오차'], ['RMSE', '평균제곱근오차'], ['MAE', '평균절대오차'], ['MAPE', '평균절대백분율오차'], ['sMAPE', '대칭 평균절대백분율오차'], ['R2', '결정 계수']];
      const 점수그리기 = () => 채우기(점수칸, 점수상자.checked ? h('div', { class: 'ow-table-wrap' }, h('table', { class: 'ow-table score' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Model'), 지표.map(([k]) => h('th', {}, k)))),
        h('tbody', {}, h('tr', {}, h('td', {}, '선형회귀'), 지표.map(([k]) => h('td', {}, 수(점수[k], 3))))))) : null);
      점수상자.addEventListener('change', 점수그리기);
      창그리기(); 점수그리기();
      const 예측창 = 위젯창({ 이름: 'Predictions', 제목: '예측 결과 보기 (Predictions)', 작게: true },
        h('div', { class: 'ow-line' }, '표시할 회귀 오류:',
          h('select', { class: 'ow-combo', disabled: true, 'aria-label': '표시할 회귀 오류' }, h('option', {}, '차이 (예측값 - 실제값)')),
          h('button', { type: 'button', class: 'ow-btn small', disabled: true }, '원래 순서로 복원 (Restore Original Order)')),
        창표,
        h('label', { class: 'ow-check ow-line' }, 점수상자, ' 성능 점수 표시'),
        점수칸);
      const 입력 = (이름, 값) => h('input', { type: 'text', class: 'blank', inputmode: 'decimal', size: 4, 'aria-label': 이름, value: 값 ?? '' });
      // Number('') 은 0 이라 빈칸을 먼저 거른다
      const 숫자 = (inp) => { const 글 = inp.value.trim().replace(/[−–]/g, '-'); return 글 === '' ? NaN : Number(글); };
      const 표시 = (inp, ok) => { inp.classList.toggle('ok', ok); inp.classList.toggle('bad', !ok); };

      // (1) 위에서부터 세 줄 — 독립 변수 값 · 실제 값 · 예측값 · 오차. 창에 보이는 한 자리 값으로 셈해도, 끝자리까지 셈해도 맞게 받는다
      const 줄칸들 = 셈할줄.map((r, i) => ({ x: 입력(`${i + 1}번 독립 변수 값`, 풀림 ? 수(r.x, 2) : ''), y: 입력(`${i + 1}번 실제 값`, 풀림 ? 한자리(r.y) : ''),
        p: 입력(`${i + 1}번 예측값`, 풀림 ? 한자리(r.p) : ''), e: 입력(`${i + 1}번 오차`, 풀림 ? 한자리(r.e) : '') }));
      const 셈줄 = 알림줄();
      const 확인1 = () => {
        let 맞음 = 0, 뒤집힘 = false;
        셈할줄.forEach((r, i) => {
          const c = 줄칸들[i], 보인차 = Number(한자리(r.p)) - r.y, e = 숫자(c.e);
          // 부호 1 은 바른 답, −1 은 실제값 − 예측값 으로 거꾸로 뺀 답
          const 오차맞나 = (부호) => Number.isFinite(e) && (Math.abs(e - 부호 * r.e) <= 0.06 || Math.abs(e - 부호 * 보인차) <= 0.001);
          const 판정 = [[c.x, Math.abs(숫자(c.x) - r.x) <= 0.006], [c.y, Math.abs(숫자(c.y) - r.y) <= 0.051], [c.p, Math.abs(숫자(c.p) - r.p) <= 0.06], [c.e, 오차맞나(1)]];
          판정.forEach(([inp, ok]) => { 표시(inp, ok); if (ok) 맞음++; });
          if (!오차맞나(1) && 오차맞나(-1)) 뒤집힘 = true;
        });
        if (맞음 === 셈할줄.length * 4) { 풀림 = true; 마침('u4.pred-error'); 창그리기(); 셈줄.맞음('모두 맞았어요! 창의 **error** 열이 열렸어요. 음수면 실제보다 **낮게**, 양수면 **높게** 예측한 거예요.'); }
        else if (뒤집힘) 셈줄.틀림('오차의 부호가 반대인 칸이 있어요. 오렌지의 error 는 **예측값 − 실제값** 이에요.');
        else 셈줄.틀림(`${셈할줄.length * 4}칸 중 ${맞음}칸 맞았어요. 독립 변수는 **${수면열}**, 실제 값은 **${비만열}**, 예측값은 **선형회귀** 열이에요.`);
      };
      if (풀림) 셈줄.맞음('창의 **error** 열과 같아요. 음수면 실제보다 낮게, 양수면 높게 예측한 거예요.');

      // (2) 창 아래 성능 점수 — 세 자리로 적어도, 두 자리로 줄여 적어도 받는다
      const 점수됨 = 끝났나('u4.pred-score');
      const 점수칸들 = 지표.map(([k]) => 입력(`${k} 값`, 점수됨 ? 수(점수[k], 3) : ''));
      const 점수줄 = 알림줄();
      const 확인2 = () => {
        let 맞음 = 0;
        점수칸들.forEach((inp, j) => { const ok = Math.abs(숫자(inp) - 점수[지표[j][0]]) <= 0.006; 표시(inp, ok); if (ok) 맞음++; });
        if (맞음 === 지표.length) { 점수줄.맞음(`맞았어요! 모두 학습에 쓰지 않은 **남은 데이터 ${줄들.length}줄** 로 낸 점수예요.`); 마침('u4.pred-score'); }
        else 점수줄.틀림(`${지표.length}칸 중 ${맞음}칸 맞았어요. 창 아래 **성능 점수** 줄에서 옮겨 적어요.`);
      };
      if (점수됨) 점수줄.맞음(`학습에 쓰지 않은 **남은 데이터 ${줄들.length}줄** 로 낸 점수예요.`);

      채우기(몸, h('div', { class: 'two pred-card' },
        h('div', {},
          h('p', { class: 'small' }, md('② 흐름처럼 **선형회귀** 의 모델과 **남은 데이터** 를 **예측 결과 보기** 에 이으면, 학습에 쓰지 않은 시험 데이터를 예측하고 성능을 확인할 수 있어요.')),
          예측창,
          h('p', { class: 'small muted fig-cap' }, md('왼쪽 두 열이 모델이 낸 값, 그 오른쪽이 시험 데이터예요. **error = 예측값 − 실제값**'))),
        h('div', {},
          h('p', { class: 'write-label' }, md('**(1)** 창에 나온 시험 데이터 가운데 **위에서부터 3줄** 을 옮겨 적고, **오차** 를 구해 보세요.')),
          h('table', { class: 'kv small calc pdf-table' },
            h('thead', {}, h('tr', {}, h('th', {}, '번호'), [['독립 변수 값', ''], ['실제 값', '종속 변수'], ['예측값', '선형회귀'], ['오차', '예측값 − 실제 값']].map(([a, b]) => h('th', { class: 'center' }, a, b ? [h('br'), h('small', { class: 'muted' }, b)] : null)))),
            h('tbody', {}, 줄칸들.map((c, i) => h('tr', {}, h('td', { class: 'center' }, i + 1), [c.x, c.y, c.p, c.e].map((inp) => h('td', { class: 'center' }, inp)))))),
          h('div', { class: 'row check' }, h('button', { type: 'button', class: 'btn primary', onclick: 확인1 }, '정답 확인'), 셈줄),
          h('p', { class: 'write-label' }, md('**(2)** 창 아래쪽에 나온 **평가 지표** 를 적어 보세요.')),
          h('table', { class: 'kv small calc pdf-table' },
            h('thead', {}, h('tr', {}, 지표.map(([k, 이름]) => h('th', { class: 'center' }, k === 'R2' ? 'R²' : k, h('br'), h('small', { class: 'muted' }, 이름))))),
            h('tbody', {}, h('tr', {}, 점수칸들.map((inp) => h('td', { class: 'center' }, inp))))),
          h('div', { class: 'row check' }, h('button', { type: 'button', class: 'btn primary', onclick: 확인2 }, '정답 확인'), 점수줄))));
    }, '교재 23쪽'),

    // Test and Score 로 하는 ② 기계학습 기반 회귀 분석 — 「별도 테스트 데이터로 평가」 를 고르면 되지만 선 연결을 바꿔야 한다(2026-11-08 사용자 지시).
    //   데이터 샘플링 → 모델 검증 및 평가 선을 두 번 눌러 샘플 데이터 → 데이터, 남은 데이터 → 테스트 데이터 로 잇는다. 점수는 12번 카드(예측 결과 보기)와 같다.
    //   ⚠ 「테스트 데이터 (Test Data)」 의 한국어 글자는 한국어판 화면으로 확인하지 못했다(평가 방법 이름 「별도 테스트 데이터로 평가」 에 맞춰 적었다).
    카드('Test and Score 로 ② 하기 — 선 바꿔 잇기', '오렌지', (몸) => {
      const 표 = 수면비만();
      const 점수 = 평가방법점수(표.행, 'test');
      let 이음 = 끝났나('u4.tas-link');
      const 그림자리 = h('div', {}), 결과 = h('div', {}), 줄 = 알림줄();
      const 그림그리기 = () => 채우기(그림자리, 위젯연결도([
        { id: 'ds', 위젯: 'Data Sampler', 이름줄: ['데이터 샘플링'], x: 60, y: 52 },
        { id: 'lr', 위젯: 'Linear Regression', 이름줄: ['선형회귀'], x: 60, y: 150 },
        { id: 'ts', 위젯: 'Test and Score', 이름줄: ['모델 검증 및 평가', '(Test and Score)'], x: 400, y: 100 },
      ], [
        { 부터: 'ds', 까지: 'ts', 글: 이음 ? ['샘플 데이터 → 데이터 (Data)', '남은 데이터 → 테스트 데이터 (Test Data)'] : ['샘플 데이터 → 데이터 (Data)', '남은 데이터 → ?'] },
        { 부터: 'lr', 까지: 'ts', 글: '학습 알고리즘 (Learner)' },
      ], { 너비: 470, 높이: 210, 키: 160 }));
      그림그리기();
      const 바뀜 = (m) => {
        채우기(결과);
        if (m === 'test') {
          if (!이음) { 줄.틀림('먼저 왼쪽에서 선 연결을 바꿔요. **테스트 데이터** 가 이어져 있지 않으면 오렌지도 점수를 내지 못해요.'); return; }
          채우기(결과, 점수표(점수));
          줄.맞음(`**12번 카드의 예측 결과 보기** 성능 점수와 같아요(R² ${수(점수.R2, 3)}). 같은 모델로 같은 **남은 데이터 ${훈련과시험(표.행, 고정씨앗).나눔.시험.length}개** 를 쟀으니까요.`);
          마침('u4.tas-test');
        } else if (m === 'train') 줄.틀림('학습 데이터로 직접 평가는 모델이 **배운 샘플 데이터** 로 다시 재요. 떼어 둔 남은 데이터로 재려면 **별도 테스트 데이터로 평가** 를 골라요.');
        else if (m === 'cv' || m === 'loo') 줄.틀림('교차 검증은 맨 끝 **⭐ 심화 카드** 에서 다뤄요.');
        else 줄.틀림('무작위 샘플링은 이 단원에서 다루지 않아요.');
      };
      // 선 연결 바꾸기 — 짝짓기가 끝나면(단추 누름이 이 상자까지 올라온다) 그림의 선 글을 채운다
      const 잇기 = h('div', { onclick: () => { if (!이음 && 끝났나('u4.tas-link')) { 이음 = true; 그림그리기(); } } },
        짝짓기([
          { 왼: '샘플 데이터 (Data Sample) →', 답: '데이터 (Data)' },
          { 왼: '남은 데이터 (Remaining Data) →', 답: '테스트 데이터 (Test Data)' },
        ], ['데이터 (Data)', '테스트 데이터 (Test Data)', '학습 알고리즘 (Learner)'], { 열쇠: 'u4.tas-link', 왼제목: '데이터 샘플링의 출력', 오른제목: '모델 검증 및 평가의 입력' }));
      if (끝났나('u4.tas-test')) 채우기(결과, 점수표(점수));
      if (다푼모습('u4.tas-test')) 줄.맞음(`**12번 카드의 예측 결과 보기** 성능 점수와 같아요(R² ${수(점수.R2, 3)}).`);
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'small' }, md('② 는 **모델 검증 및 평가 (Test and Score)** 로도 할 수 있어요. 창에서 **별도 테스트 데이터로 평가** 를 고르면 되지만, 그 전에 **선 연결을 바꿔야** 해요. 오렌지에서 데이터 샘플링과 모델 검증 및 평가 사이의 **선을 두 번 눌러** 연결 창을 열고 고쳐요.')),
          그림자리,
          잇기),
        h('div', {},
          평가창({ 이름: 'tas-ml', 바뀜, 간단: true, 처음: 다푼모습('u4.tas-test') ? 'test' : 'cv' }, 결과),
          줄)));
    }, '교재 23쪽'),

    // 홀드아웃 점수는 얼마나 흔들릴까 — 예전의 「표본이 바뀌면 결정계수도 바뀔까?」 와 홀드아웃 카드의 100번 나눠 보기를 합쳤다
    //   (홀드아웃 개념은 11번 카드로 옮겼다)
    카드('홀드아웃 점수는 얼마나 흔들릴까?', '활동', (몸) => {
      const 표 = 수면비만();
      const { 나눔, 점수 } = 훈련과시험(표.행, 고정씨앗);
      const 띠 = h('div', { class: 'yr-strip' }, 표.행.map((r, i) => h('span', { class: 'yr', style: { background: 나눔.시험.includes(i) ? 시험색 : 학습색 } }, String(r.시점))));
      const 그림 = h('div', { class: 'r2-dots-box' }, h('p', { class: 'muted center' }, '단추를 누르면 점이 찍혀요. 점 하나가 「한 번 나눈 것」 이에요.'));
      const 요약 = h('p', { class: 'small' });
      let 몇번 = 0;
      const 나눠보기 = () => {
        // 처음 100번은 늘 씨앗 1~100 — 맨 끝 심화 카드(교차 검증)가 이 100번과 견준다
        const 시작 = 몇번 === 0 ? 1 : 1000 + Math.floor(Math.random() * 1e6);
        const 값들 = 홀드아웃여러번(표.행, Array.from({ length: 100 }, (_, i) => 시작 + i));
        몇번++;
        const 줄 = [...값들].sort((a, b) => a - b), 가운데 = (줄[49] + 줄[50]) / 2, 음수 = 줄.filter((v) => v < 0).length;
        채우기(그림, 점분포(값들, [{ 값: 가운데, 글: `가운데 ${수(가운데, 2)}`, 색: '#555', 쪽: 'end' }, { 값: 점수.R2, 글: `12번 카드 (${수(점수.R2, 2)})`, 색: 시험색 }]));
        채우기(요약, md(`100번 나눠 본 R² — 가장 낮음 **${수(줄[0], 2)}** · 가운데 **${수(가운데, 2)}** · 가장 높음 **${수(줄[99], 2)}**. 0.5 아래로 떨어진 것이 **${줄.filter((v) => v < 0.5).length}번**이에요.`
          + (음수 ? ` 빨간 점(${음수}번)은 R² 가 0 보다 작은 것 — 시험 데이터를 평균 하나로 찍는 것보다도 못 맞혔다는 뜻이에요.` : '')));
        마침('u4.holdout');
      };
      if (다푼모습('u4.holdout')) 나눠보기();   // 캡처 모드 — 씨앗 1~100 으로 나눠 본 모습
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', {}, md('데이터 샘플링 창에서 **재현 가능한(결정론적) 샘플링** 을 끄고 다시 뽑으면 **남은 데이터 5개** 가 매번 바뀌어요. 11·12번 카드의 홀드아웃을 **100번** 해 보면 R² 는 얼마나 흔들릴까요?')),
          띠,
          h('div', { class: 'legend' }, h('span', { style: { '--c': 학습색 } }, `샘플 ${나눔.훈련.length}개`), h('span', { style: { '--c': 시험색 } }, `남은 ${나눔.시험.length}개 (11번 카드의 고정 표본)`)),
          h('button', { type: 'button', class: 'btn primary', onclick: 나눠보기 }, '🎲 100번 나눠 보기'),
          그림, 요약),
        h('div', {},
          h('div', { class: 'concept' }, md('데이터가 **17개뿐** 이라 시험 데이터는 5개예요. 어떤 5개가 뽑히느냐에 따라 R² 가 크게 달라져요.')),
          교재메모('교재는 결정계수 **0.89** 를 얻었다고 해요. 교재도 「연결선에 따라 결정계수 값이 다르게 나올 수 있다」고 적어 두었어요. 내 결과가 교재와 다르다고 틀린 것이 아니에요.'),
          퀴즈([{ 질문: '결과를 믿을 만하게 하려면?', 보기: ['R² 가 가장 높게 나온 한 번만 발표한다', '여러 번 해 보거나 데이터를 더 모은다'], 답: 1, 해설: '좋은 결과만 골라 보이는 것은 데이터를 속이는 일이에요.' }], { 열쇠: 'u4.resample-q' }),
          h('div', { class: 'concept' }, md('홀드아웃 점수 **하나만으로는** 믿기 어려워요. 시험을 한 번만 보지 말고 **돌아가며 여러 번** 보면? → 맨 끝 **⭐ 심화 카드** 의 **교차 검증**')))));
    }, '교재 23쪽'),

    // 성취기준 [12데과03-02] 의 알맹이 — 같은 데이터를 두 방법으로 분석한 결과를 견준다.
    // ⚠ 「학습 데이터로 재면 점수가 부풀려진다」 고 단정하지 않는다 — 이 연습 데이터는 고정 표본에서 ② 의 R² 가 오히려 높다.
    //    그래서 「무엇으로 쟀나가 다르다」 를 먼저 묻고, 100번 나눠 본 횟수(나쁜R2)로 「대개 그렇다」 까지만 말한다.
    카드('통계적 회귀와 기계학습 회귀 — 결과 견주기', '활동', (몸) => {
      const 표 = 수면비만();
      const n = 표.행.length;
      const { 나눔 } = 훈련과시험(표.행, 고정씨앗);
      const { 통계, 기계, 번, 나쁜R2 } = 두분석(표.행);
      const 지표칸 = (p) => [p.MSE, p.MAE, p.R2].map((v) => h('td', { class: 'num' }, 수(v, 3)));
      const 입력칸 = (갈래, k, 글) => {
        const 열쇠 = `u4.my-${갈래}-${k}`;
        const 칸 = h('input', { type: 'text', class: 'blank', inputmode: 'decimal', size: 5, value: 글읽기(열쇠), 'aria-label': `${갈래 === 'stat' ? '통계적' : '기계학습'} ${글}` });
        칸.addEventListener('input', () => 글쓰기(열쇠, 칸.value));
        return h('td', { class: 'num' }, 칸);
      };
      const 데이터글 = [md(`모델을 만든 **전체 ${n}개**\n학습 데이터로 직접 평가`), md(`학습에 안 쓴 **시험 ${나눔.시험.length}개**\n예측 결과 보기`)];
      // 한 분석에 두 줄 — 위는 앱의 연습 데이터로 셈한 값, 아래는 학생이 실제 csv 로 오렌지에서 얻은 값(활동지에 들어간다)
      const 분석줄 = (갈래, 이름, i, 점) => [
        h('tr', { class: 'first' }, h('td', { rowspan: 2 }, 이름), h('td', { rowspan: 2 }, 데이터글[i]), h('td', { class: 'who' }, '🍊 앱'), 지표칸(점)),
        h('tr', {}, h('td', { class: 'who' }, '✍️ 내 오렌지'), 내지표.map(([k, 글]) => 입력칸(갈래, k, 글)))];
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'small' }, md('같은 데이터를 **두 가지로** 분석했어요. **무엇으로 잰 점수인지** 부터 보세요. **내 오렌지** 줄에는 실제 csv 로 얻은 값을 적어요.')),
          h('table', { class: 'kv small cmp' },
            h('thead', {}, h('tr', {}, h('th', {}, '모델'), h('th', {}, '점수를 낸 데이터'), h('th', {}, ''), 내지표.map(([, 글]) => h('th', { class: 'num' }, 글)))),
            h('tbody', {}, 분석줄('stat', '① 통계적 회귀 분석', 0, 통계), 분석줄('ml', '② 기계학습 기반 회귀 분석', 1, 기계))),
          h('div', { class: 'tip' }, md('💡 **MSE·MAE** 는 작을수록, **R²** 는 1 에 가까울수록 좋아요. ① 은 **학습 데이터로 직접 평가**, ② 는 **예측 결과 보기** 의 성능 점수예요.')),
          쓰기('u4.compare-why', { 안내: '**내 오렌지 결과** 에서 두 분석의 성능은 어떻게 달랐나요? 왜 그런 차이가 났을지 적어 보세요.', 줄수: 3,
            예시: '예) ② 의 MSE 가 ① 보다 컸다. ① 은 …로 평가했고 ② 는 …로 평가했기 때문이다.' })),
        h('div', {},
          퀴즈([
            { 질문: '두 분석의 점수가 다른 가장 큰 까닭은?', 보기: ['점수를 낸 데이터가 다르다 — ① 은 모델이 **이미 본** 데이터, ② 는 **처음 보는** 데이터', '두 분석이 서로 다른 데이터 파일을 썼다', '② 는 선형 회귀가 아닌 다른 모델을 썼다'], 답: 0,
              해설: `둘 다 같은 파일, 같은 선형 회귀예요. ① 은 ${n}개로 배우고 그 ${n}개로 다시 쟀어요(배운 문제로 시험 본 셈). ② 는 ${나눔.훈련.length}개로 배우고 처음 보는 ${나눔.시험.length}개로 쟀어요.` },
            { 질문: `이 연습 데이터에서는 ② 의 R² (${수(기계.R2, 2)}) 가 ① (${수(통계.R2, 2)}) 보다 높게 나왔어요. 그러면?`,
              보기: [`시험 ${나눔.시험.length}개가 운 좋게 뽑혔을 수 있다 — ${번}번 나눠 보면 ${나쁜R2}번은 ② 가 ① 보다 낮았다`, '기계학습 모델이 언제나 더 정확하다', '① 의 계산이 틀렸다'], 답: 0,
              해설: `처음 보는 데이터 앞에서는 대개 점수가 조금 떨어져요(이 데이터는 ${번}번 가운데 ${나쁜R2}번). 다만 시험 데이터가 ${나눔.시험.length}개뿐이라 어떤 해가 뽑히느냐에 따라 오르기도 해요. **① 은 배운 데이터를 얼마나 잘 설명하는지, ② 는 처음 보는 데이터를 얼마나 잘 맞히는지** 를 재요.` },
          ], { 열쇠: 'u4.compare-q' }))));
    }, '교재 23~24쪽'),

    카드('예측해 보기와 주의할 점', '활동', (몸) => {
      const 표 = 수면비만();
      const { 모델 } = 훈련과시험(표.행, 고정씨앗);
      const xs = 표.행.map((r) => r[수면열]);
      const 최소 = Math.min(...xs), 최대 = Math.max(...xs);
      const 결과 = h('div', { class: 'center' });
      const 그리기 = (v) => {
        const p = 모델.절편 + 모델.기울기 * v;
        const 밖 = v < 최소 || v > 최대;
        채우기(결과, h('div', { class: 'big-num' }, `${수(p, 1)} %`), h('div', {}, `수면 ${수(v, 1)}시간일 때 예상 비만율`),
          밖 ? h('div', { class: 'warn' }, md(`⚠️ 데이터는 **${수(최소, 2)}~${수(최대, 2)}시간** 사이에만 있어요. 그 밖은 직선을 억지로 늘린 값이라 믿을 수 없어요.${p < 0 ? ' 비만율이 음수가 나왔지요?' : ''}`)) : null);
        if (밖 && p < 0) 마침('u4.extrapolate');
      };
      const 처음값 = 다푼모습('u4.extrapolate') ? 9 : 6.2;   // 캡처 모드 — 범위 밖(음수)을 예측해 본 모습
      그리기(처음값);
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', {}, md(`모델로 결과를 예측할 때는 오렌지의 ${'**Predictions**'} 위젯을 써요. 회귀식 **비만율 = ${수(모델.기울기, 2)} × 수면 시간 + ${수(모델.절편, 2)}** 에 값을 넣는 것과 같아요.`)),
          슬라이더('평균 수면 시간', { 최소: 4, 최대: 9, 단계: 0.1, 값: 처음값, 글자: (v) => `${수(v, 1)}시간`, 바뀜: 그리기 }).줄,
          결과,
          h('p', { class: 'small muted' }, '🎯 슬라이더를 9시간까지 밀어 보세요.')),
        h('div', {},
          h('p', {}, '오렌지 흐름에 Predictions 를 붙이면 이렇게 이어요.'),
          h('div', { class: 'row' }, 위젯글('Data Sampler'), '→', 위젯글('Linear Regression'), '→', 위젯글('Predictions')),
          h('p', { class: 'small muted' }, md('Predictions 에는 모델(Linear Regression)과 **예측할 데이터**(Data Sampler 의 Remaining Data)를 함께 이어요.')),
          h('div', { class: 'tip' }, md('💡 회귀 모델은 **배운 범위 안** 에서만 믿을 수 있어요. 범위 밖을 예측하는 것을 **외삽** 이라고 하는데 조심해야 해요.')))));
    }, '교재 23쪽'),

    // 2026-11-09 사용자 지적 — 새로 불러온 파일은 학습에 쓴 값이 섞였는지 아무도 보장하지 않는다. 시험 데이터만 「본 적 없음」 이 보장된다.
    //   그래서 열 이름을 「새로운 데이터」 로 바꾸고, 첫 물음에 「있을 수도·없을 수도」 를 더해 새 데이터 쪽 정답으로 삼았다.
    카드('새로운 데이터 — 시험 데이터와 무엇이 다를까', '개념', (몸) => {
      // 0 = 예, 1 = 아니요, 2 = 있을 수도·없을 수도 — [시험 데이터, 새로운 데이터]. 보기: 그 줄에서 고를 수 있는 것
      const 물음들 = [
        { 글: '모델이 **학습할 때 본 적** 이 있나요?', 답: [1, 2], 보기: ['예', '아니요', '있을 수도·없을 수도'] },
        { 글: '**정답(비만율)** 이 들어 있나요?', 답: [0, 1], 보기: ['예', '아니요'] },
        { 글: '예측 결과 보기에 **error 와 성능 점수** 가 나오나요?', 답: [0, 1], 보기: ['예', '아니요'] },
      ];
      const 다함 = 끝났나('u4.unseen-cmp');
      const 고른 = 물음들.map((q) => (다함 ? [...q.답] : [null, null]));
      const 줄 = 알림줄();
      const 묶음들 = 물음들.map((_, i) => [0, 1].map((j) => {
        const 묶음 = h('div', { class: 'seg yn', role: 'group' });
        const 그리기 = () => 채우기(묶음, 물음들[i].보기.map((글, k) => h('button', { type: 'button', class: 고른[i][j] === k ? 'on' : '', 'aria-pressed': String(고른[i][j] === k),
          onclick: () => { 고른[i][j] = k; 묶음.classList.remove('ok', 'bad'); 그리기(); } }, 글)));
        그리기();
        return 묶음;
      }));
      const 확인 = () => {
        let 맞음 = 0;
        물음들.forEach((q, i) => [0, 1].forEach((j) => {
          const ok = 고른[i][j] === q.답[j];
          묶음들[i][j].classList.toggle('ok', ok); 묶음들[i][j].classList.toggle('bad', !ok);
          if (ok) 맞음++;
        }));
        if (맞음 === 6) { 줄.맞음('모두 맞았어요! 시험 데이터는 모델이 **본 적 없다고 보장** 되고 정답이 있어 **평가** 에 써요. 새로 불러온 파일은 그런 보장이 없고 정답도 없어 **예측** 만 해요.'); 마침('u4.unseen-cmp'); }
        else if (고른[0][1] !== 물음들[0].답[1]) 줄.틀림(`6칸 중 ${맞음}칸 맞았어요. 새로 불러온 파일에 무엇이 들어 있을지는 **아무도 보장하지 않아요** — 학습에 쓴 해의 값이 섞여 있어도 모델은 가리지 못해요.`);
        else 줄.틀림(`6칸 중 ${맞음}칸 맞았어요. 시험 데이터는 원래 있던 데이터에서 **떼어 둔** 것이라는 점을 떠올려 보세요.`);
      };
      if (다함) 줄.맞음('시험 데이터는 본 적 없음이 보장돼 **평가** 에, 새로운 데이터는 **예측** 에 써요.');
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('div', { class: 'concept' }, md('**새로운 데이터** — 모델을 다 만든 **뒤에** 예측하려고 새로 불러오는 데이터예요. 정답을 모르니 모델이 낸 예측값이 곧 우리가 얻는 답이에요. 모델을 실제로 **쓰는** 순간이 바로 이때예요.')),
          h('table', { class: 'kv small cmp-grid' },
            h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, '시험 데이터', h('br'), h('small', { class: 'muted' }, '남은 데이터 (Remaining Data)')), h('th', {}, '새로운 데이터', h('br'), h('small', { class: 'muted' }, '새로 불러온 파일')))),
            h('tbody', {}, 물음들.map((q, i) => h('tr', {}, h('td', {}, md(q.글)), h('td', {}, 묶음들[i][0]), h('td', {}, 묶음들[i][1]))))),
          h('div', { class: 'row check' }, h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '정답 확인'), 줄)),
        h('div', {},
          위젯연결도([
            { id: 'lr', 위젯: 'Linear Regression', 이름줄: ['선형회귀'], x: 70, y: 40 },
            { id: 'f3', 위젯: 'File', 이름줄: ['파일 불러오기 (File)'], x: 70, y: 138 },
            { id: 'pr1', 위젯: 'Predictions', 이름줄: ['예측 결과 보기', '(Predictions) (1)'], x: 262, y: 89 },
          ], [
            { 부터: 'lr', 까지: 'pr1', 글: '모델 (Model) → Predictors' },
            { 부터: 'f3', 까지: 'pr1', 글: '데이터 (Data)' },
          ], { 너비: 336, 높이: 192, 키: 138 }),
          퀴즈([
            { 질문: '새 데이터 파일을 **선형회귀** 에는 잇지 않아요. 왜일까요?',
              보기: ['이으면 그 데이터로 **다시 학습** 하려 한다 — 새 데이터엔 정답이 없고, 만든 모델로 **예측만** 하면 된다', '선형회귀에는 파일을 하나만 이을 수 있어서', '예측 결과 보기가 학습까지 해 주니까'], 답: 0,
              해설: '학습은 정답이 있는 데이터로 이미 끝났어요. 새 데이터는 **넣기만** 해요.' },
          ], { 열쇠: 'u4.unseen-q' }))));
    }, '교재 23쪽'),

    카드('새로운 데이터의 비만율 예측하기', '오렌지', (몸) => {
      const 표 = 수면비만();
      const { 모델 } = 훈련과시험(표.행, 고정씨앗);
      const xs = 표.행.map((r) => r[수면열]);
      const 최소 = Math.min(...xs), 최대 = Math.max(...xs);
      const 줄들 = 새데이터.값.map((x) => { const p = 모델.절편 + 모델.기울기 * x; return { x, p, 답: 믿음판정(x, p, 최소, 최대) }; });
      const 판단 = [['🟢', '믿을 만함'], ['🟡', '조심'], ['🔴', '믿기 어려움']];
      const 다함 = 끝났나('u4.unseen-judge');
      const 고른 = 줄들.map((r) => (다함 ? r.답 : null));
      const 줄 = 알림줄();
      const 칸들 = 줄들.map((_, i) => {
        const 칸 = h('div', { class: 'judge-chips' });
        const 그리기 = () => 채우기(칸, 판단.map(([그림, 글], k) => h('button', { type: 'button', class: `chip small${고른[i] === k ? ' picked' : ''}`, title: 글, 'aria-pressed': String(고른[i] === k),
          onclick: () => { 고른[i] = k; 칸.classList.remove('ok', 'bad'); 그리기(); } }, `${그림} ${글}`)));
        그리기();
        return 칸;
      });
      const 확인 = () => {
        let 맞음 = 0, 범위안틀림 = false, 음수놓침 = false;
        줄들.forEach((r, i) => {
          const ok = 고른[i] === r.답;
          칸들[i].classList.toggle('ok', ok); 칸들[i].classList.toggle('bad', !ok);
          if (ok) 맞음++;
          else if (r.답 === 0) 범위안틀림 = true;
          else if (r.답 === 2) 음수놓침 = true;
        });
        if (맞음 === 줄들.length) { 줄.맞음('모두 맞았어요! 배운 범위 밖을 예측하는 것을 **외삽** 이라고 해요. 모델은 직선을 그대로 늘려 셈할 뿐이라, 멀리 갈수록 엉뚱한 값이 나와요.'); 마침('u4.unseen-judge'); }
        else 줄.틀림(`${줄들.length}줄 중 ${맞음}줄 맞았어요. ${범위안틀림 ? `배운 범위(${수(최소, 2)}~${수(최대, 2)}시간) **안** 이면 믿을 만해요. ` : ''}${음수놓침 ? '비만율이 **음수** 일 수 있을까요?' : ''}`);
      };
      if (다함) 줄.맞음('배운 범위 밖을 예측하는 것을 **외삽** 이라고 해요.');
      const 예측창 = 위젯창({ 이름: 'Predictions', 제목: '예측 결과 보기 (Predictions) (1)', 작게: true },
        h('div', { class: 'ow-line' }, h('button', { type: 'button', class: 'ow-btn small', disabled: true }, '원래 순서로 복원 (Restore Original Order)')),
        데이터표(['선형회귀', 수면열], 줄들.map((r) => [수(r.p, 1), 수(r.x, 2)]), { 최대행: 6, 설명: '정답(비만율)이 없어 error 열과 성능 점수가 나오지 않아요' }));
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'small' }, md('**새로운 데이터** 를 내려받아 오렌지의 **파일 불러오기 (File)** 로 열고, **예측 결과 보기 (Predictions) (1)** 에 이어 보세요.')),
          // 5번 카드처럼 csv-btns 로 감싼다 — 감싸지 않으면 활동 정리 PDF 캡처(html2canvas)에서 단추 글이 빠진다
          h('div', { class: 'csv-btns' }, h('button', { type: 'button', class: 'btn csv-btn', onclick: () => csv내려받기(새데이터) },
            h('span', {}, `⬇ ${새데이터.이름}`), h('small', { class: 'muted' }, `수면 시간 ${새데이터.값.length}줄 · 속성 「${새데이터.열}」`))),
          예측창,
          h('p', { class: 'small muted' }, md('💡 속성 이름이 학습한 데이터와 **글자까지 같아야** 오렌지가 예측해요. 내려받은 파일은 실제 수면 csv 와 같은 이름을 써요. 앱의 예측값은 연습 데이터 모델로 셈한 것이라 오렌지 값과 달라요.'))),
        h('div', {},
          h('div', { class: 'judge-key small' }, md(`**🟢 믿을 만함** 모델이 배운 범위(${수(최소, 2)}~${수(최대, 2)}시간) 안 · **🟡 조심** 범위 밖이지만 있을 법한 값 · **🔴 믿기 어려움** 범위 밖이고 비만율로 나올 수 없는 값(음수 등)`)),
          h('table', { class: 'kv small judge' },
            h('thead', {}, h('tr', {}, h('th', { class: 'num' }, '수면 시간'), h('th', { class: 'num' }, '예측 비만율'), h('th', {}, '판단'))),
            h('tbody', {}, 줄들.map((r, i) => h('tr', {}, h('td', { class: 'num' }, `${수(r.x, 1)}시간`), h('td', { class: 'num' }, `${수(r.p, 1)} %`), h('td', {}, 칸들[i]))))),
          h('div', { class: 'row check' }, h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '정답 확인'), 줄),
          쓰기('u4.unseen-why', { 안내: '**내 오렌지 결과** 에서 믿을 만한 예측과 믿기 어려운 예측을 골라 그 까닭을 적어 보세요.', 줄수: 2,
            예시: '예) ○시간의 예측은 …라서 믿을 만하고, ○시간의 예측은 …라서 믿기 어렵다.' }))));
    }, '교재 23쪽'),

    카드('단계 6 · 결과를 무조건 믿어도 될까?', '활동', (몸) => {
      // 1~19번 활동을 모두 맞혔으면 활동 정리 PDF 를 받는다 — 단추 글에 지금 몇 개 끝냈는지 보이고, 이 카드 퀴즈를 맞히면 바로 바뀐다
      const PDF단추 = h('button', { type: 'button', class: 'btn', onclick: (e) => PDF받기(e.currentTarget) });
      const 단추갱신 = () => {
        const 다함 = PDF활동.filter((a) => 끝났나(a.열쇠)).length;
        PDF단추.classList.toggle('primary', 다함 === PDF활동.length);
        if (!PDF단추.disabled) PDF단추.textContent = `📄 1~19번 활동 정리 PDF 내려받기 (${다함}/${PDF활동.length})`;
      };
      단추갱신();
      채우기(몸, h('div', { class: 'two', onclick: () => setTimeout(단추갱신) },
        h('div', {},
          말풍선('🧑‍🎓', '채원', '결정계수가 높게 나왔으니, **나도** 일찍 자기만 하면 살이 빠지는 거지?'),
          h('div', { class: 'concept' }, md('이 데이터는 **해마다의 평균값(집단)** 이에요. 한 해의 평균 수면 시간과 그해의 비만율이 함께 움직였다는 뜻이지, **한 사람이 잠을 더 자면 살이 빠진다** 는 증거는 아니에요.'))),
        퀴즈([
          { 질문: '이 분석으로 말할 수 **있는** 것은?', 보기: ['연도별 평균 수면 시간과 비만율 사이에 강한 음의 상관관계가 있다', '잠을 1시간 더 자면 누구나 살이 빠진다', '수면 부족이 비만의 유일한 원인이다'], 답: 0, 해설: '집단 단위 데이터로는 상관관계까지만 말할 수 있어요.' },
          { 질문: '두 속성이 모두 「해가 갈수록」 바뀌었다면 생각해 볼 점은?', 보기: ['해가 갈수록 함께 바뀐 다른 원인(스마트폰 사용, 식습관 등)이 있을 수 있다', '아무것도 없다'], 답: 0, 해설: '숨은 원인(교란 변수)이 둘을 함께 움직였을 수 있어요. 그래서 다른 속성도 함께 봐야 해요(→ 5단원).' },
          { 질문: '결과를 더 믿을 만하게 하는 방법이 **아닌** 것은?', 보기: ['전문가 의견·논문을 찾아 견준다', '개인 단위 데이터로 다시 분석한다', '결정계수가 높으니 그대로 발표한다'], 답: 2, 해설: '도메인 지식으로 타당성을 보완하고, 다른 요인도 살펴야 해요.' },
        ], { 열쇠: 'u4.interpret' })),
        h('div', { class: 'row end pdf-row' }, PDF단추));
    }, '교재 24~25쪽'),

    카드('전문가 의견 찾아 보완하기', '활동', (몸) => {
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', {}, md('인터넷에서 **수면과 비만** 에 관한 전문가 의견(공공기관·병원·논문)을 찾아 적어 보세요.')),
          쓰기('u4.expert-title', { 안내: '📰 제목과 출처', 줄수: 2, 예시: '예) ○○병원 건강칼럼 「잠이 부족하면 왜 살이 찔까」 (주소)' }),
          쓰기('u4.expert-body', { 안내: '📝 내용 요약', 줄수: 3, 예시: '예) 잠이 부족하면 식욕을 높이는 호르몬이 늘어난다…' })),
        h('div', {},
          쓰기('u4.more-attr', { 안내: '➕ 수면 시간 말고 **비만에 영향을 줄 속성** 을 하나 더 넣는다면?', 줄수: 2, 예시: '예) 아침 식사 결식률, 패스트푸드 섭취율, 운동 시간' }),
          자기평가('u4.self', 평가문장))),
        h('div', { class: 'row end' }, h('button', { type: 'button', class: 'btn', onclick: 활동지4 }, '💾 활동지 내려받기 (HTML)')));
    }, '교재 25쪽'),


    // ⭐ 심화 — 교차 검증(2026-11-08 사용자 정정 지시: 모델 검증 및 평가에서 교차 검증을 하는 방법을 맨 끝 카드에서 개념과 함께).
    //   10번 카드와 같은 연결(열 선택 → 데이터, 선형회귀 → 학습 알고리즘)에서 평가 방법만 교차 검증으로 바꾼다 — 데이터 전체 17개를 돌아가며.
    //   견주기 표에는 10번(학습 데이터로 직접 평가)·13번(별도 테스트 데이터로 평가) 카드의 점수를 함께 둔다.
    카드('심화 · 교차 검증 — 돌아가며 시험 보기', '심화', (몸) => {
      const 표 = 수면비만(), n = 표.행.length;
      const 해 = 표.행.map((r) => `'${String(r.시점).slice(-2)}`);
      const 시험해 = 훈련과시험(표.행, 고정씨앗).나눔.시험;
      const 홀드 = 홀드아웃여러번(표.행, Array.from({ length: 100 }, (_, i) => i + 1)).sort((a, b) => a - b);
      let 방법 = 'cv', k = 5, 씨앗 = 1, 끝낸 = 0;
      let cv = 교차검증(표.행, k, 씨앗);
      const 섞은 = [];   // 지금 폴드 수로 끝까지 돌려 본 R² — 다시 섞을 때마다 하나씩 는다
      let 기록됨 = false;
      const 격자 = h('div', {}), 단추줄 = h('div', { class: 'row' }), 알림 = h('p', { class: 'small cv-note' }), 견주기 = h('div', {}), 경고 = h('div', {});
      const 고정점수 = { train: 평가방법점수(표.행, 'train'), test: 평가방법점수(표.행, 'test'), loo: 평가방법점수(표.행, 'loo') };
      function 그리기() {
        const 줄들 = 방법 === 'cv' || 방법 === 'loo'
          ? cv.판들.map((판, f) => ({ 이름: `${f + 1}판`, 칸: (i) => (판.시험.includes(i) ? '시' : '학'), 흐림: f >= 끝낸 }))
          : 방법 === 'train' ? [{ 이름: '학습', 칸: () => '학' }, { 이름: '시험', 칸: () => '시' }]
            : [{ 이름: '학습', 칸: (i) => (시험해.includes(i) ? '-' : '학') }, { 이름: '시험', 칸: (i) => (시험해.includes(i) ? '시' : '-') }];
        채우기(격자, 평가격자(줄들, 해, [], { 앞이름: `데이터 ${n}개 (한 칸 = 한 해)` }));
        채우기(단추줄, 방법 === 'cv' ? [
          h('button', { type: 'button', class: 'btn primary small', onclick: () => { if (끝낸 < k) { 끝낸++; 다했나(); } 그리기(); } }, '▶ 한 판씩'),
          h('button', { type: 'button', class: 'btn small', onclick: () => { 끝낸 = k; 다했나(); 그리기(); } }, '⏩ 끝까지'),
          h('button', { type: 'button', class: 'btn small', onclick: () => { 씨앗 = 2 + Math.floor(Math.random() * 1e6); cv = 교차검증(표.행, k, 씨앗); 끝낸 = 0; 기록됨 = false; 그리기(); } }, '🔀 다시 섞기')] : null);
        채우기(알림, md({
          cv: 끝낸 === 0 ? `**▶ 한 판씩** 을 눌러 보세요. 한 줄이 한 판이고, **주황 칸** 이 그 판의 시험 데이터예요.`
            : 끝낸 < k ? `**${끝낸}판** — 시험: ${cv.판들[끝낸 - 1].시험.map((i) => 해[i]).join(' · ')} (${cv.판들[끝낸 - 1].시험.length}개) · 학습: 나머지 ${cv.판들[끝낸 - 1].학습.length}개`
              : `**${k}판 모두 끝!** 모델을 ${k}번 만들었고, ${n}개가 **꼭 한 번씩** 시험을 봤어요. 판마다의 예측을 모아 한 번에 점수를 내요. **🔀 다시 섞기** 를 해 보면 홀드아웃보다 **훨씬 덜 흔들려요**.`,
          loo: `폴드 수를 데이터 수(${n})만큼 — **하나씩 빼고 ${n}번** 해요. 나누는 데 운이 끼어들 자리가 없어 몇 번을 해도 같은 값이에요.`,
          train: `**10번 카드** — 전체 ${n}개로 배우고 **같은 ${n}개** 로 시험해요. 처음 보는 데이터에서의 실력은 알 수 없어요.`,
          test: `**13번 카드** — 샘플 12개로 배우고 **남은 5개** 로 시험해요. 이렇게 하려면 선 연결을 바꿔야 해요. 5개뿐이라 운이 섞여요.`,
        }[방법]));
        const 줄 = (m, 이름, 쓴, 값) => h('tr', { class: m === 방법 ? 'hl' : '' }, h('td', {}, 이름), h('td', { class: 'small' }, 쓴), h('td', { class: 'num' }, 값));
        채우기(견주기, h('table', { class: 'kv small cv-cmp' },
          h('thead', {}, h('tr', {}, h('th', {}, '평가 방법'), h('th', {}, '시험에 쓴 데이터'), h('th', { class: 'num' }, 'R²'))),
          h('tbody', {},
            줄('train', '학습 데이터로 직접 평가 (10번)', `배운 ${n}개 그대로`, 수(고정점수.train.R2, 2)),
            줄('cv', `교차 검증 ${k}겹`, `${n}개를 돌아가며${섞은.length > 1 ? ` · 섞어서 ${섞은.length}번` : ''}`,
              방법 === 'cv' && 끝낸 < k && !섞은.length ? '끝까지 돌려 보세요' : 섞은.length > 1 ? `${수(Math.min(...섞은), 2)} ~ ${수(Math.max(...섞은), 2)}` : 수((섞은[0] ?? cv.점수.R2), 2)),
            줄('loo', 'LOOCV (하나 빼고 검증)', `하나씩 ${n}번`, 수(고정점수.loo.R2, 2)),
            줄('test', '별도 테스트 데이터로 평가 (13번)', '떼어 둔 5개', 수(고정점수.test.R2, 2)),
            줄('hold', '홀드아웃 100번 (14번)', '떼어 둔 5개 · 100번', `${수(홀드[0], 2)} ~ ${수(홀드[99], 2)}`))));
      }
      function 다했나() {
        if (끝낸 === k && !기록됨) { 섞은.push(cv.점수.R2); 기록됨 = true; 마침('u4.cv'); }
      }
      const 고르기 = (m) => {
        방법 = m; 채우기(경고);
        if (m === 'loo') { cv = 교차검증(표.행, n); 끝낸 = n; }
        else if (m === 'cv') { cv = 교차검증(표.행, k, 씨앗); 끝낸 = 0; 기록됨 = false; }
        그리기();
      };
      const 폴드 = h('select', { class: 'ow-combo', 'aria-label': '폴드 수' }, [2, 3, 5, 10, 20].map((v) => h('option', { value: v, selected: v === 5 }, String(v))));
      폴드.addEventListener('change', () => {
        const v = Number(폴드.value);
        // 데이터보다 많은 묶음으로는 나눌 수 없다 — 받지 않고 지금 폴드 수로 되돌린다
        if (v > n) { 채우기(경고, h('p', { class: 'feedback bad' }, `데이터가 ${n}개뿐이라 ${v}묶음으로는 나눌 수 없어요. 오렌지도 이때는 오류를 알려요.`)); 폴드.value = String(k); return; }
        k = v; 섞은.length = 0;
        const 교차단추 = 몸.querySelector('input[name="tas-cv"]');
        if (교차단추) 교차단추.checked = true;
        고르기('cv');
      });
      그리기();
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('div', { class: 'concept' }, md('**교차 검증(k-겹, k-fold cross validation)** — 데이터를 **k 묶음(폴드)** 으로 나누고, 한 묶음씩 **돌아가며** 시험으로 써요. 나머지로 학습하니 모델을 k 번 만들고, **모든 데이터가 꼭 한 번씩** 처음 보는 데이터로 시험을 봐요. 데이터가 적어 떼어 두기 아까울 때 특히 좋아요.')),
          h('p', { class: 'small' }, md('**오렌지에서는** 10번 카드의 연결(열 선택 → **데이터**, 선형회귀 → **학습 알고리즘**)을 그대로 두고, 모델 검증 및 평가 창에서 **교차 검증** 을 고르고 **폴드 수** 를 정해요.')),
          격자, 단추줄, 알림),
        h('div', {},
          평가창({ 이름: 'tas-cv', 바뀜: 고르기, 폴드칸: 폴드, 켬: ['cv', 'loo', 'train', 'test'], 간단: true }),
          경고, 견주기)));
    }, '교재 23쪽'),
  ],
};
export default u4단원;
