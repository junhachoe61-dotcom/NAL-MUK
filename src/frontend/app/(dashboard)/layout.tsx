'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: '📊' },
  { href: '/subscriptions', label: '구독 관리', icon: '💳' },
  { href: '/calendar', label: '결제 캘린더', icon: '📅' },
  { href: '/analytics', label: '지출 분석', icon: '📈' },
  { href: '/notifications', label: '알림', icon: '🔔' },
  { href: '/settings', label: '설정', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserEmail(u.email || '');
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* 사이드바 */}
      <aside className="w-64 border-r bg-card flex flex-col justify-between p-4 hidden md:flex">
        <div className="space-y-6">
          <Link href="/dashboard" className="flex items-center gap-2 px-2 text-xl font-bold">
            <span className="text-2xl">🔖</span> SubTrack
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="px-2 text-xs text-muted-foreground truncate">
            {userEmail ? `${userEmail}` : '사용자'}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <span>🚪</span> 로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b px-6 flex items-center justify-between bg-card md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <span>🔖</span> SubTrack
          </Link>
          <button onClick={handleLogout} className="text-xs text-destructive">
            로그아웃
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
