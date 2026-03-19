# type별 description 템플릿

gen-hub 스킬이 Linear Issue 생성 시 사용하는 description 마크다운 템플릿.

## feature / improvement 공통

```markdown
## Overview
| 항목 | 내용 |
|------|------|
| What | {한 줄 설명} |
| Why | {필요성/배경} |
| Priority | {High/Medium/Low} |

---

## Spec Summary
{요구사항 핵심 요약 2~5문장 — AI가 사용자 입력 기반 추론 초안 작성 → 사용자 확인}

---

## Constraints
{제약사항/비기능 요구사항 — AI 추론 초안 → 사용자 확인. 없으면 섹션 자체 생략}

---

## Success Criteria
1. {AI 추론 초안 → 사용자 확인. Pre-Plan에서 보완}

---

## Documents
| 유형 | 경로 | 설명 |
|------|------|------|
| Index | `docs/issue/{LINEAR-ID}/_index.md` | Issue 허브 |
| Spec | {있을 때만: `docs/spec/{spec-name}/` 또는 `docs/spec/{spec-name}/{doc}.md#{section}`} | {요구사항 명세} |
| {기타} | {경로} | {참조 문서, 스크립트, 설정 등} |

> - Spec 행: 참조 spec 미존재 시 행 자체 생략
> - 기타 행: 추가 참조 문서 없으면 행 자체 생략
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

## Documents
| 유형 | 경로 | 설명 |
|------|------|------|
| {기타} | {경로} | {참조 문서, 스크립트, 설정 등} |

> - bug는 Git 문서(`_index.md`)를 생성하지 않으므로 Index 행 없음
> - 참조 문서 없으면 Documents 섹션 자체 생략
```
