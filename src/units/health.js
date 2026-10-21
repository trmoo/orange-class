/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  4·5단원이 함께 쓰는 「수면·비만·식생활」 표 다루기 — Merge Data 흉내와 열 꺼내기.
 */
import { 수면표, 비만표, 식생활표 } from '../data/health.js';

export { 수면표, 비만표, 식생활표 };

/**
 * 오렌지 Merge Data 의 세 가지 Merging 방식을 「시점」 으로 맞춰 흉내 낸다.
 * 방식 0: Append columns from Extra data (Data 의 줄을 모두 남김)
 * 방식 1: Find matching pairs of rows (두 표에 다 있는 줄만)
 * 방식 2: Concatenate tables (두 표의 줄을 모두 남김)
 */
export function 합치기(데이터, 추가, 방식, 열쇠 = '시점') {
  const 오른열 = Object.keys(추가[0]).filter((k) => k !== 열쇠);
  const 왼열 = Object.keys(데이터[0]).filter((k) => k !== 열쇠);
  const 찾기 = (표, v) => 표.find((r) => r[열쇠] === v);
  let 키들 = 데이터.map((r) => r[열쇠]);
  if (방식 === 1) 키들 = 키들.filter((v) => 찾기(추가, v));
  if (방식 === 2) 키들 = [...new Set([...키들, ...추가.map((r) => r[열쇠])])].sort();
  const 열 = [열쇠, ...왼열, ...오른열];
  const 행 = 키들.map((v) => {
    const a = 찾기(데이터, v) || {}, b = 찾기(추가, v) || {};
    return { [열쇠]: v, ...Object.fromEntries(왼열.map((k) => [k, a[k] ?? null])), ...Object.fromEntries(오른열.map((k) => [k, b[k] ?? null])) };
  });
  return { 열, 행 };
}

export const 수면비만 = () => 합치기(수면표, 비만표, 1);
export const 수면비만식생활 = () => 합치기(수면비만().행, 식생활표, 1);

export const 수면열 = '주중평균 전체';
export const 비만열 = '비만율 전체';
export const 결식열 = '주5일 이상 아침식사 결식률 전체';
export const 패스트열 = '주3회 이상 패스트푸드 섭취율 전체';
