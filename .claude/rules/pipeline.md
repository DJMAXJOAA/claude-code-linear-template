---
paths:
  - "docs/issue/**"
  - ".claude/skills/**"
description: 파이프라인 규칙 — type별 워크플로우, 게이트, Micro-tasking, Linear sync
---

# Pipeline Rules

## §1 Type별 워크플로우

### 1-1. Type 목록

| Type | 설명 | 워크플로우 |
|------|------|-----------|
| `feature` | 새 기능 개발 | Planning → In Progress → In Review → Done |
| `improvement` | 기존 기능 개선·리팩토링 | size별 분기: light(In Progress 직행) / standard(Planning → In Progress → In Review → Done) |
| `bug` | 버그 수정 | In Progress → In Review → Done |

> improvement는 dev-pipeline에서 size 판별(AskUserQuestion 1회) 후 improvement-fix 스킬로 라우팅. 상세: [improvement-fix SKILL.md](../skills/improvement-fix/SKILL.md)

### 1-2. 통합 상태 흐름 (Linear Workflow States)

`Backlog → Todo → Planning → In Progress → In Review → Done`

| 상태 | category | 설명 |
|------|----------|------|
| Backlog | `backlog` | 미정리/아이디어 |
| Todo | `unstarted` | 등록 완료, 우선순위 확정 |
| Planning | `started` | pre-plan + plan (+review) |
| In Progress | `started` | implement + auto-verify |
| In Review | `started` | 사용자 직접 확인 |
| Done | `completed` | 완료 |
| Canceled / (Duplicate) | `canceled` | 취소/중복 |

### 1-3. Type별 스킬 분기

> Type별 스킬 분기 상세: [dev-pipeline SKILL.md](../skills/dev-pipeline/SKILL.md) 라우팅 테이블 참조

### 1-4. 상태 전이 규칙

| 규칙 | 내용 |
|------|------|
| 전이 방향 | 항상 앞으로만 진행. 역방향 전이 금지 (재작업 시 새 Issue 등록). **예외: P1 계획수정, improvement light→standard 에스컬레이션** — 아래 참조 |
| 스킵 자동화 | type에 `—`인 상태는 dev-pipeline이 자동으로 다음 상태로 건너뜀 |
| 전이 시 행동 | 모든 상태 전이는 §4 Linear sync 프로토콜을 경유 |
| 전이 트리거 | 스킬 완료 시 자동 전이. 사용자가 수동 전이하지 않음 |
| auto-verify | In Progress 완료 후 verify 스킬 자동 호출. 별도 상태 없음 |
| In Review 전이 | verify PASS 후 호출 스킬(implement/dev-pipeline)이 In Review로 전이 |

> **예외 1: P1 계획수정** — triage에서 P1 판정 + G2 승인 시에만 In Progress 내 done 태스크 선별 리셋 허용.
> 조건: SC 변경 없음, CL S1 태스크 1~2개 수정/추가, 수정 라인 < 30%. 조건 미충족 시 L3(sub-issue) 전환.
> **예외 2: improvement light→standard 에스컬레이션** — 코드 수정 전(승인~코드수정 사이)에만 In Progress 내에서 Planning 진입 허용. 코드 수정 시작 후에는 새 Issue 등록. 상세: [improvement-fix SKILL.md](../skills/improvement-fix/SKILL.md)

---

## §2 4단계 게이트

### 2-1. 게이트 정의

| 게이트 | 행위자 | 내용 |
|--------|--------|------|
| **G1. 계획(Plan)** | AI | 다음 작업/단계 계획 수립 |
| **G2. 검토(Review)** | 사용자 | 계획 확인 및 승인. 승인 전 실행 시작 금지 |
| **G3. 저장(Store)** | AI | 승인된 계획을 Git 문서에 기록 + Linear 상태 갱신 (dual write) |
| **G4. 실행(Execute)** | AI | 저장된 계획 기준으로 Micro-tasking 방식 실행 |

### 2-2. 게이트 위반 방지

| 금지 패턴 | 설명 |
|-----------|------|
| G2 생략 | 사용자 승인 없이 실행 시작 금지 |
| G3 생략 | Git 기록 + Linear 갱신 없이 실행 시작 금지 |
| G1 → G4 직행 | 계획 후 검토·저장 없이 실행 금지 |
| G3 부분 실행 | Git만 저장하고 Linear 미갱신 (또는 그 반대) 금지. Linear 장애 시 §4 fallback 적용 |

### 2-3. G3 dual write 규칙

| 원칙 | 내용 |
|------|------|
| dual write 필수 | G3에서는 Git 기록 + Linear 갱신을 반드시 함께 수행 |
| 부분 실행 금지 | Git만 저장하고 Linear 미갱신 (또는 그 반대) 금지 |
| 장애 시 fallback | Linear 실패 시 §4 fallback 적용. Git은 정상 진행 |
| 스킬별 상세 | 각 스킬의 `## Linear MCP 호출 패턴` 섹션에서 구체적 행동 정의 |

### 2-3a. _index.md 갱신 주체 원칙

> **원칙**: 각 스킬은 자신이 담당하는 섹션만 갱신한다. 타 스킬 담당 섹션을 직접 수정하지 않는다. 갱신 주체는 각 스킬의 Output 섹션에서 자체 선언한다.

### 2-4. G3-terminal 스킬 패턴

| 항목 | 내용 |
|------|------|
| 정의 | G1→G2→G3으로 완결. G4는 후속 Skill의 자체 게이트 사이클에 위임 |
| 적용 대상 | issue-close |
| 특징 | 스킬 자체는 Git 기록 + Linear 갱신(G3)으로 완료 |

### 2-5. 인터뷰 원칙

| 규칙 | 내용 |
|------|------|
| AskUserQuestion 필수 | 모든 인터뷰·Q/A·선택 요청은 AskUserQuestion 도구로 수행. 자유 텍스트 출력 후 암묵적 대기 금지 |
| 전환점마다 인터뷰 | 단계 전환 시 AskUserQuestion으로 사용자에게 확인 |
| AI 권장안 명시 | 질문 시 AI 추천 선택지를 `(AI 권장)` 라벨과 함께 제시 |
| 가정 금지 | 모호한 요구사항은 AskUserQuestion으로 반드시 질문 |

---

## §3 Micro-tasking

### 3-1. 핵심 규칙

**에이전트 당 1개 태스크**만 진행 → 결과 검수 → 다음 이동.
| 항목 | 내용 |
|------|------|
| 태스크 단위 | CL 문서의 S1 태스크 목록 |
| 체크리스트 갱신 | 태스크 완료 직후 CL S1 체크박스 즉시 갱신 |
| 커밋 규칙 | verify 완료 후 커밋. 규모가 크면 중간 커밋 허용. Conventional Commits. `/커밋` 참조 |
| 게이트 연계 | 태스크 완료 후 4단계 게이트(§2)를 경유하여 다음 태스크로 이동 |
| 금지 패턴 | 여러 단계 일괄 지시, "알아서 다 처리해" 식 실행, 같은 파일을 수정하는 태스크 동시 실행 |

> **P1 plan 수정**: 영향받은 done 태스크만 선별 리셋. 새 태스크는 기존 시퀀스 이어서 부여. 수정 후 verify 재실행 필수.
> 의존성 기반 실행 + sub-issue 동기화: [implement SKILL.md](../skills/implement/SKILL.md) 참조

---

## §4 Linear sync 프로토콜

### 4-1. 상태 전이 호출 규칙

| 트리거 | Linear 행동 |
|--------|------------|
| 파이프라인 단계 전환 | Issue 상태 전이 (§1 상태 흐름) |
| 태스크 시작/완료 | sub-issue 상태 갱신 |
| Plan 완료 | comment 추가 (태스크 수, 주요 설계 결정) |
| verify 완료 | comment 추가 (PASS/FAIL + 항목별 요약) |
| verify PASS | 상태 → In Review |
| issue-close | 상태 → Done + 완료 comment + description 미러링 |
| /점검 결과 기록 | comment 추가 |

> 구체적 MCP 파라미터는 각 스킬의 `### Linear MCP` 섹션에 명시.

### 4-2. 장애 시 fallback

| 상황 | 행동 |
|------|------|
| API 실패 / MCP 미응답 | 경고 출력 → Git 정상 진행 → 수동 Linear 갱신 안내 |
| 부분 실패 | 성공 부분 유지 + 실패 부분 경고 출력 |
| 재시도 | 자동 재시도 없음. 1회 후 즉시 fallback |

### 4-3. 읽기 최적화 규칙

> 상세: [context.md](docs/guides/context.md) §2 참조

### 4-4. Sub-issue 라이프사이클

#### 4-4a. 블로킹 라이프사이클 (plan scope L3)

plan scope에서 L3(sub-issue)로 분류되어 triage G4b에서 자동 등록된 경우에 적용:

| 단계 | 행동 |
|------|------|
| **블로킹 진입** (sub-issue 생성 시) | In Progress 유지. `_index.md` Notes에 `### Blocking: {ID}` + 사유 기록. CL Handoff에 기록. 나머지 태스크 계속 진행 가능 |
| **블로킹 해제** (다음 `/활성화` 시) | _index.md Blocking 섹션 확인 → `get_issue`로 sub-issue 상태 조회 → Done이면 해제+기록 갱신, 미완료면 사용자 안내 |
| **Linear 상태** | 현재 이슈 In Progress 유지. 가시성은 _index.md + Linear comment로 확보 |

#### 4-4b. 일반 sub-issue 확인

triage에서 등록된 모든 sub-issue(L3/backlog)는 `/활성화` 시 상태를 확인한다:

| 단계 | 행동 |
|------|------|
| **확인** | Linear MCP로 child sub-issue 전체 조회 → 미완료 목록 추출 |
| **리마인딩** | dev-pipeline §Sub-issue 리마인딩 테이블로 출력 (생성 사유 + 블로킹 여부 포함) |
| **진행 결정** | `AskUserQuestion`으로 사용자 선택 (계속/sub-issue 먼저/대기). 블로킹 항목은 강조 |
| **Done 갱신** | sub-issue가 Done이면 _index.md Blocking 섹션 해제 + 기록 갱신 |

> child sub-issue가 없으면 이 단계를 스킵.

## §5 참조 링크

| 항목 | 상세 문서 |
|------|---------|
| Pre-Compaction / 50% 규칙 | [context.md](../../docs/guides/context.md) §3 |
| Pre-Plan Q/A / Post-Plan Q/A | [dev-pipeline SKILL.md](../skills/dev-pipeline/SKILL.md) |
| 피드백 기록 | [feedback SKILL.md](../skills/feedback/SKILL.md) |

---

## §6 파이프라인 금지사항

| 금지 | 이유 |
|------|------|
| Issue 구현 중 프레임워크 문서 업데이트 | 범위 분리. 단, 링크된 spec의 Change Log 갱신은 issue-close에서 허용 |
| 리뷰 단계에서 즉시 코드 수정 | 메모만 — 계획 우선 |
| 검증 실패 시 임의 우회 | 계획 수정 후 재구현 |
| 계획 범위 외 코드 수정 | 범위 초과 금지 |
| Linear 상태를 Git 파일에 복제 | 상태 SSOT = Linear. Git에 status 속성 금지 |

---

## §7 에이전트 라우팅

- OMC(oh-my-claudecode) 에이전트 연동은 각 스킬의 `## OMC 에이전트 연동` 섹션에서 정의한다
- OMC 비활성 시 각 스킬은 기본 모델로 직접 수행한다. 비활성이 감지되면 사용자에게 알린다
- 에이전트 모델 기본값: 설계=opus, 구현=sonnet, 탐색=haiku

---

## §8 파이프라인 외부 스킬

| 스킬 | 설명 |
|------|------|
| `/스펙` (spec) | SDD Spec 문서 생성. 5+1 게이트 파이프라인(G1~G5 + G3a), `docs/spec/{name}/` 단위 출력 (`_index.md` + `requirements.md` + `technical.md` + `roadmap.md`(선택)). Issue 파이프라인과 독립 |
| `/정리` (cleanup) | 사후 문서화. 구현 → 문서 역방향 플로우. 4단계 게이트 면제. Linear 등록 선택적 |

> 파이프라인 외부 스킬은 Linear Issue 상태 전이를 수행하지 않는다.
> 예외: `/정리`는 경로 A(새 이슈)에서 Done 상태로 직접 생성, 경로 B(기존 이슈)에서 Done 전이를 수행할 수 있다.

### §8-1 파이프라인 외부 스킬의 문서 소유권

파이프라인 외부 스킬이 정규 파이프라인 스킬 소유 섹션을 생성/갱신하는 경우, §2-3a 원칙에 따라 해당 스킬의 Output 섹션에서 소유권을 자체 선언해야 한다. 정규 소유자의 템플릿을 SSOT로 참조하며 복제하지 않는다.
