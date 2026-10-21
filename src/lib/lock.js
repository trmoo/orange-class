/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  단원 잠금. 선생님이 알려 준 입장 코드를 넣어야 단원이 열린다.
 *  코드는 해시로만 비교하므로 소스를 열어 봐도 코드 원문은 보이지 않는다.
 *  ※ 브라우저 안에서만 도는 장치라 개발자 도구로 우회할 수 있다.
 *    보안 장치가 아니라 「진도를 함께 맞추는」 학습 장치다.
 */
import { sha256 } from './sha256.js';
import { 코드다듬기 } from './normalize.js';
import { 소금, 코드해시 } from '../codes.js';
import { 상태, 저장 } from './store.js';

export const 열렸나 = (단원) => 상태.teacher || 상태.unlocked.includes(단원);

/**
 * 코드 확인. 맞으면 단원을 연다.
 * 돌려주는 값: 'unit'(그 단원이 열림) | 'teacher'(모든 단원이 열림) | null(틀림)
 */
export function 코드확인(단원, 입력) {
  const 다듬음 = 코드다듬기(입력);
  if (!다듬음) return null;
  if (sha256(`${소금}|teacher|${다듬음}`) === 코드해시.teacher) {
    상태.teacher = true; 저장(); return 'teacher';
  }
  if (sha256(`${소금}|${단원}|${다듬음}`) === 코드해시[단원]) {
    if (!상태.unlocked.includes(단원)) 상태.unlocked.push(단원);
    저장(); return 'unit';
  }
  return null;
}

/** 다른 단원의 코드를 넣었는지 알려 준다(학생이 헷갈릴 때 도움말용) */
export function 어느단원코드(입력, 단원들) {
  const 다듬음 = 코드다듬기(입력);
  return 단원들.find((u) => sha256(`${소금}|${u}|${다듬음}`) === 코드해시[u]) || null;
}
