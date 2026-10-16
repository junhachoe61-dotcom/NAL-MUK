'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, getCategoryColor } from '@/lib/utils';
import { SUBSCRIPTION_CATEGORIES } from '@/lib/constants';
import type { AnalyticsSummary, AnalyticsTrend, AnalyticsCategory } from '@/types/analytics';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trend, setTrend] = useState<AnalyticsTrend | null>(null);
  const [categoryData, setCategoryData] = useState<AnalyticsCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [sumRes, trendRes, catRes] = await Promise.all([
        apiClient.get('/analytics/summary'),
        apiClient.get('/analytics/trend'),
        apiClient.get('/analytics/category'),
      ]);

      setSummary(sumRes.data);
      setTrend(trendRes.data);
      setCategoryData(catRes.data);
    } catch (err) {
      // 데모 fallback 데이터
      setSummary({
        currentMonthTotal: 117900,
        lastMonthTotal: 108000,
        changePercent: 9,
        activeCount: 4,
        yearlyProjected: 1414800,
        mostExpensive: {
          name: 'Adobe Creative Cloud',
          amountKRW: 62000,
          category: 'productivity',
        },
      });

      setTrend({
        months: [
          { month: '2026.05', totalKRW: 85000, count: 3 },
          { month: '2026.06', totalKRW: 88000, count: 3 },
          { month: '2026.07', totalKRW: 98000, count: 3 },
          { month: '2026.08', totalKRW: 105000, count: 4 },
          { month: '2026.09', totalKRW: 108000, count: 4 },
          { month: '2026.10', totalKRW: 117900, count: 4 },
        ],
      });

      setCategoryData({
        total: 117900,
        categories: [
          { category: 'productivity', label: '업무/생산성', totalKRW: 90000, count: 2, percentage: 76 },
          { category: 'entertainment', label: '엔터테인먼트', totalKRW: 17000, count: 1, percentage: 14 },
          { category: 'music', label: '음악', totalKRW: 10900, count: 1, percentage: 10 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">지출 분석 데이터를 계산하는 중...</div>;
  }

  // 막대 차트 최대값 기준
  const maxTrend = trend ? Math.max(...trend.months.map((m) => m.totalKRW)) : 1;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">지출 분석</h1>
        <p className="text-sm text-muted-foreground">월별 구독료 지출 추이와 카테고리별 비중을 분석합니다.</p>
      </div>

      {/* 요약 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">이번 달 총 지출</span>
          <div className="mt-2 text-2xl font-bold">
            {formatCurrency(summary?.currentMonthTotal || 0, 'KRW')}
          </div>
          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
            <span className={summary && summary.changePercent > 0 ? 'text-destructive font-semibold' : 'text-emerald-500 font-semibold'}>
              {summary && summary.changePercent > 0 ? `▲ +${summary.changePercent}%` : `▼ ${summary?.changePercent}%`}
            </span>
            <span>전월 대비</span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">연간 예상 총 지출</span>
          <div className="mt-2 text-2xl font-bold">
            {formatCurrency(summary?.yearlyProjected || 0, 'KRW')}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">현재 활성 구독 기준</div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">활성 구독 수</span>
          <div className="mt-2 text-2xl font-bold">{summary?.activeCount || 0}개</div>
          <div className="mt-1 text-xs text-muted-foreground">정기 지출 발생 중</div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">최고 지출 구독</span>
          <div className="mt-2 text-lg font-bold truncate">
            {summary?.mostExpensive?.name || '-'}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {summary?.mostExpensive ? formatCurrency(summary.mostExpensive.amountKRW, 'KRW') : '-'}
          </div>
        </div>
      </div>

      {/* 분석 차트 그리드 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 최근 6개월 추이 막대 그래프 */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">최근 6개월 지출 추이</h2>
            <span className="text-xs text-muted-foreground">단위: 원</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2">
            {trend?.months.map((m) => {
              const heightPercent = Math.round((m.totalKRW / maxTrend) * 100);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {Math.round(m.totalKRW / 1000)}k
                  </span>
                  <div
                    className="w-full bg-primary/80 hover:bg-primary transition-all rounded-t-md"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className="text-[11px] text-muted-foreground">{m.month.split('.')[1]}월</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 카테고리별 비중 그래프 */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">카테고리별 비중</h2>
            <span className="text-xs text-muted-foreground">총 {formatCurrency(categoryData?.total || 0, 'KRW')}</span>
          </div>

          <div className="space-y-4">
            {categoryData?.categories.map((c) => {
              const color = getCategoryColor(c.category);
              return (
                <div key={c.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                      {c.label} ({c.count}건)
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(c.totalKRW, 'KRW')} ({c.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${c.percentage}%`, backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 스마트 절약 인사이트 배너 */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <span>💡</span> Loop Engineering 기반 스마트 인사이트
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>
            전체 구독 지출 중 <strong className="text-foreground">업무/생산성</strong> 카테고리가 76%로 가장 높은 비중을 차지하고 있습니다.
          </li>
          <li>
            연간 결제 플랜으로 전환 시 월 환산 약 <strong className="text-foreground">15~20% 할인</strong>을 받을 수 있는 서비스가 있는지 확인해보세요.
          </li>
          <li>
            최근 30일간 사용하지 않은 미사용 구독 서비스가 있다면 일시 정지하거나 해지하여 고정 지출을 절감하세요.
          </li>
        </ul>
      </div>
    </div>
  );
}
