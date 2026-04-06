# Skill Writing Guide

프레임워크 스킬(`.claude/skills/*/SKILL.md`) 작성 가이드라인. 오케스트레이션 패턴, 에이전트 호출법, Progressive Disclosure를 규정.

## 스킬의 역할

**스킬 = 오케스트레이션**. 스킬은 게이트, 상태 전이, 라우팅, 에이전트 호출을 담당한다. 전문 작업(comment 작성, 문서 생성)은 에이전트 또는 템플릿에 위임한다.

| 계층 | 역할 | 예시 |
|------|------|------|
| **스킬** | 오케스트레이션 — "언제, 어떤 순서로, 누구에게" | issue-close, gen-plan, bug-fix |
| **에이전트** | 멀티스텝 워크플로우 캡슐화 — "무엇을 수집하고 어떻게 판단하고 어디에 기록" | linear-comment-writer |
| **템플릿** | 포맷 SSOT — "어떤 형식인가" | comment-formats.md, git-doc-formats.md |

---

## Progressive Disclosure

### 3계층 로딩

| 계층 | 로드 시점 | 내용 |
|------|----------|------|
| **1. Frontmatter** | 스킬 발견 시 | name, description |
| **2. SKILL.md body** | 스킬 실행 시 | 프로세스, Linear MCP, 에이전트 연동 |
| **3. references/** | 필요 시 부분 로드 | 상세 가이드, 참조 문서 |

### 부분 로드

스킬은 줄 수 제한 없음 (부분 로드 지원). 단, 핵심 프로세스 테이블은 SKILL.md 상단에 배치하여 빠른 접근을 보장.

---

## SKILL.md 표준 섹션

### Frontmatter (필수)

```yaml
---
name: {skill-name}
description: "{스킬 용도 및 호출 시점 설명}"
---
```

### Process 테이블 (필수)

4단계 게이트(G1~G4)에 매핑된 프로세스 테이블:

```markdown
## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **{계획}**: ... |
| 2 (G2) | **{검토}**: AskUserQuestion으로 승인 |
| 3 (G3) | **{저장}**: Git 기록 + Linear 갱신 |
| 4 (G4) | **{실행}**: ... |
```

### Linear MCP (필수)

스킬이 사용하는 Linear MCP 도구 목록. 에이전트 위임 항목은 "(에이전트 위임)" 표기.

```markdown
## Linear MCP

| 도구 | 용도 | 비고 |
|------|------|------|
| save_comment | 완료 comment 기록 | (에이전트 위임) |
| save_issue | 상태 전이 | - |
| get_issue | Issue 정보 조회 | - |
```

### OMC 에이전트 연동

OMC 에이전트 + 프레임워크 에이전트를 구분하여 기재:

```markdown
## OMC 에이전트 연동

| Agent | 역할 | 모델 |
|-------|------|------|
| executor | 코드 수정 | sonnet |

### 프레임워크 에이전트

| Agent | 역할 | 호출 시점 |
|-------|------|----------|
| linear-comment-writer | 완료 comment 작성 | G3 — Linear comment 기록 시 |
```

---

## 에이전트 호출 패턴

### 호출 문구 템플릿

스킬 SKILL.md에서 에이전트를 호출하는 표준 문구:

```
{agent-name} 에이전트를 호출하여 {작업}을 수행하라.

**Input:**
- {param1}: {value}
- {param2}: {value}

**Context:**
- {추가 컨텍스트 (선택)}
```

### 호출 규칙

| 규칙 | 내용 |
|------|------|
| **단방향** | 스킬 → 에이전트 호출만 허용. 역방향 금지 |
| **필수 Input 전달** | 에이전트 정의의 Input 필수 파라미터를 모두 전달 |
| **컨텍스트 최소화** | 에이전트 실행에 필요한 최소 컨텍스트만 전달 |
| **산출물 수신** | 에이전트 Output을 스킬이 수신하여 후속 처리 |
| **MCP 위임** | Linear MCP 호출은 에이전트가 직접 수행. 스킬은 "무엇을 기록할지"만 지시 |

### 스킬 리팩토링 시 변경 패턴

| 변경 대상 | Before | After |
|-----------|--------|-------|
| Linear comment 단계 | 직접 수행 ("다음 형식으로 작성하라: ...") | 에이전트 호출 ("linear-comment-writer 에이전트를 호출하여...") |
| Git 문서 단계 | 인라인 frontmatter 래핑 패턴 | `.claude/templates/git-doc-formats.md` 참조 |
| 인라인 comment 형식 | 스킬 본문에 형식 인라인 | 삭제. 에이전트 + `.claude/templates/comment-formats.md` 참조 |
| Linear MCP | 스킬이 직접 MCP 호출 | "(에이전트 위임)" 표기 |

---

## 템플릿 참조 규칙

### 3계층 SSOT

| 계층 | 경로 | 로드 방식 | 역할 |
|------|------|----------|------|
| **rules** | `.claude/rules/` | 조건부 항상 주입 | 짧고 필수적인 규칙 + 포인터 |
| **공유 templates** | `.claude/templates/` | on-demand 부분 로드 | 범용 포맷 SSOT |
| **스킬-로컬 templates** | `.claude/skills/*/templates/` | 해당 스킬 실행 시 | 스킬 전용 양식 |

### 참조 원칙

- 포맷을 스킬 본문에 복제하지 않는다. 템플릿을 SSOT로 참조
- 2+ 스킬에서 공유하는 양식은 `.claude/templates/`에 배치
- 1개 스킬 전용 양식은 해당 스킬의 `templates/`에 유지
- 에이전트 호출 시 에이전트가 템플릿을 참조. 스킬은 "어떤 작업을 할지"만 지시

---

## 에이전트 vs 템플릿 역할 구분

| 기준 | 에이전트에 위임 | 템플릿 참조 |
|------|-------------|-----------|
| 수집→판단→형식→기록→fallback | O | X |
| 경로→래핑→쓰기 | X | O |
| MCP 호출 포함 | O | X |
| 단순 포맷 적용 | X | O |
