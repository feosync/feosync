export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">FeoSync</p>
      </div>
    </div>
  )
}
