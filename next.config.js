/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // S3 정적 배포용 SSG
  trailingSlash: true,
  images: {
    unoptimized: true, // S3 배포 시 Next.js Image Optimization 비활성화
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // 구독 서비스 로고 허용
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },
};

module.exports = nextConfig;
