# spec 문서 템플릿 — 공통 규칙 (SSOT)

이 파일이 spec 문서의 **공통 규칙 SSOT**이다. 개별 문서 템플릿은 별도 파일로 분리되어 있다.

- `_index.md` 템플릿: [spec-index-template.md](./spec-index-template.md)
- `requirements.md` 템플릿: [spec-requirements-template.md](./spec-requirements-template.md)
- `technical.md` 템플릿: [spec-technical-template.md](./spec-technical-template.md)
- `roadmap.md` 템플릿: [spec-roadmap-template.md](./spec-roadmap-template.md)
- Reference 보고서 템플릿: [spec-reference-template.md](./spec-reference-template.md)

---

## 템플릿 규칙

| 항목 | 규칙 |
|------|------|
| 생성 시점 | `/스펙` 커맨드 호출 시 항상 생성 |
| 디렉토리 위치 | `docs/spec/{spec-name}/` — kebab-case |
| 디렉토리 구성 | `_index.md` + `requirements.md` + `technical.md` (필수) + `roadmap.md` (선택) + `references/` (선택) |
| references 디렉토리 | (선택) `docs/spec/{name}/references/` — G2 조사에서 보고서 생성 시에만. 보고서 없으면 디렉토리 자체 미생성 |
| 깊이 제한 | 2depth (`docs/spec/{name}/{doc}.md`), references는 예외 (`docs/spec/{name}/references/{report}.md`) |
| 생명주기 | Living document — 갱신 가능하나 갱신 필수 아님 |
| 갱신 주체 | `/스펙`(초기 생성/재호출), feature-close(Issue 완료 시 연동 갱신 — 경로/링크 없으면 무시) |
| 글로벌 _index.md 갱신 | spec 생성/갱신 시 `docs/spec/_index.md` 자동 갱신 |
| 앵커 참조 | 각 문서의 `##` 헤딩이 Linear Document에서 앵커로 링크 가능 (GitHub 호환) |

## 문서 분할 원칙

문서는 **주제별이 아닌 성격별**로 고정 분할한다.

| 문서 | 필수 | 성격 | 핵심 질문 | 금지 |
|------|:----:|------|----------|------|
| `_index.md` | O | 허브 / Overview / Decisions | 이 기능은 무엇이고 왜 필요한가? 어떤 결정을 내렸는가? | 상세 명세 |
| `requirements.md` | O | 기능 요구사항 | 시스템이 무엇을 해야 하는가? | How(구현), 라이브러리명, 인터페이스 설계 |
| `technical.md` | O | 기술 설계 | 어떤 구조로 만들 것인가? | 내부 로직/알고리즘 상세 |
| `roadmap.md` | △ | 구현 로드맵 | 어떤 순서로 나눠서 만들 것인가? | 태스크 수준 상세 계획 |

> **roadmap.md 생성 조건**: 2개 이상 Issue로 분할이 예상되는 기능에만 생성. 단일 Issue로 충분하면 생성하지 않음.

## 문서 유형

### 1. `_index.md` — 디렉토리 허브

| 항목 | 규칙 |
|------|------|
| 역할 | Overview + Out of Scope + 문서 목록 + Decisions(선택) + 변경 이력. standalone readable |
| frontmatter | `title`, `type: spec`, `created`, `updated` |
| Nav Link | `> ← [Spec Index](../_index.md)` |
| 템플릿 | [spec-index-template.md](./spec-index-template.md) |

### 2. `requirements.md` — 기능 요구사항

| 항목 | 규칙 |
|------|------|
| 역할 | 기능적 요구사항 명세 (What/Why). 정책, 시나리오 |
| frontmatter | `title`, `type: spec`, `parent-spec: {spec-name}`, `created`, `updated` |
| Nav Link | `> ← [_index.md](./_index.md)` |
| 포함 | FR(EARS), Constraints & Dependencies, NFR(선택), UI/UX(선택) |
| 템플릿 | [spec-requirements-template.md](./spec-requirements-template.md) |

### 3. `technical.md` — 기술 설계

| 항목 | 규칙 |
|------|------|
| 역할 | 계약 수준 기술 설계. 상세 구현 X |
| frontmatter | `title`, `type: spec`, `parent-spec: {spec-name}`, `created`, `updated` |
| Nav Link | `> ← [_index.md](./_index.md)` |
| 포함 | 설계 원칙, 인터페이스, API/함수 시그니처, 데이터 모델 |
| 상세도 | 시그니처 + 역할 수준. 내부 로직은 각 Issue plan.md에서 처리 |
| 템플릿 | [spec-technical-template.md](./spec-technical-template.md) |

### 4. `roadmap.md` — 구현 로드맵 (선택)

| 항목 | 규칙 |
|------|------|
| 역할 | Feature를 Issue로 분할하는 전략. 의존성, 우선순위, 리스크 |
| 생성 조건 | 2+ Issue 분할 예상 시에만 |
| frontmatter | `title`, `type: spec`, `parent-spec: {spec-name}`, `created`, `updated` |
| Nav Link | `> ← [_index.md](./_index.md)` |
| 상세도 | Issue 단위 개요. 각 Issue의 상세 계획은 해당 Issue plan.md에서 처리 |
| 템플릿 | [spec-roadmap-template.md](./spec-roadmap-template.md) |

> **roadmap.md ≠ Issue plan.md**: roadmap = "어떤 Issue들로 나눌까", Issue plan = "해당 Issue를 어떻게 구현할까"

### 5. Reference 보고서 — 조사 결과 레퍼런스 (선택)

| 항목 | 규칙 |
|------|------|
| 역할 | spec이 참조하는 조사 결과 보고서. 역할 혼합 금지 |
| 위치 | `docs/spec/{spec-name}/references/` |
| 생성 조건 | G2 조사에서 보고서 수준 결과 생성 시에만 |
| frontmatter | `title`, `type: spec-reference`, `parent-spec: {spec-name}`, `created` |
| Nav Link | `> ← [_index.md](../_index.md)` |
| 불변 원칙 | 완료된 보고서는 수정 금지 — 새 보고서로 대체 |
| 템플릿 | [spec-reference-template.md](./spec-reference-template.md) |

## 작성 스타일 가이드

| 원칙 | 내용 |
|------|------|
| 간결성 | 항목당 1~2문장. 길어지면 분할 |
| 구조화 | 테이블, 불릿 위주. 서술형 문단 최소화 |
| 가독성 | AI와 사람 모두 쉽게 읽을 수 있어야 함 |
| 참고 문서 성격 | spec은 참고 문서. 상세 구현은 각 Issue 파이프라인에서 확정 |
| 실행 스크립트 금지 | bash, python, JSON 스키마 등 코드 블록 포함 금지 (의사코드, Mermaid 예외) |

## FR-ID 체계

| 항목 | 규칙 |
|------|------|
| 형식 | `FR-NNN` (spec-local. 각 spec 디렉토리 내에서 001부터 순차) |
| 소속 문서 | `requirements.md`에만 FR-ID 부여. technical.md/roadmap.md에서는 참조만 |
| 소속 식별 | `parent-spec` frontmatter로 spec 귀속 판별 |
| 외부 참조 | 다른 spec의 FR 참조 시: `{spec-name}:FR-NNN` |
| 번호 규칙 | 001부터 순차. 삭제된 번호 재사용 금지 |
| 권장 상한 | 30개. 초과 시 기능 범위 재검토 권고 (hard limit 아님) |

## EARS 출력 형식

G5(작성+저장) 단계에서 FR 테이블의 "요구사항" 컬럼에 적용. G3(인터뷰) 중에는 자연어 허용.

| 패턴 | 구문 | 예시 |
|------|------|------|
| Ubiquitous | The system shall {action} | The system shall 모든 에러를 로그에 기록한다 |
| Event-driven | When {trigger}, the system shall {action} | When 유저가 저장 버튼을 클릭하면, the system shall 데이터를 영속화한다 |
| State-driven | While {state}, the system shall {action} | While 오프라인 상태인 동안, the system shall 요청을 큐에 저장한다 |
| Unwanted | If {unwanted condition}, then the system shall {mitigation} | If 서버 연결이 30초 이상 무응답이면, the system shall 재연결을 시도한다 |
| Optional | Where {feature is enabled}, the system shall {action} | Where 미니맵이 활성화되면, the system shall 플레이어 위치를 실시간 표시한다 |

> **언어 규칙**: EARS 키워드(When/If/While/Where/shall)는 영어 유지. 변수 부분은 프로젝트 언어로 작성.
>
> **패턴 선택 기준**: Event-driven(정상 트리거), State-driven(상태 중 동작), Ubiquitous(상시 제약), Unwanted(비정상/예외 방어), Optional(사용자 선택 기능)

## 계약 수준 경계 규칙

technical.md는 **계약 수준(contract-level)** 설계만 기술한다.

| 구분 | technical.md에 기술 | Issue plan.md에서 확정 |
|------|--------------------|-----------------------|
| 인터페이스 | 시그니처 + 역할 | 내부 구현 |
| 데이터 모델 | 엔티티 관계 + 핵심 필드 | 상세 스키마, 마이그레이션 |
| 통신 패턴 | 방식 명시 (예: "delta sync") | 프로토콜 세부 구현 |

> **시그니처 변경 규칙**: 구현 중 시그니처가 변경되어도 spec 즉시 수정 불필요. Issue 완료 후 feature-close에서 반영하거나, `/정리`에서 소급 갱신.

## Constraints 소속 규칙

> **Constraints & Dependencies는 `requirements.md`에만 위치 (SSOT)**. `_index.md`의 Decisions에서 Constraints를 참조할 때는 `requirements.md`로의 링크를 사용한다. `_index.md`에 Constraints를 중복 기재하지 않는다.

## Mermaid 가이드라인

| 규칙 | 내용 |
|------|------|
| 허용 유형 | flowchart, sequenceDiagram, stateDiagram-v2 |
| 금지 유형 | gantt, pie, mindmap, classDiagram (erDiagram은 technical.md에서만 예외 허용) |
| 크기 제한 | 노드 20개 이하, 엣지 30개 이하. 초과 시 분할 |
| 사용 위치 | technical.md, roadmap.md. _index.md, requirements.md 금지. (plan.md는 별도 규칙 — [plan-template.md](../../gen-plan/templates/plan-template.md) 참조) |

### 설계 요소별 권장 Mermaid 패턴

| 설계 요소 | 권장 Mermaid | 용도 | 비고 |
|----------|-------------|------|------|
| 인터페이스 계층 | `flowchart TB` | 상속/구현 관계 시각화 | classDiagram 금지 → flowchart로 대체 |
| 이벤트 흐름 | `sequenceDiagram` | 컴포넌트 간 호출 순서 | alt/else로 분기 표현 |
| 상태 전이 | `stateDiagram-v2` | 생명주기, FSM | |
| 의존성 관계 | `flowchart LR` | Issue 간, 모듈 간 의존 | roadmap.md에서 주로 사용 |
