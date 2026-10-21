/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  오렌지 3.40 흉내 부품 — 위젯 아이콘 · 위젯 설정 창 · 위젯 흐름 조립기 · Select Columns · 데이터 표.
 *  ※ 오렌지 화면을 캡처해 쓰지 않고 모양만 비슷하게 새로 그렸다.
 *    위젯 이름과 설정 글자는 오렌지 3.40.0 소스 코드에 적힌 그대로다.
 */
import { h, s, 채우기, md } from './ui.js';
import { 알림줄 } from './games.js';
import { 끝냄 } from './store.js';

// 위젯 → [갈래, 그림 글자]. 갈래 색은 오렌지 위젯 상자의 갈래 색을 따랐다.
const 갈래색 = { Data: '#ffd39f', Transform: '#ff9d5e', Visualize: '#ffb7b1', Model: '#fac1d9', Evaluate: '#c3f3f3', Unsupervised: '#cae1ef', Associate: '#e2d4f6' };
export const 위젯목록 = {
  'File': ['Data', '📄'], 'Data Table': ['Data', '🗒️'], 'Feature Statistics': ['Data', '📋'],
  'Merge Data': ['Transform', '🔗'], 'Select Columns': ['Transform', '▥'], 'Select Rows': ['Transform', '☰'],
  'Data Sampler': ['Transform', '🎲'], 'Preprocess': ['Transform', '🧹'], 'Discretize': ['Transform', '✂️'], 'Impute': ['Transform', '🩹'],
  'Scatter Plot': ['Visualize', '⁘'], 'Distributions': ['Visualize', '📊'], 'Box Plot': ['Visualize', '⊟'],
  'Linear Regression': ['Model', '📈'], 'Test and Score': ['Evaluate', '🎯'], 'Predictions': ['Evaluate', '🔮'],
  'k-Means': ['Unsupervised', '⊙'], 'Frequent Itemsets': ['Associate', '🧺'], 'Association Rules': ['Associate', '🔀'],
};

/** 위젯 아이콘 (동그라미 + 이름) */
export function 위젯(이름, { 작게 = false, 부제 = '' } = {}) {
  const [갈래, 그림] = 위젯목록[이름] || ['Data', '❔'];
  return h('span', { class: `ow-widget${작게 ? ' small' : ''}`, title: `${이름} (${갈래})` },
    h('span', { class: 'ow-icon', style: { background: 갈래색[갈래] } }, 그림),
    h('span', { class: 'ow-name' }, 이름, 부제 ? h('small', {}, 부제) : null));
}

/** 위젯 이름을 본문 글 속에 짧게 넣을 때 */
export const 위젯글 = (이름) => h('span', { class: 'ow-inline' }, h('span', { class: 'ow-dot', style: { background: 갈래색[(위젯목록[이름] || ['Data'])[0]] } }), 이름);

/** 위젯 설정 창 — 오렌지 창처럼 제목 막대가 있는 상자 */
export function 위젯창(이름, ...내용) {
  const [갈래, 그림] = 위젯목록[이름] || ['Data', '❔'];
  return h('div', { class: 'ow-window' },
    h('div', { class: 'ow-title' }, h('span', { class: 'ow-icon tiny', style: { background: 갈래색[갈래] } }, 그림), ` ${이름}`, h('span', { class: 'ow-ver' }, 'Orange 3.40')),
    h('div', { class: 'ow-body' }, 내용));
}

/** 설정 창 속 묶음 상자 (오렌지의 회색 테두리 상자) */
export const 묶음상자 = (제목, ...내용) => h('fieldset', { class: 'ow-box' }, h('legend', {}, 제목), 내용);

/** 오렌지식 라디오 단추 묶음 → 고른 값을 바꿀 때마다 바뀜(값) 호출 */
export function 라디오(이름, 선택지, 처음, 바뀜) {
  return h('div', { class: 선택지.length > 4 ? 'ow-radios cols2' : 'ow-radios' }, 선택지.map((글, i) => {
    const 단추 = h('input', { type: 'radio', name: 이름, value: i, checked: i === 처음 });
    단추.addEventListener('change', () => 바뀜(i));
    return h('label', { class: 'ow-radio' }, 단추, ' ', 글);
  }));
}

/**
 * 위젯 흐름 조립기.
 * 단계: [{ id, 위젯, 부제?, 부모: [id...], 할일: '두 파일을 하나로 합쳐요', x, y, 신호? }]
 * 위젯 상자(팔레트)에서 알맞은 위젯을 차례로 눌러 캔버스에 놓는다. 틀리면 힌트를 준다.
 */
export function 흐름조립(단계들, { 열쇠, 팔레트, 높이 = 300, 너비 = 900, 다됨, 미리 = [] } = {}) {
  let 지금 = 0;
  const 줄 = 알림줄();
  const 캔버스 = s('svg', { viewBox: `0 0 ${너비} ${높이}`, class: 'ow-canvas' });
  const 할일줄 = h('div', { class: 'flow-task' });
  const 상자들 = h('div', { class: 'ow-palette' });
  const 놓인 = new Map();
  const 목록 = 팔레트 || [...new Set(단계들.map((d) => d.위젯))].sort();

  function 노드그리기(d) {
    const [갈래, 그림] = 위젯목록[d.위젯];
    for (const p of d.부모) {
      const a = 놓인.get(p);
      const 선 = s('path', { d: `M${a.x + 30},${a.y} C${(a.x + d.x) / 2},${a.y} ${(a.x + d.x) / 2},${d.y} ${d.x - 30},${d.y}`, class: 'ow-link' });
      캔버스.prepend(선);
      if (d.신호?.[p]) 캔버스.append(s('text', { x: (a.x + d.x) / 2, y: (a.y + d.y) / 2 - 8, class: 'ow-link-label', 'text-anchor': 'middle' }, d.신호[p]));
    }
    캔버스.append(s('g', { class: 'ow-node' },
      s('circle', { cx: d.x, cy: d.y, r: 28, fill: 갈래색[갈래], stroke: '#888', 'stroke-width': 1.5 }),
      s('text', { x: d.x, y: d.y + 8, 'text-anchor': 'middle', class: 'ow-node-icon' }, 그림),
      s('text', { x: d.x, y: d.y + 48, 'text-anchor': 'middle', class: 'ow-node-name' }, d.부제 ? `${d.위젯} (${d.부제})` : d.위젯)));
    놓인.set(d.id, d);
  }

  function 갱신() {
    if (지금 >= 단계들.length) {
      채우기(할일줄, '✅ 위젯 흐름을 모두 이었습니다!');
      줄.맞음('오렌지에서도 이 순서대로 위젯을 놓고 선을 이으면 됩니다.');
      if (열쇠) { 끝냄(열쇠); document.dispatchEvent(new CustomEvent('activity-done', { detail: 열쇠 })); }
      다됨?.();
      return;
    }
    const d = 단계들[지금];
    const 앞 = d.부모.map((p) => { const x = 놓인.get(p); return x.부제 ? `${x.위젯} (${x.부제})` : x.위젯; });
    채우기(할일줄, h('b', {}, `${지금 + 1}/${단계들.length} `), md(d.할일), 앞.length ? h('span', { class: 'muted' }, ` ← ${앞.join(' + ')} 에 이어 붙여요`) : null);
  }

  채우기(상자들, 목록.map((이름) => h('button', {
    type: 'button', class: 'ow-pal-btn',
    onclick: () => {
      if (지금 >= 단계들.length) return;
      const d = 단계들[지금];
      if (이름 === d.위젯) { 노드그리기(d); 지금++; 줄.지우기(); 갱신(); }
      else 줄.틀림(d.힌트 || `「${이름}」 위젯이 하는 일과 지금 할 일을 견주어 보세요.`);
    },
  }, 위젯(이름, { 작게: true }))));
  // 지난 프로젝트에서 이미 놓아 둔 위젯은 처음부터 그려 둔다
  for (const d of 미리) 노드그리기(d);
  갱신();
  return h('div', { class: 'flow-builder' },
    h('div', { class: 'flow-left' }, h('div', { class: 'ow-pal-title' }, '위젯 상자'), 상자들),
    h('div', { class: 'flow-right' }, 할일줄, 캔버스, 줄));
}

/**
 * Select Columns 연습 — 속성을 눌러 고른 뒤 네 상자 중 하나를 누른다.
 * 답: { 속성이름: 'Features' | 'Target' | 'Metas' | 'Ignored' }  (답에 없는 속성은 Ignored)
 */
export function 열고르기(속성들, 답, { 열쇠, 처음 = {} } = {}) {
  const 상자이름 = ['Ignored', 'Features', 'Target', 'Metas'];
  const 설명 = { Ignored: '쓰지 않음', Features: '독립 변수', Target: '종속 변수', Metas: '설명용 (계산에 안 씀)' };
  const 자리 = Object.fromEntries(속성들.map((a) => [a, 처음[a] || 'Ignored']));
  let 고른 = null;
  const 줄 = 알림줄();
  const 몸 = h('div', { class: 'selcols' });
  function 그리기() {
    채우기(몸, 상자이름.map((b) => h('div', {
      class: `selcol-box${고른 ? ' ready' : ''}`, role: 'button', tabindex: 0,
      onclick: () => { if (고른) { 자리[고른] = b; 고른 = null; 그리기(); } },
    }, h('div', { class: 'selcol-title' }, b, h('small', {}, ` ${설명[b]}`)),
    h('div', { class: 'selcol-list' }, 속성들.filter((a) => 자리[a] === b).map((a) => h('button', {
      type: 'button', class: `attr${고른 === a ? ' picked' : ''}`,
      onclick: (e) => { e.stopPropagation(); 고른 = 고른 === a ? null : a; 그리기(); },
    }, a))))));
  }
  그리기();
  return h('div', {},
    위젯창('Select Columns', h('p', { class: 'muted small' }, '속성을 누른 뒤 옮길 상자를 누르세요.'), 몸,
      h('div', { class: 'row end' }, h('button', {
        type: 'button', class: 'btn primary',
        onclick: () => {
          const 틀림 = 속성들.filter((a) => 자리[a] !== (답[a] || 'Ignored'));
          if (!틀림.length) {
            줄.맞음('알맞게 옮겼습니다!');
            if (열쇠) { 끝냄(열쇠); document.dispatchEvent(new CustomEvent('activity-done', { detail: 열쇠 })); }
          } else 줄.틀림(`「${틀림[0]}」 속성의 자리를 다시 생각해 보세요.`);
        },
      }, '정답 확인'))),
    줄);
}

/**
 * 데이터 표 (오렌지 Data Table 모양). 빈칸(null)은 '?' 로 보인다.
 * 열: 속성 이름 목록, 행: 값 배열의 배열. 메타: 메타 속성 열 번호 목록(회색으로)
 */
export function 데이터표(열, 행, { 최대행 = 8, 메타 = [], 대상 = [], 강조행 = [], 설명 } = {}) {
  const 보일행 = 행.slice(0, 최대행);
  return h('div', { class: 'ow-table-wrap' },
    h('table', { class: 'ow-table' },
      h('thead', {}, h('tr', {}, h('th', {}, ''), 열.map((c, j) => h('th', { class: 메타.includes(j) ? 'meta' : 대상.includes(j) ? 'target' : '' }, c)))),
      h('tbody', {}, 보일행.map((r, i) => h('tr', { class: 강조행.includes(i) ? 'hl' : '' }, h('td', { class: 'rowno' }, i + 1),
        r.map((v, j) => h('td', { class: `${메타.includes(j) ? 'meta' : 대상.includes(j) ? 'target' : ''}${v === null || v === undefined ? ' missing' : ''}` }, v === null || v === undefined ? '?' : v)))))),
    h('div', { class: 'ow-table-foot' }, 설명 || `${행.length.toLocaleString()} instances · ${열.length - 메타.length} features${메타.length ? ` · ${메타.length} meta` : ''}`,
      행.length > 최대행 ? ` (앞 ${최대행}줄만 보임)` : ''));
}
