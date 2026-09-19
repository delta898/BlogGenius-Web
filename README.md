# BlogGenius-Web

BlogGenius의 공개 사이트와 운영자용 Backoffice를 함께 개발하는 Web platform 저장소입니다.

## Planned Surfaces

- `www.bloggenius.kr`: Production 공개 사이트
- `dev.bloggenius.kr`: Development 공개 사이트
- `admin.bloggenius.kr`: Production Backoffice
- `admin.dev.bloggenius.kr`: Development Backoffice

현재는 구현에 앞서 보안, 환경 분리, 아키텍처와 배포 계약을 문서화하는 foundation 단계입니다.
프로젝트 규칙은 [`AGENTS.md`](AGENTS.md), 설계와 개발 기록은 [`docs/`](docs/README.md)에서 관리합니다.

## Local Foundation

Node.js 24, pnpm 11과 Docker가 필요합니다.

```bash
pnpm install --frozen-lockfile
./ops doctor
./ops validate
./ops up
```

로컬 공개 사이트는 `http://127.0.0.1:8080`, Backoffice는
`http://127.0.0.1:3000`에서 확인합니다. 현재 `./ops`는 local foundation만
지원하며 Oracle Development/Production 배포는 아직 수행하지 않습니다.
