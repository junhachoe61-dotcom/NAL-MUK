# CLAUDE.md — src/frontend (Next.js 프론트엔드)

상위 컨텍스트: [루트 CLAUDE.md](../../CLAUDE.md)

---

## 📌 이 디렉토리의 역할

Next.js 기반 프론트엔드 애플리케이션 코드를 관리합니다.  
**Static Site Generation(SSG)** 방식으로 빌드하여 S3 + CloudFront에 배포합니다.

```
src/frontend/
├── pages/            ← Next.js 라우트 (App Router 또는 Pages Router)
├── components/       ← React 컴포넌트
│   ├── ui/           ← 공통 UI 컴포넌트 (Button, Input, Modal 등)
│   ├── layout/       ← 레이아웃 컴포넌트 (Header, Footer, Sidebar)
│   └── features/     ← 기능별 컴포넌트 (UserProfile, ProductCard 등)
├── hooks/            ← 커스텀 React Hooks
├── lib/              ← 유틸리티, API 클라이언트, 상수
├── styles/           ← 글로벌 CSS, Tailwind 설정
└── public/           ← 정적 자산 (이미지, 아이콘 등)
```

---

## ⚡ 컴포넌트 작성 규칙

### 표준 컴포넌트 구조

```tsx
// components/features/UserCard/UserCard.tsx
import type { FC } from 'react';
import { cn } from '@/lib/utils';
import type { User } from '@/types/user';

interface UserCardProps {
  user: User;
  className?: string;
  onSelect?: (userId: string) => void;
}

// ✅ Named export 사용 (default export 금지)
export const UserCard: FC<UserCardProps> = ({ user, className, onSelect }) => {
  return (
    <div
      className={cn('rounded-lg border p-4', className)}
      onClick={() => onSelect?.(user.id)}
    >
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-sm text-muted-foreground">{user.email}</p>
    </div>
  );
};
```

### 파일 구조 규칙

```
components/features/UserCard/
├── UserCard.tsx          ← 컴포넌트 본체
├── UserCard.test.tsx     ← 테스트
├── UserCard.stories.tsx  ← Storybook (선택)
└── index.ts              ← 배럴 익스포트 (export { UserCard } from './UserCard')
```

---

## 🔗 API 통신 규칙

```typescript
// ✅ React Query + 중앙화된 API 클라이언트 사용
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => apiClient.get<User>(`/users/${userId}`),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// ❌ 금지: 컴포넌트 내부에서 fetch 직접 호출
useEffect(() => {
  fetch('/api/users/' + userId) // 금지!
}, []);
```

---

## 🎨 스타일링 규칙

- **Tailwind CSS** 사용 (인라인 스타일 금지)
- 커스텀 CSS: `styles/` 디렉토리에만 작성
- `cn()` 유틸리티로 조건부 클래스 처리
- 다크 모드: `dark:` 접두사로 모든 색상 컴포넌트에 대응

---

## 🚫 금지 사항

- `default export` 금지 → `named export` 사용
- `useEffect`로 API 직접 호출 금지 → React Query 사용
- 인라인 스타일(`style={{}}`) 금지 → Tailwind 클래스 사용
- `any` 타입 금지
- 컴포넌트 파일에 비즈니스 로직 혼재 금지 → 커스텀 훅으로 분리

---

## 📊 Core Web Vitals 목표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| LCP | < 2.5s | Lighthouse |
| FID/INP | < 100ms | Web Vitals |
| CLS | < 0.1 | Lighthouse |
| TTFB | < 600ms | WebPageTest |

---

## 🧪 테스트

```bash
# 컴포넌트 단위 테스트 (Testing Library)
npm run test:unit -- tests/unit/frontend

# E2E 테스트 (Playwright)
npm run test:e2e
```
