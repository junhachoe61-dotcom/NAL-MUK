import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SubTrack — 모든 구독을 한 곳에서',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔖</span>
            <span className="text-xl font-bold">SubTrack</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              무료 시작
            </Link>
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            모든 구독,{' '}
            <span className="text-primary">한 곳에서</span>{' '}
            관리하세요
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Netflix, Spotify, Adobe... 흩어진 구독 서비스를 SubTrack으로 한눈에 파악하고,
            <br />
            불필요한 지출을 줄이세요.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              무료로 시작하기 →
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border px-8 py-3 text-base font-semibold hover:bg-muted transition-colors"
            >
              데모 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 기능 카드 */}
      <section className="border-t bg-muted/30">
        <div className="container py-20">
          <h2 className="mb-12 text-center text-3xl font-bold">SubTrack이 특별한 이유</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                emoji: '💳',
                title: '구독 통합 관리',
                desc: '모든 구독을 한 곳에 등록하고 결제일, 금액, 카테고리를 한눈에 확인하세요.',
              },
              {
                emoji: '📊',
                title: '지출 분석',
                desc: '월별, 카테고리별 구독 지출을 차트로 시각화해 낭비 패턴을 발견하세요.',
              },
              {
                emoji: '🔔',
                title: '결제일 알림',
                desc: '결제일 3일 전 이메일 알림으로 예상치 못한 청구를 방지하세요.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 text-4xl">{feature.emoji}</div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="container py-20 text-center">
        <div className="mx-auto grid max-w-2xl gap-8 md:grid-cols-3">
          {[
            { value: '15+', label: '인기 서비스 즉시 등록' },
            { value: '무료', label: '기본 기능 완전 무료' },
            { value: '서버리스', label: 'AWS 기반 고가용성' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="container py-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">지금 바로 시작하세요</h2>
          <p className="mb-8 text-primary-foreground/80">
            5분 안에 모든 구독을 등록하고 지출을 파악해보세요.
          </p>
          <Link
            href="/register"
            className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-primary hover:bg-white/90 transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 SubTrack. Made with ❤️ using Harness + Loop Engineering</p>
      </footer>
    </div>
  );
}
