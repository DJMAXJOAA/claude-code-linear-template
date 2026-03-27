# type별 description 템플릿

gen-hub 스킬이 Linear Issue 생성 시 사용하는 description 마크다운 템플릿.

## feature

```markdown
## Summary
{자유 양식. 이슈 개요를 간결하게 기술 — What + Why}

---

## Documents
| 문서 | 경로 |
|------|------|
| Note | `docs/issue/{LINEAR-ID}/note.md` |
| Spec | {참조 spec 존재 시: `docs/spec/{spec-name}/` — 미존재 시 행 자체 생략} |
| {기타} | {참조 문서, 스크립트, 설정 등 — 없으면 행 자체 생략} |

---

## Success Criteria
- [ ] {AI 추론 초안 → 사용자 확인. Pre-Plan에서 보완}
- [ ] {SC 2}

---

## Changes
{close 시 추가. 초기 등록 시 이 섹션 없음}
```

> - Summary: **자유 양식**. 형식 강제 없음 (불릿, 산문 모두 허용)
> - SC: **체크박스**(`- [ ]`). 번호 목록 금지
> - Documents: 문서 경로 목록. note.md 행 기본 포함. prd/technical/plan은 Planning 시 gen-plan이 추가
> - Changes: close 시 추가. 구현 결과 상세. 초기에는 이 섹션 없음
> - Spec 행: 참조 spec 미존재 시 행 자체 생략
> - 기타 행: 추가 참조 문서 없으면 행 자체 생략

## improvement

```markdown
## Summary
{자유 양식. 변경 대상 + 이유 간결 기술}

---

## Documents
| 문서 | 경로 |
|------|------|
| Note | `docs/issue/{LINEAR-ID}/note.md` |
| {기타} | {참조 문서, 스크립트, 설정 등 — 없으면 행 자체 생략} |

---

## Success Criteria
- [ ] {AI 추론 초안 → 사용자 확인}
- [ ] {SC 2}

---

## Changes
{close 시 추가. 초기 등록 시 이 섹션 없음}
```

> - light/standard 모두 동일 템플릿 사용. Documents에 note.md 기본 포함
> - light에서 prd/plan 생성 시 gen-plan이 Documents에 추가
> - standard에서 prd/technical/plan 생성 시 gen-plan이 Documents에 추가
> - 기타 행: 추가 참조 문서 없으면 행 자체 생략

## bug

```markdown
## Summary
{자유 양식. 버그 증상 + 재현 절차 간결 기술}

---

## Documents
| 문서 | 경로 |
|------|------|
| Note | `docs/issue/{LINEAR-ID}/note.md` |
| {기타} | {참조 문서, 스크립트, 설정 등 — 없으면 행 자체 생략} |

---

## Success Criteria
- [ ] {수정 후 기대 동작}
- [ ] {SC 2}

---

## Changes
{close 시 추가. 초기 등록 시 이 섹션 없음}
```

> - bug도 Git 폴더 + note.md 생성. Documents에 note.md 기본 포함
> - plan.md 생성 시 (인터뷰 결정) gen-plan이 Documents에 추가
> - 기타 행: 추가 참조 문서 없으면 행 자체 생략
