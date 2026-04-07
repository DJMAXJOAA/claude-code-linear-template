# Project CLAUDE.md

<!-- ============ PROJECT ============ -->
<!-- CUSTOMIZE: 아래 섹션을 프로젝트에 맞게 수정하세요 -->

## Project Identity

| 항목 | 값 |
|------|-----|
| 프로젝트명 | (프로젝트명 입력) |
| 버전 | (버전 입력) |
| 유형 | (유형 입력) |
| 설명 | (설명 입력) |

## Tech Stack

| 항목 | 값 |
|------|-----|
| 언어 | (입력) |
| 프레임워크 | (입력) |
| 패키지 매니저 | (입력) |
| 테스트 프레임워크 | (입력) |
| 빌드 도구 | (입력) |

## Directory Overview

| 경로 | 역할 |
|------|------|
| `src/` | 프로젝트 소스코드 |
| `.claude/agents/` | 프레임워크 전용 에이전트 정의 (on-demand 로드) |
| `.claude/templates/` | 공유 템플릿 — 범용 포맷 SSOT (on-demand 부분 로드) |
| *(프로젝트별 추가)* | *(레이어/모듈 구조 등)* |

> 프레임워크 고정 경로(`docs/issue/`, `.claude/` 등)는 [ID System](#framework-id-system) 참조

## Project Rules

| 파일 | paths | 역할 |
|------|-------|------|
| [coding.md](.claude/rules/coding.md) | `src/**` | 코딩 컨벤션 (스켈레톤 — 프로젝트별 커스터마이즈) |
| *(프로젝트별 추가)* | *(경로)* | *(역할)* |

## Key References

| 문서 | 경로 | 설명 |
|------|------|------|
| 프레임워크 가이드 | [.claude/templates/framework.md](.claude/templates/framework.md) | 핵심 원칙, 3영역 SSOT |
| 컨텍스트 관리 | [.claude/templates/context.md](.claude/templates/context.md) | Progressive Disclosure, 토큰 관리 |
| Agent Writing Guide | [.claude/templates/agent-writing-guide.md](.claude/templates/agent-writing-guide.md) | 에이전트 작성 가이드 |
| Skill Writing Guide | [.claude/templates/skill-writing-guide.md](.claude/templates/skill-writing-guide.md) | 스킬 작성 가이드 |
| *(프로젝트별 추가)* | *(경로)* | *(설명)* |

<!-- ============ FRAMEWORK ============ -->
<!-- 이 아래는 프레임워크 고정 영역 — 수정 금지 -->

## Framework: Pipeline

`/등록` → `/활성화` → type별 워크플로우 분기 → 완료
- Intensity 선택: `/활성화` 시 AI 추천 + 사용자 선택 (Light/Standard/Deep). 상세: [.claude/skills/dev-pipeline/SKILL.md](.claude/skills/dev-pipeline/SKILL.md)
- feature: intensity별 — Light(explore→planner→executor) / Standard(explore→analyst→ralplan→ralph) / Deep(deep-interview→autopilot)
- improvement: intensity별 — Light(code-reviewer→executor, Git 미생성) / Standard(plan→architect→executor) / Deep(deep-interview→autopilot)
- bug: intensity별 — Light(debugger→executor, Git 미생성) / Deep(trace→debugger→architect→executor, Git 미생성)
- 각 단계: 4단계 게이트(계획→검토→저장→실행) 경유
- 구현: intensity별 실행 — Light(executor 단독) / Standard(feature: ralph 루프, improvement: executor) / Deep(autopilot)
- In Progress 완료 후 verify 자동 호출 → In Review(사용자 확인) → issue-close → Done
- 사후 문서화: `/정리` — 파이프라인 없이 작업 후 문서화. 상세: [.claude/skills/cleanup/SKILL.md](.claude/skills/cleanup/SKILL.md)
- OMC 최소 요구 버전: v4.9.3 (MCP 안정성, 스킬 상태 충돌 방지)
- 상세: [.claude/rules/pipeline.md](.claude/rules/pipeline.md)

## Framework: Context Management

- **Progressive Disclosure**: 필요한 문서만 필요한 시점에 로드
- **50% 규칙**: 컨텍스트 50% 이상 소모 시 /clear 고려
- **Pre-Compaction**: 압축 전 진행 상태를 progress.txt + Linear에 저장
- **Linear 컨텍스트**: `/활성화` 시 Linear 1회 조회 후 세션 내 캐싱. 매 태스크마다 재조회 금지
- 상세: [docs/guides/context.md](docs/guides/context.md)

## Framework: Commands

- 커맨드 12개: `/등록`, `/활성화`, `/점검`, `/커밋`, `/피드백`, `/조사`, `/검증`, `/병합`, `/현황`, `/스펙`, `/릴리스`, `/정리`
- 스킬 14개: 각 `.claude/skills/*/SKILL.md`에 정의 (issue-close: 전 type 공통 완료 처리)
- 커맨드 → 스킬 매핑은 각 커맨드 파일 내부에 명시

## Framework: Linear Integration

**3영역 SSOT**: Linear(상태) · Git(지식) · Claude Code(실행). 교차 복제 금지.
- MCP 도구 호출 패턴은 각 스킬의 `## Linear MCP` 섹션 참조
- 상세: [docs/guides/framework.md](docs/guides/framework.md)

## Framework: ID System

- Issue: Linear ID (`PRJ-47`) — `docs/issue/PRJ-47/` 폴더에 문서 (feature, improvement만. bug는 Git 폴더 미생성). `issue_type` frontmatter로 feature/bug/improvement 구분
- 태스크: `T-{LINEAR-ID}-NN`, 보고서: `RPT-*`
- feature, improvement(Standard/Deep)만 Git 폴더 생성. improvement-Light 및 bug는 Git 폴더 미생성
- 폴더 내 파일: `spec.md`(항상) + `plan.md`, `technical.md`(Planning 시) + `prd.json`, `progress.txt`(In Progress 시)
- Spec: `docs/spec/{spec-name}/` (kebab-case 디렉토리, `overview.md` + `requirements.md` + `technical.md` + `roadmap.md`(선택))
- FR-ID: `FR-NNN` (spec-local, 각 spec 내 순차). 외부 참조: `{spec-name}:FR-NNN`. EARS 형식 요구사항
- 상세: [.claude/rules/docs-writing.md](.claude/rules/docs-writing.md)

## Framework: Directory Index

- 디렉토리 탐색 시 `AGENTS.md` 파일을 인덱스로 사용 (목적, 주요 파일, 하위 디렉토리, AI 작업 지침)
- `deepinit`으로 일괄 생성/갱신. `.gitignore` 대상 (코드에서 파생 가능)
- 코드 구현 전 관련 디렉토리의 `AGENTS.md`를 읽어 기존 유틸리티·서비스와의 중복 방지
- Spec 허브 문서는 `overview.md` (AGENTS.md와 별도, Git 추적 대상)

## Framework: Rules Delegation

| 파일 | paths | 역할 |
|------|-------|------|
| [pipeline.md](.claude/rules/pipeline.md) | `docs/issue/**`, `.claude/skills/**` | 파이프라인 |
| [docs-writing.md](.claude/rules/docs-writing.md) | `docs/**` | 문서 작성 |

프로젝트별 추가 Rules → [Project Rules](#project-rules) 참조

## Framework: Forbidden

- 운영 환경 직접 배포 금지 (CI/CD 경유)
- Secrets / API 키 커밋 금지
- CLAUDE.md 200줄 초과 금지
- 문서에 실행 스크립트(bash/python/JSON) 포함 금지
- 상태의 Git 중복 기록 금지 (Linear SSOT)
