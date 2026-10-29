/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  4단원 — 프로젝트 1-1 「회귀 분석으로 수면 시간에 따른 비만율을 확인해 보자」
 *  성취기준 [12데과03-02] · 학습 요소: 선형 회귀 · 교과서 108~131쪽
 *  데이터는 연습용으로 새로 만든 값이다(src/data/health.js).
 */
import { h, s, 채우기, md, 수, 창 } from '../lib/ui.js';
import { 퀴즈, 순서, 쓰기, 자기평가, 알림줄 } from '../lib/games.js';
import { 끝냄, 끝났나, 글읽기, 글쓰기 } from '../lib/store.js';
import { 상관, 상관정도, 단순회귀, 성능, 나누기, 난수 } from '../lib/stats.js';
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
export function 훈련과시험(행, 씨앗) {
  const x = 행.map((r) => r[수면열]), y = 행.map((r) => r[비만열]);
  const 나눔 = 나누기(행.length, 0.7, 씨앗);
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

// 교차 검증 격자 — 한 줄이 한 판, 한 칸이 한 해. 주황이 그 판의 시험 데이터. 아직 안 한 판은 흐리게 그린다
function 교차격자(cv, 끝낸, 해들) {
  const k = cv.판들.length, n = 해들.length;
  const 왼 = 46, 칸w = (560 - 왼 - 2) / n, 칸h = Math.min(24, 210 / k), 위 = 18;
  const 글크기 = Math.min(12, 칸h - 1);
  return s('svg', { viewBox: `0 0 560 ${위 + k * 칸h + 2}`, class: 'cv-grid', role: 'img', 'aria-label': `${k}겹 교차 검증 — ${끝낸}판까지 함` },
    해들.map((t, i) => s('text', { x: 왼 + (i + 0.5) * 칸w, y: 12, 'text-anchor': 'middle', class: 'cv-year' }, t)),
    cv.판들.map((판, f) => {
      const y = 위 + f * 칸h, 됨 = f < 끝낸;
      return s('g', { opacity: 됨 ? 1 : 0.2 },
        s('text', { x: 왼 - 6, y: y + 칸h / 2 + 글크기 * 0.35, 'text-anchor': 'end', class: 'cv-round', 'font-size': 글크기 }, `${f + 1}판`),
        해들.map((_, i) => s('rect', { x: 왼 + i * 칸w + 1, y: y + 1, width: 칸w - 2, height: 칸h - 2, rx: 3, fill: 판.시험.includes(i) ? 시험색 : 학습색,
          stroke: f === 끝낸 - 1 ? '#222' : 'none', 'stroke-width': 1.5 })));
    }));
}

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
      { 제목: '3. 전문가 의견 — 제목과 출처', 물음: '인터넷에서 찾은 수면과 비만에 관한 전문가 의견(공공기관·병원·논문)의 제목과 출처', 답: 글읽기('u4.expert-title') },
      { 제목: '4. 전문가 의견 — 내용 요약', 답: 글읽기('u4.expert-body') },
      { 제목: '5. 더 넣고 싶은 속성', 물음: '수면 시간 말고 비만에 영향을 줄 속성을 하나 더 넣는다면?', 답: 글읽기('u4.more-attr') },
      { 제목: '6. 자기평가', 물음: 평가문장, 답: 글읽기('u4.self'), 빈글: '(아직 고르지 않음)' },
    ],
  });
}

export default {
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
      채우기(몸,
        h('p', { class: 'small' }, md('이번 프로젝트의 **전체 위젯 흐름** 이에요. 할 일을 읽고 알맞은 위젯을 왼쪽에서 차례로 눌러 이어 보세요.')),
        흐름조립([
          { id: 'f1', 위젯: 'File', 부제: '수면', 부모: [], 할일: '**수면 시간** csv 파일을 불러와요.', x: 70, y: 80 },
          { id: 'f2', 위젯: 'File', 부제: '비만', 부모: [], 할일: '**비만율** csv 파일도 불러와요.', x: 70, y: 245 },
          { id: 'mg', 위젯: 'Merge Data', 부모: ['f1', 'f2'], 할일: '두 파일을 **시점으로 맞춰 합쳐요**.', x: 230, y: 162, 신호: { f1: 'Data', f2: 'Extra Data' } },
          { id: 'dt', 위젯: 'Data Table', 부모: ['mg'], 할일: '합친 결과를 **표로 확인** 해요.', x: 380, y: 60 },
          { id: 'sc', 위젯: 'Select Columns', 부모: ['mg'], 할일: '분석에 쓸 **속성만 골라요**.', x: 390, y: 230 },
          { id: 'sp', 위젯: 'Scatter Plot', 부모: ['sc'], 할일: '두 속성의 관계를 **산점도** 로 봐요.', x: 560, y: 110 },
          { id: 'ds', 위젯: 'Data Sampler', 부모: ['sc'], 할일: '데이터를 **훈련 7 : 시험 3** 으로 나눠요.', x: 560, y: 262 },
          { id: 'lr', 위젯: 'Linear Regression', 부모: ['ds'], 할일: '훈련 데이터로 **선형 회귀 모델** 을 만들어요.', x: 715, y: 185, 신호: { ds: 'Data Sample' } },
          { id: 'ts', 위젯: 'Test and Score', 부모: ['lr', 'ds'], 할일: '시험 데이터로 모델의 **성능(결정계수)을 확인** 해요.', x: 840, y: 262 },
        ], { 열쇠: 'u4.flow', 팔레트: ['File', 'Data Table', 'Merge Data', 'Select Columns', 'Select Rows', 'Scatter Plot', 'Distributions', 'Data Sampler', 'Linear Regression', 'k-Means', 'Test and Score', 'Predictions'], 높이: 320, 너비: 920 }));
    }, '교재 21~24쪽'),

    카드('Merge Data — 두 파일 합치기', '오렌지', (몸) => {
      let 방식 = 0;
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
        if (글.includes('시점')) 답줄.맞음('맞아요! 두 파일 모두 첫 열이 **시점(연도)** 이라, 같은 해끼리 짝지어 한 줄로 합칠 수 있어요.');
        else if (/연도|년도/.test(글)) 답줄.맞음('맞아요, 연도예요! 다만 두 파일 속 속성 이름은 **「시점」** 이에요. 오렌지에서는 그 이름을 골라요.');
        else { 답줄.틀림('두 파일에 **똑같이 들어 있는** 속성을 찾아보세요. 수면 시간 파일과 비만율 파일의 **첫 열** 을 견주어 보면 보여요.'); return; }
        기준 = true; 마침('u4.merge-key'); 그리기();
      };
      기준칸.addEventListener('keydown', (e) => { if (e.key === 'Enter') 확인(); });
      그리기();
      if (기준) 답줄.맞음('기준 속성: **시점** — 같은 해끼리 짝지어 합쳐요.');
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          위젯연결도([
            { id: 'f1', 위젯: 'File', 이름줄: ['파일 불러오기 (File)'], x: 85, y: 40 },
            { id: 'f2', 위젯: 'File', 이름줄: ['파일 불러오기 (File) (1)'], x: 85, y: 138 },
            { id: 'mg', 위젯: 'Merge Data', 이름줄: ['데이터 병합(열/조인)', '(Merge Data)'], x: 258, y: 89 },
          ], [
            { 부터: 'f1', 까지: 'mg', 글: '데이터 (Data)' },
            { 부터: 'f2', 까지: 'mg', 글: '데이터 (Data) → Extra Data' },
          ], { 너비: 336, 높이: 192, 키: 192 }),
          h('p', { class: 'small muted fig-cap' }, '파일 불러오기 (File) 위젯 두 개를 데이터 병합(열/조인) (Merge Data) 위젯에 연결하기'),
          h('label', { class: 'write-wrap' }, h('span', { class: 'write-label' }, md('**(1)** 비만율 데이터와 수면시간 데이터는 **어떤 속성** 을 기준으로 하나로 통합할 수 있을까요?')),
            h('div', { class: 'row' }, 기준칸, h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '확인'))),
          답줄,
          쓰기('u4.merge-why', { 안내: '**(2)** 그 속성을 기준으로 정한 이유를 적어 보세요.', 줄수: 2 })),
        h('div', {},
          위젯창({ 이름: 'Merge Data', 제목: '데이터 병합(열/조인) (Merge Data)', 작게: true },
            묶음상자('병합 방식', 라디오('merge', ['추가 데이터(Extra)의 열 덧붙이기 (Left Join)', '일치하는 행 쌍만 찾기 (Inner Join)', '테이블 이어붙이기 (Outer Join)'], 0, (i) => { 방식 = i; 그리기(); })),
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
      const 상자 = h('input', { type: 'checkbox' });
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

    카드('단계 5 · 모델 만들고 성능 확인', '오렌지', (몸) => {
      const 표 = 수면비만();
      let 고정 = true, 씨앗 = 고정씨앗, 시험방식 = 0;
      const 그림 = h('div', {}), 결과 = h('div', {});
      const 줄수 = h('span', { class: 'ow-count', title: '들어온 줄 수 · 나간 줄 수 (뽑힌 것 | 남은 것)' });
      const 그리기 = () => {
        const { 나눔, 모델, 점수 } = 훈련과시험(표.행, 씨앗);
        채우기(줄수, `⇥ ${표.행.length}  ↦ ${나눔.훈련.length} | ${나눔.시험.length}`);
        채우기(그림, 산점도(표.행.map((row, i) => ({ x: row[수면열], y: row[비만열], 색: 나눔.시험.includes(i) ? '#e8702a' : 색들[0], 큰: 나눔.시험.includes(i) })), {
          x이름: '주중평균 전체 (시간)', y이름: '비만율 전체 (%)', 너비: 460, 높이: 290, 반지름: 6, 선: { ...모델, 글: '회귀선' } }).svg,
        h('div', { class: 'legend' }, h('span', { style: { '--c': 색들[0] } }, `훈련 ${나눔.훈련.length}개 (70%)`), h('span', { style: { '--c': '#e8702a' } }, `시험 ${나눔.시험.length}개 (30%)`)));
        채우기(결과, 시험방식 !== 1 ? h('p', { class: 'feedback bad' }, '💡 떼어 둔 시험 데이터로 평가하려면 맨 아래 「별도 테스트 데이터로 평가」 를 고르세요.')
          : h('table', { class: 'kv' }, h('thead', {}, h('tr', {}, ['Model', 'MSE', 'RMSE', 'MAE', 'R2'].map((t) => h('th', { class: 'num' }, t)))),
            h('tbody', {}, h('tr', { class: 'hl' }, h('td', {}, 'Linear Regression'), [점수.MSE, 점수.RMSE, 점수.MAE, 점수.R2].map((v) => h('td', { class: 'num' }, 수(v, 3)))))));
        if (시험방식 === 1) 마침('u4.model');
      };
      const 고정상자 = h('input', { type: 'checkbox', checked: true });
      고정상자.addEventListener('change', () => { 고정 = 고정상자.checked; if (고정) { 씨앗 = 고정씨앗; 그리기(); } });
      그리기();
      // 한국어판 오렌지의 데이터 샘플링 창 — 이 활동에서 쓰는 것은 「고정 비율 70 %」 와 「재현 가능한 샘플링」 뿐이라 나머지는 잠가 둔다
      const 끔 = (글) => h('label', { class: 'ow-radio off' }, h('input', { type: 'radio', disabled: true }), ` ${글}`);
      const 칸 = (글, 값) => h('div', { class: 'ow-sub' }, 글, h('input', { type: 'number', class: 'ow-spin', value: 값, disabled: true, 'aria-label': 글 }));
      const 샘플링창 = 위젯창({ 이름: 'Data Sampler', 제목: '데이터 샘플링 (Data Sampler)', 작게: true },
        묶음상자('샘플링 유형',
          h('label', { class: 'ow-radio' }, h('input', { type: 'radio', checked: true, disabled: true }), ' 데이터의 고정 비율:'),
          h('div', { class: 'ow-sub' }, h('input', { type: 'range', class: 'ow-slider', min: 0, max: 100, value: 70, disabled: true, 'aria-label': '고정 비율' }), h('span', {}, '70 %')),
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
        h('button', { type: 'button', class: 'ow-btn wide', onclick: () => { if (!고정) { 씨앗 = Math.floor(Math.random() * 1e6); 그리기(); } else 그리기(); } }, '데이터 샘플링'),
        h('div', { class: 'ow-foot' }, 줄수));
      // 한국어판 오렌지의 모델 검증 및 평가 창 — 고를 수 있는 것은 평가 방법뿐이고, 딸린 칸은 화면 모양만 보여 준다
      const 평가방법 = (글, i, 잠김 = false) => {
        const 단추 = h('input', { type: 'radio', name: 'tas', checked: i === 0, disabled: 잠김 });
        if (!잠김) 단추.addEventListener('change', () => { 시험방식 = i === 5 ? 1 : 0; 그리기(); });
        return h('label', { class: `ow-radio${잠김 ? ' off' : ''}` }, 단추, ` ${글}`);
      };
      const 고름 = (글, 값) => h('div', { class: 'ow-sub' }, 글, h('select', { class: 'ow-combo', disabled: true, 'aria-label': 글 }, h('option', {}, 값)));
      const 상자 = (글, 켬) => h('div', { class: 'ow-sub' }, h('label', { class: 'ow-check' }, h('input', { type: 'checkbox', checked: 켬, disabled: true }), ` ${글}`));
      const 평가창 = 위젯창({ 이름: 'Test and Score', 제목: '모델 검증 및 평가 (Test and Score)', 작게: true },
        h('div', { class: 'ow-radios' },
          평가방법('교차 검증 (Cross validation)', 0),
          고름('폴드 수: (Number of folds:)', '5'),
          상자('클래스 비율 유지', false),
          평가방법('feature 기준 교차 검증', 1, true),
          h('div', { class: 'ow-sub' }, h('select', { class: 'ow-combo full', disabled: true, 'aria-label': 'feature 기준 교차 검증에 쓸 속성' }, h('option', {}, ''))),
          평가방법('무작위 샘플링 (Random sampling)', 2),
          고름('반복 횟수: (Repeat train/test:)', '10'),
          고름('학습 데이터 비율: (Training set size:)', '66 %'),
          상자('클래스 비율 유지', true),
          평가방법('LOOCV (하나 빼고 검증) (Leave one out)', 3),
          평가방법('학습 데이터로 직접 평가 (Test on train data)', 4),
          평가방법('별도 테스트 데이터로 평가 (Test on test data)', 5)),
        결과);
      채우기(몸, h('div', { class: 'ds-grid' },
        h('div', {}, 그림,
          h('p', { class: 'small muted' }, md(`나온 회귀식: 비만율 = ${수(훈련과시험(표.행, 고정씨앗).모델.기울기, 2)} × 수면 시간 + ${수(훈련과시험(표.행, 고정씨앗).모델.절편, 2)} (고정 표본일 때)`)),
          // 모델 검증 및 평가 창이 키가 커서(평가 방법 6가지 + 딸린 칸) 선 잇는 안내는 왼쪽 칸에 둔다
          h('p', { class: 'small muted' }, md('Data Sampler → Test and Score 선을 두 번 눌러 **Data Sample → Data**, **Remaining Data → Test Data** 로 이어야 시험 데이터로 평가돼요.'))),
        샘플링창,
        평가창));
    }, '교재 23쪽'),

    카드('표본이 바뀌면 결정계수도 바뀔까?', '활동', (몸) => {
      const 표 = 수면비만();
      const 기록 = [];
      const 목록 = h('div', {});
      const 그리기 = () => 채우기(목록,
        h('div', { class: 'r2-bars' }, 기록.map((v, i) => h('div', { class: 'r2-bar', title: `${i + 1}번째: R² ${수(v, 3)}` }, h('span', { style: { height: `${Math.max(2, v * 100)}%` } }), h('small', {}, 수(v, 2))))),
        기록.length ? h('p', {}, md(`${기록.length}번 뽑음 · R² 가장 낮음 **${수(Math.min(...기록), 2)}**, 가장 높음 **${수(Math.max(...기록), 2)}**`)) : h('p', { class: 'muted' }, '단추를 여러 번 눌러 보세요.'));
      const 뽑기 = () => { 기록.push(훈련과시험(표.행, Math.floor(Math.random() * 1e6)).점수.R2); if (기록.length > 14) 기록.shift(); 그리기(); if (기록.length >= 5) 마침('u4.resample'); };
      그리기();
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', {}, md('데이터 샘플링 창에서 **재현 가능한(결정론적) 샘플링** 을 끄고 **데이터 샘플링** 단추를 여러 번 누르면 훈련·시험 데이터가 매번 다르게 뽑혀요. 그때마다 R² 는 어떻게 될까요?')),
          h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', onclick: 뽑기 }, '🎲 다시 뽑기'), h('button', { type: 'button', class: 'btn small', onclick: () => { for (let i = 0; i < 5; i++) 뽑기(); } }, '다섯 번 뽑기')),
          목록),
        h('div', {},
          h('div', { class: 'concept' }, md('데이터가 **17개뿐** 이라 시험 데이터는 5개예요. 어떤 5개가 뽑히느냐에 따라 R² 가 크게 달라져요.')),
          교재메모('교재는 결정계수 **0.89** 를 얻었다고 해요. 교재도 「연결선에 따라 결정계수 값이 다르게 나올 수 있다」고 적어 두었어요. 내 결과가 교재와 다르다고 틀린 것이 아니에요.'),
          퀴즈([{ 질문: '결과를 믿을 만하게 하려면?', 보기: ['R² 가 가장 높게 나온 한 번만 발표한다', '여러 번 해 보거나 데이터를 더 모은다'], 답: 1, 해설: '좋은 결과만 골라 보이는 것은 데이터를 속이는 일이에요.' }], { 열쇠: 'u4.resample-q' }))));
    }, '교재 23쪽'),

    카드('홀드아웃 — 시험 문제를 따로 떼어 두기', '개념', (몸) => {
      const 표 = 수면비만();
      const { 나눔, 점수 } = 훈련과시험(표.행, 고정씨앗);
      const 띠 = h('div', { class: 'yr-strip' }, 표.행.map((r, i) => h('span', { class: 'yr', style: { background: 나눔.시험.includes(i) ? 시험색 : 학습색 } }, String(r.시점))));
      const 그림 = h('div', { class: 'r2-dots-box' }, h('p', { class: 'muted center' }, '단추를 누르면 점이 찍혀요. 점 하나가 「한 번 나눈 것」 이에요.'));
      const 요약 = h('p', { class: 'small' });
      let 몇번 = 0;
      const 나눠보기 = () => {
        // 처음 100번은 늘 씨앗 1~100 — 다음 카드(교차 검증)가 이 100번과 견준다
        const 시작 = 몇번 === 0 ? 1 : 1000 + Math.floor(Math.random() * 1e6);
        const 값들 = 홀드아웃여러번(표.행, Array.from({ length: 100 }, (_, i) => 시작 + i));
        몇번++;
        const 줄 = [...값들].sort((a, b) => a - b), 가운데 = (줄[49] + 줄[50]) / 2, 음수 = 줄.filter((v) => v < 0).length;
        채우기(그림, 점분포(값들, [{ 값: 가운데, 글: `가운데 ${수(가운데, 2)}`, 색: '#555', 쪽: 'end' }, { 값: 점수.R2, 글: `단계 5 (${수(점수.R2, 2)})`, 색: 시험색 }]));
        채우기(요약, md(`100번 나눠 본 R² — 가장 낮음 **${수(줄[0], 2)}** · 가운데 **${수(가운데, 2)}** · 가장 높음 **${수(줄[99], 2)}**. 0.5 아래로 떨어진 것이 **${줄.filter((v) => v < 0.5).length}번**이에요.`
          + (음수 ? ` 빨간 점(${음수}번)은 R² 가 0 보다 작은 것 — 시험 데이터를 평균 하나로 찍는 것보다도 못 맞혔다는 뜻이에요.` : '')));
        마침('u4.holdout');
      };
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('div', { class: 'concept' }, md('**홀드아웃(hold-out)** 은 데이터 일부를 처음부터 **떼어 두고(hold out)** 학습에는 쓰지 않았다가, 모델을 다 만든 뒤 그 떼어 둔 데이터로 시험을 보는 평가 방법이에요.')),
          h('p', {}, md('**10번 카드(단계 5)** 에서 한 것이 바로 홀드아웃이에요. Data Sampler 가 떼어 둔 30 % 로 **「별도 테스트 데이터로 평가」** 를 했지요.')),
          띠,
          h('div', { class: 'legend' }, h('span', { style: { '--c': 학습색 } }, `학습 ${나눔.훈련.length}개 (70 %)`), h('span', { style: { '--c': 시험색 } }, `시험 ${나눔.시험.length}개 (30 %, 떼어 둔 것)`)),
          h('div', { class: 'tip' }, md('🧸 **쉽게 말하면** — 문제집으로 공부하고, 선생님이 숨겨 둔 문제로 시험 보기. 문제집 문제를 그대로 내면 아는 것인지 외운 것인지 알 수 없으니까요.')),
          퀴즈([{ 질문: '10번 카드의 「모델 검증 및 평가」 창에서 홀드아웃은 어느 것이었나요?', 보기: ['교차 검증', '학습 데이터로 직접 평가', '별도 테스트 데이터로 평가'], 답: 2,
            해설: '학습에 쓰지 않고 떼어 둔 데이터(Test Data)로 평가하는 것이 홀드아웃이에요. 「학습 데이터로 직접 평가」 는 배운 문제로 다시 시험을 보는 것이에요.' }], { 열쇠: 'u4.holdout-q' })),
        h('div', {},
          h('p', {}, md('그런데 **딱 한 번** 나누면, 어떤 5개가 시험으로 뽑히느냐에 따라 점수가 달라져요(11번 카드). 100번 나눠 보면 얼마나 흔들릴까요?')),
          h('button', { type: 'button', class: 'btn primary', onclick: 나눠보기 }, '🎲 100번 나눠 보기'),
          그림, 요약,
          h('div', { class: 'concept' }, md('데이터가 적으면 홀드아웃 점수 **하나만으로는** 모델을 믿기 어려워요. 시험을 한 번만 보지 말고 **돌아가며 여러 번** 보면 어떨까요? → 다음 카드 **교차 검증**')))));
    }, '교재 23쪽'),

    카드('교차 검증 — 돌아가며 시험 보기', '활동', (몸) => {
      const 표 = 수면비만();
      const n = 표.행.length;
      const 해 = 표.행.map((r) => `'${String(r.시점).slice(-2)}`);
      const 홀드 = 홀드아웃여러번(표.행, Array.from({ length: 100 }, (_, i) => i + 1)).sort((a, b) => a - b);
      let k = 5, 씨앗 = 1, 끝낸 = 0, 기록됨 = false;
      let cv = 교차검증(표.행, k, 씨앗);
      const 기록 = [];   // 지금 폴드 수로 끝까지 돌려 본 R² — 다시 섞을 때마다 하나씩 는다
      const 격자 = h('div', {}), 알림 = h('p', { class: 'small cv-note' }), 결과 = h('div', { class: 'cv-result' });
      const 이름 = () => (k === n ? 'LOOCV' : `${k}겹 교차 검증`);
      function 그리기() {
        채우기(격자, 교차격자(cv, 끝낸, 해));
        const 판 = cv.판들[끝낸 - 1];
        채우기(알림, 끝낸 === 0 ? md('**▶ 한 판씩** 을 눌러 보세요. 한 줄이 한 판이고, **주황 칸** 이 그 판의 시험 데이터예요.')
          : 끝낸 < k ? md(`**${끝낸}판** — 시험: ${판.시험.map((i) => 해[i]).join(' · ')} (${판.시험.length}개) · 학습: 나머지 ${판.학습.length}개`)
            : md(`**${k}판 모두 끝!** 모델을 ${k}번 만들었고, ${n}개 데이터가 **꼭 한 번씩** 시험을 봤어요.`));
        const 센 = cv.판들.slice(0, 끝낸).reduce((a, p) => a + p.시험.length, 0);
        채우기(결과,
          끝낸 < k ? h('p', { class: 'muted' }, `${끝낸} / ${k}판 · 예측한 데이터 ${센} / ${n}개`)
            : [h('div', { class: 'big-num' }, `R² ${수(cv.점수.R2, 2)}`), h('p', { class: 'small' }, md(`판마다 나온 예측 ${n}개를 **모두 모아** 한 번에 낸 점수예요. 오렌지 Test and Score 도 이렇게 셈해요.`))],
          h('table', { class: 'kv cv-cmp' }, h('tbody', {},
            h('tr', {}, h('td', {}, '홀드아웃 100번 (12번 카드)'), h('td', { class: 'num' }, `${수(홀드[0], 2)} ~ ${수(홀드[99], 2)}`)),
            h('tr', { class: 'hl' }, h('td', {}, `${이름()} · 섞어서 ${기록.length}번`),
              h('td', { class: 'num' }, 기록.length ? `${수(Math.min(...기록), 2)} ~ ${수(Math.max(...기록), 2)}` : '끝까지 돌려 보세요')))),
          기록.length >= 2 ? h('p', { class: 'small' }, md(k === n ? '**LOOCV 는 몇 번을 섞어도 같은 값** 이에요. 하나씩 빼고 모두 해 보니 나누는 데 운이 끼어들 자리가 없어요.'
            : '여러 번 섞어도 **홀드아웃보다 훨씬 덜 흔들려요.** 모든 데이터가 한 번씩 시험을 보니 「운 좋은 5개」·「운 나쁜 5개」 가 섞여 고르게 되거든요.')) : null);
      }
      const 다시 = (새k, 새씨앗) => { k = 새k; 씨앗 = 새씨앗; cv = 교차검증(표.행, k, 씨앗); 끝낸 = 0; 기록됨 = false; 그리기(); };
      const 다함 = () => { if (!기록됨) { 기록.push(cv.점수.R2); 기록됨 = true; 마침('u4.cv'); } };
      const 한판 = () => { if (끝낸 < k) { 끝낸++; if (끝낸 === k) 다함(); 그리기(); } };
      const 끝까지 = () => { 끝낸 = k; 다함(); 그리기(); };
      // 10번 카드의 「모델 검증 및 평가」 창에서 교차 검증과 LOOCV 만 꺼내 왔다 — 폴드 수는 오렌지처럼 2·3·5·10·20
      const 경고 = h('div', {});
      const 폴드 = h('select', { class: 'ow-combo', 'aria-label': '폴드 수' }, [2, 3, 5, 10, 20].map((v) => h('option', { value: v, selected: v === 5 }, String(v))));
      const 교차단추 = h('input', { type: 'radio', name: 'cvm', checked: true });
      const 하나단추 = h('input', { type: 'radio', name: 'cvm' });
      const 폴드로 = () => {
        const v = Number(폴드.value);
        채우기(경고, v > n ? h('p', { class: 'feedback bad' }, `데이터가 ${n}개뿐이라 ${v}묶음으로는 나눌 수 없어요. 오렌지도 이때는 오류를 알려요.`) : null);
        if (v <= n) { 기록.length = 0; 다시(v, 1); }
        else 폴드.value = String(k < n ? k : 5);   // 나눌 수 없는 값은 받지 않고, 지금 돌고 있는 폴드 수로 되돌린다
      };
      교차단추.addEventListener('change', 폴드로);
      폴드.addEventListener('change', () => { 교차단추.checked = true; 폴드로(); });
      하나단추.addEventListener('change', () => { 채우기(경고); 기록.length = 0; 다시(n, 1); });
      const 평가창 = 위젯창({ 이름: 'Test and Score', 제목: '모델 검증 및 평가 (Test and Score)', 작게: true },
        h('div', { class: 'ow-radios' },
          h('label', { class: 'ow-radio' }, 교차단추, ' 교차 검증 (Cross validation)'),
          h('div', { class: 'ow-sub' }, '폴드 수: (Number of folds:)', 폴드),
          h('label', { class: 'ow-radio' }, 하나단추, ' LOOCV (하나 빼고 검증) (Leave one out)')));
      그리기();
      채우기(몸, h('div', { class: 'two wide-left' },
        h('div', {},
          h('div', { class: 'concept' }, md('**k-겹 교차 검증(k-fold cross validation)** — 데이터를 **k 묶음(폴드)** 으로 나누고, 한 묶음씩 **돌아가며** 시험으로 써요. 나머지 묶음으로 학습하니 모델을 k 번 만들고, 모든 데이터가 꼭 한 번씩 시험을 봐요.')),
          격자,
          h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn primary', onclick: 한판 }, '▶ 한 판씩'),
            h('button', { type: 'button', class: 'btn', onclick: 끝까지 }, '⏩ 끝까지'),
            h('button', { type: 'button', class: 'btn small', onclick: () => 다시(k, 2 + Math.floor(Math.random() * 1e6)) }, '🔀 다시 섞기')),
          알림),
        h('div', {},
          h('p', { class: 'small' }, md('**10번 카드** 의 「모델 검증 및 평가」 창 맨 위에 있던 **교차 검증** 이 바로 이것이에요. 폴드 수를 바꿔 보세요.')),
          평가창, 경고, 결과,
          h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn small', onclick: 여섯가지 }, '📋 창의 평가 방법 여섯 가지'),
            h('a', { class: 'btn small', href: '#u4/9' }, '↩ 10번 카드 창 다시 보기')))));
      // 여섯 가지 풀이는 카드에 펼치면 1280×720 을 넘쳐서 창으로 띄운다
      function 여섯가지() {
        창('📋 「모델 검증 및 평가」 창의 평가 방법 여섯 가지', h('ul', { class: 'cv-map' },
              h('li', {}, md('**교차 검증** — 이 카드. 폴드 수만큼 판을 돌려요.')),
              h('li', {}, md('**feature 기준 교차 검증** — 범주형 속성의 값마다 묶음을 나눠요. 이 데이터에는 범주형 속성이 없어 흐리게 보여요.')),
              h('li', {}, md('**무작위 샘플링** — 홀드아웃을 여러 번(반복 횟수 10 · 학습 66 %) 하고 점수를 모아요.')),
              h('li', {}, md('**LOOCV (하나 빼고 검증)** — 폴드 수를 데이터 수만큼. 하나씩 빼고 17번 해요.')),
              h('li', {}, md('**학습 데이터로 직접 평가** — 배운 데이터로 다시 시험. 처음 보는 데이터에서의 실력은 알 수 없어요.')),
              h('li', {}, md('**별도 테스트 데이터로 평가** — 떼어 둔 데이터로 시험. 홀드아웃(12번 카드)이에요.'))));
      }
    }, '교재 23쪽'),

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
      그리기(6.2);
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', {}, md(`모델로 결과를 예측할 때는 오렌지의 ${'**Predictions**'} 위젯을 써요. 회귀식 **비만율 = ${수(모델.기울기, 2)} × 수면 시간 + ${수(모델.절편, 2)}** 에 값을 넣는 것과 같아요.`)),
          슬라이더('평균 수면 시간', { 최소: 4, 최대: 9, 단계: 0.1, 값: 6.2, 글자: (v) => `${수(v, 1)}시간`, 바뀜: 그리기 }).줄,
          결과,
          h('p', { class: 'small muted' }, '🎯 슬라이더를 9시간까지 밀어 보세요.')),
        h('div', {},
          h('p', {}, '오렌지 흐름에 Predictions 를 붙이면 이렇게 이어요.'),
          h('div', { class: 'row' }, 위젯글('Data Sampler'), '→', 위젯글('Linear Regression'), '→', 위젯글('Predictions')),
          h('p', { class: 'small muted' }, md('Predictions 에는 모델(Linear Regression)과 **예측할 데이터**(Data Sampler 의 Remaining Data)를 함께 이어요.')),
          h('div', { class: 'tip' }, md('💡 회귀 모델은 **배운 범위 안** 에서만 믿을 수 있어요. 범위 밖을 예측하는 것을 **외삽** 이라고 하는데 조심해야 해요.')))));
    }, '교재 23쪽'),

    카드('단계 6 · 결과를 무조건 믿어도 될까?', '활동', (몸) => {
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          말풍선('🧑‍🎓', '채원', '결정계수가 높게 나왔으니, **나도** 일찍 자기만 하면 살이 빠지는 거지?'),
          h('div', { class: 'concept' }, md('이 데이터는 **해마다의 평균값(집단)** 이에요. 한 해의 평균 수면 시간과 그해의 비만율이 함께 움직였다는 뜻이지, **한 사람이 잠을 더 자면 살이 빠진다** 는 증거는 아니에요.'))),
        퀴즈([
          { 질문: '이 분석으로 말할 수 **있는** 것은?', 보기: ['연도별 평균 수면 시간과 비만율 사이에 강한 음의 상관관계가 있다', '잠을 1시간 더 자면 누구나 살이 빠진다', '수면 부족이 비만의 유일한 원인이다'], 답: 0, 해설: '집단 단위 데이터로는 상관관계까지만 말할 수 있어요.' },
          { 질문: '두 속성이 모두 「해가 갈수록」 바뀌었다면 생각해 볼 점은?', 보기: ['해가 갈수록 함께 바뀐 다른 원인(스마트폰 사용, 식습관 등)이 있을 수 있다', '아무것도 없다'], 답: 0, 해설: '숨은 원인(교란 변수)이 둘을 함께 움직였을 수 있어요. 그래서 다른 속성도 함께 봐야 해요(→ 5단원).' },
          { 질문: '결과를 더 믿을 만하게 하는 방법이 **아닌** 것은?', 보기: ['전문가 의견·논문을 찾아 견준다', '개인 단위 데이터로 다시 분석한다', '결정계수가 높으니 그대로 발표한다'], 답: 2, 해설: '도메인 지식으로 타당성을 보완하고, 다른 요인도 살펴야 해요.' },
        ], { 열쇠: 'u4.interpret' })));
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

  ],
};
