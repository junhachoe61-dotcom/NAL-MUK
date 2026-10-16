'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  // 초기 데모 및 연동 가능한 구독 상태 데이터
  const [subscriptions] = useState([
    { id: '1', name: 'Netflix', category: '엔터테인먼트', amount: 17000, nextDate: '2026-10-20', daysLeft: 4, icon: '🎬' },
    { id: '2', name: 'Spotify', category: '음악', amount: 10900, nextDate: '2026-10-25', daysLeft: 9, icon: '🎵' },
    { id: '3', name: 'Adobe Creative Cloud', category: '업무', amount: 62000, nextDate: '2026-11-01', daysLeft: 16, icon: '📷' },
    { id: '4', name: 'ChatGPT Plus', category: '생산성', amount: 28000, nextDate: '2026-11-05', daysLeft: 20, icon: '🤖' },
  ]);

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.amount, 0);
  const upcomingCount = subscriptions.filter((s) => s.daysLeft <= 7).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 환영 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-sm text-muted-foreground">구독 현황과 이번 달 지출 요약을 확인하세요.</p>
        </div>
        <Link
          href="/subscriptions/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <span>➕</span> 새 구독 추가
        </Link>
      </div>

      {/* 요약 카드 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">이번 달 총 지출</span>
            <span className="text-xl">💰</span>
          </div>
          <div className="mt-2 text-3xl font-bold">{formatCurrency(totalMonthly, 'KRW')}</div>
          <p className="mt-1 text-xs text-muted-foreground">지난 달 대비 +8% 변동</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">활성 구독 수</span>
            <span className="text-xl">📋</span>
          </div>
          <div className="mt-2 text-3xl font-bold">{subscriptions.length}개</div>
          <p className="mt-1 text-xs text-muted-foreground">정기 결제 유지 중</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">7일 내 결제 예정</span>
            <span className="text-xl">⏰</span>
          </div>
          <div className="mt-2 text-3xl font-bold text-orange-500">{upcomingCount}건</div>
          <p className="mt-1 text-xs text-muted-foreground">자동 결제 주의 필요</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 다가오는 결제일 */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center justify-between">
            <span>다가오는 결제 일정</span>
            <Link href="/calendar" className="text-xs text-primary hover:underline">
              캘린더 보기 →
            </Link>
          </h2>

          <div className="divide-y">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sub.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{sub.name}</div>
                    <div className="text-xs text-muted-foreground">{sub.nextDate} 결제 예정</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{formatCurrency(sub.amount, 'KRW')}</div>
                  <div className={`text-xs ${sub.daysLeft <= 3 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    {sub.daysLeft === 0 ? '오늘 결제' : `${sub.daysLeft}일 남음`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 카테고리별 비중 요약 */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center justify-between">
            <span>카테고리별 지출</span>
            <Link href="/analytics" className="text-xs text-primary hover:underline">
              상세 분석 →
            </Link>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>📷 업무/생산성</span>
                <span className="font-medium">₩90,000 (76%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>🎬 엔터테인먼트</span>
                <span className="font-medium">₩17,000 (14%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>🎵 음악</span>
                <span className="font-medium">₩10,900 (10%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
