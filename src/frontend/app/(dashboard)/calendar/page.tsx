'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, getCategoryColor } from '@/lib/utils';
import { SUBSCRIPTION_CATEGORIES } from '@/lib/constants';
import type { Subscription } from '@/types/subscription';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // 2026년 10월 기준
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/subscriptions');
      setSubscriptions(res.data.data || []);
    } catch (err) {
      // 데모 fallback
      setSubscriptions([
        {
          subId: '1',
          userId: 'u1',
          name: 'Spotify',
          category: 'music',
          amount: 10900,
          currency: 'KRW',
          amountKRW: 10900,
          billingCycle: 'monthly',
          billingDay: 1,
          nextBillingDate: '2026-10-01',
          status: 'active',
          notifyDaysBefore: 3,
          createdAt: '',
          updatedAt: '',
        },
        {
          subId: '2',
          userId: 'u1',
          name: 'Netflix',
          category: 'entertainment',
          amount: 17000,
          currency: 'KRW',
          amountKRW: 17000,
          billingCycle: 'monthly',
          billingDay: 15,
          nextBillingDate: '2026-10-15',
          status: 'active',
          notifyDaysBefore: 3,
          createdAt: '',
          updatedAt: '',
        },
        {
          subId: '3',
          userId: 'u1',
          name: 'Adobe CC',
          category: 'productivity',
          amount: 62000,
          currency: 'KRW',
          amountKRW: 62000,
          billingCycle: 'monthly',
          billingDay: 20,
          nextBillingDate: '2026-10-20',
          status: 'active',
          notifyDaysBefore: 3,
          createdAt: '',
          updatedAt: '',
        },
        {
          subId: '4',
          userId: 'u1',
          name: 'ChatGPT Plus',
          category: 'productivity',
          amount: 28000,
          currency: 'KRW',
          amountKRW: 28000,
          billingCycle: 'monthly',
          billingDay: 28,
          nextBillingDate: '2026-10-28',
          status: 'active',
          notifyDaysBefore: 3,
          createdAt: '',
          updatedAt: '',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 해당 월의 첫 날 요일 및 마지막 날짜 계산
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // 날짜별 구독 매핑
  const daySubscriptionsMap: Record<number, Subscription[]> = {};
  subscriptions.forEach((sub) => {
    const day = sub.billingDay || parseInt(sub.nextBillingDate.split('-')[2], 10);
    if (!daySubscriptionsMap[day]) {
      daySubscriptionsMap[day] = [];
    }
    daySubscriptionsMap[day].push(sub);
  });

  const selectedSubs = selectedDay ? daySubscriptionsMap[selectedDay] || [] : [];
  const monthlyTotal = subscriptions.reduce((sum, s) => sum + (s.amountKRW || s.amount), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">결제 캘린더</h1>
          <p className="text-sm text-muted-foreground">
            {year}년 {month + 1}월 결제 예정: 총 {subscriptions.length}건 ({formatCurrency(monthlyTotal, 'KRW')})
          </p>
        </div>

        {/* 월 이동 컨트롤러 */}
        <div className="flex items-center gap-3 bg-card border rounded-lg px-3 py-1.5">
          <button onClick={prevMonth} className="text-sm hover:text-primary px-1">◀</button>
          <span className="font-semibold text-sm">
            {year}년 {month + 1}월
          </span>
          <button onClick={nextMonth} className="text-sm hover:text-primary px-1">▶</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* 달력 그리드 */}
        <div className="lg:col-span-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-muted-foreground mb-2">
            <div className="text-destructive py-2">일</div>
            <div className="py-2">월</div>
            <div className="py-2">화</div>
            <div className="py-2">수</div>
            <div className="py-2">목</div>
            <div className="py-2">금</div>
            <div className="text-primary py-2">토</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* 이전 달 빈 칸 */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 rounded-lg bg-muted/20 p-1"></div>
            ))}

            {/* 날짜 칸 */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const subsForDay = daySubscriptionsMap[day] || [];
              const isSelected = selectedDay === day;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-24 rounded-lg border p-1.5 flex flex-col justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">{day}</span>
                    {subsForDay.length > 0 && (
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-1 rounded">
                        {subsForDay.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1 overflow-hidden">
                    {subsForDay.slice(0, 2).map((s) => (
                      <div
                        key={s.subId}
                        className="text-[10px] truncate px-1 py-0.5 rounded bg-muted/80 font-medium"
                        title={`${s.name} - ${formatCurrency(s.amount, s.currency)}`}
                      >
                        {s.name}
                      </div>
                    ))}
                    {subsForDay.length > 2 && (
                      <div className="text-[9px] text-muted-foreground text-center font-medium">
                        +{subsForDay.length - 2}개 더보기
                      </div>
                    )}
                  </div>

                  {subsForDay.length > 0 && (
                    <div className="text-[9px] text-right font-semibold text-primary truncate">
                      {formatCurrency(subsForDay.reduce((sum, s) => sum + (s.amountKRW || s.amount), 0), 'KRW')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측 결제 상세 사이드 패널 */}
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-base font-semibold border-b pb-2">
            {selectedDay ? `${selectedDay}일 결제 일정` : '결제 일정 상세'}
          </h2>

          {selectedDay === null ? (
            <div className="text-sm text-muted-foreground text-center py-12">
              달력에서 날짜를 클릭하면 해당 일자의 결제 목록이 표시됩니다.
            </div>
          ) : selectedSubs.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12">
              {selectedDay}일에는 예정된 정기 결제가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedSubs.map((s) => (
                <div key={s.subId} className="border rounded-lg p-3 space-y-1.5 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{s.name}</span>
                    <span className="text-xs font-bold text-primary">
                      {formatCurrency(s.amount, s.currency)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>주기: {s.billingCycle}</span>
                    <span className="capitalize">{s.status}</span>
                  </div>
                  <Link
                    href={`/subscriptions/${s.subId}`}
                    className="inline-block text-[11px] text-primary hover:underline mt-1"
                  >
                    구독 상세 바로가기 →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
