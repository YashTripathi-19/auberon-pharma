import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'Create Account',
  description: 'Register as a customer, wholesaler or clinic with Auberon Pharmaceuticals for exclusive pricing and fast ordering.',
  path: '/signup',
  noIndex: true,
});

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
