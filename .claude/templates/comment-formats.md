# Linear Comment 표준 형식

Linear comment 유형별 표준 형식 정의. `linear-comment-writer` 에이전트 및 스킬이 SSOT로 참조.

## comment_type 목록

| comment_type | 용도 | 주요 호출자 |
|-------------|------|-----------|
| `completion` | 완료 요약 (feature, improvement-standard) | issue-close |
| `completion-light` | 경량 완료 요약 (bug-light, improvement-light) | bug-fix, improvement-fix |
| `completion-deep` | 심층 완료 요약 (bug-deep) | bug-fix |
| `plan-summary` | Planning 완료 요약 | gen-plan |
| `investigation` | 조사 완료 보고 | bug-fix (Deep) |
| `triage-log` | 분류 결과 기록 | triage |
| `implement-in-review` | 구현·검증 완료 → In Review 통합 comment | implement |
| `spec-completion` | Spec 완료 요약 | dev-pipeline |
| `limitation` | Known Limitation 기록 | feedback, triage |

---

## completion

전 type 공통 완료 처리 시 사용. feature, improvement-standard에서 호출.

### 포함 항목

| 항목 | 적용 type | 설명 |
|------|----------|------|
| 구현 결과 요약 | 전 type | 1~3줄 요약 |
| 설계 이탈 유무 | feature, improvement-standard | plan.md 대비 차이점 |
| 미해결 이슈 유무 | 전 type | 후속 작업 필요 여부 |
| Git 작업 기록 | 전 type | 관련 커밋 목록 (pipeline.md "Git Log Format" 참조) |

### 형식

```
## 완료 요약
{구현 결과 1~3줄 요약}

- 설계 이탈: {유/무 + 요약}
- 미해결 이슈: {유/무 + 목록}

### Git Log
- `{hash}` {message}
- `{hash}` {message}
```

> feature, improvement-standard: 설계 이탈 항목 포함. bug, improvement-light: 설계 이탈 생략.

---

## completion-light

bug-light, improvement-light의 구현/검증 완료 시 사용. 간결한 형식.

### 형식

```
## 수정 요약
{수정 내용 1~2줄 요약}

- 수정 파일: {N}개
- verify: {PASS/FAIL}
```

---

## completion-deep

bug-deep의 구현/검증 완료 시 사용. Root Cause 포함 structured 형식.

### 형식

```
🔍 Bug Deep Investigation — {LINEAR-ID}

## Root Cause
{근본 원인 1~3줄 요약}

## Investigation
- Trace: {인과 추적 핵심 발견}
- Scope: {영향 범위 — 파일/모듈}

## Resolution
- {수정 내용 요약}
- {변경 파일 목록}

## Verify
{PASS/FAIL} — {SC 통과 현황}
```

---

## plan-summary

Planning 완료 시 사용. gen-plan에서 호출.

### 형식

```
## Planning 완료
- 태스크: {N}개
- 주요 설계 결정: {1~2줄 요약}
```

---

## investigation

bug-deep 조사 완료 시 사용. 코드 수정 전 조사 결과 기록.

### Light 조사 완료

```
Bug 수정 시작 — Intensity: Light. Root Cause: {1줄 요약}. 수정 방안: {1줄 요약}
```

### Deep 조사 완료

```
## Root Cause Analysis
{근본 원인 상세}

## 재현 조건
{재현 단계 또는 조건}

## 영향 범위
{영향받는 파일/모듈/기능}

## 수정 계획
{수정 방안 요약}
```

---

## triage-log

`/점검` 수행 후 분류 결과 기록.

### 형식

```
## Triage 결과
{분류 요약 — 유형, 심각도}

### 라우팅
{라우팅 판단 — 어떤 프로세스로 전달되는지}
```

---

## implement-in-review

implement에서 verify PASS 후 In Review 전이 시 사용. 구현 + 검증 결과를 통합한 간략 comment.

### 형식

```
구현·검증 완료 → In Review

변경 파일 {N}개. 주요: {핵심 변경 1줄 요약}.
verify {PASS/FAIL} — SC {통과}/{전체}, Verification {통과}/{전체}.
수동 테스트 {M}개 항목 확인 필요.
```

---

## spec-completion

Pre-Plan Q/A에서 spec.md 저장 + SC 갱신 직후 사용. 1줄 요약 comment.

### 형식

```
Spec 완료 — {1줄 요약}. docs/issue/{ID}/spec.md
```

---

## limitation

Issue 진행 중 Known Limitation 기록 시 사용. feedback(limitation 유형), triage(limitation 분류)에서 호출.

### 형식

```
## Known Limitation
{limitation 내용}
```

> progress.txt 존재 시 동일 내용을 progress.txt에도 append한다.
