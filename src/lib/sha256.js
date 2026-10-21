/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  SHA-256 (동기식). 입장 코드를 앱 안에 글자 그대로 두지 않으려고 쓴다.
 *  브라우저의 crypto.subtle 은 비동기이고 file:// 에서 막히는 경우가 있어 직접 구현했다.
 */
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/** 글자를 UTF-8 로 바꿔 SHA-256 을 구하고 16진수 64자로 돌려준다 */
export function sha256(글) {
  const 바이트 = new TextEncoder().encode(글);
  const 길이 = 바이트.length;
  const 칸수 = ((길이 + 9 + 63) >> 6) << 6;
  const 덩이 = new Uint8Array(칸수);
  덩이.set(바이트);
  덩이[길이] = 0x80;
  const 비트 = 길이 * 8;
  const 보기 = new DataView(덩이.buffer);
  보기.setUint32(칸수 - 4, 비트 >>> 0);
  보기.setUint32(칸수 - 8, Math.floor(비트 / 2 ** 32));

  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const W = new Uint32Array(64);
  const 돌림 = (x, n) => (x >>> n) | (x << (32 - n));
  for (let 시작 = 0; 시작 < 칸수; 시작 += 64) {
    for (let i = 0; i < 16; i++) W[i] = 보기.getUint32(시작 + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = 돌림(W[i - 15], 7) ^ 돌림(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = 돌림(W[i - 2], 17) ^ 돌림(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = 돌림(e, 6) ^ 돌림(e, 11) ^ 돌림(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = 돌림(a, 2) ^ 돌림(a, 13) ^ 돌림(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += hh;
  }
  return Array.from(H, (x) => x.toString(16).padStart(8, '0')).join('');
}
