---
name: feedback
description: "사용자 피드백(지침, 규칙, 선호, 개선사항)을 분석하여 3유형으로 분류하고 적절한 문서에 등록. 사용자가 지침/규칙 등록을 요청할 때 사용."
---

# feedback — 피드백 분류 및 등록

사용자 피드백(지침, 규칙, 선호, 개선사항)을 분석하여 3유형으로 분류하고, 적절한 문서에 등록한다.

## Trigger

- `/피드백` 커맨드에서 자동 호출
- 사용자가 "이 규칙 등록해줘", "이 지침 추가해줘" 등 지침 등록을 요청할 때

## Input

| 항목 | 설명 |
|------|------|
| 피드백 프롬프트 | 사용자가 전달한 자유형식 텍스트 (1개 이상의 지침/규칙/선호) |
| Linear ID | 활성 Issue ID (있는 경우 — limitation 판단용) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | 피드백 내용 분석 → 3유형 분류 (아래 §피드백 유형) |
| 2 (G1) | 유형별 대상 문서 + 삽입 위치 제안 |
| 3 (G2) | **검토**: `AskUserQuestion`으로 사용자 승인 (대상 문서 + 위치 + 내용) |
| 4 (G3) | **저장**: 승인된 내용을 대상 문서에 기록. backlog 유형은 gen-hub Skill을 호출하여 새 Issue 생성 |
| 5 (G3) | 파이프라인 진행 중이면 `linear-comment-writer` 에이전트를 호출하여 Feedback 기록. limitation 유형은 `limitation` comment_type 사용 (progress.txt 존재 시 append) |

## Output

| 항목 | 내용 |
|------|------|
| 대상 문서 | 피드백이 등록된 문서 (rules, guides 등) |
| Linear comment | Feedback 기록 (파이프라인 진행 중일 때). progress.txt 존재 시 추가 append |

---

## 피드백 유형

| 유형 | 목적지 | 설명 |
|------|--------|------|
| `directive` | `.claude/rules/*.md`, `.claude/templates/*.md`, `CLAUDE.md` | 지침/규칙 등록 |
| `limitation` | **Linear comment** (해당 Issue) + progress.txt 존재 시 append | Issue 진행 중 전용 — Known Limitations |
| `backlog` | Linear Issue 신규 생성 (gen-hub 호출) | 향후 작업 후보. gen-hub Skill 경유하여 `/등록`과 동일 플로우 실행 |

---

## 대상 문서 맵

| 영역 | 대상 문서 | 수정 가능 | 예시 피드백 |
|------|---------|:---------:|-----------|
| 코딩 컨벤션 | `.claude/rules/coding.md` | ✅ 프로젝트 | 네이밍 규칙, 에러 처리 방식 |
| 프로젝트 허브 | `CLAUDE.md` PROJECT 섹션 | ✅ 프로젝트 | 금지 항목, 전역 규칙 (200줄 제한 주의) |
| Known Limitations | **Linear comment** + progress.txt 존재 시 append | ✅ 프로젝트 | 현재 구현의 제약, 임시 구현 |
| 새 규칙 파일 | `.claude/rules/{new}.md` | ✅ 프로젝트 | 기존 문서에 맞지 않는 새 도메인 |
| 파이프라인 규칙 | `.claude/rules/pipeline.md` | ⛔ 프레임워크 고정 | → backlog Issue로 등록 |
| 문서 작성 규칙 | `.claude/rules/docs-writing.md` | ⛔ 프레임워크 고정 | → backlog Issue로 등록 |
| 프레임워크 가이드 | `.claude/templates/*.md` | ⛔ 프레임워크 고정 | → backlog Issue로 등록 |

> 프레임워크 고정 파일(⛔)에 대한 피드백은 `directive` 대신 `backlog` 유형으로 자동 전환하여 프레임워크 개선 Issue로 등록한다. 직접 수정하지 않는다.

---

## OMC 에이전트 연동

### 프레임워크 에이전트

| Agent | 역할 | 호출 시점 |
|-------|------|----------|
| `linear-comment-writer` | limitation comment 작성 | G3 — limitation 유형 피드백의 Linear comment 기록 시 |

> OMC 비활성 시: pipeline.md §7 참조.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| limitation comment 기록 | limitation 유형 (에이전트 위임) |
| backlog Issue 생성 | gen-hub 경유 |
