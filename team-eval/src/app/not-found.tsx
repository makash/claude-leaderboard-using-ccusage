import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl p-10 max-w-md w-full text-center shadow-lg">
        <div className="text-6xl font-bold text-indigo-600 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
