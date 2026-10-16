# 🤝 기여 가이드 (Contributing Guide)

> 본 프로젝트에 기여하기 전에 이 문서를 반드시 읽어주세요.

---

## 행동 강령 (Code of Conduct)

- 모든 기여자는 상호 존중하며 협력합니다.
- 건설적인 피드백을 제공하고, 비판은 코드에 집중합니다.
- 다양성과 포용성을 존중합니다.

---

## 🔄 개발 워크플로우

본 프로젝트는 **Loop Engineering** 방법론을 따릅니다.

### 1. 이슈 등록

새 기능이나 버그를 작업하기 전에 **GitHub Issues**에 이슈를 먼저 등록하세요.

```
이슈 유형:
  🐛 [BUG] 버그 리포트
  ✨ [FEAT] 새 기능 요청
  📚 [DOCS] 문서 개선
  ♻️  [REFACTOR] 리팩토링
  ⚡ [PERF] 성능 개선
  🔒 [SECURITY] 보안 이슈
```

### 2. 브랜치 생성

```bash
# 최신 develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 브랜치 네이밍 규칙
git checkout -b feature/issue-{번호}-{간략한-설명}
# 예: feature/issue-42-user-auth-integration

git checkout -b fix/issue-{번호}-{간략한-설명}
# 예: fix/issue-15-lambda-timeout-error

git checkout -b hotfix/issue-{번호}-{간략한-설명}
# 예: hotfix/issue-99-prod-memory-leak
```

### 3. 개발 및 커밋

**커밋 메시지 규칙** (Conventional Commits):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**타입:**
| 타입 | 설명 |
|------|------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 코드 스타일 변경 (기능 변경 없음) |
| `refactor` | 리팩토링 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드/의존성 업데이트 |
| `ci` | CI/CD 설정 변경 |

**예시:**
```bash
git commit -m "feat(users): 소셜 로그인 기능 추가 (Google OAuth)"
git commit -m "fix(lambda): cold start 시간 단축을 위한 초기화 최적화"
git commit -m "docs(harness): 파이프라인 가이드 업데이트"
```

### 4. Pull Request 생성

```markdown
## PR 제목 형식
[TYPE] 간략한 변경 내용 설명

## PR 설명 템플릿 (아래 항목을 채워주세요)

### 변경 내용
- 

### 관련 이슈
closes #

### 테스트 방법
1. 
2. 

### 체크리스트
- [ ] 단위 테스트 작성/수정 완료
- [ ] 통합 테스트 통과
- [ ] 문서 업데이트 (필요 시)
- [ ] CHANGELOG.md 업데이트
- [ ] 보안 이슈 없음 확인

### 스크린샷 (UI 변경 시)
```

---

## 🧪 테스트 가이드

### 테스트 종류 및 기준

```bash
# 1. 단위 테스트 (Unit Test)
npm run test:unit
# 커버리지 목표: 80% 이상

# 2. 통합 테스트 (Integration Test)
npm run test:integration
# Lambda + DynamoDB 통합 검증

# 3. E2E 테스트 (End-to-End)
npm run test:e2e
# 주요 사용자 시나리오 검증
```

### 테스트 작성 규칙

```javascript
// ✅ Good: 명확한 테스트 설명
describe('UserService', () => {
  describe('createUser', () => {
    it('유효한 입력으로 새 사용자를 생성해야 한다', async () => {
      // Given
      const input = { email: 'test@example.com', name: 'Test User' };
      
      // When
      const result = await userService.createUser(input);
      
      // Then
      expect(result.id).toBeDefined();
      expect(result.email).toBe(input.email);
    });

    it('중복 이메일로 생성 시 DuplicateEmailError를 던져야 한다', async () => {
      // ...
    });
  });
});

// ❌ Bad: 불명확한 테스트
test('테스트1', () => { ... });
```

---

## 📝 코드 스타일

### ESLint & Prettier

```bash
# 린트 검사
npm run lint

# 자동 수정
npm run lint:fix

# 포맷팅
npm run format
```

### 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수/함수 | camelCase | `getUserById`, `isActive` |
| 클래스/타입 | PascalCase | `UserService`, `ApiResponse` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Lambda 함수 | kebab-case | `get-user-by-id` |
| 파일명 | kebab-case | `user-service.ts` |
| 환경 변수 | UPPER_SNAKE_CASE | `DATABASE_URL` |

---

## 🚀 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone <repo-url>
cd p1

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local

# 4. 로컬 AWS 서비스 실행 (LocalStack)
docker compose up -d localstack

# 5. 로컬 DynamoDB 테이블 생성
npm run db:setup:local

# 6. 개발 서버 실행
npm run dev          # 프론트엔드
npm run dev:lambda   # 서버리스 함수 (serverless-offline)
```

---

## 🔒 보안 가이드라인

- **절대 금지**: API 키, 비밀번호, 토큰을 코드에 하드코딩
- 민감 정보는 반드시 **Harness Secret Manager** 또는 **AWS Secrets Manager** 사용
- `.env` 파일은 절대 커밋하지 않음 (`.gitignore`에 포함됨)
- 보안 이슈 발견 시 공개 이슈 대신 **security@example.com**으로 비공개 보고

---

## 📞 도움 받기

- **Slack**: `#p1-dev` 채널
- **이슈 트래커**: GitHub Issues
- **위키**: 프로젝트 Wiki
