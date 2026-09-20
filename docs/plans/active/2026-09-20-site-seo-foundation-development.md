# Site SEO Foundation

## Status

- Branch: `feature/site-seo-foundation`
- Base/parent branch: `dev`
- Started: `2026-09-20`
- Status: in progress

## User Need

검색 색인과 공유 미리보기의 기초 장치를 갖춰야 한다. Search Console에
제출할 sitemap과 페이지 단위 canonical, OG 카드, 제품 구조화 데이터가 없다.

## Goal

- `sitemap.xml`·`robots.txt`를 빌드 산출물로 생성한다.
- 전 페이지 canonical과 OG·Twitter 기본값을 둔다.
- 홈에 `SoftwareApplication` JSON-LD를 둔다.

## Scope

- `apps/site`의 `sitemap.ts`·`robots.ts`, 레이아웃·페이지 메타데이터, 홈 JSON-LD
- 이 개발 기록과 index 반영

## Non-Goals

- OG 이미지 제작 (후속)
- dev·admin `noindex` 헤더 (Infra 작업으로 분리)
- 스텁 페이지 문구 고도화

## Proposed Design

- canonical 기준은 `https://www.bloggenius.kr`, `metadataBase`로 고정.
- robots는 전체 허용 + sitemap 지정. 호스트별 차단은 헤더로 하므로 여기 두지 않음.
- JSON-LD는 확인된 사실만 (이름·URL·언어).

## Progress and Corrections

- 2026-09-20: 브랜치 생성과 기록 작성 후 구현 시작.
- 구현 중 수정: `output: export`에서 `sitemap.ts`·`robots.ts`는
  `dynamic = "force-static"` 선언이 필요함을 빌드 실패로 확인하고 반영.
- 검증 완료: typecheck·build(10경로)·eslint 통과. 산출물에
  sitemap·robots·canonical·OG·JSON-LD 존재 확인.

## Result

sitemap·robots·canonical·OG·JSON-LD 구현·검증·dev 실전 배포 완료.
dev·admin noindex는 Infra 측(`X-Robots-Tag`)으로 적용済み. Search Console
sitemap 제출·색인 요청은 사용자 측 완료.
