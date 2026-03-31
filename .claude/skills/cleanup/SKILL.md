---
name: cleanup
description: "사후 문서화. 자유롭게 수정한 작업 내용을 사후에 정리하여 문서화. 파이프라인 역방향 플로우."
---

# cleanup — 사후 문서화

자유롭게 수정한 작업 내용을 사후에 정리하여 문서화한다.
기존 파이프라인("문서 → 구현")의 역방향 플로우("구현 → 문서").

## Trigger

- `/정리` 커맨드 호출 시
- `/정리 {LINEAR-ID}` — 기존 이슈에 반영
- `/정리 "{코멘트}"` — 작업 의도 힌트 전달
- `/정리 {LINEAR-ID} "{코멘트}"` — 조합

## Input

| 항목 | 설명 |
|------|------|
| (자동) git diff/staged/log | 변경 내용 자동 수집 |
| (옵션) Linear ID | 기존 이슈에 반영 시 |
| (옵션) 유저 코멘트 | 작업 의도 설명 (한 줄) |

### 상수

| 항목 | 기본값 | 비고 |
|------|--------|------|
| recent_commits_default | 5 | fallback 시 조회할 최근 커밋 수. 향후 `--commits=N` 인자 확장 가능 |

## Not In Scope

`/정리`는 사후 "기록" 도구이지 "설계" 도구가 아니다. 다음은 의도적으로 수행하지 않는다:

| 항목 | 이유 |
|------|------|
| plan.md 생성 | 사전 계획은 기존 파이프라인(gen-plan)의 영역 |
| Micro-tasking (태스크별 순차 실행) | 이미 완료된 작업이므로 실행 오케스트레이션 불필요 |
| verify (코드 품질 검증) | 사후 기록 시점에서 코드 검증은 범위 외. 필요 시 유저가 별도 `/검증` 호출 |
| issue-close 정규 프로세스 (Checkpoints 환류, spec 연동) | 사후 문서화의 범위 외. 필요 시 경로 B에서 issue-close 경유 선택 가능 |
| spec 문서 생성/갱신 | spec은 `/스펙` 스킬의 영역. issue-close 경유 시에만 연동 |

## Process (게이트 면제 — 자체 6단계)

> 4단계 게이트(G1~G4) 미적용. 이미 완료된 작업의 사후 기록이므로 계획→승인→저장→실행 사이클 부적합.

| 단계 | 행위 |
|------|------|
| 0. 가드 | git status 확인. staged/unstaged/recent commits 모두 비어있으면 "변경사항 없음" 안내 후 중단 |
| 1. 수집 | staged + unstaged diff를 우선 수집. 둘 다 비어있으면 최근 N커밋(기본 5) diff로 fallback. 변경 파일 목록, 패턴, 규모 산출 |
| 2. 추론 | 프로젝트 컨텍스트(CLAUDE.md, 아키텍처 문서, 기존 spec) 참조하여 변경 의도를 추상화. "파일 3개 수정" 수준이 아닌 "네임스페이스 경로 변경에 따른 일괄 리팩토링" 수준. 추론 실패 시 유저 코멘트 요청 fallback |
| 3. 확인 | `AskUserQuestion`으로 요약 제시 + 문서화 방향 선택 |
| 4. 분기 | 유저 선택에 따라 아래 경로 중 하나 실행 |
| 5. 문서화 | 선택된 경로로 문서 생성/갱신 |
| 6. (선택) Linear | Linear 이슈 생성 or 기존 이슈 갱신 |

### 단계 3: 확인 — AskUserQuestion 선택지

| 선택지 | 설명 | 후속 |
|--------|------|------|
| **(a)** 새 이슈 문서 생성 | Linear 이슈 + spec.md 생성 | 경로 A |
| **(b)** 기존 이슈에 반영 | Linear comment + 기존 문서 갱신 | 경로 B |
| **(c)** Linear 없이 커밋만 | `/커밋`으로 위임. 문서화 안 함 | 경로 C |
| **(d)** 커밋 + 간단 기록 | 커밋 + Linear comment만 (문서 미생성) | 경로 D |

> Linear ID가 인자로 전달된 경우: **(b)** 자동 선택, 확인만 수행

---

### 경로 A: 새 이슈 문서 생성

| 단계 | 행위 |
|------|------|
| A-1 | `AskUserQuestion`: type 선택 (feature/improvement/bug — AI 추천 포함) |
| A-2 | gen-hub 템플릿([skills/gen-hub/templates/issue-descriptions.md](../gen-hub/templates/issue-descriptions.md)) 참조하여 Linear Issue description 구성 (diff 추론 결과로 Overview/SC 자동 채움) |
| A-3 | `AskUserQuestion`: description 확인/수정 |
| A-4 | Linear Issue 생성 (state: **Done** — 이미 완료된 작업이므로) |
| A-5 | Git 폴더 생성: `docs/issue/{LINEAR-ID}/` 디렉토리 생성 (전 type) |
| A-6 | **spec.md 생성**: diff 추론 결과 기반으로 OMC 양식 간소화 버전 작성 (Goal + Constraints + 작업 내용). frontmatter 래핑 필수 (`type: spec`, `issue_type`, `linear_id`, `title`, `created`) |
| A-7 | 구현 결과를 **Linear comment**에 기록: issue-close 템플릿([skills/issue-close/templates/implementation-result.md](../issue-close/templates/implementation-result.md)) 참조 |
| A-8 | Linear Done comment 기록 (feature/improvement: 완료 요약. bug: Root Cause + 수정 방법 + 영향 범위) |
| A-9 | **문서 커밋**: `docs: ...` 형식 (Conventional Commits). 코드 커밋과 별도 |

> 경로 A는 issue-close를 경유하지 않는다. Checkpoints 환류/spec 연동이 필요하면 Done 생성 후 별도로 issue-close를 수동 호출할 것을 안내.

> 기존 gen-hub 스킬을 직접 호출하지 않고, 템플릿 파일만 런타임 참조하여 동적 구성한다 (복제 금지).
> gen-hub은 Todo 상태로 생성하는 반면, `/정리`는 Done으로 생성하므로 프로세스가 다르다.

### 경로 B: 기존 이슈에 반영

| 단계 | 행위 |
|------|------|
| B-1 | Linear MCP로 이슈 상태/type 조회. **Canceled/Duplicate 상태면 경고 출력 후 중단** |
| B-2 | `docs/issue/{LINEAR-ID}/` 폴더 존재 확인 |
| B-3a | 폴더 존재 + spec.md/plan.md 존재: 해당 문서의 관련 섹션 갱신 |
| B-3b | 폴더 존재 + 문서 미존재: **Linear comment**에 작업 요약 기록. progress.txt 존재 시 append |
| B-3c | 폴더 미존재: Git 폴더 생성 + **Linear comment**에 작업 요약 기록 |
| B-4 | 이슈 상태가 Done 미만이면: `AskUserQuestion`으로 Done 전이 여부 확인. 선택지: (a) issue-close 경유 Done (Checkpoints 환류 + spec 연동 포함) (b) 직접 Done 전이만 (문서 기록만, 환류 없음) |
| B-5 | Linear comment 기록 (변경 요약) |

### 경로 C: 커밋만

| 단계 | 행위 |
|------|------|
| C-1 | `/커밋` 스킬로 위임 (기존 Conventional Commits 프로세스 — 인자 패스스루, 동작 동일) |

### 경로 D: 커밋 + 간단 기록

| 단계 | 행위 |
|------|------|
| D-1 | `/커밋` 스킬로 커밋 수행 |
| D-2 | `AskUserQuestion`: Linear ID 입력 **또는 스킵**. 초기 `/정리` 호출 시 Linear ID가 있었으면 자동 사용 |
| D-3 | Linear ID 제공 시: Linear comment로 변경 요약 기록. **스킵 시: 커밋만으로 완료** |

> `/커밋` 실패 시 (pre-commit hook 등): 에러 안내 후 중단. D-2/D-3 스킵.

---

## Output

| 항목 | 경로 A | 경로 B | 경로 C | 경로 D |
|------|--------|--------|--------|--------|
| Linear Issue | 새로 생성 (Done) | 기존 갱신 | — | comment만 (또는 —) |
| spec.md | 생성 (경로 A) | 관련 섹션 갱신 (존재 시) | — | — |
| 구현 결과 | Linear comment 기록 | Linear comment 기록 | — | — |
| 커밋 | 문서 커밋 | 문서 커밋 | 코드 커밋 | 코드 커밋 |
| Linear comment | 완료 요약 | 변경 요약 | — | 변경 요약 (또는 —) |

### Output 소유권 선언 (§2-3a 준수)

cleanup 스킬은 "사후 문서화" 컨텍스트에서 다음 섹션의 생성/갱신 권한을 가진다:

| 문서 | 섹션 | 권한 | 정규 소유자 | 예외 근거 |
|------|------|------|------------|----------|
| spec.md | 전체 (경로 A 신규 생성 시) | 생성 | deep-interview | 사후 문서화는 파이프라인 외부 흐름. deep-interview의 정규 spec.md와 cleanup의 간소화 spec.md는 프로세스가 상이 |
| Linear comment | 작업 요약 (전 경로) | 생성 | — | cleanup 고유 채널 |

> 경로 A에서 spec.md는 deep-interview를 호출하지 않고, **cleanup이 직접 작성** (OMC 양식 간소화 버전: Goal + Constraints + 작업 내용). frontmatter 래핑 필수.
> 정규 소유자의 템플릿 파일을 SSOT로 참조한다 (복제 금지). 템플릿 형식 변경 시 cleanup도 자동 반영.

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| diff 분석 + 의도 추론 | 직접 수행 | sonnet |
| 대규모 변경 시 분석 | `oh-my-claudecode:explore` | haiku |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 경로 | 상세 |
|------|------|------|
| Issue 생성 | A | title, description, labels, state: Done |
| Issue 상태/type 조회 | B | `get_issue`. Canceled/Duplicate 가드 |
| Issue 상태 전이 → Done | B | 사용자 승인 시 |
| comment 기록 | A, B, D | 변경 요약 |
| Label/Project 조회 | A | 태그 추천용 (gen-hub 패턴 동일) |
