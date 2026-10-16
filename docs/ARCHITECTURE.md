# 🏛️ 아키텍처 설계서

> 서버리스 웹 프로젝트 시스템 아키텍처 문서

---

## 아키텍처 개요

### 설계 원칙

1. **Serverless First**: 서버 관리 불필요, 이벤트 기반 실행
2. **Decoupled Architecture**: 마이크로서비스 수준의 함수 분리
3. **Infrastructure as Code**: 모든 인프라 코드화 (Terraform)
4. **Zero Trust Security**: 최소 권한 원칙 적용
5. **Cost Optimization**: 사용량 기반 과금으로 비용 효율화

---

## 🗺️ 시스템 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                          사용자 (Client)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS CloudFront (CDN)                          │
│           - 글로벌 엣지 캐싱 / SSL/TLS 종료                        │
└──────────┬──────────────────────────────────┬───────────────────┘
           │ 정적 파일                           │ API 요청
           ▼                                   ▼
┌──────────────────┐               ┌─────────────────────────────┐
│   AWS S3         │               │    AWS API Gateway          │
│  (정적 자산 호스팅) │               │   (HTTP API / REST API)     │
│  - HTML/CSS/JS   │               │   - Rate Limiting           │
│  - 이미지/폰트    │               │   - Auth (JWT/Cognito)      │
└──────────────────┘               └──────────────┬──────────────┘
                                                  │ Lambda 호출
                    ┌─────────────────────────────┼──────────────────────┐
                    │                             │                      │
                    ▼                             ▼                      ▼
          ┌─────────────────┐         ┌──────────────────┐    ┌──────────────────┐
          │  Lambda: Users  │         │  Lambda: Products│    │  Lambda: Orders  │
          │  - 사용자 CRUD   │         │  - 상품 관리      │    │  - 주문 처리      │
          │  - 인증/인가     │         │  - 재고 관리      │    │  - 결제 연동      │
          └────────┬────────┘         └────────┬─────────┘    └────────┬─────────┘
                   │                           │                       │
                   └───────────────────────────┼───────────────────────┘
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         │                     │                     │
                         ▼                     ▼                     ▼
               ┌──────────────┐    ┌───────────────────┐   ┌──────────────────┐
               │  DynamoDB    │    │  Aurora Serverless │   │  ElastiCache     │
               │  (NoSQL)     │    │  (MySQL - 복잡 쿼리)│   │  (Redis 캐싱)    │
               │  - 세션/캐시  │    │  - 트랜잭션 처리   │   │  - API 캐싱      │
               └──────────────┘    └───────────────────┘   └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    공통 인프라 서비스                               │
│   AWS Cognito   │  AWS SQS/SNS  │  AWS EventBridge  │  AWS SES  │
│   (사용자 인증)  │  (메시지 큐)   │  (이벤트 라우팅)    │  (이메일)  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    모니터링 & 옵저버빌리티                           │
│   CloudWatch  │  X-Ray (트레이싱)  │  Harness CV  │  Datadog    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 데이터 아키텍처

### 데이터 저장소 선택 기준

| 데이터 유형 | 저장소 | 이유 |
|------------|--------|------|
| 사용자 세션 | DynamoDB | 빠른 읽기/쓰기, TTL 지원 |
| 사용자 프로필 | Aurora Serverless | 복잡한 쿼리, 관계형 |
| 상품 카탈로그 | DynamoDB | 고가용성, 빠른 조회 |
| 주문/결제 | Aurora Serverless | ACID 트랜잭션 필요 |
| 캐시 | ElastiCache (Redis) | 밀리초 응답 |
| 파일/미디어 | S3 | 대용량 객체 저장 |
| 이벤트 로그 | DynamoDB Streams → S3 | 감사 추적 |

### 데이터 흐름

```
사용자 요청
    │
    ▼
API Gateway → Lambda → Cache 확인 (Redis)
                    │
                    ├── 캐시 히트 → 즉시 반환
                    │
                    └── 캐시 미스 → DB 조회 → 캐시 업데이트 → 반환
```

---

## 🔐 보안 아키텍처

### 인증/인가 흐름

```
1. 사용자 로그인
   └── Amazon Cognito User Pool → JWT Access Token 발급

2. API 요청
   └── Authorization: Bearer <JWT>
       └── API Gateway → JWT 검증 → Lambda 실행
           └── Lambda → 역할 기반 권한 확인 (RBAC)

3. 서비스 간 통신
   └── IAM Role 기반 (최소 권한 원칙)
```

### 보안 레이어

| 레이어 | 보안 조치 |
|--------|----------|
| CDN | DDoS 방어, WAF, TLS 1.3 강제 |
| API Gateway | Rate Limiting, API Key, OAuth2 |
| Lambda | VPC 격리, 환경변수 암호화 (KMS) |
| 데이터베이스 | 저장 암호화, VPC 내 접근 제한 |
| 코드 | SAST (Harness), DAST (OWASP ZAP) |

---

## ⚡ 성능 최적화 전략

### Lambda 최적화

```
1. Cold Start 최소화
   - Lambda SnapStart (Java 사용 시)
   - Provisioned Concurrency (핵심 함수)
   - 함수 크기 최소화 (Tree Shaking, 번들 최적화)

2. 메모리 최적화
   - AWS Lambda Power Tuning으로 최적 메모리 탐색
   - 일반 API: 512MB
   - 데이터 처리: 1024MB~3008MB

3. 실행 시간 최적화
   - DB 연결 풀 재사용 (RDS Proxy)
   - 병렬 비동기 처리
   - 캐싱 레이어 활용
```

### 프론트엔드 최적화

```
1. 번들 크기
   - Code Splitting (동적 import)
   - Tree Shaking
   - 이미지 최적화 (WebP, AVIF)

2. 캐싱
   - CloudFront: 정적 자산 1년 캐시
   - API 응답: Cache-Control 헤더 설정
   - SWR/React Query로 클라이언트 캐싱

3. Core Web Vitals 목표
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1
```

---

## 📦 배포 환경

### 환경별 설정

| 구분 | Dev | Staging | Production |
|------|-----|---------|------------|
| Lambda 메모리 | 256MB | 512MB | 1024MB |
| Lambda 동시성 | 제한 없음 | 10 | 100 |
| DB 인스턴스 | DynamoDB On-Demand | Aurora Serverless v2 (최소) | Aurora Serverless v2 (자동 확장) |
| CDN | 없음 | CloudFront (제한) | CloudFront (글로벌) |
| WAF | 없음 | 기본 규칙 | 전체 규칙 |
| 로그 보존 | 7일 | 30일 | 90일 |

---

## 🌐 API 설계 원칙

- **RESTful**: 자원 중심 API 설계
- **버전 관리**: `/api/v1/`, `/api/v2/`
- **페이지네이션**: Cursor 기반 (DynamoDB 최적화)
- **에러 응답 표준화**: RFC 7807 Problem Details

```json
// 표준 에러 응답 형식
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "User with id '123' was not found",
  "instance": "/api/v1/users/123",
  "traceId": "abc-123-xyz"
}
```

자세한 API 명세는 [API.md](API.md)를 참고하세요.

---

## 📋 Architecture Decision Records (ADR)

| ADR | 제목 | 상태 | 날짜 |
|-----|------|------|------|
| ADR-001 | AWS Lambda vs Container | 승인됨 | 2026-10-01 |
| ADR-002 | DynamoDB vs RDS | 승인됨 | 2026-10-05 |
| ADR-003 | Next.js SSG vs SSR | 승인됨 | 2026-10-08 |
| ADR-004 | Harness vs GitHub Actions | 승인됨 | 2026-10-10 |

---

## 🔍 운영 체크리스트

### 배포 전 체크리스트
- [ ] 모든 테스트 통과
- [ ] 보안 스캔 이슈 해소
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 계획
- [ ] 롤백 계획 수립

### 배포 후 체크리스트
- [ ] Harness CV 검증 통과
- [ ] Lambda 에러율 정상 범위
- [ ] API 응답 시간 정상
- [ ] 알림 설정 확인
- [ ] 배포 노트 작성 (CHANGELOG.md 업데이트)
