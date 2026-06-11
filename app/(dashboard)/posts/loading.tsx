export default function PostsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded bg-accent" />
        <div className="h-9 w-36 rounded-lg bg-accent" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-accent" />
        ))}
      </div>
      <div className="h-10 rounded-lg bg-accent" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-accent" />
        ))}
      </div>
    </div>
  )
}
