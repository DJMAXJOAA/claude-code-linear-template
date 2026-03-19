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
| *(프로젝트별 추가)* | *(레이어/모듈 구조 등)* |

> 프레임워크 고정 경로(`docs/issue/`, `docs/adr/`, `.claude/` 등)는 [ID System](#framework-id-system) 참조

## Project Rules

| 파일 | paths | 역할 |
|------|-------|------|
| *(프로젝트별 추가)* | *(경로)* | *(역할)* |

> 예: `coding.md` (`src/**`) — 코딩 컨벤션

## Key References

| 문서 | 경로 | 설명 |
|------|------|------|
| 프레임워크 가이드 | [docs/guides/framework.md](docs/guides/framework.md) | 핵심 원칙, 3영역 SSOT |
| 컨텍스트 관리 | [docs/guides/context.md](docs/guides/context.md) | Progressive Disclosure, 토큰 관리 |
| Spec 인덱스 | [docs/spec/_index.md](docs/spec/_index.md) | 기능 명세 인덱스 |
| *(프로젝트별 추가)* | *(경로)* | *(설명)* |

<!-- ============ FRAMEWORK ============ -->
<!-- 이 아래는 프레임워크 고정 영역 — 수정 금지 -->

## Framework: Pipeline

`/등록` → `/활성화` → type별 워크플로우 분기 → 완료
- feature/improvement(통합): Todo → Planning → In Progress → In Review → Done
- bug(경량): Todo → In Progress → In Review → Done (Git 문서 미생성, Linear only)
- 각 단계: 4단계 게이트(계획→검토→저장→실행) 경유
- 구현: CL S1 기반 Micro-tasking (verify 완료 후 커밋, 대규모 시 중간 커밋 허용)
- In Progress 완료 후 verify 자동 호출 → In Review(사용자 확인) → Done
- 상세: [.claude/rules/pipeline.md](.claude/rules/pipeline.md)

## Framework: Context Management

- **Progressive Disclosure**: 필요한 문서만 필요한 시점에 로드
- **50% 규칙**: 컨텍스트 50% 이상 소모 시 /clear 고려
- **Pre-Compaction**: 압축 전 진행 상태를 CL + Linear에 저장
- **Linear 컨텍스트**: `/활성화` 시 Linear 1회 조회 후 세션 내 캐싱. 매 태스크마다 재조회 금지
- 상세: [docs/guides/context.md](docs/guides/context.md)

## Framework: Commands

- 커맨드 10개: `/등록`, `/활성화`, `/점검`, `/커밋`, `/피드백`, `/조사`, `/검증`, `/병합`, `/현황`, `/스펙`
- 스킬 11개: 각 `.claude/skills/*/SKILL.md`에 정의
- 커맨드 → 스킬 매핑은 각 커맨드 파일 내부에 명시

## Framework: Linear Integration

**3영역 SSOT**: Linear(상태) · Git(지식) · Claude Code(실행). 교차 복제 금지.
- MCP 도구 호출 패턴은 각 스킬의 `### Linear MCP` 섹션 참조
- 상세: [docs/guides/framework.md](docs/guides/framework.md)

## Framework: ID System

- Issue: Linear ID (`PRJ-47`) — `docs/issue/PRJ-47/` 폴더에 문서 (bug 제외 — bug는 Git 문서 미생성). `issue_type` frontmatter로 feature/improvement 구분
- 태스크: `T-{LINEAR-ID}-NN`, ADR: `ADR-NNNN`, 보고서: `RPT-*`
- 폴더 내 파일: `_index.md`(항상) + `plan.md`, `cl.md`(Planning 시)
- Spec: `docs/spec/{spec-name}/` (kebab-case 디렉토리, `_index.md` + 하위 문서들)
- 상세: [.claude/rules/docs-writing.md](.claude/rules/docs-writing.md)

## Framework: Rules Delegation

| 파일 | paths | 역할 |
|------|-------|------|
| [pipeline.md](.claude/rules/pipeline.md) | `docs/issue/**`, `.claude/skills/**` | 파이프라인 |
| [docs-writing.md](.claude/rules/docs-writing.md) | `docs/**` | 문서 작성 |

프로젝트별 추가 Rules → [Project Rules](#project-rules) 참조

## Framework: Forbidden

- 운영 환경 직접 배포 금지 (CI/CD 경유)
- Secrets / API 키 커밋 금지
- ADR 직접 수정 금지 (새 ADR로 supersede)
- CLAUDE.md 200줄 초과 금지
- 문서에 실행 스크립트(bash/python/JSON) 포함 금지
- 상태의 Git 중복 기록 금지 (Linear SSOT)
