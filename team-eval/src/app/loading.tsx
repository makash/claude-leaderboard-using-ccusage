export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header bar placeholder */}
      <div className="animate-pulse mb-8">
        <div className="h-10 w-64 rounded-lg bg-gray-900" />
      </div>

      {/* Stat card placeholders */}
      <div className="animate-pulse mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-900 p-6">
            <div className="mb-3 h-4 w-24 rounded bg-gray-800" />
            <div className="mb-2 h-8 w-32 rounded bg-gray-800" />
            <div className="h-3 w-16 rounded bg-gray-800" />
          </div>
        ))}
      </div>

      {/* Large chart placeholder */}
      <div className="animate-pulse rounded-2xl bg-gray-900 p-6">
        <div className="mb-6 h-5 w-40 rounded bg-gray-800" />
        <div className="h-72 w-full rounded-lg bg-gray-800" />
      </div>
    </div>
  );
}
