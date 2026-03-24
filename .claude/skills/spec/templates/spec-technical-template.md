# spec `technical.md` 템플릿

계약 수준(contract-level) 기술 설계. 시그니처 + 역할 수준만 기술하며, 내부 로직/알고리즘 상세는 각 Issue plan.md에서 확정한다.

> 공통 규칙: [spec-template.md](./spec-template.md) — 계약 수준 경계 규칙 참조

## 템플릿

```markdown
---
title: "Technical: {spec 제목}"
type: spec
parent-spec: {spec-name}
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

> ← [_index.md](./_index.md)

<!--
  계약 수준 경계:
  - What을 기술: "클라이언트-서버 간 delta sync 인터페이스 필요"
  - 시그니처는 계약 수준만: INetworkSyncService.SendDelta(delta)
  - 구현 상세는 Issue plan.md에 위임
  - 구현 중 시그니처 변경 시 spec 즉시 수정 불필요 → Issue 완료 후 반영
-->

## 설계 원칙

- {이 기능의 기술 설계를 관통하는 원칙}

## 인터페이스 설계

{API, 함수 시그니처, 데이터 구조 등. 시그니처 + 역할 수준으로 간결하게.}

## 데이터 모델

{해당 시에만. 없으면 섹션 생략. 엔티티 관계 + 핵심 필드 수준.}

## 통신 패턴

{해당 시에만. 없으면 섹션 생략. 방식 명시 수준.}
```

> **상세도 기준**: "이 인터페이스가 존재하고, 이런 역할이다"를 전달할 수 있으면 충분. 구현 세부사항은 각 Issue plan.md에서 확정.

> **Mermaid 권장**: 인터페이스 계층은 `flowchart TB`, 이벤트 흐름은 `sequenceDiagram`, 상태 전이는 `stateDiagram-v2`로 시각화. 상세: [spec-template.md](./spec-template.md) Mermaid 가이드라인 참조.

## 섹션 규칙

| 섹션 | 필수 | 비고 |
|------|:----:|------|
| 설계 원칙 | O | 기술 설계를 관통하는 원칙. 불릿 2~5개 |
| 인터페이스 설계 | O | API, 함수 시그니처. 계약 수준만 |
| 데이터 모델 | △ | 엔티티 관계 + 핵심 필드. erDiagram Mermaid 허용 |
| 통신 패턴 | △ | 프로토콜/통신 방식 명시 수준 |

> **시그니처 변경 운영 규칙**: 구현 중 시그니처가 변경되어도 spec 즉시 수정은 불필요. Issue 완료 후 issue-close에서 반영하거나, `/정리`에서 소급 갱신. spec은 참고 문서이므로 구현과의 일시적 불일치를 허용한다.
