# Triage 후처리 파이프라인 상세 로직

SKILL.md의 G4-NEW(Mode 1/2) 및 G5-NEW의 상세 로직. SKILL.md에서 참조로 로드.

---

## G4-NEW: planner 기반 후처리 (Mode 1/2)

### 1. planner agent 호출

`oh-my-claudecode:planner` agent를 **격리된 세션**(Agent subagent)으로 호출한다.

| 항목 | 내용 |
|------|------|
| 에이전트 | `oh-my-claudecode:planner` |
| 모델 | sonnet |
| 세션 격리 | Agent subagent로 호출하여 메인 컨텍스트와 분리 |

**Input:**

| 파라미터 | 값 | 설명 |
|---------|-----|------|
| 분류 결과 | G2 Approval Table 승인 항목 전체 | 유형, 항목 설명, scope, nature 포함 |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` 내용 | 기존 구현 범위 컨텍스트 (있는 경우) |
| Linear payload | dev-pipeline 캐싱 payload | description, type, labels, state |
| interview | `true` (Mode 1) / `false` (Mode 2) | 인터뷰 진행 여부 |
| triage-plan 양식 | `templates/triage-plan.md` 참조 | 문서 양식 |

**프롬프트 패턴:**

```
분류 결과를 분석하여 triage-plan 수정 계획 문서를 작성하라.

**분류 결과:**
{G2 승인 항목 테이블}

**기존 plan.md 컨텍스트:**
{plan.md 내용 또는 "없음"}

{Mode 1인 경우}
**인터뷰 모드**: 각 분류 항목의 처리 방안에 대해 주제별로 분리하여
사용자와 Q/A를 진행하라. 필요하거나 보완할 항목만 인터뷰 대상으로 삼는다.
AskUserQuestion을 사용하여 각 주제별로 처리 방안을 결정한다.

{공통}
**양식**: templates/triage-plan.md 양식을 따른다.
**Phase 분류 기준**:
- Phase 1 (최우선): 구조 변경, 다른 항목에 영향 (P1, rework)
- Phase 2: in-scope defect 수정 (L1)
- Phase 3: in-scope improvement (L2)
- Phase 4: out-scope 등록 — 병렬 가능 (L3, backlog)
- Phase 5: 지침/기록 — 병렬 가능 (directive, limitation, reminder)

결과를 triage-plan 문서로 작성하라.
```

### 2. 인터뷰 진행 (Mode 1만)

planner agent가 분류 항목을 주제별로 분리하여 인터뷰를 진행한다.

| 규칙 | 내용 |
|------|------|
| 주제 분리 | 각 분류 유형 또는 관련 항목 그룹별로 별도 주제 |
| 대상 선별 | 처리 방안이 명확한 항목(예: limitation → comment)은 인터뷰 생략 |
| AskUserQuestion 사용 | 각 주제별 처리 방안을 AskUserQuestion으로 결정 |
| 결정사항 기록 | triage-plan의 `## 결정사항` 섹션에 주제, 결정, 근거 기록 |

### 3. triage-plan 문서 생성

| 항목 | 내용 |
|------|------|
| 파일 경로 | `docs/issue/{LINEAR-ID}/triage-plan-{N}.md` |
| 넘버링 | `docs/issue/{LINEAR-ID}/` 내 `triage-plan-*.md` glob 카운트 + 1 |
| frontmatter | `git-doc-formats.md` 양식 + `type: triage-plan`, `triage_round: {N}` |
| 양식 | `templates/triage-plan.md` 참조 |

### 4. 사용자 검토

triage-plan 생성 후 `AskUserQuestion`으로 검토:

| 선택지 | 행동 |
|--------|------|
| **진행** | G5-NEW Phase별 실행으로 이동 |
| **수정** | planner agent 재호출 (수정 피드백 전달) |
| **거부** | triage-plan 파일 삭제 + triage 종료 |

### 5. 실패/중단 시 cleanup

| 상황 | 행동 |
|------|------|
| planner agent 실패 | 부분 생성된 triage-plan 파일 삭제. 에러 로그 출력 |
| 사용자 중단 (Ctrl+C 등) | triage-plan 파일 유지. 다음 `/점검` 시 기존 미완료 triage-plan 감지 → 이어쓰기 옵션 제시 |

---

## G5-NEW: Phase별 실행

triage-plan 승인 후, Phase 순서대로 유형별 기존 라우팅으로 실행한다.

### 실행 흐름

```
triage-plan 로드
  ↓
Phase 1 실행 (순차)
  ↓
Phase 2 실행 (순차 또는 병렬)
  ↓
...
  ↓
Phase N 실행
  ↓
/커밋 (전체 변경사항 통합)
```

### Phase 실행 규칙

| 규칙 | 내용 |
|------|------|
| Phase 순서 | Phase 번호 오름차순으로 실행. Phase 완료 후 다음 Phase 시작 |
| Phase 내 병렬 | triage-plan에서 `병렬: Y`인 항목은 동일 Phase 내 병렬 실행 (Agent `run_in_background`) |
| Phase 내 순차 | `병렬: N`인 항목은 순차 실행 |
| 실패 처리 | 항목 실행 실패 시 해당 항목만 스킵 + 에러 로그 기록. 나머지 항목 계속 진행 |

### 유형별 라우팅 상세

#### L1/L2 → executor agent

```
oh-my-claudecode:executor 에이전트(sonnet)를 호출하여 수정을 수행하라.

**Input:**
- 수정 대상: {triage-plan 항목 설명}
- 수정 방법: {triage-plan Phase 실행 계획의 처리 방법}

**Context:**
- coding.md 준수
```

#### L3/backlog → gen-hub skill

기존 G4b 로직 재사용. gen-hub 스킬을 외부 호출자로서 호출:

| 파라미터 | 값 |
|---------|-----|
| title | triage-plan 분류 요약의 항목 제목 |
| description 초안 | triage-plan 항목 설명 + 처리 방법 |
| type | `bug` (L3) 또는 `improvement` (backlog) |
| parentId | 현재 활성 Issue의 Linear ID |
| skipUserConfirm | `true` (triage-plan에서 이미 승인됨) |

#### P1 → plan 수정

기존 P1 라우팅 재사용:
1. plan.md에서 영향받는 Tasks 식별
2. 리셋 대상 도출 (P1 기준 적용)
3. plan.md 수정 → implement 재호출

#### rework → implement skill

기존 rework 라우팅 재사용:
1. plan.md Tasks에 정리 태스크 추가
2. Linear State → In Progress
3. implement 재호출

#### directive → feedback skill

feedback 스킬을 directive 유형으로 호출.

#### limitation/reminder → Linear comment

기존 G4a 로직 재사용. `linear-comment-writer` 에이전트를 호출하여 comment 기록.

### 커밋 (G5-NEW 완료 후)

전체 Phase 실행 완료 후 `/커밋` 경유로 1개 커밋 생성.

| 항목 | 내용 |
|------|------|
| 통합 원칙 | **triage-plan 1개 = 1개 커밋** |
| 커밋 유형 | 코드 변경 포함 시 `fix`, 문서만이면 `docs` |
| 메시지 | `{type}({ID}): triage-plan #{N} 실행 결과 반영` |

---

## OMC 에이전트 연동 (후처리)

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| planner 호출 (G4-NEW) | `oh-my-claudecode:planner` | sonnet |
| L1/L2 수정 (G5-NEW) | `oh-my-claudecode:executor` | sonnet |
| comment 기록 (G5-NEW) | `linear-comment-writer` | — (프레임워크 에이전트) |
