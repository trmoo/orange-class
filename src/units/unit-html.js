/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  「💾 지금까지 한 활동 HTML 로 저장」 (2026-11-17 사용자 지시) — 단원 머리줄의 단추. 그 단원 하나만 담는다.
 *  카드를 하나씩 화면 밖에 그려 「화면에 보이는 그대로」(글·표·SVG 그래프)를 HTML 한 파일에 굳혀 담는다.
 *  그림으로 뜨지 않으므로 파일이 가볍고, 학생이 쓴 글을 글자 그대로 찾아 읽을 수 있다.
 *  캡처 모드를 켜서 끝낸 활동은 다 푼 모습으로, 남은 활동은 지금 모습 그대로 담는다(활동 정리 PDF 와 같다).
 *  맨 앞에는 학번·이름·저장한 때·카드마다 본 표시·활동 현황을 적는다.
 *  학번·이름은 이 파일 안에만 들어간다 — 이 앱(localStorage)에는 남기지 않는다(이 탭의 메모리에만 잠깐 기억).
 *  파일: 「학번 이름_단원 제목.html」. 크롬·엣지·웨일은 저장 창을 바탕 화면에서 열고, 같은 탭에서 같은 이름으로
 *  다시 저장하면 창 없이 덮어쓴다. 그 기능이 없거나 막히면 보통 내려받기(다운로드 폴더)로 대신한다.
 *  ⚠ 저장 창은 단추를 누른 「바로 그 순간」 에만 열 수 있다 — 학번·이름 창의 [저장] 을 누르자마자 저장 창부터 연다.
 *  ⚠ 저장 창에 id 를 주지 않는다 — id 가 있으면 지난번 폴더가 startIn('desktop') 보다 앞선다(ds_performance 에서 겪음).
 */
import { h, md, 창, 따로그리기 } from '../lib/ui.js';
import { 알림줄 } from '../lib/games.js';
import { 상태 } from '../lib/store.js';
import { 캡처 } from '../lib/capture.js';
import { 다했나, 저장파일이름 } from './finish.js';

const 종류이름 = { 개념: '📘 개념', 활동: '✏️ 활동', 오렌지: '🍊 오렌지 3.40', 이야기: '💬 이야기', 정리: '✅ 정리', 프로젝트: '📝 내 프로젝트', 심화: '⭐ 심화' };

export const HTML파일이름 = (학번, 이름, 제목) => 저장파일이름(학번, 이름, 제목, 'html');
/** 학번은 숫자 4~6자리 (예: 20315) */
export const 학번맞나 = (t) => /^\d{4,6}$/.test(String(t).trim());

export const 탈출 = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const 때글 = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

// 저장한 파일에만 쓰는 모양 — 앱의 스타일 뒤에 붙는다(글자 크기를 교실 화면 크기로 고정, 카드는 위에서 아래로 쌓기)
const 파일모양 = `
html{font-size:16.5px}
body{background:var(--bg)}
.sv{max-width:1240px;margin:0 auto;padding:16px 16px 40px}
.sv-head{background:#fff;border:1px solid var(--line);border-top:6px solid var(--unit);border-radius:18px;padding:14px 24px 16px}
.sv-head h1{margin:2px 0 4px;font-size:1.6rem}
.sv-sub{color:var(--muted);font-weight:700}
.sv-who{display:inline-flex;flex-wrap:wrap;gap:6px 22px;margin:10px 0 4px;padding:7px 18px;border:2px solid var(--unit);border-radius:12px;font-size:1.1rem;font-weight:800}
.sv-who span{font-weight:400;color:var(--muted);font-size:.9rem;margin-right:6px}
.sv-head h2{font-size:1.05rem;margin:14px 0 6px}
.sv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:3px 18px;margin:0;padding:0;list-style:none;font-size:.9rem}
.sv-grid .no{color:#9a9089}
.sv-grid a{color:inherit;text-decoration:none}
.sv-grid a:hover{text-decoration:underline}
.sv-note{margin-top:12px;padding:8px 12px;border-radius:10px;background:#f6f1ea;font-size:.88rem}
.snap{margin:18px 0 0;scroll-margin-top:10px}
.snap .card{max-width:none;box-shadow:none}
.snap .card + .card{margin-top:10px}
.snap button,.snap a,.snap input,.snap select,.snap label,.snap [role=button],.snap [tabindex]{pointer-events:none}
.snap-text{white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;min-height:3.2em}
.snap-text.empty{color:#9aa3ad}
.sv-foot{margin-top:24px;color:var(--muted);font-size:.8rem;text-align:center}
@media print{.snap{break-inside:avoid-page}.sv-head{break-after:page}}
`;

/**
 * 파일 맨 앞 — 학번·이름·저장한 때·카드마다 본 표시·활동 현황. 글자(HTML)로 돌려준다(node 시험용 — DOM 을 쓰지 않는다).
 * 본: 본 카드 번호(0부터) 목록 · 끝낸수: 이 단원에서 끝낸 활동 수 · 활동: [{ 카드, 이름, 됨 }] (4~7단원만)
 */
export function 머리글({ 단원, 학번, 이름, 때, 본, 끝낸수, 활동 }) {
  const 카드들 = 단원.카드.map((c, i) => {
    const 봄 = 본.includes(i);
    return `<li class="${봄 ? '' : 'no'}"><a href="#card-${i + 1}">${봄 ? '✔' : '○'} ${i + 1}. ${탈출(c.제목)}</a></li>`;
  }).join('');
  const 다함 = 활동 ? 활동.filter((a) => a.됨).length : 0;
  const 활동줄 = 활동
    ? `<h2>활동 현황 — ${다함} / ${활동.length}${다함 === 활동.length ? ' 모두 마침' : ''}</h2><ul class="sv-grid">${활동.map((a) => `<li class="${a.됨 ? '' : 'no'}">${a.됨 ? '✔' : '○'} ${a.카드}번 · ${탈출(a.이름)}</li>`).join('')}</ul>`
    : `<h2>끝낸 활동 — ${끝낸수}개</h2>`;
  return `<header class="sv-head">
<div class="sv-sub">🍊 오렌지 데이터 교실 · ${단원.번호}단원 ${탈출(단원.갈래)}</div>
<h1>${탈출(단원.제목)} — 지금까지 한 활동</h1>
<div class="sv-who"><b><span>학번</span>${탈출(학번)}</b><b><span>이름</span>${탈출(이름)}</b><b><span>저장한 때</span>${때글(때)}</b></div>
${활동줄}
<h2>카드 ${단원.카드.length}장 — 본 카드 ${본.length}장 (✔ 본 카드 · ○ 아직 안 본 카드)</h2>
<ul class="sv-grid">${카드들}</ul>
<p class="sv-note">아래에 카드 ${단원.카드.length}장을 화면 그대로 담았어요. 끝낸 활동은 <b>다 푼 모습</b>(퀴즈는 모든 문항의 정답과 해설), 끝내지 않은 활동은 <b>지금 모습 그대로</b>예요. 단추는 눌리지 않아요.</p>
</header>`;
}

/** 파일 전체 — 앱 스타일(모양) + 머리글 + 카드 조각들. 조각: { 번호, html } */
export function 파일만들기({ 단원, 학번, 이름, 때, 머리, 조각들, 모양 }) {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<!-- 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요 -->
<title>${단원.번호}단원 ${탈출(단원.제목)} — ${탈출(학번)} ${탈출(이름)}</title>
<style>${모양}</style>
<style>${파일모양}</style>
</head><body style="--unit:${단원.색}">
<div class="sv">
${머리}
${조각들.map((c) => `<section class="snap" id="card-${c.번호}">${c.html}</section>`).join('\n')}
<footer class="sv-foot">오렌지 데이터 교실에서 ${때글(때)} 에 저장한 활동 기록 · © 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요</footer>
</div></body></html>
`;
}

const 쉬기 = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 그림을 파일 안에 넣는다 — 빌드본은 그림이 이미 data: 로 들어 있어 그대로 두고,
 * 개발 서버처럼 주소(/src/assets/…)인 그림은 이미 불러온 그림을 캔버스에 옮겨 data: 로 바꾼다(통신하지 않는다).
 */
function 그림자료로(원그림) {
  const 주소 = 원그림.getAttribute('src') || '';
  if (주소.startsWith('data:') || !원그림.complete || !원그림.naturalWidth) return 주소;
  try {
    const 캔버스 = document.createElement('canvas');
    캔버스.width = 원그림.naturalWidth; 캔버스.height = 원그림.naturalHeight;
    캔버스.getContext('2d').drawImage(원그림, 0, 0);
    return 캔버스.toDataURL('image/jpeg', 0.9);
  } catch { return 주소; }
}

/**
 * 카드 하나를 굳힌다 — 복사본을 만들어 입력 칸의 지금 값을 속성으로 옮기고(복사하면 값이 빠진다), 글 칸은 글 상자로 바꾼다.
 * 차례: 같은 이름의 라디오가 여러 카드에 있으면 HTML 이 하나만 고른 채로 남기므로 이름 앞에 붙인다.
 */
function 굳히기(원본, 차례) {
  const 복사 = 원본.cloneNode(true);
  const 원칸 = [...원본.querySelectorAll('input, textarea, select')];
  const 복칸 = [...복사.querySelectorAll('input, textarea, select')];
  원칸.forEach((a, k) => {
    const b = 복칸[k];
    if (!b) return;
    if (a.tagName === 'TEXTAREA') {
      const 상자 = document.createElement('div');
      상자.className = `${a.className} snap-text${a.value ? '' : ' empty'}`;
      상자.textContent = a.value || a.placeholder || '';
      b.replaceWith(상자);
    } else if (a.tagName === 'SELECT') {
      [...a.options].forEach((o, j) => b.options[j]?.toggleAttribute('selected', o.selected));
      if (b.name) b.setAttribute('name', `s${차례}-${b.name}`);
    } else if (a.type === 'checkbox' || a.type === 'radio') {
      b.toggleAttribute('checked', a.checked);
      if (b.name) b.setAttribute('name', `s${차례}-${b.name}`);
    } else if (a.type !== 'file' && a.type !== 'hidden') {
      b.setAttribute('value', a.value);
      b.setAttribute('readonly', '');
    }
  });
  const 원그림들 = [...원본.querySelectorAll('img')];
  [...복사.querySelectorAll('img')].forEach((그림, k) => { if (원그림들[k]) 그림.setAttribute('src', 그림자료로(원그림들[k])); });
  return 복사.outerHTML;
}

/** 단원의 카드를 모두 화면 밖에 그려 굳힌다 — 진행(n, 모두) 로 몇 장째인지 알린다 */
async function 카드담기(단원, 진행) {
  const 조각들 = [];
  const 판 = h('div', { style: { position: 'fixed', left: '-14000px', top: '0', width: '1240px' }, 'aria-hidden': 'true' });
  document.body.append(판);
  캡처.켬 = true;
  let 차례 = 0;
  try {
    for (let i = 0; i < 단원.카드.length; i++) {
      const 카드 = 단원.카드[i], 종류 = 카드.종류 || '개념';
      const 몸 = h('div', { class: 'card-body' });
      const 글 = h('article', { class: `card k-${종류}` },
        h('div', { class: 'card-top' }, h('span', { class: 'card-kind' }, 종류이름[종류]), h('h1', {}, `${i + 1}. ${카드.제목}`),
          카드.쪽 ? h('span', { class: 'card-page' }, 카드.쪽) : null),
        몸);
      판.replaceChildren(글);
      const 부분 = [];
      let 걷기 = () => {};
      try {
        걷기 = 따로그리기(() => 카드.그리기(몸, { 단원, 이동: () => {} }));
        await 쉬기(30);
        부분.push(굳히기(글, ++차례));
        // 흐름이 둘인 카드(4단원 6번 ①·②)는 둘째 흐름도 한 번 더 담는다
        const 둘째 = 몸.querySelectorAll('.flow-switch .seg button')[1];
        if (둘째) { 둘째.click(); await 쉬기(30); 부분.push(굳히기(글, ++차례)); }
      } catch (e) {
        console.error(e);
        부분.push(`<article class="card k-${종류}"><div class="card-top"><h1>${i + 1}. ${탈출(카드.제목)}</h1></div><p class="feedback bad">이 카드는 담지 못했어요: ${탈출(e?.message || e)}</p></article>`);
      } finally { 걷기(); }
      조각들.push({ 번호: i + 1, html: 부분.join('\n') });
      진행?.(i + 1, 단원.카드.length);
    }
  } finally {
    캡처.켬 = false;
    판.remove();
  }
  return 조각들;
}

/** 지금 페이지의 스타일(개발 서버·빌드본 모두 <style> 에 들어 있다)을 그대로 옮긴다 */
const 앱모양 = () => [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n');

/** 단원 하나의 활동 HTML 글을 만든다 — 점검(미리보기)에서도 부른다 */
export async function 단원HTML({ 단원, 학번, 이름, 때 = new Date(), 진행 }) {
  const 조각들 = await 카드담기(단원, 진행);
  const 머리 = 머리글({
    단원, 학번, 이름, 때,
    본: 상태.seen[단원.id] || [],
    끝낸수: Object.keys(상태.done).filter((k) => k.startsWith(`${단원.id}.`) && 상태.done[k]).length,
    활동: 단원.활동?.map((a) => ({ 카드: a.카드, 이름: a.이름, 됨: 다했나(a) })),
  });
  return 파일만들기({ 단원, 학번, 이름, 때, 머리, 조각들, 모양: 앱모양() });
}

// ── 저장 ─────────────────────────────────────────────────────────
let 기억 = { 학번: '', 이름: '' };   // 이 탭의 메모리에만 — 다시 누르면 칸에 미리 채운다
const 손잡이들 = new Map();          // 파일 이름 → 저장해 둔 파일 손잡이(같은 탭에서 덮어쓰기)

async function 저장창(이름) {
  if (typeof window.showSaveFilePicker !== 'function') return 'download';
  try {
    return await window.showSaveFilePicker({ suggestedName: 이름, startIn: 'desktop', types: [{ description: '활동 기록 (HTML)', accept: { 'text/html': ['.html'] } }] });
  } catch (e) {
    if (e?.name === 'AbortError') return null;   // 학생이 저장 창을 닫음
    return 'download';                            // 보안 설정 등으로 막힌 경우 — 내려받기로
  }
}

async function 쓰기(대상, 글, 이름) {
  const 덩이 = new Blob([글], { type: 'text/html;charset=utf-8' });
  if (대상 && 대상 !== 'download') {
    const 쓸것 = await 대상.createWritable();
    await 쓸것.write(덩이);
    await 쓸것.close();
    return 'file';
  }
  const 주소 = URL.createObjectURL(덩이);
  const a = h('a', { href: 주소, download: 이름 });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(주소), 5000);
  return 'download';
}

function 진행창() {
  const 줄 = h('p', {}, '⏳ 카드를 담는 중…');
  const 바탕 = h('div', { class: 'modal-back' },
    h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
      h('h3', {}, '💾 저장하는 중'), 줄, h('p', { class: 'small muted' }, '잠시만 기다려 주세요.')));
  document.body.append(바탕);
  return { 알림: (t) => { 줄.textContent = t; }, 닫기: () => 바탕.remove() };
}

/** 단원 머리줄의 [💾 지금까지 한 활동 HTML 로 저장] */
export async function 활동저장(단원) {
  const 학번칸 = h('input', { type: 'text', class: 'code-input', inputmode: 'numeric', autocomplete: 'off', maxlength: '6', placeholder: '예) 20315', value: 기억.학번, 'aria-label': '학번' });
  const 이름칸 = h('input', { type: 'text', class: 'code-input', autocomplete: 'off', maxlength: '20', placeholder: '예) 홍길동', value: 기억.이름, 'aria-label': '이름' });
  const 미리 = h('code', {});
  const 줄 = 알림줄();
  const 고침 = () => { 미리.textContent = HTML파일이름(학번칸.value.trim() || '학번', 이름칸.value.trim() || '이름', 단원.제목); };
  [학번칸, 이름칸].forEach((칸) => {
    칸.addEventListener('input', 고침);
    // Enter 로 바로 저장 — 대화상자의 [저장] 단추를 누른 것과 같다(저장 창을 열 권한이 그대로 이어진다)
    칸.addEventListener('keydown', (e) => { if (e.key === 'Enter') 칸.closest('.modal')?.querySelector('.modal-btns .btn.primary')?.click(); });
  });
  고침();
  let 학번 = '', 이름 = '';
  for (;;) {
    const 예 = await 창(`💾 ${단원.번호}단원 — 지금까지 한 활동 HTML 로 저장`, h('div', { class: 'pdf-ask' },
      h('p', {}, md(`**${단원.제목}** 카드 ${단원.카드.length}장을 HTML 파일 하나로 저장해요. 학번과 이름을 넣으세요.`)),
      h('label', {}, '학번 ', 학번칸), h('label', {}, '이름 ', 이름칸),
      h('p', { class: 'small' }, '파일 이름: ', 미리),
      h('p', { class: 'small muted' }, md('저장 창이 **바탕 화면** 에서 열리면 그대로 [저장] 을 누르세요. 같은 이름으로 다시 저장하면 **덮어써요**. 학번·이름은 **이 파일 안에만** 들어가고 이 앱에는 남지 않아요.')),
      줄),
    [{ 글: '그만두기', 값: false }, { 글: '💾 저장', 값: true, 주: true }]);
    if (!예) return;
    학번 = 학번칸.value.trim(); 이름 = 이름칸.value.trim();
    if (!학번맞나(학번)) { 줄.틀림('학번을 숫자로 적어 주세요. (예: 20315)'); continue; }
    if (!이름) { 줄.틀림('이름을 적어 주세요.'); continue; }
    break;
  }
  기억 = { 학번, 이름 };
  const 파일이름 = HTML파일이름(학번, 이름, 단원.제목);
  const 전에 = 손잡이들.get(파일이름);
  const 대상 = 전에 || await 저장창(파일이름);   // ⚠ [저장] 을 누른 바로 다음에 연다 — 사이에 오래 걸리는 일을 두지 말 것
  if (대상 === null) return;
  const 창띄움 = 진행창();
  try {
    const 글 = await 단원HTML({ 단원, 학번, 이름, 진행: (n, 모두) => 창띄움.알림(`⏳ 카드를 담는 중… (${n}/${모두})`) });
    창띄움.알림('⏳ 파일에 쓰는 중…');
    const 어디 = await 쓰기(대상, 글, 파일이름);
    창띄움.닫기();
    if (어디 === 'file') {
      손잡이들.set(파일이름, 대상);
      await 창('💾 저장했어요', h('div', {}, h('p', {}, md(`**${대상.name}** 파일${전에 ? '에 덮어썼어요' : '로 저장했어요'}.`)),
        h('p', { class: 'small muted' }, '선생님이 알려 주신 곳에 이 파일을 내세요.')));
    } else {
      await 창('💾 내려받았어요', h('div', {}, h('p', {}, md(`**${파일이름}** 파일을 내려받았어요.`)),
        h('p', { class: 'small muted' }, '「다운로드」 폴더에 있어요. 필요하면 바탕 화면으로 옮기세요.')));
    }
  } catch (e) {
    console.error(e);
    손잡이들.delete(파일이름);
    창띄움.닫기();
    await 창('💾 저장하지 못했어요', h('div', {}, h('p', {}, '잠시 뒤 다시 눌러 보세요. 계속 안 되면 선생님께 이 글을 보여 주세요.'),
      h('p', { class: 'small muted' }, String(e?.message || e).slice(0, 200))));
  }
}
