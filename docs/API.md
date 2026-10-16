# 📡 API 명세서

> 서버리스 웹 프로젝트 REST API 문서

---

## 기본 정보

| 항목 | 내용 |
|------|------|
| Base URL (Dev) | `https://dev-api.example.com/v1` |
| Base URL (Staging) | `https://staging-api.example.com/v1` |
| Base URL (Prod) | `https://api.example.com/v1` |
| 인증 방식 | Bearer Token (JWT) |
| 콘텐츠 타입 | `application/json` |
| API 버전 | v1 |

---

## 🔐 인증

### 로그인

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### 토큰 갱신

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9..."
}
```

---

## 👤 사용자 API

### 사용자 목록 조회

```http
GET /users?limit=20&cursor=xxx
Authorization: Bearer {token}
```

**응답:**
```json
{
  "data": [
    {
      "id": "usr_01HNKQ...",
      "email": "user@example.com",
      "name": "홍길동",
      "role": "USER",
      "createdAt": "2026-10-16T05:00:00Z"
    }
  ],
  "pagination": {
    "nextCursor": "usr_01HNKQ...",
    "hasMore": true,
    "total": 150
  }
}
```

### 사용자 상세 조회

```http
GET /users/{userId}
Authorization: Bearer {token}
```

### 사용자 생성

```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "새 사용자",
  "role": "USER"
}
```

### 사용자 수정

```http
PATCH /users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "수정된 이름"
}
```

### 사용자 삭제

```http
DELETE /users/{userId}
Authorization: Bearer {token}
```

---

## 🏷️ HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 204 | 삭제 성공 (응답 본문 없음) |
| 400 | 잘못된 요청 (유효성 검사 실패) |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복 데이터) |
| 429 | 요청 한도 초과 |
| 500 | 서버 내부 오류 |

---

## ❌ 에러 응답 형식

RFC 7807 Problem Details 형식:

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The 'email' field must be a valid email address",
  "instance": "/api/v1/users",
  "errors": [
    {
      "field": "email",
      "message": "유효한 이메일 형식이 아닙니다"
    }
  ],
  "traceId": "01HNKQ9B7TXXXXX"
}
```

---

## 🚦 Rate Limiting

| 엔드포인트 | 제한 |
|------------|------|
| 인증 API | 10 req/min |
| 일반 API | 100 req/min |
| 관리자 API | 1000 req/min |

Rate Limit 초과 시 응답 헤더:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1697432460
Retry-After: 60
```

---

## 📄 페이지네이션

Cursor 기반 페이지네이션 사용:

```http
GET /users?limit=20&cursor=usr_01HNKQ...
```

| 파라미터 | 설명 | 기본값 | 최대값 |
|----------|------|--------|--------|
| `limit` | 페이지 당 항목 수 | 20 | 100 |
| `cursor` | 다음 페이지 커서 | - | - |
| `sort` | 정렬 필드 | `createdAt` | - |
| `order` | 정렬 방향 `asc`/`desc` | `desc` | - |
