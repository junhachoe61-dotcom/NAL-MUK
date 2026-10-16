'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface NotificationItem {
  notifId: string;
  title: string;
  message: string;
  subName: string;
  daysLeft: number;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      // 데모 fallback
      setNotifications([
        {
          notifId: 'n1',
          title: '[결제 예정] Netflix 결제 3일 전입니다.',
          message: '2026-10-20에 ₩17,000이 결제될 예정입니다. 등록된 카드 잔액을 확인해주세요.',
          subName: 'Netflix',
          daysLeft: 3,
          read: false,
          createdAt: '2026-10-17T09:00:00Z',
        },
        {
          notifId: 'n2',
          title: '[결제 예정] Spotify 결제 7일 전입니다.',
          message: '2026-10-25에 ₩10,900이 결제될 예정입니다.',
          subName: 'Spotify',
          daysLeft: 7,
          read: true,
          createdAt: '2026-10-14T09:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.notifId === id ? { ...n, read: true } : n)),
      );
    } catch (e) {
      // 로컬 즉시 반영
      setNotifications((prev) =>
        prev.map((n) => (n.notifId === id ? { ...n, read: true } : n)),
      );
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">알림 센터</h1>
          <p className="text-sm text-muted-foreground">
            정기 결제일 도래 및 서비스 갱신 알림을 확인하세요. (미확인: {unreadCount}건)
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            모두 읽음 표시
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">알림을 불러오는 중...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card space-y-3">
          <div className="text-4xl">🔔</div>
          <div className="text-base font-semibold">새로운 알림이 없습니다.</div>
          <p className="text-sm text-muted-foreground">다가오는 결제 일정이 있으면 사전에 알려드립니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.notifId}
              className={`rounded-xl border p-5 shadow-sm transition-colors flex items-start justify-between gap-4 ${
                !n.read ? 'bg-card border-primary/40 ring-1 ring-primary/20' : 'bg-muted/20 opacity-80'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔔</span>
                  <span className="font-semibold text-sm">{n.title}</span>
                  {!n.read && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">{n.message}</p>
                <div className="text-[11px] text-muted-foreground pl-6 pt-1">
                  {n.createdAt.split('T')[0]}
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n.notifId)}
                  className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  읽음
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
