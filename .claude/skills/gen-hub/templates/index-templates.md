# _index.md 템플릿 (SSOT)

이 파일이 `_index.md` 템플릿의 **SSOT**이다. docs-writing.md §2 및 gen-hub SKILL.md는 이 파일을 참조한다.

## 템플릿 규칙

| 항목 | 규칙 |
|------|------|
| 생성 시점 | `/등록` 시 항상 생성 (gen-hub) |
| Linear Issue 링크 | gen-hub이 Linear API 응답의 URL을 직접 삽입. 수동 URL 조합 금지 |
| Documents 테이블 | 존재하는 파일은 상대경로 링크 + ✅. 미생성 파일은 `—` + `미생성` |
| 구현 결과 섹션 | feature-close 시 lazy-creation. 최초 생성 시 빈 placeholder |
| 상태 컬럼 갱신 | 파일 생성/삭제 시 Documents 테이블 갱신 |
| Decisions 섹션 | Pre-Plan Q/A Phase 1에서 Decisions 항목 확정 시 기록. 구현 중 설계 결정 발생 시 추가 |
| Notes 섹션 | 피드백(limitation), triage log, Known Limitations 발생 시 기록 |
| 태스크 로그 | Linear comment로 기록. _index.md에는 포함하지 않음 |

## type별 변형 원칙

| type | Decisions | 태스크 로그 | 특이사항 |
|------|-----------|------------|---------|
| `feature` / `improvement` | 포함 | Linear comment | 설계 결정은 Git, 태스크 진행 로그는 Linear |
| `bug` | 불필요 | Linear comment | `## Notes > ### Root Cause` 섹션 포함. 태스크 없이 직접 수정 |

---

## feature / improvement 공통

```markdown
---
linear_id: {LINEAR-ID}
title: {제목}
type: index
issue_type: {feature|improvement}
created: {YYYY-MM-DD}
---

> [Linear Issue]({LINEAR-API-응답-URL})

## Documents

| 문서 | 경로 | 설명 | 상태 |
|------|------|------|------|
| Plan | — | 설계 문서 | 미생성 |
| Checklist | — | 태스크/검증 체크리스트 | 미생성 |
| Spec | {spec 레퍼런스 존재 시: [spec-name](../../spec/spec-name/) + ✅, 미존재 시: 행 자체 생략} | {요구사항 명세} | {선택적} |

## Decisions

## Notes

## 구현 결과

{feature-close 시 lazy-creation}
```

## bug

```markdown
---
linear_id: {LINEAR-ID}
title: {제목}
type: index
issue_type: bug
created: {YYYY-MM-DD}
---

> [Linear Issue]({LINEAR-API-응답-URL})

## Documents

| 문서 | 경로 | 설명 | 상태 |
|------|------|------|------|

## Notes

### Root Cause

{수정 완료 후 기록}

## 구현 결과

{feature-close 시 lazy-creation}
```
