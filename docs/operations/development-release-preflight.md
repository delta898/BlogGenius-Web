# Development Release Preflight

## Current Boundary

이 절차는 release manifest와 Oracle application Compose 계약을 검증한다. 현재
`./ops deploy`는 없으며 SSH, GHCR push, Caddy 변경 또는 public traffic 전환을
수행하지 않는다.

## CI Publication

`dev`에 push된 commit은 `Publish Development Images` workflow의 대상이다.
Workflow는 application validation 후 다음을 수행하도록 정의되어 있다.

1. site/admin `linux/amd64` image build
2. GHCR에 commit 기반 tag 발행
3. 두 image의 registry digest 수집
4. immutable `development.release.env` 생성 및 재검증
5. 30일 보존 workflow artifact로 manifest 업로드

Workflow는 `contents: read`, `packages: write`만 요청하며 모든 외부 action은
full commit SHA로 고정되어 있다. 실제 workflow 실행은 feature가 `dev`에 병합되고
원격으로 push된 뒤에만 발생한다.

## Local Contract Verification

```bash
./ops manifest verify deployment/examples/development.release.env development
./ops preflight development deployment/examples/development.release.env --check-only
```

Example manifest의 SHA와 digest는 형식 검증 전용이며 실제 배포 artifact가 아니다.
`--check-only`는 manifest와 Compose render만 검사하고 branch/SHA eligibility를
의도적으로 생략한다.

실제 release manifest를 받은 뒤 `--check-only` 없이 preflight하면 다음 조건을
추가로 확인한다.

- 현재 branch가 정확히 `dev`
- working tree가 clean
- manifest의 full `RELEASE_SHA`가 현재 HEAD와 일치
- manifest environment가 `development`
- image가 승인된 GHCR 경로의 immutable digest

이 명령도 배포를 실행하지 않는다.

## Required Infrastructure Follow-up

OracleWebInfra에서 별도 검증·승인 후 다음이 준비되어야 한다.

- 외부 Docker network `oracle-web-edge`
- Caddy의 네 stable alias reverse proxy
- GHCR pull credential의 server-local 보관
- application release directory와 current/previous rollback state

준비 전까지 기존 static webroot route가 canonical 동작이며 application container를
public host에 연결하면 안 된다.
