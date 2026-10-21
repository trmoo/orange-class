/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  학교 수업 목적으로만 이용해 주세요. 자세한 내용은 LICENSE 파일을 보세요.
 *  앱의 뼈대: 첫 화면(단원 7개) · 입장 코드 · 단원 안 카드 넘기기 · 주소 해시(#u4/3).
 *  카드 한 장에는 개념 하나나 활동 하나만 담아 스크롤을 줄인다.
 */
import './style.css';
import { h, 채우기, 화면시작, 창이벤트, 푸터, 창, 묻기 } from './lib/ui.js';
import { 상태, 봄, 모두지우기 } from './lib/store.js';
import { 열렸나, 코드확인, 어느단원코드 } from './lib/lock.js';
import { 단원들 } from './units/index.js';

const 앱 = document.getElementById('app');

function 주소() {
  const [단원, 번호] = location.hash.replace('#', '').split('/');
  const u = 단원들.find((x) => x.id === 단원);
  if (!u) return { u: null };
  const n = Math.min(Math.max(0, Number(번호) || 0), u.카드.length - 1);
  return { u, n };
}

export function 이동(글) {
  if (location.hash !== `#${글}`) location.hash = 글;
  else 그리기();
}

function 그리기() {
  화면시작();
  const { u, n } = 주소();
  if (!u) return 첫화면();
  if (!열렸나(u.id)) { 첫화면(); 잠금창(u); return; }
  카드화면(u, n);
}

// ── 첫 화면 ─────────────────────────────────────────────────────
function 첫화면() {
  document.title = '오렌지 데이터 교실';
  const 타일 = 단원들.map((u) => {
    const 열림 = 열렸나(u.id);
    const 본수 = (상태.seen[u.id] || []).length;
    return h('button', {
      type: 'button', class: `unit-tile${열림 ? ' open' : ' locked'}`, style: { '--unit': u.색 },
      onclick: () => (열림 ? 이동(`${u.id}/${이어볼카드(u)}`) : 잠금창(u)),
    },
    h('div', { class: 'tile-top' }, h('span', { class: 'tile-no' }, u.번호), h('span', { class: 'tile-lock' }, 열림 ? '🔓' : '🔒')),
    h('div', { class: 'tile-kind' }, u.갈래),
    h('div', { class: 'tile-title' }, u.제목),
    h('div', { class: 'tile-sub' }, u.부제),
    h('div', { class: 'tile-foot' }, 열림
      ? h('span', { class: 'tile-prog' }, h('span', { class: 'pbar' }, h('span', { style: { width: `${(100 * 본수) / u.카드.length}%` } })), ` ${본수}/${u.카드.length}`)
      : h('span', { class: 'muted' }, '입장 코드가 필요해요')));
  });
  채우기(앱,
    h('header', { class: 'home-head' },
      h('div', {},
        h('h1', {}, '🍊 오렌지 데이터 교실'),
        h('p', { class: 'home-sub' }, '데이터 과학 핵심 개념을 복습하고, 오렌지 3.40으로 일상의 문제를 해결하는 프로젝트를 미리 해 봐요.')),
      h('div', { class: 'home-tools' },
        상태.teacher ? h('span', { class: 'badge' }, '🔑 교사용으로 모두 열림') : null,
        h('button', { type: 'button', class: 'btn small ghost', onclick: 기록지우기 }, '🧹 내 기록 지우기'))),
    h('main', { class: 'home-grid' }, 타일),
    h('p', { class: 'home-note' }, '🔒 단원은 선생님이 알려 주시는 ', h('b', {}, '입장 코드'), '를 넣어야 열립니다. 한 번 연 단원은 이 브라우저에서 계속 열려 있어요.'),
    푸터());
}

const 이어볼카드 = (u) => {
  const 본 = 상태.seen[u.id] || [];
  for (let i = 0; i < u.카드.length; i++) if (!본.includes(i)) return i;
  return 0;
};

async function 기록지우기() {
  const 예 = await 묻기('내 기록 지우기', h('div', {},
    h('p', {}, '이 브라우저에 남은 기록(열린 단원, 푼 활동, 적은 글)을 모두 지웁니다.'),
    h('p', { class: 'muted' }, '공용 컴퓨터를 다 쓰고 나서 누르세요. 지우면 단원이 다시 잠깁니다.')), '모두 지우기', '그만두기');
  if (예) { 모두지우기(); 이동(''); 그리기(); }
}

// ── 입장 코드 ───────────────────────────────────────────────────
// 코드가 틀려도 창이 닫히지 않아야 하므로 ui.js 의 창() 대신 따로 만든다.
function 잠금창(u) {
  document.querySelector('.modal-back.lock')?.remove();
  const 입력 = h('input', { type: 'text', class: 'code-input', placeholder: '입장 코드', autocomplete: 'off', 'aria-label': `${u.번호}단원 입장 코드` });
  const 줄 = h('p', { class: 'code-msg', 'aria-live': 'polite' });
  const 닫기 = () => {
    바탕.remove();
    document.removeEventListener('keydown', 키);
    if (location.hash.startsWith(`#${u.id}`) && !열렸나(u.id)) 이동('');
  };
  const 확인 = () => {
    const 결과 = 코드확인(u.id, 입력.value);
    if (결과) {
      닫기();
      if (결과 === 'teacher') 창('🔑 교사용 코드', '모든 단원이 열렸습니다. 첫 화면의 [내 기록 지우기] 를 누르면 다시 잠깁니다.');
      이동(`${u.id}/0`);
      return;
    }
    const 다른 = 단원들.find((x) => x.id === 어느단원코드(입력.value, 단원들.map((y) => y.id)));
    줄.textContent = 다른 ? `이 코드는 ${다른.번호}단원 코드예요. ${u.번호}단원 코드를 넣어 주세요.` : '코드가 맞지 않아요. 선생님이 알려 주신 코드를 다시 확인해 보세요.';
    입력.classList.remove('shake'); void 입력.offsetWidth; 입력.classList.add('shake');
    입력.select();
  };
  const 키 = (e) => { if (e.key === 'Escape') 닫기(); };
  입력.addEventListener('keydown', (e) => { if (e.key === 'Enter') 확인(); });
  const 바탕 = h('div', { class: 'modal-back lock', onclick: (e) => { if (e.target === 바탕) 닫기(); } },
    h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
      h('h3', {}, `🔒 ${u.번호}단원 열기`),
      h('div', { class: 'modal-body lock-box' },
        h('div', { class: 'lock-unit', style: { '--unit': u.색 } }, h('span', { class: 'tile-no' }, u.번호), h('div', {}, h('b', {}, u.제목), h('div', { class: 'muted small' }, u.부제))),
        h('p', {}, '선생님이 알려 주신 입장 코드를 넣으세요. 띄어쓰기는 상관없어요.'), 입력, 줄),
      h('div', { class: 'modal-btns' },
        h('button', { type: 'button', class: 'btn', onclick: 닫기 }, '닫기'),
        h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '열기'))));
  document.addEventListener('keydown', 키);
  document.body.appendChild(바탕);
  입력.focus();
}

// ── 카드 화면 ───────────────────────────────────────────────────
function 카드화면(u, n) {
  const 카드 = u.카드[n];
  document.title = `${u.번호}단원 ${카드.제목} — 오렌지 데이터 교실`;
  봄(u.id, n);
  const 몸 = h('div', { class: 'card-body' });
  const 점들 = h('nav', { class: 'card-dots', 'aria-label': '카드 차례' }, u.카드.map((c, i) => h('a', {
    href: `#${u.id}/${i}`, title: `${i + 1}. ${c.제목}`,
    class: `cdot${i === n ? ' on' : ''}${(상태.seen[u.id] || []).includes(i) ? ' seen' : ''} k-${c.종류 || '개념'}`,
  }, i + 1)));
  const 앞 = n > 0 ? `${u.id}/${n - 1}` : null;
  const 뒤 = n < u.카드.length - 1 ? `${u.id}/${n + 1}` : null;
  채우기(앱,
    h('header', { class: 'unit-head', style: { '--unit': u.색 } },
      h('a', { href: '#', class: 'home-btn', title: '첫 화면' }, '🍊'),
      h('div', { class: 'unit-title' }, h('span', { class: 'tile-no' }, u.번호), h('span', {}, u.제목)),
      점들),
    h('main', { class: 'stage' },
      h('article', { class: `card k-${카드.종류 || '개념'}` },
        h('div', { class: 'card-top' },
          h('span', { class: 'card-kind' }, 종류이름[카드.종류 || '개념']),
          h('h1', {}, 카드.제목),
          카드.쪽 ? h('span', { class: 'card-page' }, 카드.쪽) : null),
        몸)),
    h('footer', { class: 'card-nav' },
      h('button', { type: 'button', class: 'btn nav', disabled: !앞, onclick: () => 앞 && 이동(앞) }, '◀ 이전'),
      h('span', { class: 'card-count' }, `${n + 1} / ${u.카드.length}`),
      뒤 ? h('button', { type: 'button', class: 'btn nav primary', onclick: () => 이동(뒤) }, '다음 ▶')
        : 다음단원단추(u)),
    푸터());
  try { 카드.그리기(몸, { 단원: u, 이동 }); }
  catch (e) { 채우기(몸, h('p', { class: 'feedback bad' }, '이 카드를 그리다 문제가 생겼어요: ', String(e.message || e))); console.error(e); }
  // ← → 키로 카드 넘기기 (입력 칸에 있을 때는 빼고)
  창이벤트('keydown', (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '') || document.querySelector('.modal-back')) return;
    if (e.key === 'ArrowRight' && 뒤) 이동(뒤);
    if (e.key === 'ArrowLeft' && 앞) 이동(앞);
  });
}

const 종류이름 = { 개념: '📘 개념', 활동: '✏️ 활동', 오렌지: '🍊 오렌지 3.40', 이야기: '💬 이야기', 정리: '✅ 정리', 프로젝트: '📝 내 프로젝트' };

function 다음단원단추(u) {
  const i = 단원들.indexOf(u);
  const 다음 = 단원들[i + 1];
  if (!다음) return h('a', { href: '#', class: 'btn nav primary' }, '🏁 처음 화면으로');
  return h('button', {
    type: 'button', class: 'btn nav primary',
    onclick: () => (열렸나(다음.id) ? 이동(`${다음.id}/0`) : 잠금창(다음)),
  }, `${다음.번호}단원으로 ${열렸나(다음.id) ? '▶' : '🔒'}`);
}

document.addEventListener('activity-done', () => {
  // 활동을 끝내면 카드 점 표시를 바로 갱신한다
  document.querySelectorAll('.card-dots .cdot.on').forEach((d) => d.classList.add('seen'));
});

window.addEventListener('hashchange', 그리기);
그리기();


