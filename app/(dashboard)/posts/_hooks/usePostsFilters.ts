import { useState, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { PostStatus } from '@/lib/api/types'

const THIS_YEAR    = new Date().getFullYear()
const THIS_MONTH   = new Date().getMonth() + 1

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export const CURRENT_WEEK = getISOWeekNumber(new Date())

export function getWeeksOfMonth(year: number, month: number): number[] {
  const weeks = new Set<number>()
  const lastDay = new Date(year, month, 0).getDate()
  for (let day = 1; day <= lastDay; day++) {
    weeks.add(getISOWeekNumber(new Date(year, month - 1, day)))
  }
  return Array.from(weeks).sort((a, b) => a - b)
}

export function usePostsFilters() {
  const [activeTab,   setActiveTab]   = useState<PostStatus | 'all'>('all')
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [year,  setYear]  = useState<number | undefined>(THIS_YEAR)
  const [month, setMonth] = useState<number | undefined>(THIS_MONTH)
  const [week,  setWeek]  = useState<number | undefined>(CURRENT_WEEK)
  const [page,  setPage]  = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const availableWeeks = year && month ? getWeeksOfMonth(year, month) : []

  const activeFilterCount = [
    year !== THIS_YEAR,
    month !== THIS_MONTH,
    week !== CURRENT_WEEK,
  ].filter(Boolean).length

  const handleTabChange = (tab: PostStatus | 'all') => { setActiveTab(tab); setPage(1) }
  const handleSearch    = useCallback((v: string)   => { setSearchInput(v); setPage(1) }, [])

  const handleYear = (v: string) => {
    setYear(v !== 'all' ? Number(v) : undefined)
    setWeek(undefined); setPage(1)
  }
  const handleMonth = (v: string) => {
    setMonth(v !== 'all' ? Number(v) : undefined)
    setWeek(undefined); setPage(1)
  }
  const handleWeek = (v: string) => {
    setWeek(v !== 'all' ? Number(v) : undefined)
    setPage(1)
  }
  const resetFilters = () => {
    setYear(THIS_YEAR); setMonth(THIS_MONTH); setWeek(CURRENT_WEEK); setPage(1)
  }

  return {
    activeTab, handleTabChange,
    searchInput, search, handleSearch,
    year, month, week,
    handleYear, handleMonth, handleWeek,
    page, setPage,
    filtersOpen, setFiltersOpen,
    availableWeeks, activeFilterCount,
    resetFilters,
  }
}