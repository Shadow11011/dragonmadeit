import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4 bg-bg-primary">
      <svg
        width="80"
        height="80"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6 text-accent-fire"
      >
        {/* Stylized dragon wing silhouette suggesting it flew away */}
        <path
          d="M32 8C32 8 16 16 12 28C10 34 14 40 20 42C14 46 10 52 14 56C18 52 24 50 30 50C30 50 26 44 28 38C30 32 40 28 40 28C40 28 36 22 32 8Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M32 8C32 8 48 16 52 28C54 34 50 40 44 42C50 46 54 52 50 56C46 52 40 50 34 50C34 50 38 44 36 38C34 32 24 28 24 28C24 28 28 22 32 8Z"
          fill="currentColor"
          opacity="0.2"
        />
        <circle cx="28" cy="24" r="2" fill="currentColor" />
        <circle cx="36" cy="24" r="2" fill="currentColor" />
      </svg>

      <h1 className="text-6xl font-bold fire-text mb-3">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Looks like this dragon flew away</h2>
      <p className="text-text-secondary max-w-md mb-8">
        The page you are looking for does not exist or has been moved to another lair.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-6 py-2.5 rounded-lg bg-accent-fire text-white font-semibold hover:brightness-110 transition-all text-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
