'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, daysUntilBilling, billingDaysText, billingUrgencyColor } from '@/lib/utils';
import { SUBSCRIPTION_CATEGORIES, SERVICE_CATALOG } from '@/lib/constants';
import type { Subscription } from '@/types/subscription';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/subscriptions');
      setSubscriptions(res.data.data || []);
    } catch (err) {
      // API 서버가 미동작일 때도 UI 확인이 가능하도록 데모 데이터 폴백
      setSubscriptions([
        {
          subId: 'sub_demo_1',
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          subId: 'sub_demo_2',
          userId: 'usr_demo',
          name: 'Spotify',
          category: 'music',
          amount: 10900,
          currency: 'KRW',
          amountKRW: 10900,
          billingCycle: 'monthly',
          billingDay: 25,
          nextBillingDate: '2026-10-25',
          status: 'active',
          notifyDaysBefore: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          subId: 'sub_demo_3',
          userId: 'usr_demo',
          name: 'Adobe Creative Cloud',
          category: 'productivity',
          amount: 62000,
          currency: 'KRW',
          amountKRW: 62000,
          billingCycle: 'monthly',
          billingDay: 1,
          nextBillingDate: '2026-11-01',
          status: 'active',
          notifyDaysBefore: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subId: string, name: string) => {
    if (!confirm(`'${name}' 구독을 삭제하시겠습니까?`)) return;

    try {
      await apiClient.delete(`/subscriptions/${subId}`);
      setSubscriptions((prev) => prev.filter((s) => s.subId !== subId));
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 필터링 & 정렬
  const filteredSubscriptions = subscriptions
    .filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (s.memo && s.memo.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = selectedCategory === 'all' || s.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return a.nextBillingDate.localeCompare(b.nextBillingDate);
      if (sortBy === 'amount') return (b.amountKRW || b.amount) - (a.amountKRW || a.amount);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const totalMonthly = subscriptions.reduce((sum, s) => sum + (s.amountKRW || s.amount), 0);
  const totalYearly = totalMonthly * 12;

  const getEmoji = (cat: string) => {
    const found = SUBSCRIPTION_CATEGORIES.find((c) => c.value === cat);
    return found?.emoji || '📦';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">구독 관리</h1>
          <p className="text-sm text-muted-foreground">
            총 {subscriptions.length}개 구독 | 월 {formatCurrency(totalMonthly, 'KRW')} (연 {formatCurrency(totalYearly, 'KRW')})
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <span>➕</span> 구독 추가
        </Link>
      </div>

      {/* 필터 및 검색 바 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border">
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="구독 서비스 또는 메모 검색..."
            className="w-full sm:w-72 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">모든 카테고리</option>
            {SUBSCRIPTION_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="date">결제일순</option>
            <option value="amount">높은 금액순</option>
            <option value="name">이름순</option>
          </select>

          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 text-sm font-medium ${viewMode === 'card' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              카드
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              테이블
            </button>
          </div>
        </div>
      </div>

      {/* 콘텐츠 표시 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">구독 목록을 불러오는 중...</div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card space-y-3">
          <div className="text-4xl">🔍</div>
          <div className="text-lg font-medium">등록된 구독이 없거나 검색 결과가 없습니다.</div>
          <p className="text-sm text-muted-foreground">새로운 구독을 추가해보세요!</p>
          <Link
            href="/subscriptions/new"
            className="inline-block mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            첫 구독 추가하기
          </Link>
        </div>
      ) : viewMode === 'card' ? (
        /* 카드 그리드 뷰 */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubscriptions.map((sub) => {
            const daysLeft = daysUntilBilling(sub.nextBillingDate);
            return (
              <div key={sub.subId} className="rounded-xl border bg-card p-5 shadow-sm space-y-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getEmoji(sub.category)}</span>
                    <div>
                      <h3 className="font-semibold text-base">{sub.name}</h3>
                      <span className="inline-block text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-0.5">
                        {SUBSCRIPTION_CATEGORIES.find((c) => c.value === sub.category)?.label || sub.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatCurrency(sub.amount, sub.currency)}</div>
                    <div className="text-xs text-muted-foreground">/{sub.billingCycle}</div>
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">다음 결제: </span>
                    <span className="font-medium">{sub.nextBillingDate}</span>
                  </div>
                  <div className={`font-semibold ${billingUrgencyColor(daysLeft)}`}>
                    {billingDaysText(daysLeft)}
                  </div>
                </div>

                <div className="flex gap-2 pt-1 border-t">
                  <Link
                    href={`/subscriptions/${sub.subId}`}
                    className="flex-1 text-center rounded-lg border py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    상세 및 수정
                  </Link>
                  <button
                    onClick={() => handleDelete(sub.subId, sub.name)}
                    className="px-3 rounded-lg border border-destructive/20 text-destructive text-xs hover:bg-destructive/10 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 테이블 뷰 */
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs text-muted-foreground">
              <tr>
                <th className="p-4">서비스명</th>
                <th className="p-4">카테고리</th>
                <th className="p-4">결제 주기</th>
                <th className="p-4">금액</th>
                <th className="p-4">다음 결제일</th>
                <th className="p-4 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSubscriptions.map((sub) => {
                const daysLeft = daysUntilBilling(sub.nextBillingDate);
                return (
                  <tr key={sub.subId} className="hover:bg-muted/20">
                    <td className="p-4 font-medium flex items-center gap-2">
                      <span>{getEmoji(sub.category)}</span>
                      {sub.name}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {SUBSCRIPTION_CATEGORIES.find((c) => c.value === sub.category)?.label || sub.category}
                    </td>
                    <td className="p-4 text-muted-foreground">{sub.billingCycle}</td>
                    <td className="p-4 font-semibold">{formatCurrency(sub.amount, sub.currency)}</td>
                    <td className="p-4">
                      <div>{sub.nextBillingDate}</div>
                      <div className={`text-xs ${billingUrgencyColor(daysLeft)}`}>
                        {billingDaysText(daysLeft)}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/subscriptions/${sub.subId}`}
                        className="text-xs text-primary hover:underline"
                      >
                        상세
                      </Link>
                      <button
                        onClick={() => handleDelete(sub.subId, sub.name)}
                        className="text-xs text-destructive hover:underline"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
