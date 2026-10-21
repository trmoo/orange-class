/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  6단원 — 프로젝트 2 「군집 분석으로 기온별 옷차림 표를 그려보자」
 *  성취기준 [12데과03-03] · 학습 요소: 군집 분석, k-평균 군집 분석 · 교과서 132~147쪽
 *  날씨 데이터는 연습용으로 새로 만든 값이다(src/data/weather.js). k-평균은 브라우저에서 실제로 계산한다.
 */
import { h, 채우기, md, 수 } from '../lib/ui.js';
import { 퀴즈, 순서, 짝짓기, 쓰기, 자기평가, 알림줄 } from '../lib/games.js';
import { 끝냄, 상태, 저장 } from '../lib/store.js';
import { 평균 } from '../lib/stats.js';
import { 히스토그램, 상자그림, 산점도, 색들 } from '../lib/chart.js';
import { 준비, k평균, 실루엣 } from '../lib/kmeans.js';
import { 흐름조립, 위젯창, 묶음상자, 라디오, 열고르기, 데이터표 } from '../lib/orange.js';
import { 카드, 말풍선, 고르기단추, 교재메모 } from './common.js';
import { 프로젝트카드 } from './project.js';
import { 날씨만들기, 속성 } from '../data/weather.js';

const 마침 = (열쇠) => { 끝냄(열쇠); document.dispatchEvent(new CustomEvent('activity-done', { detail: 열쇠 })); };

// 날씨 366일 (한 번만 만든다)
let 날씨 = null;
const 날씨들 = () => (날씨 ||= 날씨만들기());

// k 별 군집 결과를 기억해 두고 다시 쓴다 (정규화 여부까지 열쇠에 넣는다)
const 기억 = new Map();
export function 군집(k, 정규화 = true) {
  const 열쇠 = `${k}-${정규화}`;
  if (!기억.has(열쇠)) {
    const { 행들 } = 준비(날씨들().map((d) => d.값), 정규화);
    const r = k평균(행들, k, { 씨앗: 1 });
    기억.set(열쇠, { ...r, 실: 실루엣(행들, r.군집).평균 });
  }
  return 기억.get(열쇠);
}
export const 가장좋은k = () => [2, 3, 4, 5, 6, 7, 8].reduce((a, k) => (군집(k).실 > 군집(a).실 ? k : a), 2);

/** 군집마다 속성 평균과 전체 평균을 견준 화살표 (↑ 높음 · ↓ 낮음 · − 비슷) */
export function 군집특징(k) {
  const r = 군집(k), 일 = 날씨들();
  const 전체 = 속성.map((_, j) => 평균(일.map((d) => d.값[j] ?? (j === 0 ? 0 : NaN)).filter(Number.isFinite)));
  const 폭 = 속성.map((_, j) => { const v = 일.map((d) => d.값[j] ?? 0); return Math.max(...v) - Math.min(...v); });
  return Array.from({ length: k }, (_, c) => {
    const 날들 = 일.filter((_, i) => r.군집[i] === c);
    const 평 = 속성.map((_, j) => 평균(날들.map((d) => d.값[j] ?? 0)));
    const 화살 = 평.map((v, j) => { const d = (v - 전체[j]) / 폭[j]; return d > 0.12 ? '↑' : d < -0.12 ? '↓' : '−'; });
    const 달 = 날들.map((d) => Number(d.일시.slice(5, 7)));
    return { c, 수: 날들.length, 평, 화살, 비온날: 날들.filter((d) => d.값[0] !== null).length, 많은달: 최빈달(달) };
  });
}
const 최빈달 = (달들) => { const 셈 = {}; for (const m of 달들) 셈[m] = (셈[m] || 0) + 1; return Object.entries(셈).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => `${m}월`).join('·'); };

const 짧은속성 = ['강수량', '평균기온', '평균풍속', '일조합'];
const 옷들 = ['🩳 반바지', '👕 반팔', '👚 얇은 긴팔', '🧥 가디건', '🧶 니트', '🧥 코트', '🧣 패딩·목도리', '☂️ 우산', '🧢 모자', '🕶️ 선글라스', '🌬️ 바람막이', '🥾 장화'];

export default {
  id: 'u6', 번호: 6, 색: '#2fa36b', 갈래: '프로젝트 2 · 군집 분석',
  제목: '날씨와 옷차림', 부제: '군집 분석으로 기온별 옷차림 표를 그려보자',
  카드: [
    카드('재원이의 아침 고민', '이야기', (몸) => {
      채우기(몸, h('div', { class: 'two wide-left' },
        h('div', {},
          말풍선('👦', '재원', ['계절이 바뀔 때마다 옷장 앞에서 고민이야. 반팔? 긴팔? 겉옷은?', 'SNS 에서 「기온별 옷차림 표」 를 봤는데, **기온이 같아도** 바람이 불거나 비가 오면 훨씬 춥더라.']),
          말풍선('🍊', '선생님', '기온 하나가 아니라 **비·바람·햇볕** 까지 함께 보고, **비슷한 날씨끼리 묶어** 보면 어떨까? 그게 **군집 분석** 이야.')),
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
          h('p', { class: 'small muted' }, '사이트 메뉴 이름은 바뀔 수 있어요.')),
        h('div', {},
          h('p', {}, md('기온 말고도 **강수량·바람·일조일사** 자료를 같은 조건으로 받아, 필요한 열만 한 파일에 모아요. 어느 자료에서 어떤 열을 가져올까요?')),
          짝짓기([
            { 왼: '🌧️ 강수량 자료', 답: '강수량(mm)' },
            { 왼: '🌡️ 기온 자료', 답: '평균기온(°C)' },
            { 왼: '🌬️ 바람 자료', 답: '평균풍속(m/s)' },
            { 왼: '☀️ 일조일사 자료', 답: '일조합(hr)' },
          ], ['강수량(mm)', '평균기온(°C)', '평균풍속(m/s)', '일조합(hr)'], { 열쇠: 'u6.columns-pick' }),
          h('div', { class: 'tip' }, '💡 교재와 다른 속성(습도, 최저기온 등)을 골라도 좋아요!'))));
    }, '교재 37~38쪽'),

    카드('오렌지에서 위젯 흐름 만들기', '오렌지', (몸) => {
      채우기(몸,
        h('p', { class: 'small' }, md('이번 프로젝트의 **전체 위젯 흐름** 이에요. 할 일을 읽고 알맞은 위젯을 차례로 이어 보세요.')),
        흐름조립([
          { id: 'f', 위젯: 'File', 부제: '날씨', 부모: [], 할일: '모아 둔 **날씨 csv** 를 불러와요.', x: 80, y: 170 },
          { id: 'dt', 위젯: 'Data Table', 부모: ['f'], 할일: '데이터를 **표로 확인** 해요. (빈칸 ? 도 찾아봐요)', x: 240, y: 60 },
          { id: 'sc', 위젯: 'Select Columns', 부모: ['f'], 할일: '분석에 쓸 **속성만 골라요**.', x: 250, y: 260 },
          { id: 'di', 위젯: 'Distributions', 부모: ['sc'], 할일: '속성마다 **분포(히스토그램)** 를 봐요.', x: 440, y: 120 },
          { id: 'km', 위젯: 'k-Means', 부모: ['sc'], 할일: '비슷한 날끼리 **k 개 군집으로 묶어요**.', x: 450, y: 280 },
          { id: 'bp', 위젯: 'Box Plot', 부모: ['km'], 할일: '군집마다 속성의 **상자그림** 을 견줘요.', x: 660, y: 200 },
          { id: 'd2', 위젯: 'Distributions', 부제: '군집별', 부모: ['km'], 할일: '군집별 색으로 **분포** 를 다시 봐요.', x: 680, y: 320 },
        ], { 열쇠: 'u6.flow', 팔레트: ['File', 'Data Table', 'Select Columns', 'Merge Data', 'Scatter Plot', 'Distributions', 'Box Plot', 'Linear Regression', 'k-Means', 'Test and Score'], 높이: 370, 너비: 860 }));
    }, '교재 39~43쪽'),

    카드('Data Table — 데이터 살펴보기', '오렌지', (몸) => {
      const 일 = 날씨들();
      const 빈칸 = 일.filter((d) => d.값[0] === null).length;
      채우기(몸, h('div', { class: 'two wide-left' },
        데이터표(['일시', ...속성], 일.map((d) => [d.일시, ...d.값]), { 최대행: 10, 메타: [0], 설명: `${일.length} instances · 4 features · 일시(meta)` }),
        h('div', {},
          h('p', {}, md(`연습 데이터는 **${일.length}일** (2024년은 윤년!) × **4개 속성** 이에요. 강수량 칸에 **?** 가 많지요?`)),
          퀴즈([
            { 질문: `강수량이 ? 인 날이 ${빈칸}일이에요. 이 빈칸은 무엇일 가능성이 높을까요?`, 보기: ['측정을 못 한 날', '비가 오지 않은 날'], 답: 1, 해설: '이 연습 데이터는 비가 안 온 날을 빈칸으로 두었어요. 실제 자료도 그런지는 **메타 데이터(자료 설명)** 로 꼭 확인해야 해요.', 힌트: '366일 가운데 비 오는 날이 얼마나 될지 생각해 보세요.' },
            { 질문: '빈칸의 뜻이 「0mm」 라면 알맞은 처리는?', 보기: ['평균으로 채운다', '0 으로 채운다', '그 날을 지운다'], 답: 1, 해설: '평균(약 10mm)으로 채우면 비 안 온 날이 비 온 날처럼 바뀌어요. 다음다음 카드에서 그 차이를 직접 봐요.' },
          ], { 열쇠: 'u6.missing' }))));
    }, '교재 39쪽'),

    카드('Select Columns — 쓸 속성 고르기', '오렌지', (몸) => {
      채우기(몸, h('div', { class: 'two wide-left' },
        열고르기(['일시', ...속성], { 일시: 'Metas', ...Object.fromEntries(속성.map((k) => [k, 'Features'])) }, { 열쇠: 'u6.select', 처음: { 일시: 'Features', ...Object.fromEntries(속성.map((k) => [k, 'Features'])) } }),
        h('div', {},
          h('p', {}, md('군집은 **네 기상 요소** 로 만들어요. 날짜(일시)는 계산에 쓰지 않으니 **Metas** 로 옮겨요.')),
          h('div', { class: 'tip' }, md('💡 군집 분석에는 **Target(종속 변수)이 없어요.** 정답 없이 비슷한 것끼리 묶기만 하기 때문이에요. 회귀 분석과 가장 다른 점이에요.')))));
    }, '교재 39~40쪽'),

    카드('Distributions — 분포 살펴보기', '오렌지', (몸) => {
      const 일 = 날씨들();
      let 속성번호 = 0, 구간 = 14;
      const 그림 = h('div', {}), 설명 = h('div', {});
      const 그리기 = () => {
        const 값들 = 일.map((d) => d.값[속성번호]).filter((v) => v !== null);
        채우기(그림, 히스토그램([{ 이름: 속성[속성번호], 값들, 색: '#2fa36b' }], { 구간수: 구간, x이름: 속성[속성번호], 너비: 520, 높이: 300 }).svg);
        채우기(설명, h('p', {}, md([
          `비 온 날만 보면 대부분 **0~10mm** 인데 **${수(Math.max(...값들), 0)}mm** 같은 큰비도 있어요. 오른쪽으로 꼬리가 길어요.`,
          '겨울(영하)부터 한여름(30℃ 가까이)까지 **넓게** 퍼져 있어요. 봉우리가 둘인 것 같기도 하지요?',
          `대부분 **2m/s 근처** 에 몰려 있고, **5m/s 이상** 인 날은 ${값들.filter((v) => v >= 5).length}일뿐이에요.`,
          '해가 거의 안 난 날(비 온 날)과 맑은 날로 나뉘는 모습이 보여요.',
        ][속성번호])));
        if (속성번호 > 0) 마침('u6.dist');
      };
      그리기();
      채우기(몸, h('div', { class: 'two wide-right' },
        h('div', {},
          위젯창('Distributions',
            묶음상자('Variable', 고르기단추(짧은속성, 0, (i) => { 속성번호 = i; 그리기(); })),
            h('label', { class: 'slider-row' }, 'Bin width', (() => { const r = h('input', { type: 'range', min: 5, max: 30, value: 구간 }); r.addEventListener('input', () => { 구간 = Number(r.value); 그리기(); }); return r; })())),
          설명,
          h('p', { class: 'small muted' }, '💡 Distributions 에서 Fitted distribution 을 Normal 로 고르면 정규분포 곡선을 겹쳐 볼 수 있어요.')),
        그림));
    }, '교재 39~40쪽'),

    카드('k-Means — 몇 개로 묶을까?', '오렌지', (몸) => {
      const 최고 = 가장좋은k();
      let 정규화 = true, 고른k = 최고;
      const 목록 = h('div', {}), 그림 = h('div', {}), 줄 = 알림줄();
      const 그리기 = () => {
        const 결과들 = [2, 3, 4, 5, 6, 7, 8].map((k) => ({ k, 실: 군집(k, 정규화).실 }));
        const 최고k = 결과들.reduce((a, b) => (b.실 > a.실 ? b : a)).k;
        채우기(목록, h('table', { class: 'kv small sil-table' }, h('tbody', {}, 결과들.map(({ k, 실 }) => h('tr', { class: `${k === 고른k ? 'hl' : ''} clickable`, onclick: () => { 고른k = k; 그리기(); } },
          h('td', {}, k), h('td', { class: 'num' }, 수(실, 3)), h('td', { style: { width: '55%' } }, h('span', { class: 'silbar', style: { width: `${Math.max(0, 실) * 100}%`, background: k === 최고k ? '#ef7d12' : '#9db8d6' } })))))));
        const r = 군집(고른k, 정규화), 일 = 날씨들();
        채우기(그림, 산점도(일.map((d, i) => ({ x: d.값[1], y: d.값[2], 색: 색들[r.군집[i]] })), { x이름: '평균기온(°C)', y이름: '평균풍속(m/s)', 너비: 460, 높이: 250, 반지름: 4 }).svg,
          h('div', { class: 'legend' }, Array.from({ length: 고른k }, (_, c) => h('span', { style: { '--c': 색들[c] } }, `C${c + 1} (${r.군집.filter((g) => g === c).length}일)`))));
        if (!정규화) 줄.틀림('정규화를 끄면 숫자 범위가 큰 속성(강수량 0~150)이 거리를 좌우해요. 군집이 거의 「비가 많이 온 날 / 나머지」 로만 갈려요.');
        else 줄.알림(`실루엣 계수가 가장 높은 것은 **k = ${최고k}** 예요. 표의 줄을 누르면 그 k 로 묶은 결과를 볼 수 있어요.`);
        if (정규화) 마침('u6.kmeans');
      };
      const 상자 = h('input', { type: 'checkbox', checked: true });
      상자.addEventListener('change', () => { 정규화 = 상자.checked; 그리기(); });
      그리기();
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          위젯창('k-Means',
            묶음상자('Number of Clusters', h('label', { class: 'ow-radio' }, h('input', { type: 'radio', disabled: true }), ' Fixed: 3'), h('label', { class: 'ow-radio' }, h('input', { type: 'radio', checked: true, disabled: true }), ' From 2 to 8')),
            묶음상자('Preprocessing', h('label', { class: 'ow-radio' }, 상자, ' Normalize columns')),
            묶음상자('Silhouette Scores', 목록)),
          줄),
        h('div', {}, 그림,
          교재메모(`교재의 실제 서울 자료에서는 **k = 7** 이 가장 높았어요. 이 연습 데이터에서는 **k = ${최고}** 예요. 데이터가 다르면 알맞은 k 도 달라져요. 실루엣이 가장 높지 않아도 쓰기 편한 k 를 고를 수 있어요.`))));
    }, '교재 41쪽'),

    카드('Normalize columns 와 빈칸 처리', '개념', (몸) => {
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          h('p', { class: 'lead' }, md('1단원에서 「k-평균 전에는 정규화가 필요하다」 고 배웠지요. 그런데 오렌지 흐름에는 정규화 위젯이 없었어요. 왜일까요?')),
          h('div', { class: 'concept' }, md('오렌지 3.40 의 **k-Means** 위젯 안에 **Normalize columns** 칸이 있고, **처음부터 켜져 있어요**. 위젯이 계산하기 전에 속성마다 평균 0·표준편차 1 로 바꿔 줘요.')),
          h('div', { class: 'warn' }, md('그리고 빈칸(?)은 위젯이 **그 속성의 평균으로** 채워서 계산해요. 강수량의 빈칸이 「비가 안 온 날」 이라면, 비 안 온 날이 평균만큼 비가 온 날로 계산되는 셈이에요.'))),
        h('div', {},
          h('p', {}, md('빈칸을 0 으로 채우고 싶다면 k-Means 앞에 **Impute** 위젯을 붙여요.')),
          위젯창('Impute', 묶음상자('Default Method', 라디오('imp', ["Don't impute", 'Average/Most frequent', 'Fixed values; numeric variables:'], 2, () => {}), h('div', { class: 'small muted' }, '→ 값에 0 을 넣는다'))),
          퀴즈([{ 질문: '강수량 빈칸을 0 으로 채우는 Impute 위젯은 흐름의 어디에 둘까요?', 보기: ['Select Columns 와 k-Means 사이', 'k-Means 와 Box Plot 사이'], 답: 0, 해설: '군집을 계산하기 전에 빈칸을 채워야 해요.' }], { 열쇠: 'u6.impute' }),
          h('p', { class: 'small muted' }, '이 앱의 군집 계산도 오렌지와 똑같이 빈칸을 평균으로 채워요(교재 따라 하기). 0 으로 채우는 것은 스스로 해 볼 거리로 남겨요.'))));
    }, '교재 41쪽'),

    카드('Box Plot — 군집마다 어떤 날씨일까?', '오렌지', (몸) => {
      const k = 가장좋은k();
      const r = 군집(k), 일 = 날씨들();
      let 속성번호 = 1;
      const 그림 = h('div', {});
      const 그리기 = () => {
        채우기(그림, 상자그림(Array.from({ length: k }, (_, c) => ({ 이름: `C${c + 1}`, 값들: 일.filter((_, i) => r.군집[i] === c).map((d) => d.값[속성번호] ?? 0), 색: 색들[c] })), { x이름: `${속성[속성번호]}${속성번호 === 0 ? ' (빈칸은 0으로 표시)' : ''}`, 너비: 560 }).svg);
        if (속성번호 !== 1) 마침('u6.boxplot');
      };
      그리기();
      const 특징 = 군집특징(k);
      채우기(몸, h('div', { class: 'two wide-left' },
        h('div', {}, 위젯창('Box Plot', 묶음상자('Variable', 고르기단추(짧은속성, 1, (i) => { 속성번호 = i; 그리기(); })), h('div', { class: 'small' }, 'Subgroups: ', h('b', {}, 'Cluster'))), 그림),
        h('div', {},
          h('p', { class: 'small' }, md('속성을 바꿔 가며 군집마다 상자가 어디 있는지 보세요. 전체 평균보다 높으면 ↑, 낮으면 ↓ 로 정리했어요.')),
          h('table', { class: 'kv small' }, h('thead', {}, h('tr', {}, h('th', {}, ''), 짧은속성.map((t) => h('th', { class: 'center' }, t)), h('th', {}, '많은 달'))),
            h('tbody', {}, 특징.map((f) => h('tr', {}, h('th', { style: { color: 색들[f.c] } }, `C${f.c + 1}`), f.화살.map((a) => h('td', { class: 'center' }, a)), h('td', { class: 'small' }, f.많은달))))),
          h('p', { class: 'small muted' }, '💡 Distributions 위젯의 Split by 에 Cluster 를 고르고 Show probabilities 를 켜면, 「5m/s 이상인 날은 모두 어느 군집인지」 같은 비율도 볼 수 있어요.'))));
    }, '교재 41~43쪽'),

    카드('나만의 옷차림 표 만들기', '활동', (몸) => {
      const k = 가장좋은k();
      const 특징 = 군집특징(k);
      const 표 = (상태.notes['u6.outfit'] ||= {});
      const 줄 = 알림줄();
      const 칸들 = 특징.map((f) => {
        const 이름칸 = h('input', { type: 'text', class: 'blank', style: { width: '100%', textAlign: 'left' }, value: 표[`n${f.c}`] || '', placeholder: '군집 이름 (예: 쌀쌀한 바람)' });
        이름칸.addEventListener('input', () => { 표[`n${f.c}`] = 이름칸.value; 저장(); });
        const 옷칸 = h('div', { class: 'outfits' }, 옷들.map((o) => {
          const 켬 = (표[`o${f.c}`] || []).includes(o);
          return h('button', {
            type: 'button', class: `chip small${켬 ? ' picked' : ''}`,
            onclick: (e) => {
              const 목록 = (표[`o${f.c}`] ||= []);
              const i = 목록.indexOf(o);
              if (i >= 0) 목록.splice(i, 1); else 목록.push(o);
              e.currentTarget.classList.toggle('picked'); 저장();
              if (특징.every((g) => (표[`o${g.c}`] || []).length)) { 줄.맞음('모든 군집에 옷을 골랐어요! 인쇄하거나 화면을 캡처해 친구와 나눠 보세요.'); 마침('u6.outfit'); }
            },
          }, o);
        }));
        return h('div', { class: 'outfit-card', style: { borderColor: 색들[f.c] } },
          h('div', { class: 'outfit-head', style: { background: 색들[f.c] } }, `C${f.c + 1} · ${f.수}일 · ${f.많은달}`),
          h('div', { class: 'small' }, `기온 ${수(f.평[1], 1)}℃ · 바람 ${수(f.평[2], 1)}m/s · 일조 ${수(f.평[3], 1)}h · 비 온 날 ${f.비온날}일`),
          이름칸, 옷칸);
      });
      채우기(몸,
        h('p', { class: 'small' }, md('군집마다 날씨를 보고 **이름을 붙이고, 어울리는 옷을 골라** 나만의 옷차림 표를 완성하세요. (이 브라우저에 저장돼요)')),
        h('div', { class: 'outfit-grid' }, 칸들), 줄,
        h('div', { class: 'row end' }, h('button', { type: 'button', class: 'btn small', onclick: () => window.print() }, '🖨️ 인쇄')));
    }, '교재 43~45쪽'),

    카드('계절마다 체감온도가 다르다', '활동', (몸) => {
      채우기(몸, h('div', { class: 'two' },
        h('div', {},
          말풍선('👦', '재원', '같은 10℃ 라도 바람 부는 날은 훨씬 춥고, 여름엔 습하면 더 덥더라. **강설량·습도·일교차** 도 넣어 볼까?'),
          h('div', { class: 'concept' }, md('**체감온도** 는 기온만이 아니라 사람이 실제로 느끼는 더위·추위를 나타내요. 우리나라는 계절마다 차이가 커서 계절별로 따로 분석해 볼 만해요.')),
          쓰기('u6.season', { 안내: '✍️ 내가 분석해 보고 싶은 계절과, 그때 넣을 속성은?', 줄수: 3, 예시: '예) 겨울 — 평균기온, 평균풍속, 최저기온, 적설' })),
        h('div', {},
          짝짓기([
            { 왼: '☀️ 여름(하절기) 체감온도에 함께 쓰는 것', 답: '기온과 습도' },
            { 왼: '❄️ 겨울(동절기) 체감온도에 함께 쓰는 것', 답: '기온과 풍속' },
          ], ['기온과 습도', '기온과 풍속', '기온과 강수량'], { 열쇠: 'u6.feel' }),
          h('p', { class: 'small muted' }, '인터넷에서 「체감온도 계산」 을 찾아 확인해 보세요. (기상청 날씨누리 등)'),
          자기평가('u6.self', '군집 분석을 이용해 날씨별 옷차림 인포그래픽을 그릴 수 있다.'))));
    }, '교재 44~45쪽'),

    프로젝트카드('u6', '군집 분석', '최적의 군집 개수를 찾아보고, 성능(실루엣 계수 등)을 확인해 보세요.'),
  ],
};
