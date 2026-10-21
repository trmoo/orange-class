/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  기록 보관. 이 브라우저의 localStorage 에만 남고 어디에도 보내지 않는다.
 *  이름·학번은 받지 않는다. 남는 것은 열린 단원·본 카드·푼 활동·적은 글뿐이다.
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
