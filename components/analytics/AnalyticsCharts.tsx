'use client'

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { DailyMetric } from '@/lib/api/types'

const fmt = (n: number) => n.toLocaleString('fr-FR')

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })

// ✅ Couleurs séries : on garde des hex précis pour recharts (qui ne lit pas les CSS vars)
// mais on les centralise ici pour cohérence et maintenance
const LINE_SERIES = [
  { key: 'views',        label: 'Vues',        color: 'var(--color-series-blue,   #2563eb)' },
  { key: 'engagements',  label: 'Engagements', color: 'var(--color-series-green,  #16a34a)' },
  { key: 'follows',      label: 'Abonnés',     color: 'var(--color-series-purple, #9333ea)' },
] as const

const BAR_SERIES = [
  { key: 'like',  label: "👍 J'aime",   color: 'var(--color-series-blue,    #2563eb)' },
  { key: 'love',  label: "❤️ J'adore",  color: 'var(--color-series-rose,    #e11d48)' },
  { key: 'care',  label: '🤗 Solidaire', color: 'var(--color-series-orange,  #f97316)' },
  { key: 'haha',  label: '😂 Haha',      color: 'var(--color-series-amber,   #d97706)' },
  { key: 'wow',   label: '😮 Wow',       color: 'var(--color-series-violet,  #8b5cf6)' },
  { key: 'sad',   label: '😢 Triste',    color: 'var(--color-series-slate,   #64748b)' },
  { key: 'angry', label: '😠 Grrr',      color: 'var(--color-series-red,     #dc2626)' },
] as const

// ─── Tooltip ────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-[13px]">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="flex-1 text-muted-foreground">{p.name}</span>
          <span className="font-semibold text-foreground">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Légende ────────────────────────────────────────────────────────────────

function Legend({
  series,
  isBar,
}: {
  series: readonly { key: string; label: string; color: string }[]
  isBar: boolean
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {series.map(s => (
        <div
          key={s.key}
          className="flex items-center gap-2 text-[13px] text-muted-foreground"
        >
          <span
            className={cn('h-2.5 w-2.5 flex-shrink-0', isBar ? 'rounded-sm' : 'rounded-full')}
            style={{ background: s.color }}
          />
          {s.label}
        </div>
      ))}
    </div>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────

interface Props {
  daily: DailyMetric[]
}

export function AnalyticsCharts({ daily }: Props) {
  const lineData = daily.map(d => ({
    date:        fmtDate(d.date),
    views:       d.views,
    engagements: d.engagements,
    follows:     d.follows,
  }))

  const barData = daily.map(d => ({
    date:  fmtDate(d.date),
    like:  d.like,
    love:  d.love,
    care:  d.care,
    haha:  d.haha,
    wow:   d.wow,
    sad:   d.sad,
    angry: d.angry,
  }))

  return (
    // ✅ bg-card + border-border remplacent bg-white/dark:bg-slate-900 + border-slate-*
    <Card className="border-border bg-card h-full">
      <Tabs defaultValue="lines">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0 flex-wrap">
          <div>
            <CardTitle className="text-[14px] font-medium text-card-foreground">
              Évolution des métriques
            </CardTitle>
            <CardDescription className="text-[12px] mt-0.5 text-muted-foreground">
              Vues · Engagements · Abonnés · Réactions
            </CardDescription>
          </div>

          {/* ✅ bg-muted remplace bg-slate-100 dark:bg-slate-800 */}
          <TabsList className="h-8 bg-muted">
            <TabsTrigger
              value="lines"
              className="text-[12px] h-7 gap-1.5 cursor-pointer transition-colors"
            >
              <TrendingUp className="w-3 h-3" />
              Tendances
            </TabsTrigger>
            <TabsTrigger
              value="bars"
              className="text-[12px] h-7 gap-1.5 cursor-pointer transition-colors"
            >
              <span className="font-mono text-[10px]">▌▌</span>
              Réactions
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="pt-4 flex-1">
          {/* ── Onglet Tendances ── */}
          <TabsContent value="lines" className="mt-0">
            <Legend series={LINE_SERIES} isBar={false} />
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                />
                {LINE_SERIES.map(s => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: s.color }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* ── Onglet Réactions ── */}
          <TabsContent value="bars" className="mt-0">
            <Legend series={BAR_SERIES} isBar />
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={barData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                barGap={2}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: 'color-mix(in oklch, var(--foreground) 4%, transparent)' }}
                />
                {BAR_SERIES.map(s => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    fill={s.color}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={16}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}