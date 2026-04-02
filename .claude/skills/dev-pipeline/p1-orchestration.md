# P1 계획수정 오케스트레이션 (dev-pipeline 담당)

**진입**: triage G4 반환값에서 P1 판정을 수신하여 오케스트레이션 시작.
(dev-pipeline은 `/점검` 호출의 상위 오케스트레이터이므로 triage 반환값을 직접 수신)

dev-pipeline이 다음을 순서대로 수행:
1. plan.md 수정 (Goal/Approach/Tasks 갱신) — `oh-my-claudecode:executor` (sonnet)
1a. progress.txt에 P1 수정 기록 (ralph가 관리): 'P1 계획수정: {수정 사유} — Tasks {리셋 ID 목록}'
2. plan.md Verification 갱신 (검증항목 리셋/추가) — 동일 executor
3. docs: 커밋 (plan.md 수정분)
4. implement Skill 재호출 (수정된 plan.md Tasks 기준으로 재개)
5. implement 완료 후 verify 자동 재실행
5a. **verify FAIL 시**: L3로 자동 에스컬레이션 — **gen-hub 경유** sub-issue 생성 (triage G4b 패턴 재사용, type: bug, parentId: 현재 Issue) 후 블로킹 라이프사이클 진입 (pipeline.md §4-4a).
    P1 자체수정 1회 시도 후 verify 통과 실패는 변경 범위가 P1 한계를 초과했음을 의미.
