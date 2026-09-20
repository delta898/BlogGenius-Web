# Deploy Manifest Default

## Status

- Branch: `feature/deploy-manifest-default`
- Base/parent branch: `dev`
- Started: `2026-09-20`
- Status: in progress

## User Need

`./ops deploy development`가 manifest 파일 경로를 필수로 요구해서 배포 전
`gh run download`를 수동으로 실행해야 한다. 기본 동작을 명시적으로 정해
인자 없이도 배포할 수 있어야 한다.

## Goal

- 인자 없이 `./ops deploy development`를 실행하면 현재 HEAD에 대한 성공
  publish run의 manifest를 자동으로 받아 사용한다.
- manifest 경로를 주면 기존처럼 그대로 사용한다.

## Scope

- `ops`의 `run_deploy` 기본값 해석과 help 문구
- `deployment-quickstart.md` 사용법 갱신과 이 개발 기록

## Non-Goals

- 배포 절차 자체의 변경 (preflight, 전송, health gate 유지)
- Production 명령
- CI workflow 변경

## Proposed Design

인자가 없으면 `gh run list`로 현재 HEAD와 일치하는 성공 run을 찾아
`development-release-<sha>` 아티팩트를 temp 디렉토리에 받아 사용한다.
해당 run이 없으면 "CI 미완료"로 중단하고 명시적 파일 전달을 안내한다.
`preflight`의 `RELEASE_SHA == HEAD` 검사가 그대로 적용되므로 자동 해석이
엉뚱한 릴리스를 가리킬 수 없다.

## Boundaries and Risks

- `gh` 로그인 상태를 요구한다. 없으면 `gh` 에러가 그대로 보인다.
- HEAD에 대한 성공 run이 여러 개면 최신을 사용한다.
- 명시 경로가 우선이므로 감사 추적 방식은 유지된다.

## Stages

1. `ops` 구현과 help 갱신
2. 로컬 검증 (syntax, help, run 조회 재현, negative)
3. 문서 갱신과 index 반영

## Decisions and Alternatives

- `--latest` 플래그 대신 인자 생략을 기본값으로 했다. "그냥 deploy"가
  가장 짧은 표현이 되어야 한다는 사용자 요구를 따른다.
- 아티팩트 해석에 `jq` 외부 의존을 두지 않고 `gh -q` 내장 필터를 사용한다.

## Progress and Corrections

- 2026-09-20: 브랜치 생성과 기록 작성 후 구현 시작.
- 구현 완료: `resolve_manifest`와 인자 생략 분기, help·quickstart 갱신.
- 로컬 검증 완료: `bash -n`, help, negative exit 2, `gh -q` 필터로 HEAD
  `61299e9`의 성공 run(`35480781520`) 재현, 아티팩트 다운로드·verify 통과.

## Verification

- `bash -n ops`
- `./ops help`에 `deploy development [<file>]` 표시
- `gh run list -q` 필터로 현재 HEAD의 성공 run ID 재현
- 명시 파일·잘못된 environment 기존 동작 회귀
- 서버 실전 배포는 별도 승인 후

## Remaining Risks and Follow-up

- 서버 실전 테스트 미실시

## Result

진행 중이다.
