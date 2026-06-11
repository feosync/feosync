export default function AnalyticsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-36 rounded bg-accent" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-accent" />
        ))}
      </div>
    </div>
  )
}
