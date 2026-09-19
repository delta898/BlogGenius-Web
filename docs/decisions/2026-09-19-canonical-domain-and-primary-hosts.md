# Canonical Domain and Primary Hosts

## Status

- Status: accepted
- Decided: `2026-09-19`

## Context

BlogGenius의 공개 제품 사이트와 Backoffice를 하나의 브랜드 아래 운영하면서 Production과
Development의 배포, session, secret과 Supabase 접근 경계를 명확히 분리해야 한다.

후보로 `bloggenius.kr`와 `blog-genius.com`을 검토했고, 공개 사이트 경로에 Backoffice를 두는
`www.<domain>/admin` 방식과 별도 `admin.<domain>` host를 비교했다.

## Decision

Canonical product domain은 `bloggenius.kr`로 한다.

### Production

- Public product site: `https://www.bloggenius.kr`
- Backoffice: `https://admin.bloggenius.kr`
- Apex `https://bloggenius.kr`는 `https://www.bloggenius.kr`로 redirect

### Development

- Public site: `https://dev.bloggenius.kr`
- Backoffice: `https://admin.dev.bloggenius.kr`

Public site와 Backoffice는 별도 deployment와 origin으로 운영한다. Backoffice session cookie는
parent domain으로 확장하지 않고 각 admin host에만 유효한 host-only cookie로 설정한다.

Development host는 Development Supabase와 Development secret만 사용하고 Production host는
Production Supabase와 Production secret만 사용한다. Runtime UI나 request parameter로 target
environment를 전환하지 않는다.

## Rationale

- `bloggenius.kr`는 하이픈 없이 제품명과 정확히 일치한다.
- 초기 한국어 제품과 시장을 자연스럽게 나타낸다.
- Public site와 Backoffice를 다른 origin으로 분리해 session, CSP, 배포와 incident boundary를
  독립적으로 관리할 수 있다.
- Development host 이름만으로도 환경을 명확하게 인지할 수 있다.
- Production과 Development의 Auth callback, cookie와 allowed origin을 서로 분리할 수 있다.

## Consequences

- DNS, TLS, hosting project와 monitoring을 네 primary host별로 구성해야 한다.
- Development public site는 접근 제한 또는 `noindex` 정책이 필요하다.
- Admin cookie에는 `Domain=bloggenius.kr`를 사용하지 않는다.
- CORS와 Auth redirect allowlist는 정확한 환경별 origin만 허용한다.
- 사용하지 않게 된 DNS/CNAME은 즉시 제거해 dangling subdomain을 남기지 않는다.

## Deferred Hosts

다음 host는 필요성과 provider가 확정될 때 별도 결정한다.

- `downloads.bloggenius.kr`
- `status.bloggenius.kr`
- `docs.bloggenius.kr`
- `api.bloggenius.kr`
- `app.bloggenius.kr`

Public 기능 소개, 다운로드 안내, 가이드, changelog와 support는 우선
`www.bloggenius.kr` 아래 path로 제공한다.

## Follow-up

- Cloudflare Registrar는 현재 `.kr` 신규 등록을 지원하지 않으므로 KRNIC 공인 등록대행자에서
  `bloggenius.kr` 등록
- 등록 후 `bloggenius.kr` zone을 Cloudflare에 추가하고 Cloudflare가 배정한 authoritative
  nameserver를 등록대행자에 설정
- Cloudflare zone 활성화와 DNS record 확인 후 DNSSEC 활성화
- DNS와 hosting provider 결정
- Production/Development TLS와 redirect 설정
- 환경별 Auth callback 및 allowed origin 등록
- Host-only admin session cookie contract 작성
- Development indexing/access restriction 결정
