---
title: 프레임워크 가이드
type: shared
created: 2026-03-17
---

# Framework Guide

## 1. 핵심 원칙 (10대)

| # | 원칙 | 내용 |
|---|------|------|
| 1 | **3영역 SSOT** | 상태=Linear, 지식=Git, 실행=Claude Code. 교차 복제 금지 |
| 2 | **Hub = 지식 전용** | `_index.md`는 설계 결정, 제약, 한계, 구현 결과만. 상태/개요/SC는 Linear |
| 3 | **토큰 절약** | Progressive Disclosure, 200줄 CLAUDE.md, paths 조건부 로드 유지 |
| 4 | **Micro-tasking** | CL S1 의존성 그래프 기반. 에이전트 당 1개 태스크. Linear Sub-issue는 가시화 목적 |
| 5 | **4단계 게이트** | G1(계획)→G2(검토)→G3(저장)→G4(실행). G2 사용자 승인 필수. G3에서 Linear+Git dual write |
| 6 | **Linear-first 상태** | 상태 조회/갱신은 항상 Linear API 경유. Git 파일에 상태 복제 금지 |
| 7 | **CL = 실행 SSOT** | 태스크 의존성, 진행 상태, 검증 조건은 CL 파일이 SSOT. Linear Sub-issue는 미러 |
| 8 | **Pre-Compaction** | 컨텍스트 50% 규칙, Checkpoint 강제 저장 유지 |
| 9 | **청사진 원칙** | 지침 문서에 실행 스크립트 금지. 키워드 맵 스타일 |
| 10 | **경량 우선** | 500줄 미만 단일 파일, 예방적 분리 금지, 가장 단순한 구현 선택 |

---

## 2. 3영역 SSOT

```
Linear (상태 SSOT)          Git (지식 SSOT)           Claude Code (실행)
├─ Issue State              ├─ Plan (plan.md)         ├─ 파이프라인 Skills
├─ Labels (type/tags)       ├─ CL (cl.md)             ├─ Commands
├─ Projects (milestones)    ├─ Decisions              ├─ Rules
├─ Relations                ├─ Known Limitations      └─ CL S1 의존성 그래프
├─ Priority                 ├─ Constraints
├─ Overview / SC            ├─ 구현 결과
└─ Activity (자동 이력)     ├─ Spec (docs/spec/)
                            └─ ADR, 도메인 지식
```

### 교차 복제 금지 규칙

| 금지 | 이유 |
|------|------|
| Git 파일에 `status` frontmatter | Linear가 상태 SSOT |
| Git 파일에 `tags`, `milestone`, `related` | Linear가 라벨/프로젝트/relation SSOT |
| Linear description에 설계 상세 복제 | Git plan.md가 설계 SSOT |
| Linear comment에 코드 diff 복제 | Git commit이 코드 변경 SSOT |

### 영역 간 연결 방식

| 연결 | 방법 |
|------|------|
| Linear → Git | Issue description의 `## Git Documents` 섹션에 상대경로 기록 |
| Git → Linear | `_index.md` blockquote에 Linear Issue URL. frontmatter `linear_id` |
| Claude Code → Linear | 스킬의 `### Linear MCP` 섹션에 호출 패턴 정의 |
| Claude Code → Git | 스킬이 `docs/issue/{ID}/` 하위 파일 직접 생성/갱신 |
| Linear Document → Git spec | Document에 `docs/spec/{name}.md#section` 앵커 링크. 상세 결정은 Document에 작성 |

---

## 3. 삼각 분리

| 영역 | 역할 | 파일/도구 |
|------|------|---------|
| **Identity** | CLAUDE.md — 프로젝트 허브 | `CLAUDE.md` (200줄 이내) |
| **Patterns** | Skills — 실행 패턴 정의 | `.claude/skills/*/SKILL.md` |
| **Constraints** | Rules — 행동 제약 | `.claude/rules/*.md` (paths 기반 조건부 로드) |

---

## 4. Type별 파이프라인

| Type | 워크플로우 | Planning | Testing | Verifying |
|------|-----------|:--------:|:-------:|:---------:|
| feature | Full | O | O | O |
| bug | Short | — | — | O |
| improvement | Mid | O | — | O |

> 상세: [pipeline.md](../../.claude/rules/pipeline.md) §1

---

## 5. 설계 이력

> v8 프레임워크에서 마이그레이션한 경우 차용/변형/제거 상세는 `docs/migration/` 문서를 참조.
> 이 프레임워크를 신규 도입하는 경우 이 섹션은 무시해도 됨.
