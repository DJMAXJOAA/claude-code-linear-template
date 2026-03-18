---
title: Linear 기반 Claude Code 프레임워크 구축
created: 2026-03-17
---

# Linear 기반 Claude Code 프레임워크 구축

## Overview

| 항목 | 내용 |
|------|------|
| 목표 | 파일 기반 상태 관리를 Linear로 전환한 Claude Code 프레임워크 템플릿 신규 구축 |
| 설계 원본 | `C:\CHJ\claude-project-template\.omc\linear-migration\` |
| 확정 스펙 | `09-new-framework-spec.md` (01~07과 충돌 시 09 우선) |
| 산출물 | 총 24개 (CLAUDE.md 1 + Rules 2 + Guides 2 + Skills 10 + Commands 9) |

## 핵심 설계 결정

| # | 결정 | 내용 |
|---|------|------|
| D1 | 통합 파이프라인 | Feature/Issue 분리 폐기. type(label)별 워크플로우 분기 |
| D2 | intensity | **폐기**. type이 프로세스 엄밀도 결정 |
| D3 | 폴더 구조 | `docs/issue/{LINEAR-ID}/` 통합 + `docs/adr/` 독립 + `docs/shared/` |
| D4 | CLAUDE.md | 단일 파일 + `<!-- FRAMEWORK -->` / `<!-- PROJECT -->` 섹션 구분. 200줄 내외 |
| D5 | Hub 파일 | `_index.md` (인덱스 전용). 상태/개요/SC는 Linear |
| D6 | 파일 구성 | _index.md + plan.md + cl.md 기본. decisions.md, notes.md lazy-creation |
| D7 | Linear↔Git | 등록 시 description에 Git 상대경로 자동 삽입 + 동적 조회 |
| D8 | 커맨드 | /신규→**/등록**, /이어하기→**/활성화**. 5개 커맨드 폐기 |
| D9 | OMC | 무조건 활성화 전제. omc-check 제거 |
| D10 | Rules | 프레임워크 고정 2개(pipeline, docs-writing)만 |

## 진행 상황

| Phase | Feature | 상태 | 산출물 |
|-------|---------|------|--------|
| 0 | NF-1: Linear MCP 검증 | **done** (8/8) | MCP 도구 매핑 테이블 → `.omc/handoff/HANDOFF-NF1-verification.md` |
| 1 | NF-2: CLAUDE.md 템플릿 | **done** (3/3) | `CLAUDE.md` |
| 1 | NF-3: Rules 작성 | **done** (3/3) | `pipeline.md`, `docs-writing.md` |
| 2 | NF-4: 핵심 Skills (5개) | **done** (5/5) | dev-pipeline, gen-hub, gen-plan, implement, feature-close |
| 2 | NF-7: Guides 작성 | **done** (2/2) | `framework.md`, `context.md` |
| 3 | NF-5: 보조 Skills (5개) | **done** (5/5) | triage, feedback, investigation, verify, test |
| 3 | NF-6: Commands (9개) | **done** (9/9) | 등록, 활성화, 점검, 커밋, 피드백, 조사, 검증, 병합, 현황 |
| 3.5 | Phase A: Critical 해소 (7건) | **done** | MCP 도구명, 상태 전이, 라우팅 정비 |
| 3.5 | Phase B: 구조 변경 (4건) | **done** | type별 폴더, 문서 통합, RPT 제거, 직접 참조 제거 |
| 3.5 | Phase C: High 해소 (10건) | **done** | gen-plan 축소, verify→close 명확화, 커맨드 보강 |
| 3.5 | Phase D: Medium/Low 보강 (16건) | **done** | 게이트 라벨, 현행 대비 삭제, OMC fallback, 상호 참조 |
| 4 | NF-8: 초기 설정 가이드 | **done** (2/2) | `docs/guides/setup.md` — 현행 구현 기준 재작성 |
| 4 | NF-9: 통합 검증 | **done** (7/7 PASS) | 완전성·참조·시나리오·범용성·잔재·MCP·줄수 전항목 통과 |

## 의존 그래프

```
NF-1 (MCP 검증)  ←── Gate: 실패 시 중단
  └─→ NF-2 (CLAUDE.md)
        └─→ NF-3 (Rules)
              ├─→ NF-4 (핵심 Skills 5개)
              └─→ NF-7 (Guides)
                    └─→ NF-5 (보조 Skills 5개)
                          └─→ NF-6 (Commands 9개)
                                └─→ NF-8 (초기 설정 가이드)
                                      └─→ NF-9 (통합 검증)
```

## 산출물 전체 목록

| # | 산출물 | 경로 | 상태 |
|---|--------|------|------|
| A1 | CLAUDE.md 템플릿 | `CLAUDE.md` | **done** |
| A2 | pipeline.md | `.claude/rules/pipeline.md` | **done** |
| A3 | docs-writing.md | `.claude/rules/docs-writing.md` | **done** |
| A4 | framework.md | `docs/guides/framework.md` | **done** |
| A5 | context.md | `docs/guides/context.md` | **done** |
| B1 | dev-pipeline SKILL.md | `.claude/skills/dev-pipeline/SKILL.md` | **done** |
| B2 | gen-hub SKILL.md | `.claude/skills/gen-hub/SKILL.md` | **done** |
| B3 | gen-plan SKILL.md | `.claude/skills/gen-plan/SKILL.md` | **done** |
| B4 | implement SKILL.md | `.claude/skills/implement/SKILL.md` | **done** |
| B5 | feature-close SKILL.md | `.claude/skills/feature-close/SKILL.md` | **done** |
| B6 | triage SKILL.md | `.claude/skills/triage/SKILL.md` | **done** |
| B7 | feedback SKILL.md | `.claude/skills/feedback/SKILL.md` | **done** |
| B8 | investigation SKILL.md | `.claude/skills/investigation/SKILL.md` | **done** |
| B9 | verify SKILL.md | `.claude/skills/verify/SKILL.md` | **done** |
| B10 | test SKILL.md | `.claude/skills/test/SKILL.md` | **done** |
| C1 | 등록.md | `.claude/commands/등록.md` | **done** |
| C2 | 활성화.md | `.claude/commands/활성화.md` | **done** |
| C3 | 점검.md | `.claude/commands/점검.md` | **done** |
| C4 | 커밋.md | `.claude/commands/커밋.md` | **done** |
| C5 | 피드백.md | `.claude/commands/피드백.md` | **done** |
| C6 | 조사.md | `.claude/commands/조사.md` | **done** |
| C7 | 검증.md | `.claude/commands/검증.md` | **done** |
| C8 | 병합.md | `.claude/commands/병합.md` | **done** |
| C9 | 현황.md | `.claude/commands/현황.md` | **done** |

## Documents

| 문서 | 경로 | 역할 |
|------|------|------|
| Hub (이 문서) | [_index.md](_index.md) | 프로젝트 개요, 진행 상황, 산출물 목록 |
| Checklist | [cl.md](cl.md) | 41개 태스크, Done Criteria, 검증, 커밋 체크포인트 |
| Decisions | [decisions.md](decisions.md) | 설계 결정 로그 (확정 + 구현 중 발생) |
| Notes | [notes.md](notes.md) | **작업 주의사항/중요 지침** + 작업 로그 |

> **세션 시작 시**: _index.md(진행 상황) + cl.md(Handoff) + notes.md(지침) 3개를 읽고 시작

## 설계 참조 경로

| 문서 | 경로 |
|------|------|
| 확정 스펙 | `C:\CHJ\claude-project-template\.omc\linear-migration\09-new-framework-spec.md` |
| Rules 상세 | `C:\CHJ\claude-project-template\.omc\linear-migration\09a-rules-detail.md` |
| Skills 상세 | `C:\CHJ\claude-project-template\.omc\linear-migration\09b-skills-detail.md` |
| 구현 플랜 | `C:\CHJ\claude-project-template\.omc\linear-migration\PLAN-linear-migration.md` |
| 설정 가이드 | `C:\CHJ\claude-project-template\.omc\linear-migration\11-setup-guide.md` |
| 프레임워크 분석 | `C:\CHJ\claude-project-template\.omc\linear-migration\08-framework-analysis.md` |
| 핸드오프 | `C:\CHJ\claude-project-template\.omc\linear-migration\HANDOFF-new-framework.md` |

## 구조적 변경 (Phase 3.5 이후 — 스펙 09 대비)

> 12-gap-analysis.md에서 식별. 구현이 스펙 09를 초과/이탈한 항목. 모두 구현 측이 더 나은 선택.

| ID | 변경 | 스펙 09 | 현재 구현 |
|----|------|---------|----------|
| G1 | 폴더 구조 | `docs/issue/{LINEAR-ID}/` | `docs/{type}/{LINEAR-ID}/` (type별 분리) |
| G2 | MCP 서버 | `@cline/linear-mcp` + API Key | Linear 공식 호스팅 MCP + OAuth |
| G3 | ID 해석 | stateId/labelId 캐싱 | 이름(문자열) 직접 지정 |
| G4 | MCP 도구 | `linear_create_issue` 등 CRUD 분리 | `save_issue` upsert 패턴 |
| G5 | CLAUDE.md 순서 | FRAMEWORK → PROJECT | PROJECT → FRAMEWORK |

## Handoff

| 항목 | 내용 |
|------|------|
| 마지막 완료 작업 | **Phase 4 전체 완료** (NF-8 설정 가이드 + NF-9 통합 검증 7/7 PASS) |
| 다음 작업 | — (프레임워크 구축 완료) |
| 비고 | Phase 0~4 전체 완료. 산출물 25개. 새 프로젝트 적용: `docs/guides/setup.md` |

> **배포 참고**: `docs/migration/`은 프레임워크 구축 이력 문서. 새 프로젝트에 이 템플릿을 적용할 때는 `docs/migration/` 폴더를 제외한다.
