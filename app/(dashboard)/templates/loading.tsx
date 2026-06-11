export default function TemplatesLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-44 rounded bg-accent" />
        <div className="h-9 w-36 rounded-lg bg-accent" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-52 rounded-xl bg-accent" />
        ))}
      </div>
    </div>
  )
}
