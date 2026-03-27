# 구현 결과 섹션 템플릿

`plan.md`의 `## 8. Outcome` 섹션에 삽입 + Linear description `## Changes` 섹션에 기록:

### plan.md Outcome

```markdown
## 8. Outcome

| 항목 | 내용 |
|------|------|
| 구현 요약 | {요약} |
| 설계 대비 차이점 | {차이점 또는 "없음"} |
| 미해결 이슈 | {이슈 목록 또는 "없음"} |
| 완료일 | {YYYY-MM-DD} |
```

### Linear description Changes

```markdown
## Changes
- {주요 변경 1. 적용 내용 상세}
- {주요 변경 2}
```

### type별 구현 결과 내용

| type | 구현 결과 기록 |
|------|-------------|
| feature | plan.md Outcome + Linear Changes + comments |
| improvement-standard | plan.md Outcome + Linear Changes + comments |
| improvement-light | Linear Changes + comments (plan.md 있으면 Outcome 추가) |
| bug | Linear Changes + comments (plan.md 있으면 Outcome 추가) |
