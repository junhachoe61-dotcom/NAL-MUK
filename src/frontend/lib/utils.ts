import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CURRENCIES, CATEGORY_COLORS, type Currency } from './constants';

/** Tailwind 클래스 병합 유틸리티 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 통화 포맷팅 */
export function formatCurrency(amount: number, currency: Currency = 'KRW'): string {
  const curr = CURRENCIES.find((c) => c.value === currency);
  const symbol = curr?.symbol ?? '';

  if (currency === 'KRW' || currency === 'JPY') {
    return `${symbol}${amount.toLocaleString('ko-KR')}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

/** 월 환산 금액 계산 */
export function toMonthlyAmount(amount: number, cycle: string): number {
  switch (cycle) {
    case 'weekly': return amount * 4.345;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'biannual': return amount / 6;
    case 'yearly': return amount / 12;
    default: return amount;
  }
}

/** 다음 결제일까지 남은 일수 */
export function daysUntilBilling(nextBillingDate: string): number {
  return differenceInDays(parseISO(nextBillingDate), new Date());
}

/** 결제일 표시 텍스트 */
export function billingDaysText(days: number): string {
  if (days < 0) return '결제 완료';
  if (days === 0) return '오늘 결제';
  if (days === 1) return '내일 결제';
  return `${days}일 후 결제`;
}

/** 결제일 긴급도 색상 */
export function billingUrgencyColor(days: number): string {
  if (days <= 3) return 'text-red-500';
  if (days <= 7) return 'text-orange-500';
  return 'text-muted-foreground';
}

/** 날짜 포맷 (한국어) */
export function formatDate(date: string, fmt = 'yyyy년 MM월 dd일'): string {
  return format(parseISO(date), fmt, { locale: ko });
}

/** 카테고리 색상 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
}

/** ULID 생성 (클라이언트용 임시 ID) */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
