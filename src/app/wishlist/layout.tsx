import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'My Wishlist',
  description: 'Your saved ophthalmic products on Auberon Pharmaceuticals.',
  path: '/wishlist',
  noIndex: true,
});

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
