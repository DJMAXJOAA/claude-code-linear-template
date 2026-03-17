---
paths:
  - "docs/feature/**"
  - "docs/bug/**"
  - "docs/improvement/**"
  - "docs/research/**"
  - ".claude/skills/**"
description: 파이프라인 규칙 — type별 워크플로우, 게이트, Micro-tasking, Linear sync
---

# Pipeline Rules

## §1 Type별 워크플로우

### 1-1. Type 목록

| Type | 설명 | 워크플로우 |
|------|------|-----------|
| `feature` | 새 기능 개발 | Full: Planning → In Progress → Testing → Verifying → Done |
| `bug` | 버그 수정 | Short: In Progress → Verifying → Done |
| `improvement` | 기존 기능 개선/리팩토링 | Mid: Planning → In Progress → Verifying → Done |
| `research` | 조사/분석 | Minimal: In Progress → Done |

### 1-2. 통합 상태 흐름 (Linear Workflow States)

`Backlog → Planning → In Progress → Testing → Verifying → Done`

### 1-3. Type별 사용 상태

| State | feature | bug | improvement | research |
|-------|:-------:|:---:|:-----------:|:--------:|
| Backlog | O | O | O | O |
| Planning | O | — | O | — |
| In Progress | O | O | O | O |
| Testing | O | — | — | — |
| Verifying | O | O | O | — |
| Done | O | O | O | O |

- `—` = 해당 type에서 스킵 (자동으로 다음 상태로 전이)
- feature만 Testing 단계를 거침
- research는 Planning/Testing/Verifying 모두 스킵

### 1-4. Type별 스킬 분기

| Type | State | 호출 스킬 | 행동 |
|------|-------|----------|------|
| feature | Backlog → Planning | Pre-Plan Q/A → gen-plan | SC 확정 → Plan+CL 생성 |
| feature | Planning → In Progress | implement | CL S1 기반 Micro-tasking |
| feature | In Progress → Testing | test | 테스트 전략 수립·실행 |
| feature | Testing → Verifying | verify | 구현 완전성 검증 |
| feature | Verifying → Done | feature-close | 구현 결과 기록 + Linear Done |
| bug | Backlog → In Progress | (직접 분석) | Root Cause 분석 → 수정 |
| bug | In Progress → Verifying | verify | 수정 검증 |
| bug | Verifying → Done | feature-close | 결과 기록 + Linear Done |
| improvement | Backlog → Planning | gen-plan (간략) | 간략 Plan+CL |
| improvement | Planning → In Progress | implement | CL S1 기반 Micro-tasking |
| improvement | In Progress → Verifying | verify | 검증 |
| improvement | Verifying → Done | feature-close | 결과 기록 + Linear Done |
| research | Backlog → In Progress | investigation | 조사 수행 |
| research | In Progress → Done | feature-close | 보고서 저장 + Linear Done |

### 1-5. 상태 전이 규칙

| 규칙 | 내용 |
|------|------|
| 전이 방향 | 항상 앞으로만 진행. 역방향 전이 금지 (재작업 시 새 Issue 등록) |
| 스킵 자동화 | type에 `—`인 상태는 dev-pipeline이 자동으로 다음 상태로 건너뜀 |
| 전이 시 행동 | 모든 상태 전이는 §4 Linear sync 프로토콜을 경유 |
| 전이 트리거 | 스킬 완료 시 자동 전이. 사용자가 수동 전이하지 않음 |

---

## §2 4단계 게이트

### 2-1. 게이트 정의

| 게이트 | 행위자 | 내용 |
|--------|--------|------|
| **G1. 계획(Plan)** | AI | 다음 작업/단계 계획 수립 |
| **G2. 검토(Review)** | 사용자 | 계획 확인 및 승인. 승인 전 실행 시작 금지 |
| **G3. 저장(Store)** | AI | 승인된 계획을 Git 문서에 기록 + Linear 상태 갱신 (dual write) |
| **G4. 실행(Execute)** | AI | 저장된 계획 기준으로 Micro-tasking 방식 실행 |

### 2-2. 게이트 위반 방지

| 금지 패턴 | 설명 |
|-----------|------|
| G2 생략 | 사용자 승인 없이 실행 시작 금지 |
| G3 생략 | Git 기록 + Linear 갱신 없이 실행 시작 금지 |
| G1 → G4 직행 | 계획 후 검토·저장 없이 실행 금지 |
| G3 부분 실행 | Git만 저장하고 Linear 미갱신 (또는 그 반대) 금지. Linear 장애 시 §4 fallback 적용 |

### 2-3. G3 dual write 규칙

| 대상 | Git 기록 | Linear 갱신 |
|------|---------|------------|
| 파이프라인 단계 전환 | `_index.md` Documents 테이블 상태 갱신 | state 전이 |
| Plan 완료 | `plan.md` + `cl.md` 파일 생성 | state: Backlog → Planning |
| 태스크 완료 | `cl.md` S1 체크박스 갱신 | sub-issue 상태 Done |
| feature-close | `_index.md` 구현 결과 섹션 기록 | state → Done + 완료 comment |

### 2-3a. _index.md 갱신 주체 원칙

> **원칙**: `_index.md`는 해당 섹션을 담당하는 스킬이 직접 갱신한다.

| 섹션 | 갱신 주체 스킬 | 시점 |
|------|-------------|------|
| Documents 테이블 | gen-plan, investigation | 파일 생성/삭제 시 |
| ## Decisions | dev-pipeline (Pre-Plan Q/A) | 설계 결정 확정 시 |
| ## Notes | feedback, triage, feature-close | 피드백/triage/환류 발생 시 |
| ## Task Log | implement | 태스크 완료 시 |
| ## 구현 결과 | feature-close | 완료 처리 시 |

> 각 스킬은 자신이 담당하는 섹션만 갱신한다. 타 스킬 담당 섹션을 직접 수정하지 않는다.

### 2-4. G3-terminal 스킬 패턴

| 항목 | 내용 |
|------|------|
| 정의 | G1→G2→G3으로 완결. G4는 후속 Skill의 자체 게이트 사이클에 위임 |
| 적용 대상 | feature-close |
| 특징 | 스킬 자체는 Git 기록 + Linear 갱신(G3)으로 완료 |

---

## §3 Micro-tasking

### 3-1. 핵심 규칙

| 항목 | 내용 |
|------|------|
| 핵심 규칙 | **에이전트 당 1개 태스크**만 진행 → 결과 검수 → 다음 이동 |
| 태스크 단위 | CL 문서의 S1 태스크 목록 |
| 체크리스트 갱신 | 태스크 완료 직후 CL S1 체크박스 즉시 갱신 |
| 커밋 규칙 | 태스크 1개 = 커밋 1개. Conventional Commits (`feat:`, `fix:`, `docs:` 등). `/커밋` command 참조 |
| 게이트 연계 | 태스크 완료 후 4단계 게이트(§2)를 경유하여 다음 태스크로 이동 |
| 금지 패턴 | 여러 단계 일괄 지시, "알아서 다 처리해" 식 실행, 같은 파일을 수정하는 태스크 동시 실행 |

### 3-2. _index.md 갱신 주체

| 규칙 | 내용 |
|------|------|
| 원칙 | `_index.md`의 각 섹션은 해당 섹션을 생성/수정하는 스킬이 직접 갱신한다 |
| Documents 테이블 | gen-hub(초기), gen-plan(plan/cl 행), investigation(보고서 행) |
| Decisions | Pre-Plan Q/A 시 gen-plan, 구현 중 implement |
| Notes | feedback, triage |
| Task Log | implement |
| 구현 결과 | feature-close |

### 3-3. 의존성 기반 실행

| 항목 | 내용 |
|------|------|
| 의존성 소스 | CL S1의 `depends` 속성 (태스크 간 선후 관계) |
| 병렬 실행 | 의존성 없는 태스크는 병렬 실행 가능 |
| 순차 실행 | 의존성 있는 태스크는 선행 태스크 완료 후 실행 |
| 실행 프로세스 | implement Skill이 SSOT — 태스크 선택, 코드 작성, 테스트, 빌드 확인, CL 갱신, 커밋 |

### 3-4. Linear sub-issue 동기화

| 트리거 | 행동 |
|--------|------|
| Plan+CL 생성 시 | CL S1 태스크별 Linear sub-issue 생성 (best-effort. 실패 시 CL S1이 SSOT이므로 진행에 영향 없음) |
| 태스크 시작 | sub-issue state → In Progress |
| 태스크 완료 | sub-issue state → Done |
| CL S1 태스크 변경 시 | 추가된 태스크: 새 sub-issue 생성. 삭제/변경: 기존 sub-issue는 수동 정리 (자동 삭제 안 함) |
| 동기화 방향 | CL S1 → Linear (단방향). CL이 SSOT, Linear sub-issue는 가시화 미러 |
| 장애 시 | §4 fallback 적용. sub-issue 갱신 실패해도 태스크 진행은 중단하지 않음 |

---

## §4 Linear sync 프로토콜

### 4-1. 상태 전이 호출 규칙

| 트리거 | Linear 행동 | 비고 |
|--------|------------|------|
| 파이프라인 단계 전환 | Issue 상태 전이 | §1 상태 흐름에 따라 |
| 태스크 시작/완료 | sub-issue 상태 갱신 | Micro-tasking 연동 |
| feature-close | 상태 → Done + 완료 comment | 최종 완료 처리 |
| /점검 결과 기록 | comment 추가 | Git _index.md Notes와 이중 기록 |

> 구체적 MCP 도구명과 파라미터는 NF-1 검증 결과의 MCP 매핑 테이블을 참조. 스킬별 `### Linear MCP` 섹션에 명시.

### 4-2. stateId 캐싱

| 항목 | 내용 |
|------|------|
| 캐시 대상 | team stateId 목록 (Backlog, Planning, In Progress, Testing, Verifying, Done) |
| 캐시 시점 | 세션 최초 Linear 호출 시 team 정보에서 stateId 추출 후 OMC state에 저장 |
| 캐시 유효 | 동일 세션 내 재사용. 세션 간 만료 |
| 조회 방식 | OMC state에 있으면 재사용, 없으면 Linear 호출 후 저장 |

### 4-3. 장애 시 fallback

| 상황 | 행동 |
|------|------|
| Linear API 호출 실패 (네트워크/인증) | 경고 메시지 출력 → Git 기록은 정상 진행 → 사용자에게 수동 Linear 갱신 안내 |
| Linear MCP 서버 미응답 | 동일 fallback — 경고 출력 + Git 진행 + 수동 안내 |
| 부분 실패 (상태 전이 성공, comment 실패) | 성공 부분 유지 + 실패 부분 경고 출력 |
| 재시도 정책 | 자동 재시도 없음. 1회 시도 후 실패 시 즉시 fallback |

### 4-4. 읽기 최적화 규칙

| 규칙 | 내용 |
|------|------|
| stateId 캐싱 | 동일 세션 내 최초 1회 조회 후 재사용 (§4-2) |
| CL 선택적 읽기 | 구현 단계: S1(태스크 목록)만. 테스트 단계: S3(검증 조건)만 |
| _index.md 최소 읽기 | linear_id + Documents 테이블만 확인. 구현 결과 섹션은 feature-close 시에만 |
| Linear 조회 최소화 | /활성화 시 1회 상태 조회 후 세션 내 상태는 내부 추적. 매 태스크마다 재조회 금지 |

---

## §5 Pre-Compaction

### 5-1. 50% 규칙

| 유형 | 조건 | 행동 |
|------|------|------|
| **자동** | 컨텍스트 윈도우 50% 도달 | 사용자에게 알림 → 판단으로 실행 여부 결정 |
| **수동** | 사용자 직접 지시 | 언제든 실행 가능 |

### 5-2. Checkpoint 행동

| 단계 | 행동 |
|------|------|
| 1. Git 저장 | CL S1 진행 상태 저장 (체크박스 최신화) |
| 2. Linear 동기화 | 현재 상태가 Linear에 반영되었는지 확인. 미반영 시 sync |
| 3. CL Handoff 작성 | CL 문서 하단에 Handoff 섹션 추가 — 현재 진행 태스크, 다음 태스크, 주의사항 |
| 4. 다음 시작점 명시 | Handoff에 `/활성화 {LINEAR-ID}` 재개 명령 기록 |

**Checkpoint = Git 저장 + Linear sync 확인 + CL Handoff + 다음 시작점 명시**

### 5-3. /clear 타이밍

| 시점 | 권장 여부 | 이유 |
|------|----------|------|
| Plan 완료 후 (Post-Plan Q/A 직후) | 권장 | Planning 컨텍스트 해제, 구현 컨텍스트 확보 |
| 태스크 3~5개 연속 완료 후 | 권장 | 누적 코드 컨텍스트 해제 |
| 파이프라인 단계 전환 시 | 권장 | 이전 단계 컨텍스트 불필요 |
| 단일 태스크 중간 | 비권장 | 작업 연속성 손실 위험 |

---

## §6 Pre-Plan Q/A + Post-Plan Q/A

### 6-1. Pre-Plan Q/A 흐름

| Phase | 행동 | 상세 |
|-------|------|------|
| **Phase -1: Linear relation 조회** | Linear에서 관련 Issue 조회 | related issue, 동일 label issue 탐색. 관련 Issue의 _index.md에서 교차 제약 수집 |
| **Phase 0: 코드 조사** | 코드베이스 탐색 + 아키텍처 가이드 확인 | 영향 범위 파악, 기존 패턴 확인, 기술적 제약 도출 |
| **Phase 1: How 인터뷰 5항목** | AskUserQuestion으로 사용자와 확정 | 아래 5항목 테이블 참조 |

### 6-2. How 인터뷰 5항목

| # | 항목 | 내용 | 기록 위치 |
|---|------|------|---------|
| 1 | Success Criteria | 완료 조건 구체화 | Linear Issue description |
| 2 | 스펙 | 기능 상세 명세 | Linear Issue description |
| 3 | Decisions | 설계 결정 사항 | `_index.md > ## Decisions` |
| 4 | 리스크 | 기술적·일정 리스크 | `plan.md` 리스크 섹션 (Planning 시) |
| 5 | 범위 경계 | 포함/제외 범위 명시 | Linear Issue description |

#### improvement 축소 인터뷰 (3항목)

| # | 항목 | 내용 | 기록 위치 |
|---|------|------|---------|
| 1 | Success Criteria | 완료 조건 | Linear Issue description |
| 2 | 접근 방식 | 기술적 접근 | Linear Issue description |
| 3 | 범위 경계 | 포함/제외 | Linear Issue description |

### 6-3. Pre-Plan Q/A 규칙

§10 인터뷰 원칙 적용. 추가로:
- 일괄 질문 허용 — 복수 항목을 한 번에 묶어서 질문 가능

### 6-4. Post-Plan Q/A

| 시점 | Plan+CL 생성 완료 후 (state: Planning 완료) |
|------|------------------------------------------|
| 사용자 선택지 | (a) 바로 구현 (AI 권장) (b) Q&A 인터뷰 (c) AI 리뷰 |
| 바로 구현 선택 시 | implement Skill 호출 필수 |
| Q&A 선택 시 | 추가 질의응답 후 Plan 수정 → 다시 Post-Plan Q/A |
| AI 리뷰 선택 시 | Plan 자체 검토 → 수정 사항 제안 → 사용자 승인 후 Plan 수정 |
| compact 안내 | Post-Plan Q/A 완료 시 `/clear` 권장 안내 출력 |

---

## §7 피드백 기록

| 유형 | 목적지 | 비고 |
|------|--------|------|
| directive | `.claude/rules/*.md`, `docs/guides/*.md`, `CLAUDE.md` | 지침/규칙 등록 |
| limitation | `_index.md > ## Notes` (해당 Issue 폴더) | Issue 진행 중 전용 |
| backlog | Linear Issue 신규 생성 | `/등록`과 동일 플로우 |

- 피드백 로그: `_index.md > ## Notes > ### Feedback Log`에 기록 (파이프라인 진행 중 호출 시)
- Triage 로그: `_index.md > ## Notes > ### Triage Log`에 기록 (`/점검` 사용 시). Linear comment에도 이중 기록.

---

## §8 파이프라인 금지사항

| 금지 | 이유 |
|------|------|
| Issue 구현 중 프레임워크 문서 업데이트 | 범위 분리 |
| 리뷰 단계에서 즉시 코드 수정 | 메모만 — 계획 우선 |
| 검증 실패 시 임의 우회 | 계획 수정 후 재구현 |
| 계획 범위 외 코드 수정 | 범위 초과 금지 |
| Linear 상태를 Git 파일에 복제 | 상태 SSOT = Linear. Git에 status 속성 금지 |

---

## §9 에이전트 라우팅

| type | 기본 에이전트 모델 |
|------|-----------------|
| feature | opus (설계 단계) → sonnet (구현 단계) |
| bug | sonnet (분석+수정) |
| improvement | sonnet (설계+구현) |
| research | opus (분석) |

각 스킬의 OMC 연동 섹션에 사용할 에이전트가 직접 명시된다. OMC는 항상 활성화 전제.

> OMC가 활성화되지 않은 환경에서는 에이전트 라우팅을 스킵하고 기본 모델로 실행한다.
> 만약 비활성화 상태가 감지되었다면, 반드시 알림을 출력하여 사용자에게 OMC 활성화 필요성을 인지시켜야 한다.

---

## §10 인터뷰 원칙

| 규칙 | 내용 |
|------|------|
| AskUserQuestion 필수 | 모든 인터뷰·Q/A·선택 요청은 AskUserQuestion 도구로 수행. 자유 텍스트 출력 후 암묵적 대기 금지 |
| 전환점마다 인터뷰 | 단계 전환 시 AskUserQuestion으로 사용자에게 확인 |
| AI 권장안 명시 | 질문 시 AI 추천 선택지를 `(AI 권장)` 라벨과 함께 제시 |
| 가정 금지 | 모호한 요구사항은 AskUserQuestion으로 반드시 질문 |
