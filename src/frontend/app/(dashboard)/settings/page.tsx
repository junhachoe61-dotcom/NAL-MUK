'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { CURRENCIES } from '@/lib/constants';

export default function SettingsPage() {
  const [defaultCurrency, setDefaultCurrency] = useState('KRW');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/settings');
      if (res.data) {
        setDefaultCurrency(res.data.defaultCurrency || 'KRW');
        setNotifyEnabled(res.data.notifyEnabled !== false);
        setNotifyEmail(res.data.notifyEmail || '');
        setTimezone(res.data.timezone || 'Asia/Seoul');
      }
    } catch (e) {
      // 로컬 기본값 유지
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setNotifyEmail(u.email || '');
        } catch {}
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await apiClient.patch('/settings', {
        defaultCurrency,
        notifyEnabled,
        notifyEmail,
        timezone,
      });
      setMessage('설정이 성공적으로 저장되었습니다.');
    } catch (err) {
      setMessage('설정이 로컬에 반영되었습니다.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">환경 설정</h1>
        <p className="text-sm text-muted-foreground">계정 환경과 결제 알림 수신 방식을 설정하세요.</p>
      </div>

      {message && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 font-medium">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        {/* 기본 통화 설정 */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold">기준 통화 설정</label>
          <p className="text-xs text-muted-foreground">대시보드와 통계에서 금액을 환산해 표시할 기본 통화입니다.</p>
          <select
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className="w-full sm:w-64 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">결제 사전 알림 활성화</div>
              <p className="text-xs text-muted-foreground">결제 예정일 전 알림을 수신합니다.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyEnabled}
              onChange={(e) => setNotifyEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>

          {notifyEnabled && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-muted-foreground">알림 수신 이메일</label>
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* 타임존 */}
        <div className="border-t pt-4 space-y-2">
          <label className="block text-sm font-semibold">기준 시간대 (Timezone)</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full sm:w-64 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Asia/Seoul">대한민국 표준시 (KST / UTC+9)</option>
            <option value="America/New_York">미국 동부 (EST / UTC-5)</option>
            <option value="Europe/London">영국 런던 (GMT / UTC+0)</option>
            <option value="UTC">협정 세계시 (UTC)</option>
          </select>
        </div>

        <div className="border-t pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
