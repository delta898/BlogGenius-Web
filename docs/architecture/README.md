# Architecture

현재 구현된 공개 사이트와 Backoffice의 안정된 구조, 배포 단위와 trust boundary를 기록한다.

다음 내용을 다룬다.

- 시스템 구성요소와 소유권
- Browser, server/BFF, Supabase 사이의 trust boundary
- Local, Development, Production 환경 경계
- 인증, 인가, audit와 데이터 접근 구조
- Desktop App과 공유하거나 연동하는 계약

아직 확정되지 않았거나 구현 중인 설계는 먼저 `docs/plans/active/`에 기록한다.
