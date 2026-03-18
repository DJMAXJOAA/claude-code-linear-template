# triage — 수동 테스트 결과 분류 및 라우팅

수동 테스트 결과를 분석하여 7유형으로 분류하고, G2 Approval Table을 통해 사용자 승인을 받은 뒤 분류 결과를 반환하는 **순수 분류기(Pure Classifier)**.

triage 자체는 코드를 수정하지 않는다. 분류 결과와 라우팅 대상을 안내하며, 실제 실행은 dev-pipeline이 후속 결정한다.

## Trigger

- `/점검` 커맨드에서 자동 호출
- implement Skill 완료 후 수동 테스트 결과 수집 시점

## Input

| 항목 | 설명 |
|------|------|
| 테스트 결과 프롬프트 | 사용자가 전달한 자유 형식 테스트 결과 텍스트 |
| Linear ID | 활성 Issue의 Linear ID (없으면 독립 호출 모드) |
| CL 문서 | `docs/issue/{LINEAR-ID}/cl.md` — 구현 범위 판단용 (있는 경우) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | `oh-my-claudecode:analyst` 에이전트(haiku)에 테스트 결과 + Issue 컨텍스트 전달 |
| 2 (G1) | Analyst가 입력 파싱 → 개별 항목 분리 → 7유형 분류 (아래 §분류 알고리즘) |
| 3 (G2) | **Approval Table** 생성 → `AskUserQuestion`으로 사용자 승인 |
| 4 (G3) | **저장**: `_index.md > ## Notes > ### Triage Log`에 분류 결과 기록 + Linear comment에도 기록 |
| 5 (G4) | **분류 결과 반환**: 승인된 항목의 유형별 라우팅 대상을 안내. 실제 실행은 dev-pipeline이 후속 결정 |

## Output

| 항목 | 내용 |
|------|------|
| _index.md | Notes > Triage Log 섹션에 분류 결과 기록 |
| Linear comment | 분류 결과 요약 기록 |
| 분류 결과 | 각 항목의 유형 + 라우팅 대상 안내 |

---

## 분류 알고리즘 (scope × nature 2축)

### scope 축

| 값 | 기준 |
|----|------|
| **in-scope** | CL S1 태스크 범위 내 이슈 |
| **out-of-scope** | CL S1 범위 밖 이슈 |
| **framework** | 프레임워크/프로세스 개선 |

### nature 축

| 값 | 기준 |
|----|------|
| **defect** | 의도와 다른 동작 (버그) |
| **improvement** | 동작은 맞지만 개선 여지 |
| **knowledge** | 규칙/지침/제약 |

### 7유형 매핑

| scope × nature | 유형 | 처리 |
|---------------|------|------|
| in-scope × defect | **L1** | 즉시 수정 (executor 위임) |
| in-scope × improvement | **L2** | 현재 Issue 내 개선 검토 |
| out-of-scope × defect | **L3** | 별도 Issue 등록 |
| out-of-scope × improvement | **backlog** | Linear Issue 생성 |
| framework × knowledge | **directive** | rules/guides에 등록 |
| in-scope × knowledge | **limitation** | _index.md Notes Known Limitations에 기록 |
| * × * (임시 메모) | **reminder** | _index.md Notes에 기록 |

---

## 라우팅 대상 안내 테이블

| 유형 | 라우팅 대상 | 행동 |
|------|-----------|------|
| L1 | `oh-my-claudecode:executor` (sonnet) | 즉시 수정. coding.md 준수 명시 |
| L2 | 사용자에게 안내 | **분기**: (a) 현재 CL에 태스크 추가 → implement 루프 복귀, (b) 별도 improvement Issue 등록 (`/등록`). 기준: 현재 구현 범위에서 수정 가능하면 (a), 독립적 개선이면 (b) |
| L3 | `/등록` (type: bug) | 별도 Issue 생성 |
| directive | feedback Skill | directive 유형으로 전달 |
| limitation | _index.md Notes 직접 기록 | Known Limitations에 추가 |
| backlog | `/등록` | 새 Issue 생성 |
| reminder | _index.md Notes 직접 기록 | Triage Log에 포함 |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 분류 분석 | `oh-my-claudecode:analyst` | haiku |
| L1 수정 실행 | `oh-my-claudecode:executor` | sonnet |

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Triage 결과 기록 | `save_comment` | Issue에 분류 결과 요약 comment |
| L3 Issue 생성 | `save_issue` (id 미지정, gen-hub 경유) | 별도 bug Issue 생성 |
