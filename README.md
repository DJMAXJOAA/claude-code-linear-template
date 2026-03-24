# Linear 기반 Claude Code 프레임워크

> 버전: v2.4.0

Linear를 상태 SSOT로, Git을 지식 SSOT로 사용하는 **Claude Code 개발 프레임워크 템플릿**.

Issue 등록부터 설계, 구현, 검증, 완료까지의 전체 개발 파이프라인을 Claude Code 슬래시 커맨드로 운영한다. 커맨드를 실행하면 Linear 상태 전이, Git 문서 생성, 코드 구현이 자동으로 연계된다.

## 전제 조건

| 항목 | 요구사항 | 설명 |
|------|---------|------|
| **Claude Code** | 최신 버전 | `claude --version`으로 확인 |
| **oh-my-claudecode (OMC)** | 설치 및 활성화 | 멀티 에이전트 오케스트레이션 레이어. 프레임워크 스킬이 OMC의 전문 에이전트(explorer, executor, debugger 등)에 작업을 위임함. [GitHub](https://github.com/yeachan-heo/oh-my-claudecode) 참조 |
| **Linear** | Free 플랜 이상 | 프로젝트 관리 도구. Issue 상태/라벨/우선순위의 SSOT. [Linear Docs](https://linear.app/docs) |
| **Linear MCP** | Claude Code에 등록 | `claude mcp add --transport http linear-server https://mcp.linear.app/mcp` — [Linear × Claude 연동](https://linear.app/integrations/claude) |

> OMC 설치 확인: Claude Code 세션에서 `/oh-my-claudecode:omc-help` 실행 시 응답이 오면 활성화 상태.
>
> Linear MCP 연결 확인: Claude Code 세션에서 "Linear 팀 목록을 조회해줘" 요청 시 팀 정보가 표시되면 정상.

## 빠른 시작

1. **"Use this template"** 버튼으로 새 레포지토리 생성
2. (선택) 템플릿 전용 파일 삭제: `.github/workflows/release.yml`, `.claude/commands/릴리스.md`
3. [docs/guides/setup.md](docs/guides/setup.md)의 설정 가이드를 따라 Linear 워크스페이스 + MCP 설정 진행
4. `CLAUDE.md`의 PROJECT 섹션(상단)을 프로젝트에 맞게 수정
5. `/등록`으로 첫 Issue 생성 → `/활성화 {ID}`로 파이프라인 시작

## 구성요소

| 유형 | 수량 | 설명 |
|------|------|------|
| CLAUDE.md | 1 | 프로젝트 허브 (PROJECT + FRAMEWORK 섹션) |
| Rules | 2 | pipeline.md, docs-writing.md |
| Guides | 3 | framework.md, context.md, setup.md |
| Skills | 12 | dev-pipeline, gen-hub, gen-plan, implement, bug-fix, issue-close, triage, feedback, investigation, verify, test, spec |
| Commands | 10 | /등록, /활성화, /점검, /커밋, /피드백, /조사, /검증, /병합, /현황, /스펙 |

## 파이프라인

```
/등록 → /활성화 → type별 워크플로우 분기 → 완료
```

| Type | 워크플로우 | 특징 |
|------|-----------|------|
| feature / improvement | Todo → Planning → In Progress → In Review → Done | Plan + CL 생성, Micro-tasking 구현, auto-verify |
| bug | Todo → In Progress → In Review → Done | Git 문서 미생성, Linear only, Root Cause 분석 |

각 상태 전이는 4단계 게이트(계획 → 검토 → 저장 → 실행)를 경유한다.

## 3영역 SSOT

| 영역 | 역할 | 저장소 | 교차 복제 금지 |
|------|------|--------|--------------|
| **Linear** | 상태 (State, Labels, Priority, SC) | Linear API | Git에 상태 중복 기록 금지 |
| **Git** | 지식 (Plan, CL, Decisions, 구현 결과) | `docs/issue/{ID}/` | Linear에 문서 전문 복사 금지 |
| **Claude Code** | 실행 (Skills, Commands, Rules) | `.claude/` | — |

## 커맨드 요약

| 커맨드 | 역할 | 호출 스킬 |
|--------|------|----------|
| `/등록` | Issue 등록 (모든 type) | gen-hub |
| `/활성화` | Issue 활성화/재개 — type별 워크플로우 분기 | dev-pipeline |
| `/스펙` | 기능 명세 생성 (Spec-driven development) | spec |
| `/조사` | 사전 조사 수행 및 보고서 생성 | investigation |
| `/점검` | 수동 테스트 결과 분류 (8유형 triage) | triage |
| `/피드백` | 피드백 분류·등록 (directive/limitation/backlog) | feedback |
| `/검증` | 프레임워크 무결성 또는 구현 완전성 검증 | verify |
| `/커밋` | Conventional Commits 자동 커밋 | — |
| `/병합` | 브랜치 병합 | — |
| `/현황` | Linear 활성 Issue 조회 | — |

## 라이선스

MIT

> 버전 이력은 [GitHub Releases](https://github.com/DJMAXJOAA/claude-code-linear-template/releases)에서 확인할 수 있습니다.
