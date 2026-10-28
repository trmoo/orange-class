/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  「내 프로젝트 작성」 카드 — 6단계를 탭으로 나눠 한 단계씩 쓴다(스크롤을 줄이려고).
 *  쓴 글은 이 브라우저에만 저장되고, [활동지 내려받기] 로 HTML 파일을 만들 수 있다.
 *  활동지를 만드는 부분(활동지내려받기)은 4단원 활동지도 함께 쓴다.
 *  이름·학번은 저장하지 않는다. 내려받을 때 적은 이름은 그 파일에만 들어간다.
 */
import { h, 채우기, md, 창 } from '../lib/ui.js';
import { 쓰기, 체크 } from '../lib/games.js';
import { 상태 } from '../lib/store.js';
import { 카드 } from './common.js';
import { 여섯단계 } from './u3.js';

const 체크들 = [
  ['목표를 명확하게 설정하고 주제를 구체적으로 제시하였는가?', '데이터 과학으로 해결 가능한 문제인가?', '도메인 전문가와 협력하여 문제 상황이 실제 맥락을 반영하였는가?'],
  ['출처가 명확하고 신뢰할 수 있는 데이터인가?', '데이터 편향, 오류 가능성을 최소화하였는가?'],
  ['도메인 전문가와 논의하며 결측치를 확인 및 처리하였는가?', '도메인 전문가와 논의하며 이상치를 탐지 및 제거하였는가?', '데이터 정규화가 필요한 데이터인가?'],
  ['데이터 특징과 패턴을 탐색하기 위해 시각화나 통계적 분석을 수행하였는가?'],
  ['문제를 해결하기 위해 적합한 해결 방법은 무엇인가?', '모델의 품질을 측정해 최적의 모델을 선택하였는가?', '도메인 전문가의 검토를 거쳐 선택한 모델과 성능 지표가 요구 기준에 적절한지 확인하였는가?'],
  ['분석 결과의 해석 과정에서 도메인 전문가와 충분히 논의하였는가?', '최종 모델링 결과를 분석하고 결론을 도출했는가?', '사회적 윤리를 고려했는가?', '분석 결과를 활용하는 방안을 제시했는가?'],
];

/**
 * 분석: '회귀 분석' | '군집 분석' | '연관 분석'
 * 물음: 6단계 각각의 질문(분석마다 5단계 질문이 다르다)
 */
export function 프로젝트카드(단원, 분석, 다섯째물음) {
  const 물음 = [
    `${분석}으로 일상의 어떤 문제를 해결하고 싶은지 적어 보세요.`,
    '어떤 데이터를 어디서 모았는지, 그 데이터의 특성(규모·속성·자료형)은 어떤지 적어 보세요.',
    '전처리가 필요했는지, 어떤 방법으로 처리했는지 적어 보세요.',
    '어떤 방법(그래프·통계)으로 탐색적 데이터 분석을 했는지 적어 보세요.',
    다섯째물음,
    '결과를 해석한 내용과, 친구에게 나누려고 어떻게 시각적으로 표현할지 적어 보세요.',
  ];
  return 카드(`${분석}으로 나만의 프로젝트 쓰기`, '프로젝트', (몸) => {
    let 지금 = 0;
    const 탭 = h('div', { class: 'seg proj-tabs' });
    const 내용 = h('div', { class: 'proj-step' });
    const 그리기 = () => {
      채우기(탭, 여섯단계.map((이름, i) => h('button', { type: 'button', class: i === 지금 ? 'on' : '', onclick: () => { 지금 = i; 그리기(); } },
        `${i + 1}. ${이름.replace('하기', '').replace(' 및 특성 파악', '')}`, (상태.notes[`${단원}.proj${i}`] || '').trim() ? ' ✔' : '')));
      채우기(내용, h('div', { class: 'two wide-left' },
        쓰기(`${단원}.proj${지금}`, { 안내: `**${지금 + 1}단계 · ${여섯단계[지금]}** — ${물음[지금]}`, 줄수: 7 }),
        h('div', { class: 'box' }, h('h3', {}, '✅ 체크 사항'), 체크(`${단원}.projchk${지금}`, 체크들[지금]))));
    };
    그리기();
    채우기(몸,
      h('p', {}, md(`이번 프로젝트에서 배운 **${분석}** 으로 내 주제를 정해 6단계를 채워 보세요. 쓴 내용은 이 브라우저에 저장돼요.`)),
      탭, 내용,
      h('div', { class: 'row end' }, h('button', { type: 'button', class: 'btn', onclick: () => 내려받기(단원, 분석, 물음) }, '💾 활동지 내려받기 (HTML)')));
  });
}

/** 프로젝트 활동지 — 6단계마다 물음·쓴 글·체크 사항을 한 칸씩 담는다 */
function 내려받기(단원, 분석, 물음) {
  return 활동지내려받기({
    탭제목: `${분석} 프로젝트 활동지`,
    제목: `${분석}으로 해결하는 나만의 데이터 과학 프로젝트`,
    파일이름: `${분석.replace(/\s/g, '')}_프로젝트`,
    칸들: 여섯단계.map((단계, i) => {
      const 표 = 상태.notes[`${단원}.projchk${i}`] || {};
      return { 제목: `${i + 1}. ${단계}`, 물음: 물음[i], 답: 상태.notes[`${단원}.proj${i}`], 체크: 체크들[i].map((c, j) => [c, !!표[j]]) };
    }),
  });
}

/**
 * 이름을 물은 뒤 활동지 HTML 파일을 내려받는다 — 이름은 그 파일에만 들어가고 이 앱에는 저장하지 않는다.
 * 칸들: [{ 제목, 물음?, 답, 빈글?(답이 비었을 때 적을 말), 체크?: [[항목 글, 했나], …] }]
 */
export async function 활동지내려받기({ 탭제목, 제목, 파일이름, 칸들 }) {
  const 이름칸 = h('input', { type: 'text', class: 'code-input', style: { fontSize: '1.1rem' }, placeholder: '예) 2학년 3반 홍길동 (비워 둬도 돼요)' });
  const 예 = await 창('💾 활동지 내려받기', h('div', {},
    h('p', {}, '활동지에 적을 이름을 넣으세요. 이름은 내려받는 파일에만 들어가고 이 앱에는 저장되지 않아요.'), 이름칸),
  [{ 글: '그만두기', 값: false }, { 글: '내려받기', 값: true, 주: true }]);
  if (!예) return;
  const 이름 = 이름칸.value.trim();
  // 학생이 쓴 글을 HTML 로 옮길 때 < > & 가 태그로 읽히지 않게 바꾼다
  const 탈출 = (t) => String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const 본문 = 칸들.map((c) => {
    const 답 = String(c.답 || '').trim() ? c.답 : (c.빈글 || '(아직 쓰지 않음)');
    return `<section><h2>${탈출(c.제목)}</h2>${c.물음 ? `<p class="q">${탈출(c.물음)}</p>` : ''}<div class="a">${탈출(답).replace(/\n/g, '<br>')}</div>
${c.체크 ? `<ul>${c.체크.map(([글, 했나]) => `<li>${했나 ? '☑' : '☐'} ${탈출(글)}</li>`).join('')}</ul>` : ''}</section>`;
  }).join('\n');
  const 오늘 = new Date();
  const 날짜 = `${오늘.getFullYear()}-${String(오늘.getMonth() + 1).padStart(2, '0')}-${String(오늘.getDate()).padStart(2, '0')}`;
  const 파일 = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${탈출(탭제목 || 제목)}</title>
<style>body{font-family:'Malgun Gothic',sans-serif;max-width:820px;margin:24px auto;padding:0 16px;line-height:1.6}h1{color:#b85600}
section{border:1px solid #e5d3bf;border-radius:10px;padding:8px 16px;margin:10px 0;break-inside:avoid}.q{color:#666}.a{background:#fffaf3;border-radius:8px;padding:8px;min-height:3em}
ul{list-style:none;padding-left:0;font-size:.9rem}footer{color:#999;font-size:.8rem;margin-top:20px}</style></head><body>
<h1>🍊 ${탈출(제목)}</h1><p>이름: <b>${탈출(이름) || '__________'}</b> · 작성일: ${날짜}</p>
${본문}
<footer>오렌지 데이터 교실에서 만든 활동지 · © 2026 티쳐무</footer></body></html>`;
  const 주소 = URL.createObjectURL(new Blob([파일], { type: 'text/html' }));
  const a = h('a', { href: 주소, download: `${파일이름}_${이름.replace(/[\\/:*?"<>|\s]+/g, '_') || '활동지'}.html` });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(주소), 2000);
}
