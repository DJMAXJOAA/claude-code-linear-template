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
| 설정 가이드 | **11-setup-guide.md + 12-gap-analysis.md 기반 재작성** | 11 구조 계승 + G1~G5 차이점 반영. 현행 구현 기준 |
| 차이점 분석 | `.omc/linear-new-plan/12-gap-analysis.md` | OMC 계획 vs 현재 구현 괴리 18건 |

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
| 2026-03-17 | T-NF1-01 | Linear MCP 서버 설치 완료 | `@anthropic/linear-mcp-server` → 공식 호스팅(`https://mcp.linear.app/mcp`)으로 변경 |
| 2026-03-17 | T-NF1-02 | MCP 설정 완료 | OAuth 방식이라 별도 API 키 불필요. 프로젝트 스코프로 등록됨 |
| 2026-03-17 | T-NF1-03 | Team 확인 | ProjectX (key: PRO, id: `99a27269-...`). 기존 Team 사용 |
| 2026-03-17 | T-NF1-04 | Issue CRUD 검증 완료 | Create(PRO-5)→Read→Update(Backlog→InProgress→Done)→Canceled 전체 성공. 마크다운 정상 |
| 2026-03-17 | T-NF1-05 | State/Label 조회 완료 | 기본 States 6개, Labels 3개 확인. 커스텀 상태 3개 + Research label 추가 필요 |
| 2026-03-17 | T-NF1-06 | Sub-issue 검증 완료 | parentId로 Sub-issue 생성 성공(PRO-6). 독립 상태 변경 가능 확인 |
| 2026-03-17 | T-NF1-07 | 응답 시간 측정 | 전체 호출 ~1초. 3초 미만 목표 충족 |
| 2026-03-17 | T-NF1-08 | MCP 도구 매핑 테이블 작성 | `.omc/handoff/HANDOFF-NF1-verification.md`에 기록. 17개 도구 매핑 완료 |
| 2026-03-17 | T-NF2-01~03 | CLAUDE.md 템플릿 작성 완료 | 166줄. FRAMEWORK 7섹션 + PROJECT 5섹션. intensity/omc-check 0건. 09 §5 스펙 준수 |
| 2026-03-17 | T-NF3-01~03 | pipeline.md + docs-writing.md 작성 완료 | pipeline 312줄(§1-§11), docs-writing 211줄(§1-§8). 09a 스펙 전체 반영. MCP 도구명 하드코딩 0건 |
| 2026-03-17 | T-NF4-01~05 | 핵심 Skills 5개 작성 완료 | dev-pipeline, gen-hub, gen-plan, implement, feature-close. 09b §1-§5 스펙 반영. MCP 도구명은 ### Linear MCP 섹션에만 |
| 2026-03-17 | T-NF7-01~02 | Guides 2개 작성 완료 | framework.md(10대 원칙 + 3영역 SSOT + 차용/변형/제거), context.md(4대 실패 모드 + PD + 50% + /clear + Linear 로딩) |
| 2026-03-17 | T-NF5-01~05 | 보조 Skills 5개 작성 완료 | triage(7유형 분류), feedback(3유형), investigation(research 전체 라이프사이클), verify(SC+S3 검증), test(전략+실행) |
| 2026-03-17 | T-NF6-01~09 | Commands 9개 작성 완료 | 등록/활성화/점검/커밋/피드백/조사/검증/병합/현황. 간결한 스킬 호출+인자 매핑 패턴 |
| 2026-03-17 | Phase 3.5-A | Critical 7건 해소 | MCP 도구명 일괄 교체(CR1 콜사이트별 매핑), improvement 테이블 수정, 상태 전이 이중정의 해소(D32), research 라우팅 명확화, 조사 독립모드 제거, 병합 Linear 면제, 게이트 면제 선언 |
| 2026-03-17 | Phase 3.5-B | 구조 변경 4건 | B1: docs/{type}/ 폴더 분리(D30). B2: decisions/notes → _index.md 통합(D31). B3: RPT 태스크 보고서 제거(D33, research RPT 유지). B4: 스킬 간 직접 참조 제거 → "결과 반환, dev-pipeline이 후속 결정" 패턴 |
| 2026-03-17 | Phase 3.5-C | High 10건 해소 | C1: gen-plan critic 리뷰 제거→Post-Plan Q/A 위임. C2: verify→feature-close G2 명확화. C4: _index.md 갱신 주체 원칙 추가. C5: implement CL S4 실제 구현 반영. C6: feedback backlog→gen-hub 경로. C8: 현황 Priority+20건. C10: 등록 단건 전용 |
| 2026-03-17 | Phase 3.5-D | Medium/Low 16건 보강 | D1: 전체 스킬 게이트 라벨(G1~G4). D2: 현행 대비 섹션 5개 삭제. D3: OMC fallback 10개 스킬. D4~D16: 커맨드 상호참조, AskUserQuestion 통일, 참조문서 명시, 테스트 분류, 검증 구체화 등 |
| 2026-03-18 | Phase 4A | 정합성 보정 3건 | T-FIX-01: decisions.md D3/D11 갱신(`docs/{type}/`). T-FIX-02: _index.md G1~G5 구조 변경 요약. T-FIX-03: notes.md 설계 참조 갱신 |
| 2026-03-18 | T-NF8-01~02 | 초기 설정 가이드 작성 완료 | `docs/guides/setup.md` (10섹션). 11-setup-guide.md 구조 계승 + G1~G5 반영 재작성. 공식 MCP+OAuth, `docs/{type}/`, PROJECT→FRAMEWORK 순서 |
| 2026-03-18 | T-NF9-01~07 | 통합 검증 7/7 PASS | 완전성(25개)·참조(4경로)·시나리오(4type)·범용성·잔재(0건)·MCP추상화·줄수(104≤200) |
