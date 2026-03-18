---
title: 초기 설정 가이드
created: 2026-03-18
---

# 초기 설정 가이드

> 새 프로젝트에서 Linear 기반 Claude Code 프레임워크를 사용하기 위한 설정 절차.
>
> 소요 시간: 약 20~40분 (Linear 워크스페이스 셋업 포함)

---

## 1. 전제 조건

| 항목 | 요구사항 | 확인 방법 |
|------|---------|---------|
| Claude Code | 최신 버전 | `claude --version` |
| oh-my-claudecode (OMC) | 설치 및 활성화 | PreToolUse/PostToolUse Hook 활성화 확인 |
| Linear 계정 | Free 플랜 이상 | [linear.app](https://linear.app) |
| Git | 2.x 이상 | `git --version` |

> OMC 설치 확인: Claude Code 세션에서 `/oh-my-claudecode:omc-help` 명령이 응답하면 활성화된 상태다.

---

## 2. Linear 워크스페이스 셋업

이 섹션의 모든 작업은 **Linear UI에서 수동으로 수행**한다. Linear MCP로는 Workflow State, Label을 생성할 수 없으므로 UI 조작이 필수다.

### 2-1. Team 생성

1. Linear 좌측 사이드바 **+ Add team** 클릭
2. **Team name**: 프로젝트명 입력 (예: `MyProject`)
3. **Identifier**: 짧은 대문자 코드 입력 (예: `MYP`) — Issue ID의 접두사가 됨 (`MYP-1`, `MYP-2`, ...)
4. **Create team** 클릭

> Identifier는 변경하기 어려우므로 신중하게 결정한다. 프로젝트명 2~4자 약어를 사용한다.

### 2-2. Custom Workflow States 설정

Team Settings → **Workflow** 에서 아래 6개 상태를 구성한다.

| State 이름 | Type | 설명 |
|-----------|------|------|
| `Backlog` | `backlog` | 등록 직후 대기 상태 |
| `Planning` | `unstarted` | 설계/계획 단계 |
| `In Progress` | `started` | 구현 진행 중 |
| `Testing` | `started` | 수동 테스트 단계 (feature 전용) |
| `Verifying` | `started` | 검증 단계 |
| `Done` | `completed` | 완료 |

설정 방법:
1. Team Settings → **Workflow** 탭
2. 기본 제공되지 않는 상태(`Planning`, `Testing`, `Verifying`)는 **Add state** 로 추가
3. 기본 제공 상태 중 불필요한 것(`Todo` 등)은 삭제하거나 유지
4. 순서를 위 표대로 드래그 정렬

> **Free 플랜 참고**: Custom Workflow State 생성이 불가한 경우, 기본 State에 매핑한다.
> - Planning → `Todo`, Testing/Verifying → `In Progress`
> - 파이프라인 상태 구분이 Linear에서 완전히 반영되지 않으나, Git 문서 기반 진행에는 지장 없다.

### 2-3. Labels 생성

Team Settings → **Labels** 에서 아래 Labels를 생성한다.

**Type Labels (필수 — 파이프라인 분기 기준)**:

| Label | 색상 권장 | 설명 |
|-------|---------|------|
| `Feature` | 파랑 (#4E9BFF) | 신규 기능 개발 |
| `Bug` | 빨강 (#FF4E4E) | 버그 수정 |
| `Improvement` | 초록 (#4EFFB5) | 기존 기능 개선/리팩토링 |
| `Research` | 보라 (#B54EFF) | 조사/분석 |

> `Feature`, `Bug`, `Improvement`은 Linear Team 기본 Labels로 제공될 수 있다. 없는 Label만 추가한다. `Research`는 일반적으로 수동 추가가 필요하다.

**Tag Labels (선택)**: 프로젝트 도메인에 맞게 자유롭게 추가한다 (예: `network`, `ui`, `performance`).

### 2-4. Projects 생성 (선택)

마일스톤 단위로 Linear Project를 생성한다. 마일스톤이 아직 정해지지 않았다면 이 단계는 생략하고 나중에 추가해도 된다.

---

## 3. Linear MCP 설정

### 3-1. Linear 공식 호스팅 MCP 등록

프레임워크는 Linear 공식 호스팅 MCP 서버를 사용한다. 별도 npm 패키지 설치나 API 키 발급이 필요 없다.

Claude Code에서 아래 명령으로 MCP 서버를 추가한다:

```
claude mcp add --transport http linear-server https://mcp.linear.app/mcp
```

> 프로젝트 스코프로 등록하면 해당 프로젝트에서만 Linear MCP를 사용한다. 글로벌 오염을 방지하려면 프로젝트 디렉토리에서 실행한다.

### 3-2. OAuth 인증

MCP 서버 추가 후 Claude Code 세션을 시작하면, 첫 Linear MCP 호출 시 **브라우저에서 OAuth 인증 화면**이 열린다. Linear 계정으로 로그인하고 권한을 승인하면 자동으로 연결된다.

- API 키 발급이나 환경변수 설정은 불필요하다
- OAuth 토큰은 자동 갱신된다
- 인증 정보는 로컬에 안전하게 저장된다

### 3-3. 연결 테스트

Claude Code 세션에서 아래를 요청한다:

```
Linear 팀 목록을 조회해줘
```

성공 시 Team 이름, Identifier, Workflow States, Labels 목록이 표시된다. 실패 시 §10(자주 묻는 문제)을 참조한다.

### 3-4. MCP 도구 참조

프레임워크 스킬은 MCP 도구 이름을 직접 하드코딩하지 않고 추상화 참조 방식을 사용한다. 참고로 주요 도구는 아래와 같다:

| 프레임워크 행동 | MCP 도구 | 핵심 패턴 |
|---------------|---------|----------|
| Issue 생성/갱신 | `save_issue` | id 미지정=Create, id 지정=Update (upsert) |
| Issue 조회 | `get_issue` | identifier로 조회 (예: `MYP-1`) |
| Issue 검색 | `list_issues` | query, team, state, label로 필터 |
| Comment | `save_comment` | issueId + body |
| State/Label | 이름(문자열)으로 직접 지정 | ID 캐싱 불필요 |

---

## 4. 프레임워크 파일 복사

### 4-1. 프레임워크 템플릿 취득

```bash
git clone https://github.com/{org}/claude-code-linear-template.git framework-template
```

### 4-2. 복사 대상

프로젝트 루트에 아래 파일/디렉토리를 복사한다:

```
framework-template/
├── .claude/
│   ├── rules/
│   │   ├── pipeline.md          [FRAMEWORK]
│   │   └── docs-writing.md      [FRAMEWORK]
│   ├── commands/                 [FRAMEWORK] (9개 커맨드)
│   └── skills/                   [FRAMEWORK] (10개 스킬)
├── docs/
│   └── guides/
│       ├── framework.md          [FRAMEWORK]
│       ├── context.md            [FRAMEWORK]
│       └── setup.md              [FRAMEWORK] (이 문서)
└── CLAUDE.md                     [FRAMEWORK + PROJECT]
```

```bash
cp -r framework-template/.claude /path/to/your-project/
cp -r framework-template/docs/guides /path/to/your-project/docs/
cp framework-template/CLAUDE.md /path/to/your-project/
```

### 4-3. 빈 디렉토리 생성

Issue 문서를 담을 type별 디렉토리와 공유 디렉토리를 생성한다:

```bash
cd /path/to/your-project
mkdir -p docs/adr
```

> `docs/feature/`, `docs/bug/`, `docs/improvement/`, `docs/research/` 디렉토리는 `/등록` 실행 시 자동 생성된다. 미리 만들 필요 없다.

`docs/adr/_index.md`를 초기화한다:

```markdown
---
title: ADR Index
---

# ADR Index

| ADR | 제목 | 상태 |
|-----|------|------|
| (없음) | — | — |
```

---

## 5. CLAUDE.md 커스터마이즈

CLAUDE.md는 상단에 `<!-- PROJECT -->` 섹션, 하단에 `<!-- FRAMEWORK -->` 섹션이 배치되어 있다.

**규칙**: `<!-- FRAMEWORK -->` 섹션은 수정하지 않는다. `<!-- PROJECT -->` 섹션만 편집한다.

### 5-1. PROJECT 섹션 작성

```markdown
## Project Identity

| 항목 | 값 |
|------|-----|
| 프로젝트명 | (프로젝트명) |
| 버전 | (버전) |
| 유형 | (프로젝트 유형) |
| 설명 | (한두 줄 설명) |

## Tech Stack

| 항목 | 값 |
|------|-----|
| 언어 | (예: TypeScript) |
| 프레임워크 | (예: Next.js 15) |
| 패키지 매니저 | (예: pnpm) |
| 테스트 프레임워크 | (예: Vitest) |
| 빌드 도구 | (예: Turbopack) |

## Directory Overview

| 경로 | 역할 |
|------|------|
| `src/` | 프로젝트 소스코드 |
| *(프로젝트별 추가)* | *(레이어/모듈 구조 등)* |

## Project Rules

| 파일 | paths | 역할 |
|------|-------|------|
| `.claude/rules/coding.md` | `src/**` | 코딩 컨벤션 |

## Key References

| 문서 | 경로 | 설명 |
|------|------|------|
| 프레임워크 가이드 | [docs/guides/framework.md](docs/guides/framework.md) | 핵심 원칙, 3영역 SSOT |
| 컨텍스트 관리 | [docs/guides/context.md](docs/guides/context.md) | Progressive Disclosure, 토큰 관리 |
```

### 5-2. 프로젝트별 Rules 추가 (선택)

프레임워크 고정 Rules(`pipeline.md`, `docs-writing.md`) 외에 코딩 규칙이 필요하면 `.claude/rules/coding.md` 등을 추가한다. CLAUDE.md의 Project Rules 테이블에 등록한다.

---

## 6. 첫 Issue 등록

설정이 완료되었다면 첫 Issue를 등록해 전체 흐름을 확인한다.

### 6-1. 등록

```
/등록
```

Claude가 아래를 순서대로 안내한다:
1. **제목**: 예) `사용자 인증 시스템 구현`
2. **설명**: 예) `JWT 기반 로그인/로그아웃 + 세션 관리`
3. **type**: `feature` / `bug` / `improvement` / `research` 선택
4. **태그** (선택): 예) `network`, `security`
5. **Project** (선택): 예) `Foundation`

Claude가 수행하는 작업:
1. Linear Issue 생성 (상태: Backlog)
2. `docs/{type}/{LINEAR-ID}/` 폴더 생성 (예: `docs/feature/MYP-1/`)
3. `_index.md` 생성

확인 사항:
- **Linear UI**: Team → Issues에서 Issue가 Backlog 상태로 생성되었는지
- **Git**: `docs/feature/MYP-1/_index.md` 파일이 존재하는지

### 6-2. 활성화

```
/활성화 MYP-1
```

Claude가 Linear에서 Issue 상태와 type을 조회한 뒤, type에 따라 다음 단계를 안내한다:

| type | 첫 응답 |
|------|--------|
| `feature` | Pre-Plan Q/A (SC·스펙·리스크·범위 인터뷰) → gen-plan |
| `bug` | 버그 현상/재현 조건 확인 → Root Cause 분석 |
| `improvement` | 개선 목표·범위 확인 → 간략 gen-plan |
| `research` | 조사 목표·범위 확인 → investigation |

Linear UI에서 Issue 상태가 `Backlog` → `Planning` (또는 `In Progress`)으로 전이되는 것을 확인한다.

---

## 7. 커맨드 요약

| 커맨드 | 역할 | 비고 |
|--------|------|------|
| `/등록` | Issue 등록 (모든 type) | Linear Issue + Git 폴더 생성 |
| `/활성화` | Issue 활성화/재개 | type별 워크플로우 분기 |
| `/점검` | 수동 테스트 결과 분류 | triage 7유형 |
| `/커밋` | Conventional Commits | |
| `/피드백` | 피드백 분류·등록 | directive/limitation/backlog |
| `/조사` | 사전 조사 | investigation 스킬 |
| `/검증` | 프레임워크 구조 무결성 | |
| `/병합` | 브랜치 병합 | |
| `/현황` | Linear 활성 Issue 조회 | |

---

## 8. 프레임워크 고정 vs 프로젝트 커스터마이즈

| 파일 | 유형 | 수정 가능 |
|------|------|----------|
| `.claude/rules/pipeline.md` | 프레임워크 고정 | 수정 금지 |
| `.claude/rules/docs-writing.md` | 프레임워크 고정 | 수정 금지 |
| `.claude/skills/*` | 프레임워크 고정 | 수정 금지 |
| `.claude/commands/*` | 프레임워크 고정 | 수정 금지 |
| `docs/guides/*` | 프레임워크 고정 | 수정 금지 |
| `CLAUDE.md` — FRAMEWORK 섹션 | 프레임워크 고정 | 수정 금지 |
| `CLAUDE.md` — PROJECT 섹션 | 프로젝트 | 자유 수정 |
| `.claude/rules/coding.md` 등 | 프로젝트 추가 | 자유 추가 |
| `docs/shared/*` | 프로젝트 | 자유 추가 |

> 프레임워크 파일을 수정해야 할 필요가 생기면: 수정이 아닌 새 프레임워크 버전으로의 업그레이드를 검토한다.

---

## 9. 설정 완료 체크리스트

- [ ] Linear 계정 준비
- [ ] Linear Team 생성 (Identifier 확정)
- [ ] Workflow States 6개 구성 및 순서 정렬
- [ ] Type Labels 4개 확인/생성 (Feature, Bug, Improvement, Research)
- [ ] (선택) Tag Labels, Projects 추가
- [ ] Linear 공식 MCP 서버 등록 (`claude mcp add`)
- [ ] OAuth 인증 완료
- [ ] Linear 팀 조회로 연결 확인
- [ ] 프레임워크 파일 복사 (`.claude/`, `docs/guides/`, `CLAUDE.md`)
- [ ] `docs/adr/` 디렉토리 및 `_index.md` 초기화
- [ ] CLAUDE.md PROJECT 섹션 작성
- [ ] (선택) 프로젝트별 Rules 파일 추가
- [ ] `/등록` 실행 → Linear Issue + Git 폴더 생성 확인
- [ ] `/활성화 {ID}` 실행 → 파이프라인 분기 확인

---

## 10. 자주 묻는 문제

**Q: Linear MCP 호출 시 인증 오류가 발생한다**
- OAuth 토큰이 만료되었을 수 있다. Claude Code 세션을 재시작하면 재인증 프롬프트가 표시된다.
- MCP 서버 URL이 `https://mcp.linear.app/mcp`인지 확인한다.

**Q: `/등록` 시 Linear Issue가 생성되지 않는다**
- MCP 연결 상태를 먼저 팀 조회로 확인한다.
- OAuth 권한에 Issue 생성(write)이 포함되어 있는지 확인한다.

**Q: Free 플랜에서 Custom State가 생성되지 않는다**
- §2-2의 Free 플랜 대안(기본 State 매핑)을 따른다.
- Git 문서 기반으로 파이프라인 진행에는 지장 없다.

**Q: 기존 프로젝트(현행 프레임워크)에서 마이그레이션하려면?**
- 이 가이드는 신규 프로젝트 전용이다.
- 기존 완료 문서(`docs/features/`, `backlogs/`)는 아카이브 처리를 권장한다.

**Q: 팀원과 함께 사용하려면?**
- OAuth 인증은 개인별로 수행한다.
- 프레임워크 파일(`.claude/rules/`, `.claude/skills/`, `.claude/commands/`)은 Git으로 공유한다.
- MCP 설정은 각자 로컬에서 수행한다.
