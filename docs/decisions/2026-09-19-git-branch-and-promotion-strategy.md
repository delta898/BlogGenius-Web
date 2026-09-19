# Git Branch and Promotion Strategy

## Status

- Status: accepted
- Decided: `2026-09-19`

## Context

BlogGenius Web platform은 기능 개발, Development 통합, release 안정화와 Production 배포를 구분해야
한다. Desktop App과 유사한 고전적 branch 흐름을 사용하면서 AI와 사람이 각 branch의 책임과 배포
대상을 같은 의미로 이해해야 한다.

## Decision

장기 branch와 임시 branch를 다음과 같이 사용한다.

```text
feature/*
   -> dev
      -> release/vX.Y.Z
         -> main
```

- `main`: Production에 승인되어 배포된 source of truth
- `dev`: 다음 release를 위한 Development integration
- `feature/*`: `dev`에서 분기하는 작은 기능 또는 수정 단위
- `release/vX.Y.Z`: `dev`에서 분기하는 release 안정화 단위
- `hotfix/*`: 필요한 경우 `main`에서 분기하는 긴급 Production 수정

### Promotion

- Feature는 focused verification과 review 후 `dev`로 합친다.
- `dev`는 Development 환경에 배포한다.
- Release 준비 시 `release/vX.Y.Z`를 `dev`에서 만든다.
- Release branch에는 version, release note, 안정화와 release-only fix만 넣는다.
- 승인된 release를 `main`에 반영하고 tag한 뒤 Production에 배포한다.
- Release/hotfix에서 발생한 수정은 `dev`에 되돌려 합쳐 branch divergence를 막는다.

### Environment safety

- Branch 이름만으로 runtime environment를 암묵적으로 선택하지 않는다.
- CI가 branch eligibility, explicit target과 project identity를 함께 검사한다.
- Feature/PR preview는 Production Supabase와 Production secret에 접근할 수 없다.
- Production 배포는 `main`의 승인된 commit/tag만 대상으로 한다.

## Alternatives Considered

### Trunk-based development on `main`

Branch 수가 적고 승격이 단순하지만 사용자가 익숙한 Development/release 안정화 흐름과 맞지 않아
선택하지 않았다.

### Persistent `release` branch

Release 사이의 의미와 version 경계가 흐려지므로 versioned temporary release branch를 사용한다.

## Consequences

- Development와 Production의 source 상태를 명시적으로 구분할 수 있다.
- Release/hotfix 수정의 back-merge를 빠뜨리면 divergence가 생기므로 merge checklist가 필요하다.
- CI/CD는 branch만 믿지 않고 environment target과 Supabase project identity도 검증해야 한다.
