---
linear_id: TES-1
title: "Plan: 프로젝트 README 자동 생성 기능"
type: plan
created: 2026-03-31
---
> [Linear Issue](https://linear.app/projectx-tiki/issue/TES-1/프로젝트-readme-자동-생성-기능)

# TES-1: 프로젝트 README 자동 생성 기능

## RALPLAN-DR Summary

### Principles
1. **Simplicity** — Pure Node.js, no dependencies, minimal code
2. **Idempotency** — 동일 입력에 항상 동일 출력
3. **Robustness** — 플레이스홀더/빈 테이블도 안전하게 처리

### Decision Drivers
1. T7 파이프라인 통합 테스트 목적 — 최소 구현 우선
2. 외부 의존성 금지 제약
3. CLAUDE.md 테이블 포맷이 고정 (`| 항목 | 값 |` 형태)

### Viable Options

**Option A: Regex 기반 테이블 파싱 (선택)**
- Pros: 단순, 의존성 없음, 빠른 구현
- Cons: 복잡한 마크다운 변형에 취약

**Option B: Line-by-line 상태 머신 파싱**
- Pros: 확장성 좋음, 섹션 경계 인식 정확
- Cons: 코드량 증가, 테스트 목적에 과도
- 기각 사유: T7 테스트 범위에서 불필요한 복잡성

---

## Tasks

| ID | Task | Dependencies | Status |
|----|------|--------------|--------|
| T-TES-1-01 | CLAUDE.md 마크다운 테이블 파서 구현 | — | done |
| T-TES-1-02 | README.md 템플릿 생성 및 파일 출력 | T-TES-1-01 | done |
| T-TES-1-03 | CLI 엔트리포인트 및 수동 검증 | T-TES-1-02 | done |

### T-TES-1-01: CLAUDE.md 마크다운 테이블 파서 구현
- `fs.readFileSync`로 CLAUDE.md 읽기
- "Tech Stack" 헤더 이후 `| 항목 | 값 |` 형태 테이블 행 추출
- "Directory Overview" 헤더 이후 `| 경로 | 역할 |` 형태 테이블 행 추출
- 각 행을 `{ key, value }` 객체 배열로 반환
- **AC**: 두 테이블에서 데이터 행(헤더/구분선 제외)을 정확히 추출

### T-TES-1-02: README.md 템플릿 생성 및 파일 출력
- 파싱 결과를 README 마크다운 문자열로 조립
- 섹션: 프로젝트명(CLAUDE.md Project Identity에서), Tech Stack, Directory Overview
- `fs.writeFileSync`로 프로젝트 루트에 README.md 저장 (덮어쓰기)
- **AC**: 생성된 README.md에 Tech Stack, Directory 섹션이 존재하고 파싱된 값이 포함됨

### T-TES-1-03: CLI 엔트리포인트 및 수동 검증
- `scripts/generate-readme.js`를 `node scripts/generate-readme.js`로 실행 가능하게 구성
- 실행 시 성공/실패 메시지 콘솔 출력
- 에러 시 non-zero exit code 반환
- **AC**: `node scripts/generate-readme.js` 실행 후 README.md가 생성되고 내용이 올바름

---

## Verification

- [ ] `node scripts/generate-readme.js` 실행 성공 (exit code 0)
- [ ] 생성된 README.md에 Tech Stack 섹션 존재
- [ ] 생성된 README.md에 Directory Overview 섹션 존재
- [ ] CLAUDE.md 테이블 값이 README.md에 정확히 반영됨
- [ ] 외부 의존성 없음 확인 (package.json dependencies 미사용)

## Outcome

_(실행 완료 후 기록)_
