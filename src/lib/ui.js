/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  화면 부품: 요소 만들기 h()·s(), 대화상자, 화면 수명 관리, 푸터.
 */

/**
 * 요소 만들기. h('div', {class:'x', onclick: f}, '글', 자식요소, [자식들])
 * 자식 문자열은 글자 그대로 들어간다. HTML 을 넣으려면 {html: '...'} 를 쓴다.
 */
export function h(태그, 속성 = {}, ...자식) {
  const 요소 = document.createElement(태그);
  for (const [k, v] of Object.entries(속성 || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') 요소.addEventListener(k.slice(2), v);
    else if (k === 'class') 요소.className = v;
    else if (k === 'style' && typeof v === 'object') {
      // '--unit' 같은 CSS 변수는 Object.assign 으로 들어가지 않아 setProperty 로 넣는다
      for (const [이름, 값] of Object.entries(v)) {
        if (이름.startsWith('--')) 요소.style.setProperty(이름, 값);
        else 요소.style[이름] = 값;
      }
    }
    else if (k === 'value') 요소.value = v;
    else if (k === 'checked') 요소.checked = !!v;
    else 요소.setAttribute(k, v === true ? '' : v);
  }
  넣기(요소, 자식);
  return 요소;
}

function 넣기(요소, 자식) {
  for (const c of 자식.flat(Infinity)) {
    if (c == null || c === false) continue;
    if (c instanceof Node) 요소.appendChild(c);
    else if (typeof c === 'object' && 'html' in c) 요소.insertAdjacentHTML('beforeend', c.html);
    else 요소.appendChild(document.createTextNode(String(c)));
  }
}

/** SVG 요소 만들기 */
export function s(태그, 속성 = {}, ...자식) {
  const 요소 = document.createElementNS('http://www.w3.org/2000/svg', 태그);
  for (const [k, v] of Object.entries(속성 || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') 요소.addEventListener(k.slice(2), v);
    else 요소.setAttribute(k, v);
  }
  for (const c of 자식.flat(Infinity)) {
    if (c == null || c === false) continue;
    요소.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return 요소;
}

/** 자식을 모두 지우고 새로 채운다 */
export function 채우기(요소, ...자식) {
  요소.replaceChildren();
  넣기(요소, 자식);
  return 요소;
}

/** `**굵게**` 만 <b> 로 바꾼 HTML 조각 (글은 먼저 이스케이프한다) */
export function md(글) {
  const 안전 = String(글).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return { html: 안전.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>') };
}

// ── 대화상자 ─────────────────────────────────────────────────────
// 브라우저 기본 alert/confirm 은 주소가 함께 떠서 교실 화면에 어울리지 않는다.
export function 창(제목, 내용, 단추들 = [{ 글: '닫기', 값: true, 주: true }]) {
  return new Promise((풀기) => {
    const 닫기 = (값) => { 바탕.remove(); document.removeEventListener('keydown', 키); 풀기(값); };
    const 키 = (e) => { if (e.key === 'Escape') 닫기(false); };
    const 바탕 = h('div', { class: 'modal-back', onclick: (e) => { if (e.target === 바탕) 닫기(false); } },
      h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
        h('h3', {}, 제목),
        h('div', { class: 'modal-body' }, 내용),
        h('div', { class: 'modal-btns' },
          단추들.map((d) => h('button', { type: 'button', class: d.주 ? 'btn primary' : 'btn', onclick: () => 닫기(typeof d.값 === 'function' ? d.값() : d.값) }, d.글))),
      ));
    document.addEventListener('keydown', 키);
    document.body.appendChild(바탕);
    (바탕.querySelector('input') || 바탕.querySelector('.modal-btns .btn.primary'))?.focus();
  });
}

export const 묻기 = (제목, 내용, 예 = '예', 아니오 = '아니요') =>
  창(제목, 내용, [{ 글: 아니오, 값: false }, { 글: 예, 값: true, 주: true }]);

// ── 화면 수명 ────────────────────────────────────────────────────
// 카드를 바꿀 때 그 카드가 걸어 둔 창 이벤트·타이머를 걷어 낸다.
let 정리할것 = [];
export function 화면시작() {
  for (const f of 정리할것) f();
  정리할것 = [];
}
export function 창이벤트(이름, f) {
  window.addEventListener(이름, f);
  정리할것.push(() => window.removeEventListener(이름, f));
}
export function 타이머(f, 간격) {
  const id = setInterval(f, 간격);
  정리할것.push(() => clearInterval(id));
  return id;
}
export function 정리등록(f) { 정리할것.push(f); }

/** 화면 아래 저작권 푸터 */
export function 푸터() {
  return h('footer', { class: 'footer no-print' },
    '© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요. ',
    h('span', { class: 'muted' }, '실습 데이터는 연습용으로 새로 만든 값입니다. 이 앱은 아무것도 서버로 보내지 않습니다.'));
}

/** 숫자를 보기 좋게 (소수 자리 고정, 뒤쪽 0 은 그대로) */
export const 수 = (x, 자리 = 2) => (Number.isFinite(x) ? x.toFixed(자리) : '–');

/**
 * 한국어 조사 고르기 — 마지막 글자에 받침이 있으면 앞 것, 없으면 뒤 것.
 * 조사('사과', '을를') → '를'. 숫자·영문으로 끝나면 읽는 소리로 판단한다.
 */
export function 조사(단어, 짝) {
  const 글 = String(단어).replace(/[\s)」』"'.]+$/, '');
  let 끝 = 글.slice(-1);
  const 숫자소리 = { 0: '영', 1: '일', 2: '이', 3: '삼', 4: '사', 5: '오', 6: '육', 7: '칠', 8: '팔', 9: '구' };
  if (끝 in 숫자소리) 끝 = 숫자소리[끝];
  const 코드 = 끝.charCodeAt(0) - 0xac00;
  let 받침 = 코드 >= 0 && 코드 < 11172 ? 코드 % 28 !== 0 : /[lmnr]$/i.test(끝);
  if (짝 === '으로로' && 코드 >= 0 && 코드 % 28 === 8) 받침 = false; // ㄹ 받침 + 로
  const [있음, 없음] = 짝 === '으로로' ? ['으로', '로'] : [짝[0], 짝[1]];
  return 받침 ? 있음 : 없음;
}
