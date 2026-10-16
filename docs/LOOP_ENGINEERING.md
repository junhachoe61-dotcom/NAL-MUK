# 🔄 Loop Engineering 방법론

> Harness 기반 서버리스 프로젝트에 적용된 **Loop Engineering** 실천 가이드

---

## 개요

**Loop Engineering**은 지속적인 피드백 루프를 통해 소프트웨어를 반복적으로 개선하는 엔지니어링 방법론입니다.  
단순 CI/CD를 넘어, **계획 → 구현 → 배포 → 모니터링 → 피드백**의 순환을 자동화하고 체계화합니다.

---

## 🔁 Loop Engineering 사이클

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   📋 PLAN  ──►  🔨 BUILD  ──►  🚀 DEPLOY               │
│     ▲                                  │                │
│     │                                  ▼                │
│   📊 FEEDBACK  ◄──  👁️  MONITOR                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1️⃣ PLAN (계획)

| 항목 | 내용 |
|------|------|
| 목적 | 기능 요구사항 정의, 기술 부채 식별, 우선순위 결정 |
| 도구 | Harness Feature Flags, Jira, GitHub Issues |
| 산출물 | Sprint Backlog, Architecture Decision Records (ADR) |
| 주기 | 2주 스프린트 |

**주요 활동:**
- Feature Flag를 통한 점진적 릴리즈 계획 수립
- 이전 루프의 피드백 데이터 기반 우선순위 조정
- 서버리스 함수 단위 설계 (Single Responsibility)

---

### 2️⃣ BUILD (구현)

| 항목 | 내용 |
|------|------|
| 목적 | 코드 작성, 단위 테스트, 코드 리뷰 |
| 도구 | GitHub, Harness CI, SonarQube |
| 산출물 | Pull Request, Test Reports, Code Coverage |
| 브랜치 전략 | GitFlow (main / develop / feature / hotfix) |

**브랜치 전략:**
```
main          ←── 프로덕션 배포 브랜치
 └── develop  ←── 통합 개발 브랜치
      ├── feature/xxx  ←── 기능 개발
      ├── fix/xxx      ←── 버그 수정
      └── hotfix/xxx   ←── 긴급 수정
```

**코드 품질 게이트:**
- 단위 테스트 커버리지 ≥ 80%
- SonarQube Quality Gate 통과
- PR 최소 1명 리뷰 승인

---

### 3️⃣ DEPLOY (배포)

| 항목 | 내용 |
|------|------|
| 목적 | 자동화된 빌드 및 배포 |
| 도구 | Harness CD, Terraform, Serverless Framework |
| 배포 전략 | Canary / Blue-Green |
| 환경 | dev → staging → production |

**배포 흐름:**
```
코드 푸시
  │
  ▼
Harness CI 트리거
  │  ├── 린트 검사
  │  ├── 단위 테스트
  │  ├── 보안 스캔 (SAST)
  │  └── 빌드 & 패키징
  │
  ▼
스테이징 배포 (자동)
  │  └── 통합 테스트 실행
  │
  ▼
프로덕션 배포 (승인 후)
  │  ├── Canary: 10% → 50% → 100%
  │  └── Harness CV 자동 검증
  │
  ▼
배포 완료 알림
```

---

### 4️⃣ MONITOR (모니터링)

| 항목 | 내용 |
|------|------|
| 목적 | 서비스 상태 및 성능 실시간 모니터링 |
| 도구 | Harness CV, AWS CloudWatch, Datadog |
| 핵심 지표 | DORA Metrics (배포 빈도, 리드타임, MTTR, 변경 실패율) |

**모니터링 대시보드 핵심 지표:**

```
📊 비즈니스 지표
  - DAU / MAU
  - 전환율 (Conversion Rate)
  - 수익 지표

⚡ 기술 지표
  - Lambda 실행 시간 (p50, p95, p99)
  - API 오류율 (< 0.1% 목표)
  - Cold Start 발생률
  - 비용 (Lambda 호출 수 × 비용)

🔒 보안 지표
  - 비정상 API 호출 패턴
  - 인증 실패율
```

**DORA Metrics 목표:**

| 지표 | 현재 목표 | Elite 기준 |
|------|-----------|-----------|
| 배포 빈도 | 주 1회 이상 | 하루 여러 번 |
| 변경 리드타임 | < 1일 | < 1시간 |
| MTTR | < 1시간 | < 1시간 |
| 변경 실패율 | < 15% | < 5% |

---

### 5️⃣ FEEDBACK (피드백)

| 항목 | 내용 |
|------|------|
| 목적 | 데이터 기반 의사결정, 다음 루프 개선 방향 도출 |
| 도구 | Harness Analytics, PostHog, Sentry |
| 주기 | 스프린트 종료 시 회고 (Retrospective) |

**피드백 수집 채널:**
1. **자동화 피드백**: Harness CV 이상 감지 → 자동 롤백
2. **사용자 피드백**: 인앱 설문, NPS 점수
3. **개발팀 피드백**: 스프린트 회고, 페어 프로그래밍 인사이트
4. **시스템 피드백**: 에러 트래킹, 성능 분석

---

## 📏 Loop Engineering 원칙

### 원칙 1: Small & Frequent Releases
> 작고 자주 배포하라. 큰 변경은 위험을 키운다.

- 기능을 가능한 작은 단위로 분할
- Feature Flag로 불완전한 기능도 안전하게 배포
- 하루 최소 1회 메인 브랜치 머지 권장

### 원칙 2: Everything as Code
> 모든 것을 코드로 관리하라.

- 인프라: Terraform
- 파이프라인: Harness YAML
- 모니터링: 코드형 알림 규칙
- 보안 정책: OPA/Rego

### 원칙 3: Fail Fast, Recover Faster
> 빨리 실패하고, 더 빨리 복구하라.

- Canary 배포로 영향 범위 최소화
- 자동 롤백 트리거 설정
- MTTR 목표: 30분 이내

### 원칙 4: Data-Driven Decisions
> 데이터로 결정하라, 감으로 결정하지 마라.

- A/B 테스트 결과 기반 기능 롤아웃
- DORA Metrics 정기 리뷰
- 비용 최적화 데이터 주간 검토

---

## 🗓️ Loop 스케줄

| 루프 유형 | 주기 | 참여자 | 산출물 |
|-----------|------|--------|--------|
| 빌드 루프 | 커밋마다 | CI 자동 | 테스트 리포트 |
| 배포 루프 | 1일 1회 | CD 자동 + DevOps | 배포 리포트 |
| 기능 루프 | 2주 (스프린트) | 전체 팀 | 기능 릴리즈 노트 |
| 아키텍처 루프 | 분기 1회 | 시니어 + 아키텍트 | ADR 문서 |

---

## 📚 참고 자료

- [Harness 공식 문서](https://developer.harness.io/)
- [DORA Metrics 가이드](https://dora.dev/guides/dora-metrics-four-keys/)
- [Serverless Best Practices](https://www.serverless.com/blog/serverless-architecture-code-patterns)
- [Loop Engineering White Paper](https://harness.io/resources)
