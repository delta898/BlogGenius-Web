# Web Platform Foundation Development

## Status

- Branch: `main`
- Base/parent branch: `origin/main`
- Started: `2026-09-19`
- Status: foundation rules drafted; implementation not started

## User Need

BlogGenius의 공개 사이트와 Desktop App에 연결되는 운영용 Backoffice를 하나의 Web 저장소에서
관리하되, 보안과 Development/Production 분리를 우선해 독립적으로 배포할 수 있어야 한다.
구조와 코드뿐 아니라 개발 과정, 판단과 검증을 날짜 기반 문서로 계속 축적해야 한다.

## Goal

- 저장소의 협업·보안·환경·문서화 규칙을 먼저 고정한다.
- 앞으로의 설계와 구현 기록을 일관되게 축적할 `docs/` 구조를 만든다.
- 실제 기술 스택을 선택하기 전에 필요한 trust boundary와 초기 단계만 명확히 한다.

## Scope

- 루트 `AGENTS.md`
- Canonical documentation directory와 index
- Active/archive 개발 기록 규칙
- 공개 사이트와 Backoffice를 포함한 초기 Web platform foundation 방향 기록

## Non-Goals

- Web framework, 인증 공급자 또는 hosting platform 선정
- 관리자 인증이나 UI 구현
- Supabase schema, function, secret 또는 원격 환경 변경
- Desktop App 저장소 변경

## Boundaries and Risks

- BlogGenius-Web과 Desktop App은 별도 저장소지만 Supabase와 제품 계약 일부를 공유할 수 있다.
- 공개 사이트와 Backoffice는 하나의 저장소에 있더라도 서로 독립된 build와 deployment로 유지한다.
- 문서를 복사해 두 저장소에 서로 다른 진실의 원천을 만들지 않는다.
- Production 접근과 변경은 이 foundation 작업의 범위가 아니다.
- 제안 상태인 구조를 이미 구현된 사실로 기록하지 않는다.

## Proposed Design

- `AGENTS.md`를 저장소 전체의 작업 규칙으로 사용한다.
- 진행 중인 작업은 `docs/plans/active/`에서 날짜 기반으로 추적한다.
- 안정된 현재 구조는 `architecture`, 장기 결정은 `decisions`, 운영자 기능 계약은
  `features`, 반복 가능한 운영 절차는 `operations`로 승격한다.
- 완료된 개발 기록은 `docs/plans/archive/`에 보존한다.

## Stages

1. 보안, 환경 분리와 협업 규칙 작성
2. 문서 구조와 작성 lifecycle 확립
3. 기술 스택과 배포 구조 비교 및 결정
4. 환경 계약과 fail-closed startup 구현
5. 관리자 인증·인가·audit 기반 구현
6. 읽기 전용 license 조회 vertical slice 구현

3단계 이후의 각 단계는 별도 날짜 기반 개발 기록과 사용자 승인 범위로 진행한다.

## Decisions and Alternatives

- Desktop App의 `AGENTS.md`가 사용하는 active/archive와 canonical documentation 승격 방식을
  BlogGenius-Web에도 적용한다.
- 특정 framework를 먼저 scaffold하는 대신 보안과 문서화 규칙을 선행한다.
- Desktop App 문서를 복제하는 대신 필요한 계약을 경로로 참조하고 Web 고유 결정만 기록한다.

## Progress and Corrections

- 초기 Backoffice 전용 프로젝트 이름을 전체 Web 범위에 맞춰
  `/Users/delta898/Project/BlogGenius-Web`으로 변경했다.
- GitHub 저장소도 `BlogGenius-Web`으로 변경하고 로컬 `origin`을 새 주소로 맞췄다.
- 초기 저장소는 `README.md`만 있는 상태였다.
- 보안·환경·개발 workflow 규칙을 루트 `AGENTS.md`에 추가했다.
- 날짜 기반 개발 기록을 위한 `docs/` 기본 구조를 추가했다.
- 이번 프로젝트 경험을 전자책으로 발전시키기 위한 GitHub와 `AGENTS.md` 관련 소제목을
  `docs/vibe-coding-ebook-topics.md`에 추가했다.
- GitHub 저장소 생성, Codex New Project 연결, `AGENTS.md` 규정 형성과 `docs/` 구축까지의
  실제 시작 절차를 전자책 사례로 기록했다.
- Architecture, framework와 language 선택 과정을 다음 설계 단계이자 전자책 주제로 추가했다.
- TypeScript, Next.js App Router, Node.js 24 LTS와 modular monolith를 제안한 이유, 한계와
  선택하지 않은 대안을 전자책 주제 노트에 보강했다.
- 본격 구현 전에 사람과 AI가 합의할 항목을 비용과 순서에 따라 분류하고, architecture 평가 문서에
  pre-development alignment checklist를 추가했다.
- 사용자가 선택한 `feature -> dev -> release -> main` Git 승격 흐름을 accepted decision과
  `AGENTS.md` 규칙으로 반영했다.
- `bloggenius.kr`와 `blog-genius.com` 후보를 바탕으로 marketing, admin, downloads, status와
  Development host topology를 제안하고 전자책 주제로 기록했다.
- 사용자가 `bloggenius.kr`를 canonical domain으로 선택하고 Production의 `www`/`admin`,
  Development의 `dev`/`admin.dev` primary host 구성을 승인했다.
- Cloudflare Registrar가 `.kr` 신규 등록을 지원하지 않는 제약을 확인하고, KRNIC 등록대행자에서
  구매한 뒤 Cloudflare authoritative DNS를 사용하는 절차로 수정했다.

## Verification

- Markdown 파일 존재와 내부 상대 링크 구조 확인
- `git diff --check`로 whitespace 오류 확인
- 원격 서비스 및 Production 접근 없음

## Remaining Risks and Follow-up

- Web framework, runtime, hosting과 관리자 인증 공급자가 아직 결정되지 않았다.
- Development/Production domain과 Supabase project 식별자를 public site 및 Backoffice 설정에 연결해야 한다.
- 첫 architecture decision에서 배포 단위, server boundary와 session model을 확정해야 한다.

## Result

Foundation 규칙과 문서 구조를 작성했다. 애플리케이션 구현은 시작하지 않았다.
