/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  4단원 1~19번 카드 활동 정리 PDF — 1~19번 활동을 모두 맞힌 학생만 받는다(2026-11-09 사용자 지시).
 *  화면 밖에 A4 쪽을 그려 html2canvas 로 그림을 떠서 jsPDF 로 묶는다(인터넷 필요 없음, cluster-analysis 와 같은 방식).
 *  앱에 남는 기록은 「끝냄」 표시와 쓴 글뿐이라, 카드마다 맞힌 활동의 결과(정답과 같다)와 학생이 쓴 글을 정리해 담는다.
 *  학번·이름은 파일 이름과 첫 쪽에만 들어가고 이 앱에는 저장하지 않는다. 이 모듈은 단추를 누를 때만 불러온다.
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { h, md, 수 } from '../lib/ui.js';
import { 끝났나, 글읽기 } from '../lib/store.js';
import { 상관, 상관정도, 단순회귀 } from '../lib/stats.js';
import { 수면비만, 수면열, 비만열 } from './health.js';
import u4단원, { PDF활동, 훈련과시험, 시험예측, 평가방법점수, 두분석, 새데이터, 믿음판정, 홀드아웃여러번 } from './u4.js';

const 쪽높이 = 1123, 쪽너비 = 794;
const 모양 = `
.p4-wrap{position:fixed;left:-12000px;top:0;width:${쪽너비}px;font-family:'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',sans-serif;color:#1f2a37}
.p4-page{width:${쪽너비}px;height:${쪽높이}px;background:#fff;display:flex;flex-direction:column;box-sizing:border-box;padding:30px 44px 24px}
.p4-head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:3px solid #3f7fd4;padding-bottom:6px;font-size:13px;color:#555}
.p4-head b{color:#3f7fd4;font-size:15px}
.p4-body{flex:1;overflow:hidden;padding-top:10px;font-size:13.5px;line-height:1.55}
.p4-foot{display:flex;justify-content:space-between;border-top:1px solid #ddd;padding-top:6px;font-size:11px;color:#888}
.p4-card{border:1.5px solid #d9e3f0;border-radius:10px;padding:8px 14px 10px;margin:0 0 10px}
.p4-card h2{margin:0 0 4px;font-size:15.5px;color:#1f3f6e}
.p4-card h2 span{display:inline-block;min-width:26px;margin-right:6px;padding:0 6px;border-radius:999px;background:#3f7fd4;color:#fff;font-size:13px;text-align:center}
.p4-item{margin:3px 0}
.p4-ok{color:#13805a;font-weight:700}
.p4-text{background:#fffaf3;border:1px solid #f1dfc6;border-radius:8px;padding:5px 10px;margin:3px 0 4px;white-space:pre-wrap}
.p4-none{color:#888}
.p4-t{border-collapse:collapse;margin:4px 0;font-size:12.5px}
.p4-t th,.p4-t td{border:1px solid #cfd8e3;padding:2px 8px;text-align:center}
.p4-t th{background:#eef3fb}
.p4-cover{text-align:center;padding:18px 0 10px}
.p4-cover h1{margin:0;font-size:28px;color:#1f3f6e}
.p4-cover .sub{font-size:15px;color:#555;margin-top:6px}
.p4-who{display:inline-block;margin-top:14px;padding:8px 22px;border:2px solid #3f7fd4;border-radius:10px;font-size:17px;font-weight:700}
.p4-status{margin:12px 0 4px;font-size:14px}
.p4-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;font-size:12.5px}
`;

const 표 = (머리, 줄들) => h('table', { class: 'p4-t' }, h('tr', {}, 머리.map((m) => h('th', {}, m))), 줄들.map((r) => h('tr', {}, r.map((c) => h('td', {}, String(c))))));
const 맞음 = (글) => h('div', { class: 'p4-item' }, h('span', { class: 'p4-ok' }, '✔ '), md(글));
const 쓴글 = (열쇠) => { const 글 = 글읽기(열쇠).trim(); return h('div', { class: 'p4-text' }, 글 || '(쓰지 않음)'); };
const 칸 = (번호, 제목, ...내용) => h('div', { class: 'p4-card' }, h('h2', {}, h('span', {}, String(번호)), 제목), 내용);

/** 카드마다 담을 내용 — 1~19번. 활동을 모두 맞힌 뒤에만 만들므로 결과는 정답과 같다 */
function 카드내용() {
  const 제목 = u4단원.카드.map((c) => c.제목);
  const 행 = 수면비만().행;
  const x = 행.map((r) => r[수면열]), y = 행.map((r) => r[비만열]);
  const r = 상관(x, y), 식 = 단순회귀(x, y);
  const 통계 = 평가방법점수(행, 'train'), 시험 = 시험예측(행), 나눔 = 훈련과시험(행, 4).나눔, 테스트 = 평가방법점수(행, 'test');
  const 홀드 = 홀드아웃여러번(행, Array.from({ length: 100 }, (_, i) => i + 1)).sort((a, b) => a - b);
  const 두 = 두분석(행);
  const 모델 = 훈련과시험(행, 4).모델, 최소 = Math.min(...x), 최대 = Math.max(...x);
  const 판단글 = ['🟢 믿을 만함', '🟡 조심', '🔴 믿기 어려움'];
  const 내지표 = [['stat', '① 통계적'], ['ml', '② 기계학습']].map(([갈래, 이름]) => [이름, ...['mse', 'mae', 'r2'].map((k) => 글읽기(`u4.my-${갈래}-${k}`).trim() || '—')]);
  const 지표 = ['MSE', 'RMSE', 'MAE', 'MAPE', 'sMAPE', 'R2'];
  return [
    칸(1, 제목[0], h('div', { class: 'p4-item' }, md('「잠을 잘 자면 살이 빠질까?」 — 채원이의 고민을 **데이터로 확인** 하기로 했다.'))),
    칸(2, 제목[1], 맞음('문제: "잠이 부족하면 살이 찌기 쉽고, 잘 자면 살이 빠진다"는 주장이 사실인지 단순 선형 회귀 분석으로 확인한다.'),
      맞음('독립 변수 **평균 수면 시간** · 종속 변수 **비만율** · 필요한 데이터: 연도별 청소년 평균 수면 시간과 비만율')),
    칸(3, 제목[2], 맞음('서울열린데이터광장 → 「수면시간」 검색 → 통계표 고르기 → 시점 2007~2024 → 통계표 조회 → **csv 로 내려받기**')),
    칸(4, 제목[3], 맞음('엑셀 「병합」 단추는 둘째 줄을 지운다 → 첫 줄과 둘째 줄을 **직접 이어 적고** 둘째 줄을 지웠다'),
      h('div', { class: 'p4-item' }, '시점 · 주중평균 전체 · 주중평균 남학생 · 주중평균 여학생 · 주말평균 전체')),
    칸(5, 제목[4], h('div', { class: 'p4-item' }, md('「청소년 비만 및 체중조절」 데이터도 **같은 방법** 으로 내려받아 머리글을 한 줄로 정리했다.'))),
    칸(6, 제목[5], 맞음('**① 통계적 회귀 분석** — 파일 불러오기 ×2 → 데이터 병합 → 열 선택 → 산점도 · 열 선택 → 모델 검증 및 평가 ← 선형회귀(학습 알고리즘)'),
      맞음('**② 기계학습 기반 회귀 분석** — … 열 선택 → 데이터 샘플링 → 선형회귀(샘플 데이터) · 예측 결과 보기(남은 데이터 + 모델) · 예측 결과 보기 (1)(새 파일 + 모델)')),
    칸(7, 제목[6], 맞음(`(1) 합치는 기준 속성: **${글읽기('u4.merge-key').trim() || '시점'}**`), h('div', { class: 'p4-item' }, '(2) 그 속성을 기준으로 정한 이유'), 쓴글('u4.merge-why'),
      맞음('병합 방식 **일치하는 행 쌍만 찾기 (Inner Join)** → 두 파일에 모두 있는 해만 남아 **17줄**')),
    칸(8, 제목[7], 맞음('Features **주중평균 전체** · Target **비만율 전체** · Metas **시점** · 나머지 Ignored')),
    칸(9, 제목[8], 맞음(`회귀선을 켜니 **r = ${수(r, 2)}** — 수면 시간이 늘수록 비만율이 낮아지는 ${상관정도(r)} (음의 방향)`)),
    칸(10, 제목[9], 맞음(`모델 검증 및 평가에서 **학습 데이터로 직접 평가** — 전체 ${행.length}개로 만든 회귀식(비만율 = ${수(식.기울기, 2)} × 수면 시간 + ${수(식.절편, 2)})을 같은 데이터로 확인`),
      표(['MSE', 'RMSE', 'MAE', 'R²'], [[수(통계.MSE, 3), 수(통계.RMSE, 3), 수(통계.MAE, 3), 수(통계.R2, 3)]]),
      h('div', { class: 'p4-item' }, `→ 회귀식이 비만율 변화의 약 ${Math.round(통계.R2 * 100)} % 를 설명한다(설명력).`)),
    칸(11, 제목[10], 맞음(`홀드아웃 — 데이터 샘플링(고정 비율 70 %)으로 나눔: 전체 **${행.length}** · 샘플 데이터 **${나눔.훈련.length}** · 남은 데이터 **${나눔.시험.length}**`)),
    칸(12, 제목[11], 맞음('(1) 예측 결과 보기 창의 시험 데이터 위에서부터 세 줄과 오차(예측값 − 실제값)'),
      표(['번호', '독립 변수 값', '실제 값', '예측값', '오차'], 시험.줄들.slice(0, 3).map((줄, i) => [i + 1, 수(줄.x, 2), 수(줄.y, 1), 수(줄.p, 1), 수(줄.e, 1)])),
      맞음('(2) 평가 지표 (남은 데이터로 낸 점수)'), 표(지표.map((k) => (k === 'R2' ? 'R²' : k)), [지표.map((k) => 수(시험.점수[k], 3))])),
    칸(13, 제목[12], 맞음('데이터 샘플링 → 모델 검증 및 평가 선을 두 번 눌러 **샘플 데이터 → 데이터**, **남은 데이터 → 테스트 데이터** 로 잇고'),
      맞음(`**별도 테스트 데이터로 평가** → R² ${수(테스트.R2, 3)} (12번 카드의 예측 결과 보기와 같은 점수)`)),
    칸(14, 제목[13], 맞음(`홀드아웃을 100번 해 보니 R² 가 **${수(홀드[0], 2)} ~ ${수(홀드[99], 2)}** (가운데 ${수((홀드[49] + 홀드[50]) / 2, 2)})로 흔들렸다`),
      맞음('결과를 믿을 만하게 하려면 여러 번 해 보거나 데이터를 더 모은다')),
    칸(15, 제목[14], 표(['', '점수를 낸 데이터', 'MSE', 'MAE', 'R²'], [
      ['① 통계적', `전체 ${행.length}개 (학습 데이터로 직접 평가)`, 수(두.통계.MSE, 3), 수(두.통계.MAE, 3), 수(두.통계.R2, 3)],
      ['② 기계학습', `남은 ${나눔.시험.length}개 (예측 결과 보기)`, 수(두.기계.MSE, 3), 수(두.기계.MAE, 3), 수(두.기계.R2, 3)]]),
      h('div', { class: 'p4-item' }, '내 오렌지 결과'), 표(['', 'MSE', 'MAE', 'R²'], 내지표),
      맞음('두 점수가 다른 가장 큰 까닭: 점수를 낸 데이터가 다르다(이미 본 데이터 / 처음 보는 데이터)'),
      h('div', { class: 'p4-item' }, '두 분석의 성능 차이와 그 까닭'), 쓴글('u4.compare-why')),
    칸(16, 제목[15], 맞음(`배운 범위(${수(최소, 2)}~${수(최대, 2)}시간) 밖을 예측하면 믿기 어렵다 — 9시간이면 비만율 ${수(모델.절편 + 모델.기울기 * 9, 1)} % (외삽)`)),
    칸(17, 제목[16], 표(['', '시험 데이터', '새로운 데이터'], [['학습할 때 본 적', '아니요', '있을 수도·없을 수도'], ['정답(비만율)', '예', '아니요'], ['error·성능 점수', '예', '아니요']]),
      맞음('새 데이터 파일을 선형회귀에 이으면 그 데이터로 다시 학습하려 한다 — 만든 모델로 **예측만** 한다')),
    칸(18, 제목[17], 표(['수면 시간', '예측 비만율', '판단'], 새데이터.값.map((v) => { const p = 모델.절편 + 모델.기울기 * v; return [`${수(v, 1)}시간`, `${수(p, 1)} %`, 판단글[믿음판정(v, p, 최소, 최대)]]; })),
      h('div', { class: 'p4-item' }, '믿을 만한 예측과 믿기 어려운 예측, 그 까닭'), 쓴글('u4.unseen-why')),
    칸(19, 제목[18], 맞음('연도별 평균 수면 시간과 비만율 사이에 강한 음의 상관관계가 있다고까지 말할 수 있다'),
      맞음('해가 갈수록 함께 바뀐 다른 원인(교란 변수)이 있을 수 있다'), 맞음('결정계수가 높다고 그대로 발표하지 않고 전문가 의견·다른 자료로 보완한다')),
  ];
}

function 표지(학번, 이름) {
  const 오늘 = new Date(), 다함 = PDF활동.filter((a) => 끝났나(a.열쇠)).length;
  return h('div', {},
    h('div', { class: 'p4-cover' },
      h('h1', {}, '수면 시간과 비만율'),
      h('div', { class: 'sub' }, '4단원 프로젝트 1-1 · 1~19번 카드 활동 정리'),
      h('div', { class: 'p4-who' }, `학번 ${학번}   이름 ${이름}`),
      h('div', { class: 'sub' }, `${오늘.getFullYear()}년 ${오늘.getMonth() + 1}월 ${오늘.getDate()}일`)),
    h('div', { class: 'p4-status' }, md(`**활동 현황 — ${다함} / ${PDF활동.length} 모두 맞힘**`)),
    h('div', { class: 'p4-grid' }, PDF활동.map((a) => h('div', {}, `${끝났나(a.열쇠) ? '✔' : '○'} ${a.카드}번 · ${a.이름}`))));
}

function 새쪽() {
  return h('div', { class: 'p4-page' },
    h('div', { class: 'p4-head' }, h('b', {}, '🍊 오렌지 데이터 교실'), h('span', {}, '4단원 수면 시간과 비만율 — 활동 정리')),
    h('div', { class: 'p4-body' }),
    h('div', { class: 'p4-foot' }, h('span', {}, '© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요'), h('span', { class: 'p4-no' }, '')));
}

/** 블록을 쪽에 차례로 담는다 — 넘치면 다음 쪽으로 */
function 쪽나누기(틀, 블록들) {
  const 쪽들 = [];
  let 쪽 = 새쪽();
  틀.append(쪽);
  for (const b of 블록들) {
    const 몸 = 쪽.querySelector('.p4-body');
    몸.append(b);
    if (몸.scrollHeight > 몸.clientHeight + 1 && 몸.children.length > 1) {
      b.remove(); 쪽들.push(쪽);
      쪽 = 새쪽(); 틀.append(쪽); 쪽.querySelector('.p4-body').append(b);
    }
  }
  쪽들.push(쪽);
  쪽들.forEach((p, i) => { p.querySelector('.p4-no').textContent = `${i + 1} / ${쪽들.length}`; });
  return 쪽들;
}

export async function 활동PDF({ 학번, 이름, 파일이름, 미리보기 = false }) {
  const 스타일 = h('style', {}, 모양);
  const 틀 = h('div', { class: 'p4-wrap' });
  document.head.append(스타일);
  document.body.append(틀);
  try {
    const 쪽들 = 쪽나누기(틀, [표지(학번, 이름), ...카드내용()]);
    if (document.fonts?.ready) await document.fonts.ready;
    const 문서 = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    문서.setProperties({ title: `수면 시간과 비만율 — ${학번} ${이름}`, author: '오렌지 데이터 교실 (© 2026 티쳐무)', subject: '4단원 1~19번 카드 활동 정리' });
    const 그림들 = [];
    for (let i = 0; i < 쪽들.length; i++) {
      const 캔버스 = await html2canvas(쪽들[i], { scale: 2, backgroundColor: '#ffffff', logging: false });
      if (i) 문서.addPage();
      const 자료 = 캔버스.toDataURL('image/jpeg', 0.9);
      그림들.push(자료);
      문서.addImage(자료, 'JPEG', 0, 0, 210, 297);
    }
    if (미리보기) return { 쪽수: 쪽들.length, 크기: 문서.output('blob').size, 그림들 };   // 점검용: 파일로 저장하지 않는다
    문서.save(파일이름);
    return { 쪽수: 쪽들.length };
  } finally {
    틀.remove(); 스타일.remove();
  }
}
