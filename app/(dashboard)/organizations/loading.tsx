export default function OrganizationsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-52 rounded bg-accent" />
        <div className="h-9 w-36 rounded-lg bg-accent" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 max-w-xs rounded-lg bg-accent" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-accent" />
        ))}
      </div>
    </div>
  )
}
