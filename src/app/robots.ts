import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://auberonpharma.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all crawlers on public pages
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/shop',
          '/hospital',
          '/partners',
          '/support',
          '/eye-tests/',
          '/eye-knowledge',
          '/signup',
          '/login',
        ],
        disallow: [
          '/admin/', // entire admin panel
          '/api/', // all API routes
          '/profile', // user account
          '/wishlist', // user wishlist
          '/checkout', // checkout flow
          '/feedback/', // feedback pages
          '/_next/', // Next.js internals
        ],
      },
      {
        // Block AI training bots completely
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
