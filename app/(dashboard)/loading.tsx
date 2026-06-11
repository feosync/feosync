export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card p-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 rounded-lg bg-accent animate-pulse" />
        ))}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar skeleton */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-accent animate-pulse" />
            <div className="h-4 w-32 rounded bg-accent animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-accent animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-accent animate-pulse" />
          </div>
        </div>

        {/* Content skeleton */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="space-y-6 animate-pulse">
            <div className="h-7 w-48 rounded bg-accent" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-accent" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-64 rounded-xl bg-accent" />
              <div className="h-64 rounded-xl bg-accent" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
