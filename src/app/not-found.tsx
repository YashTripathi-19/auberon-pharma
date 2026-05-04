import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="font-numeric text-[6rem] md:text-[8rem] font-bold text-primary/10 leading-none mb-0">404</p>
        <h1 className="font-display text-[1.8rem] font-bold text-primary mb-3 -mt-4">Page not found.</h1>
        <p className="text-muted text-[15px] leading-[1.75] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="bg-primary text-white text-[14px] font-medium px-7 py-3 rounded-full hover:bg-primary-light transition-colors">
            Back to Home
          </Link>
          <Link href="/products" className="border border-black/[0.1] text-primary text-[14px] font-medium px-7 py-3 rounded-full hover:bg-white transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
