import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://auberonpharma.com';

const DEFAULT = {
  siteName: 'Auberon Pharmaceuticals',
  tagline: 'Trusted Ophthalmic Care — Crafted with Precision',
  description:
    'Auberon Pharmaceuticals offers specialist ophthalmic medicines including eye drops, ointments and tablets. Trusted by ophthalmologists, clinics and wholesalers across India.',
  logo: `${BASE_URL}/og-image.jpg`,
  twitterHandle: '@auberonpharma',
};

export function generateSEO({
  title,
  description,
  path = '/',
  image,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title
    ? `${title} | ${DEFAULT.siteName}`
    : `${DEFAULT.siteName} — ${DEFAULT.tagline}`;
  const desc = description || DEFAULT.description;
  const url = `${BASE_URL}${path}`;
  const img = image || DEFAULT.logo;

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: DEFAULT.siteName,
      images: [{ url: img, width: 1200, height: 630, alt: fullTitle }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [img],
      site: DEFAULT.twitterHandle,
    },
  };
}
