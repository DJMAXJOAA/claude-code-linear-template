# note.md 템플릿

> docs-writing.md §3-3 Nav Link 규칙 참조

```markdown
---
linear_id: {LINEAR-ID}
title: "Note: {Issue 제목}"
type: note
created: {YYYY-MM-DD}
---

> [Linear Issue]({URL})

## Handoff

| 항목 | 내용 |
|------|------|
| 마지막 완료 태스크 | — |
| 다음 태스크 | — |
| 빌드 상태 | — |
| 주의사항 | — |

## Work Log

## Checkpoints
```

## 갱신 규칙

| 섹션 | 갱신 패턴 | 시점 | 비고 |
|------|----------|------|------|
| Handoff | **덮어쓰기** (최신 스냅샷) | 태스크 배치 완료 시 | `/이어하기` 최우선 참조 |
| Work Log | **append** (시간순 누적, 무제한) | 태스크 완료, 결정 변경, 점검 결과 | plan.md Tasks 상태 갱신과 병행 |
| Checkpoints | **append** | 후행 환류 수신 시 | `[REF] {ID} 완료 — {요약}` |

## Work Log 엔트리 형식

```markdown
### {태스크 ID} — {제목}
{수정 내용 요약}
{ad-hoc 결정 사항 (있으면)}
{특이사항}
```

## 생명주기

| 단계 | 행동 |
|------|------|
| 생성 | `/등록` 시 폴더와 함께 (전 type). 빈 Handoff 테이블 + 빈 섹션 |
| 갱신 | 구현 중 자동 (implement 스킬이 Handoff + Work Log 갱신) |
| 읽기 | `/이어하기` 시 Handoff 우선, `/활성화` 시 존재 확인 |

> note.md는 동결되지 않는다. 이슈 전 기간 동안 실시간 갱신.

## type별 생성 조건

| 경로 | note.md 생성 |
|------|-------------|
| feature | 필수 |
| improvement-standard | 필수 |
| improvement-light | 필수 |
| bug | 필수 |
