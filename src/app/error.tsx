"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-muted mb-8">
          An unexpected error occurred. Please try again or contact support if the issue persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg text-sm font-medium transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
