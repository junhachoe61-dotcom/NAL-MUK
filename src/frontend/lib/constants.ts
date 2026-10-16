// 구독 카테고리
export const SUBSCRIPTION_CATEGORIES = [
  { value: 'entertainment', label: '엔터테인먼트', emoji: '🎬' },
  { value: 'music', label: '음악', emoji: '🎵' },
  { value: 'productivity', label: '업무/생산성', emoji: '💼' },
  { value: 'cloud', label: '클라우드/스토리지', emoji: '☁️' },
  { value: 'education', label: '교육', emoji: '📚' },
  { value: 'health', label: '건강/피트니스', emoji: '💪' },
  { value: 'news', label: '뉴스/미디어', emoji: '📰' },
  { value: 'gaming', label: '게임', emoji: '🎮' },
  { value: 'finance', label: '금융', emoji: '💰' },
  { value: 'shopping', label: '쇼핑', emoji: '🛍️' },
  { value: 'other', label: '기타', emoji: '📦' },
] as const;

export type SubscriptionCategory = typeof SUBSCRIPTION_CATEGORIES[number]['value'];

// 결제 주기
export const BILLING_CYCLES = [
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'quarterly', label: '분기 (3개월)' },
  { value: 'biannual', label: '반기 (6개월)' },
  { value: 'yearly', label: '매년' },
] as const;

export type BillingCycle = typeof BILLING_CYCLES[number]['value'];

// 지원 통화
export const CURRENCIES = [
  { value: 'KRW', label: '한국 원 (₩)', symbol: '₩' },
  { value: 'USD', label: '미국 달러 ($)', symbol: '$' },
  { value: 'EUR', label: '유로 (€)', symbol: '€' },
  { value: 'JPY', label: '일본 엔 (¥)', symbol: '¥' },
  { value: 'GBP', label: '영국 파운드 (£)', symbol: '£' },
] as const;

export type Currency = typeof CURRENCIES[number]['value'];

// 알림 사전 일수
export const NOTIFY_DAYS_OPTIONS = [
  { value: 1, label: '1일 전' },
  { value: 3, label: '3일 전' },
  { value: 7, label: '7일 전' },
  { value: 14, label: '14일 전' },
  { value: 0, label: '알림 안함' },
] as const;

// 인기 구독 서비스 카탈로그
export const SERVICE_CATALOG = [
  { name: 'Netflix', category: 'entertainment', logoUrl: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico', defaultAmount: 17000, currency: 'KRW' },
  { name: 'Spotify', category: 'music', logoUrl: 'https://www.spotify.com/favicon.ico', defaultAmount: 10900, currency: 'KRW' },
  { name: 'YouTube Premium', category: 'entertainment', logoUrl: 'https://www.youtube.com/favicon.ico', defaultAmount: 14900, currency: 'KRW' },
  { name: 'Apple Music', category: 'music', logoUrl: 'https://www.apple.com/favicon.ico', defaultAmount: 9000, currency: 'KRW' },
  { name: 'Adobe Creative Cloud', category: 'productivity', logoUrl: 'https://www.adobe.com/favicon.ico', defaultAmount: 62000, currency: 'KRW' },
  { name: 'Microsoft 365', category: 'productivity', logoUrl: 'https://www.microsoft.com/favicon.ico', defaultAmount: 9900, currency: 'KRW' },
  { name: 'ChatGPT Plus', category: 'productivity', logoUrl: 'https://openai.com/favicon.ico', defaultAmount: 20, currency: 'USD' },
  { name: 'Google One', category: 'cloud', logoUrl: 'https://www.google.com/favicon.ico', defaultAmount: 3900, currency: 'KRW' },
  { name: 'iCloud+', category: 'cloud', logoUrl: 'https://www.apple.com/favicon.ico', defaultAmount: 1200, currency: 'KRW' },
  { name: 'Notion', category: 'productivity', logoUrl: 'https://www.notion.so/favicon.ico', defaultAmount: 16, currency: 'USD' },
  { name: 'Figma', category: 'productivity', logoUrl: 'https://www.figma.com/favicon.ico', defaultAmount: 15, currency: 'USD' },
  { name: 'GitHub', category: 'productivity', logoUrl: 'https://github.com/favicon.ico', defaultAmount: 4, currency: 'USD' },
  { name: 'Disney+', category: 'entertainment', logoUrl: 'https://www.disneyplus.com/favicon.ico', defaultAmount: 9900, currency: 'KRW' },
  { name: 'Coupang Play', category: 'entertainment', logoUrl: 'https://www.coupang.com/favicon.ico', defaultAmount: 7900, currency: 'KRW' },
  { name: 'Watcha', category: 'entertainment', logoUrl: 'https://www.watcha.com/favicon.ico', defaultAmount: 7900, currency: 'KRW' },
] as const;

// 카테고리 색상
export const CATEGORY_COLORS: Record<string, string> = {
  entertainment: '#8b5cf6',
  music: '#ec4899',
  productivity: '#3b82f6',
  cloud: '#06b6d4',
  education: '#f59e0b',
  health: '#10b981',
  news: '#6b7280',
  gaming: '#ef4444',
  finance: '#84cc16',
  shopping: '#f97316',
  other: '#94a3b8',
};

// API 기본 URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';
