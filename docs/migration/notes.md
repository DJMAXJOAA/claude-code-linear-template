---
title: Notes — Linear 기반 프레임워크 구축
created: 2026-03-17
---

> [_index.md](_index.md)

# 작업 주의사항 및 중요 지침

## 필수 준수 사항

| # | 지침 | 상세 | 위반 시 |
|---|------|------|--------|
| R1 | **09가 확정 스펙** | 01~07 보고서와 충돌 시 09가 우선. `_index.md`의 관점 정리 참조 | 잘못된 설계 기준 적용 |
| R2 | **새로 작성** | 현행 파일을 복사+수정하지 말 것. 09a/09b의 설계를 기반으로 새로 작성 | 현행 잔재(intensity 등)가 유입 |
| R3 | **intensity 완전 제거** | 새 프레임워크에 intensity 관련 코드/규칙이 존재하면 안 됨 | 폐기된 시스템 잔재 |
| R4 | **omc-check 제거** | OMC 무조건 활성화 전제. 스킬 내 omc 분기 없음 | 불필요한 분기 코드 |
| R5 | **Linear MCP 추상화** | MCP 도구 이름을 하드코딩하지 말고, 도구 매핑 참조 방식으로 | MCP 서버 교체 시 전체 수정 필요 |
| R6 | **200줄 제한** | CLAUDE.md는 200줄 내외. 상세는 rules/guides에 위임 | 토큰 낭비 |
| R7 | **프로젝트 독립** | FRAMEWORK 섹션에 특정 프로젝트 내용이 없어야 함 | 범용성 훼손 |
| R8 | **교차 복제 금지** | 상태는 Linear에만, 지식은 Git에만. 중복 기록 금지 | SSOT 위반 |
| R9 | **청사진 원칙** | 문서에 실행 스크립트(bash/python/JSON) 포함 금지. 예시 템플릿은 허용 | 프레임워크 원칙 위반 |
| R10 | **설계 참조 필수** | 각 산출물 작성 시 해당 설계 문서를 반드시 읽고 참조 | 설계 불일치 |

## 설계 참조 매핑 (작업 시 반드시 확인)

| 산출물 | 필수 참조 문서 | 핵심 참조 섹션 |
|--------|--------------|---------------|
| CLAUDE.md | 09 §5 | CLAUDE.md 구조, Framework/Project 섹션 |
| pipeline.md | **09a §1** (전체) | §1~§11 모든 섹션 |
| docs-writing.md | **09a §2** (전체) | §1~§8 모든 섹션 |
| dev-pipeline | **09b §1** | Trigger/Input/Process/Output, 라우팅 테이블, MCP 패턴 |
| gen-hub | **09b §2** | type별 description 템플릿, _index.md 템플릿, MCP 패턴 |
| gen-plan | **09b §3** | plan.md/cl.md 구조, type별 작성 범위, 태스크 ID 형식 |
| implement | **09b §4** | Micro-tasking 루프, 실행 모드, 완료 조건, Linear sub-issue |
| feature-close | **09b §5** | 구현 결과 섹션, 후행 Issue 환류, type별 기록 내용 |
| framework.md | 09 §6-7, 08 부록A | 핵심 원칙, 3영역 SSOT, 차용/변형/제거 매트릭스 |
| context.md | 08 §4 | Linear로 개선되는 것, 유지할 것, 변형이 필요한 것 |
| 보조 Skills | 현행 SKILL.md + 09 §7 | 현행 차용 + Linear 연동 변경점 |
| Commands | 09 §2 | 커맨드 체계, 유지/제거/신규 목록 |
| 설정 가이드 | 11-setup-guide.md | Linear 셋업, MCP 설정, 첫 /등록 절차 |

## 현행 프레임워크와의 관계

| 관계 | 요소 | 비고 |
|------|------|------|
| **차용** (그대로 가져감) | 4단계 게이트, Micro-tasking, CL S1 의존성, Pre/Post-Plan Q/A, triage 7유형, Progressive Disclosure, AskUserQuestion 강제 | 핵심 패턴 |
| **변형** (수정하여 사용) | 상태 관리→Linear, Hub→_index.md, ID→Linear ID, flush→Linear sync, 파이프라인→type 통합 | 3영역 SSOT 재정의 |
| **제거** (사용하지 않음) | intensity, backlogs/, gen-backlogs, gen-issue, issue-pipeline, omc-check, F-NNN/B-NNN ID | Linear 대체 또는 통합 |

## 3영역 SSOT 원칙

```
Linear (상태 SSOT)          Git (지식 SSOT)           Claude Code (실행)
├─ Issue State              ├─ Plan (plan.md)         ├─ 파이프라인 Skills
├─ Labels (type/tags)       ├─ CL (cl.md)             ├─ Commands
├─ Projects (milestones)    ├─ Decisions              ├─ Rules
├─ Relations                ├─ Known Limitations      └─ CL S1 의존성 그래프
├─ Priority                 ├─ Constraints
├─ Overview / SC            ├─ 구현 결과
└─ Activity (자동 이력)     └─ ADR, 도메인 지식
```

---

# 작업 로그

> 각 Phase/태스크 완료 시 진행 기록을 추가한다.

| 날짜 | 태스크 | 작업 내용 | 비고 |
|------|--------|----------|------|
| 2026-03-17 | — | Hub(_index.md) + CL(cl.md) + Decisions + Notes 초기화 | 설계 스펙 전체 확인 완료 |
