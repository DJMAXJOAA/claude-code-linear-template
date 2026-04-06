# Agent Writing Guide

프레임워크 전용 에이전트(`.claude/agents/*.md`) 작성 가이드라인. OMC 검증 패턴을 워크플로우 에이전트에 맞게 적용.

## 파일 구조

```markdown
---
name: {agent-id}
description: "{1줄 역할 설명}"
---

<Agent_Prompt>
  <Role>...</Role>
  <Why_This_Matters>...</Why_This_Matters>
  <Input>...</Input>
  <Output>...</Output>
  <Protocol>...</Protocol>
  <Output_Templates>...</Output_Templates>
  <Constraints>...</Constraints>
  <Error_Handling>...</Error_Handling>
  <Failure_Modes_To_Avoid>...</Failure_Modes_To_Avoid>
  <Examples>...</Examples>
  <Final_Checklist>...</Final_Checklist>
</Agent_Prompt>
```

### Frontmatter

| 필드 | 필수 | 설명 |
|------|:----:|------|
| `name` | O | kebab-case 에이전트 ID. 파일명과 일치 |
| `description` | O | 1줄 역할 설명 |

`model`, `level`, `disallowedTools`는 프레임워크 에이전트에 불필요 (스킬이 프롬프트로 호출하는 구조).

### XML 래퍼

OMC의 `<Agent_Prompt>` 패턴 채택. 시맨틱 파싱과 섹션 발견이 용이.

---

## 섹션별 작성법

### Role (필수)

단일 책임 정의. "~을 담당한다. ~는 담당하지 않는다" 경계를 명확히 한다.

**Good:**
```xml
<Role>
Linear 코멘트 작성을 전담한다. 완료/진행/조사 코멘트를 표준 워크플로우로 생성하여
Linear MCP로 기록한다.

담당하지 않는 것: Issue 상태 전이, Git 문서 작성, 코드 수정.
</Role>
```

**Bad:**
```xml
<Role>
Linear 관련 작업을 수행한다.
</Role>
```

> 경계가 불명확하면 스킬과 에이전트 간 책임 충돌 발생.

### Why_This_Matters (필수)

이 에이전트가 존재하는 이유. "이 규칙이 없으면 ~가 발생한다" 패턴.

```xml
<Why_This_Matters>
이 에이전트가 없으면 4+ 스킬에서 각각 다른 형식으로 Linear comment를 작성하여
동일 유형의 산출물이 불일관해진다. 워크플로우 변경 시 모든 스킬을 개별 수정해야 한다.
</Why_This_Matters>
```

### Input (필수)

호출자가 전달하는 파라미터 테이블.

```xml
<Input>
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| linear_id | string | O | `PRJ-N` 형식 Linear Issue ID |
| comment_type | enum | O | completion / plan-summary / investigation 등 |
| payload | object | O | comment_type별 필수 데이터 |
</Input>
```

**원칙:**
- 필수 파라미터는 호출 스킬에서 항상 확보 가능해야 함
- `payload`는 comment_type별 필수 필드를 Protocol에서 정의
- 선택적 파라미터는 기본값을 명시

### Output (필수)

에이전트가 반환하는 산출물 테이블.

```xml
<Output>
| 산출물 | 형식 | 설명 |
|--------|------|------|
| comment_body | markdown string | 기록된 코멘트 본문 |
| success | boolean | MCP 호출 성공 여부 |
</Output>
```

### Protocol (필수)

멀티스텝 워크플로우 절차. **templates/와의 핵심 차이** — 판단 기준, 분기 조건을 포함한 실행 프로토콜.

```xml
<Protocol>
1. **Input 검증**: comment_type별 필수 payload 필드 확인
2. **수집 판단**: comment_type + issue_type 조합으로 포함 항목 결정
   - completion + feature: 설계 이탈, Git Log 포함
   - completion + bug: Root Cause 포함
3. **템플릿 적용**: `.claude/templates/comment-formats.md` SSOT 참조
4. **Linear MCP 호출**: save_comment로 기록
5. **실패 시 fallback**: pipeline.md §4-2 적용
</Protocol>
```

**원칙:**
- 번호 단계로 구성. 각 단계에 판단 기준 명시
- 분기 조건은 인덴트로 하위 나열
- SSOT 참조 경로를 명시 (`.claude/templates/` 등)

### Output_Templates (필수)

산출물 형식. `.claude/templates/` 공유 템플릿을 SSOT로 참조하거나 에이전트 고유 템플릿 정의.

```xml
<Output_Templates>
`.claude/templates/comment-formats.md`를 SSOT로 참조한다.

| comment_type | 참조 섹션 |
|-------------|----------|
| completion | comment-formats.md > completion |
| plan-summary | comment-formats.md > plan-summary |
</Output_Templates>
```

**원칙:**
- 기존 templates/ 파일이 있으면 SSOT로 참조. 복제 금지
- 에이전트 고유 형식이 필요하면 이 섹션에 정의

### Constraints (필수)

금지 사항, 단방향 호출 규칙, SSOT 참조 경로.

```xml
<Constraints>
- 스킬을 역호출하지 않는다 (스킬 → 에이전트 단방향)
- comment 형식을 이 파일에 복제하지 않는다 (`.claude/templates/comment-formats.md` SSOT)
- Issue 상태 전이를 수행하지 않는다 (스킬 책임)
- pipeline.md §4-2 fallback을 준수한다
</Constraints>
```

### Error_Handling (필수)

실패 시 행동. fallback, 재시도, 호출자 반환 정책.

```xml
<Error_Handling>
| 상황 | 행동 |
|------|------|
| Linear MCP 실패 | pipeline.md §4-2 fallback. 경고 출력 + comment_body 반환 |
| payload 누락 | 필수 필드 목록과 함께 에러 반환 |
</Error_Handling>
```

### Failure_Modes_To_Avoid (권장)

BAD vs GOOD 비교 형식의 안티패턴 목록.

```xml
<Failure_Modes_To_Avoid>
<Bad>
comment 형식을 에이전트 내부에 하드코딩하여 templates/와 불일치 발생
</Bad>
<Good>
`.claude/templates/comment-formats.md`를 런타임에 참조하여 항상 최신 형식 적용
</Good>
</Failure_Modes_To_Avoid>
```

### Examples (권장)

호출 예시. `<Good>` / `<Bad>` XML 블록으로 구분.

```xml
<Examples>
<Good>
linear-comment-writer 에이전트를 호출하여 완료 코멘트를 작성하라.

**Input:**
- linear_id: PRJ-47
- comment_type: completion
- issue_type: feature
- payload: {구현 결과: "인증 모듈 추가", 설계 이탈: "없음"}
- git_log: "- `abc1234` feat: add auth module"
</Good>

<Bad>
Linear에 코멘트를 남겨줘.

(Input 파라미터 누락, comment_type 미지정)
</Bad>
</Examples>
```

### Final_Checklist (권장)

완료 전 자기 검증 질문 목록.

```xml
<Final_Checklist>
- [ ] comment_type에 맞는 포맷을 templates/에서 참조했는가?
- [ ] 필수 payload 필드가 모두 포함되었는가?
- [ ] Linear MCP 호출이 성공했는가? 실패 시 fallback을 적용했는가?
- [ ] comment_body를 호출자에게 반환했는가?
</Final_Checklist>
```

---

## 네이밍 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| 파일명 | kebab-case | `linear-comment-writer.md` |
| 디렉토리 | `.claude/agents/` | - |
| 에이전트명 | `{도메인}-{동사/역할}` | `linear-comment-writer` |

---

## 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **Evidence-first** | file:line 참조로 근거 명시 |
| **단일 책임 경계** | "~는 담당하지 않는다"를 Role에 명시 |
| **검증 게이트** | Final_Checklist로 자기 검증 |
| **안티패턴 교육** | Failure_Modes_To_Avoid로 실수 방지 |
| **SSOT 참조** | 포맷은 `.claude/templates/`에서 참조. 복제 금지 |
| **On-demand 로드** | 줄 수 제한 없음. 호출 시점에만 로드 |

---

## 에이전트 vs 템플릿 판단 기준

| 기준 | 에이전트 | 템플릿 |
|------|---------|--------|
| 멀티스텝 워크플로우 (수집→판단→형식→기록→fallback) | O | X |
| 단순 포맷 정의 (경로→래핑→쓰기) | X | O |
| 2+ 스킬에서 동일 워크플로우 반복 | O | - |
| MCP 호출 포함 | O | X |
| 분기 판단 로직 포함 | O | X |
