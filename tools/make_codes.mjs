/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  입장 코드 만들기.  `npm run codes`
 *  ① 쉬운 낱말 두 개를 무작위로 붙여 단원마다 코드를 만든다(예: 「꾸밈말+이름말」).
 *  ② 앱에는 해시만 넣는다 → src/codes.js
 *  ③ 원문은 교사용 파일 「입장코드.md」 에만 적는다 (.gitignore 로 저장소에서 뺀다).
 *  다시 실행하면 코드가 모두 바뀐다. 학기 중에 바꾸면 학생 기록의 열린 단원은 그대로 남는다.
 *
 *  ⚠ 낱말 목록은 이 파일에 두지 않는다. 목록이 공개되면 앱 속 해시를 낱말 조합으로 하나씩
 *    맞춰 보는 것만으로 코드를 알아낼 수 있기 때문이다. 목록은 로컬 전용 파일
 *    `tools/codewords.local.json` 에 둔다(.gitignore 의 *.local.json). 꼴:
 *      { "앞말": ["꾸밈말1", "꾸밈말2", …], "뒷말": ["이름말1", "이름말2", …] }   ← 8개 이상씩
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { randomInt, randomBytes } from 'node:crypto';
import { sha256 } from '../src/lib/sha256.js';
import { 코드다듬기 } from '../src/lib/normalize.js';

const 낱말파일 = 'tools/codewords.local.json';
if (!existsSync(낱말파일)) {
  console.error(`낱말 목록 ${낱말파일} 이 없습니다. 위 머리 주석의 꼴대로 만들어 주세요(저장소에는 올리지 않는 파일).`);
  process.exit(1);
}
const { 앞말, 뒷말 } = JSON.parse(readFileSync(낱말파일, 'utf-8'));
if (!(앞말?.length >= 8 && 뒷말?.length >= 8)) { console.error('앞말·뒷말을 8개 이상씩 넣어 주세요.'); process.exit(1); }

const 단원들 = [
  ['u1', '1단원 데이터 이해와 준비'],
  ['u2', '2단원 데이터 모델링과 평가'],
  ['u3', '3단원 데이터 과학 프로젝트 시작하기'],
  ['u4', '4단원 프로젝트 1-1 수면 시간과 비만율'],
  ['u5', '5단원 프로젝트 1-2 식생활과 비만율'],
  ['u6', '6단원 프로젝트 2 날씨와 옷차림'],
  ['u7', '7단원 프로젝트 3 여행지 추천'],
];

// 단원끼리 헷갈리지 않게 앞말·뒷말을 한 번씩만 쓴다
const 쓴것 = new Set();
function 새코드() {
  for (;;) {
    const 앞 = 앞말[randomInt(앞말.length)];
    const 뒤 = 뒷말[randomInt(뒷말.length)];
    if (!쓴것.has(앞) && !쓴것.has(뒤)) { 쓴것.add(앞); 쓴것.add(뒤); return 앞 + 뒤; }
  }
}

const 소금 = randomBytes(8).toString('hex');
const 코드 = Object.fromEntries(단원들.map(([id]) => [id, 새코드()]));
// 교사용 코드는 낱말 셋 + 숫자 둘로 길게 만든다(학생이 우연히 맞히지 않게)
코드.teacher = 새코드() + 뒷말[randomInt(뒷말.length)] + String(randomInt(10, 100));

const 해시 = Object.fromEntries(Object.entries(코드).map(([id, c]) => [id, sha256(`${소금}|${id}|${코드다듬기(c)}`)]));

writeFileSync('src/codes.js', `/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  입장 코드의 해시. tools/make_codes.mjs 가 만든다 — 손으로 고치지 말 것.
 *  코드 원문은 교사용 파일 「입장코드.md」 에만 있다(저장소에 올리지 않는다).
 */
export const 소금 = '${소금}';
export const 코드해시 = ${JSON.stringify(해시, null, 2)};
`);

const 오늘 = new Date().toISOString().slice(0, 10);
writeFileSync('입장코드.md', `# 오렌지 데이터 교실 — 입장 코드 (교사용)

만든 날: ${오늘} · **학생에게 이 파일을 보여 주지 마세요.** (저장소에도 올라가지 않습니다)

| 단원 | 입장 코드 |
|---|---|
${단원들.map(([id, 이름]) => `| ${이름} | **${코드[id]}** |`).join('\n')}
| 🔑 교사용 — 모든 단원 한 번에 열기 | **${코드.teacher}** |

- 띄어쓰기는 무시합니다. (\`노란 기차\` 도 \`노란기차\` 와 같습니다)
- 한 번 연 단원은 그 브라우저에서 계속 열려 있습니다. [내 기록 지우기] 를 누르면 다시 잠깁니다.
- 코드를 모두 바꾸려면 앱 폴더에서 \`npm run codes\` 후 \`npm run build\` 를 하세요.
`);
console.log('입장 코드를 새로 만들었습니다 → src/codes.js (해시), 입장코드.md (원문)');
for (const [id, 이름] of 단원들) console.log(`  ${이름}: ${코드[id]}`);
console.log(`  교사용: ${코드.teacher}`);
