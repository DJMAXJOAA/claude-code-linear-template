# Linear 기반 Claude Code 프레임워크

> 버전: v1.1.0

Linear를 상태 SSOT로, Git을 지식 SSOT로 사용하는 Claude Code 개발 프레임워크 템플릿.

## 빠른 시작

1. **"Use this template"** 버튼으로 새 레포지토리 생성
2. (선택) 템플릿 전용 파일 삭제: `.github/workflows/release.yml`, `.claude/commands/릴리스.md`
3. [docs/guides/setup.md](docs/guides/setup.md)의 설정 가이드를 따라 Linear 워크스페이스 + MCP 설정 진행

## 구성요소

| 유형 | 수량 | 설명 |
|------|------|------|
| CLAUDE.md | 1 | 프로젝트 허브 (PROJECT + FRAMEWORK 섹션) |
| Rules | 2 | pipeline.md, docs-writing.md |
| Guides | 3 | framework.md, context.md, setup.md |
| Skills | 10 | dev-pipeline, gen-hub, gen-plan, implement, feature-close, triage, feedback, investigation, verify, test |
| Commands | 9 | /등록, /활성화, /점검, /커밋, /피드백, /조사, /검증, /병합, /현황 |

## 파이프라인

```
/등록 → /활성화 → type별 워크플로우 분기 → 완료
```

| Type | 워크플로우 |
|------|-----------|
| feature | Planning → In Progress → Testing → Verifying → Done |
| bug | In Progress → Verifying → Done |
| improvement | Planning → In Progress → Verifying → Done |

## 3영역 SSOT

| 영역 | 역할 | 저장소 |
|------|------|--------|
| Linear | 상태 (State, Labels, Priority, SC) | Linear API |
| Git | 지식 (Plan, CL, Decisions, 구현 결과) | docs/issue/{ID}/ |
| Claude Code | 실행 (Skills, Commands, Rules) | .claude/ |

## 커맨드 요약

| 커맨드 | 역할 |
|--------|------|
| `/등록` | Issue 등록 (모든 type) |
| `/활성화` | Issue 활성화/재개 |
| `/점검` | 수동 테스트 결과 분류 |
| `/커밋` | Conventional Commits |
| `/피드백` | 피드백 분류·등록 |
| `/조사` | 사전 조사 |
| `/검증` | 프레임워크 구조 무결성 |
| `/병합` | 브랜치 병합 |
| `/현황` | Linear 활성 Issue 조회 |

## 전제 조건

| 항목 | 요구사항 |
|------|---------|
| Claude Code | 최신 버전 |
| oh-my-claudecode | 설치 및 활성화 |
| Linear | Free 플랜 이상 |

상세 설정 절차는 [docs/guides/setup.md](docs/guides/setup.md) 참조.

## 라이선스

MIT

## 버전 이력

| 버전 | 날짜 | 주요 변경 |
|------|------|----------|
| v1.1.0 | 2026-03-19 | /스펙 커맨드 추가, docs/issue/ 플랫 구조 전환, spec-driven development 도입, research type 제거 |
| v1.0.0 | 2026-03-18 | 초기 릴리스. 25개 산출물 (CLAUDE.md + Rules 2 + Guides 3 + Skills 10 + Commands 9) |
