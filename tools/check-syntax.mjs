/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  소스 전수 검사.  `npm run check:syntax`
 *  `npm test` 는 화면 그리기(DOM)를 돌리지 않으므로, 괄호 하나 빠진 것이 빌드에서야 터지지 않게 여기서 본다.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';

const 뿌리 = process.cwd();
const 잘못 = [];
function 모으기(폴더, 모음 = []) {
  for (const 이름 of readdirSync(폴더)) {
    const 길 = join(폴더, 이름);
    if (statSync(길).isDirectory()) 모으기(길, 모음);
    else if (/\.(m?js|css)$/.test(이름)) 모음.push(길);
  }
  return 모음;
}
const 소스들 = [...모으기(join(뿌리, 'src')), ...모으기(join(뿌리, 'test')), ...모으기(join(뿌리, 'tools')), join(뿌리, 'vite.config.js')];
const 코드원문 = existsSync('입장코드.md') ? [...readFileSync('입장코드.md', 'utf-8').matchAll(/\*\*([가-힣0-9]{4,})\*\*/g)].map((m) => m[1]) : [];

for (const 길 of 소스들) {
  const 이름 = relative(뿌리, 길).replace(/\\/g, '/');
  const 글 = readFileSync(길, 'utf-8');
  // ① 문법
  if (!이름.endsWith('.css')) {
    try { execFileSync(process.execPath, ['--check', 길], { stdio: 'pipe' }); }
    catch (e) { 잘못.push(`${이름} — 문법 오류\n      ${String(e.stderr || e).split('\n').slice(0, 4).join('\n      ')}`); continue; }
  }
  // ② 저작권 머리 주석
  if (!글.startsWith('/*!') || !글.slice(0, 300).includes('© 2026 티쳐무')) 잘못.push(`${이름} — 머리에 /*! … © 2026 티쳐무 저작권 주석이 없다`);
  // ③ 원문자를 이름(식별자)에 쓰면 빌드가 깨진다
  const 원문자 = 글.match(/(?:function|const|let|var)\s+[^\s(=]*[①-⓿][^\s(=]*/);
  if (원문자) 잘못.push(`${이름} — 이름에 원문자를 썼다: ${원문자[0]}`);
  // ④ 브라우저 기본 대화상자 금지 (교실 화면에 주소가 함께 뜬다)
  const 기본창 = 글.match(/(?<![.\w])(alert|confirm|prompt)\s*\(/);
  if (기본창 && 이름.startsWith('src/')) 잘못.push(`${이름} — ${기본창[1]}() 대신 ui.js 의 창()·묻기() 를 쓸 것`);
  // ⑤ 단원 파일은 창 이벤트·타이머를 직접 걸지 않는다 (카드를 오갈 때마다 쌓인다)
  if (이름.startsWith('src/units/') && /window\.addEventListener|setInterval\(/.test(글)) 잘못.push(`${이름} — window 이벤트·setInterval 을 직접 썼다. ui.js 의 창이벤트()·타이머() 를 쓸 것`);
  // ⑥ 바깥으로 무엇을 보내지 않는다
  if (이름.startsWith('src/') && /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(글)) 잘못.push(`${이름} — 통신 코드를 쓰면 안 된다`);
  // ⑦ 입장 코드 원문이 소스에 들어가면 안 된다 (앱에는 해시만)
  for (const c of 코드원문) if (글.includes(c)) 잘못.push(`${이름} — 입장 코드 원문 「${c}」 가 들어 있다`);
  // ⑧ 「은(는)」 같은 조사 늘어놓기 금지 — ui.js 의 조사() 를 쓴다
  if (이름.startsWith('src/') && /[가-힣A-Za-z0-9」'"]\s?(은\(는\)|이\(가\)|을\(를\)|와\(과\))/.test(글)) 잘못.push(`${이름} — 「은(는)」 같은 조사 대신 조사() 를 쓸 것`);
}
// ⑨ 입장 코드 원문·낱말 목록이 저장소에 올라가지 않게 (사용자 지시 2026-10-22)
const 무시 = readFileSync(join(뿌리, '.gitignore'), 'utf-8');
for (const 줄 of ['입장코드*', '*.local.json']) if (!무시.split(/\r?\n/).includes(줄)) 잘못.push(`.gitignore — 「${줄}」 줄이 없다 (입장 코드가 저장소에 올라갈 수 있다)`);
if (existsSync('tools/codewords.local.json')) {
  const { 앞말 = [], 뒷말 = [] } = JSON.parse(readFileSync('tools/codewords.local.json', 'utf-8'));
  const 도구 = readFileSync(join(뿌리, 'tools/make_codes.mjs'), 'utf-8');
  const 들킴 = [...앞말, ...뒷말].filter((w) => 도구.includes(`'${w}'`) || 도구.includes(`"${w}"`));
  if (들킴.length) 잘못.push(`tools/make_codes.mjs — 낱말 목록이 들어 있다(${들킴.slice(0, 3).join(', ')}…). codewords.local.json 에만 둘 것`);
}

const 뼈대 = readFileSync(join(뿌리, 'src/main.js'), 'utf-8');
if (!뼈대.includes('푸터()')) 잘못.push('src/main.js — 화면에 푸터() 가 없다');

console.log(`\n  소스 ${소스들.length}개를 검사했습니다.`);
if (잘못.length) { for (const m of 잘못) console.log('  ✗', m); process.exit(1); }
console.log('  모두 통과\n');
