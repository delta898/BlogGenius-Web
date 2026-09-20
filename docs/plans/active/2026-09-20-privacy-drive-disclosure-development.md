# Privacy Drive Disclosure

## Status

- Branch: `feature/privacy-drive-disclosure`
- Base/parent branch: `dev`
- Started: `2026-09-20`
- Status: in progress

## User Need

카드뉴스 발행이 Google Drive(`drive.file` 범위)를 사용한다는 지적이 나왔다.
OAuth 심사에서 요청 범위와 고지 불일치는 반려 사유이므로 방침에 반영해야 한다.

## Goal

- `/privacy-policy/`에 Drive 관련 수집·이용·공개·삭제를 명시한다.
- Google API 고지의 요청 범위를 spreadsheets + drive.file로 정정한다.
- 발행 전송 경로(Buffer·SNS 채널)를 제3자 목록에 추가한다.

## Scope

- Desktop 저장소 읽기 전용 확인 (수정 없음)
- 방침 페이지 문구 수정과 이 기록

## Non-Goals

- 주 내비·푸터 변경, 스타일 변경
- Desktop 코드 변경

## Evidence (Desktop 저장소 확인済み)

- `2026-09-05-v0.4.3-card-news-15-drive-publishing-development.md`:
  기존 OAuth client와 최소 권한 `drive.file` 범위 재사용, 완성된 카드
  이미지를 순서대로 사용자 Drive에 업로드, 익명 읽기(`anyone:reader`)
  부여 후 직접 URL로 Buffer에 전달, terminal 결과 후 best-effort 삭제,
  상태 불확실 시 잔류 가능, UI에 공개 링크 임시 파일 고지済み.

## Boundaries and Risks

- 확인된 사실만 서술한다. Buffer 계정 주체 등 미확인 사항은 단정하지 않는다.

## Verification

- site typecheck·build·eslint, 산출물 문구 확인
  (drive.file·익명 읽기 링크·Buffer 고지 존재)

## Result

`drive.file` 범위와 카드 이미지 임시 공개·삭제 원칙을 방침에 반영 완료.
수집 9항목·연동 6곳 체계로 확장.
