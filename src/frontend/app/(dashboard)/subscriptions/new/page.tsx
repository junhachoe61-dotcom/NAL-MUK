'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { SERVICE_CATALOG, SUBSCRIPTION_CATEGORIES, BILLING_CYCLES, CURRENCIES, NOTIFY_DAYS_OPTIONS } from '@/lib/constants';

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('entertainment');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState('KRW');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(3);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 퀵 선택 시 자동 완성
  const handleSelectService = (service: typeof SERVICE_CATALOG[number]) => {
    setName(service.name);
    setCategory(service.category);
    setAmount(service.defaultAmount);
    setCurrency(service.currency);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('금액을 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('/subscriptions', {
        name,
        category,
        amount: Number(amount),
        currency,
        billingCycle,
        nextBillingDate,
        notifyDaysBefore: Number(notifyDaysBefore),
        memo,
      });

      router.push('/subscriptions');
    } catch (err: any) {
      setError(err.response?.data?.detail || '구독 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/subscriptions" className="text-sm text-muted-foreground hover:text-foreground">
          ← 구독 목록으로 돌아가기
        </Link>
        <h1 className="text-xl font-bold">새 구독 등록</h1>
      </div>

      {/* 빠른 선택 칩 */}
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">⚡ 빠른 선택 (인기 구독 서비스)</div>
        <div className="flex flex-wrap gap-2">
          {SERVICE_CATALOG.slice(0, 10).map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => handleSelectService(s)}
              className="rounded-full border bg-muted/40 hover:bg-primary hover:text-primary-foreground px-3 py-1 text-xs font-medium transition-colors"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">서비스명 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="예: Netflix, Spotify"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">카테고리 *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {SUBSCRIPTION_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">결제 주기 *</label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {BILLING_CYCLES.map((cycle) => (
                <option key={cycle.value} value={cycle.value}>
                  {cycle.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">결제 금액 *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              required
              min="0"
              placeholder="예: 17000"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">통화 *</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.value} value={curr.value}>
                  {curr.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">다음 결제일 *</label>
            <input
              type="date"
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">알림 설정</label>
            <select
              value={notifyDaysBefore}
              onChange={(e) => setNotifyDaysBefore(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {NOTIFY_DAYS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">메모 (선택사항)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="결제 수단, 함께 쓰는 사람, 플랜 정보 등"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/subscriptions"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? '저장 중...' : '구독 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
