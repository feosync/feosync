export default function OverviewLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-48 rounded bg-accent animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-accent animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-accent animate-pulse" style={{ height: `${i === 0 ? 280 : 320}px` }} />
        ))}
      </div>
    </div>
  )
}
