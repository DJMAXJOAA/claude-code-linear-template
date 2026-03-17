---
title: Handoff — NF-1 Linear MCP 동작 검증
created: 2026-03-17
---

# NF-1: Linear MCP 동작 검증

> 이 문서는 `claude-code-linear-template` 프로젝트에서 별도 세션으로 실행할 MCP 검증 작업의 인수인계 문서이다.

## 배경

| 항목 | 내용 |
|------|------|
| 프로젝트 | Linear 기반 Claude Code 프레임워크 신규 구축 |
| 현재 Phase | Phase 0: Linear MCP 검증 (NF-1) |
| Gate 조건 | NF-1 실패 시 전체 프레임워크 구현 중단 |
| 완료된 태스크 | T-NF1-01 (MCP 설치), T-NF1-02 (설정) |
| 남은 태스크 | T-NF1-03 ~ T-NF1-08 (6개) |

## MCP 설정 현황

| 항목 | 값 |
|------|-----|
| MCP 서버 | `linear-server` |
| 방식 | HTTP (공식 호스팅) |
| URL | `https://mcp.linear.app/mcp` |
| 인증 | OAuth (별도 API 키 불필요) |
| 설정 위치 | `.claude.json` > projects > `C:/Users/240414pc/Documents/claude-code-linear-template` |
| 상태 | `connected` 확인됨 |

## 검증 태스크 (T-NF1-03 ~ T-NF1-08)

### T-NF1-03: 테스트용 Team 확인

- Linear에 이미 Team이 있으면 그것을 사용
- 없으면 Linear UI에서 생성 필요 (사용자에게 확인)
- 이후 검증에서 사용할 Team 이름/ID 확보

### T-NF1-04: Issue CRUD + 상태 변경 라운드트립

아래 순서로 검증:

1. **Create**: Issue 생성 (title, description, labels)
2. **Read**: 생성된 Issue 조회 → ID, state, labels 확인
3. **Update**: Issue 상태 변경 (Backlog → In Progress → Done)
4. **Delete** (선택): 테스트 Issue 정리

검증 항목:
- Issue 생성 후 반환되는 ID 형식 확인 (예: `PRJ-1`)
- 상태 전이가 정상 동작하는지
- description에 마크다운이 올바르게 저장되는지

### T-NF1-05: State/Label 목록 조회

- Team의 Workflow States 목록 조회 → stateId 수집
- Labels 목록 조회 → type labels (feature/bug/improvement/research) 존재 확인
- 프레임워크에서 사용할 6개 상태 매핑:

| 프레임워크 State | Linear Workflow State | stateId |
|-----------------|----------------------|---------|
| Backlog | Backlog | (조회) |
| Planning | (커스텀 추가 필요?) | (조회) |
| In Progress | In Progress | (조회) |
| Testing | (커스텀 추가 필요?) | (조회) |
| Verifying | (커스텀 추가 필요?) | (조회) |
| Done | Done | (조회) |

> Planning, Testing, Verifying 상태가 Linear 기본 상태에 없으면 커스텀 상태 추가 필요. 사용자에게 확인.

### T-NF1-06: Sub-issue 생성

- 부모 Issue 아래에 Sub-issue 생성 (`parentId` 파라미터)
- Sub-issue의 상태를 독립적으로 변경 가능한지 확인
- 이것이 CL S1 태스크 → Linear sub-issue 미러링의 기반

### T-NF1-07: 응답 시간 측정

- 각 MCP 호출의 응답 시간 체감 확인
- 목표: < 3초
- 3초 초과 시 fallback 전략 검토 필요

### T-NF1-08: MCP 도구 매핑 테이블 작성

검증 과정에서 확인한 실제 MCP 도구를 아래 형식으로 정리:

| 프레임워크 행동 | MCP 도구 이름 | 주요 파라미터 | 비고 |
|---------------|-------------|-------------|------|
| Issue 생성 | (확인) | title, description, teamId, labelIds, stateId | |
| Issue 조회 | (확인) | id 또는 identifier | |
| Issue 갱신 (상태) | (확인) | id, stateId | |
| Issue 검색 | (확인) | query, filter | |
| Comment 추가 | (확인) | issueId, body | |
| Sub-issue 생성 | (확인) | parentId, title, ... | |
| Team 조회 | (확인) | | stateId/labelId 캐싱용 |
| Label 조회 | (확인) | teamId | |

> 이 테이블은 프레임워크 스킬에서 Linear MCP 추상화 참조로 사용됨 (R5 지침)

## 완료 조건

| # | 기준 |
|---|------|
| 1 | Issue CRUD + 상태 변경이 정상 동작 |
| 2 | State/Label 목록 조회로 stateId/labelId 확보 |
| 3 | Sub-issue 생성 + 독립 상태 변경 가능 |
| 4 | 응답 시간 < 3초 |
| 5 | MCP 도구 매핑 테이블 작성 완료 |

## 완료 후 처리

1. **매핑 테이블 저장**: 이 문서 하단 또는 별도 파일에 완성된 매핑 테이블 기록
2. **CL 갱신**: `docs/migration/cl.md` T-NF1-03~08 상태를 `done`으로 변경
3. **Notes 갱신**: `docs/migration/notes.md` 작업 로그에 검증 결과 기록
4. **Decisions 갱신**: Linear Workflow 커스텀 상태 추가 여부 등 결정 사항 기록
5. **커밋**: `docs: NF-1 Linear MCP 검증 완료`
6. **_index.md Handoff 갱신**: 다음 작업 → NF-2 (CLAUDE.md 템플릿 작성)

## 주의사항

| # | 주의 |
|---|------|
| 1 | 테스트 Issue는 검증 후 정리 (삭제 또는 Cancel 상태로) |
| 2 | Linear Workflow States가 6개 미만이면 커스텀 상태 추가 필요 — 사용자에게 확인 |
| 3 | MCP 도구 이름은 서버 구현에 따라 다를 수 있음 — 실제 사용 가능한 도구 목록을 먼저 확인 |
| 4 | OAuth 인증이 만료될 수 있음 — 연결 실패 시 재인증 필요 |

## 검증 결과 (별도 세션에서 기록)

> 아래 섹션은 검증 세션에서 채워진다.

### 실제 MCP 도구 매핑 테이블

(검증 후 기록)

### Workflow States 매핑

(검증 후 기록)

### Labels 현황

(검증 후 기록)

### 특이사항/이슈

(검증 후 기록)
