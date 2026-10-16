# CLAUDE.md — Claude Code 프로젝트 가이드

> 이 파일은 **Claude Code**가 프로젝트를 이해하고 올바르게 작업하기 위한 핵심 컨텍스트입니다.  
> Antigravity(AGY)와 Claude Code가 동시에 작업하는 환경에 최적화되어 있습니다.

---

## 🗺️ 프로젝트 한눈에 보기

| 항목 | 내용 |
|------|------|
| **프로젝트명** | SubTrack (구독 관리 서비스) |
| **목적** | Harness + Loop Engineering 기반 서버리스 웹 서비스 (구독 결제 관리 및 분석) |
| **주요 언어** | TypeScript (Node.js 20.x) |
| **패키지 매니저** | npm (lockfile: `package-lock.json`) |
| **CI/CD** | Harness Pipeline (`.harness/pipeline.yaml`) |
| **클라우드** | AWS (Lambda, API Gateway, DynamoDB, S3, CloudFront) |
| **IaC** | Terraform (`infrastructure/terraform/`) |
| **배포 도구** | Serverless Framework (`infrastructure/serverless.yml`) |

---

## 📂 디렉토리 구조 & 역할

```
p1/
├── CLAUDE.md                ← 지금 이 파일 (Claude Code용)
├── README.md                ← 프로젝트 개요
├── CONTRIBUTING.md          ← 기여 가이드 (커밋 컨벤션 포함)
├── CHANGELOG.md             ← 버전 변경 이력
├── .env.example             ← 환경 변수 템플릿
│
├── .harness/                ← Harness CI/CD 파이프라인 정의
│   ├── pipeline.yaml        ← 메인 파이프라인 (CI → DEV → STG → PROD)
│   ├── triggers.yaml        ← Git 트리거
│   └── templates/           ← 재사용 스텝 템플릿
│
├── src/
│   ├── frontend/            ← Next.js 프론트엔드 (SSG)
│   │   ├── pages/
│   │   ├── components/
│   │   └── styles/
│   └── functions/           ← AWS Lambda 서버리스 함수
│       ├── api/             ← HTTP API 핸들러
│       └── events/          ← 이벤트 기반 핸들러 (SQS, EventBridge)
│
├── infrastructure/
│   ├── terraform/           ← 인프라 코드 (IaC)
│   └── serverless.yml       ← Serverless Framework 설정
│
├── tests/
│   ├── unit/                ← 단위 테스트 (Jest)
│   ├── integration/         ← 통합 테스트
│   └── e2e/                 ← E2E 테스트 (Playwright)
│
└── docs/
    ├── ARCHITECTURE.md      ← 시스템 아키텍처
    ├── HARNESS_PIPELINE.md  ← Harness 파이프라인 가이드
    ├── LOOP_ENGINEERING.md  ← Loop Engineering 방법론
    └── API.md               ← REST API 명세
```

---

## ⚡ 주요 명령어

```bash
# 개발 서버
npm run dev              # Next.js 프론트엔드 개발 서버 (포트 3000)
npm run dev:lambda       # Lambda 함수 로컬 실행 (serverless-offline, 포트 3001)
npm run dev:all          # 프론트엔드 + 함수 동시 실행

# 테스트
npm run test             # 전체 테스트
npm run test:unit        # 단위 테스트만
npm run test:unit:watch  # 단위 테스트 watch 모드
npm run test:integration # 통합 테스트
npm run test:e2e         # E2E 테스트 (Playwright)
npm run test:coverage    # 커버리지 리포트 생성

# 빌드
npm run build            # 프론트엔드 빌드
npm run build:functions  # Lambda 함수 빌드
npm run package          # 배포 패키지 생성

# 코드 품질
npm run lint             # ESLint 검사
npm run lint:fix         # ESLint 자동 수정
npm run format           # Prettier 포맷팅
npm run typecheck        # TypeScript 타입 검사

# 인프라
npm run infra:plan       # Terraform 계획 확인
npm run infra:apply      # Terraform 적용
npm run deploy:dev       # DEV 환경 배포
npm run deploy:staging   # Staging 환경 배포

# 로컬 AWS 서비스
npm run localstack:up    # LocalStack 시작 (DynamoDB, S3, SQS)
npm run localstack:down  # LocalStack 종료
npm run db:setup:local   # 로컬 DynamoDB 테이블 생성
```

---

## 🏗️ 아키텍처 핵심 규칙

### Lambda 함수 작성 규칙

```typescript
// ✅ 표준 Lambda 핸들러 구조
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { createResponse, handleError } from '@/shared/utils/response';
import { validateInput } from '@/shared/utils/validation';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = validateInput(event.body, schema);
    const result = await someService.doSomething(body);
    return createResponse(200, result);
  } catch (error) {
    return handleError(error);
  }
};
```

### 에러 응답 형식 (RFC 7807)

```typescript
// 표준 에러 응답 — 이 형식에서 절대 벗어나지 말 것
{
  "type": "https://api.example.com/errors/{error-slug}",
  "title": "Human Readable Title",
  "status": 400,
  "detail": "구체적인 오류 설명",
  "instance": "/api/v1/resource/id",
  "traceId": "<X-Ray trace ID>"
}
```

### DynamoDB 접근 패턴

```typescript
// ✅ DynamoDB Document Client 사용 (AWS SDK v3)
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

// ❌ 직접 AWS.DynamoDB 사용 금지 (v2 SDK 사용 금지)
import AWS from 'aws-sdk'; // 금지!
```

---

## 📝 코딩 컨벤션

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수/함수 | camelCase | `getUserById`, `isActive` |
| 클래스/타입/인터페이스 | PascalCase | `UserService`, `ApiResponse` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Lambda 함수 ID | kebab-case | `get-user-by-id` |
| 파일명 | kebab-case | `user-service.ts` |
| 환경 변수 | UPPER_SNAKE_CASE | `DATABASE_URL` |
| DynamoDB 테이블 | `{prefix}-{env}-{resource}` | `p1-prod-users` |

### 임포트 순서 (자동 정렬 — 변경 금지)

```typescript
// 1. Node.js 내장
import path from 'path';

// 2. 외부 패키지
import { z } from 'zod';

// 3. 내부 절대 경로 (@/)
import { UserService } from '@/services/user-service';

// 4. 내부 상대 경로
import { helper } from './helper';

// 5. 타입 임포트
import type { User } from '@/types/user';
```

### 주석 규칙

- 코드 **자체**가 이유를 설명 못할 때만 주석 작성
- **왜(Why)** 를 설명, **무엇(What)** 은 코드가 설명
- JSDoc은 public API 함수에만 작성
- 기존 주석 및 docstring 보존 (수정 요청 없으면 절대 삭제 금지)

---

## 🧪 테스트 규칙

### 테스트 파일 위치

```
src/functions/api/user/handler.ts
tests/unit/functions/api/user/handler.test.ts   ← 단위 테스트
tests/integration/api/user.integration.test.ts  ← 통합 테스트
```

### 테스트 작성 패턴 (Given-When-Then)

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('유효한 이메일로 사용자를 생성하면 ID가 부여된 사용자를 반환한다', async () => {
      // Given
      const input = { email: 'test@example.com', name: '홍길동' };

      // When
      const result = await userService.createUser(input);

      // Then
      expect(result.id).toMatch(/^usr_/);
      expect(result.email).toBe(input.email);
    });
  });
});
```

### 커버리지 기준

| 유형 | 최소 기준 |
|------|-----------|
| 단위 테스트 전체 | **80%** |
| Lambda 핸들러 | **90%** |
| 유틸리티/공통 | **95%** |

---

## 🔀 Git & 브랜치 전략

### 브랜치 네이밍

```
feature/issue-{번호}-{설명}   예: feature/issue-42-user-auth
fix/issue-{번호}-{설명}       예: fix/issue-15-lambda-timeout
hotfix/issue-{번호}-{설명}    예: hotfix/issue-99-prod-crash
```

### 커밋 메시지 (Conventional Commits — 반드시 준수)

```
feat(scope): 한국어 또는 영어로 짧게
fix(scope): ...
docs(scope): ...
test(scope): ...
refactor(scope): ...
chore(scope): ...
```

**scope 예시**: `users`, `lambda`, `harness`, `terraform`, `frontend`, `api`

### PR 규칙

- `main` 직접 푸시 **금지** — 반드시 PR 경유
- PR 머지 전 **CI 파이프라인 통과** 필수
- 최소 **1명 리뷰 승인** 후 머지

---

## 🔒 보안 & 시크릿 규칙

> **절대 금지**: API 키, 비밀번호, 토큰을 코드 또는 커밋에 포함

```typescript
// ✅ 올바른 방법 — 환경 변수 또는 Harness Secret 참조
const apiKey = process.env.STRIPE_SECRET_KEY;

// ❌ 절대 금지 — 하드코딩
const apiKey = 'sk_live_xxxxxxxxxxxx';
```

- 모든 민감 정보: **Harness Secret Manager** 또는 **AWS Secrets Manager**
- `.env` 파일: Git 커밋 **절대 금지** (`.gitignore`에 포함됨)
- AWS IAM: **최소 권한 원칙** 적용 (Lambda 함수별 전용 Role)

---

## 🔄 Loop Engineering — AI 작업 지침

Claude Code 및 Antigravity가 Loop Engineering 사이클에 맞춰 작업할 때 따라야 할 지침:

### PLAN 단계에서 AI 역할
- 요구사항을 **작은 Lambda 단위**로 분해 제안
- Feature Flag 적용 가능 여부 검토
- 기존 코드의 기술 부채 식별

### BUILD 단계에서 AI 역할
- 표준 핸들러 구조 준수
- 단위 테스트 동시 작성
- 타입 안전성 보장 (any 사용 금지)

### DEPLOY 단계에서 AI 역할
- `.harness/pipeline.yaml` 수정 시 YAML 구문 검증
- Terraform 변경 시 `terraform plan` 출력 확인
- 환경 변수 누락 여부 체크

### MONITOR/FEEDBACK 단계에서 AI 역할
- CloudWatch 로그 패턴 분석
- DORA Metrics 개선 방향 제안
- 성능 병목 식별 (Cold Start, DB 쿼리)

---

## 🤝 Antigravity(AGY) + Claude Code 협업 규칙

두 AI 도구가 동시에 이 프로젝트를 작업할 때:

1. **파일 충돌 방지**: 같은 파일을 동시에 편집하지 않도록 작업 범위를 명확히 분리
2. **컨텍스트 공유**: 이 `CLAUDE.md`가 두 도구의 공통 컨텍스트
3. **작업 범위**:
   - `src/frontend/` → 주로 Next.js/React 작업
   - `src/functions/` → Lambda 함수 작업
   - `.harness/` → Harness 파이프라인 설정
   - `infrastructure/` → Terraform/IaC 작업
4. **변경 사항 기록**: 주요 변경 후 `CHANGELOG.md` 업데이트
5. **테스트 먼저**: 새 기능 구현 전 테스트 케이스 작성 권장 (TDD)

---

## 📚 참고 문서

| 문서 | 위치 |
|------|------|
| 아키텍처 설계 | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Harness 파이프라인 | [`docs/HARNESS_PIPELINE.md`](docs/HARNESS_PIPELINE.md) |
| Loop Engineering | [`docs/LOOP_ENGINEERING.md`](docs/LOOP_ENGINEERING.md) |
| API 명세 | [`docs/API.md`](docs/API.md) |
| 기여 가이드 | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| 환경 변수 | [`.env.example`](.env.example) |

---

## ❓ 자주 묻는 질문 (AI용 FAQ)

**Q: 새 Lambda 함수는 어디에 추가하나요?**  
A: `src/functions/api/{리소스명}/` 디렉토리를 생성하고 `handler.ts`를 작성하세요. `infrastructure/serverless.yml`에 함수를 등록해야 합니다.

**Q: 환경별 설정 차이는 어디서 관리하나요?**  
A: `.harness/environments/{env}.yaml`과 `infrastructure/terraform/environments/{env}.tfvars`에서 관리합니다.

**Q: 로컬에서 DynamoDB를 사용하려면?**  
A: `npm run localstack:up` 후 `npm run db:setup:local`을 실행하세요. `DYNAMODB_ENDPOINT=http://localhost:4566`을 `.env.local`에 설정하세요.

**Q: Harness 파이프라인을 로컬에서 테스트할 수 있나요?**  
A: `harness pipeline validate --pipeline-file .harness/pipeline.yaml`으로 YAML 유효성만 검사 가능합니다. 실제 실행은 Harness 플랫폼 필요.
