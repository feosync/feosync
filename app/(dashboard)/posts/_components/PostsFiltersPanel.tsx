import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { CONST_MONTHS, CONST_YEARS } from '../const'

interface PostsFiltersPanelProps {
  year: number | undefined
  month: number | undefined
  week: number | undefined
  availableWeeks: number[]
  activeFilterCount: number
  onYear: (v: string) => void
  onMonth: (v: string) => void
  onWeek: (v: string) => void
  onReset: () => void
}

export function PostsFiltersPanel({
  year, month, week,
  availableWeeks, activeFilterCount,
  onYear, onMonth, onWeek, onReset,
}: PostsFiltersPanelProps) {
  return (
    <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border bg-muted/50 w-full lg:w-1/2 xl:w-1/4">

      <Select value={year ? String(year) : 'all'} onValueChange={onYear}>
        <SelectTrigger className="w-full xs:w-28 h-9">
          <SelectValue placeholder="Année" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les années</SelectItem>
          {CONST_YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={month ? String(month) : 'all'} onValueChange={onMonth}>
        <SelectTrigger className="w-full xs:w-36 h-9">
          <SelectValue placeholder="Mois" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les mois</SelectItem>
          {CONST_MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={week ? String(week) : 'all'} onValueChange={onWeek} disabled={!month}>
        <SelectTrigger className="w-full xs:w-36 h-9">
          <SelectValue placeholder={month ? 'Semaine' : 'Choisir un mois'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les semaines</SelectItem>
          {availableWeeks.map(w => <SelectItem key={w} value={String(w)}>Semaine {w}</SelectItem>)}
        </SelectContent>
      </Select>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost" size="sm"
          className="h-9 gap-1 text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          <X className="w-3.5 h-3.5" /> Réinitialiser
        </Button>
      )}
    </div>
  )
}