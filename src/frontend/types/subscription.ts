import type { SubscriptionCategory, BillingCycle, Currency } from '../lib/constants';

export interface Subscription {
  subId: string;
  userId: string;
  name: string;
  logoUrl?: string;
  category: SubscriptionCategory;
  amount: number;
  currency: Currency;
  amountKRW: number;
  billingCycle: BillingCycle;
  billingDay: number;
  nextBillingDate: string;
  trialEndDate?: string | null;
  status: 'active' | 'paused' | 'cancelled';
  memo?: string;
  notifyDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  name: string;
  logoUrl?: string;
  category: SubscriptionCategory;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  trialEndDate?: string;
  memo?: string;
  notifyDaysBefore?: number;
}

export interface UpdateSubscriptionRequest extends Partial<CreateSubscriptionRequest> {
  status?: 'active' | 'paused' | 'cancelled';
}

export interface SubscriptionListResponse {
  data: Subscription[];
  total: number;
  monthlyTotal: number;
  yearlyTotal: number;
}

export interface SubscriptionFilters {
  category?: SubscriptionCategory;
  status?: 'active' | 'paused' | 'cancelled';
  sort?: 'name' | 'amount' | 'nextBillingDate' | 'createdAt';
  order?: 'asc' | 'desc';
  search?: string;
}
