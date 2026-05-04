import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'Login',
  description: 'Login to your Auberon Pharmaceuticals account to manage orders, wishlist and profile.',
  path: '/login',
  noIndex: true,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
