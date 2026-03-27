# spec `requirements.md` 템플릿

기능적 요구사항 명세. What/Why만 기술하며, How(구현)는 금지한다.

> 공통 규칙: [spec-template.md](./spec-template.md)

## 템플릿

```markdown
---
title: "Requirements: {spec 제목}"
type: spec
parent-spec: {spec-name}
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

> ← [_index.md](./_index.md)

## Functional Requirements

| FR-ID | 패턴 | 요구사항 | 비고 |
|-------|------|---------|------|
| FR-001 | Event-driven | When {trigger}, the system shall {action} | |
| FR-002 | State-driven | While {state}, the system shall {action} | |
| FR-003 | Unwanted | If {unwanted condition}, the system shall {action} | |
| FR-004 | Optional | Where {feature is enabled}, the system shall {action} | |
| FR-005 | Ubiquitous | The system shall {action} | |

## Constraints & Dependencies

| 유형 | 항목 | 설명 |
|------|------|------|
| 기술 제약 | | |
| 외부 의존성 | | |
| 기존 코드 제약 | | |

## Non-Functional Requirements

{해당 시에만. 없으면 섹션 생략}

| 항목 | 기준 | 측정 방법 |
|------|------|----------|

## UI/UX Specifications

{해당 시에만. 없으면 섹션 생략}
```

## 섹션 규칙

| 섹션 | 필수 | 비고 |
|------|:----:|------|
| Functional Requirements | O | EARS 형식 FR 테이블. FR-NNN 체계 (spec-local) |
| Constraints & Dependencies | O | 기술 제약 + 외부 의존성 + 기존 코드 제약 |
| Non-Functional Requirements | △ | 성능, 보안, 호환성 등. 측정 가능한 기준 |
| UI/UX Specifications | △ | 화면 구성, 인터랙션 |

> **Out of Scope는 이 문서에 포함하지 않는다.** Out of Scope는 `_index.md`에만 위치 (SSOT 단일화).

> **금지**: 특정 라이브러리명, 함수명, 구현 패턴 언급. 이는 technical.md 또는 Issue plan.md 영역.

### What vs How 판별 예시

| 수준 | 나쁜 예 (How — 구현 누출) | 좋은 예 (What — 요구사항) |
|------|-------------------------|------------------------|
| 인터페이스 | "IPresentationComponent 마커 인터페이스에 Cancel() 메서드만 정의한다" | "연출 컴포넌트에 공통 취소 인터페이스를 제공한다" |
| 기술 | "UniTask 비동기 로드만 사용한다" | "연출 리소스의 동기 로드를 금지하고 비동기 로드만 사용한다" |
| 라이브러리 | "VContainer [Inject] 사용" | "DI 컨테이너 기반 의존성 주입" |
| 데이터 | "AssetReference로 등록하여 지연 로드" | "주소 기반 참조로 등록하여 지연 로드" |
| 패턴 | "CancellationTokenSource를 Cancel 후 새 CTS를 생성한다" | "이전 연출을 취소하고 새 연출을 시작한다" |

> **판별 기준**: 특정 클래스명/라이브러리명을 다른 것으로 교체해도 요구사항이 여전히 유효하면 → What 수준. 교체 시 의미가 변하면 → How 수준 (technical.md로 이동).
