/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  기록 보관. 이 브라우저의 localStorage 에만 남고 어디에도 보내지 않는다.
 *  이름·학번은 받지 않는다. 남는 것은 열린 단원·본 카드·푼 활동·적은 글, 그리고 붙여 넣은 오렌지3 작업 화면 그림뿐이다.
 *  공용 PC 를 위해 [내 기록 지우기] 로 한 번에 지울 수 있다.
 */
const 열쇠 = 'orange-class-v1';

function 빈상태() {
  return { unlocked: [], teacher: false, seen: {}, done: {}, notes: {} };
}

function 읽기() {
  try {
    const 글 = globalThis.localStorage?.getItem(열쇠);
    if (!글) return 빈상태();
    return { ...빈상태(), ...JSON.parse(글) };
  } catch { return 빈상태(); }
}

export const 상태 = 읽기();

export function 저장() {
  try { globalThis.localStorage?.setItem(열쇠, JSON.stringify(상태)); } catch { /* 저장 못 해도 앱은 돈다 */ }
}

export function 모두지우기() {
  try { globalThis.localStorage?.removeItem(열쇠); } catch { /* 무시 */ }
  Object.assign(상태, 빈상태());
  사진모두지우기();
}

// ── 오렌지3 작업 화면 캡처(그림) ─────────────────────────────────
// 단원마다 붙여 넣은 그림(JPEG data URL)을 열쇠마다 따로 둔다 — 글 기록(JSON)에 넣으면 칸 하나 고칠 때마다 큰 글을 통째로 다시 쓰게 된다.
// 저장할 자리가 모자라면 이 화면이 열려 있는 동안만 메모리에 둔다(사진쓰기 가 false 를 돌려준다).
const 사진머리 = 'orange-class-shot:';
const 사진메모리 = new Map();
export function 사진읽기(열) {
  try { return globalThis.localStorage?.getItem(사진머리 + 열) || 사진메모리.get(열) || ''; } catch { return 사진메모리.get(열) || ''; }
}
/** 그림을 저장한다 — 이 브라우저에 남았으면 true, 메모리에만 두었으면 false */
export function 사진쓰기(열, 자료) {
  사진메모리.set(열, 자료);
  try { globalThis.localStorage?.setItem(사진머리 + 열, 자료); return true; } catch { return false; }
}
export function 사진지우기(열) {
  사진메모리.delete(열);
  try { globalThis.localStorage?.removeItem(사진머리 + 열); } catch { /* 무시 */ }
}
function 사진모두지우기() {
  사진메모리.clear();
  try {
    const 저장소 = globalThis.localStorage;
    if (!저장소) return;
    const 열쇠들 = [];
    for (let i = 0; i < 저장소.length; i++) { const k = 저장소.key(i); if (k?.startsWith(사진머리)) 열쇠들.push(k); }
    열쇠들.forEach((k) => 저장소.removeItem(k));
  } catch { /* 무시 */ }
}

/** 카드를 봤다고 적는다 */
export function 봄(단원, 번호) {
  const 목록 = (상태.seen[단원] ||= []);
  if (!목록.includes(번호)) { 목록.push(번호); 저장(); }
}

/** 활동을 끝냈다고 적는다 (열쇠: 'u1.sort-data' 처럼) */
export function 끝냄(열) {
  if (!상태.done[열]) { 상태.done[열] = true; 저장(); }
}
export const 끝났나 = (열) => !!상태.done[열];

/** 글쓰기 칸 */
export const 글읽기 = (열) => 상태.notes[열] || '';
export function 글쓰기(열, 값) { 상태.notes[열] = 값; 저장(); }
