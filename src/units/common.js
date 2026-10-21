/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  단원 파일들이 함께 쓰는 작은 부품.
 */
import { h, 채우기, md } from '../lib/ui.js';
import { 난수, 정규, 평균, 표준편차 } from '../lib/stats.js';

/** 카드 하나 */
export const 카드 = (제목, 종류, 그리기, 쪽) => ({ 제목, 종류, 그리기, 쪽 });

/** 눌러서 뒤집는 카드들 — [{ 앞, 뒤 }] */
export function 뒤집기카드(목록, { 열 } = {}) {
  return h('div', { class: 'flip-grid', style: 열 ? { gridTemplateColumns: `repeat(${열}, minmax(0, 1fr))` } : null },
    목록.map((c) => h('button', { type: 'button', class: 'flip', onclick: (e) => e.currentTarget.classList.toggle('open') },
      h('div', { class: 'flip-front' }, c.앞, h('span', { class: 'muted small' }, ' (눌러 보기)')),
      h('div', { class: 'flip-back' }, md(c.뒤)))));
}

/** 이야기 말풍선 */
export const 말풍선 = (얼굴, 이름, 글) => h('div', { class: 'story' },
  h('div', { class: 'story-face', 'aria-hidden': 'true' }, 얼굴),
  h('div', { class: 'speech' }, h('b', {}, 이름), h('div', {}, 글.map ? 글.map((p) => h('p', {}, md(p))) : md(글))));

/** 슬라이더 한 줄 → { 줄, 입력 } */
export function 슬라이더(이름, { 최소, 최대, 단계 = 1, 값, 글자 = (v) => v, 바뀜 }) {
  const 입력 = h('input', { type: 'range', min: 최소, max: 최대, step: 단계, value: 값, 'aria-label': 이름 });
  const 보임 = h('span', { class: 'val' }, 글자(Number(값)));
  입력.addEventListener('input', () => { 보임.textContent = 글자(Number(입력.value)); 바뀜?.(Number(입력.value)); });
  return { 줄: h('label', { class: 'slider-row' }, h('span', {}, 이름), 입력, 보임), 입력 };
}

/** 여러 단추 중 하나를 고르는 묶음 → 단추를 누르면 바뀜(번호) */
export function 고르기단추(목록, 처음, 바뀜) {
  const 묶음 = h('div', { class: 'seg', role: 'group' });
  const 그리기 = (지금) => 채우기(묶음, 목록.map((글, i) => h('button', { type: 'button', class: i === 지금 ? 'on' : '', onclick: () => { 그리기(i); 바뀜(i); } }, 글)));
  그리기(처음);
  return 묶음;
}

/**
 * 표본 상관계수가 정확히 r 인 점 n개를 만든다 (씨앗이 같으면 같은 모양).
 * x 는 그대로 두고, y 를 x 와 「x 와 무관한 성분」의 섞음으로 만든다.
 */
export function 상관점(r, n = 60, 씨앗 = 11) {
  const rnd = 난수(씨앗);
  const x = Array.from({ length: n }, () => 정규(rnd));
  let z = Array.from({ length: n }, () => 정규(rnd));
  const mx = 평균(x), sx = 표준편차(x);
  const xs = x.map((v) => (v - mx) / sx);
  // z 에서 x 와 겹치는 부분을 빼서 서로 상관이 0 이 되게 한다
  const mz = 평균(z);
  z = z.map((v) => v - mz);
  const 겹 = z.reduce((a, v, i) => a + v * xs[i], 0) / n;
  z = z.map((v, i) => v - 겹 * xs[i]);
  const sz = 표준편차(z);
  const zs = z.map((v) => v / sz);
  return xs.map((v, i) => ({ x: v, y: r * v + Math.sqrt(Math.max(0, 1 - r * r)) * zs[i] }));
}

/** 교재와 다른 점·오류를 알리는 상자 */
export const 교재메모 = (...글) => h('div', { class: 'note-book' }, '📕 ', h('b', {}, '교재와 견주기 '), 글.map((g) => (typeof g === 'string' ? md(g) : g)));
