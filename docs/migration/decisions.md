---
title: Decisions — Linear 기반 프레임워크 구축
created: 2026-03-17
---

> [_index.md](_index.md)

# Decisions Log

작업 중 발생하는 설계 결정, 구현 선택, 변경 사항을 기록한다.

## 확정 결정 (설계 스펙에서 이관)

| # | 결정 | 선택 | 근거 | 출처 |
|---|------|------|------|------|
| D1 | 파이프라인 통합 | type(label)별 워크플로우 분기 | Feature/Issue 분리 폐기 | 09 §1 |
| D2 | intensity 시스템 | 폐기 | type이 프로세스 엄밀도 결정 | 09 §1 |
| D3 | 폴더 구조 | `docs/issue/{LINEAR-ID}/` 통합 | Issue 종속 문서만 Linear ID 폴더. ADR 등 cross-cutting은 독립 | 09 §4 |
| D4 | CLAUDE.md | 단일 파일 + `<!-- FRAMEWORK -->` / `<!-- PROJECT -->` | 200줄 내외. 상세는 rules/guides에 위임 | 09 §5 |
| D5 | Hub 파일 | `_index.md` (인덱스 전용) | 상태/개요/SC는 Linear. Git에는 문서 목록 + linear_id 매핑만 | 09 §4 |
| D6 | 파일 구성 | _index.md + plan.md + cl.md 기본 | decisions.md, notes.md는 lazy-creation | 09 §4 |
| D7 | Linear↔Git 링크 | 등록 시 자동 삽입 + 동적 조회 | Git root 기준 상대경로로 description에 기록 | 09 §9 |
| D8 | 커맨드 이름 | /등록, /활성화 | 통합 파이프라인에 맞는 범용 이름 | 09 §2 |
| D9 | OMC 전제 | 무조건 활성화 | omc-check 제거. 스킬 내용을 직접 정의 | 09 §8 |
| D10 | Rules 범위 | 프레임워크 고정 2개만 | pipeline.md, docs-writing.md. coding.md 등은 프로젝트별 추가 | 09 §6 |
| D11 | 폴더명 | `docs/issue/` (단수형) | 단수형이 경로 표기에 자연스러움. `docs/adr/`과 일관 | 09 §12 |
| D12 | research type Plan | plan.md 미생성 | investigation 스킬이 조사 보고서 직접 생성 | 09 §12 |
| D13 | Domain Notes | `docs/shared/`에 보관 | `docs/shared/domain-{topic}.md` 형태 | 09 §12 |

## 구현 중 결정

> 구현 진행하면서 발생하는 결정을 아래에 추가한다.

| # | 날짜 | 결정 | 선택 | 근거 |
|---|------|------|------|------|
| I1 | 2026-03-17 | Linear MCP 서버 방식 | Linear 공식 호스팅 MCP (`https://mcp.linear.app/mcp`, HTTP, OAuth) | API 키 별도 관리 불필요. `.claude.json` projects 섹션에 프로젝트 스코프로 등록 |
| I2 | 2026-03-17 | MCP 설정 위치 | 프로젝트 스코프 (`.claude.json` > projects > 해당 경로) | 프레임워크 템플릿에 종속. 글로벌 오염 방지 |
| I3 | 2026-03-17 | NF-1 검증 세션 | 대상 프로젝트에서 별도 세션으로 진행 | 현재 프로젝트에서는 Linear MCP에 접근 불가 (프로젝트 스코프 MCP) |
| I4 | 2026-03-17 | save_issue upsert 패턴 | id 미지정=Create, id 지정=Update | 별도 create/update 도구 없음. 스킬에서 이 패턴을 추상화 참조 |
| I5 | 2026-03-17 | state/label 이름 지정 | stateId/labelId 대신 이름(문자열)으로 직접 지정 | MCP 서버가 이름→ID 해석 지원. 스킬에서 ID 캐싱 불필요 |
| I6 | 2026-03-17 | 커스텀 Workflow States | Planning/Testing/Verifying 추가 필요 | Linear UI Workflow Settings에서 수동 추가. **사용자 확인 대기** |
| I7 | 2026-03-17 | Research label | 추가 필요 | 4번째 type label. MCP `create_issue_label`로 추가 가능. **사용자 확인 대기** |
| I8 | 2026-03-17 | Commands & Skills 테이블 축소 | 19행 테이블 → 3행 불릿 | 커맨드 이름 나열은 유지(한글 매칭 힌트), 스킬 테이블 제거. `/` 치면 목록이 나오고, 스킬은 paths 기반 자동 로드 |
| I9 | 2026-03-17 | Linear Integration SSOT 테이블 제거 | 원칙 1줄 + 참조 링크로 축소 | pipeline.md §4, framework.md에서 반복되는 내용. CLAUDE.md는 원칙만 명시 |
| I10 | 2026-03-17 | Pipeline type 테이블 제거 | 4행 불릿으로 축소 | pipeline.md에 동일 테이블 존재. CLAUDE.md에서는 위임 |
| I11 | 2026-03-17 | ID System 파일 구성 테이블 제거 | 4행 불릿으로 축소 | docs-writing.md §2~§3에 상세. CLAUDE.md에서는 요약만 |
| I12 | 2026-03-17 | Forbidden 이유 컬럼 제거 | 테이블 → 불릿 리스트 | 규칙 자체가 중요. 이유는 framework.md에 위임 |
| I13 | 2026-03-17 | Rules Delegation 프로젝트별 행 제거 | Project Rules 참조로 대체 | PROJECT 섹션 Project Rules와 중복 |
| I14 | 2026-03-17 | Linear 컨텍스트 캐싱 규칙 추가 | Context Management에 1줄 추가 | 09a §4-4 읽기 최적화. 모든 세션에서 적용 필요한 가드레일 |
| I15 | 2026-03-17 | Workflow States 다이어그램 제거 | pipeline.md §1에 위임 | CLAUDE.md Linear Integration 섹션에서 중복 |
| I16 | 2026-03-17 | CLAUDE.md 총량 | 164줄 → 103줄 (37% 축소) | 토큰 효율 최우선. "상세는 rules/guides에 위임" 원칙 강화 |
| I17 | 2026-03-17 | 섹션 순서 변경 | PROJECT → FRAMEWORK 순서 | 프로젝트별 내용이 먼저 로드되어 컨텍스트 효율 향상. 사용자가 커스터마이즈할 영역이 상단에 위치 |
