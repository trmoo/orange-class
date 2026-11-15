# 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
# 6단원 실제 데이터와 오렌지 k평균군집화 결과를 앱 안으로 옮겨 적는다.   `npm run seoul`
#   읽는 것: data/2024_서울_날씨_정리데이터.csv (기상자료개방포털 서울 2024 일자료, CP949)
#   쓰는 것: src/data/seoul2024.js — 손으로 고치지 말 것.
#
# 오렌지 3.40.0 의 k평균군집화(Orange/widgets/unsupervised/owkmeans.py)가 하는 계산을 그대로 따른다.
#   ① 열 정규화(Normalize — 평균 0, 표준편차 1. 표준편차는 빈칸을 뺀 값들의 모표준편차)
#   ② KMeans.preprocessors = [Continuize(), SklImpute()] — 빈칸은 열 평균으로 채운다(정규화 뒤라 0)
#   ③ sklearn.cluster.KMeans(k-means++, n_init=10, max_iter=300, random_state=0)
#   ④ 실루엣 = silhouette_samples 의 평균(366줄 < 5000 이라 전부)
# ⚠ 채운 값은 계산에만 쓴다 — 오렌지가 내보내는 데이터에는 빈칸(?)이 그대로 남는다.
# 2026-11-15 사용자의 오렌지 화면(k = 7 데이터 테이블 31줄)과 군집·실루엣이 모두 같은 것을 확인했다.
# 필요한 것: numpy · pandas · scikit-learn (1.5.2 와 1.9.0 에서 같은 결과)
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_samples

뿌리 = Path(__file__).resolve().parent.parent
파일 = 뿌리 / 'data' / '2024_서울_날씨_정리데이터.csv'
표 = pd.read_csv(파일, encoding='cp949', dtype={0: str})
속성 = list(표.columns[1:])
X = 표[속성].to_numpy(float)


def 군집결과(정규화):
    Z = X.copy()
    if 정규화:
        Z = (Z - np.nanmean(Z, axis=0)) / np.nanstd(Z, axis=0)
    Z = np.where(np.isnan(Z), np.nanmean(Z, axis=0), Z)
    결과 = {}
    for k in range(2, 9):
        km = KMeans(n_clusters=k, init='k-means++', n_init=10, max_iter=300, random_state=0).fit(Z)
        s = silhouette_samples(Z, km.labels_)
        결과[k] = {'실': round(float(s.mean()), 6), '군집': ''.join(str(int(c)) for c in km.labels_)}
    return 결과


def 값(v):
    return None if pd.isna(v) else float(v)


날들 = [[r[0], *[값(v) for v in r[1:]]] for r in 표.itertuples(index=False)]
정규화 = 군집결과(True)
그대로 = 군집결과(False)
for 이름, 결과 in (('정규화', 정규화), ('그대로', 그대로)):
    print(이름, ' '.join(f"k{k}={결과[k]['실']:.3f}" for k in 결과))

글 = f"""/*! 오렌지 데이터 교실 — © 2026 티쳐무 · 모든 권리 보유
 *  6단원 실제 데이터 — tools/make_seoul2024.py 가 data/2024_서울_날씨_정리데이터.csv 로 만든다. 손으로 고치지 말 것.
 *  값은 기상청 기상자료개방포털(data.kma.go.kr) 서울 2024년 일자료이고(「모든 권리 보유」 해당 없음),
 *  군집 결과는 오렌지 3.40 의 k평균군집화와 같은 계산(정규화 → 빈칸 평균 → KMeans++ 10회, random_state 0)으로 셈한 것이다.
 *  날들: [일시, 강수량, 평균기온, 평균풍속, 일조합] — 빈칸은 null(강수량 빈칸은 비가 오지 않은 날).
 *  오렌지군집: 정규화(열 정규화 켬) · 그대로(끔) 마다 k = 2~8 의 실루엣 평균(실)과 날마다의 군집 번호(0 = C1).
 */
export const 출처 = '기상청 기상자료개방포털(data.kma.go.kr) 서울 2024년 일자료';
export const 속성 = {json.dumps(속성, ensure_ascii=False)};
export const 날들 = [
{chr(10).join('  ' + json.dumps(d, ensure_ascii=False) + ',' for d in 날들)}
];
export const 오렌지군집 = {json.dumps({'정규화': 정규화, '그대로': 그대로}, ensure_ascii=False, indent=2)};
"""
(뿌리 / 'src' / 'data' / 'seoul2024.js').write_text(글, encoding='utf-8')
print(f'src/data/seoul2024.js : {len(날들)} days, {len(속성)} columns')
