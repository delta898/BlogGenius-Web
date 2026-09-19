# 바이브 코딩 전자책 주제 노트

## 문서 목적

BlogGenius Web platform을 함께 개발하며 얻은 질문, 판단, 실패와 검증 경험을 향후
`바이브 코딩` 전자책의 소제목과 사례로 발전시키기 위한 누적 노트다.

이 문서는 확정된 목차나 완성 원고가 아니다. 실제 프로젝트 경험이 쌓일 때마다 소제목 아래에
사례, 선택지, 실패 원인, 결정과 결과를 추가한다. 공개 원고로 옮길 때는 credential, 개인정보,
비공개 도메인과 악용 가능한 운영 정보를 제거한다.

## 프로젝트 시작: 빈 저장소에 맥락부터 쌓기

### 1단계: GitHub Project를 먼저 만들다

애플리케이션 코드보다 먼저 독립된 GitHub 저장소를 만들어 Web platform의 이력과 권한 경계를
Desktop App에서 분리했다. 저장소를 만드는 행위가 단순한 파일 보관이 아니라 제품의 책임 경계를
선언하는 첫 architecture decision이라는 관점으로 발전시킨다.

### 2단계: Codex에서 New Project로 실제 작업 공간을 연결하다

GitHub 저장소와 로컬 경로를 Codex Project로 연결하면서 AI가 어느 저장소를 읽고 수정해야 하는지
명확히 했다. 비슷한 이름의 다른 폴더를 실제 root로 오해했던 경험을 함께 기록해, 도구 연결 뒤에도
`pwd`, Git remote, branch와 working tree를 검증해야 한다는 교훈으로 확장한다.

### 3단계: 코드를 만들기 전에 AGENTS.md부터 합의하다

Framework scaffold보다 먼저 보안, Development/Production 분리, 승인 범위, Git과 문서화 규칙을
정했다. 바이브 코딩에서 속도를 높이는 첫 행동이 코드를 많이 생성하는 것이 아니라, AI가 반복해서
좋은 판단을 내릴 조건을 저장소 안에 만드는 일일 수 있다는 사례로 다룬다.

### 4단계: docs를 프로젝트의 장기 기억으로 만들다

Active plan, archive, architecture, decision, feature, operations 문서를 구분하고 첫 날짜 기반 개발
기록을 만들었다. 대화가 사라져도 질문과 결정의 맥락이 Git에 남는 구조를 설명한다.

### 프로젝트 이름이 책임 범위를 따라가야 하는 이유

처음에는 관리자 앱만 생각해 프로젝트 이름을 Backoffice로 정했지만, 공개 제품 사이트와 Dev/Prod
배포까지 같은 Web workspace에서 관리하기로 하면서 `BlogGenius-Web`으로 변경했다. 이름 변경을
폴더명에만 적용하지 않고 GitHub 저장소, remote, AGENTS.md, README와 날짜 기반 문서까지 함께
정리해야 AI와 사람이 오래된 범위를 사실로 오해하지 않는다는 경험을 다룬다.

### 애플리케이션과 공용 웹 인프라를 같은 프로젝트에 넣지 않은 이유

BlogGenius의 정적 사이트와 Backoffice는 하나의 Web 저장소로 묶되, 여러 기존 사이트를 함께
라우팅하는 Caddy와 Docker Compose는 별도 Oracle Web Infrastructure 프로젝트로 분리했다.
하나의 제품을 쉽게 배포하려는 목표와 공용 gateway의 장애 범위를 분리하는 판단 과정을 다룬다.

### 구조적 분리는 유지하고 운영 방식은 하나로 합치기

공개 사이트는 정적 파일이고 Backoffice는 server runtime이라는 차이 때문에 처음에는 webroot와
Docker를 혼합하는 배포안을 검토했다. 구조적으로는 효율적이지만 사용자가 upload/symlink와 image
digest라는 두 운영 모델을 모두 기억해야 했다. 작은 static container의 비용을 받아들이고 두
산출물을 모두 OCI image로 통일해 build, promotion과 rollback을 하나의 release manifest로 다루기로
한 과정을 기록한다. 좋은 단순화는 component 경계를 지우는 것이 아니라 운영자의 기억 부담을
줄이는 방향이어야 한다는 사례다.

### 사용자가 외울 명령을 하나로 줄이는 운영 인터페이스

내부 script가 여러 개여도 root의 `./ops`만 기억하도록 설계한다. `doctor`, `validate`, `deploy`,
`promote`, `status`, `rollback`이 실행 전 target, commit SHA, image digest와 영향 범위를
설명하고 위험한 Production 작업은 명시적인 확인을 요구하게 만드는 과정을 다룬다.

### 웹 코드는 플랫폼 중립적인데 Docker build는 왜 실패했을까

Apple Silicon에서 Oracle의 `linux/amd64` 이미지를 만들며 Next.js 자체 코드가 아니라
SWC/Turbopack과 Sharp의 native binary가 QEMU 경계에서 충돌한 경험을 다룬다. Alpine을
Debian으로 바꾸는 것만으로 해결되지 않았고, build stage는 host native platform에서 실행하고
final runtime만 target platform으로 만드는 경계를 통해 해결했다. “웹 앱은 플랫폼 중립적”이라는
설명과 build toolchain 및 배포 artifact의 architecture 계약은 별개라는 교훈, 그리고 최종
container를 실제 기동해 health와 HTTP 응답으로 증명해야 한다는 과정을 기록한다.

### 아직 한 줄의 제품 코드도 쓰지 않았지만 이미 개발은 시작됐다

Repository, AI workspace, 작업 규칙과 문서 lifecycle을 준비한 과정을 통해 설계와 협업 기반을 만드는
일도 실제 개발이라는 관점을 다룬다. 이후 구현 속도를 높이기 위해 초기에 어떤 느린 결정을 해야
하는지 돌아본다.

### 본격 개발 전에 사람과 AI의 합을 맞추는 시간

이전 개발 경험에서 구현을 서두를수록 중간에 제품 목표, 권한, 배포와 완료 기준을 다시 협상하느라
더 많은 비용이 들었다는 문제의식에서 시작한다. 코드가 없을 때는 architecture를 바꾸는 비용이
문서 몇 줄이지만, 인증과 database가 연결된 뒤에는 migration과 호환성 문제가 된다는 차이를 다룬다.

### 무엇을 지금 정하고 무엇을 미뤄야 하는가

모든 미래 요구사항을 미리 결정하는 것이 좋은 설계는 아니다. 첫 사용 주체, 첫 vertical slice,
관리자 인증, 환경·배포 경계, migration 소유권과 품질 gate처럼 나중에 바꾸기 비싼 것은 구현 전에
합의하고, 세부 UI polish, 미래 결제사와 아직 필요 없는 service 분리는 실제 증거가 생길 때까지
미루는 기준을 다룬다.

### 질문 목록이 초기 코드보다 강력한 산출물이 되는 순간

“누가 관리자인가?”, “마지막 관리자가 계정을 잃으면 누가 복구하는가?”, “같은 build가 어떻게
Production으로 승격되는가?”, “어느 저장소가 migration의 주인인가?” 같은 질문이 scaffold보다 먼저
나와야 하는 이유를 실제 결정 과정과 함께 축적한다.

## GitHub와 함께하는 바이브 코딩

### 코드를 쓰기 전에 저장소의 목적부터 고정하기

README만 있는 빈 저장소에서 시작했지만, 곧바로 framework를 설치하지 않고 프로젝트의 목적,
참조할 Desktop App 저장소와 수정하면 안 되는 경계를 먼저 확인한 경험을 다룬다.

### Git 저장소의 위치를 틀리면 모든 맥락이 틀어진다

비슷한 이름의 작업 폴더와 실제 GitHub 저장소를 혼동했던 초기 상황을 사례로 삼아, AI가 작업하기
전에 repository root, remote, branch와 working tree를 확인해야 하는 이유를 설명한다.

### Branch는 코드 묶음이 아니라 생각의 경계다

기능 branch마다 목표, 범위, non-goals와 검증 계획을 연결하면 AI와 사람이 같은 작업 단위를
바라볼 수 있다. Parent feature와 작은 review slice를 나누는 기준도 함께 다룬다.

### 커밋은 자동 저장이 아니라 검토 가능한 결정 단위다

파일 수보다 하나의 논리적 변화에 맞춰 commit을 나누는 이유, conventional commit이 사람과 AI의
공통 언어가 되는 방식, 사용자의 승인 없이 commit이나 push를 확대 실행하지 않는 원칙을 다룬다.

### 혼자 개발해도 Pull Request처럼 생각하기

변경 목적, diff, 검증 결과, 남은 위험과 수동 확인 항목을 한 묶음으로 만드는 습관이 왜 중요한지,
실제 PR을 만들기 전에도 review 가능한 상태를 준비하는 방법을 정리한다.

### 사람의 변경을 지우지 않는 AI 협업

Dirty working tree를 오류로 보지 않고 사용자 작업으로 존중하는 태도, 관련 없는 변경을 되돌리거나
현재 작업의 commit에 흡수하지 않는 규칙, 충돌이 있을 때 멈춰야 하는 기준을 다룬다.

### Git branch와 실행 환경을 같은 것으로 착각하지 않기

`dev` branch가 Development Supabase를 자동 선택하게 만들지 않고 branch eligibility와 runtime target을
분리한 이유를 설명한다. 잘못된 branch나 CI 설정이 Production 접근으로 이어지는 것을 막는 사례다.

### 고전적인 Git Flow도 배포 계약까지 써야 완성된다

`feature → dev → release → main` 흐름을 선택한 뒤 각 branch가 어느 환경에 배포되는지, release fix와
hotfix를 어떻게 `dev`로 되돌릴지까지 합의한 과정을 다룬다. Branch 그림만 있고 back-merge와 target
검증이 없으면 고전적 흐름도 쉽게 divergence와 오배포를 만든다는 점을 기록한다.

### GitHub Actions에서 Development와 Production 사이에 문을 세우기

환경별 secret, deployment target, approval gate와 artifact를 분리하고, 설정 누락 시 Production으로
fallback하지 않는 CI/CD 원칙을 향후 실제 workflow 구현 경험과 함께 축적한다.

### 저장소에 들어가면 안 되는 것들

Service role key, database password, 실제 이메일과 HWID가 migration, fixture, 로그, screenshot과 문서에
스며드는 경로를 살펴보고 `.gitignore`만으로 충분하지 않은 이유를 다룬다.

### Git history와 개발 문서는 서로 다른 기억 장치다

Commit은 무엇이 바뀌었는지를 잘 보여주지만 왜 바꿨는지, 어떤 대안을 버렸는지, 어떤 실패를
겪었는지는 충분히 설명하지 못한다. Git history와 날짜 기반 개발 기록을 함께 사용하는 방식을 다룬다.

## Architecture, Framework와 Language를 결정하는 법

> 현재 상태: 아래 기술 조합은 확정된 구현이 아니라 `2026-09-19` 기준 제안이다.
> 실제 선택이 확정되면 결정 이유, 구현 중 드러난 오판과 변경 사항을 계속 보강한다.

### Framework를 고르기 전에 trust boundary를 먼저 그리기

React, Next.js 같은 도구 이름부터 고르지 않고 Browser, Backoffice server/BFF, Development Supabase와
Production Supabase 사이에서 credential과 데이터가 어디까지 이동할 수 있는지 먼저 결정한 과정을 다룬다.

### Architecture는 폴더 구조가 아니라 권한의 흐름이다

`UI → use case → authorization/audit → data access → Supabase` 흐름을 먼저 세우고, service role이
브라우저에 도달하지 않도록 만든다. 계층 구분이 코드 정리 이상의 보안 장치가 되는 이유를 설명한다.

### 작은 팀이 Modular Monolith로 시작하는 이유

처음부터 frontend와 여러 microservice를 나누지 않고 하나의 배포 가능한 Web application 안에서
domain 경계를 분리하는 선택을 다룬다. 분리는 코드 내부에서 시작하고 독립 배포가 실제로 필요할 때
service를 추출하는 기준을 축적한다.

### TypeScript를 Frontend 언어가 아니라 계약 언어로 사용하기

UI props뿐 아니라 environment profile, capability, DTO, mutation input과 audit event를 strict
TypeScript로 연결해 경계 사이의 가정을 컴파일 단계에서 드러내는 방식을 다룬다. Runtime validation이
여전히 필요한 이유도 함께 설명한다.

### 왜 JavaScript가 아니라 strict TypeScript를 제안했는가

Backoffice는 단순한 화면보다 `local/development/production`, 관리자 capability, license 상태 전이,
마스킹된 DTO와 audit event처럼 잘못 연결했을 때 위험한 계약이 많다. TypeScript의 목적은 코드를
길게 만드는 것이 아니라 이 계약의 누락과 잘못된 조합을 실행 전에 드러내는 데 있다.

Frontend와 server/BFF가 같은 type을 공유할 수 있고 Desktop App도 Node.js 생태계이므로 문맥 전환과
중복 모델을 줄일 수 있다. 다만 type은 브라우저 요청이나 외부 응답의 진실성을 보장하지 않으므로
server boundary의 runtime validation을 대신하지 않는다는 한계도 함께 기록한다.

### 왜 Next.js App Router를 제안했는가

이 프로젝트에는 관리자 UI뿐 아니라 cookie session, server-only secret, authorization, audit와
Supabase privileged access를 소유할 서버 경계가 필요하다. Next.js는 하나의 프로젝트 안에서 UI와
BFF를 함께 운영할 수 있어 초기 배포 단위를 늘리지 않으면서 Browser/Server 경계를 만들 수 있다.

App Router의 Server Component를 기본으로 사용하면 민감한 조회 결과를 Browser JavaScript에 모두
보낼 필요가 없고, Client Component를 상호작용이 필요한 부분으로 제한할 수 있다. 또한 공식 문서가
server-only DAL, 최소 DTO와 Server Action/Route Handler의 재인가를 명시적으로 안내한다는 점도
보안 중심 Backoffice에 중요한 선택 근거다.

반대로 Next.js를 사용한다고 자동으로 안전해지는 것은 아니다. Server Action과 Route Handler는
public endpoint이며, Server/Client import 경계를 잘못 다루면 secret이나 과도한 데이터가 노출될 수
있다. Framework의 편의보다 이 위험을 이해하고 규칙과 테스트로 통제할 수 있다는 판단으로 제안했다.

### 왜 React SPA와 별도 API Server로 바로 나누지 않았는가

별도 API는 물리적 경계와 다중 client 재사용에 유리하다. 하지만 현재는 작은 팀이 기본 틀과 첫
license 조회 slice를 만드는 단계다. 두 project, 두 deployment, API versioning과 별도 observability를
처음부터 운영하면 실제 제품 경계보다 배포 복잡성이 먼저 커진다.

먼저 Next.js 내부에서 UI, application, authorization/audit와 DAL을 분리하고, Desktop이나 다른
client가 같은 관리자 API를 필요로 하거나 독립 scaling 요구가 확인될 때 API service를 추출하는 쪽이
현재 비용과 미래 확장 사이의 균형이 좋다고 판단했다.

### 왜 Node.js 24 LTS를 제안했는가

Production runtime은 새로운 기능보다 예측 가능한 지원 기간이 중요하므로 Current가 아닌 LTS를
선택한다. Node.js 24는 현재 LTS이며 기존 BlogGenius Desktop App의 Node 24 기준과도 맞는다.
두 저장소의 runtime 차이에서 생길 수 있는 package, test와 script 동작 차이를 줄이면서 Next.js의
최소 요구 버전도 충족한다.

Version은 개발자 장비의 우연한 전역 설치에 맡기지 않고 `.nvmrc`와 `package.json.engines`, CI에서
함께 고정해야 한다. LTS를 골랐다는 사실보다 동일한 runtime을 local과 CI, Production에서 재현하는
절차가 더 중요하다는 점을 사례로 발전시킨다.

### 왜 처음부터 Python Backend를 선택하지 않았는가

Python은 데이터 처리나 AI worker가 중심일 때 강점이 있지만 현재 핵심은 관리자 Web UI, Supabase
Auth, server-side authorization과 운영 CRUD workflow다. Frontend와 Backend 언어를 분리하면 DTO와
검증 계약, tooling과 deployment 경계가 하나 더 생긴다.

현재는 TypeScript 하나로 제품 경계를 선명하게 만드는 이점이 더 크다. 향후 독립적인 분석, 대량 처리
또는 AI pipeline이 생기면 그 workload만 Python worker/service로 추가할 수 있으므로 지금의 선택이
Python을 영구적으로 배제하는 것은 아니다.

### 선택 이유를 “익숙해서”에서 멈추지 않기

익숙함과 생태계는 실제 비용을 줄이는 유효한 기준이지만 그것만으로 architecture를 정당화하지 않는다.
이번 제안은 보안 경계, 환경 분리, 배포 단순성, Supabase 통합, 기존 Node.js 자산과 향후 추출 가능성을
함께 비교한 결과다. 실제 구현에서 이 전제가 틀린 것으로 드러나면 기술을 방어하기보다 결정 문서와
전자책 노트에 증거와 수정 이유를 남긴다.

### Full-stack Framework를 선택해도 Backend가 사라지는 것은 아니다

Next.js Route Handler와 Server Action은 public endpoint라는 전제로 인증, 인가, validation과 audit를
적용해야 한다. “서버 코드처럼 보인다”와 “안전한 서버 경계다”의 차이를 다룬다.

### Supabase를 Browser에서 직접 호출할 것인가, BFF 뒤에 둘 것인가

일반 사용자 앱의 RLS 중심 접근과 달리 Backoffice는 고객 전체를 다루고 강한 관리 권한이 필요하다.
민감한 조회와 mutation을 server-only DAL과 안전한 DTO 뒤에 두기로 제안한 이유를 설명한다.

### 하나의 Database에 두 개의 Migration History를 만들지 않기

Desktop App과 Backoffice가 같은 Supabase를 사용하더라도 각 저장소가 독립적으로 같은 schema를
관리하면 split-brain이 생긴다. Canonical migration owner를 하나로 유지하고, 필요해질 때 Backend
저장소로 추출하는 전환 기준을 다룬다.

### 기술 스택은 인기 순위가 아니라 프로젝트 제약으로 선택하기

관리 화면, server-only secret, Supabase Auth, 환경별 배포, 운영 안전성, 테스트와 팀의 기존 Node.js
경험을 기준으로 후보를 비교한다. “무엇이 최고인가”보다 “무엇이 이 프로젝트의 위험을 줄이는가”를
묻는 과정을 기록한다.

### 선택하지 않은 기술도 문서에 남겨야 하는 이유

SPA와 별도 API, SvelteKit/Nuxt, 초기 microservice 같은 대안을 왜 지금 선택하지 않았는지 남기면
나중에 조건이 바뀌었을 때 감정이나 유행이 아니라 이전 판단 기준으로 재검토할 수 있다.

## Domain과 URL도 Architecture다

### 제품 페이지와 관리자 페이지를 같은 경로에 둘 것인가

`www.<domain>/admin`과 `admin.<domain>`을 비교하며 URL이 단순한 이름이 아니라 browser origin,
cookie, CSP, deployment와 incident boundary를 결정한다는 사실을 다룬다.

### 왜 `/admin`보다 `admin.<domain>`을 제안했는가

Cookie Path는 보안 경계가 아니며 marketing site와 같은 origin을 쓰면 public page의 취약점과 배포
실수가 관리자 surface에 영향을 줄 수 있다. Host-only 관리자 session과 독립 security policy를 위해
subdomain을 선택한 이유를 기록한다.

### 홍보 페이지는 경로로 모으고 운영 surface는 host로 분리하기

제품 소개, 기능, 다운로드 안내, 가이드와 changelog는 `www`의 path로 모아 하나의 public funnel을
만든다. 반면 admin, binary downloads와 status는 보안·가용성·배포 책임이 달라 별도 host로 분리하는
기준을 다룬다.

### 다운로드 페이지와 설치 파일 서버는 같은 것이 아니다

`www/.../download`는 사용자의 OS와 version 선택을 돕는 제품 페이지이고 실제 binary는 별도 release
storage/CDN에서 제공한다. 서명, cache, rollback과 대용량 전송 책임을 marketing runtime에서 분리한
이유를 향후 배포 경험과 함께 축적한다.

### 좋은 이름을 찾는 일과 안전하게 소유하는 일은 다르다

하이픈 없는 `.kr`과 국제적인 `.com` 후보를 비교하면서 발음, 입력, 시장, 갱신 비용뿐 아니라 기존
유사 서비스와 상표 충돌을 확인해야 했던 과정을 다룬다. 검색 결과가 없다는 사실을 도메인 등록 가능
또는 법적 안전성으로 오해하지 않는 교훈도 포함한다.

### 후보를 비교한 뒤 canonical domain을 확정하다

`bloggenius.kr`와 `blog-genius.com`을 비교한 뒤 초기 한국 시장, 제품명과의 일치, 입력 편의성을
근거로 `bloggenius.kr`를 선택했다. Production의 `www`와 `admin`, Development의 `dev`와
`admin.dev`를 확정하면서 domain 선택이 environment contract로 발전한 과정을 기록한다.

### 도메인 결정과 DNS 변경을 같은 승인으로 보지 않기

이름과 host topology를 합의했어도 실제 구매 완료, DNS, TLS, Auth callback과 hosting 변경은 별도의
실행 단계다. 설계 승인과 외부 상태 변경을 분리하면 AI가 합의를 곧바로 배포 권한으로 확대 해석하지
않도록 할 수 있다는 교훈을 다룬다.

### Cloudflare에서 `.kr`이 검색되지 않았던 이유

도메인 이름이 이미 등록된 것인지, 검색 입력이 잘못된 것인지 의심했지만 원인은 Cloudflare
Registrar가 `.kr` 신규 등록을 지원하지 않는 것이었다. UI 오류처럼 보이는 현상을 공식 supported
TLD 목록과 정책 문서로 확인한 과정을 기록한다.

### Registrar와 DNS Provider는 같은 회사일 필요가 없다

`.kr`은 KRNIC 공인 등록대행자에서 구매하고 authoritative DNS는 Cloudflare로 운영하는 구조를
선택했다. Domain 소유·갱신 책임과 DNS·proxy·보안 책임을 구분하면 특정 provider가 TLD 등록을
지원하지 않아도 원하는 운영 구조를 만들 수 있다는 점을 다룬다.

### 이미 가진 회사 도메인의 subdomain을 쓰면 안 될까

개인사업자 domain `mentivenus.com` 아래 `bloggenius.mentivenus.com`을 두는 대안을 검토했다. 비용과
시작 속도는 유리하지만 독립 제품 브랜드, URL 길이, 환경별 host 이름과 향후 제품 분리에는 불리하다.
기술적으로 가능하다는 사실과 제품의 canonical 주소로 적합하다는 판단은 다르다는 점을 다룬다.

### 회사 브랜드와 제품 브랜드를 URL에서 어디까지 결합할 것인가

제품 전용 `bloggenius.kr`를 유지하면서 MentiVenus domain은 소개·redirect에 사용하고, 화면과 법적
문서에는 `BlogGenius by MentiVenus`로 관계를 나타내는 절충안을 기록한다. Domain hierarchy가 회사와
제품의 장기 관계를 어떻게 암묵적으로 선언하는지도 살펴본다.

### Nameserver를 바꾸기 전에 zone과 record부터 준비하기

Cloudflare zone을 먼저 만들고 배정된 nameserver와 필요한 DNS record를 확인한 뒤 registrar에서
교체해야 한다. Nameserver를 추측하거나 DNSSEC 순서를 잘못 처리하면 새 도메인이 처음부터
접속 불가 상태가 될 수 있다는 운영 교훈을 향후 실제 연결 과정과 함께 기록한다.

### Tag는 이름이고 digest는 증거다

Development image를 `latest`나 `dev` tag로 배포하면 같은 배포 기록이 시간이 지나
다른 artifact를 가리킬 수 있다. Site와 admin image의 registry digest, source commit과
environment를 작은 manifest로 묶고, Production에서는 다시 build하지 않고 같은 digest를
승격하기로 한 과정을 다룬다.

### 자동화 코드를 추가하는 것과 실제 배포 권한은 다르다

GHCR publish workflow와 Oracle Compose 계약을 저장소에 추가했지만, feature branch에서
workflow를 실행하거나 Oracle에 접속하지 않았다. 코드로 capability를 준비하는 승인과
외부 package 발행·서버 변경·public traffic 전환 승인을 분리한 사례다.

### CI의 편리한 action tag도 공급망에서는 mutable하다

`actions/checkout@v7`처럼 읽기 좋은 major tag 대신 공식 release의 full commit SHA를
확인해 고정했다. 버전 주석으로 유지보수성을 남기면서 실행 identity는 바뀌지 않게 만드는
절충, 그리고 action update를 의도적인 review 대상으로 다룬다.

## AGENTS.md로 AI 개발팀 운영하기

### 매번 프롬프트를 반복하지 않는 프로젝트 헌법

보안, 환경 분리, 승인 범위와 문서화 습관을 매 대화에서 다시 설명하는 대신 `AGENTS.md`에 지속적인
협업 규칙으로 남기는 이유를 설명한다.

### 좋은 AGENTS.md는 코딩 스타일보다 권한 경계를 먼저 말한다

들여쓰기나 파일명 규칙보다 Production 접근, secret 취급, commit·push·deploy 승인과 destructive
action의 경계를 먼저 고정해야 하는 이유를 Backoffice 사례로 다룬다.

### AI에게 프로젝트 지도부터 건네기

실제 repository root, 참고할 Desktop App 저장소, 수정 가능한 범위와 canonical 문서 위치를
명시하면 잘못된 폴더에서 정답을 만드는 실수를 어떻게 줄일 수 있는지 설명한다.

### “고고”의 범위를 어디까지 볼 것인가

짧은 승인을 현재 합의된 구현 범위로만 해석하고 commit, push, migration과 Production 배포까지
확대하지 않는 규칙을 통해 사람의 최종 통제권을 유지하는 방법을 다룬다.

### 보안 원칙을 조언이 아니라 작업 규칙으로 만들기

브라우저에 service role을 두지 않기, fail closed, 관리자와 일반 사용자 인증 분리, 모든 중요한
mutation의 audit 기록 같은 원칙을 구현 전에 문서로 고정한 이유를 설명한다.

### 구현 전에 개발 기록을 먼저 만들게 하기

Feature branch 생성 직후 날짜 기반 active plan을 만들고 user need, scope, non-goals, risk와
verification을 먼저 쓰게 하면 AI의 성급한 구현을 어떻게 줄일 수 있는지 다룬다.

### 문서는 작업 후 보고서가 아니라 작업 중인 메모리다

진행 중 발견, 실패, 계획 수정과 검증 결과를 그때그때 기록하고, 완료 후 architecture, decision,
feature, operations 문서로 승격하는 lifecycle을 설명한다.

### Definition of Done을 AI와 합의하기

Happy path 구현만으로 끝내지 않고 authorization, audit, failure state, environment separation,
테스트와 문서까지 완료 조건에 포함하는 방법을 다룬다.

### 규칙이 너무 길어졌을 때도 읽히게 만드는 법

모든 교훈을 한 문서에 무작정 더하기보다 project-wide rule, domain document, active plan과 runbook으로
나누고 `AGENTS.md`에는 행동을 바꾸는 핵심 규칙과 탐색 경로를 남기는 방식을 다룬다.

### AGENTS.md도 코드처럼 계속 고쳐야 한다

초기 규칙이 실제 작업에서 모호했거나 빠진 사례를 발견할 때 문서를 갱신하고, 단순 선호가 아니라
반복되는 위험과 검증 가능한 행동을 중심으로 규칙을 발전시키는 방법을 설명한다.

### AI의 자율성과 사람의 책임을 동시에 지키기

읽기·진단·좁은 테스트는 자율적으로 진행하되 비용, 데이터, 외부 효과와 Production 변경은 사람이
승인하는 경계를 세워 속도와 책임을 함께 가져가는 방식을 다룬다.

## 프로젝트에서 추가로 수집할 사례

- 첫 feature branch와 날짜 기반 개발 기록이 실제로 함께 진화한 과정
- 잘못된 환경 target이나 Supabase project mismatch를 사전에 차단한 사례
- 관리자 인증과 capability 기반 authorization을 설계하며 버린 대안
- License 조회 vertical slice에서 개인정보 마스킹과 audit를 검증한 과정
- Development에서는 성공했지만 Production gate가 막아낸 위험한 변경
- 문서와 코드가 어긋난 순간을 발견하고 어느 쪽이 의도였는지 복원한 사례
- 실패한 구현을 되돌리는 대신 기록하고 더 나은 구조로 수정한 과정
- 코딩 전에 합의한 항목이 실제 구현 중 재작업을 줄인 사례와 불필요했던 사전 결정을 구분한 회고

## 집필 시 유지할 관점

- 도구 자랑보다 사용자가 던진 질문과 그 질문이 설계를 어떻게 바꿨는지 중심에 둔다.
- 성공 사례만 나열하지 않고 잘못 이해한 경로, 실패한 시도와 수정 근거를 함께 남긴다.
- “AI가 다 해줬다”가 아니라 사람이 방향·승인·검증을 소유하고 AI가 조사·구현을 가속한 구조를 보여준다.
- 특정 도구의 일시적인 UI보다 다른 프로젝트에도 재사용할 수 있는 원칙과 판단 기준을 추출한다.
