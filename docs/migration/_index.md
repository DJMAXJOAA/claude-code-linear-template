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
| 1 | NF-3: Rules 작성 | pending | `pipeline.md`, `docs-writing.md` |
| 2 | NF-4: 핵심 Skills (5개) | pending | dev-pipeline, gen-hub, gen-plan, implement, feature-close |
| 2 | NF-7: Guides 작성 | pending | `framework.md`, `context.md` |
| 3 | NF-5: 보조 Skills (5개) | pending | triage, feedback, investigation, verify, test |
| 3 | NF-6: Commands (9개) | pending | 등록, 활성화, 점검, 커밋, 피드백, 조사, 검증, 병합, 현황 |
| 4 | NF-8: 초기 설정 가이드 | pending | 설정 가이드 문서 |
| 4 | NF-9: 통합 검증 | pending | 검증 보고서 |

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
| A2 | pipeline.md | `.claude/rules/pipeline.md` | pending |
| A3 | docs-writing.md | `.claude/rules/docs-writing.md` | pending |
| A4 | framework.md | `docs/guides/framework.md` | pending |
| A5 | context.md | `docs/guides/context.md` | pending |
| B1 | dev-pipeline SKILL.md | `.claude/skills/dev-pipeline/SKILL.md` | pending |
| B2 | gen-hub SKILL.md | `.claude/skills/gen-hub/SKILL.md` | pending |
| B3 | gen-plan SKILL.md | `.claude/skills/gen-plan/SKILL.md` | pending |
| B4 | implement SKILL.md | `.claude/skills/implement/SKILL.md` | pending |
| B5 | feature-close SKILL.md | `.claude/skills/feature-close/SKILL.md` | pending |
| B6 | triage SKILL.md | `.claude/skills/triage/SKILL.md` | pending |
| B7 | feedback SKILL.md | `.claude/skills/feedback/SKILL.md` | pending |
| B8 | investigation SKILL.md | `.claude/skills/investigation/SKILL.md` | pending |
| B9 | verify SKILL.md | `.claude/skills/verify/SKILL.md` | pending |
| B10 | test SKILL.md | `.claude/skills/test/SKILL.md` | pending |
| C1 | 등록.md | `.claude/commands/등록.md` | pending |
| C2 | 활성화.md | `.claude/commands/활성화.md` | pending |
| C3 | 점검.md | `.claude/commands/점검.md` | pending |
| C4 | 커밋.md | `.claude/commands/커밋.md` | pending |
| C5 | 피드백.md | `.claude/commands/피드백.md` | pending |
| C6 | 조사.md | `.claude/commands/조사.md` | pending |
| C7 | 검증.md | `.claude/commands/검증.md` | pending |
| C8 | 병합.md | `.claude/commands/병합.md` | pending |
| C9 | 현황.md | `.claude/commands/현황.md` | pending |

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

## Handoff

| 항목 | 내용 |
|------|------|
| 마지막 완료 작업 | T-NF2-03 (CLAUDE.md 200줄 확인 + 토큰 효율 검토) |
| 다음 작업 | T-NF3-01 (pipeline.md 작성) |
| 비고 | NF-2 완료. CLAUDE.md 166줄. 커스텀 상태(Planning/Testing/Verifying) + Research label 추가 여부 결정 필요 |
