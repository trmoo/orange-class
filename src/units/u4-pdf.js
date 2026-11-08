/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  4단원 1~19번 카드 활동 정리 PDF (2026-11-09 사용자 지시).
 *  첫 쪽: 학번·이름·날짜·활동 현황(끝낸 것 ✔ / 남은 것 ○). 그다음: 1~19번 카드를 화면 그대로 캡처해 한 쪽에 두 장씩 — 복습용.
 *  캡처할 때만 「캡처 모드」 를 켜서 끝낸 활동은 다 푼 모습(퀴즈는 모든 문항과 정답·해설)으로, 남은 활동은 지금 모습 그대로 그린다.
 *  화면 밖에 카드를 그려 html2canvas 로 그림을 떠서 jsPDF 로 묶는다(인터넷 필요 없음, cluster-analysis 와 같은 방식).
 *  학번·이름은 파일 이름과 첫 쪽에만 들어가고 이 앱에는 저장하지 않는다. 이 모듈은 단추를 누를 때만 불러온다.
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { h, md } from '../lib/ui.js';
import { 끝났나 } from '../lib/store.js';
import { 캡처 } from '../lib/capture.js';
import u4단원, { PDF활동 } from './u4.js';

const 카드수 = 19;
const 종류이름 = { 개념: '📘 개념', 활동: '✏️ 활동', 오렌지: '🍊 오렌지 3.40', 이야기: '💬 이야기', 정리: '✅ 정리', 프로젝트: '📝 내 프로젝트', 심화: '⭐ 심화' };
const 모양 = `
.p4-wrap{position:fixed;left:-14000px;top:0;width:794px;font-family:'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',sans-serif;color:#1f2a37}
.p4-page{width:794px;height:1123px;background:#fff;display:flex;flex-direction:column;box-sizing:border-box;padding:30px 44px 24px}
.p4-head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:3px solid #3f7fd4;padding-bottom:6px;font-size:13px;color:#555;background:#fff}
.p4-head b{color:#3f7fd4;font-size:15px}
.p4-body{flex:1;overflow:hidden;padding-top:10px;font-size:13.5px;line-height:1.55}
.p4-foot{display:flex;justify-content:space-between;border-top:1px solid #ddd;padding-top:6px;font-size:11px;color:#888;background:#fff}
.p4-strip{width:794px;box-sizing:border-box;padding:10px 44px 0;background:#fff}
.p4-strip.foot{padding:0 44px 8px}
.p4-cover{text-align:center;padding:18px 0 10px}
.p4-cover h1{margin:0;font-size:28px;color:#1f3f6e}
.p4-cover .sub{font-size:15px;color:#555;margin-top:6px}
.p4-who{display:inline-block;margin-top:14px;padding:8px 22px;border:2px solid #3f7fd4;border-radius:10px;font-size:17px;font-weight:700}
.p4-status{margin:14px 0 6px;font-size:14px}
.p4-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 16px;font-size:12.5px}
.p4-grid .no{color:#999}
.p4-guide{margin-top:16px;padding:8px 12px;border-radius:8px;background:#f4f8fd;font-size:12.5px;color:#444}
.p4-cap{position:fixed;left:-14000px;top:0;width:1240px}
.p4-cap .card{max-width:none;box-shadow:none}
`;

const 쪽머리 = () => h('div', { class: 'p4-head' }, h('b', {}, '🍊 오렌지 데이터 교실'), h('span', {}, '4단원 수면 시간과 비만율 — 1~19번 카드 활동 정리'));
const 쪽발 = (글 = '') => h('div', { class: 'p4-foot' }, h('span', {}, '© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요'), h('span', {}, 글));

function 표지(학번, 이름, 쪽수) {
  const 오늘 = new Date(), 다함 = PDF활동.filter((a) => 끝났나(a.열쇠)).length;
  return h('div', { class: 'p4-page' }, 쪽머리(),
    h('div', { class: 'p4-body' },
      h('div', { class: 'p4-cover' },
        h('h1', {}, '수면 시간과 비만율'),
        h('div', { class: 'sub' }, '4단원 프로젝트 1-1 · 1~19번 카드 활동 정리'),
        h('div', { class: 'p4-who' }, `학번 ${학번}   이름 ${이름}`),
        h('div', { class: 'sub' }, `${오늘.getFullYear()}년 ${오늘.getMonth() + 1}월 ${오늘.getDate()}일`)),
      h('div', { class: 'p4-status' }, md(`**활동 현황 — ${다함} / ${PDF활동.length}${다함 === PDF활동.length ? ' 모두 맞힘' : ''}**`)),
      h('div', { class: 'p4-grid' }, PDF활동.map((a) => h('div', { class: 끝났나(a.열쇠) ? '' : 'no' }, `${끝났나(a.열쇠) ? '✔' : '○'} ${a.카드}번 · ${a.이름}`))),
      h('div', { class: 'p4-guide' }, md('**다음 쪽부터** 1~19번 카드를 화면 그대로 담았어요. 끝낸 활동은 **다 푼 모습**(퀴즈는 모든 문항의 정답과 해설), 끝내지 않은 활동은 지금 모습 그대로예요. 복습할 때 보세요.'))),
    쪽발(`1 / ${쪽수}`));
}

const 쉬기 = (ms) => new Promise((r) => setTimeout(r, ms));
// ⚠ requestAnimationFrame 으로 기다리면 창이 가려져 있거나 다른 탭으로 가 있을 때 끝나지 않는다(미리보기 창에서 실제로 멈췄다).
//   html2canvas 가 그리기 전에 배치를 다시 재므로 짧게 쉬기만 한다
const 그려지기 = () => 쉬기(60);

// ⚠ html2canvas 는 textarea 글을 줄바꿈하지 않고 한 줄로 잘라 그린다(7·15·18번 학생 글이 잘렸다).
//   뜨기 전에 같은 class(.write)의 글 상자로 바꿔 끼워 학생이 쓴 글이 다 보이게 한다 — 화면 밖 복사본이라 앱 화면은 그대로다
function 글상자로(판) {
  for (const 칸 of 판.querySelectorAll('textarea')) {
    const 상자 = h('div', { class: 칸.className }, 칸.value || 칸.placeholder);
    Object.assign(상자.style, { whiteSpace: 'pre-wrap', wordBreak: 'keep-all', overflowWrap: 'anywhere', minHeight: `${칸.offsetHeight}px`, boxSizing: 'border-box' });
    if (!칸.value) 상자.style.color = '#9aa3ad';
    칸.replaceWith(상자);
  }
}

/** 카드 하나를 화면 밖에 그려 그림으로 뜬다 — main.js 의 카드 화면과 같은 모양(폭 1240px) */
async function 카드들캡처(진행) {
  const 그림들 = [];
  const 카드들 = u4단원.카드.slice(0, 카드수);
  const 뜨기 = async (판) => {
    await 그려지기(); 글상자로(판); await 쉬기(30);
    const 캔버스 = await html2canvas(판, { scale: 1.25, backgroundColor: '#ffffff', logging: false });
    return { 자료: 캔버스.toDataURL('image/jpeg', 0.86), 너비: 캔버스.width, 높이: 캔버스.height };
  };
  for (let i = 0; i < 카드들.length; i++) {
    const 카드 = 카드들[i];
    const 몸 = h('div', { class: 'card-body' });
    const 판 = h('div', { class: 'p4-cap' }, h('article', { class: `card k-${카드.종류 || '개념'}` },
      h('div', { class: 'card-top' }, h('span', { class: 'card-kind' }, 종류이름[카드.종류 || '개념']), h('h1', {}, `${i + 1}. ${카드.제목}`),
        카드.쪽 ? h('span', { class: 'card-page' }, 카드.쪽) : null),
      몸));
    document.body.append(판);
    try {
      카드.그리기(몸, { 단원: u4단원, 이동: () => {} });
      그림들.push(await 뜨기(판.firstChild));
      // 6번 카드는 흐름이 둘이라 ② 기계학습 흐름도 한 장 더 뜬다
      const 둘째 = 몸.querySelectorAll('.flow-switch .seg button')[1];
      if (둘째) { 둘째.click(); 그림들.push(await 뜨기(판.firstChild)); }
    } finally { 판.remove(); }
    진행?.(i + 1, 카드들.length);
  }
  return 그림들;
}

/** 그림을 A4 세로 쪽에 차례로 담는다(가로 190mm) — 넘치면 다음 쪽. 쪽마다 [{ 그림, y, 너비, 높이 }] */
function 쪽짜기(그림들) {
  const 위 = 17, 아래 = 285, 틈 = 5, 폭 = 190;
  const 쪽들 = [];
  let 지금 = [], y = 위;
  for (const 그림 of 그림들) {
    let 너비 = 폭, 높이 = (폭 * 그림.높이) / 그림.너비;
    if (높이 > 아래 - 위) { 높이 = 아래 - 위; 너비 = (높이 * 그림.너비) / 그림.높이; }
    if (y + 높이 > 아래 && 지금.length) { 쪽들.push(지금); 지금 = []; y = 위; }
    지금.push({ 그림, y, 너비, 높이 });
    y += 높이 + 틈;
  }
  if (지금.length) 쪽들.push(지금);
  return 쪽들;
}

export async function 활동PDF({ 학번, 이름, 파일이름, 진행, 미리보기 = false }) {
  const 스타일 = h('style', {}, 모양);
  const 틀 = h('div', { class: 'p4-wrap' });
  document.head.append(스타일);
  document.body.append(틀);
  // 카드는 교실 화면(1280×720)에 맞춰 다듬었으므로 그 글자 크기로 뜬다
  const 뿌리 = document.documentElement, 옛글자 = 뿌리.style.fontSize;
  뿌리.style.fontSize = '16.5px';
  캡처.켬 = true;
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const 카드그림 = await 카드들캡처(진행);
    const 쪽들 = 쪽짜기(카드그림);
    const 전체 = 쪽들.length + 1;
    const 문서 = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    문서.setProperties({ title: `수면 시간과 비만율 — ${학번} ${이름}`, author: '오렌지 데이터 교실 (© 2026 티쳐무)', subject: '4단원 1~19번 카드 활동 정리' });
    // 첫 쪽
    const 첫쪽 = 표지(학번, 이름, 전체);
    틀.append(첫쪽);
    const 표지그림 = await html2canvas(첫쪽, { scale: 2, backgroundColor: '#ffffff', logging: false });
    문서.addImage(표지그림.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297);
    // 카드 쪽 — 머리·발 띠는 한 번만 그림으로 떠서 쪽마다 붙이고, 쪽 번호는 숫자라 jsPDF 글자로 적는다
    const 머리띠 = h('div', { class: 'p4-strip' }, 쪽머리()), 발띠 = h('div', { class: 'p4-strip foot' }, 쪽발(''));
    틀.append(머리띠, 발띠);
    const [머리그림, 발그림] = await Promise.all([머리띠, 발띠].map((el) => html2canvas(el, { scale: 2, backgroundColor: '#ffffff', logging: false })));
    const 머리높이 = (210 * 머리그림.height) / 머리그림.width, 발높이 = (210 * 발그림.height) / 발그림.width;
    const 머리자료 = 머리그림.toDataURL('image/jpeg', 0.9), 발자료 = 발그림.toDataURL('image/jpeg', 0.9);
    쪽들.forEach((쪽, i) => {
      문서.addPage();
      문서.addImage(머리자료, 'JPEG', 0, 0, 210, 머리높이);
      for (const { 그림, y, 너비, 높이 } of 쪽) {
        const x = (210 - 너비) / 2;
        문서.addImage(그림.자료, 'JPEG', x, y, 너비, 높이);
        문서.setDrawColor(210); 문서.setLineWidth(0.2); 문서.rect(x, y, 너비, 높이);
      }
      문서.addImage(발자료, 'JPEG', 0, 297 - 발높이, 210, 발높이);
      문서.setFontSize(8); 문서.setTextColor(136);
      문서.text(`${i + 2} / ${전체}`, 210 - 15.5, 297 - 3.2, { align: 'right' });
    });
    if (미리보기) return { 쪽수: 전체, 크기: 문서.output('blob').size, 그림들: 카드그림.map((g) => g.자료) };   // 점검용: 파일로 저장하지 않는다
    문서.save(파일이름);
    return { 쪽수: 전체 };
  } finally {
    캡처.켬 = false;
    뿌리.style.fontSize = 옛글자;
    틀.remove(); 스타일.remove();
  }
}
