---
linear_id: TES-1
title: "Spec: 프로젝트 README 자동 생성 기능"
type: spec
created: 2026-03-31
---

# Deep Interview Spec: 프로젝트 README 자동 생성 기능

## Metadata
- Interview ID: tes-1-readme-autogen
- Rounds: 3
- Final Ambiguity Score: 19%
- Type: brownfield
- Generated: 2026-03-31
- Threshold: 20%
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.9 | 0.35 | 0.315 |
| Constraint Clarity | 0.7 | 0.25 | 0.175 |
| Success Criteria | 0.8 | 0.25 | 0.200 |
| Context Clarity | 0.8 | 0.15 | 0.120 |
| **Total Clarity** | | | **0.810** |
| **Ambiguity** | | | **19%** |

## Goal

CLAUDE.md의 Tech Stack 테이블과 Directory Overview 테이블을 파싱하여, 프로젝트 루트에 README.md를 자동 생성하는 Node.js 스크립트를 제공한다. 사용자가 수동 커맨드로 실행한다.

## Constraints
- Node.js 스크립트 (외부 의존성 최소화, 가능하면 없음)
- CLAUDE.md의 마크다운 테이블 파싱 (Tech Stack + Directory Overview)
- 기존 README.md가 있으면 덮어쓰기
- T7 파이프라인 통합 테스트 목적이므로 최소 구현

## Non-Goals
- CLAUDE.md 자동 감지/트리거 (수동 실행만)
- CLAUDE.md 전체 섹션 요약 (Tech Stack + Directory만)
- 테스트 커버리지 80% 달성 (테스트 목적이므로 기본 테스트만)

## Acceptance Criteria
- [ ] CLAUDE.md의 Tech Stack 테이블을 파싱하여 README의 Tech Stack 섹션에 반영
- [ ] CLAUDE.md의 Directory Overview 테이블을 파싱하여 README의 Directory 섹션에 반영
- [ ] 생성된 README.md가 프로젝트 루트에 저장
- [ ] `node scripts/generate-readme.js` 커맨드로 실행 가능

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 자동 트리거 필요 | 수동 vs 자동 실행 | 수동 커맨드 호출로 결정 |
| 구현 언어 | Node.js vs Shell vs Python | Node.js (의존성 최소) |
| README 범위 | 전체 요약 vs 최소 섹션 | Tech Stack + Directory만 |

## Technical Context
- 기존 README.md 존재 (프레임워크 개요, 4.5KB) — 덮어쓰기 대상
- CLAUDE.md Tech Stack 테이블: 언어, 프레임워크, 패키지 매니저, 테스트 프레임워크, 빌드 도구 (플레이스홀더)
- CLAUDE.md Directory Overview 테이블: 경로 + 역할 매핑
- 프로젝트에 실행 코드 없음 (문서 + 프레임워크 설정만)

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| CLAUDE.md | core domain | Tech Stack table, Directory Overview table | Source for README generation |
| README.md | core domain | Tech Stack section, Directory section | Generated from CLAUDE.md |
| generate-readme script | supporting | input path, output path | Reads CLAUDE.md, writes README.md |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 3 | 3 | - | - | N/A |
| 2 | 3 | 0 | 0 | 3 | 100% |
| 3 | 3 | 0 | 0 | 3 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (3 rounds)</summary>

### Round 1
**Q:** README 자동 생성은 언제 실행되나요? 수동 커맨드 호출 vs CLAUDE.md 변경 시 자동 트리거?
**A:** 수동 커맨드 호출
**Ambiguity:** 47% (Goal: 0.7, Constraints: 0.3, Criteria: 0.5, Context: 0.6)

### Round 2
**Q:** README 생성 스크립트를 어떤 언어/방식으로 구현할까요?
**A:** Node.js 스크립트
**Ambiguity:** 35% (Goal: 0.7, Constraints: 0.7, Criteria: 0.5, Context: 0.7)

### Round 3
**Q:** README에 어떤 섹션이 포함되어야 하나요?
**A:** Tech Stack + Directory (최소 범위)
**Ambiguity:** 19% (Goal: 0.9, Constraints: 0.7, Criteria: 0.8, Context: 0.8)

</details>
