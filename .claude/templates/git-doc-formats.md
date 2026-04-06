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
