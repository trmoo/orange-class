/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  7단원 — 프로젝트 3 「연관 분석으로 여행지를 추천해 보자」
 *  성취기준 [12데과03-04] · 학습 요소: 연관 분석, 장바구니 분석 · 교과서 148~157쪽
 *  설문 데이터는 연습용으로 새로 만든 값이다(src/data/tour.js). 빈발 항목 집합·연관 규칙은 브라우저에서 실제로 계산한다.
 */
import { h, 채우기, md, 수 } from '../lib/ui.js';
import { 퀴즈, 순서, 짝짓기, 쓰기, 자기평가, 알림줄 } from '../lib/games.js';
import { 끝냄 } from '../lib/store.js';
import { 빈발집합, 규칙들, 항목들 } from '../lib/assoc.js';
import { 흐름조립, 위젯창, 묶음상자, 라디오, 열고르기, 데이터표 } from '../lib/orange.js';
import { 카드, 말풍선, 교재메모, 슬라이더 } from './common.js';
import { 프로젝트카드 } from './project.js';
import { 설문만들기, 묶음으로, 활동, 응답수 } from '../data/tour.js';

const 마침 = (열쇠) => { 끝냄(열쇠); document.dispatchEvent(new CustomEvent('activity-done', { detail: 열쇠 })); };

let 설문 = null, 만족 = null, 묶음들 = null;
const 응답들 = () => (설문 ||= 설문만들기());
const 만족응답 = () => (만족 ||= 응답들().filter((r) => r.Q11 >= 4));
const 트랜잭션 = () => (묶음들 ||= 만족응답().map(묶음으로));

const 항목이름 = (i) => `${활동[i][0]}=≥ 1`;
const 묶음글 = (m) => 항목들(m).map(항목이름).join(', ');
const 묶음뜻 = (m) => 항목들(m).map((i) => 활동[i][1]).join(' + ');

/** 오렌지 Association Rules 처럼 규칙을 찾고 거른다 */
export function 규칙찾기({ 최소지지도 = 0.001, 최소신뢰도 = 0.7, 포함 = '', 최소 = 1, 최대 = 2 } = {}) {
  const T = 트랜잭션();
  const 빈발 = 빈발집합(T, 최소지지도);
  const N = T.length;
  const 지지 = new Map(빈발.map((x) => [x.묶음, x.수]));
  const 낱말 = 포함.split(/[,\s]+/).map((w) => w.trim()).filter(Boolean);
  const 맞나 = (글) => !낱말.length || 낱말.some((w) => 글.toLowerCase().includes(w.toLowerCase()));
  return 규칙들(T, 빈발, 최소신뢰도)
    .map((r) => {
      const sA = 지지.get(r.A) / N, sB = 지지.get(r.B) / N;
      return { ...r, 덮음: sA, 강도: sB / sA, 레버리지: r.지지도 - sA * sB, A글: 묶음글(r.A), B글: 묶음글(r.B), A크기: 항목들(r.A).length };
    })
    .filter((r) => r.A크기 >= 최소 && r.A크기 <= 최대 && 맞나(r.A글))
    .sort((a, b) => b.향상도 - a.향상도 || b.지지도 - a.지지도);
}

/** 오렌지 Discretize 의 구간 이름 짓기 — 「< 0」, 「0 - 1」, 「≥ 1」 (끝의 .0 은 뗀다) */
export function 구간이름(점들) {
  const 글 = (v) => String(Number(v.toFixed(6)));
  const 이름 = [`< ${글(점들[0])}`];
  for (let i = 1; i < 점들.length; i++) 이름.push(`${글(점들[i - 1])} - ${글(점들[i])}`);
  이름.push(`≥ ${글(점들[점들.length - 1])}`);
  return 이름;
}
export function 구간찾기(점들, v) {
  if (v === null) return '?';
  const 이름 = 구간이름(점들);
  for (let i = 0; i < 점들.length; i++) if (v < 점들[i]) return 이름[i];
  return 이름[이름.length - 1];
}

function 규칙표(규칙, 몇 = 8) {
  return h('div', { class: 'ow-table-wrap', style: { maxHeight: '300px' } }, h('table', { class: 'ow-table rules' },
    h('thead', {}, h('tr', {}, ['Supp', 'Conf', 'Covr', 'Strg', 'Lift', 'Levr', 'Antecedent', '', 'Consequent'].map((t) => h('th', {}, t)))),
    h('tbody', {}, 규칙.slice(0, 몇).map((r) => h('tr', {},
      [r.지지도, r.신뢰도, r.덮음, r.강도, r.향상도, r.레버리지].map((v, i) => h('td', { class: i === 4 ? 'target' : '' }, 수(v, 3))),
      h('td', { style: { textAlign: 'left' }, title: 묶음뜻(r.A) }, r.A글), h('td', {}, '→'), h('td', { style: { textAlign: 'left' }, title: 묶음뜻(r.B) }, r.B글))))),
  h('div', { class: 'ow-table-foot' }, `Rules: ${규칙.length.toLocaleString()} (shown ${Math.min(몇, 규칙.length)}) · Lift 내림차순 · 칸에 마우스를 올리면 뜻이 보여요`));
}

export default {
  id: 'u7', 번호: 7, 색: '#a07040', 갈래: '프로젝트 3 · 연관 분석',
  제목: '외국인 친구 여행지 추천', 부제: '연관 분석으로 여행지를 추천해 보자',
  카드: [
    카드('성호의 부탁 받은 주말', '이야기', (몸) => {
      채우기(몸, h('div', { class: 'two wide-left' },
        h('div', {},
          말풍선('🧑', '폴', '박물관에 다녀왔는데, 한국 역사가 이렇게 깊은 줄 몰랐어!'),
          말풍선('👱', '제임스', '나는 전통 문화 체험을 했어. 한복 입고, 붓글씨 쓰고, 한지도 접었어!'),
          말풍선('🧑‍🎓', '성호', '둘 다 만족할 다음 여행지를 추천해 줘야겠다. **다른 여행객들이 함께 즐긴 활동** 을 찾아보면 되겠지? → **연관 분석**!')),
        h('div', { class: 'box' },
          h('table', { class: 'kv small' }, h('tbody', {},
            h('tr', {}, h('th', {}, '단원'), h('td', {}, 'Ⅲ. 데이터 모델링과 평가 — 04. 연관 분석')),
            h('tr', {}, h('th', {}, '성취기준'), h('td', {}, '[12데과03-04] 데이터 사이의 관계를 분석해 상호 연관성을 파악하고 결과의 의미를 해석한다.')),
            h('tr', {}, h('th', {}, '학습 요소'), h('td', {}, '연관 분석, 장바구니 분석')))),
          h('h3', { style: { marginTop: '10px' } }, '🗺️ 이번 프로젝트의 길'),
          h('ol', { class: 'small' },
            h('li', {}, '문제 정의 — 폴과 제임스가 만족할 여행지 추천'),
            h('li', {}, '관광지식정보시스템에서 「외래관광객조사」 데이터 받기, 속성명 확인'),
            h('li', {}, '만족한 응답만 고르고, 수치형 → 범주형으로 바꾸기'),
            h('li', {}, 'Feature Statistics 로 통계 보기'),
            h('li', {}, '빈발 항목 집합과 연관 규칙 찾기'),
            h('li', {}, '향상도로 추천 여행지를 고르고 나누기')))));
    }, '교재 48쪽'),

    카드('단계 2 · 데이터 받고 속성명 알기', '활동', (몸) => {
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'small' }, md('**관광지식정보시스템** (know.tour.go.kr) → [조사통계] → [외래관광객조사] → [데이터 다운로드] 에서 가장 최근 자료를 받으면 **xlsx** 와 **sav** 파일이 있어요. sav 는 통계 프로그램 SPSS 의 파일이라 속성 이름·뜻(라벨)·결측값 같은 **메타 정보** 까지 들어 있어요.')),
          h('div', { class: 'ow-table-wrap', style: { maxHeight: '280px' } }, h('table', { class: 'ow-table' },
            h('thead', {}, h('tr', {}, h('th', {}, '속성명'), h('th', {}, '뜻 — 문8. 한국 여행 중 참여한 활동'))),
            h('tbody', {}, [['pnid', '응답자 번호'], ...활동, ['Q11', '문11. 전반적 만족도 (1~5점)']].map(([a, b]) => h('tr', {}, h('td', { style: { textAlign: 'left' } }, a), h('td', { style: { textAlign: 'left' } }, b))))))),
        h('div', {},
          h('p', {}, '두 친구가 즐긴 활동은 어느 속성일까요? 왼쪽 표에서 찾아 골라 보세요.'),
          짝짓기([
            { 왼: '🧑 폴 — 박물관 관람', 답: 'Q8a06' },
            { 왼: '👱 제임스 — 전통 문화 체험', 답: 'Q8a05' },
            { 왼: '😊 전반적 만족도', 답: 'Q11' },
          ], ['Q8a04', 'Q8a05', 'Q8a06', 'Q8a07', 'Q11'], { 열쇠: 'u7.attrs' }),
          교재메모('교재 50쪽 속성표에서는 **Q8a05 = 전통문화체험, Q8a06 = 박물관** 인데, 51·55쪽 설명에는 폴(박물관)이 Q8a05, 제임스(전통 문화)가 Q8a06 으로 **바뀌어** 적혀 있어요. 이 앱은 속성표를 따랐어요. 두 속성을 함께 넣어 분석하므로 결론은 같아요.'))));
    }, '교재 49~50쪽'),

    카드('Associate 추가 기능 설치', '오렌지', (몸) => {
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', {}, md('연관 분석에 쓰는 **Frequent Itemsets**, **Association Rules** 위젯은 처음 설치한 오렌지에는 없어요. 추가 기능(Add-on)을 먼저 설치해요. 순서를 맞혀 보세요.')),
          순서(['오렌지 위쪽 메뉴에서 [Options] 를 누른다', '[Add-ons...] 를 누른다', '목록에서 [Associate] 에 체크한다', '[OK] 를 누르고 설치가 끝나길 기다린다', '오렌지를 다시 시작한다'], { 열쇠: 'u7.addon' })),
        h('div', {},
          위젯창('Add-ons', h('table', { class: 'kv small' }, h('tbody', {},
            [['☐', 'Educational'], ['☑', 'Associate'], ['☐', 'Explain'], ['☐', 'Geo'], ['☐', 'Text']].map(([c, n]) => h('tr', { class: n === 'Associate' ? 'hl' : '' }, h('td', {}, c), h('td', {}, n)))))),
          h('p', { class: 'small muted' }, '목록은 예시예요. 실제 화면에는 추가 기능이 더 많아요. 설치가 끝나면 위젯 상자에 Associate 갈래가 생겨요.'),
          h('div', { class: 'tip' }, '💡 학교 컴퓨터는 설치 권한이 없을 수 있어요. 수업 전에 선생님이 미리 설치해 두면 좋아요.'))));
    }, '교재 53쪽'),

    카드('오렌지에서 위젯 흐름 만들기', '오렌지', (몸) => {
      채우기(몸,
        h('p', { class: 'small' }, md('이번 프로젝트의 **전체 위젯 흐름** 이에요. 할 일을 읽고 알맞은 위젯을 차례로 이어 보세요.')),
        흐름조립([
          { id: 'f', 위젯: 'File', 부제: '관광객 조사', 부모: [], 할일: '설문 **xlsx 파일** 을 불러와요. (속성이 많아 오래 걸릴 수 있어요)', x: 70, y: 170 },
          { id: 'dt', 위젯: 'Data Table', 부모: ['f'], 할일: '데이터를 **표로 확인** 해요.', x: 210, y: 60 },
          { id: 'sc', 위젯: 'Select Columns', 부모: ['f'], 할일: '활동 속성 19개만 **골라요**.', x: 230, y: 260 },
          { id: 'sr', 위젯: 'Select Rows', 부모: ['sc'], 할일: '여행에 **만족한 응답만** 남겨요.', x: 390, y: 260 },
          { id: 'di', 위젯: 'Discretize', 부모: ['sr'], 할일: '수치형을 **범주형으로 바꿔요**.', x: 550, y: 200 },
          { id: 'fs', 위젯: 'Feature Statistics', 부모: ['di'], 할일: '속성마다 **통계(빈칸 비율)** 를 봐요.', x: 720, y: 70 },
          { id: 'fi', 위젯: 'Frequent Itemsets', 부모: ['di'], 할일: '**자주 함께 나오는 항목 집합** 을 찾아요.', x: 740, y: 200 },
          { id: 'ar', 위젯: 'Association Rules', 부모: ['di'], 할일: '**연관 규칙** 을 찾아 향상도를 봐요.', x: 740, y: 320 },
        ], { 열쇠: 'u7.flow', 팔레트: ['File', 'Data Table', 'Select Columns', 'Select Rows', 'Merge Data', 'Discretize', 'Preprocess', 'Feature Statistics', 'k-Means', 'Frequent Itemsets', 'Association Rules', 'Linear Regression'], 높이: 370, 너비: 880 }));
    }, '교재 51~56쪽'),

    카드('Data Table — 설문 데이터 살펴보기', '오렌지', (몸) => {
      const 열 = ['pnid', ...활동.map((a) => a[0]), 'Q11'];
      채우기(몸,
        데이터표(열, 응답들().map((r) => [r.pnid, ...r.값, r.Q11]), { 최대행: 6, 설명: `${응답수.toLocaleString()} instances · 21 features (연습용, 실제 자료는 속성이 수백 개)` }),
        h('p', {}, md('활동을 고른 사람은 **그 문항 번호**(Q8a05 → 5)가, 고르지 않은 사람은 **? (빈칸)** 이 들어 있어요. 만족도 Q11 은 1~5점이에요.')),
        퀴즈([{ 질문: '응답자 100001 번은 Q8a04 칸이 무엇인가요? 표에서 확인해 보세요.', 보기: ['4 — 고궁/역사 유적지를 방문했다', '? — 방문하지 않았다'], 답: 응답들()[0].값[3] === null ? 1 : 0, 해설: '숫자가 있으면 그 활동을 한 것, ? 이면 하지 않은 것이에요.' }], { 열쇠: 'u7.table' }));
    }, '교재 51쪽'),

    카드('Select Columns — 쓸 속성만 남기기', '오렌지', (몸) => {
      const 열 = ['pnid', ...활동.map((a) => a[0]), 'Q11'];
      const 답 = Object.fromEntries(열.map((k) => [k, k === 'pnid' || k === 'Q11' ? 'Metas' : 'Features']));
      채우기(몸, h('div', { class: 'two wide-left' },
        열고르기(열, 답, { 열쇠: 'u7.columns', 처음: Object.fromEntries(열.map((k) => [k, 'Features'])) }),
        h('div', {},
          h('p', {}, md('**pnid**(아이디)와 **Q11**(만족도)은 연관 분석의 항목이 아니니 **Metas** 로 옮기세요. Q8a01~Q8a19 는 Features 에 둬요.')),
          h('div', { class: 'tip' }, md('💡 Q11 을 지우지 않고 Metas 에 두는 까닭은? 다음 카드의 **Select Rows** 에서 만족한 사람만 고를 때 써야 하기 때문이에요.')))));
    }, '교재 51쪽'),

    카드('Select Rows — 만족한 사람만', '오렌지', (몸) => {
      const 속성칸 = h('select', { class: 'pick' }, ['Q11', 'pnid', 'Q8a01'].map((k) => h('option', {}, k)));
      const 조건칸 = h('select', { class: 'pick' }, ['equals', 'is not', 'is below', 'is at most', 'is greater than', 'is at least', 'is between'].map((k) => h('option', {}, k)));
      const 값칸 = h('input', { type: 'number', class: 'blank', value: 3, style: { width: '4em' } });
      const 결과 = h('div', {}), 줄 = 알림줄();
      const 그리기 = () => {
        const v = Number(값칸.value);
        const 시험 = { equals: (x) => x === v, 'is not': (x) => x !== v, 'is below': (x) => x < v, 'is at most': (x) => x <= v, 'is greater than': (x) => x > v, 'is at least': (x) => x >= v, 'is between': (x) => x >= v }[조건칸.value];
        const 고른 = 속성칸.value === 'Q11' ? 응답들().filter((r) => 시험(r.Q11)).length : 응답들().length;
        채우기(결과, h('p', { class: 'lead' }, md(`Data: ${응답수.toLocaleString()} → Matching data: **${고른.toLocaleString()}**`)));
        if (속성칸.value === 'Q11' && ((조건칸.value === 'is at least' && v === 4) || (조건칸.value === 'is greater than' && v === 3))) { 줄.맞음(`만족도 4점 이상인 응답 **${고른.toLocaleString()}개** 만 남았어요.`); 마침('u7.rows'); }
        else 줄.알림('만족도(Q11)가 **4점 이상** 인 응답만 남기도록 조건을 만들어 보세요.');
      };
      [속성칸, 조건칸, 값칸].forEach((e) => e.addEventListener('input', 그리기));
      그리기();
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', {}, md('추천은 **한국 여행에 만족한 사람들** 의 활동을 바탕으로 해야겠지요? 만족도가 4점 이상인 응답만 골라요.')),
          위젯창('Select Rows', 묶음상자('Conditions', h('div', { class: 'row' }, 속성칸, 조건칸, 값칸)), 결과),
          줄),
        h('div', {},
          퀴즈([{ 질문: '「is at least 4」 와 같은 조건은?', 보기: ['Q11 > 4', 'Q11 ≥ 4', 'Q11 = 4'], 답: 1, 해설: 'at least = 「적어도」, 4 이상이에요.' }], { 열쇠: 'u7.rows-q' }),
          h('p', { class: 'small muted' }, '이 연습 데이터는 응답 대부분이 만족(4·5점)이라 조금만 줄어요.'))));
    }, '교재 52쪽'),

    카드('Discretize — 숫자를 범주로', '오렌지', (몸) => {
      const 입력 = h('input', { type: 'text', class: 'blank', value: '', placeholder: '예) 0.0, 1.0', style: { width: '9em', textAlign: 'left' } });
      const 표자리 = h('div', {}), 줄 = 알림줄();
      const 보기값 = [5, null, 6, 6, null];
      const 그리기 = () => {
        // Number('') 는 0 이 되므로 빈 조각은 먼저 걸러 낸다
        const 점들 = 입력.value.split(/[,\s]+/).filter((w) => w.trim() !== '').map(Number).filter((v, i, a) => Number.isFinite(v) && a.indexOf(v) === i).sort((a, b) => a - b);
        if (!점들.length) { 채우기(표자리, h('p', { class: 'muted' }, '경계값을 쉼표로 나눠 넣어 보세요.')); 줄.지우기(); return; }
        const 이름 = 구간이름(점들);
        채우기(표자리,
          h('table', { class: 'kv small' }, h('thead', {}, h('tr', {}, h('th', {}, '값(Value)'), h('th', {}, '범주(Category)'))),
            h('tbody', {}, 이름.map((n, i) => h('tr', {}, h('td', {}, i === 0 ? `값 < ${점들[0]}` : i === 이름.length - 1 ? `값 ≥ ${점들[점들.length - 1]}` : `${점들[i - 1]} ≤ 값 < ${점들[i]}`), h('td', {}, h('b', {}, n)))))),
          h('p', { class: 'small' }, '예: Q8a05 의 값 → ', 보기값.map((v) => h('span', { class: 'pill', style: { margin: '0 3px' } }, `${v ?? '?'} → ${구간찾기(점들, v)}`))));
        // 고른 활동(문항 번호 1~19)이 모두 같은 범주에 들어가야 「했다」 하나로 묶인다
        const 범주들 = new Set(Array.from({ length: 19 }, (_, i) => 구간찾기(점들, i + 1)));
        if (범주들.size === 1) { 줄.맞음(`고른 활동은 모두 「${[...범주들][0]}」 하나로, 고르지 않은 것은 「?」 로 남아요. 이제 항목으로 쓸 수 있어요!`); 마침('u7.discretize'); }
        else 줄.틀림(`문항 번호(1~19)가 ${범주들.size}개 범주로 나뉘어요. 「했다」 를 하나의 범주로 만들려면 경계를 1 이하로 잡아야 해요.`);
      };
      입력.addEventListener('input', 그리기);
      그리기();
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'small' }, md('연관 분석은 「했다 / 안 했다」 같은 **범주형 항목** 으로 해요. 그런데 활동 속성은 숫자(numeric)라서 **Discretize** 로 범주형(categorical)으로 바꿔야 해요.')),
          위젯창('Discretize',
            h('p', { class: 'small' }, md('왼쪽 목록에서 **Q8a01 ~ Q8a19** 를 고른 뒤 ([Ctrl]·[Shift] 로 여러 개 고르기)')),
            묶음상자('', 라디오('disc', ['Keep numeric', 'Remove', 'Natural binning, desired bins:', 'Equal frequency, intervals:', 'Equal width, intervals:'], -1, () => {}),
              h('label', { class: 'ow-radio' }, h('input', { type: 'radio', name: 'disc', checked: true }), ' Custom: ', 입력)))),
        h('div', {}, 표자리, 줄,
          교재메모('교재는 경계를 「0.0, 1.0」 으로 넣고 범주를 「≥ 1.0」 처럼 적었어요. 오렌지 3.40 에서는 끝의 .0 을 떼어 **「< 0」, 「0 - 1」, 「≥ 1」** 로 보여요. 그래서 규칙에도 **Q8a05=≥ 1** 처럼 나와요.'))));
    }, '교재 52쪽'),

    카드('단계 4 · Feature Statistics', '오렌지', (몸) => {
      const 전체 = 만족응답().length;
      const 통계 = 활동.map((a, i) => { const 빈 = 만족응답().filter((r) => r.값[i] === null).length; return { 이름: a[0], 뜻: a[1], 빈, 비율: 빈 / 전체 }; });
      const 많음 = 통계.reduce((x, y) => (y.비율 < x.비율 ? y : x));
      const 적음 = 통계.filter((s) => s.이름 !== 'Q8a19').reduce((x, y) => (y.비율 > x.비율 ? y : x));
      채우기(몸, h('div', { class: 'two wide-left' },
        h('div', { class: 'ow-table-wrap', style: { maxHeight: '440px' } }, h('table', { class: 'ow-table' },
          h('thead', {}, h('tr', {}, h('th', {}, 'Name'), h('th', {}, 'Mode'), h('th', {}, 'Missing'), h('th', { style: { width: '40%' } }, ''))),
          h('tbody', {}, 통계.map((s) => h('tr', { title: s.뜻 },
            h('td', { style: { textAlign: 'left' } }, s.이름), h('td', {}, '≥ 1'), h('td', {}, `${s.빈.toLocaleString()} (${Math.round(s.비율 * 100)} %)`),
            h('td', {}, h('span', { class: 'silbar', style: { width: `${s.비율 * 100}%`, background: '#c9c9c9' } }))))))),
        h('div', {},
          h('p', { class: 'small' }, md('**Missing** 은 그 활동을 **고르지 않은** 사람 수예요. 빈칸이 적을수록 많은 사람이 즐긴 활동이에요.')),
          퀴즈([
            { 질문: '가장 많은 사람이 즐긴 활동은?', 보기: 통계.slice(0, 4).map((s) => `${s.이름} ${s.뜻}`), 답: 통계.indexOf(많음), 해설: `${많음.이름}(${많음.뜻})은 빈칸이 ${Math.round(많음.비율 * 100)}% 뿐이에요.`, 힌트: 'Missing 막대가 가장 짧은 것을 찾아보세요.' },
            { 질문: `빈칸이 ${Math.round(적음.비율 * 100)}% 로 가장 많은 활동(기타 빼고)은?`, 보기: [`${적음.이름} ${적음.뜻}`, 'Q8a02 쇼핑', 'Q8a01 식도락 관광'], 답: 0, 해설: '거의 아무도 하지 않은 활동이에요. 이런 항목은 빈발 항목 집합에 잘 나오지 않아요.' },
          ], { 열쇠: 'u7.stats' }),
          h('p', { class: 'small muted' }, 'Q8a19(기타)는 무엇인지 알 수 없으니 분석에서 따로 생각하지 않아요.'))));
    }, '교재 53쪽'),

    카드('Frequent Itemsets — 자주 함께 나오는 묶음', '오렌지', (몸) => {
      let 최소 = 1;
      const 결과 = h('div', {});
      const 그리기 = () => {
        const 빈발 = 빈발집합(트랜잭션(), 최소 / 100);
        const 둘이상 = 빈발.filter((x) => 항목들(x.묶음).length >= 2).sort((a, b) => b.수 - a.수);
        채우기(결과, h('p', {}, md(`Number of itemsets: **${빈발.length.toLocaleString()}** (항목 2개 이상: ${둘이상.length.toLocaleString()})`)),
          h('div', { class: 'ow-table-wrap', style: { maxHeight: '260px' } }, h('table', { class: 'ow-table' },
            h('thead', {}, h('tr', {}, h('th', {}, 'Itemsets (2개 이상)'), h('th', {}, 'Support'), h('th', {}, '%'))),
            h('tbody', {}, 둘이상.slice(0, 12).map((x) => h('tr', { title: 묶음뜻(x.묶음) }, h('td', { style: { textAlign: 'left' } }, 묶음글(x.묶음)), h('td', {}, x.수.toLocaleString()), h('td', {}, 수(x.지지도 * 100, 1))))))));
        if (최소 <= 0.2) 마침('u7.itemsets');
      };
      그리기();
      채우기(몸, h('div', { class: 'two wide-right' },
        h('div', {},
          위젯창('Frequent Itemsets', 묶음상자('Find itemsets',
            슬라이더('Minimal support:', { 최소: 0.1, 최대: 20, 단계: 0.1, 값: 최소, 글자: (v) => `${수(v, 1)}%`, 바뀜: (v) => { 최소 = v; 그리기(); } }).줄,
            h('div', { class: 'small' }, 'Max. number of itemsets: 10000'))),
          h('p', { class: 'small' }, md('**최소 지지도** 보다 자주 나오는 항목 집합만 남겨요. 데이터가 많으니 교재처럼 **0.1%** 까지 낮춰 보세요. 값을 낮출수록 집합이 많아져요.')),
          h('div', { class: 'tip' }, '지지도 = 그 항목 집합이 들어 있는 응답 수 ÷ 전체 응답 수')),
        결과));
    }, '교재 54쪽'),

    카드('Association Rules — 폴과 제임스의 규칙', '오렌지', (몸) => {
      const 포함칸 = h('input', { type: 'text', class: 'blank', value: '', placeholder: 'Q8a05, Q8a06', style: { width: '10em', textAlign: 'left' } });
      let 최대 = 2;
      const 결과 = h('div', {}), 줄 = 알림줄();
      const 찾기 = () => {
        const 규칙 = 규칙찾기({ 최소지지도: 0.001, 최소신뢰도: 0.7, 포함: 포함칸.value, 최소: 1, 최대 });
        채우기(결과, 규칙표(규칙, 10));
        const 좋음 = /q8a05/i.test(포함칸.value) && /q8a06/i.test(포함칸.value);
        if (좋음) { 줄.맞음('Lift 가 높은 규칙의 뒤쪽(Consequent)에 **공통으로 들어 있는 항목** 을 찾아보세요. 다음 카드에서 정리해요.'); 마침('u7.rules'); }
        else 줄.알림('Filter by Antecedent 의 Contains 에 **Q8a05, Q8a06** 을 넣고 [Find Rules] 를 눌러 보세요.');
      };
      찾기();
      채우기(몸, h('div', { class: 'two wide-right' },
        h('div', {},
          위젯창('Association Rules',
            묶음상자('Find association rules', h('div', { class: 'small' }, 'Min. supp.: 0.1% · Min. conf.: 70% · Max. rules: 10000'),
              h('button', { type: 'button', class: 'ow-btn', onclick: 찾기 }, 'Find Rules')),
            묶음상자('Filter by Antecedent', h('div', { class: 'row' }, 'Contains: ', 포함칸),
              h('div', { class: 'row' }, 'Items, min: 1  max: ', (() => { const sel = h('select', { class: 'pick' }, [1, 2].map((v) => h('option', { value: v, selected: v === 2 }, v))); sel.addEventListener('change', () => { 최대 = Number(sel.value); 찾기(); }); return sel; })()))),
          줄),
        결과));
    }, '교재 54~56쪽'),

    카드('단계 6 · 향상도로 추천하기', '활동', (몸) => {
      const 둘다 = 규칙찾기({ 포함: 'Q8a05 Q8a06', 최소: 2, 최대: 2 }).filter((r) => r.A === ((1 << 4) | (1 << 5)));
      const 하나씩 = [4, 5].map((i) => 규칙찾기({ 포함: 활동[i][0], 최소: 1, 최대: 1 }).filter((r) => 항목들(r.B).length === 1)[0]);
      const 최고 = 둘다.filter((r) => 항목들(r.B).length === 1)[0];
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'small' }, md('**Q8a05·Q8a06 를 함께 한 사람** 의 규칙 가운데 결과가 하나인 것을 향상도 순으로 보면:')),
          h('table', { class: 'kv small' }, h('thead', {}, h('tr', {}, h('th', {}, '규칙'), h('th', { class: 'num' }, '지지도'), h('th', { class: 'num' }, '신뢰도'), h('th', { class: 'num' }, '향상도'))),
            h('tbody', {}, [...둘다.filter((r) => 항목들(r.B).length === 1).slice(0, 3), ...하나씩.filter(Boolean)].map((r) => h('tr', { class: r === 최고 ? 'hl' : '' },
              h('td', {}, `${묶음뜻(r.A)} → ${묶음뜻(r.B)}`), h('td', { class: 'num' }, 수(r.지지도, 3)), h('td', { class: 'num' }, 수(r.신뢰도, 2)), h('td', { class: 'num' }, 수(r.향상도, 2)))))),
          h('p', { class: 'small muted' }, '아래 두 줄은 Items max 를 1 로 두고 한 활동씩 본 규칙이에요.')),
        h('div', {},
          퀴즈([
            { 질문: '폴과 제임스에게 함께 추천할 활동은?', 보기: 활동.slice(0, 4).map((a) => a[1]), 답: 최고 ? 항목들(최고.B)[0] : 3, 해설: `향상도가 ${최고 ? 수(최고.향상도, 2) : ''} 로 가장 높아요. 박물관·전통 문화를 즐긴 사람은 고궁·유적지도 함께 즐길 가능성이 아주 높아요.`, 힌트: '노란 줄의 결과(→ 뒤)를 보세요.' },
            { 질문: '향상도가 아주 높은데 **지지도가 0.001 근처** 인 규칙은 어떻게 볼까요?', 보기: ['가장 믿을 만한 규칙이다', '해당하는 사람이 너무 적어 우연일 수 있으니 조심한다'], 답: 1, 해설: '응답 몇십 개로 만들어진 규칙은 우연히 생길 수 있어요. 지지도·신뢰도·향상도를 함께 봐야 해요.' },
          ], { 열쇠: 'u7.recommend' }),
          말풍선('🧑‍🎓', '성호', '「고궁·역사 유적지 어때?」 하고 물었더니 둘 다 완벽한 선택이래! 다음 날 함께 고궁에 갔어.'))));
    }, '교재 55~56쪽'),

    카드('다른 관심사를 가진 친구라면?', '활동', (몸) => {
      const 친구들 = [[6, '🎤 K-pop 을 좋아하는 친구'], [8, '🎉 지역 축제를 좋아하는 친구'], [11, '💄 뷰티·미용에 관심 있는 친구']];
      let 지금 = 0, 신뢰 = 30;
      const 본것 = new Set();
      const 결과 = h('div', {});
      const 그리기 = () => {
        const [i] = 친구들[지금];
        const 규칙 = 규칙찾기({ 포함: 활동[i][0], 최소: 1, 최대: 1, 최소신뢰도: 신뢰 / 100 }).filter((r) => r.A === 1 << i);
        채우기(결과, 규칙.length ? 규칙표(규칙, 6) : h('p', { class: 'feedback bad' }, '규칙이 없어요. Min. conf. 를 낮춰 보세요.'));
        본것.add(지금);
        if (본것.size === 3) 마침('u7.friends');
      };
      const 탭 = h('div', { class: 'seg' }, 친구들.map(([, n], j) => h('button', { type: 'button', class: j === 0 ? 'on' : '', onclick: (e) => { 지금 = j; 탭.querySelectorAll('button').forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on'); 그리기(); } }, n)));
      그리기();
      채우기(몸,
        h('div', { class: 'row' }, 탭, 슬라이더('Min. conf.', { 최소: 10, 최대: 90, 단계: 5, 값: 신뢰, 글자: (v) => `${v}%`, 바뀜: (v) => { 신뢰 = v; 그리기(); } }).줄),
        h('div', { class: 'two wide-left' }, 결과,
          h('div', {},
            h('p', { class: 'small' }, md('기준 속성 하나만 Antecedent 에 두고(Items max 1) 규칙을 봐요. 신뢰도 70% 로는 규칙이 잘 안 나와서 기본값을 **30%** 로 낮췄어요.')),
            쓰기('u7.friend-note', { 안내: '✍️ 친구마다 추천할 활동과 그 까닭(지지도·향상도·신뢰도)을 적어 보세요.', 줄수: 5, 예시: '예) K-pop 친구 → Q8a12 뷰티/미용 (향상도 2.3, 신뢰도 0.35)' }),
            자기평가('u7.self', '연관 분석을 이용해 친구에게 여행지를 추천할 수 있다.'))));
    }, '교재 57쪽'),

    프로젝트카드('u7', '연관 분석', '내가 고른 속성과 연관된 다른 속성 사이의 지지도·신뢰도·향상도를 구하고 성능을 확인해 보세요.'),
  ],
};
