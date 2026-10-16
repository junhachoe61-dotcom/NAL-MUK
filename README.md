# 🚀 Serverless Web Project

> **Harness CI/CD + Loop Engineering** 기반 서버리스 웹 애플리케이션

---

## 📌 프로젝트 개요

본 프로젝트는 **Harness Pipeline**과 **Loop Engineering(지속적 피드백 루프)** 방법론을 결합하여, 빠르고 안정적인 서버리스 웹 서비스를 구현하는 것을 목표로 합니다.

| 항목 | 내용 |
|------|------|
| 아키텍처 | Serverless (FaaS + BaaS) |
| CI/CD | Harness Platform |
| 엔지니어링 방법론 | Loop Engineering (Plan → Build → Deploy → Monitor → Feedback → Plan) |
| 클라우드 | AWS Lambda / API Gateway (또는 GCP Cloud Functions) |
| 프론트엔드 | React / Next.js (Static Export) |
| IaC | Terraform / Serverless Framework |

---

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js (Static Site Generation)
- **Hosting**: AWS S3 + CloudFront / Vercel
- **State Management**: Zustand / React Query

### Backend (Serverless)
- **Runtime**: Node.js 20.x / Python 3.12
- **Functions**: AWS Lambda
- **API**: AWS API Gateway (REST / HTTP API)
- **Database**: DynamoDB / Aurora Serverless v2

### DevOps & CI/CD
- **CI/CD Platform**: [Harness](https://www.harness.io/)
- **IaC**: Terraform
- **Monitoring**: Harness Continuous Verification (CV)
- **Container Registry**: ECR / DockerHub

---

## 📂 디렉토리 구조

```
p1/
├── .harness/                  # Harness 파이프라인 정의
│   ├── pipeline.yaml          # 메인 파이프라인
│   ├── triggers.yaml          # 트리거 설정
│   └── templates/             # 재사용 가능한 스텝 템플릿
├── src/
│   ├── frontend/              # 프론트엔드 애플리케이션
│   │   ├── pages/
│   │   ├── components/
│   │   └── styles/
│   └── functions/             # 서버리스 함수
│       ├── api/
│       └── events/
├── infrastructure/
│   ├── terraform/             # IaC 코드
│   └── serverless.yml         # Serverless Framework 설정
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                      # 프로젝트 문서
│   ├── ARCHITECTURE.md
│   ├── LOOP_ENGINEERING.md
│   ├── HARNESS_PIPELINE.md
│   └── API.md
├── .harness/
├── README.md                  # 이 파일
├── CONTRIBUTING.md
├── CHANGELOG.md
└── .gitignore
```

---

## 🚦 빠른 시작

### 사전 요구사항

```bash
node >= 20.x
npm >= 10.x
terraform >= 1.6.x
serverless framework >= 3.x
harness CLI (optional)
```

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd p1

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 값 입력

# 4. 로컬 개발 서버 실행
npm run dev

# 5. 서버리스 함수 로컬 실행
npm run dev:functions
```

---

## 🔄 Loop Engineering 사이클

```
Plan → Build → Deploy → Monitor → Feedback → Plan (반복)
```

자세한 내용은 [LOOP_ENGINEERING.md](docs/LOOP_ENGINEERING.md)를 참고하세요.

---

## 🔧 Harness 파이프라인

CI/CD 파이프라인 구성에 대한 자세한 내용은 [HARNESS_PIPELINE.md](docs/HARNESS_PIPELINE.md)를 참고하세요.

---

## 📋 기여 가이드

[CONTRIBUTING.md](CONTRIBUTING.md)를 읽고 기여해주세요.

---

## 📝 변경 이력

[CHANGELOG.md](CHANGELOG.md)에서 버전별 변경 사항을 확인할 수 있습니다.

---

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
