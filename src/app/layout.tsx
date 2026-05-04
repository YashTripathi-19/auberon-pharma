import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Toast from "@/components/ui/Toast";
import SaleBannerProvider from "@/components/layout/SaleBannerProvider";
import WhatsAppButton from "@/components/WhatsAppButton";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'Auberon Pharmaceuticals — Trusted Ophthalmic Care',
    template: '%s | Auberon Pharmaceuticals',
  },
  description:
    'Specialist ophthalmic medicines including eye drops, ointments and tablets. Trusted by ophthalmologists, clinics and wholesalers across India since 2010.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://auberonpharma.com'
  ),
  keywords: [
    'ophthalmic medicines',
    'eye drops India',
    'eye care pharmacy',
    'ophthalmology medicines',
    'buy eye drops online',
    'Kanpur pharmacy',
    'wholesale eye medicines',
    'Auberon Pharmaceuticals',
  ],
  authors: [{ name: 'Auberon Pharmaceuticals' }],
  creator: 'Auberon Pharmaceuticals',
  publisher: 'Auberon Pharmaceuticals',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'add-your-google-search-console-verification-code-here',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SaleBannerProvider />
        {children}
        <Toast />
        <WhatsAppButton />
      </body>
    </html>
  );
}
