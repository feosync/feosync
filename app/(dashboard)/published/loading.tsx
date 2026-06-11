export default function PublishedLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-44 rounded bg-accent" />
        <div className="h-9 w-36 rounded-lg bg-accent" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 max-w-sm rounded-lg bg-accent" />
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-2 break-inside-avoid">
            <div
              className="w-full rounded-xl bg-accent"
              style={{ height: `${280 + i * 40}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
