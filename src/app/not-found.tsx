import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-mono text-7xl font-black text-gradient mb-4 tabular-nums">404</h1>
      <h2 className="text-xl font-black text-on-surface mb-3 uppercase tracking-widest">
        Page Not Found
      </h2>
      <p className="text-text-secondary text-sm mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 hover:shadow-[0_0_16px_rgba(34,211,238,0.35)] active:scale-95 transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
