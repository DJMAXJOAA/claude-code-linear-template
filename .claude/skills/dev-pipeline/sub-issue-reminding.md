# Sub-issue 리마인딩

`/활성화` 시 child sub-issue가 존재하면 아래 프로세스를 수행한다.

| 단계 | 행위 |
|------|------|
| 1 | Linear MCP로 현재 Issue의 child sub-issue 목록 조회 (parentId 기반) |
| 2 | 각 sub-issue의 상태(State), type(Label), title 수집 |
| 3 | Linear comment + progress.txt에서 블로킹 여부 교차 검증 |
| 4 | 리마인딩 테이블 출력 (아래 형식) |
| 5 | `AskUserQuestion`으로 진행 방법 선택 |

## 리마인딩 테이블 형식

| Sub-issue | Type | State | 생성 사유 | Blocking |
|-----------|------|-------|----------|----------|
| PRJ-N | bug/improvement | Todo/In Progress/Done | Triage Log 또는 Linear comment에서 추출 | Y/N |

## 진행 선택지

| 선택지 | 행동 |
|--------|------|
| 계속 진행 (Recommended) | 미완료 sub-issue 안내 후 현재 Issue 파이프라인 계속 |
| Sub-issue 먼저 처리 | 미완료 sub-issue 중 하나를 선택하여 `/활성화` |
| 대기 | 현재 세션 종료. sub-issue 완료 후 재활성화 안내 |

> 모든 sub-issue가 Done이면 리마인딩 테이블만 출력하고 자동 진행.
> Blocking sub-issue가 미완료이면 해당 항목을 강조 표시하고, pipeline.md §4-4a 블로킹 해제 프로세스와 연계.
> child sub-issue가 없으면 이 단계를 스킵.
