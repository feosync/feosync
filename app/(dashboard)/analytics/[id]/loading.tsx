export default function AnalyticsDetailLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-accent" />
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-accent" />
          <div className="h-3 w-28 rounded bg-accent" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-accent" />
        ))}
      </div>
      <div className="h-80 rounded-xl bg-accent" />
    </div>
  )
}
