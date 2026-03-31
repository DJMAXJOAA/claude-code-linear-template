---
linear_id: TES-1
title: "Technical: 프로젝트 README 자동 생성 기능"
type: technical
created: 2026-03-31
---
> [Linear Issue](https://linear.app/projectx-tiki/issue/TES-1/프로젝트-readme-자동-생성-기능)

# TES-1: Technical Design — README 자동 생성

## Architecture

단일 스크립트 (`scripts/generate-readme.js`) — 모듈 분리 없음.

```
CLAUDE.md  →  [파서]  →  구조화 데이터  →  [생성기]  →  README.md
```

## 파싱 전략

### 테이블 감지
CLAUDE.md에서 섹션 헤더(`## Tech Stack`, `## Directory Overview`)를 찾고, 해당 헤더 아래의 마크다운 테이블을 파싱한다.

### 테이블 행 파싱 규칙
1. `|`로 시작하는 행만 테이블 행으로 인식
2. 첫 번째 행은 헤더 — 스킵
3. 두 번째 행은 구분선 (`|------|`) — 스킵
4. 세 번째 행부터 데이터 행: `| key | value |` → `{ key: "key".trim(), value: "value".trim() }`
5. 빈 행 또는 `|`로 시작하지 않는 행을 만나면 테이블 종료

### 정규식

```javascript
const ROW_REGEX = /^\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/
```

## README 출력 포맷

```markdown
# {프로젝트명}

{설명}

## Tech Stack

| 항목 | 값 |
|------|-----|
| 언어 | ... |
| ... | ... |

## Directory Overview

| 경로 | 역할 |
|------|------|
| `src/` | ... |
| ... | ... |
```

- 프로젝트명과 설명은 "Project Identity" 테이블에서 추출
- 값이 플레이스홀더(`(입력)`, `(프로젝트명 입력)` 등)인 경우 그대로 출력

## 에러 처리

| 시나리오 | 동작 |
|----------|------|
| CLAUDE.md 파일 없음 | `process.exit(1)` + stderr 메시지 |
| 테이블 섹션 없음 | 해당 섹션을 빈 상태로 생성 |
| 파일 쓰기 실패 | `process.exit(1)` + stderr 메시지 |

## 파일 경로 결정

```javascript
const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md')
const readmePath = path.join(process.cwd(), 'README.md')
```

`process.cwd()` 기준으로 동작하여 프로젝트 루트에서 실행하는 것을 전제한다.

## 의존성

- `fs` (Node.js built-in)
- `path` (Node.js built-in)
- 외부 패키지: 없음
