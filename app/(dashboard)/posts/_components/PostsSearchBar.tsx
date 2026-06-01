import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PostsSearchBarProps {
  searchInput: string
  onSearch: (v: string) => void
  filtersOpen: boolean
  onToggleFilters: () => void
  activeFilterCount: number
}

export function PostsSearchBar({
  searchInput, onSearch,
  filtersOpen, onToggleFilters,
  activeFilterCount,
}: PostsSearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher…"
          value={searchInput}
          onChange={e => onSearch(e.target.value)}
          className="pl-9 pr-9 w-full"
        />
        {searchInput && (
          <Button
            variant="ghost" size="icon"
            onClick={() => onSearch('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFilters}
        className={cn('relative shrink-0 gap-1.5', filtersOpen && 'border-primary text-primary')}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">Filtres</span>
        {activeFilterCount > 0 && (
          <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  )
}