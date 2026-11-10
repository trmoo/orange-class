/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  단원 마무리 카드 — 오렌지3 작업 화면 붙여 넣기 + 단원 활동 정리 PDF (2026-11-09 사용자 지시).
 *  4~7단원마다 메인 실습을 마친 뒤(내 프로젝트 앞) 이 카드를 둔다. 4단원은 19번 카드 다음.
 *  PDF 는 다 끝내지 않아도 받을 수 있다 — 남은 활동을 한 번 알려 주고 묻는다.
 *  학번·이름은 파일 이름과 PDF 첫 쪽에만 들어가고 이 앱에는 저장하지 않는다.
 */
import { h, md, 창, 채우기 } from '../lib/ui.js';
import { 알림줄 } from '../lib/games.js';
import { 끝났나, 사진읽기 } from '../lib/store.js';
import { 작업화면붙이기 } from '../lib/shot.js';
import { 카드 } from './common.js';

export const 마무리제목 = '오렌지3 작업 화면 붙이고 PDF 로 저장하기';

/**
 * 단원 활동 목록 — 줄들: [[카드 번호, 열쇠, 이름], …]. 맨 끝에 작업 화면 캡처(사진: { 카드, 열쇠 })를 붙인다.
 * 카드 번호는 1부터. 마무리 카드 앞(1~카드수번) 카드의 활동은 빠짐없이 넣는다 — 시험이 지킨다.
 */
export const 활동목록 = (줄들, 사진) => [
  ...줄들.map(([카드, 열쇠, 이름]) => ({ 카드, 열쇠, 이름 })),
  { 카드: 사진.카드, 열쇠: 사진.열쇠, 이름: '오렌지3 작업 화면 붙여 넣기', 사진: true },
];
/** 끝냈나 — 작업 화면은 그림이 있어야 끝낸 것(지우면 다시 남은 활동) */
export const 다했나 = (a) => (a.사진 ? !!사진읽기(a.열쇠) : 끝났나(a.열쇠));

/** 파일 이름 — 「학번 이름_단원 제목.pdf」. 파일 이름에 못 쓰는 글자는 _ 로 바꾼다 */
export const PDF파일이름 = (학번, 이름, 제목) => {
  const 다듬기 = (t) => String(t).trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ');
  return `${다듬기(학번)} ${다듬기(이름)}_${다듬기(제목)}.pdf`;
};

async function PDF받기(단추, 단원, 활동, 카드수) {
  const 제목들 = 단원.카드.map((c) => c.제목);
  const 남은 = 활동.filter((a) => !다했나(a));
  if (남은.length) {
    const 보일 = 남은.slice(0, 8);
    const 예 = await 창('📄 아직 끝내지 않은 활동이 있어요', h('div', {},
      h('p', {}, md(`남은 활동 **${남은.length}개** — 그래도 받을 수 있어요. 끝낸 활동은 **다 푼 모습** 으로, 남은 활동은 **지금 모습 그대로** 담겨요.`)),
      h('ul', { class: 'small pdf-left' }, 보일.map((a) => h('li', {}, `${a.카드}번 「${제목들[a.카드 - 1]}」 — ${a.이름}`)),
        남은.length > 보일.length ? h('li', { class: 'muted' }, `… 그 밖에 ${남은.length - 보일.length}개`) : null)),
    [{ 글: '그만두기', 값: false }, { 글: '그래도 받기', 값: true, 주: true }]);
    if (!예) return;
  }
  const 학번칸 = h('input', { type: 'text', class: 'code-input', inputmode: 'numeric', placeholder: '예) 20315', 'aria-label': '학번' });
  const 이름칸 = h('input', { type: 'text', class: 'code-input', placeholder: '예) 홍길동', 'aria-label': '이름' });
  const 줄 = 알림줄();
  let 학번 = '', 이름 = '';
  for (;;) {
    const 예 = await 창(`📄 ${단원.번호}단원 활동 정리 PDF 내려받기`, h('div', { class: 'pdf-ask' },
      h('p', {}, '학번과 이름을 넣으세요. 파일 이름과 PDF 첫 쪽에만 들어가고 이 앱에는 저장되지 않아요.'),
      h('label', {}, '학번 ', 학번칸), h('label', {}, '이름 ', 이름칸), 줄),
    [{ 글: '그만두기', 값: false }, { 글: '내려받기', 값: true, 주: true }]);
    if (!예) return;
    학번 = 학번칸.value.trim(); 이름 = 이름칸.value.trim();
    if (학번 && 이름) break;
    줄.틀림('학번과 이름을 모두 넣어 주세요.');
  }
  const 글 = 단추.textContent;
  단추.disabled = true; 단추.textContent = '⏳ PDF 만드는 중…';
  try {
    const { 단원PDF } = await import('./unit-pdf.js');
    await 단원PDF({ 단원, 카드수, 활동, 학번, 이름, 파일이름: PDF파일이름(학번, 이름, 단원.제목),
      진행: (n, 모두) => { 단추.textContent = `⏳ 카드 캡처 중… (${n}/${모두})`; } });
  } catch (e) {
    // 만들다 멈추면 단추만 돌아오고 아무 말이 없어 학생이 기다리기만 한다 — 까닭을 알려 준다
    console.error(e);
    await 창('📄 PDF 를 만들지 못했어요', h('div', {}, h('p', {}, '잠시 뒤 다시 눌러 보세요. 계속 안 되면 선생님께 이 글을 보여 주세요.'), h('p', { class: 'small muted' }, String(e?.message || e).slice(0, 200))));
  } finally { 단추.disabled = false; 단추.textContent = 글; }
}

/**
 * 마무리 카드 — 활동: 활동목록() 결과 · 결과창: 캡처에 함께 보여야 할 결과 창 이름(단원마다 다르다).
 * 이 카드는 활동 목록의 사진 카드 번호 자리에 둔다(1~그 앞 카드를 PDF 에 담는다).
 */
export function 마무리카드(활동, { 결과창 }) {
  const 사진 = 활동.find((a) => a.사진);
  const 카드수 = 사진.카드 - 1;
  return 카드(마무리제목, '정리', (몸, { 단원 }) => {
    const PDF단추 = h('button', { type: 'button', class: 'btn', onclick: (e) => PDF받기(e.currentTarget, 단원, 활동, 카드수) });
    const 단추갱신 = () => {
      const 다함 = 활동.filter(다했나).length;
      PDF단추.classList.toggle('primary', 다함 === 활동.length);
      if (!PDF단추.disabled) PDF단추.textContent = `📄 ${단원.번호}단원 활동 정리 PDF 내려받기 (${다함}/${활동.length})`;
    };
    const 붙이기 = 작업화면붙이기(사진.열쇠, { 바뀜: 단추갱신 });
    단추갱신();
    채우기(몸, h('div', { class: 'two wide-left finish-card' },
      h('div', {},
        h('p', { class: 'finish-q' }, h('span', { class: 'finish-no' }, '(1)'), md(`오렌지3 작업 화면을 캡처해 붙여 넣으세요. **(위젯 연결과 결과 창이 함께 보이게)**`)),
        붙이기),
      h('div', {},
        h('p', { class: 'finish-q' }, h('span', { class: 'finish-no' }, '(2)'), md('활동 정리 **PDF** 로 저장하세요.')),
        h('div', { class: 'box small' },
          h('p', {}, md(`📸 **무엇을 캡처할까?** — 위젯을 이은 캔버스와 함께 ${결과창} 창을 열어 한 화면에 보이게 해요.`)),
          h('ul', { class: 'finish-list' },
            h('li', {}, md('**첫 쪽** — 학번·이름·날짜·활동 현황')),
            h('li', {}, md(`**1~${카드수}번 카드** — 화면 그대로(끝낸 활동은 다 푼 모습)`)),
            h('li', {}, md('**맨 끝 쪽** — 붙여 넣은 오렌지3 작업 화면')))),
        h('div', { class: 'row pdf-row' }, PDF단추),
        h('p', { class: 'small muted' }, '다 끝내지 않아도 받을 수 있어요. 학번·이름은 파일에만 들어가고 이 앱에는 저장되지 않아요.'))));
    // 다른 활동은 이 카드에 없으니 그림이 바뀔 때만 단추를 고치면 된다
    몸.addEventListener('click', () => setTimeout(단추갱신));
  });
}
