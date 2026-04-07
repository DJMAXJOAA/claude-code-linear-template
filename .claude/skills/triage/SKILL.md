---
name: triage
description: "수동 테스트 결과를 9유형으로 분류하고, 후처리 파이프라인(인터뷰/자동계획/스킵)으로 라우팅하는 분류+처리 오케스트레이터. /점검 커맨드에서 호출."
---

# triage — 수동 테스트 결과 분류 및 후처리 파이프라인

수동 테스트 결과를 분석하여 9유형으로 분류하고, G2 Approval Table을 통해 사용자 승인을 받은 뒤, **3-Mode 후처리 파이프라인**(인터뷰/자동계획/스킵)으로 라우팅하는 **분류+처리 오케스트레이터**.

triage는 **분류 + Linear comment 기록 + sub-issue 등록 + 후처리 계획 수립/실행**까지 수행한다. Mode 1/2에서 planner agent가 triage-plan 문서를 생성하고 Phase별 유형 라우팅으로 실행한다. Mode 3(스킵)에서는 기존 G4a~G4d 로직으로 동작한다.

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
| 0 (G0) | **변경 감지**: `git diff`로 사용자 직접 수정 사항 감지 + 변경 요약 생성 (§변경 감지 참조) |
| 1 (G1) | `oh-my-claudecode:analyst` 에이전트(haiku)에 테스트 결과 + G0 변경 요약 + Issue 컨텍스트 전달 |
| 2 (G1) | Analyst가 입력 파싱 → 개별 항목 분리 + **G0 변경 사항을 독립 분류 항목으로 등록** → 8유형 분류 (아래 §분류 알고리즘, §G0 변경 항목 분류 참조) |
| 3 (G2) | **Approval Table** 생성 → `AskUserQuestion`으로 사용자 승인. plan scope 항목은 테이블 상단 배치 + 먼저 처리 (plan 수정이 다른 항목 분류에 영향 가능) |
| 4 (G3) | **저장**: `linear-comment-writer` 에이전트를 호출하여 분류 결과 comment를 기록 + SC 체크 갱신 (§SC 체크 처리 참조). Git 산출물 없음 — 순수 분류기이므로 G3 Linear 단방향 |
| 5 (G4-NEW) | **모드 선택**: `AskUserQuestion`으로 후처리 모드 선택 — Mode 1(인터뷰) / Mode 2(자동계획) / Mode 3(스킵). 독립 호출 모드(Linear ID 없음)는 Mode 3만 허용 (§후처리 파이프라인 참조) |
| 6 (G4-NEW) | **Mode 1/2**: planner agent 호출 → triage-plan 문서 생성 → 사용자 검토 → G5-NEW 실행. 상세: [references/post-pipeline.md](references/post-pipeline.md) |
| 7 (G4-NEW) | **Mode 3 (스킵)**: 기존 G4a~G4d 로직 실행 — 분류 결과 반환 → Sub-issue 등록 → L1 즉시 수정 확인 → 커밋 (§스킵 모드 처리 참조) |
| 8 (G5-NEW) | **Phase별 실행** (Mode 1/2만): triage-plan의 Phase 순서대로 유형별 기존 라우팅 실행 → 커밋. 상세: [references/post-pipeline.md](references/post-pipeline.md) |

## Output

| 항목 | 내용 |
|------|------|
| 변경 요약 | G0에서 생성한 사용자 변경 사항 요약 (코드 변경 없으면 생략) |
| Linear comment | 분류 결과 요약 기록 (Triage Log) |
| 분류 결과 | 각 항목의 유형 + 라우팅 가이드 안내 |
| Sub-issue | L3/backlog 항목의 Linear sub-issue (gen-hub 경유, parentId 연결) |
| 커밋 | G4a~G4c 처리로 발생한 Git 변경사항 커밋 (§커밋 참조) |

---

## 변경 감지 (G0)

테스트 결과 분류 전, `git diff`로 사용자가 직접 수정한 코드를 감지하고 요약한다. 이 요약은 G1 분류 분석의 추가 컨텍스트로 활용된다.

| 항목 | 내용 |
|------|------|
| 트리거 | `/점검` 호출 시 가장 먼저 실행 |
| 스킵 조건 | `git diff`에 변경사항이 없으면 G0 스킵 → G1으로 직행 |
| diff 범위 | `git diff HEAD` (staged + unstaged). 문서 파일(`docs/**`, `*.md`)은 제외하고 **코드 파일만** 대상 |

### 변경 요약 생성

| 단계 | 행위 |
|------|------|
| 0a | `git diff HEAD -- . ':!docs/' ':!*.md'`로 코드 변경 사항 수집 |
| 0b | 변경 파일 목록 + 변경 유형(추가/수정/삭제) + 변경 라인 수 추출 |
| 0c | 변경 내용 요약 생성 (파일별 1줄 요약 — 무엇을 왜 변경했는지 추론) |

### 변경 요약 형식

```
## 사용자 변경 요약 (G0)
- `src/auth/login.ts` (수정, +12/-3): 로그인 실패 시 에러 메시지 분기 추가
- `src/utils/format.ts` (수정, +5/-2): 날짜 포맷 유틸 함수 수정
변경 파일: 2개 | 총 변경: +17/-5
```

### G1 연계

| 항목 | 내용 |
|------|------|
| 분류 입력 확장 | G1에서 analyst에게 테스트 결과 + **변경 요약**을 함께 전달 |
| 분류 정확도 향상 | 사용자가 "로그인 에러 수정함"이라고만 보고해도, G0 변경 요약으로 구체적 변경 범위를 파악하여 정확한 scope 판단 가능 |

### G0 변경 항목 분류 (G1에서 수행)

G0에서 감지된 각 변경 파일(또는 논리적 변경 단위)은 **G1에서 독립 분류 항목으로 등록**된다. 사용자 테스트 결과 항목과 동일하게 8유형 분류 알고리즘을 적용한다.

| 규칙 | 내용 |
|------|------|
| 독립 항목 등록 | G0 변경 요약의 각 파일/변경 단위를 개별 분류 항목으로 등록. 사용자 테스트 항목과 병합하지 않음 |
| 테스트 결과와 매칭 | G0 변경 항목이 사용자 테스트 결과의 특정 항목과 **동일 대상**이면, 해당 테스트 항목에 `(G0 변경 확인)` 태그 부착 + G0 항목은 별도 등록하지 않음 (중복 방지) |
| 미언급 변경 감지 | G0에서 감지되었으나 사용자 테스트 결과에 **언급되지 않은** 변경은, Approval Table에 `(G0 감지 — 미테스트)` 표기하여 독립 항목으로 등록 |
| 분류 목적 | **로그 기록**: Triage Log에 변경 사항 분류 결과를 기록하여 추적성 확보. **작업 분리**: 변경 사항별 scope/nature를 판별하여 후속 라우팅(L1/L2/backlog 등) 근거 제공 |
| Approval Table 배치 | G0 감지 항목은 사용자 테스트 항목 **뒤에** 별도 섹션으로 배치. 헤더: `### G0 변경 감지 항목` |

> G0는 순수 읽기 단계로 코드를 수정하지 않는다.

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

G2 Approval Table에서 승인된 L3/backlog 항목에 대해 **gen-hub 스킬을 호출**하여 sub-issue를 생성한다. `save_issue` MCP 직접 호출 금지 — 반드시 gen-hub 스킬 위임 (pipeline.md §4-1a).

| 항목 | 내용 |
|------|------|
| 대상 유형 | L3 (out-of-scope defect, plan defect P1 미충족), backlog (out-of-scope improvement, plan improvement) |
| type 매핑 | L3 → bug, backlog → improvement |
| parentId | 현재 활성 Issue의 Linear ID |
| 블로킹 설정 | plan scope L3 → **Linear comment**에 `Blocking: {ID}` 기록 + progress.txt 존재 시 append (pipeline.md §4-4a) |
| 비-plan scope | parentId만 설정. 블로킹 미적용 |
| 복수 항목 | gen-hub 배치 모드 활용. Linear 컨텍스트 1회 캐싱 |

### gen-hub 스킬 호출 패턴

triage는 gen-hub 스킬을 **외부 호출자**로서 호출한다. gen-hub가 description 템플릿 적용, Linear 생성, Git 폴더 생성을 모두 수행한다.

**전달 파라미터:**

| 파라미터 | 값 | 설명 |
|---------|-----|------|
| title | triage G2 Approval Table의 승인된 제목 | — |
| description 초안 | triage 분류 결과 요약 텍스트 | gen-hub G1a에서 Summary + SC 추론 입력으로 사용 |
| type | `bug` (L3) 또는 `improvement` (backlog) | gen-hub가 type별 description 템플릿 적용 |
| parentId | 현재 활성 Issue의 Linear ID | sub-issue 연결 |
| skipUserConfirm | `true` | triage G2에서 이미 승인됨 → gen-hub G1(입력 수집) 생략, G2(사용자 확인) 생략 |

**gen-hub 내부 동작 (triage가 관여하지 않음):**
- G0: Linear 컨텍스트 조회 (Label/Project)
- G1a: Summary + SC 초안 추론
- G2: type별 description 템플릿 적용 ([templates/issue-descriptions.md](templates/issue-descriptions.md))
- G3~G6: Linear Issue 생성 → ID 획득 → Git 폴더 생성(bug 제외) → description에 경로 삽입(bug 제외)

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
| 변경 감지 (G0) | triage 직접 수행 | — (`git diff` 실행 + 요약 생성) |
| 분류 분석 (기본) | `oh-my-claudecode:analyst` | haiku |
| 분류 분석 (plan scope 판별) | `oh-my-claudecode:analyst` | **sonnet** — plan.md Goal/Approach 비교 추론 필요 |
| L1 수정 실행 (G4c 승인 시) | `oh-my-claudecode:executor` | sonnet |

### 프레임워크 에이전트

| Agent | 역할 | 호출 시점 |
|-------|------|----------|
| `linear-comment-writer` | 분류 결과 comment 작성 (triage-log) | G3 — Linear comment 기록 시 |

> plan scope 판별 조건: 테스트 결과에 "의도와 다른 동작", "설계 오류", "plan이 잘못" 등의 키워드 또는 사용자 명시 시 sonnet으로 격상.
>
> OMC 비활성 시: pipeline.md §7 참조.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| SC 체크박스 갱신 (`save_issue`) | G3 단계, description SC 섹션 `- [ ]` → `- [x]` 갱신. 독립 호출/SC 미존재 시 스킵 |
| 분류 결과 요약 comment | G4a 완료 후 1회 (에이전트 위임) |
| L3/backlog sub-issue 자동 생성 | G4b, **gen-hub 스킬 호출**로 위임 (§4-1a). triage는 `save_issue` 직접 호출 금지 |
| plan scope L3 블로킹 comment | sub-issue 생성 시 블로킹 사유 포함 |
| P1 판정 근거 + plan 수정 사유 기록 | P1 처리 시 comment |

---

## 후처리 파이프라인 (G4-NEW → G5-NEW)

G3 완료 후, `AskUserQuestion`으로 후처리 모드를 선택한다.

### 모드 선택 (G4-NEW)

| 모드 | 설명 | 조건 |
|------|------|------|
| **Mode 1 (인터뷰)** | 분류 항목별 처리 방안을 인터뷰로 결정 `(AI 권장)` | Linear ID 필수 |
| **Mode 2 (자동 계획)** | AI가 수정 계획을 자동 작성한 후 검토 | Linear ID 필수 |
| **Mode 3 (스킵)** | 분류 결과 코멘트/로그만 기록하고 완료 | 항상 허용 |

> **독립 호출 모드 가드**: Linear ID가 없는 독립 호출 시 Mode 3(스킵)만 허용. Mode 1/2 선택 시 "Linear ID가 필요합니다" 안내 후 Mode 3으로 폴백.

### Mode 1/2: planner 기반 후처리

상세 로직은 [references/post-pipeline.md](references/post-pipeline.md)를 참조한다.

**요약:**
1. `omc:planner` agent를 격리된 세션에서 호출
2. 분류 결과 전체 + plan.md 컨텍스트 + Linear payload를 Input으로 전달
3. Mode 1: 주제별 인터뷰 Q/A 진행 → triage-plan 문서 생성
4. Mode 2: 자동으로 triage-plan 문서 생성
5. `AskUserQuestion`으로 사용자 검토 (진행/수정/거부)
6. 승인 시 G5-NEW Phase별 실행으로 이동

### Mode 3: 스킵 모드 처리

기존 G4a~G4d 로직을 실행한다 (§스킵 모드 처리 참조).

### Phase별 실행 (G5-NEW)

Mode 1/2에서 triage-plan 승인 후 실행. 상세 로직은 [references/post-pipeline.md](references/post-pipeline.md)를 참조한다.

**요약:**
1. triage-plan의 Phase 순서대로 실행
2. 유형별 기존 라우팅 재활용 (§라우팅 대상 안내 테이블 참조)
3. 동일 Phase 내 병렬 가능 항목은 병렬 실행
4. 전체 Phase 완료 후 `/커밋`

### triage-plan 문서

| 항목 | 내용 |
|------|------|
| 위치 | `docs/issue/{LINEAR-ID}/triage-plan-{N}.md` |
| 넘버링 | 기존 `triage-plan-*.md` glob 카운트 + 1 |
| 양식 | [templates/triage-plan.md](templates/triage-plan.md) 참조 |
| 기존 plan.md | 변경 없음. triage-plan은 별도 문서 |

---

## 스킵 모드 처리 (기존 G4a~G4d)

Mode 3(스킵) 선택 시 또는 독립 호출 모드에서 실행되는 기존 처리 로직. Mode 1/2 선택 시 이 섹션은 스킵되고 G4-NEW → G5-NEW 경로가 실행된다.

> 아래 G4a~G4d는 기존 로직을 그대로 유지한다. 변경 없음.
