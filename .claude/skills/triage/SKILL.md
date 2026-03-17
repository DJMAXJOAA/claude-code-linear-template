# triage — 수동 테스트 결과 분류 및 라우팅

수동 테스트 결과를 분석하여 7유형으로 분류하고, G2 Approval Table을 통해 사용자 승인을 받은 뒤 적절한 처리 경로로 라우팅하는 **순수 분류기(Pure Router)**.

triage 자체는 코드를 수정하지 않는다. 모든 유형을 외부 실행 경로로 위임한다.

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
| 1 | `oh-my-claudecode:analyst` 에이전트(haiku)에 테스트 결과 + Issue 컨텍스트 전달 |
| 2 | Analyst가 입력 파싱 → 개별 항목 분리 → 7유형 분류 (아래 §분류 알고리즘) |
| 3 | **G2 Approval Table** 생성 → `AskUserQuestion`으로 사용자 승인 |
| 4 | **G3 저장**: `notes.md` Triage Log에 분류 결과 기록 (lazy-creation) + Linear comment에도 기록 |
| 5 | **G4 실행**: 승인된 항목을 유형별로 라우팅 (아래 §라우팅 테이블) |
| 6 | 실행 결과를 `notes.md` Triage Log에 갱신 |
| 7 | 완료 안내: feature-close 진행 여부 확인 |

## Output

| 항목 | 내용 |
|------|------|
| notes.md | Triage Log 섹션에 분류 결과 + 실행 결과 기록 |
| Linear comment | 분류 결과 요약 기록 |
| 라우팅 | 각 항목을 해당 처리 경로로 위임 |

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
| in-scope × knowledge | **limitation** | notes.md Known Limitations에 기록 |
| * × * (임시 메모) | **reminder** | notes.md에 기록 |

---

## 라우팅 테이블

| 유형 | 라우팅 대상 | 행동 |
|------|-----------|------|
| L1 | `oh-my-claudecode:executor` (sonnet) | 즉시 수정. coding.md 준수 명시 |
| L2 | 사용자에게 안내 | 현재 Issue 범위 확장 여부 결정 |
| L3 | `/등록` (type: bug) | 별도 Issue 생성 |
| directive | feedback Skill | directive 유형으로 전달 |
| limitation | feedback Skill | limitation 유형으로 전달 |
| backlog | feedback Skill | backlog 유형으로 전달 |
| reminder | notes.md 직접 기록 | Triage Log에 포함 |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 분류 분석 | `oh-my-claudecode:analyst` | haiku |
| L1 수정 실행 | `oh-my-claudecode:executor` | sonnet |

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Triage 결과 기록 | `linear_create_comment` | Issue에 분류 결과 요약 comment |
| L3 Issue 생성 | `linear_create_issue` | 별도 bug Issue 생성 (gen-hub 경유) |
