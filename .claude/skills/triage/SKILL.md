# triage — 수동 테스트 결과 분류 및 라우팅

수동 테스트 결과를 분석하여 8유형으로 분류하고, G2 Approval Table을 통해 사용자 승인을 받은 뒤 분류 결과를 반환하는 **순수 분류기(Pure Classifier)**.

triage는 **분류 + Triage Log 기록 + sub-issue 등록**까지 수행한다. 코드를 직접 수정하지 않으며, L1 즉시 수정은 사용자 확인 인터뷰(G4c)를 거친 후에만 실행한다.

## Trigger

- `/점검` 커맨드에서 자동 호출
- implement Skill 완료 후 수동 테스트 결과 수집 시점

## Input

| 항목 | 설명 |
|------|------|
| 테스트 결과 프롬프트 | 사용자가 전달한 자유 형식 테스트 결과 텍스트 |
| Linear ID | 활성 Issue의 Linear ID (없으면 독립 호출 모드) |
| CL 문서 | `docs/issue/{LINEAR-ID}/cl.md` — 구현 범위 판단용 (있는 경우) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | `oh-my-claudecode:analyst` 에이전트(haiku)에 테스트 결과 + Issue 컨텍스트 전달 |
| 2 (G1) | Analyst가 입력 파싱 → 개별 항목 분리 → 8유형 분류 (아래 §분류 알고리즘) |
| 3 (G2) | **Approval Table** 생성 → `AskUserQuestion`으로 사용자 승인. plan scope 항목은 테이블 상단 배치 + 먼저 처리 (plan 수정이 다른 항목 분류에 영향 가능) |
| 4 (G3) | **저장**: `_index.md > ## Notes > ### Triage Log`에 분류 결과 기록 + Linear comment에도 기록 |
| 5 (G4a) | **분류 결과 반환**: 승인된 항목의 유형별 라우팅 가이드를 안내 |
| 6 (G4b) | **Sub-issue 자동 등록**: L3/backlog 항목 → gen-hub 경유 sub-issue 자동 생성 (§Sub-issue 자동 등록 참조) |
| 7 (G4c) | **L1 즉시 수정 확인**: L1 항목 존재 시 `AskUserQuestion`으로 즉시 수정 여부 확인 (§L1 즉시 수정 확인 참조) |

## Output

| 항목 | 내용 |
|------|------|
| _index.md | Notes > Triage Log 섹션에 분류 결과 기록 |
| Linear comment | 분류 결과 요약 기록 |
| 분류 결과 | 각 항목의 유형 + 라우팅 가이드 안내 |
| Sub-issue | L3/backlog 항목의 Linear sub-issue (gen-hub 경유, parentId 연결) |

---

## 분류 알고리즘 (scope × nature 2축)

### scope 축

| 값 | 기준 |
|----|------|
| **in-scope** | CL S1 태스크 범위 내 이슈 |
| **out-of-scope** | CL S1 범위 밖 이슈 |
| **framework** | 프레임워크/프로세스 개선 |
| **plan** | 계획(plan.md/cl.md) 자체의 오류 — 구현·테스트는 plan대로 정상이나 사용자 의도(SC/Issue 설명)와 불일치 |

### nature 축

| 값 | 기준 |
|----|------|
| **defect** | 의도와 다른 동작 (버그) |
| **improvement** | 동작은 맞지만 개선 여지 |
| **knowledge** | 규칙/지침/제약 |

### 8유형 매핑

| scope × nature | 유형 | 처리 |
|---------------|------|------|
| in-scope × defect | **L1** | 가이드 + 즉시 수정 확인 인터뷰 (G4c) |
| in-scope × improvement | **L2** | 현재 Issue 내 개선 검토 |
| out-of-scope × defect | **L3** | 별도 Issue 등록 |
| out-of-scope × improvement | **backlog** | Linear Issue 생성 |
| framework × knowledge | **directive** | rules/guides에 등록 |
| in-scope × knowledge | **limitation** | _index.md Notes Known Limitations에 기록 |
| * × * (임시 메모) | **reminder** | _index.md Notes에 기록 |
| plan × defect (P1 자격 충족) | **P1** | 자체수정: dev-pipeline이 plan/cl 수정 조율 → implement 재호출 |
| plan × defect (P1 자격 미충족) | **L3** | 기존 L3 처리 + parent sub-issue 연결. 블로킹 라이프사이클 적용 |
| plan × improvement | **backlog** | 기존 backlog 처리. 현재 이슈는 정상 진행 |
| plan × knowledge | **limitation** | 기존 limitation 처리 (별도 라우팅 불필요) |

### plan scope 판단 기준

**plan 여부 판별**: 다음 조건을 모두 만족하면 scope = `plan`
1. 구현 코드가 plan.md의 설계대로 정확히 동작함
2. 테스트가 CL S3 기준으로 통과함
3. 그러나 실제 동작이 사용자의 의도(SC 또는 Issue 설명)와 불일치

> **주의**: SC 자체가 처음부터 잘못된 경우(요구사항 오류)는 plan scope가 아닌
> out-of-scope × defect (L3)로 분류. plan scope는 "SC는 맞지만 plan이 SC를
> 달성하는 방법이 잘못된 경우"에 한정.

### P1 자격 기준 (plan × defect에서 P1 vs L3 분기)

plan × defect로 분류된 항목이 **모든 조건을 충족**하면 P1, 하나라도 미충족 시 L3:

| # | 조건 | P1 | L3 (fallback) |
|---|------|:---:|:---:|
| 1 | SC(성공기준) 변경 불필요 | O | 별도 SC 필요 |
| 2 | CL S1 태스크 수정/추가 1~2개 이내 | O | 3개 이상 |
| 3 | 수정 코드 라인 비율 < 30% (수정+추가 라인 / 전체 구현 라인) | O | ≥ 30% |

> 3개 조건은 AND 관계. 하나라도 미충족 → L3(sub-issue)로 분류.

---

## 라우팅 대상 안내 테이블

| 유형 | 라우팅 대상 | 행동 |
|------|-----------|------|
| L1 | G4c 사용자 확인 후 executor 위임 | `AskUserQuestion`으로 즉시 수정 여부 확인. 승인 시 executor(sonnet) 위임, 미승인 시 implement 루프에서 처리하도록 안내 |
| L2 | 사용자에게 안내 | **분기**: (a) 현재 CL에 태스크 추가 → implement 루프 복귀, (b) 별도 improvement Issue 등록 (`/등록`). 기준: 현재 구현 범위에서 수정 가능하면 (a), 독립적 개선이면 (b) |
| L3 | G4b에서 gen-hub 경유 sub-issue 자동 생성 | type: bug. parentId로 현재 Issue 연결. **plan scope인 경우**: 블로킹 라이프사이클 적용 (pipeline.md §4-4a 참조) |
| directive | feedback Skill | directive 유형으로 전달 |
| limitation | _index.md Notes 직접 기록 | Known Limitations에 추가 |
| backlog | G4b에서 gen-hub 경유 Issue 자동 생성 | type: improvement. **plan scope인 경우**: parentId 연결. 현재 이슈는 정상 진행 |
| reminder | _index.md Notes 직접 기록 | Triage Log에 포함 |
| P1 | dev-pipeline (plan 수정 오케스트레이션) | plan/cl 수정 (docs: 커밋) → implement 재호출 → 구현 수정 (feat:/fix: 커밋) → verify 재실행 |

---

## Sub-issue 자동 등록 (G4b)

G2 Approval Table에서 승인된 L3/backlog 항목에 대해 gen-hub를 경유하여 sub-issue를 자동 생성한다.

| 항목 | 내용 |
|------|------|
| 대상 유형 | L3 (out-of-scope defect, plan defect P1 미충족), backlog (out-of-scope improvement, plan improvement) |
| type 매핑 | L3 → bug, backlog → improvement |
| parentId | 현재 활성 Issue의 Linear ID |
| gen-hub G2 생략 | triage G2 Approval Table에서 이미 승인됨. title/description는 triage 분류 결과에서 자동 생성 |
| 블로킹 설정 | plan scope L3 → `_index.md`에 `### Blocking: {ID}` 기록 + CL Handoff 기록 (pipeline.md §4-4a) |
| 비-plan scope | parentId만 설정. 블로킹 미적용 |
| 복수 항목 | gen-hub 배치 모드 활용. Linear 컨텍스트 1회 캐싱 |

> L3/backlog 항목이 없으면 G4b는 스킵.

---

## L1 즉시 수정 확인 (G4c)

G4a/G4b 완료 후, L1 항목이 존재하면 `AskUserQuestion`으로 즉시 수정 여부를 확인한다.

| 선택지 | 행동 |
|--------|------|
| 즉시 수정 | `oh-my-claudecode:executor`(sonnet)에 위임하여 수정 실행. coding.md 준수 명시 |
| implement에서 처리 | L1을 CL S1에 fix 태스크로 추가하도록 안내. 현재 세션에서 미수정 |
| 스킵 | 수정하지 않음. Triage Log에만 기록 유지 |

> L1 항목이 없으면 G4c는 스킵.

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 분류 분석 (기본) | `oh-my-claudecode:analyst` | haiku |
| 분류 분석 (plan scope 판별) | `oh-my-claudecode:analyst` | **sonnet** — plan.md Goal/Approach 비교 추론 필요 |
| L1 수정 실행 (G4c 승인 시) | `oh-my-claudecode:executor` | sonnet |

> plan scope 판별 조건: 테스트 결과에 "의도와 다른 동작", "설계 오류", "plan이 잘못" 등의 키워드 또는 사용자 명시 시 sonnet으로 격상.
>
> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| 분류 결과 요약 comment | G4a 완료 후 1회 |
| L3/backlog sub-issue 자동 생성 | G4b, gen-hub 경유. parentId + type(bug/improvement) 지정 |
| plan scope L3 블로킹 comment | sub-issue 생성 시 블로킹 사유 포함 |
| P1 판정 근거 + plan 수정 사유 기록 | P1 처리 시 comment |
