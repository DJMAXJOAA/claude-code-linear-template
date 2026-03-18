# type별 description 템플릿

gen-hub 스킬이 Linear Issue 생성 시 사용하는 description 마크다운 템플릿.

## feature / improvement 공통

```markdown
## Overview
| 항목 | 내용 |
|------|------|
| What | {한 줄 설명} |
| Why | {필요성} |
| Priority | {High/Medium/Low} |

---

## Success Criteria
{Pre-Plan Q/A에서 확정 — 등록 시점에는 비워둠}

---

## Git Documents
- Index: `docs/{type}/{LINEAR-ID}/_index.md`

---

## Source References
{관련 소스 파일 경로 — 등록 시점에는 비워둠}
```

## bug

```markdown
## Overview
| 항목 | 내용 |
|------|------|
| What | {버그 증상 한 줄} |
| Reproduction | {재현 절차 요약} |
| Priority | {High/Medium/Low} |

---

## Acceptance Criteria
1. {수정 후 기대 동작}

---

## Git Documents
- Index: `docs/bug/{LINEAR-ID}/_index.md`

---

## Source References
{관련 소스 파일 경로}
```
