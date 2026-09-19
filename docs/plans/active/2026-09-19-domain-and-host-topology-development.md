# Domain and Host Topology

## Status

- Branch: `main`
- Base/parent branch: `origin/main`
- Started: `2026-09-19`
- Status: canonical domain and primary hosts accepted; infrastructure implementation pending

## User Need

BlogGenius의 제품 소개, 기능 안내, 다운로드, 도움말과 Backoffice를 하나의 브랜드 아래 운영하되
보안과 배포 책임이 다른 surface를 적절히 분리해야 한다.

검토한 대표 도메인 후보는 다음과 같다.

- `bloggenius.kr`
- `blog-genius.com`

사용자는 `bloggenius.kr`를 확보하기로 결정했다. 등록 완료와 공개 출시 전 상표·서비스명 충돌
확인은 별도 후속 작업으로 남긴다.

## Accepted Direction

`bloggenius.kr`를 canonical domain으로 사용한다.

- 하이픈이 없어 말하고 입력하기 쉽다.
- 제품명 `BlogGenius`와 정확히 대응한다.
- `.kr`이 초기 한국어 제품과 고객 지원 범위를 자연스럽게 전달한다.

`blog-genius.com` 확보는 현재 결정 범위에서 제외한다. 향후 확보할 경우 동일한 사이트를 별도
운영하지 않고 canonical `https://www.bloggenius.kr`로 redirect하는 방어·해외 유입용 도메인을
기본 방향으로 검토한다.

검색 결과에는 유사한 이름의 해외 `Blog Genius AI` 서비스와 여러 `BlogGenius` 프로젝트가 존재한다.
도메인 확보만으로 브랜드 충돌 검토가 끝나는 것은 아니므로 공개 출시 전에 법률·상표 검색을 별도로
수행한다.

## Proposed Production Hosts

| URL | Role | Deployment/security boundary |
| --- | --- | --- |
| `https://bloggenius.kr` | Canonical redirect | `www`로 영구 redirect |
| `https://www.bloggenius.kr` | 제품 소개 허브 | 공개 marketing site |
| `https://www.bloggenius.kr/features` | 기능 소개 | marketing site 내부 경로 |
| `https://www.bloggenius.kr/download` | 다운로드 안내 | OS/version 안내와 release link |
| `https://www.bloggenius.kr/guides` | 가이드·활용 콘텐츠 | 검색 가능한 public content |
| `https://www.bloggenius.kr/changelog` | 사용자용 변경 내역 | public release information |
| `https://www.bloggenius.kr/support` | 지원 진입점 | 문의·문서 안내 |
| `https://admin.bloggenius.kr` | Production Backoffice | 별도 deployment와 host-only session |
| `https://downloads.bloggenius.kr` | 설치 파일 전달 | 서명된 artifact/CDN origin |
| `https://status.bloggenius.kr` | 서비스 상태 | 가능하면 주 서비스와 독립된 provider |

Public 제품 소개, 기능, 가격, 가이드와 다운로드 landing page는 같은 marketing site의 path로 묶는다.
콘텐츠 응집도와 운영 단순성을 유지하면서 각 페이지가 같은 제품 funnel을 공유할 수 있기 때문이다.

설치 binary는 marketing runtime에서 직접 제공하지 않고 `downloads` host의 release storage/CDN에서
제공한다. `www/.../download`는 사용자용 안내와 올바른 artifact 선택을 담당한다.

## Why `admin.<domain>` Instead of `www.<domain>/admin`

`/admin`은 marketing page와 동일한 origin을 공유한다. Cookie `Path`는 보안 경계가 아니며 같은
origin의 script와 취약점 영향을 분리하지 못한다.

`admin.bloggenius.kr`는 다음을 독립시킬 수 있다.

- Backoffice deployment와 release cadence
- Host-only `__Host-` 관리자 session cookie
- CSP, CORS, security header와 rate limit
- 인증 callback과 접근 정책
- Monitoring, alert와 incident 대응
- Public marketing site 장애/취약점의 영향 범위

관리자 cookie에는 parent `Domain=bloggenius.kr`를 지정하지 않고 admin host에만 전달되게 한다.

## Proposed Development Hosts

| URL | Role | Policy |
| --- | --- | --- |
| `https://dev.bloggenius.kr` | Development marketing/app preview | access 제한 또는 명확한 noindex |
| `https://admin.dev.bloggenius.kr` | Development Backoffice | Development Supabase만 접근 |

- Development와 Production session cookie 이름과 host를 분리한다.
- Development host는 Production Auth callback, Supabase 또는 secret을 사용하지 않는다.
- PR preview는 임의 Production data에 접근하지 않으며 필요하면 fixture/local backend만 사용한다.
- 사용하지 않는 DNS/CNAME은 즉시 제거해 dangling subdomain을 남기지 않는다.

## Hosts Not Needed Initially

- `api.bloggenius.kr`: Next.js BFF가 Backoffice deployment 안에 있으므로 외부 API가 생길 때까지 보류
- `auth.bloggenius.kr`: Supabase Auth와 Backoffice callback으로 충분하므로 보류
- `docs.bloggenius.kr`: 초기 도움말은 `www/.../guides`에 두고 독립 문서 제품이 될 때 분리
- `app.bloggenius.kr`: 현재 고객 제품은 Desktop App이므로 Web application이 생길 때까지 보류

미사용 host를 미리 만들지 않는다. Host를 만들 때 owner, deployment, secret, monitoring과 폐기 절차를
함께 정한다.

## Domain Selection Checks

구매 또는 공개 결정 전에 다음을 확인한다.

- Registrar의 실시간 등록 가능 여부와 갱신 가격
- `bloggenius.kr`, `blog-genius.com` 및 혼동 가능한 오탈자
- 국내외 상표와 동일·유사 software/service 명칭
- App signing, support email과 향후 internationalization 요구
- SNS handle과 package/repository naming 일관성
- Alternate domain의 canonical redirect와 email spoofing 방지 정책

## Existing Company Domain Alternative

사용자가 이미 소유한 개인사업자 domain `mentivenus.com` 아래
`bloggenius.mentivenus.com`을 사용하는 대안도 검토했다.

### Advantages

- 신규 domain 등록을 기다리지 않고 바로 DNS와 hosting을 연결할 수 있다.
- Domain 비용과 별도 소유권 관리가 추가되지 않는다.
- BlogGenius가 MentiVenus의 제품이라는 company/product 관계를 드러낼 수 있다.
- `.com` 기반 주소로 국제 사용에도 형식상 제약이 없다.

### Disadvantages

- 제품명이 URL의 첫 기억 단위가 아니어서 구두 전달과 직접 입력이 길어진다.
- 독립 제품 브랜드, support email, download와 향후 사업 양도/분리 시 parent company domain에
  계속 의존한다.
- Production/Development와 public/admin host를 표현하면
  `admin.dev.bloggenius.mentivenus.com`처럼 주소가 지나치게 길어진다.
- 서로 다른 subdomain은 다른 origin이지만 같은 registrable site 아래 있으므로 admin session은
  반드시 parent `Domain=mentivenus.com` 없이 host-only cookie로 제한해야 한다.

### Recommended Use

`bloggenius.kr`를 확보할 계획이 유지된다면 `bloggenius.mentivenus.com`을 canonical product domain으로
바꾸지 않는다. 다음 용도로는 적합하다.

- MentiVenus 회사/portfolio에서 BlogGenius를 소개하는 주소
- Canonical `https://www.bloggenius.kr`로 redirect하는 별칭
- `bloggenius.kr` 연결 전 제한된 임시 preview

임시 preview로 사용할 경우 검색 노출을 막고 Production Auth cookie나 Production Supabase를 연결하지
않는다. 공개 제품에서는 `BlogGenius by MentiVenus`처럼 회사 관계를 UI/footer와 법적 문서에서
표현하고 URL은 제품 전용 domain을 유지하는 방향을 우선한다.

## Email Naming Proposal

실제 mail provider 결정 후 다음 역할 주소를 고려한다.

- `support@bloggenius.kr`
- `security@bloggenius.kr`
- `privacy@bloggenius.kr`
- `noreply@bloggenius.kr`

관리자 개인 계정과 자동 발신 주소를 분리하고 SPF, DKIM과 DMARC를 배포 전 구성한다.

## Open Decisions

- `bloggenius.kr` 등록 완료 확인
- Marketing site와 Backoffice hosting provider
- Downloads artifact storage/CDN
- Status page provider
- Public guide를 marketing path로 유지할 기간
- Preview deployment의 접근 통제 방식

## Registrar and DNS Provider Boundary

Cloudflare Registrar의 현재 supported TLD 목록에는 `.kr`이 없으므로 Cloudflare에서
`bloggenius.kr`을 직접 신규 등록할 수 없다. 검색 결과에 `.kr`이 나타나지 않거나 전체 도메인
입력 시 실패하는 것은 이 제한과 일치한다.

등록과 DNS 운영을 다음처럼 분리한다.

1. KRNIC 공인 등록대행자에서 `bloggenius.kr`의 실시간 등록 가능 여부를 다시 확인하고 구매한다.
2. Cloudflare dashboard에 apex `bloggenius.kr` zone을 추가한다.
3. Hosting이 정해졌다면 필요한 DNS record를 먼저 구성·검토한다.
4. Cloudflare가 해당 zone에 배정한 두 authoritative nameserver를 확인한다.
5. 등록대행자에서 기존 nameserver를 Cloudflare nameserver로 정확히 교체한다.
6. Cloudflare zone이 Active가 된 뒤 DNS와 HTTPS 동작을 확인한다.
7. DNSSEC를 사용할 경우 nameserver 전환이 완료된 뒤 Cloudflare와 등록대행자 양쪽 절차에 맞춰
   활성화한다.

Cloudflare zone을 만들기 전에 임의의 Cloudflare nameserver를 등록대행자에 미리 설정하지 않는다.
Nameserver는 zone별로 배정되며 정확히 일치해야 한다.

Registrar 계정과 Cloudflare 계정에는 MFA, auto-renew, domain lock과 복구 가능한 소유자 이메일을
설정한다. 등록대행자는 가격뿐 아니라 소유권 변경, nameserver/DNSSEC 지원, 복구 절차와 연락 가능성을
함께 비교한다.

## Sources Reviewed

- [Cloudflare Registrar supported TLDs](https://developers.cloudflare.com/registrar/top-level-domains/)
- [Cloudflare TLD policies](https://www.cloudflare.com/tld-policies/)
- [Cloudflare primary DNS setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- [KRNIC 국가도메인 등록대행자 안내](https://krnic.or.kr/jsp/business/management/domain/regAgencyInfo.jsp)
- [MDN Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)
- [MDN Secure cookie configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies)
- [MDN Cookie scope and host-only cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)
- [Google Search: subdomains versus subdirectories](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

## Result

Canonical domain과 네 primary host를 확정했다. DNS, hosting 또는 remote 설정은 아직 변경하지 않았다.
장기 결정은 `docs/decisions/2026-09-19-canonical-domain-and-primary-hosts.md`에 기록했다.
