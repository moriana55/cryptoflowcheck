"use client";

import { useEffect } from "react";

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
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center px-6">
      <h2 className="text-2xl font-black text-white mb-4">Something went wrong</h2>
      <p className="text-text-secondary text-sm mb-8 text-center max-w-md">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all"
      >
        Try again
      </button>
    </div>
  );
}
