export interface MonthlySummary {
  month: string; // 'YYYY-MM'
  totalKRW: number;
  count: number;
}

export interface CategorySummary {
  category: string;
  label: string;
  totalKRW: number;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  currentMonthTotal: number;
  lastMonthTotal: number;
  changePercent: number;
  activeCount: number;
  yearlyProjected: number;
  mostExpensive: {
    name: string;
    amountKRW: number;
    category: string;
  } | null;
}

export interface AnalyticsTrend {
  months: MonthlySummary[];
}

export interface AnalyticsCategory {
  categories: CategorySummary[];
  total: number;
}
