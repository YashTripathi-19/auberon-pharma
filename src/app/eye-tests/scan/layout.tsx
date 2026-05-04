import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'AI Eye Health Scanner',
  description: 'Use our free AI-powered eye scanner to check for signs of conjunctivitis and cataracts using your device camera.',
  path: '/eye-tests/scan',
});

export default function EyeScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
