# Immutable Release Manifest

## Status

- Status: accepted
- Decided: `2026-09-20`

## Context

Development와 Production에서 image tag만 사용하면 같은 이름이 다른 artifact를
가리킬 수 있다. Branch와 environment만 기록해도 site와 admin이 같은 source
release에서 만들어졌는지, Development에서 검증한 artifact가 Production으로 그대로
승격됐는지 증명할 수 없다.

## Decision

각 release는 다음 다섯 필드만 가진 env 형식 manifest로 식별한다.

```text
RELEASE_SCHEMA_VERSION
DEPLOY_ENVIRONMENT
RELEASE_SHA
SITE_IMAGE
ADMIN_IMAGE
```

- `RELEASE_SHA`는 소문자 40자리 Git commit SHA다.
- 두 image는 승인된 GHCR repository와 `sha256` digest를 반드시 사용한다.
- mutable tag, 추가 key, 중복 key, 환경 불일치와 축약 SHA는 거부한다.
- manifest에는 secret이나 runtime credential을 넣지 않는다.
- Production은 Development에서 검증한 두 digest를 재빌드 없이 승격한다.

GitHub Actions의 외부 action도 release tag가 아니라 확인한 full commit SHA로
고정한다. 버전 주석은 사람이 update 후보를 식별하기 위한 정보일 뿐 실행 identity는
commit SHA다.

## Alternatives

### Mutable image tags

사람이 읽기 쉽지만 시간이 지나면 같은 manifest가 다른 image를 실행할 수 있어
선택하지 않았다. Tag는 검색 편의를 위해 함께 발행할 수 있지만 배포 input은 아니다.

### JSON manifest

더 풍부한 schema에는 유리하지만 현재 다섯 필드를 Compose가 직접 소비하려면 별도
변환 단계가 필요하다. 계약이 복잡해지면 JSON 및 signature 도입을 재검토한다.

### Branch name as release identity

Branch는 source 흐름을 나타낼 뿐 build artifact identity가 아니므로 선택하지 않았다.

## Consequences

- 배포, 상태 확인과 rollback이 동일한 site/admin digest 쌍을 사용한다.
- Manifest validator와 schema version을 호환성 계약으로 유지해야 한다.
- GHCR package pull 권한과 manifest artifact 보존 정책을 별도로 운영해야 한다.
- CI action update는 새 commit SHA 검토가 필요한 의식적인 변경이 된다.
