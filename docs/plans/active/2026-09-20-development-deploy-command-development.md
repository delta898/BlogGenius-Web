# Development Deploy Command

## Status

- Branch: `feature/development-deploy-command`
- Base/parent branch: `dev`
- Started: `2026-09-20`
- Status: in progress

## User Need

Development 릴리스 배포가 수동 SSH·`scp`·`compose up` 절차에 의존하고 있어 운영자가 순서를 기억해야 한다. 검증된 manifest가 있으면 Development 컨테이너 배포와 롤백을 `./ops` 명령 하나로 반복 가능하게 만들어야 한다.

## Goal

- `./ops deploy development <manifest>`로 Development 배포를 수행한다.
- `./ops rollback development`로 직전 Development 릴리스로 복귀한다.
- 배포 전 manifest 적격성을 기존 `preflight`로 강제한다.
- 성공한 릴리스만 `current`로 승격하고 이전 릴리스를 `previous`에 남긴다.

## Scope

- `ops`의 `deploy`/`rollback` Development 명령과 사용법 문서
- 서버 상태: `releases/<sha>/` + `current`/`previous` symlink
- `docs/operations/deployment-quickstart.md` 갱신과 이 개발 기록

## Non-Goals

- Production promotion과 승인 게이트 (별도 작업)
- Caddy/OracleWebInfra 파일 변경과 `infra apply` (Infra 소유)
- CI에서의 자동 SSH 배포 (수동 검증이 먼저)
- Supabase credential과 secret 보관 (현 단계 컨테이너는 `APP_ENVIRONMENT`만 요구)
- GHCR credential 관리 (2026-09-20 확인: 패키지 public이라 서버 pull에 인증 불필요)

## Proposed Design

```text
./ops deploy development <manifest>
  -> run_preflight (branch dev, clean tree, SHA==HEAD, digest, render)
  -> ssh: mkdir releases/<sha>, scp compose.oracle.yml + release.env
  -> ssh: config -q, pull, up -d --wait (healthy까지 대기)
  -> 성공 시에만 current/previous 갱신

./ops rollback development
  -> ssh: previous 존재 확인
  -> previous 디렉토리에서 up -d --wait 후 링크 교체
```

서버 루트는 `DEPLOY_ROOT`(`/home/ubuntu/Project/BlogGenius-Web`), 호스트는 `DEPLOY_HOST`(`oracle1`)로 override 가능하게 한다. 두 명령 모두 Caddy, Infra, Production에触하지 않는다.

## Boundaries and Risks

- Development 컨테이너를 교체하므로 실행 중 dev 트래픽에 영향이 있다. Production에는 영향이 없다.
- 첫 배포에는 `current`가 없어 `previous` 없이 시작한다. 롤백은 `previous`가 있을 때만 가능하다.
- `--wait`가 실패하면 링크를 건드리지 않고 컨테이너만 남긴 뒤 수동 조치를 안내한다.
- manifest와 로그에 secret을 포함하지 않는다 (기존 계약 유지).

## Stages

1. `ops`에 `deploy`/`rollback` 구현과 help 갱신
2. 로컬 검증 (syntax, help, preflight 회귀, negative test)
3. 문서 갱신 (`deployment-quickstart.md`, index)
4. Oracle 서버 실전 테스트 (별도 승인 후, 이미 기동 중인 동일 릴리스 기준)

## Decisions and Alternatives

- Interactive 확인 게이트를 두지 않는다. Development 수동 운영 단계이며 명령어 실행 자체가 의도 표현이다. Production에는 별도 게이트가 필요하다.
- `previous`를 디렉토리로 남기고 symlink만 교체한다. 실패한 릴리스 디렉토리는 감사 목적으로 삭제하지 않는다.
- `docker compose up --wait`를 사용해 healthy 도달을 Docker에 위임한다 (서버 Compose v2 확인됨).

## Progress and Corrections

- 2026-09-20: `dev`에서 브랜치 생성, 이 기록 작성 후 구현 시작.
- 선행 사실: release `5d487a1`이 수동 절차로 서버에 기동·healthy·cutover 통과済み. `GHCR public`, `edge network 정상`, `APP_ENVIRONMENT`만으로 기동 가능함을 실전에서 확인했다.
- 구현 완료: `run_deploy`/`run_rollback`과 help 갱신, `quickstart.md`의 Planned 섹션을 실제 사용법으로 교체.
- 로컬 검증 완료: `bash -n`, help, negative exit 2, feature 브랜치에서 실전 preflight가 branch 게이트로 거부됨을 확인.
- 사용자 승인済み: 커밋 + 서버 실전 테스트. 게이트상 feature 브랜치에서 배포 불가이므로 dev 병합·push 후 CI 신규 manifest로 실전 테스트한다.

## Verification

- `bash -n ops`
- `./ops help`에 새 명령 표시
- 기존 `./ops validate` 회귀 (lint, typecheck, unit, build) — ops가 bash라 JS 변경 없음, `bash -n`+help+preflight 회귀로 대체
- Negative test: 잘못된 environment, 없는 manifest, dirty tree에서 거부
- 서버 실전 테스트 완료 (2026-09-20, 승인済み):
  - `rollback` 선행 실행 → `previous` 없어 clean 실패 (exit 1, 무변경)
  - `deploy development <cf6f6ed manifest>` → pull·recreate·Healthy, `current → releases/cf6f6ed`
  - `test-bloggenius-cutover.sh development` 통과, public `dev`·`admin.dev` 200
  - `previous`는 첫 ops 배포라 자동 생성 안 됨 → 수동 `releases/5d487a1`로 보정, 유효 확인

## Remaining Risks and Follow-up

- `rollback` 성공 경로는 미검증 (다음 릴리스 때 `previous`가 살아있는 상태로 시험 가능)
- Production `promote`/`rollback`은 범위 밖
- CI 자동 배포는 서버 절차가 수동으로 증명된 뒤 별도 결정

## Result

`./ops deploy`/`rollback development` 구현·검증·실전 배포 완료. 운영 문서는
`deployment-quickstart.md`에 반영済み. 완료 기록의 archive 이동과 장기 결정 승격은
다음 정리 시점에 판단한다.
