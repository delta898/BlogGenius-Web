# Site Home Foundation

## Status

- Branch: `feature/site-home-foundation`
- Base/parent branch: `dev`
- Started: `2026-09-20`
- Status: in progress

## User Need

공개 사이트에 메뉴와 레이아웃 기초를 세우고 홈에만 실제 내용을 채워
앞으로 페이지 단위로 확장할 수 있어야 한다.

## Goal

- 헤더·내비게이션·푸터와 여섯 경로의 뼈대를 만든다.
- 홈(`/`)에 제품 정의·3단계 시작법·CTA 실내용을 채운다.
- 나머지 다섯 경로는 정직한 스텁으로 둔다.
- 기본 CSS만 사용하고 의존성을 추가하지 않는다.

## Scope

- `apps/site`의 내비게이션 계약, 헤더·푸터, 레이아웃 합성
- 홈 실내용과 스크롤 리빌 인터랙션, 타입·폭 다듬기
- `/features` 실내용 (Desktop README 9개 항목의 4묶음 정리)
- `download`·`guides`·`changelog`·`support`는 스텁 유지
- 이 개발 기록과 index 반영

## Non-Goals

- Tailwind 등 스타일링 의존성 도입
- 실제 다운로드 바이너리 호스팅과 버전 정보 확정
- 가이드·변경내역 실내용, Backoffice, 분석·댓글 기능
- 확인되지 않은 기능·가격·일정의 문서화

## Proposed Design

```text
apps/site/src/
  content/navigation.ts        # 메뉴 단일 계약 (href/label)
  components/SiteHeader.tsx    # 브랜드 + nav
  components/SiteFooter.tsx    # 브랜드 + 지원 링크
  app/layout.tsx               # 합성만 담당
  app/page.tsx                 # 홈 실내용
  app/{features,download,guides,changelog,support}/page.tsx  # 스텁
```

홈 내용 근거는 Desktop App README로 한정한다 (제품 정의, 9개 기능 요약,
3단계 시작법, 카카오 지원 채널). 지원 스텁에만 외부 카카오 링크를 둔다.
스텁은 "준비 중"을 명시하고 홈으로 돌아갈 수 있게 한다.

## Boundaries and Risks

- 정적 export이므로 클라이언트 상태·active 메뉴 하이라이트를 두지 않는다.
- secret·개인정보 없음. 외부 링크는 지원 채널 하나만 둔다.
- Caddy·Infra 변경 없음. 기존 컨테이너 계약 유지.

## Stages

1. 내비게이션 계약과 헤더·푸터·레이아웃
2. 홈 실내용
3. 다섯 스텁과 스타일 확장
4. typecheck·production build 검증

## Decisions and Alternatives

- 기본 CSS 확장을 선택 (사용자 합의). Tailwind는 polish 시점 재검토.
- 홈만 실내용으로 시작 (사용자 합의). 핵심 funnel부터가 아니라 가장 작은
  slice를 먼저 검증한다.
- 이후 사용자 전권 위임으로 `/features` 실내용과 스크롤 리빌·타이포 다듬기까지
  확장. 근거 없는 내용은 쓰지 않고 Desktop README 범위만 사용한다.

## Progress and Corrections

- 2026-09-20: 브랜치 생성과 기록 작성 후 구현 시작.
- 구현 완료: 내비게이션 계약·헤더·푸터·레이아웃 합성, 홈 실내용(정의·3단계·CTA),
  다섯 스텁, 스타일 확장. 의존성 추가 없음.
- 검증 완료: site typecheck 통과, production build 6경로 prerender 통과,
  산출물에 홈 문구·스텁 문구 존재 확인.
- 최고안 확장 완료: h1 상한 5.5rem→3.4rem·행간 완화, 폭 960→1120,
  `Reveal` 스크롤 리빌(JS 없어도 보이는 fail-open + reduced-motion 대응),
  `/features` 4묶음 실내용. typecheck·build·eslint 통과.
- 중앙 정렬 버그 수정: 카드에 폭 상한만 있고 정렬이 없어 왼쪽에 붙던 문제,
  `justify-items: center`로 해결.
- 푸터 강화: `© 도전인생 All rights reserved` + 5채널 원형 버튼
  (오픈채팅·네이버 블로그·인스타그램·Threads·메일). 전부 실운영 확인済み.
  외부 링크는 새 탭, 접근성 라벨 포함.

## Verification

- `pnpm --filter @bloggenius/site typecheck`
- `pnpm --filter @bloggenius/site build` (정적 export 산출물 확인)
- 여섯 경로의 HTML 생성과 스텁 문구 육안 확인

## Remaining Risks and Follow-up

- 다운로드 실내용 (OS·버전·파일 위치 미확정)
- 가이드·변경내역 콘텐츠 체계
- features 실내용 확장

## Result

홈 실내용·5스텁에서 최고안(타이포·폭·리빌·`/features` 실내용·푸터 5채널)으로
확장 완료. 중앙 정렬 버그 2건과 CTA 가운데 정렬·섹션 정렬 통일까지 반영하고
typecheck·build·eslint 통과. 사용자 육안 확인済み.
