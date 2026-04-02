# Post-Plan Q/A (Feature/Improvement Standard/Deep 공통)

Planning 상태에서 spec.md + plan.md 존재 확인 후, 다음 행동을 사용자에게 선택받는 인터랙션.

> **적용 대상**: Feature Standard/Deep, Improvement Standard/Deep. Feature Light, Improvement Light는 Post-Plan Q/A를 스킵한다.

| 단계 | 행위 |
|------|------|
| 1 | Plan 핵심 요약 제시 (spec.md + plan.md Tasks 기반) |
| 2 | `AskUserQuestion`으로 사용자 선택: **(a)** 바로 구현 **(b)** Plan Q&A 인터뷰 |
| 3a | 바로 구현: spec.md + plan.md가 미커밋 상태이면 Git 커밋 수행 → Linear State → In Progress → implement Skill 호출 |
| 3b | Q&A 인터뷰: Plan 내용 질의응답 → 완료 후 다시 선택(2단계) |

> **AI 권장 분기**: plan.md Tasks 4개 이상인 feature → (b)에 `(AI 권장)`. 그 외(태스크 3개 이하 또는 improvement-standard) → (a)에 `(AI 권장)`.

## OMC Fallback

> ralplan 비활성 시 → 기존 Post-Plan Q/A에 Architect + Critic 병렬 합의 리뷰를 추가하여 수행 (ralplan이 내장하는 Planner/Architect/Critic 합의를 수동으로 대체).
