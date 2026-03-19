# verify — 구현 완전성 검증

구현 완료 후 Success Criteria, CL S3 검증 조건, 코드 품질을 종합 검증한다. 검증 결과(PASS/FAIL)를 반환하며, 후속 처리는 dev-pipeline이 결정한다.

## Trigger

- implement 완료 후 자동 호출 (feature/improvement)
- bug 수정 완료 후 dev-pipeline에서 자동 호출
- `/검증` 커맨드에서 구현 검증으로 호출 시 (프레임워크 검증과 별도)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description의 Success Criteria (feature/improvement) 또는 Acceptance Criteria (bug) |
| cl.md | `docs/issue/{LINEAR-ID}/cl.md` — S3 검증 조건 (feature/improvement만. bug는 없음) |
| 코드 변경 | 구현된 코드 (git diff 기반) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **Linear SC 조회**: Issue description에서 Success Criteria 추출 |
| 2 (G1) | **CL S3 검증 조건 읽기**: cl.md S3 테이블의 각 항목 확인 |
| 3 (G1) | **검증 실행**: 각 SC/S3 항목에 대해 테스트 실행, 코드 확인, 빌드 검증 |
| 4 (G1) | **검증 결과 정리**: PASS/FAIL 판정 + 근거 |
| 5 (G2) | **사용자에게 결과 제시**: `AskUserQuestion`으로 검토 |
| 6 (G3) | **Linear comment 기록**: Linear MCP로 검증 결과 comment (PASS/FAIL + 항목별 요약 1~3줄) |
| 7a (G4) | **PASS**: 검증 결과(PASS)를 반환. dev-pipeline이 feature-close 후속 결정 |
| 7b (G4) | **FAIL**: 실패 항목 목록 + 수정 방안 제시. 검증 결과(FAIL)를 반환. dev-pipeline이 implement 복귀 후속 결정 |

## Output

| 항목 | 내용 |
|------|------|
| 검증 결과 | PASS/FAIL 판정 + 항목별 근거 |
| Linear comment | 검증 결과 요약 기록 |

> verify는 Linear 상태 전이를 수행하지 않는다. 호출자(implement/dev-pipeline)가 PASS 시 In Review로 전이.

---

## 검증 체크리스트

| 카테고리 | 검증 항목 |
|----------|---------|
| **SC 충족** | Linear Issue description의 모든 Success Criteria 충족 |
| **CL S3** | cl.md S3 테이블의 모든 검증 항목 PASS |
| **빌드** | 린트 + 타입체크 + 전체 테스트 통과 |
| **코드 품질** | 프로젝트별 coding rules 준수 (`.claude/rules/coding.md`) |
| **범위** | Plan 범위 외 변경 없음 |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 검증 실행 | `oh-my-claudecode:verifier` | sonnet |
| 코드 리뷰 | `oh-my-claudecode:code-reviewer` | opus (선택) |

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| SC 조회 | `get_issue` | Issue description에서 SC 추출 (단일 Issue) |
| 검증 결과 기록 | `save_comment` | 검증 결과(PASS/FAIL) 요약 comment |
