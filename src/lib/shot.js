/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  오렌지3 작업 화면 붙여 넣기 (2026-11-09 사용자 지시) — 단원마다 메인 실습을 마치고 작업 화면을 캡처해 붙인다.
 *  받는 길은 셋: 여기를 누른 뒤 Ctrl+V · 그림 파일을 끌어다 놓기 · [그림 파일 고르기](전자칠판처럼 자판이 없을 때).
 *  받은 그림은 가로 1600px 이하 JPEG 로 줄여 이 브라우저에만 저장한다(store.js). 어디에도 보내지 않는다.
 */
import { h, 채우기, md, 창이벤트 } from './ui.js';
import { 알림줄 } from './games.js';
import { 끝냄, 사진읽기, 사진쓰기, 사진지우기 } from './store.js';
import { 캡처 } from './capture.js';

const 최대너비 = 1600, 화질 = 0.85;

function 그림열기(파일) {
  if (globalThis.createImageBitmap) return createImageBitmap(파일);
  return new Promise((됨, 안됨) => {
    const 주소 = URL.createObjectURL(파일), 그림 = new Image();
    그림.onload = () => { URL.revokeObjectURL(주소); 됨(그림); };
    그림.onerror = () => { URL.revokeObjectURL(주소); 안됨(new Error('그림을 열 수 없어요')); };
    그림.src = 주소;
  });
}

/** 그림 파일(Blob) → 가로 1600px 이하로 줄인 JPEG data URL. 투명한 PNG 는 흰 바탕에 얹는다 */
export async function 그림줄이기(파일) {
  const 그림 = await 그림열기(파일);
  const 배 = Math.min(1, 최대너비 / 그림.width);
  const 캔버스 = document.createElement('canvas');
  캔버스.width = Math.max(1, Math.round(그림.width * 배)); 캔버스.height = Math.max(1, Math.round(그림.height * 배));
  const 붓 = 캔버스.getContext('2d');
  붓.fillStyle = '#ffffff'; 붓.fillRect(0, 0, 캔버스.width, 캔버스.height);
  붓.drawImage(그림, 0, 0, 캔버스.width, 캔버스.height);
  그림.close?.();
  return 캔버스.toDataURL('image/jpeg', 화질);
}

/**
 * 작업 화면 붙여 넣는 칸 — 그림이 들어오면 활동 「열쇠」 를 끝낸 것으로 적는다.
 * 바뀜: 그림이 들어오거나 지워질 때마다 부른다(PDF 단추 수를 고칠 때).
 */
export function 작업화면붙이기(열쇠, { 바뀜 } = {}) {
  const 줄 = 알림줄();
  const 파일칸 = h('input', { type: 'file', accept: 'image/*', hidden: true, 'aria-label': '그림 파일 고르기' });
  const 자리 = h('div', { class: 'shot-drop', tabindex: 0, role: 'button', 'aria-label': '오렌지3 작업 화면을 붙여 넣는 곳 — 누른 뒤 Ctrl+V' });
  const 지우기단추 = h('button', { type: 'button', class: 'btn small ghost', onclick: () => { 사진지우기(열쇠); 줄.지우기(); 그리기(); } }, '🗑️ 지우기');
  const 그리기 = () => {
    const 자료 = 사진읽기(열쇠);
    자리.classList.toggle('has', !!자료);
    if (자료) 채우기(자리, h('img', { src: 자료, alt: '붙여 넣은 오렌지3 작업 화면', class: 'shot-img' }));
    else {
      채우기(자리, h('div', { class: 'shot-empty' },
        h('b', {}, '여기를 클릭한 뒤 Ctrl+V'),
        h('div', {}, '캡처하기: ', h('kbd', {}, 'Win'), ' + ', h('kbd', {}, 'Shift'), ' + ', h('kbd', {}, 'S'), ' → 영역을 끌어 고르기'),
        h('div', {}, '이미지 파일을 끌어다 놓아도 돼요.')));
    }
    지우기단추.hidden = !자료;
    바뀜?.();
  };
  const 받기 = async (파일) => {
    if (!파일 || !/^image\//.test(파일.type || '')) { 줄.틀림('그림(이미지)만 붙여 넣을 수 있어요. 캡처한 뒤 바로 Ctrl+V 를 눌러 보세요.'); return; }
    줄.알림('⏳ 그림을 줄이는 중…');
    try {
      const 남음 = 사진쓰기(열쇠, await 그림줄이기(파일));
      끝냄(열쇠); document.dispatchEvent(new CustomEvent('activity-done', { detail: 열쇠 }));
      그리기();
      if (남음) 줄.맞음('붙여 넣었어요! 다시 붙여 넣으면 새 그림으로 바뀌어요.');
      else 줄.틀림('붙여 넣었지만 이 브라우저에 저장할 자리가 모자라요. 창을 닫으면 사라지니 **바로 PDF 를 받으세요.**');
    } catch { 줄.틀림('그림을 열지 못했어요. 다시 캡처해 붙여 넣어 보세요.'); }
  };
  자리.addEventListener('click', () => { 자리.focus(); if (!사진읽기(열쇠)) 줄.알림('이제 **Ctrl+V** 를 누르세요. (먼저 Win + Shift + S 로 캡처해 두어야 해요)'); });
  자리.addEventListener('dragover', (e) => { e.preventDefault(); 자리.classList.add('over'); });
  자리.addEventListener('dragleave', () => 자리.classList.remove('over'));
  자리.addEventListener('drop', (e) => { e.preventDefault(); 자리.classList.remove('over'); 받기(e.dataTransfer?.files?.[0]); });
  파일칸.addEventListener('change', () => { 받기(파일칸.files?.[0]); 파일칸.value = ''; });
  // 붙여 넣기는 창 전체에서 받는다 — 칸을 먼저 누르지 않고 Ctrl+V 를 눌러도 그림이면 받아 준다(글을 붙여 넣는 것은 그대로 둔다)
  if (!캡처.켬) {
    창이벤트('paste', (e) => {
      const 그림 = [...(e.clipboardData?.items || [])].find((it) => it.kind === 'file' && it.type.startsWith('image/'));
      if (!그림) { if (document.activeElement === 자리) 줄.틀림('클립보드에 그림이 없어요. **Win + Shift + S** 로 먼저 캡처하세요.'); return; }
      e.preventDefault();
      받기(그림.getAsFile());
    });
  }
  그리기();
  return h('div', { class: 'shot-box' }, 자리,
    h('div', { class: 'row shot-row' },
      h('button', { type: 'button', class: 'btn small', onclick: () => 파일칸.click() }, '🖼️ 그림 파일 고르기'), 지우기단추, 파일칸,
      h('span', { class: 'small muted grow' }, md('그림은 **이 브라우저에만** 저장돼요. 공용 컴퓨터라면 마치고 첫 화면의 [내 기록 지우기] 를 누르세요.'))),
    줄);
}
