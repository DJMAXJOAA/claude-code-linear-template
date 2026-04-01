---
name: triage
description: "수동 테스트 결과를 분석하여 9유형으로 분류하고 라우팅하는 순수 분류기. /점검 커맨드에서 호출."
---

# triage — 수동 테스트 결과 분류 및 라우팅

수동 테스트 결과를 분석하여 9유형으로 분류하고, G2 Approval Table을 통해 사용자 승인을 받은 뒤 분류 결과를 반환하는 **순수 분류기(Pure Classifier)**.

triage는 **분류 + Linear comment 기록 + sub-issue 등록**까지 수행한다. 코드를 직접 수정하지 않으며, L1 즉시 수정은 사용자 확인 인터뷰(G4c)를 거친 후에만 실행한다.

## Trigger

- `/점검` 커맨드에서 자동 호출
- implement Skill 완료 후 수동 테스트 결과 수집 시점

## Input

| 항목 | 설명 |
|------|------|
| 테스트 결과 프롬프트 | 사용자가 전달한 자유 형식 테스트 결과 텍스트 |
| Linear ID | 활성 Issue의 Linear ID (없으면 독립 호출 모드) |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` — 구현 범위 판단용 (있는 경우) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | `oh-my-claudecode:analyst` 에이전트(haiku)에 테스트 결과 + Issue 컨텍스트 전달 |
| 2 (G1) | Analyst가 입력 파싱 → 개별 항목 분리 → 8유형 분류 (아래 §분류 알고리즘) |
| 3 (G2) | **Approval Table** 생성 → `AskUserQuestion`으로 사용자 승인. plan scope 항목은 테이블 상단 배치 + 먼저 처리 (plan 수정이 다른 항목 분류에 영향 가능) |
| 4 (G3) | **저장**: Linear comment에 분류 결과 기록 + SC 체크 갱신 (§SC 체크 처리 참조). Git 산출물 없음 — 순수 분류기이므로 G3 Linear 단방향 |
| 5 (G4a) | **분류 결과 반환**: 승인된 항목의 유형별 라우팅 가이드를 안내 |
| 6 (G4b) | **Sub-issue 자동 등록**: L3/backlog 항목 → gen-hub 경유 sub-issue 자동 생성 (§Sub-issue 자동 등록 참조) |
| 7 (G4c) | **L1 즉시 수정 확인**: L1 항목 존재 시 `AskUserQuestion`으로 즉시 수정 여부 확인 (§L1 즉시 수정 확인 참조) |
| 8 (G4d) | **커밋**: G4a~G4c에서 발생한 Git 변경사항을 커밋 (§커밋 참조) |

## Output

| 항목 | 내용 |
|------|------|
| Linear comment | 분류 결과 요약 기록 (Triage Log) |
| 분류 결과 | 각 항목의 유형 + 라우팅 가이드 안내 |
| Sub-issue | L3/backlog 항목의 Linear sub-issue (gen-hub 경유, parentId 연결) |
| 커밋 | G4a~G4c 처리로 발생한 Git 변경사항 커밋 (§커밋 참조) |

---

## 분류 알고리즘 (scope × nature 2축)

### scope 축

| 값 | 기준 |
|----|------|
| **in-scope** | plan.md 태스크 범위 내 이슈 |
| **out-of-scope** | plan.md Tasks 범위 밖 이슈 |
| **framework** | 프레임워크/프로세스 개선 |
| **plan** | 계획(spec.md/plan.md) 자체의 오류 — 구현·테스트는 plan대로 정상이나 사용자 의도(SC/Issue 설명)와 불일치 |

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
| in-scope × knowledge | **limitation** | **Linear comment**에 기록 (progress.txt 존재 시 append) |
| * × * (임시 메모) | **reminder** | **Linear comment**에 기록 |
| plan × defect (P1 자격 충족) | **P1** | 자체수정: dev-pipeline이 plan.md 수정 조율 → implement 재호출 |
| plan × defect (P1 자격 미충족) | **L3** | 기존 L3 처리 + parent sub-issue 연결. 블로킹 라이프사이클 적용 |
| plan × improvement | **backlog** | 기존 backlog 처리. 현재 이슈는 정상 진행 |
| plan × knowledge | **limitation** | Linear comment에 기록 (별도 라우팅 불필요) |
| in-scope × defect (In Review 사용자 점검) | **rework** | **plan.md 존재 시**: plan.md Tasks에 정리 태스크 추가 → implement 재호출로 재구현. **plan.md 미존재 시(bug/improvement-Light)**: Linear comment에 수정 항목 기록 → bug-fix/improvement-fix가 executor를 직접 재호출. 조건: `/점검` 경유 + triage G2 승인 필수 (pipeline.md §1-4 예외 3) |

### plan scope 판단 기준

**plan 여부 판별**: 다음 조건을 모두 만족하면 scope = `plan`
1. 구현 코드가 plan.md의 설계대로 정확히 동작함
2. 테스트가 plan.md Verification 기준으로 통과함
3. 그러나 실제 동작이 사용자의 의도(SC 또는 Issue 설명)와 불일치

> **plan.md 미존재 type 예외**: plan.md가 없는 type/intensity(bug 전체, improvement-Light)에서는 plan scope를 적용하지 않는다. 해당 시나리오에서 '설계와 의도 불일치'는 out-of-scope × defect(L3)로 분류한다.

> **주의**: SC 자체가 처음부터 잘못된 경우(요구사항 오류)는 plan scope가 아닌
> out-of-scope × defect (L3)로 분류. plan scope는 "SC는 맞지만 plan이 SC를
> 달성하는 방법이 잘못된 경우"에 한정.

### P1 자격 기준 (plan × defect에서 P1 vs L3 분기)

plan × defect로 분류된 항목이 **모든 조건을 충족**하면 P1, 하나라도 미충족 시 L3:

| # | 조건 | P1 | L3 (fallback) |
|---|------|:---:|:---:|
| 1 | SC(성공기준) 변경 불필요 | O | 별도 SC 필요 |
| 2 | plan.md Tasks 수정/추가 1~2개 이내 | O | 3개 이상 |
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
| limitation | **Linear comment** 기록 | limitation 기록 (progress.txt 존재 시 append) |
| backlog | G4b에서 gen-hub 경유 Issue 자동 생성 | type: improvement. **plan scope인 경우**: parentId 연결. 현재 이슈는 정상 진행 |
| reminder | **Linear comment** 기록 | Triage Log에 포함 |
| P1 | dev-pipeline (plan 수정 오케스트레이션) | plan.md 수정 (docs: 커밋) → implement 재호출 → 구현 수정 (feat:/fix: 커밋) → verify 재실행 |
| rework | implement (재구현) | plan.md Tasks에 정리 태스크 추가 → Linear State → In Progress → implement 재호출. verify 재실행 후 다시 In Review. 조건: `/점검` 경유 + triage G2 승인 필수 (pipeline.md §1-4 예외 3) |

---

## Sub-issue 자동 등록 (G4b)

G2 Approval Table에서 승인된 L3/backlog 항목에 대해 **gen-hub를 경유**하여 sub-issue를 자동 생성한다. gen-hub의 프로세스를 반드시 따르되, triage에서 이미 완료된 단계만 생략한다.

| 항목 | 내용 |
|------|------|
| 대상 유형 | L3 (out-of-scope defect, plan defect P1 미충족), backlog (out-of-scope improvement, plan improvement) |
| type 매핑 | L3 → bug, backlog → improvement |
| parentId | 현재 활성 Issue의 Linear ID |
| 블로킹 설정 | plan scope L3 → **Linear comment**에 `Blocking: {ID}` 기록 + progress.txt 존재 시 append (pipeline.md §4-4a) |
| 비-plan scope | parentId만 설정. 블로킹 미적용 |
| 복수 항목 | gen-hub 배치 모드 활용. Linear 컨텍스트 1회 캐싱 |

### gen-hub 경유 시 단계별 처리

| gen-hub 단계 | 처리 | 사유 |
|-------------|------|------|
| G0 (Linear 컨텍스트 조회) | **필수 경유** | Label/Project 목록 필요 |
| G1 (사용자 입력 수집) | **생략** | triage G2 Approval Table에서 title/type 이미 승인됨. triage가 title + description 초안 + type을 외부 호출자로서 전달 |
| G1a (AI 추론: Summary, SC 초안) | **필수 경유** | triage 분류 결과를 입력으로 Summary + SC를 추론. SC가 없는 Issue 등록 방지 |
| G2 (type별 description 템플릿 구성 + 사용자 확인) | **템플릿 적용 필수, 사용자 확인 생략** | [templates/issue-descriptions.md](templates/issue-descriptions.md)의 type별 템플릿으로 description 마크다운 조립 필수. 사용자 확인은 triage G2에서 이미 승인되었으므로 생략 |
| G3 (Linear Issue 생성) | **필수 경유** | title, description(템플릿 적용), labels, state: Todo, parentId 지정 |
| G4 (Linear Issue ID 획득) | **필수 경유** | `{LINEAR-ID}` 추출 |
| G5 (Git 폴더 생성) | **조건부 경유** | `docs/issue/{LINEAR-ID}/` 생성. **bug type은 G5 스킵** (Git 폴더 미생성 원칙). gen-hub 내부 type 분기로 처리 |
| G6 (Linear description에 Git 경로 삽입) | **조건부 경유** | Documents 섹션에 참조 문서 경로 기록. **bug type은 G6 스킵** (Git 폴더 없음). Documents는 파이프라인 진행 시 동적 추가 |

> L3/backlog 항목이 없으면 G4b는 스킵.

---

## L1 즉시 수정 확인 (G4c)

G4a/G4b 완료 후, L1 항목이 존재하면 `AskUserQuestion`으로 즉시 수정 여부를 확인한다.

| 선택지 | 행동 |
|--------|------|
| 즉시 수정 | `oh-my-claudecode:executor`(sonnet)에 위임하여 수정 실행. coding.md 준수 명시 |
| implement에서 처리 | L1을 plan.md Tasks에 fix 태스크로 추가하도록 안내. 현재 세션에서 미수정 |
| 스킵 | 수정하지 않음. Triage Log에만 기록 유지 |

> L1 항목이 없으면 G4c는 스킵.

---

## SC 체크 처리

G3 저장 단계에서 Linear description의 Success Criteria 체크박스를 갱신한다.

| 항목 | 내용 |
|------|------|
| 대상 | Linear Issue description의 `## Success Criteria` 섹션 |
| 동작 | 사용자 테스트 결과에서 **명시적으로 정상 동작이 보고된** SC 항목만 `- [ ]` → `- [x]`로 체크 처리 |
| 판정 주체 | analyst 에이전트가 사용자 테스트 결과 텍스트와 SC 항목을 1:1 매핑하여 판정 |
| 미언급 항목 | `- [ ]` 유지 (미테스트로 간주). L1/rework로 분류된 항목과 연관된 SC도 체크하지 않음 |
| 체크 해제 금지 | 이미 `- [x]`인 항목을 `- [ ]`로 되돌리지 않음. 후속 verify가 최종 판정 |
| 갱신 시점 | G3 Linear comment 기록과 함께 1회 수행 (`save_issue`로 description 갱신) |
| 독립 호출 모드 | Linear ID 없으면 SC 체크 **스킵** (description 자체가 없음) |
| SC 섹션 없는 Issue | `## Success Criteria` 섹션 미존재 시 **스킵** |

> 전체 SC가 충족된 경우에도 Done 전이는 issue-close에서 수행. triage는 중간 체크만 담당.
> verify가 후속 실행되어 SC를 재검증하므로, triage의 SC 체크는 진행 상황 가시성 목적이다.

---

## 커밋 (G4d)

G4a~G4c 처리로 발생한 **모든 Git 변경사항을 1개 커밋으로 통합**하여 `/커밋` 경유로 수행한다.

| 항목 | 내용 |
|------|------|
| 트리거 | G4a~G4c 완료 후, `git status`에 변경사항이 존재할 때 |
| 스킵 조건 | 변경사항 없으면 G4d 스킵 |
| 커밋 방식 | `/커밋` (Conventional Commits) 경유 |
| **통합 원칙** | **점검 1회 실행 = 1개 커밋**. L1 수정, 문서 갱신, sub-issue 폴더 생성 등 모든 변경을 하나의 커밋에 포함 |

### 커밋 유형 결정

| 변경 내용 | type | 예시 |
|-----------|------|------|
| 문서만 변경 (plan.md, sub-issue 폴더, directive 등) | `docs` | `docs({ID}): triage 분류 결과 반영` |
| 코드 변경 포함 (L1 즉시 수정 등) | `fix` | `fix({ID}): triage 분류 결과 반영 및 L1 수정` |

> 코드 변경이 하나라도 포함되면 `fix` 사용. 문서만이면 `docs`.

### L1 수정 실패 시 처리

| 상황 | 행동 |
|------|------|
| L1 수정 성공 | 코드 + 문서 통합 커밋 (`fix` type) |
| L1 수정 실패 (빌드 깨짐, 부분 완료 등) | 코드 변경을 `git checkout`으로 원복 → 문서 변경만 `docs` 커밋. L1은 미수정 상태로 Triage Log에 기록 유지 |

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
| SC 체크박스 갱신 (`save_issue`) | G3 단계, description SC 섹션 `- [ ]` → `- [x]` 갱신. 독립 호출/SC 미존재 시 스킵 |
| 분류 결과 요약 comment | G4a 완료 후 1회 |
| L3/backlog sub-issue 자동 생성 | G4b, gen-hub 경유. parentId + type(bug/improvement) 지정 |
| plan scope L3 블로킹 comment | sub-issue 생성 시 블로킹 사유 포함 |
| P1 판정 근거 + plan 수정 사유 기록 | P1 처리 시 comment |
