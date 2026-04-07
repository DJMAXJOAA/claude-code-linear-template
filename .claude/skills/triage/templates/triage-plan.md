# triage-plan 문서 템플릿

triage 후처리 파이프라인에서 planner agent가 생성하는 수정 계획 문서의 표준 양식.

## 양식

```markdown
---
linear_id: {LINEAR-ID}
title: "Triage Plan #{N}: {Issue 제목}"
type: triage-plan
created: {YYYY-MM-DD}
triage_round: {N}
---
> [Linear Issue]({URL})

## 분류 요약

| # | 항목 | 유형 | Phase | 우선순위 | 라우팅 | 병렬 |
|---|------|------|-------|---------|--------|------|
| 1 | {항목 설명} | {L1/L2/L3/backlog/P1/rework/directive/limitation/reminder} | {N} | {high/medium/low} | {executor/gen-hub/implement/feedback/comment} | {Y/N} |

## Phase 실행 계획

### Phase {N}: {Phase 이름}
- **대상 항목**: #{항목 번호}
- **실행 순서**: {순차/병렬}
- **처리 방법**: {구체적 처리 방법}
- **라우팅**: {실행자 + 모델}

## 결정사항 (인터뷰 모드 시)

| # | 주제 | 결정 | 근거 |
|---|------|------|------|
| 1 | {주제} | {결정 내용} | {근거} |

> 자동 계획 모드(Mode 2)에서는 이 섹션을 생략한다.

## Verification

- [ ] 모든 Phase가 순서대로 실행됨
- [ ] 각 항목이 올바른 라우팅 대상으로 처리됨
- [ ] 병렬 항목이 동시 실행됨
```

## 필드 정의

| 필드 | 설명 |
|------|------|
| `linear_id` | 활성 Issue의 Linear ID |
| `triage_round` | 점검 회차 번호 (기존 `triage-plan-*.md` 개수 + 1) |
| `유형` | triage 분류 결과 (L1/L2/L3/backlog/P1/rework/directive/limitation/reminder) |
| `Phase` | 실행 순서 그룹 (같은 Phase 내 병렬 가능) |
| `우선순위` | high(즉시)/medium(표준)/low(후순위) |
| `라우팅` | 유형별 실행자 매핑 (아래 테이블 참조) |
| `병렬` | 동일 Phase 내 병렬 실행 가능 여부 |

## 유형별 라우팅 매핑

| 유형 | 라우팅 대상 | 설명 |
|------|-----------|------|
| L1 | `oh-my-claudecode:executor` (sonnet) | 즉시 수정 |
| L2 | `oh-my-claudecode:executor` (sonnet) | 현재 Issue 내 개선 |
| L3 | gen-hub skill | 서브이슈 등록 (type: bug) |
| backlog | gen-hub skill | Issue 등록 (type: improvement) |
| P1 | dev-pipeline plan 수정 | 계획 수정 오케스트레이션 |
| rework | implement skill | plan.md Tasks 추가 + 재구현 |
| directive | feedback skill | 지침 등록 |
| limitation | Linear comment | 코멘트 기록 |
| reminder | Linear comment | 코멘트 기록 |

> Phase 분류 기준은 [references/post-pipeline.md](../references/post-pipeline.md) §프롬프트 패턴의 Phase 분류 기준 테이블을 참조한다.
