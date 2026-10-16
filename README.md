# 🔖 SubTrack — 스마트 구독 서비스 관리 플랫폼

> **Harness CI/CD + Loop Engineering 방법론** 기반 서버리스 웹 애플리케이션  
> 흩어져 있는 구독 서비스(Netflix, Spotify, Adobe, ChatGPT 등)를 한곳에서 스마트하게 관리하고 분석하세요.

---

## 🌐 인터랙티브 라이브 데모 (웹 브라우저)
- **온라인 웹 프리뷰 바로가기**: [SubTrack 인터랙티브 프리뷰 열기](https://junhachoe61-dotcom.github.io/NAL-MUK/subtrack_preview.html)
- **로컬 데모 실행**: 저장소 내 [`subtrack_preview.html`](subtrack_preview.html) 또는 [`index.html`](index.html)을 더블 클릭하면 브라우저에서 즉시 작동합니다.

---

## 📱 주요 화면 및 기능

```
┌────────────────────────────────────────────────────────────────────────┐
│  🔖 SubTrack       [ 📊 대시보드 ] [ 💳 구독 관리 ] [ 📅 캘린더 ] [ 📈 지출 분석 ] [ 🔔 알림 ]  │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. 📊 메인 대시보드 (`/dashboard`)
- **월 지출 집계**: 이번 달 총 구독 지출 금액 및 전월 대비 증감률 자동 계산
- **D-Day 결제 알림**: 7일 이내 도래하는 결제 건수 실시간 경고
- **카테고리별 비중**: 엔터테인먼트, 음악, 업무/생산성, 쇼핑 등 지출 분포 요약
- **다가오는 결제 타임라인**: 결제일순 정렬된 최근 결제 예정 카드

### 2. 💳 구독 관리 (`/subscriptions`)
- **카드 뷰 ↔ 테이블 뷰**: 원하는 보기 방식으로 원클릭 토글 전환
- **실시간 검색 & 필터**: 서비스명/메모 검색, 카테고리별 필터링, 금액/결제일순 정렬
- **⚡ QuickAdd 원클릭 등록**: Netflix, Spotify, YouTube, Coupang, Adobe, ChatGPT Plus 클릭 시 자동완성
- **상세 및 수정/삭제**: 구독 주기, 결제 수단, 사전 알림 일수(D-3, D-1) 설정

### 3. 📅 결제 캘린더 (`/calendar`)
- **월별 달력 그리드**: 날짜별 결제 건수 배지 및 서비스 태그 시각화
- **일정 상세 패널**: 달력의 특정 일자 클릭 시 해당 일자의 결제 목록 및 금액 표시

### 4. 📈 지출 분석 (`/analytics`)
- **최근 6개월 지출 추이 막대 그래프**: 월별 지출 증감 트렌드 시각화
- **카테고리별 점유율 바**: 분야별 지출 비중 분석
- **💡 Loop Engineering 스마트 절약 인사이트**: 중복 구독 발견 및 고정비 절감 팁 제공

### 5. 🔔 알림 센터 (`/notifications`)
- 결제일 D-3 사전 경고 알림 생성 (EventBridge 매일 오전 9시 자동 스케줄러)
- 신규 알림 배지 및 읽음/미확인 상태 관리

---

## 🏗️ 시스템 아키텍처

```
[사용자 브라우저]
      │
      ▼
[CloudFront CDN] ────► [S3 호스팅] (Next.js 15 SSG)
      │
      ▼
[AWS API Gateway HTTP API (v2)]
      │
      ├─────────────────┬─────────────────┬─────────────────┐
      ▼                 ▼                 ▼                 ▼
[λ Auth 핸들러]   [λ 구독 CRUD 핸들러]  [λ 분석 핸들러]    [λ 설정/알림 핸들러]
  (JWT 발급/검증)   (추가/목록/수정/삭제) (6개월 추이/비중)  (통화설정/알림센터)
      │                 │                 │                 │
      └─────────────────┴────────┬────────┴─────────────────┘
                                 │
                                 ▼
                     [Amazon DynamoDB (Single Table)]
                     - PK: USER#{userId}
                     - SK: PROFILE | SUB#{id} | NOTIF#{id}
                     - GSI1: 결제일 정렬
                     - GSI2: 카테고리/금액 정렬
                                 ▲
                                 │
                   [EventBridge Cron (매일 오전 9시)]
                                 │
                     [λ Billing Notifier 배치]
```

---

## 🗄️ DynamoDB Single Table 스키마

| PK | SK | GSI1PK / GSI1SK | GSI2PK / GSI2SK | 데이터 설명 |
|----|----|-----------------|-----------------|------------|
| `USER#{userId}` | `PROFILE` | - | - | 사용자 계정 및 비밀번호 해시 |
| `USER#{userId}` | `SUB#{subId}` | `SUB#{subId}` / `NEXT_BILLING#2026-10-20` | `USER#{userId}#CAT#entertainment` / `AMOUNT#0000017000` | 개별 구독 서비스 정보 |
| `USER#{userId}` | `NOTIF#{notifId}` | - | - | 결제일 사전 알림 데이터 |
| `USER#{userId}` | `SETTINGS` | - | - | 기본 통화, 이메일 알림 수신 설정 |

---

## 🔧 Harness CI/CD 파이프라인

본 프로젝트는 **Loop Engineering 방법론**에 따라 Harness 파이프라인으로 배포됩니다:

```
[Git Push (main/develop)]
         │
         ▼
 ┌───────────────┐
 │ 1. Build & CI │  ← Lint 검사, 단위 테스트, Next.js 빌드
 └───────┬───────┘
         ▼
 ┌───────────────┐
 │ 2. Deploy DEV │  ← 개발 환경 Serverless Lambda 배포
 └───────┬───────┘
         ▼
 ┌───────────────┐
 │ 3. Staging    │  ← 스테이징 통합 테스트
 └───────┬───────┘
         ▼
 ┌───────────────┐
 │ 4. Prod Canary│  ← 10% Canary 배포 → Harness CV 이상 감지 → 100% 트래픽 승격
 └───────────────┘
```

---

## 📂 프로젝트 디렉토리 구조

```
p1/
├── index.html                           ← GitHub Pages 메인 엔트리
├── subtrack_preview.html                ← 브라우저 실행용 인터랙티브 웹 프리뷰
├── CLAUDE.md                            ← AI 페어 프로그래밍 협업 컨텍스트
│
├── .harness/
│   ├── pipeline.yaml                    ← CI 빌드 → Dev → Staging → Prod Canary(10%)+CV+100%
│   └── triggers.yaml                    ← GitHub Push Webhook 트리거
│
├── infrastructure/
│   ├── serverless.yml                   ← API Gateway + 11개 Lambda + Cron 스케줄 라우팅
│   └── terraform/
│       ├── main.tf                      ← Terraform AWS 프로바이더 및 백엔드
│       └── dynamodb.tf                  ← DynamoDB Single Table (GSI1, GSI2)
│
├── src/
│   ├── functions/                       ← AWS Lambda 서버리스 백엔드
│   │   ├── shared/                      ← JWT 인증, Zod 검증, RFC 7807 응답, DynamoDB 클라이언트
│   │   ├── api/auth/                    ← 회원가입, 로그인, 토큰 재발급
│   │   ├── api/subscriptions/           ← 구독 등록, 목록/통계, 상세, 수정, 삭제
│   │   ├── api/analytics/               ← 요약 지표, 6개월 추이, 카테고리 비중
│   │   ├── api/settings/                ← 기준 통화 설정 및 알림 수신
│   │   ├── api/notifications/           ← 알림 목록 및 읽음 처리
│   │   └── events/                      ← EventBridge 매일 결제 사전 알림 배치
│   │
│   └── frontend/app/                    ← Next.js 15 App Router 프론트엔드
│       ├── page.tsx                     ← 서비스 소개 랜딩 페이지
│       ├── (auth)/login, register       ← 로그인 / 회원가입 페이지
│       └── (dashboard)/
│           ├── dashboard/               ← 메인 요약 대시보드
│           ├── subscriptions/           ← 구독 목록(카드/테이블), QuickAdd 추가, 상세/수정
│           ├── analytics/               ← 6개월 지출 추이 및 카테고리 비중
│           ├── calendar/                ← 월별 결제일 달력 및 일정 상세 패널
│           ├── notifications/           ← 알림 센터
│           └── settings/                ← 환경 설정
│
└── docs/                                ← 아키텍처, 파이프라인, Loop Engineering, API 문서
```

---

## 🚦 로컬 실행 가이드

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 프론트엔드 실행
npm run dev

# 3. 로컬 서버리스 API 실행
npm run dev:lambda

# 4. 브라우저에서 인터랙티브 프리뷰 즉시 열기
# subtrack_preview.html 파일을 더블 클릭하거나 브라우저로 엽니다.
```

---

## 📄 라이선스
MIT License
