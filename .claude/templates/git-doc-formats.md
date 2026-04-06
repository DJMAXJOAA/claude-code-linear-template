# Git 문서 표준 양식

Git 관리 문서(spec.md, plan.md, technical.md, outcome)의 표준 양식 정의. frontmatter 구조, doc_type별 섹션 레이아웃, 네비게이션 링크 패턴을 규정.

## Frontmatter 표준

모든 `docs/issue/{LINEAR-ID}/` 하위 문서에 적용:

```markdown
---
linear_id: {LINEAR-ID}
title: "{Type}: {Issue 제목}"
type: {doc_type}
created: {YYYY-MM-DD}
---
> [Linear Issue]({URL})
```

### 필드 정의

| 필드 | 값 | 설명 |
|------|---|------|
| `linear_id` | `PRJ-N` | Linear Issue ID |
| `title` | `"{Type}: {제목}"` | Type = Plan/Technical/Spec 등 |
| `type` | `spec` / `plan` / `technical` | 문서 유형 |
| `created` | `YYYY-MM-DD` | 생성일 |

### spec.md 추가 필드

```yaml
issue_type: feature / improvement / bug
```

---

## doc_type별 필수 섹션

### spec.md

**정규 양식** (deep-interview/spec 스킬 경유):
- Goal
- Constraints
- Requirements (FR-NNN, EARS 형식)
- Technical Design

**간소화 양식** (cleanup 경유):
- Goal
- Constraints
- 작업 내용

### plan.md

ralplan 산출물 래핑. 필수 섹션:
- Goal
- Approach
- Tasks (테이블: ID, Task, Dependencies, Status)
- Verification
- Outcome (초기 빈 섹션 → issue-close에서 기록)

```markdown
---
linear_id: {LINEAR-ID}
title: "Plan: {Issue 제목}"
type: plan
created: {YYYY-MM-DD}
---
> [Linear Issue]({URL})

(이하 OMC ralplan 네이티브 콘텐츠)
```

### technical.md

ralplan 산출물 래핑. 구조는 자유이나 frontmatter 필수:

```markdown
---
linear_id: {LINEAR-ID}
title: "Technical: {Issue 제목}"
type: technical
created: {YYYY-MM-DD}
---
> [Linear Issue]({URL})

(이하 OMC ralplan 네이티브 콘텐츠)
```

### outcome (plan.md Outcome 섹션)

issue-close에서 plan.md의 `## Outcome` 빈 섹션에 기록. `issue-close/templates/implementation-result.md` 양식 참조.

---

## 네비게이션 링크

frontmatter 직후 Linear Issue URL 링크를 삽입:

```markdown
> [Linear Issue](https://linear.app/team/issue/{LINEAR-ID})
```

---

## 디렉토리 구조

```
docs/issue/{LINEAR-ID}/
├── spec.md          # 항상 생성
├── plan.md          # Planning 시 생성
├── technical.md     # Planning 시 생성
├── prd.json         # In Progress 시 생성 (선택)
└── progress.txt     # In Progress 시 생성 (ralph 관리)
```

> feature, improvement(Standard/Deep)만 Git 폴더 생성. improvement-Light 및 bug는 Git 폴더 미생성.

---

## progress.txt

> **원본은 OMC**(`src/hooks/ralph/progress.ts`)이며, 프레임워크에서는 관찰된 형식으로 기술한다. progress.txt의 생성·갱신은 ralph가 자체 관리한다.

ralph 실행 루프의 append-only 진행 기록. 이전 iteration의 학습 내용과 코드베이스 패턴을 다음 iteration에 전달하여 메모리 지속성을 제공한다.

### 파일 구조

```
# Ralph Progress Log
Started: {ISO timestamp}

## Codebase Patterns
- {패턴 설명}
- {패턴 설명}

---

## [{YYYY-MM-DD HH:MM}] - {storyId}

**What was implemented:**
- {구현 항목}

**Files changed:**
- {파일 경로}

**Learnings for future iterations:**
- {학습 내용}

---
```

### 섹션 설명

| 섹션 | 설명 |
|------|------|
| `# Ralph Progress Log` | 파일 헤더. `Started: {ISO timestamp}`로 시작 시각 기록 |
| `## Codebase Patterns` | 코드베이스에서 발견된 패턴 목록 (append-only). 초기값: `(No patterns discovered yet)` |
| `## [{date} {time}] - {storyId}` | 엔트리 헤더. story(태스크) 단위 진행 기록 |
| `**What was implemented:**` | 구현 내용 목록 |
| `**Files changed:**` | 변경 파일 목록 |
| `**Learnings for future iterations:**` | 다음 iteration을 위한 학습 내용 |
| `---` | 엔트리 구분자 (Codebase Patterns 섹션 종료 + 엔트리 간 구분) |

### 갱신 주체

| 주체 | 행동 |
|------|------|
| ralph | 생성, 엔트리 추가, 패턴 추가 (자체 관리) |
| implement | ralph 미사용 시(feature-Light, improvement-Light/Standard) 직접 관리 |
| triage/feedback | limitation 기록 시 append (progress.txt 존재 시) |
| bug | progress.txt 미생성 |
