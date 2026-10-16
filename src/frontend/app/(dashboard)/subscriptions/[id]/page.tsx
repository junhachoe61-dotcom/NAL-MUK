'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, daysUntilBilling, billingDaysText, billingUrgencyColor } from '@/lib/utils';
import { SUBSCRIPTION_CATEGORIES, BILLING_CYCLES, CURRENCIES, NOTIFY_DAYS_OPTIONS } from '@/lib/constants';
import type { Subscription } from '@/types/subscription';

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const subId = resolvedParams.id;
  const router = useRouter();

  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 수정 필드
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('entertainment');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState('KRW');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [status, setStatus] = useState<'active' | 'paused' | 'cancelled'>('active');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(3);
  const [memo, setMemo] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [subId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/subscriptions/${subId}`);
      initData(res.data);
    } catch (err) {
      // 데모 fallback
      const demoData: Subscription = {
        subId,
        userId: 'usr_demo',
        name: 'Netflix',
        category: 'entertainment',
        amount: 17000,
        currency: 'KRW',
        amountKRW: 17000,
        billingCycle: 'monthly',
        billingDay: 20,
        nextBillingDate: '2026-10-20',
        status: 'active',
        notifyDaysBefore: 3,
        memo: '프리미엄 4K UHD 플랜 (가족 공유)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      initData(demoData);
    } finally {
      setLoading(false);
    }
  };

  const initData = (data: Subscription) => {
    setSub(data);
    setName(data.name);
    setCategory(data.category);
    setAmount(data.amount);
    setCurrency(data.currency);
    setBillingCycle(data.billingCycle);
    setNextBillingDate(data.nextBillingDate);
    setStatus(data.status);
    setNotifyDaysBefore(data.notifyDaysBefore);
    setMemo(data.memo || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.patch(`/subscriptions/${subId}`, {
        name,
        category,
        amount: Number(amount),
        currency,
        billingCycle,
        nextBillingDate,
        status,
        notifyDaysBefore: Number(notifyDaysBefore),
        memo,
      });
      initData(res.data);
      setIsEditing(false);
      alert('성공적으로 수정되었습니다.');
    } catch (err) {
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 구독을 정말 삭제하시겠습니까?')) return;
    try {
      await apiClient.delete(`/subscriptions/${subId}`);
      router.push('/subscriptions');
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">구독 정보를 불러오는 중...</div>;
  }

  if (!sub) {
    return <div className="text-center py-12 text-destructive">구독 항목을 찾을 수 없습니다.</div>;
  }

  const daysLeft = daysUntilBilling(sub.nextBillingDate);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/subscriptions" className="text-sm text-muted-foreground hover:text-foreground">
          ← 구독 목록으로 돌아가기
        </Link>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              수정
            </button>
          )}
          <button
            onClick={handleDelete}
            className="rounded-lg border border-destructive/30 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive/10 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      {isEditing ? (
        /* 수정 모드 */
        <form onSubmit={handleUpdate} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold">구독 정보 수정</h2>

          <div>
            <label className="block text-sm font-medium mb-1">서비스명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {SUBSCRIPTION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="active">활성 (구독 중)</option>
                <option value="paused">일시 정지</option>
                <option value="cancelled">해지 완료</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">금액</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">통화</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">다음 결제일</label>
              <input
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">결제 주기</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {BILLING_CYCLES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </form>
      ) : (
        /* 상세 보기 카드 */
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{sub.name}</h2>
              <span className="inline-block mt-1 text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                {SUBSCRIPTION_CATEGORIES.find((c) => c.value === sub.category)?.label || sub.category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(sub.amount, sub.currency)}</div>
              <div className="text-xs text-muted-foreground">/{sub.billingCycle}</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t pt-4 text-sm">
            <div>
              <span className="text-muted-foreground">상태: </span>
              <span className="font-semibold capitalize text-emerald-600">{sub.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground">알림 설정: </span>
              <span className="font-semibold">{sub.notifyDaysBefore}일 전 알림</span>
            </div>
            <div>
              <span className="text-muted-foreground">다음 결제일: </span>
              <span className="font-semibold">{sub.nextBillingDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground">결제 D-Day: </span>
              <span className={`font-semibold ${billingUrgencyColor(daysLeft)}`}>
                {billingDaysText(daysLeft)}
              </span>
            </div>
          </div>

          {sub.memo && (
            <div className="border-t pt-4">
              <div className="text-xs font-semibold text-muted-foreground mb-1">메모</div>
              <p className="text-sm bg-muted/40 p-3 rounded-lg text-foreground">{sub.memo}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
