/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  빌드 결과 점검 — 크기 · 저작권 표시 · 바깥 자원 0개 · 코드 원문이 없는지.
 */
import { readFileSync, statSync, existsSync } from 'node:fs';

const 길 = 'dist/index.html';
const 글 = readFileSync(길, 'utf-8');
const 잘못 = [];
const 크기 = statSync(길).size;
if (크기 < 80000) 잘못.push(`크기가 너무 작다(${크기}바이트) — 개발용 껍데기가 빌드된 것 아닌가?`);
const 저작권 = (글.match(/티쳐무/g) || []).length;
if (저작권 < 3) 잘못.push(`「티쳐무」가 ${저작권}번뿐 — HTML 주석·배너·푸터 셋은 있어야 한다`);
if (!글.includes('/*! 오렌지 데이터 교실')) 잘못.push('/*! 배너가 지워졌다 (esbuild.legalComments 확인)');
if (/<script[^>]+src=|<link[^>]+rel="stylesheet"/.test(글)) 잘못.push('바깥 파일을 부르는 태그가 있다 — 한 파일로 합쳐지지 않았다');
if (/src="\/src\//.test(글)) 잘못.push('/src/main.js 를 부른다 — 개발용 index.html 이다');
if (existsSync('입장코드.md')) {
  for (const m of readFileSync('입장코드.md', 'utf-8').matchAll(/\*\*([가-힣0-9]{4,})\*\*/g)) if (글.includes(m[1])) 잘못.push(`빌드본에 입장 코드 원문 「${m[1]}」 가 들어 있다`);
}
console.log(`\n  dist/index.html ${크기.toLocaleString()}바이트 · 티쳐무 ${저작권}회`);
if (잘못.length) { for (const m of 잘못) console.log('  ✗', m); process.exit(1); }
console.log('  빌드 점검 통과\n');
