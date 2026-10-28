/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  활동 부품 — 고르기 퀴즈 · 나누기(분류) · 순서 맞추기 · 짝짓기 · 빈칸 · 글쓰기 · 체크리스트 · 자기 평가.
 *  모두 정답을 바로 알려 주고, 틀리면 힌트를 준다. 다 맞히면 기록에 「끝냄」을 남긴다.
 */
import { h, 채우기, md, 조사 } from './ui.js';
import { 끝냄, 끝났나, 글읽기, 글쓰기, 상태, 저장 } from './store.js';

/** 활동을 끝냈다고 알리고(진행 표시 갱신용) 기록한다 */
function 마침(열쇠) {
  if (!열쇠) return;
  끝냄(열쇠);
  document.dispatchEvent(new CustomEvent('activity-done', { detail: 열쇠 }));
}

const 섞기 = (배열, 씨 = 7) => {
  const a = [...배열];
  let x = 씨;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** 결과 줄 — 맞음/틀림/알림 */
export function 알림줄() {
  const 줄 = h('div', { class: 'feedback', 'aria-live': 'polite' });
  줄.맞음 = (글) => { 줄.className = 'feedback good'; 채우기(줄, '⭕ ', md(글)); };
  줄.틀림 = (글) => { 줄.className = 'feedback bad'; 채우기(줄, '💡 ', md(글)); };
  줄.알림 = (글) => { 줄.className = 'feedback info'; 채우기(줄, md(글)); };
  줄.지우기 = () => { 줄.className = 'feedback'; 줄.replaceChildren(); };
  return 줄;
}

/**
 * 고르기 퀴즈 여러 문항 — 한 번에 한 문항씩 보여 준다(스크롤을 줄이려고).
 * 문항: [{ 질문, 보기: [...], 답: 번호, 해설, 힌트 }]
 * 마지막 문항까지 맞히면 처음으로 되돌아가지 않고 그 자리에 「모두 맞혔어요」 를 띄운다.
 * 다 푼 뒤에는 위쪽 점을 눌러 앞 문항의 해설을 다시 볼 수 있다.
 * 이미 끝낸 퀴즈 카드에 다시 오면 다 푼 모습(마지막 문항)으로 그린다.
 */
export function 퀴즈(문항들, { 열쇠, 제목 } = {}) {
  const 끝 = 문항들.length - 1;
  const 이미끝 = !!열쇠 && 끝났나(열쇠);
  let 지금 = 이미끝 ? 끝 : 0;
  const 맞힘 = new Array(문항들.length).fill(이미끝);
  const 상자 = h('div', { class: 'quiz' });
  function 그리기() {
    const q = 문항들[지금];
    const 줄 = 알림줄();
    const 차례 = q.고정 ? [...q.보기.keys()] : 섞기([...q.보기.keys()], [...q.질문].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 233280, 7));
    const 보기들 = 차례.map((i, 자리) => [q.보기[i], i, 자리]).map(([b, i, 자리]) => h('button', {
      type: 'button', class: 'choice',
      onclick: (e) => {
        if (i === q.답) {
          맞힘[지금] = true;
          if (맞힘.every(Boolean)) 마침(열쇠);
          그리기();   // 맞힌 모습(정답 초록·해설·다음 단추)으로 다시 그린다
        } else {
          e.currentTarget.classList.add('bad');
          e.currentTarget.disabled = true;
          줄.틀림(q.힌트 || '다시 생각해 보세요.');
        }
      },
    }, h('span', { class: 'choice-no' }, '①②③④⑤⑥'[자리]), ' ', md(b)));
    const 짧음 = q.보기.every((b) => b.length < 16);
    const 보기묶음 = h('div', { class: 짧음 && q.보기.length % 2 === 1 ? 'choices grid3' : 짧음 ? 'choices grid2' : 'choices' }, 보기들);

    // 이 문항을 이미 맞혔으면 정답을 초록으로 칠하고 보기를 잠근 채 해설을 보여 준다
    if (맞힘[지금]) {
      보기들.forEach((버튼, 자리) => { 버튼.disabled = true; if (차례[자리] === q.답) 버튼.classList.add('ok'); });
      줄.맞음(q.해설 || '정답입니다!');
    }
    const 다끝남 = 맞힘.every(Boolean);
    let 아래 = null;
    if (맞힘[지금] && 지금 < 끝) {
      아래 = h('div', { class: 'row end' }, h('button', { type: 'button', class: 'btn primary', onclick: () => { 지금 += 1; 그리기(); } }, '다음 문제 ▶'));
    } else if (다끝남 && 문항들.length > 1) {
      아래 = h('p', { class: 'feedback info quiz-end' }, `🎉 ${문항들.length}문제를 모두 맞혔어요! 위의 점을 누르면 앞 문제의 해설을 다시 볼 수 있어요.`);
    }

    // 다 풀었으면 점이 단추가 되어 아무 문항이나 다시 볼 수 있다
    const 점 = (_, i) => {
      const 이름 = `qdot${i === 지금 ? ' on' : ''}${맞힘[i] ? ' done' : ''}`;
      return 다끝남 && 문항들.length > 1
        ? h('button', { type: 'button', class: 이름, title: `Q${i + 1} 다시 보기`, 'aria-label': `Q${i + 1} 다시 보기`, onclick: () => { 지금 = i; 그리기(); } })
        : h('span', { class: 이름 });
    };
    채우기(상자,
      h('div', { class: 'quiz-head' }, 제목 ? h('b', {}, 제목) : null,
        h('span', { class: 'quiz-dots' }, 문항들.map(점))),
      h('p', { class: 'quiz-q' }, h('b', {}, `Q${지금 + 1}. `), md(q.질문)),
      보기묶음, 줄, 아래);
  }
  그리기();
  return 상자;
}

/**
 * 나누기(분류) — 카드를 눌러 고른 뒤 바구니를 누르면 들어간다.
 * 항목: [{ 글, 답: 바구니번호, 왜?: 틀렸을 때 보여 줄 설명 }], 바구니: ['정형', '비정형']
 */
export function 나누기(항목들, 바구니들, { 열쇠, 안내 = '카드를 누른 뒤 알맞은 상자를 누르세요.' } = {}) {
  const 자리 = new Array(항목들.length).fill(-1);
  let 고른 = -1;
  const 줄 = 알림줄();
  const 상자 = h('div', { class: 'sorter' });
  const 순서 = 섞기([...항목들.keys()], 항목들.length * 3 + 1);
  function 그리기() {
    const 카드 = (i) => h('button', {
      type: 'button', class: `chip${고른 === i ? ' picked' : ''}${자리[i] >= 0 && 자리[i] === 항목들[i].답 && 확인함 ? ' ok' : ''}`,
      onclick: () => { 고른 = 고른 === i ? -1 : i; 그리기(); },
    }, 항목들[i].글);
    채우기(상자,
      h('p', { class: 'muted small' }, 안내),
      h('div', { class: 'chip-pool' }, 순서.filter((i) => 자리[i] < 0).map(카드)),
      h('div', { class: `bins n${바구니들.length}` }, 바구니들.map((이름, b) => h('div', {
        class: `bin${고른 >= 0 ? ' ready' : ''}`, role: 'button', tabindex: 0,
        onclick: () => { if (고른 >= 0) { 자리[고른] = b; 고른 = -1; 확인함 = false; 그리기(); } },
      }, h('div', { class: 'bin-name' }, 이름), h('div', { class: 'bin-items' }, 순서.filter((i) => 자리[i] === b).map(카드))))),
      h('div', { class: 'row end' }, h('button', { type: 'button', class: 'btn primary', onclick: 확인 }, '정답 확인')),
      줄);
  }
  let 확인함 = false;
  function 확인() {
    if (자리.some((v) => v < 0)) { 줄.틀림('아직 상자에 넣지 않은 카드가 있어요.'); return; }
    const 틀린 = 항목들.map((t, i) => (자리[i] !== t.답 ? i : -1)).filter((i) => i >= 0);
    확인함 = true;
    if (!틀린.length) { 그리기(); 줄.맞음('모두 맞았습니다!'); 마침(열쇠); return; }
    // 틀린 카드는 다시 위로 돌려보낸다
    const 설명 = 틀린.map((i) => 항목들[i].왜).filter(Boolean);
    for (const i of 틀린) 자리[i] = -1;
    그리기();
    줄.틀림(`${항목들.length - 틀린.length}개 맞음. 틀린 카드 ${틀린.length}개를 위로 돌려보냈어요.${설명.length ? ' 힌트: ' + 설명[0] : ''}`);
  }
  그리기();
  return 상자;
}

/**
 * 순서 맞추기 — 첫 단계부터 차례로 누른다. 항목: 바른 순서의 글 목록
 */
export function 순서(항목들, { 열쇠, 안내 = '첫 단계부터 차례대로 누르세요.', 가로 = false } = {}) {
  const 섞은 = 섞기([...항목들.keys()], 항목들.length * 5 + 3);
  const 고른것 = [];
  const 줄 = 알림줄();
  const 상자 = h('div', { class: 'orderer' });
  function 그리기() {
    채우기(상자,
      h('p', { class: 'muted small' }, 안내),
      h('div', { class: `order-done${가로 ? ' flow' : ''}` }, 고른것.map((i, n) => h('div', { class: 'order-step' }, h('span', { class: 'step-no' }, n + 1), 항목들[i]))),
      h('div', { class: 'chip-pool' }, 섞은.filter((i) => !고른것.includes(i)).map((i) => h('button', {
        type: 'button', class: 'chip',
        onclick: (e) => {
          if (i === 고른것.length) {
            고른것.push(i); 그리기();
            if (고른것.length === 항목들.length) { 줄.맞음('순서를 모두 맞혔습니다!'); 마침(열쇠); } else 줄.지우기();
          } else {
            e.currentTarget.classList.add('shake');
            setTimeout(() => e.currentTarget?.classList.remove('shake'), 400);
            줄.틀림(`「${항목들[i]}」${조사(항목들[i], "은는")} 아직 차례가 아니에요. ${고른것.length + 1}번째 단계를 찾아보세요.`);
          }
        },
      }, 항목들[i]))),
      고른것.length ? h('div', { class: 'row end' }, h('button', { type: 'button', class: 'btn small', onclick: () => { 고른것.length = 0; 줄.지우기(); 그리기(); } }, '처음부터')) : null,
      줄);
  }
  그리기();
  return 상자;
}

/**
 * 짝짓기 — 왼쪽 항목마다 알맞은 것을 고른다.
 * 쌍: [{ 왼, 답 }], 보기: 오른쪽 선택지 글 목록
 */
export function 짝짓기(쌍들, 보기들, { 열쇠, 왼제목 = '', 오른제목 = '' } = {}) {
  const 줄 = 알림줄();
  const 고름 = 쌍들.map(() => h('select', { class: 'pick' }, h('option', { value: '' }, '— 고르세요 —'), 보기들.map((b) => h('option', { value: b }, b))));
  return h('div', { class: 'matcher' },
    h('table', { class: 'match-table' },
      왼제목 || 오른제목 ? h('thead', {}, h('tr', {}, h('th', {}, 왼제목), h('th', {}, 오른제목))) : null,
      h('tbody', {}, 쌍들.map((p, i) => h('tr', {}, h('td', {}, md(p.왼)), h('td', {}, 고름[i]))))),
    h('div', { class: 'row end' }, h('button', {
      type: 'button', class: 'btn primary',
      onclick: () => {
        let 맞은수 = 0;
        고름.forEach((sel, i) => {
          const ok = sel.value === 쌍들[i].답;
          sel.classList.toggle('ok', ok); sel.classList.toggle('bad', !ok && sel.value !== '');
          if (ok) 맞은수++;
        });
        if (맞은수 === 쌍들.length) { 줄.맞음('모두 맞았습니다!'); 마침(열쇠); } else 줄.틀림(`${쌍들.length}개 중 ${맞은수}개 맞았어요. 빨간 칸을 다시 골라 보세요.`);
      },
    }, '정답 확인')),
    줄);
}

/**
 * 빈칸 — 숫자나 낱말을 넣는다.
 * 칸: [{ 앞, 답, 뒤?, 오차?(숫자 답일 때 허용 범위), 다른답?: [...] }]
 */
export function 빈칸(칸들, { 열쇠, 힌트 } = {}) {
  const 줄 = 알림줄();
  const 입력들 = 칸들.map((c) => h('input', { class: 'blank', type: 'text', inputmode: typeof c.답 === 'number' ? 'decimal' : 'text', size: c.폭 || 6, 'aria-label': c.앞 }));
  const 맞나 = (c, v) => {
    const 글 = v.trim().replace(/\s+/g, '');
    if (typeof c.답 === 'number') return 글 !== '' && Math.abs(Number(글) - c.답) <= (c.오차 ?? 0.001);
    return [c.답, ...(c.다른답 || [])].some((d) => String(d).replace(/\s+/g, '') === 글);
  };
  return h('div', { class: 'blanks' },
    칸들.map((c, i) => h('div', { class: 'blank-row' }, md(c.앞), ' ', 입력들[i], c.뒤 ? [' ', md(c.뒤)] : null)),
    h('div', { class: 'row end' }, h('button', {
      type: 'button', class: 'btn primary',
      onclick: () => {
        let 맞은수 = 0;
        입력들.forEach((inp, i) => { const ok = 맞나(칸들[i], inp.value); inp.classList.toggle('ok', ok); inp.classList.toggle('bad', !ok); if (ok) 맞은수++; });
        if (맞은수 === 칸들.length) { 줄.맞음('모두 맞았습니다!'); 마침(열쇠); } else 줄.틀림(`${칸들.length}칸 중 ${맞은수}칸 맞았어요.${힌트 ? ' 힌트: ' + 힌트 : ''}`);
      },
    }, '정답 확인')),
    줄);
}

/** 글쓰기 칸 — 쓰는 대로 이 브라우저에 저장된다 */
export function 쓰기(열쇠, { 안내 = '', 줄수 = 3, 예시 = '' } = {}) {
  const 칸 = h('textarea', { class: 'write', rows: 줄수, placeholder: 예시 || '여기에 적어 보세요.', 'aria-label': 안내 || '글쓰기' });
  칸.value = 글읽기(열쇠);
  칸.addEventListener('input', () => { 글쓰기(열쇠, 칸.value); if (칸.value.trim().length >= 10) 마침(열쇠); });
  return h('label', { class: 'write-wrap' }, 안내 ? h('span', { class: 'write-label' }, md(안내)) : null, 칸);
}

/** 체크리스트 — 누를 때마다 저장 */
export function 체크(열쇠, 항목들) {
  const 표 = (상태.notes[열쇠] ||= {});
  return h('div', { class: 'checklist' }, 항목들.map((글, i) => {
    const 상자 = h('input', { type: 'checkbox', checked: !!표[i] });
    상자.addEventListener('change', () => {
      표[i] = 상자.checked; 저장();
      if (항목들.every((_, j) => 표[j])) 마침(열쇠);
    });
    return h('label', { class: 'check-item' }, 상자, h('span', {}, md(글)));
  }));
}

/** 자기 평가 — 잘함 / 보통 / 노력 필요 */
export function 자기평가(열쇠, 문장) {
  const 단계 = ['잘함', '보통', '노력 필요'];
  const 그룹 = h('div', { class: 'self-eval' });
  const 그리기 = () => 채우기(그룹, 단계.map((d) => h('button', {
    type: 'button', class: `chip${글읽기(열쇠) === d ? ' picked' : ''}`,
    onclick: () => { 글쓰기(열쇠, d); 마침(열쇠); 그리기(); },
  }, d)));
  그리기();
  return h('div', { class: 'self-box' }, h('p', {}, '🙋 ', md(문장)), 그룹);
}

export { 끝났나 };
