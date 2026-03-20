---
title: 컨텍스트 관리 가이드
type: shared
created: 2026-03-17
---

# Context Management Guide

## 1. 4대 실패 모드

| 모드 | 증상 | 예방 |
|------|------|------|
| **Amnesia** (망각) | 이전 결정/맥락을 잊고 반복 질문 | CL Handoff에 진행 상태 기록. Linear에 상태 저장. Pre-Compaction 필수 |
| **Confusion** (혼동) | 다른 Issue의 맥락이 현재 작업에 침투 | `/활성화` 시 Linear에서 해당 Issue만 조회. 불필요한 문서 로드 금지 |
| **Contamination** (오염) | 오래된 정보가 갱신되지 않고 잔존 | CL S1이 SSOT. 상태는 Linear만 참조. Git 파일의 status 속성 금지 |
| **Overflow** (범람) | 컨텍스트 윈도우 포화로 성능 저하 | 50% 규칙, Progressive Disclosure, /clear 타이밍 준수 |

---

## 2. Progressive Disclosure

필요한 문서만, 필요한 시점에, 필요한 부분만 로드한다.

### 로드 원칙

| 원칙 | 내용 |
|------|------|
| **Lazy Loading** | 작업에 필요한 문서만 로드. 미리 읽기 금지 |
| **Selective Reading** | 문서 전체가 아닌 필요 섹션만 읽기 |
| **paths 조건부 로드** | Rules는 paths 매칭 시에만 자동 로드 |
| **CLAUDE.md 경유** | 시작점은 항상 CLAUDE.md → Key References → 필요 문서 |

### 단계별 로드 범위

| 단계 | 로드 대상 | 로드하지 않는 것 |
|------|---------|---------------|
| `/활성화` (라우팅) | Linear Issue 상태 1회 조회 + `_index.md` Documents 테이블 | plan.md 본문, 다른 Issue 문서 |
| Pre-Plan Q/A | related issue의 `_index.md`(Decisions, Notes) + `plan.md`(존재 시). 최대 5개 issue, 요약만 활용 | related issue의 구현 결과 섹션 (gen-plan에서 별도 참조) |
| Planning | plan.md, cl.md (작성 대상) | 이전 Issue 문서 |
| 구현 | CL S1 (태스크 목록만), plan.md (필요 시) | CL S2/S3, 다른 태스크 보고서 |
| 테스트 | CL S3 (검증 조건만), S4 (수동 테스트) | CL S1, plan.md |
| 검증 | Linear SC (description), CL S3 | plan.md 본문 |

---

## 3. 50% 규칙 + Pre-Compaction

> 상세: [pipeline.md](../../.claude/rules/pipeline.md) §5

- **50% 도달 시** 사용자에게 알림 → Checkpoint 실행 여부 판단
- **Checkpoint** = Git 저장 + Linear sync 확인 + CL Handoff + `/활성화 {LINEAR-ID}` 시작점 명시
- 수동 실행도 가능 — 언제든 "Checkpoint 실행"으로 트리거

---

## 4. /clear 타이밍

> 상세: [pipeline.md](../../.claude/rules/pipeline.md) §5-3

- **권장**: Plan 완료 후, 태스크 3~5개 완료 후, 단계 전환 시
- **비권장**: 단일 태스크 중간 (연속성 손실 위험)

---

## 5. Linear 컨텍스트 로딩

### 읽기 최적화 규칙

> 상세: [pipeline.md](../../.claude/rules/pipeline.md) §4-3

### Linear가 개선하는 토큰 효율

| 현행 문제 | Linear 전환 효과 |
|-----------|-----------------|
| Hub 전체 읽기로 토큰 소비 | Linear API로 필요한 필드만 쿼리 — 토큰 절약 |
| flush 프로토콜 4곳 파일 갱신 | Linear API 1회 호출로 상태 갱신 완료 |
| backlogs 인덱스 읽기/갱신 토큰 | Linear 뷰가 대체 — 인덱스 파일 읽기 불필요 |
| Phase -1 컨텍스트 수집 시 다수 MOC 파일 읽기 | Linear API relation/label 쿼리로 대체 |

---

## 6. 장애 시 Fallback

> 상세: [pipeline.md](../../.claude/rules/pipeline.md) §4-3

- Linear 실패 시: 경고 출력 → Git 기록은 정상 진행 → 사용자에게 수동 갱신 안내
- 재시도 없음 — 1회 시도 후 즉시 fallback
