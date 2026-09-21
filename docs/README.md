# BlogGenius Web Documentation

이 디렉터리는 BlogGenius 공개 사이트와 Backoffice를 포함한 Web platform의 설계, 결정,
기능 계약, 개발 과정과 운영 절차를
코드와 함께 관리하는 canonical documentation root다.

## Documentation Map

- [`architecture/`](architecture/README.md): 현재의 안정된 구조와 보안·환경·데이터 경계
- [`decisions/`](decisions/README.md): 장기적으로 유지할 결정과 검토한 대안
- [`features/`](features/README.md): 운영자 관점의 기능 계약과 제한
- [`plans/active/`](plans/active/README.md): 진행 중인 날짜 기반 개발 기록
- [`plans/archive/`](plans/archive/README.md): 완료된 개발 기록
- [`operations/`](operations/README.md): 배포, migration, 복구와 장애 대응 절차
- [`backlog.md`](backlog.md): 현재의 구체적이고 실행 가능한 후속 작업
- [`vibe-coding-ebook-topics.md`](vibe-coding-ebook-topics.md): 프로젝트 경험에서 수집한 전자책 소제목과 집필 씨앗

## Current Documents

- [2026-09-21 Admin auth foundation](plans/active/2026-09-21-admin-auth-foundation-development.md)
- [2026-09-21 Admin foundation contract](plans/archive/2026-09-21-admin-foundation-contract-development.md)
- [2026-09-20 Development deployment foundation](plans/archive/2026-09-20-development-deployment-foundation-development.md)
- [2026-09-20 Development deploy command](plans/active/2026-09-20-development-deploy-command-development.md)
- [2026-09-20 Deploy manifest default](plans/active/2026-09-20-deploy-manifest-default-development.md)
- [2026-09-20 Site home foundation](plans/active/2026-09-20-site-home-foundation-development.md)
- [2026-09-20 Privacy policy](plans/active/2026-09-20-privacy-policy-development.md)
- [2026-09-20 Privacy Drive disclosure](plans/active/2026-09-20-privacy-drive-disclosure-development.md)
- [2026-09-20 Site SEO foundation](plans/active/2026-09-20-site-seo-foundation-development.md)
- [2026-09-19 Web platform foundation](plans/active/2026-09-19-web-platform-foundation-development.md)
- [2026-09-19 Architecture and stack evaluation](plans/active/2026-09-19-architecture-stack-evaluation.md)
- [2026-09-19 Domain and host topology](plans/active/2026-09-19-domain-and-host-topology-development.md)
- [2026-09-20 Web workspace foundation](plans/archive/2026-09-20-web-workspace-foundation-development.md)
- [Workspace and runtime layout](architecture/workspace-and-runtime-layout.md)
- [Backoffice trust boundary](architecture/backoffice-trust-boundary.md)
- [2026-09-19 Git branch and promotion strategy](decisions/2026-09-19-git-branch-and-promotion-strategy.md)
- [2026-09-21 Admin foundation contract](decisions/2026-09-21-admin-foundation-contract.md)
- [2026-09-19 Canonical domain and primary hosts](decisions/2026-09-19-canonical-domain-and-primary-hosts.md)
- [2026-09-20 Containerized Web deployment](decisions/2026-09-20-containerized-web-deployment.md)
- [2026-09-20 Immutable release manifest](decisions/2026-09-20-immutable-release-manifest.md)
- [Deployment quick start](operations/deployment-quickstart.md)
- [Development release preflight](operations/development-release-preflight.md)
- [바이브 코딩 전자책 주제 노트](vibe-coding-ebook-topics.md)

## Working Rule

문서는 작업이 끝난 뒤 작성하는 보고서가 아니다. 기능 branch를 시작할 때 개발 기록을 만들고,
진행 중 결정·실패·검증 결과를 갱신하며, 완료 후 안정된 내용을 해당 canonical 문서로 승격한다.
상세 규칙은 저장소 루트의 [`AGENTS.md`](../AGENTS.md)를 따른다.
