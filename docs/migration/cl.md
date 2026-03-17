---
title: CL — Linear 기반 프레임워크 구축
created: 2026-03-17
---

> [_index.md](_index.md)

# CL: Linear 기반 프레임워크 구축 체크리스트

## S1. Tasks

### Phase 0: Linear MCP 검증 (NF-1)

> Gate: 실패 시 전체 중단

| # | ID | Task | Dependencies | Status |
|---|-----|------|-------------|--------|
| 1 | T-NF1-01 | Linear MCP 서버 설치 + Claude Code MCP 설정 등록 | — | **done** |
| 2 | T-NF1-02 | Linear API 키 발급 + MCP config 설정 | T-NF1-01 | **done** (OAuth — 키 불필요) |
| 3 | T-NF1-03 | 테스트용 Team 확인 (ProjectX, PRO) | T-NF1-02 | **done** |
| 4 | T-NF1-04 | Issue CRUD + 상태 변경 라운드트립 검증 | T-NF1-03 | **done** |
| 5 | T-NF1-05 | State/Label 목록 조회 확인 | T-NF1-03 | **done** |
| 6 | T-NF1-06 | Sub-issue 생성 (`parentId`) 동작 확인 | T-NF1-04 | **done** |
| 7 | T-NF1-07 | 응답 시간 측정 (< 3초 목표) — 전체 PASS | T-NF1-04 | **done** |
| 8 | T-NF1-08 | MCP 도구 매핑 테이블 작성 완료 | T-NF1-05 | **done** |

### Phase 1: 허브 + Rules (NF-2, NF-3)

| # | ID | Task | Dependencies | Status |
|---|-----|------|-------------|--------|
| 9 | T-NF2-01 | CLAUDE.md `<!-- FRAMEWORK -->` 섹션 작성 — Pipeline 요약, Context, Commands & Skills 인덱스, Linear Integration, ID System, Rules Delegation, Forbidden | T-NF1-08 | **done** |
| 10 | T-NF2-02 | CLAUDE.md `<!-- PROJECT -->` 섹션 작성 — Project Identity, Tech Stack, Directory Overview, Project Rules, Key References (placeholder) | T-NF2-01 | **done** |
| 11 | T-NF2-03 | CLAUDE.md 200줄 이내 확인 + 토큰 효율 검토 | T-NF2-02 | **done** |
| 12 | T-NF3-01 | pipeline.md 작성 — §1 type별 워크플로우, §2 4단계 게이트, §3 Micro-tasking, §4 Linear sync, §5 Pre-Compaction, §6 Pre/Post-Plan Q/A, §7 피드백, §8 금지사항, §9 에이전트 라우팅, §10 커밋, §11 인터뷰 원칙 | T-NF2-03 | **done** |
| 13 | T-NF3-02 | docs-writing.md 작성 — §1 Frontmatter, §2 _index.md 템플릿, §3 Lazy-creation, §4 링킹, §5 문서 네이밍, §6 SSOT, §7 스타일, §8 보고서 | T-NF2-03 | **done** |
| 14 | T-NF3-03 | Rules paths 조건 설정 확인 (pipeline: `docs/issue/**`, `.claude/skills/**` / docs-writing: `docs/**`) | T-NF3-01, T-NF3-02 | **done** |

### Phase 2: 핵심 Skills (NF-4) + Guides (NF-7)

| # | ID | Task | Dependencies | Status |
|---|-----|------|-------------|--------|
| 15 | T-NF4-01 | dev-pipeline SKILL.md 작성 — 통합 라우터, type별 분기, Linear MCP 패턴. 설계: 09b §1 | T-NF3-03 | **done** |
| 16 | T-NF4-02 | gen-hub SKILL.md 작성 — Linear Issue + _index.md 생성, type별 description 템플릿. 설계: 09b §2 | T-NF3-03 | **done** |
| 17 | T-NF4-03 | gen-plan SKILL.md 작성 — plan.md + cl.md, `docs/issue/{ID}/` 경로. 설계: 09b §3 | T-NF3-03 | **done** |
| 18 | T-NF4-04 | implement SKILL.md 작성 — CL S1 Micro-tasking + Linear sub-issue. 설계: 09b §4 | T-NF3-03 | **done** |
| 19 | T-NF4-05 | feature-close SKILL.md 작성 — 구현 결과 + Linear Done + 후행 환류. 설계: 09b §5 | T-NF3-03 | **done** |
| 20 | T-NF7-01 | framework.md 작성 — 핵심 원칙 (3영역 SSOT, type별 파이프라인, Micro-tasking, 4단계 게이트, Linear-first). 설계: 09 §6-7, 08 부록A | T-NF3-03 | **done** |
| 21 | T-NF7-02 | context.md 작성 — Progressive Disclosure, 50% 규칙, Pre-Compaction, /clear 타이밍, 4대 실패 모드 + Linear 컨텍스트 로딩. 설계: 08 §4 | T-NF3-03 | **done** |

### Phase 3: 보조 Skills (NF-5) + Commands (NF-6)

| # | ID | Task | Dependencies | Status |
|---|-----|------|-------------|--------|
| 22 | T-NF5-01 | triage SKILL.md 작성 — 7유형 분류 + Git notes.md + Linear comment | T-NF4-01 | pending |
| 23 | T-NF5-02 | feedback SKILL.md 작성 — directive→rules, limitation→notes.md, backlog→Linear Issue | T-NF4-01 | pending |
| 24 | T-NF5-03 | investigation SKILL.md 작성 — 조사 결과 `docs/issue/{ID}/` 저장 | T-NF4-01 | pending |
| 25 | T-NF5-04 | verify SKILL.md 작성 — 구현 완전성 검증 + Linear Verifying | T-NF4-01 | pending |
| 26 | T-NF5-05 | test SKILL.md 작성 — 테스트 전략 + Linear Testing | T-NF4-01 | pending |
| 27 | T-NF6-01 | 등록.md 작성 — `/등록` → gen-hub 호출 (type 지정) | T-NF5-01 | pending |
| 28 | T-NF6-02 | 활성화.md 작성 — `/활성화` → dev-pipeline 호출 | T-NF5-01 | pending |
| 29 | T-NF6-03 | 점검.md 작성 — `/점검` → triage 호출 | T-NF5-01 | pending |
| 30 | T-NF6-04 | 커밋.md 작성 — Conventional Commits | T-NF5-01 | pending |
| 31 | T-NF6-05 | 피드백.md 작성 — `/피드백` → feedback 호출 | T-NF5-01 | pending |
| 32 | T-NF6-06 | 조사.md 작성 — `/조사` → investigation 호출 | T-NF5-01 | pending |
| 33 | T-NF6-07 | 검증.md 작성 — `/검증` → 프레임워크 무결성 검증 | T-NF5-01 | pending |
| 34 | T-NF6-08 | 병합.md 작성 — 브랜치 병합 | T-NF5-01 | pending |
| 35 | T-NF6-09 | 현황.md 작성 — `/현황` → Linear MCP 활성 Issue 조회 | T-NF5-01 | pending |

### Phase 4: 설정 가이드 (NF-8) + 검증 (NF-9)

| # | ID | Task | Dependencies | Status |
|---|-----|------|-------------|--------|
| 36 | T-NF8-01 | 초기 설정 가이드 작성 — Linear 셋업 → MCP → CLAUDE.md 커스터마이즈 → 첫 /등록. 설계: 11-setup-guide.md | T-NF6-09 | pending |
| 37 | T-NF8-02 | 프레임워크 고정 파일 vs 프로젝트별 파일 구분 명시 | T-NF8-01 | pending |
| 38 | T-NF9-01 | 산출물 완전성 확인 — 24개 파일 존재 + 내용 비어있지 않음 | T-NF8-02 | pending |
| 39 | T-NF9-02 | 참조 일관성 — CLAUDE.md 인덱스가 실제 파일과 일치 | T-NF9-01 | pending |
| 40 | T-NF9-03 | 시나리오 검증 — `/등록` → `/활성화` → Plan → 구현 → `/점검` → 완료 경로 문서상 완결 | T-NF9-02 | pending |
| 41 | T-NF9-04 | 범용성 확인 — FRAMEWORK 섹션에 프로젝트 특정 내용 없음 | T-NF9-03 | pending |

## S2. Done Criteria

| # | 기준 |
|---|------|
| 1 | 24개 산출물이 모두 존재하고 비어있지 않음 |
| 2 | CLAUDE.md가 200줄 이내, Framework/Project 섹션 분리됨 |
| 3 | pipeline.md에 type별 분기 + 게이트 + Micro-tasking + Linear sync 정의됨 |
| 4 | docs-writing.md에 축소 frontmatter + lazy-creation 트리거 정의됨 |
| 5 | 핵심 5개 스킬에 Trigger/Input/Process/Output + Linear MCP 패턴 포함 |
| 6 | 9개 커맨드가 올바른 스킬을 호출 |
| 7 | intensity 관련 내용이 전체 프레임워크에 없음 |
| 8 | omc-check 분기가 없음 (OMC 무조건 활성화) |
| 9 | 파일 간 참조가 모두 유효 |
| 10 | FRAMEWORK 섹션에 프로젝트 특정 내용 없음 |

## S3. Verification

| # | 검증 항목 | 방법 | 기대 결과 |
|---|----------|------|----------|
| 1 | 산출물 완전성 | 24개 파일 경로 존재 확인 | 모두 존재 |
| 2 | CLAUDE.md 줄 수 | `wc -l CLAUDE.md` | ≤ 200 |
| 3 | intensity 잔재 | 전체 파일에서 `intensity` grep | 0건 (설명 목적 언급 제외) |
| 4 | omc-check 잔재 | 전체 파일에서 `omc-check` grep | 0건 |
| 5 | 참조 일관성 | CLAUDE.md 인덱스 경로 vs 실제 파일 | 모두 일치 |
| 6 | type별 파이프라인 완결 | feature/bug/improvement/research 경로 추적 | 각 type 등록→완료 문서상 완결 |
| 7 | Linear MCP 추상화 | 스킬에서 MCP 도구명 하드코딩 확인 | 도구명은 매핑 참조 방식 |

## S4. Commit Checkpoints

| Phase | 커밋 시점 | 커밋 메시지 패턴 |
|-------|----------|----------------|
| 0 | MCP 검증 완료 + 매핑 테이블 | `docs: NF-1 Linear MCP 검증 완료` |
| 1-a | CLAUDE.md 완성 | `docs: NF-2 CLAUDE.md 템플릿 작성` |
| 1-b | Rules 2개 완성 | `docs: NF-3 pipeline.md + docs-writing.md 작성` |
| 2-a | 핵심 Skills 5개 완성 | `feat: NF-4 핵심 Skills 5개 작성` |
| 2-b | Guides 2개 완성 | `docs: NF-7 framework.md + context.md 작성` |
| 3-a | 보조 Skills 5개 완성 | `feat: NF-5 보조 Skills 5개 작성` |
| 3-b | Commands 9개 완성 | `feat: NF-6 Commands 9개 작성` |
| 4-a | 설정 가이드 완성 | `docs: NF-8 초기 설정 가이드 작성` |
| 4-b | 통합 검증 완료 | `docs: NF-9 통합 검증 완료` |

## Handoff

| 항목 | 내용 |
|------|------|
| 마지막 완료 태스크 | T-NF7-02 (context.md 작성) |
| 다음 태스크 | T-NF5-01 (triage SKILL.md 작성) |
| 비고 | Phase 2 완료. 핵심 Skills 5개(09b §1-§5) + Guides 2개(framework.md, context.md). 09b/09 §6-7/08 §4 스펙 반영 |
| 재개 방법 | `docs/migration/_index.md` + `docs/migration/cl.md` 읽고 Handoff 섹션 확인 |
