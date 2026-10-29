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

/**
 * 위젯 설정 창 — 오렌지 창처럼 제목 막대가 있는 상자.
 * 이름 대신 { 이름: 'Merge Data', 제목: '데이터 병합(열/조인) (Merge Data)' } 를 주면 제목 막대에 한국어판 이름을 쓴다.
 * 작게: true 면 안쪽 여백을 줄인다(한 카드에 그림·물음·표를 함께 둘 때).
 */
export function 위젯창(이름, ...내용) {
  const { 이름: 위젯이름, 제목, 작게 } = typeof 이름 === 'string' ? { 이름, 제목: 이름 } : 이름;
  const [갈래, 그림] = 위젯목록[위젯이름] || ['Data', '❔'];
  return h('div', { class: `ow-window${작게 ? ' compact' : ''}` },
    h('div', { class: 'ow-title' }, h('span', { class: 'ow-icon tiny', style: { background: 갈래색[갈래] } }, 그림), ` ${제목}`, h('span', { class: 'ow-ver' }, 'Orange 3.40')),
    h('div', { class: 'ow-body' }, 내용));
}

/**
 * 위젯 연결도 — 이미 이어 둔 위젯 흐름을 그림으로만 보여 준다(조립 활동 없이).
 * 위젯들: [{ id, 위젯, 이름줄: ['파일 불러오기 (File)'], x, y }]
 * 선들: [{ 부터: id, 까지: id, 글: '데이터 (Data)' }]
 */
export function 위젯연결도(위젯들, 선들, { 너비 = 330, 높이 = 230, 키 = 190 } = {}) {
  const 자리 = new Map(위젯들.map((d) => [d.id, d]));
  const 그림판 = s('svg', { viewBox: `0 0 ${너비} ${높이}`, class: 'ow-canvas', style: `height:${키}px` });
  for (const { 부터, 까지, 글 } of 선들) {
    const a = 자리.get(부터), b = 자리.get(까지);
    const 가운데 = (a.x + b.x) / 2;
    그림판.append(s('path', { d: `M${a.x + 30},${a.y} C${가운데},${a.y} ${가운데},${b.y} ${b.x - 30},${b.y}`, class: 'ow-link' }));
    if (글) 그림판.append(s('text', { x: 가운데, y: (a.y + b.y) / 2 - 8, class: 'ow-link-label', 'text-anchor': 'middle' }, 글));
  }
  for (const d of 위젯들) {
    const [갈래, 그림] = 위젯목록[d.위젯] || ['Data', '❔'];
    그림판.append(s('g', { class: 'ow-node' },
      s('circle', { cx: d.x, cy: d.y, r: 28, fill: 갈래색[갈래], stroke: '#888', 'stroke-width': 1.5 }),
      s('text', { x: d.x, y: d.y + 8, 'text-anchor': 'middle', class: 'ow-node-icon' }, 그림),
      (d.이름줄 || [d.위젯]).map((줄, i) => s('text', { x: d.x, y: d.y + 46 + i * 15, 'text-anchor': 'middle', class: 'ow-node-name' }, 줄))));
  }
  return 그림판;
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
  // 위젯 이름은 동그라미 중심에서 48 아래에 적힌다. 맨 아래 위젯의 이름이 캔버스 밖으로 잘리면,
  // 그만큼을 먼저 맨 위 위젯 위쪽의 빈자리에서 가져오고(캔버스 키가 그대로라 카드가 넘치지 않는다), 모자라면 키를 늘린다.
  const 높이들 = [...단계들, ...미리].map((d) => d.y);
  const 넘침 = Math.max(0, Math.max(...높이들) + 58 - 높이);
  const 위 = Math.min(넘침, Math.max(0, Math.min(...높이들) - 40));
  const 캔버스 = s('svg', { viewBox: `0 ${위} ${너비} ${높이 + 넘침 - 위}`, class: 'ow-canvas' });
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
 * Select Columns 연습 — 속성을 골라 네 상자 중 하나로 옮긴다.
 *  · 누르면 하나를 고르고, 누른 채 끌면 같은 상자 안에서 여러 개를 한꺼번에 고른다(오렌지의 목록과 같다).
 *  · Ctrl 을 누른 채 누르면 하나씩 더하거나 빼고, Shift 를 누른 채 누르면 그 사이를 모두 고른다.
 *  · 고른 속성은 옮길 상자를 누르거나, 고른 것을 끌어다 상자에 놓으면 옮겨진다.
 *  마우스와 전자칠판(터치)이 같은 포인터 이벤트로 돈다.
 * 답: { 속성이름: 'Features' | 'Target' | 'Metas' | 'Ignored' }  (답에 없는 속성은 Ignored)
 */
export function 열고르기(속성들, 답, { 열쇠, 처음 = {} } = {}) {
  const 상자이름 = ['Ignored', 'Features', 'Target', 'Metas'];
  const 설명 = { Ignored: '쓰지 않음', Features: '독립 변수', Target: '종속 변수', Metas: '설명용 (계산에 안 씀)' };
  const 자리 = Object.fromEntries(속성들.map((a) => [a, 처음[a] || 'Ignored']));
  const 고른 = new Set();
  let 기준 = null;    // Shift 로 범위를 잡을 때 시작하는 속성
  let 끌기 = null;    // 누르고 있는 동안: { 모드: '고르기' | '옮기기', 시작, x, y, 움직임 }
  let 방금끎 = false; // 끌기가 막 끝났을 때 뒤따르는 click 으로 엉뚱하게 옮기지 않게
  const 칩 = new Map(), 상자칸 = new Map();
  const 줄 = 알림줄();
  // 움직임·뗌은 몸 전체에서 받는다 — 붙잡은 단추에서 올라오는 것도, 다른 상자 위의 것도 모두 여기로 온다
  const 몸 = h('div', { class: 'selcols', onpointermove: (e) => 움직일때(e), onpointerup: (e) => 뗐을때(e), onpointercancel: () => { 끌기 = null; 놓을곳지우기(); } });
  const 같은상자 = (b) => 속성들.filter((a) => 자리[a] === b);
  // 같은 상자 안에서 a 부터 z 까지(화면 차례대로) 이어진 속성들
  const 범위 = (a, z) => {
    const 목록 = 같은상자(자리[a]);
    const [i, j] = [목록.indexOf(a), 목록.indexOf(z)].sort((p, q) => p - q);
    return 목록.slice(i, j + 1);
  };
  const 아래 = (e, 고를것) => document.elementFromPoint(e.clientX, e.clientY)?.closest?.(고를것);
  // 다시 그리지 않고 색만 바꾼다 — 끄는 도중에 단추가 바뀌면 포인터를 놓친다
  const 표시 = () => {
    for (const [a, el] of 칩) el.classList.toggle('picked', 고른.has(a));
    for (const el of 상자칸.values()) el.classList.toggle('ready', 고른.size > 0);
  };
  const 놓을곳지우기 = () => { for (const el of 상자칸.values()) el.classList.remove('drop'); };
  const 옮기기 = (b) => { for (const a of 고른) 자리[a] = b; 고른.clear(); 기준 = null; 그리기(); 줄.지우기(); };

  function 눌렀을때(e, a) {
    if (e.button > 0) return;
    e.preventDefault(); // 끄는 동안 글자가 칠해지지 않게
    if (e.ctrlKey || e.metaKey) { if (고른.has(a)) 고른.delete(a); else 고른.add(a); 기준 = a; 표시(); return; }
    if (e.shiftKey && 기준 && 자리[기준] === 자리[a]) { 고른.clear(); for (const k of 범위(기준, a)) 고른.add(k); 표시(); return; }
    const 모드 = 고른.has(a) ? '옮기기' : '고르기';
    if (모드 === '고르기') { 고른.clear(); 고른.add(a); 기준 = a; 표시(); }
    끌기 = { 모드, 시작: a, x: e.clientX, y: e.clientY, 움직임: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 붙잡지 못해도 몸에서 이벤트를 받는다 */ }
  }
  function 움직일때(e) {
    if (!끌기) return;
    if (!끌기.움직임 && Math.hypot(e.clientX - 끌기.x, e.clientY - 끌기.y) < 5) return;
    끌기.움직임 = true;
    if (끌기.모드 === '고르기') {
      const z = 아래(e, '.attr')?.dataset.attr;
      if (z && 자리[z] === 자리[끌기.시작]) { 고른.clear(); for (const k of 범위(끌기.시작, z)) 고른.add(k); 표시(); }
    } else {
      const 상 = 아래(e, '.selcol-box');
      for (const el of 상자칸.values()) el.classList.toggle('drop', el === 상);
    }
  }
  function 뗐을때(e) {
    if (!끌기) return;
    const { 모드, 움직임, 시작: a } = 끌기;
    끌기 = null;
    놓을곳지우기();
    if (움직임) { 방금끎 = true; setTimeout(() => { 방금끎 = false; }, 0); }
    if (모드 !== '옮기기') return;
    if (움직임) {
      const b = 아래(e, '.selcol-box')?.dataset.box;
      if (b) 옮기기(b);
      return;
    }
    // 이미 고른 것을 그냥 누르면: 하나만 골라 있었으면 풀고, 여럿이면 그것 하나만 남긴다
    if (고른.size === 1) { 고른.clear(); 기준 = null; } else { 고른.clear(); 고른.add(a); 기준 = a; }
    표시();
  }

  function 그리기() {
    칩.clear(); 상자칸.clear();
    채우기(몸, 상자이름.map((b) => {
      const 칸 = h('div', {
        class: 'selcol-box', role: 'button', tabindex: 0, 'data-box': b, 'aria-label': `${b} 상자로 옮기기`,
        onclick: () => { if (!방금끎 && 고른.size) 옮기기(b); },
        onkeydown: (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && 고른.size) { e.preventDefault(); 옮기기(b); } },
      }, h('div', { class: 'selcol-title' }, b, h('small', {}, ` ${설명[b]}`)),
      h('div', { class: 'selcol-list' }, 같은상자(b).map((a) => {
        const el = h('button', {
          type: 'button', class: 'attr', 'data-attr': a,
          onpointerdown: (e) => 눌렀을때(e, a),
          // 키보드(Enter·Space)로 누르면 하나씩 고르고 푼다. 마우스 click 은 상자까지 올라가지 않게 막는다
          onclick: (e) => { e.stopPropagation(); if (e.detail === 0) { if (고른.has(a)) 고른.delete(a); else 고른.add(a); 표시(); } },
        }, a);
        칩.set(a, el);
        return el;
      })));
      상자칸.set(b, 칸);
      return 칸;
    }));
    표시();
  }
  그리기();
  return h('div', {},
    위젯창('Select Columns', h('p', { class: 'muted small' }, '속성을 누른 채 끌면 여러 개를 한꺼번에 골라요. 고른 속성을 상자로 끌어 놓거나, 옮길 상자를 누르세요.'), 몸,
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
