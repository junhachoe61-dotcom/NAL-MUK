# CLAUDE.md — src/functions (Lambda 함수 디렉토리)

상위 컨텍스트: [루트 CLAUDE.md](../../CLAUDE.md)

---

## 📌 이 디렉토리의 역할

AWS Lambda 서버리스 함수 소스코드를 관리합니다.

```
src/functions/
├── api/              ← API Gateway → Lambda 핸들러 (HTTP 요청 처리)
│   ├── users/        ← /users 엔드포인트
│   ├── products/     ← /products 엔드포인트
│   └── orders/       ← /orders 엔드포인트
├── events/           ← 이벤트 기반 함수 (SQS, EventBridge, DynamoDB Stream)
└── shared/           ← 공통 유틸리티 (response, validation, logger)
```

---

## ⚡ Lambda 함수 표준 구조

### 새 API 핸들러 생성 템플릿

```typescript
// src/functions/api/{resource}/handler.ts
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { createResponse, handleError } from '@shared/utils/response';
import { validate } from '@shared/utils/validation';
import { logger } from '@shared/utils/logger';
import { ResourceService } from './service';

const service = new ResourceService();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  // Lambda 컨테이너 재사용 최적화
  context.callbackWaitsForEmptyEventLoop = false;

  logger.info('요청 수신', {
    path: event.rawPath,
    method: event.requestContext.http.method,
  });

  try {
    const body = validate(event.body, requestSchema);
    const result = await service.execute(body);
    return createResponse(200, result);
  } catch (error) {
    return handleError(error);
  }
};
```

---

## 🚫 금지 사항

- `any` 타입 사용 금지 → `unknown` 사용 후 타입 가드 적용
- AWS SDK v2 (`aws-sdk`) 사용 금지 → AWS SDK v3 (`@aws-sdk/*`) 사용
- 함수 내부에서 다른 Lambda를 직접 호출 금지 → SQS/EventBridge 경유
- DB 연결을 핸들러 함수 **내부**에서 생성 금지 → 핸들러 **외부** 모듈 레벨에서 생성 (재사용)
- `console.log` 직접 사용 금지 → `logger` 유틸리티 사용

---

## ⚠️ Cold Start 최소화 전략

```typescript
// ✅ 모듈 레벨 초기화 (컨테이너 재사용 시 재실행 안 됨)
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// 핸들러 외부 — Cold Start 시 1회만 실행
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event) => {
  // 여기서는 이미 초기화된 클라이언트 재사용
  const result = await dynamoClient.send(...);
};
```

---

## 📏 함수 크기 제한

| 환경 | 메모리 | 타임아웃 |
|------|--------|---------|
| API 함수 | 512MB | 30초 |
| 이벤트 함수 | 1024MB | 5분 |
| 대용량 처리 | 3008MB | 15분 |

---

## 🧪 이 디렉토리의 테스트

```bash
# 이 디렉토리 관련 테스트만 실행
npm run test:unit -- tests/unit/functions
npm run test:integration -- tests/integration/functions
```
