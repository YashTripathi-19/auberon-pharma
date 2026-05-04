import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'My Account',
  description: 'Manage your Auberon account, view order history, wishlist and profile settings.',
  path: '/profile',
  noIndex: true,
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
