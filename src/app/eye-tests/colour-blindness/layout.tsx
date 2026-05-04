import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'Free Colour Blindness Test',
  description: 'Take a free online Ishihara-style colour blindness test. Instant results with 6 test plates — no registration required.',
  path: '/eye-tests/colour-blindness',
});

export default function ColourBlindnessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
