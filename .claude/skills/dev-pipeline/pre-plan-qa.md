# Pre-Plan Q/A (Feature Standard/Deep 전용)

Todo 상태에서 gen-plan 호출 전, **deep-interview 기반 요구사항 결정화**를 수행하는 인터랙션.

> **적용 대상**: Feature Standard, Feature Deep. Feature Light는 Pre-Plan Q/A를 스킵하고 explore → planner → executor로 직행한다.
> improvement는 Pre-Plan Q/A를 사용하지 않는다. improvement-fix 스킬이 자체 Pre-Plan 인터뷰를 수행.

## Step 0: 전처리

| 단계 | 행위 |
|------|------|
| 0a | **Linear 상태 갱신**: Linear MCP로 State → Planning 즉시 전이. Pre-Plan Q/A 시작을 Linear에 선반영 |
| 0b | **컨텍스트 수집**: Linear MCP로 related issue 조회 + Label 기반 관련 Issue 필터링 |
| 0c | **관련 문서 환류**: related issue의 `progress.txt` + `plan.md` 읽기 (최대 5개). 요약하여 Step 1에서 제시. 구현 결과 섹션은 gen-plan에서 별도 참조 |
| 0d | **progress.txt 컨텍스트 로드**: `docs/issue/{ID}/progress.txt` 존재 시 컨텍스트 로드 |
| 0e | **탐색 범위 결정**: `oh-my-claudecode:explore` 에이전트로 코드베이스 조사 위임 (환류 결과 기반 범위 설정) |

## Step 1: deep-interview 또는 deep-dive 호출

**Feature Deep**:
| 단계 | 행위 |
|------|------|
| 1 | **deep-interview 필수**: `oh-my-claudecode:deep-interview` 호출. 스킵 옵션 없음. Input: Linear description + 관련 문서 환류 결과 + 코드베이스 컨텍스트. Output: spec.md (OMC 네이티브) |
| 1a | (선택) `oh-my-claudecode:deep-dive` — trace→deep-interview 2단계 파이프라인 (인과 분석 필요 시) |
| 1b | **ambiguity threshold 확인**: deep-interview 완료 후 ambiguity > 20%이면 `AskUserQuestion`으로 모호한 항목을 명시하고 추가 확인 진행 |

**Feature Standard**:
| 단계 | 행위 |
|------|------|
| 1 | **인터뷰 방식 선택**: `AskUserQuestion`으로 (a) `deep-interview` — 소크라테스식 인터뷰로 요구사항 결정화 (b) `deep-dive` — trace→deep-interview 2단계 파이프라인 (인과 분석 필요 시) (c) 이미 상세 스펙 있음 — 스킵 (기존 spec.md 활용) 선택 |
| 1a | **deep-interview 호출** (선택 a/b): `oh-my-claudecode:deep-interview` 또는 `oh-my-claudecode:deep-dive` 호출. Input: Linear description + 관련 문서 환류 결과 + 코드베이스 컨텍스트. Output: spec.md (OMC 네이티브) |
| 1b | **ambiguity threshold 확인**: deep-interview 완료 후 ambiguity > 20%이면 `AskUserQuestion`으로 모호한 항목을 명시하고 추가 확인 진행 |

## Step 2: 후처리

| 단계 | 행위 |
|------|------|
| 2a | **spec.md 저장**: deep-interview 산출물을 `docs/issue/{ID}/spec.md`에 저장. frontmatter 래핑 적용 (아래 참조) |
| 2b | **SC 추출 → Linear 기록**: spec.md에서 Success Criteria 섹션 추출 → Linear Issue description의 `## Success Criteria` 섹션에 삽입 |
| 2b-1 | **Linear comment 기록**: spec.md 완료 요약 comment — `Spec 완료 — {1줄 요약}. docs/issue/{ID}/spec.md` |
| 2c | **의존성 정렬**: spec.md 요구사항의 의존 관계 정렬. gen-plan 호출 인풋으로 전달 |
| 2d | **gen-plan 호출**: spec.md 완성 확인 → gen-plan 호출 (ralplan 위임) |

## spec.md Frontmatter 래핑 패턴

```yaml
---
linear_id: PRJ-N
title: "Spec: {제목}"
type: spec
created: YYYY-MM-DD
---
```

## OMC Fallback

> deep-interview 비활성 시 → 간소화 인터뷰로 fallback: `AskUserQuestion`으로 핵심 요구사항(What/Why) 직접 수집 → spec.md를 기본 모델로 생성.

> §11 인터뷰 원칙 적용 (pipeline.md 참조)
