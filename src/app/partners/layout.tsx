import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'Partners & Sponsors',
  description: 'Auberon Pharmaceuticals partners with leading hospitals, clinics, NGOs and pharma organisations across India for better eye care delivery.',
  path: '/partners',
});

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
