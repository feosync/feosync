"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useParams } from "next/navigation";

// ─── shadcn/ui components ──────────────────────────────────────────────────────
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Period = "day" | "week" | "days_28";

interface ReactionValue {
  like: number; love: number; wow: number;
  haha: number; sad: number; angry: number;
}
interface MetricValue   { value: number; end_time: string | null }
interface ReactionEntry { period: Period | "lifetime"; values: { value: ReactionValue; end_time: string | null }[] }
interface MetricEntry   { name: string; period: Period | "lifetime"; values: MetricValue[] }

// ─── Static data ───────────────────────────────────────────────────────────────
const DATES_ISO = [
  "2026-03-21T07:00:00Z", "2026-03-22T07:00:00Z", "2026-03-23T07:00:00Z",
  "2026-03-24T07:00:00Z", "2026-03-25T07:00:00Z", "2026-03-26T07:00:00Z",
  "2026-03-27T07:00:00Z",
];

const mk = (name: string, period: Period, vals: number[]): MetricEntry => ({
  name, period,
  values: vals.map((value, i) => ({ value, end_time: DATES_ISO[i] })),
});

const PAGE_VIEWS: MetricEntry[] = [
  mk("page_views_total", "day",     [6, 3, 0, 0, 0, 0, 0]),
  mk("page_views_total", "week",    [30, 27, 24, 15, 12, 9, 9]),
  mk("page_views_total", "days_28", [643, 619, 594, 567, 556, 409, 276]),
];
const PAGE_ENGAGEMENTS: MetricEntry[] = [
  mk("page_post_engagements", "day",     [7, 9, 1, 1, 0, 0, 0]),
  mk("page_post_engagements", "week",    [47, 42, 31, 29, 25, 24, 18]),
  mk("page_post_engagements", "days_28", [512, 468, 444, 406, 392, 329, 307]),
];
const PAGE_FOLLOWS: MetricEntry[] = [
  mk("page_follows", "day",     Array(7).fill(34)),
  mk("page_follows", "week",    Array(7).fill(34)),
  mk("page_follows", "days_28", Array(7).fill(34)),
];

const mkR = (period: Period, rows: ReactionValue[]): ReactionEntry => ({
  period, values: rows.map((value, i) => ({ value, end_time: DATES_ISO[i] })),
});

const PAGE_REACTIONS: ReactionEntry[] = [
  { period: "lifetime", values: [{ value: { like: 0, love: 0, wow: 0, haha: 0, sad: 0, angry: 0 }, end_time: null }] },
  mkR("day", [
    { like: 7, love: 0, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 7, love: 1, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 1, love: 0, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 1, love: 0, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 0, love: 0, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 0, love: 0, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 0, love: 0, wow: 0, haha: 0, sad: 0, angry: 0 },
  ]),
  mkR("week", [
    { like: 37, love: 6, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 34, love: 5, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 27, love: 3, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 26, love: 2, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 23, love: 1, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 22, love: 1, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 16, love: 1, wow: 0, haha: 0, sad: 0, angry: 0 },
  ]),
  mkR("days_28", [
    { like: 297, love: 33, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 275, love: 33, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 263, love: 32, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 244, love: 26, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 236, love: 25, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 206, love: 14, wow: 0, haha: 0, sad: 0, angry: 0 },
    { like: 196, love: 12, wow: 0, haha: 0, sad: 0, angry: 0 },
  ]),
];

// ─── Config ────────────────────────────────────────────────────────────────────
const PERIOD_LABELS: Record<Period, string> = {
  day: "Aujourd'hui",
  week: "7 jours",
  days_28: "28 jours",
};

const LINE_SERIES = [
  { key: "views",       label: "Vues",        color: "#38bdf8" },  // sky-400
  { key: "engagements", label: "Engagements", color: "#4ade80" },  // green-400
  { key: "follows",     label: "Abonnés",     color: "#e879f9" },  // fuchsia-400
] as const;

const BAR_SERIES = [
  { key: "like",  label: "👍 J'aime",  color: "#60a5fa" },  // blue-400
  { key: "love",  label: "❤️ J'adore", color: "#f472b6" },  // pink-400
  { key: "haha",  label: "😂 Haha",    color: "#fbbf24" },  // amber-400
  { key: "angry", label: "😠 Grrr",    color: "#f87171" },  // red-400
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = (n: number) => n.toLocaleString("fr-FR");
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
const byPeriod = <T extends { period: Period | "lifetime" }>(arr: T[], p: Period) =>
  arr.find((e) => e.period === p);
const sumNum   = (e: MetricEntry | undefined) => e?.values.reduce((a, v) => a + v.value, 0) ?? 0;
const sumReact = (e: ReactionEntry | undefined, k: keyof ReactionValue) =>
  e?.values.reduce((a, v) => a + v.value[k], 0) ?? 0;

function buildLineData(period: Period) {
  const vv = byPeriod(PAGE_VIEWS, period)?.values ?? [];
  const ev = byPeriod(PAGE_ENGAGEMENTS, period)?.values ?? [];
  const fv = byPeriod(PAGE_FOLLOWS, period)?.values ?? [];
  return vv.map((v, i) => ({
    date:        v.end_time ? fmtDate(v.end_time) : `J${i + 1}`,
    views:       v.value,
    engagements: ev[i]?.value ?? 0,
    follows:     fv[i]?.value ?? 0,
  }));
}

function buildBarData(period: Period) {
  const rEntry = byPeriod(PAGE_REACTIONS, period);
  const vv     = byPeriod(PAGE_VIEWS, period)?.values ?? [];
  return vv.map((v, i) => ({
    date:  v.end_time ? fmtDate(v.end_time) : `J${i + 1}`,
    like:  rEntry?.values[i]?.value.like  ?? 0,
    love:  rEntry?.values[i]?.value.love  ?? 0,
    haha:  rEntry?.values[i]?.value.haha  ?? 0,
    angry: rEntry?.values[i]?.value.angry ?? 0,
  }));
}

// ─── Custom Tooltip (shadcn-style card) ────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card px-3 py-2 shadow-lg text-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="flex-1 text-muted-foreground">{p.name}</span>
          <span className="font-bold text-foreground">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, delta, trend,
}: {
  label: string;
  value: number | string;
  delta: string;
  trend?: "up" | "neutral" | "down";
}) {
  return (
    <Card className="border-border/50 hover:border-border transition-colors duration-200">
      <CardContent className="pt-4 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-3xl font-extrabold tracking-tight text-foreground leading-none mb-1">
          {typeof value === "number" ? fmt(value) : value}
        </p>
        <p
          className={cn(
            "text-xs",
            trend === "up"   ? "text-emerald-500" :
            trend === "down" ? "text-destructive"  :
            "text-muted-foreground",
          )}
        >
          {delta}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Sparkline mini card ───────────────────────────────────────────────────────
function SparkCard({
  label, total, period, values, color,
}: {
  label: string;
  total: number;
  period: string;
  values: number[];
  color: string;
}) {
  const max  = Math.max(...values, 1);
  const W = 80;
  const H = 32;
  const pts  = values
    .map((v, i) => `${(i / (values.length - 1)) * W},${H - (v / max) * H}`)
    .join(" ");

  return (
    <Card className="border-border/50">
      <CardContent className="flex items-center gap-4 pt-4 pb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1 truncate">
            {label}
          </p>
          <p className="text-2xl font-extrabold tracking-tight" style={{ color }}>
            {fmt(total)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Total sur {period}
          </p>
        </div>

        <svg width={W} height={H} className="flex-shrink-0 overflow-visible">
          <polyline
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
          {values.map((v, i) => (
            <circle
              key={i}
              cx={(i / (values.length - 1)) * W}
              cy={H - (v / max) * H}
              r={i === values.length - 1 ? 3 : 2}
              fill={color}
              opacity={i === values.length - 1 ? 1 : 0.4}
            />
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}

// ─── Chart Legend ──────────────────────────────────────────────────────────────
function ChartLegend({ series, isBar }: {
  series: readonly { key: string; label: string; color: string }[];
  isBar: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {series.map((s) => (
        <div key={s.key} className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className={cn("h-2.5 w-2.5 flex-shrink-0", isBar ? "rounded-sm" : "rounded-full")}
            style={{ background: s.color }}
          />
          {s.label}
        </div>
      ))}
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default function PageDeepAnalis() {
  const params = useParams()
  const [period, setPeriod] = useState<Period>("week");

  // Derived KPIs
  const rEntry = byPeriod(PAGE_REACTIONS, period);
  const kpis = useMemo(() => {
    const views       = sumNum(byPeriod(PAGE_VIEWS, period));
    const engagements = sumNum(byPeriod(PAGE_ENGAGEMENTS, period));
    const like        = sumReact(rEntry, "like");
    const love        = sumReact(rEntry, "love");
    const haha        = sumReact(rEntry, "haha");
    const angry       = sumReact(rEntry, "angry");
    const engRate     = views > 0 ? ((engagements / views) * 100).toFixed(1) : "0";
    return { views, engagements, engRate, like, love, haha, angry, follows: 34 };
  }, [period, rEntry]);

  const lineData = useMemo(() => buildLineData(period), [period]);
  const barData  = useMemo(() => buildBarData(period),  [period]);

  return (
    <div className="min-h-[80vh] bg-transparent text-foreground p-6 space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Facebook logo badge */}
          <div className="h-10 w-10 rounded-xl bg-[#1877f2] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#1877f240]">
            f
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1877f2]">
              Analyse de page
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight leading-none">
              Insights Dashboard
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              ID: {params.id}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Followers badge */}
          <Badge variant="outline" className="gap-1.5 text-sm font-semibold px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {fmt(kpis.follows)} abonnés
          </Badge>

          {/* Period selector using shadcn Tabs */}
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as Period)}
          >
            <TabsList>
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([p, label]) => (
                <TabsTrigger key={p} value={p} className="text-xs font-semibold">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Separator />

      {/* ── KPI GRID ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Vues"
          value={kpis.views}
          delta={PERIOD_LABELS[period]}
          trend="neutral"
        />
        <KpiCard
          label="Engagements"
          value={kpis.engagements}
          delta="Likes, com., partages"
          trend="up"
        />
        <KpiCard
          label="Taux eng."
          value={`${kpis.engRate}%`}
          delta="Eng. / Vues"
          trend={parseFloat(kpis.engRate) >= 5 ? "up" : "neutral"}
        />
        <KpiCard
          label="👍 J'aime"
          value={kpis.like}
          delta={PERIOD_LABELS[period]}
          trend="up"
        />
        <KpiCard
          label="❤️ J'adore"
          value={kpis.love}
          delta={PERIOD_LABELS[period]}
          trend="up"
        />
        <KpiCard
          label="😠 + 😂"
          value={kpis.angry + kpis.haha}
          delta="Grrr + Haha"
          trend="neutral"
        />
      </div>

      {/* ── MAIN CHART CARD ────────────────────────────────────────────────── */}
      <Card>
        <Tabs defaultValue="lines">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0 flex-wrap">
            <div>
              <CardTitle className="text-base font-bold">Évolution des métriques</CardTitle>
              <CardDescription className="text-xs mt-1">
                Vues · Engagements · Abonnés · Réactions
              </CardDescription>
            </div>

            {/* View toggle */}
            <TabsList className="h-8">
              <TabsTrigger value="lines" className="text-xs gap-1.5">
                <span className="font-mono text-[10px]">↗</span>
                Tendances
              </TabsTrigger>
              <TabsTrigger value="bars" className="text-xs gap-1.5">
                <span className="font-mono text-[10px]">▌▌</span>
                Réactions
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-4">
            {/* ── LINE CHART ── */}
            <TabsContent value="lines" className="mt-0">
              <ChartLegend series={LINE_SERIES} isBar={false} />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
                  {LINE_SERIES.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: s.color }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* ── BAR CHART ── */}
            <TabsContent value="bars" className="mt-0">
              <ChartLegend series={BAR_SERIES} isBar />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={3} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "color-mix(in oklch, var(--muted) 60%, transparent)" }} />
                  {BAR_SERIES.map((s) => (
                    <Bar
                      key={s.key}
                      dataKey={s.key}
                      name={s.label}
                      fill={s.color}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}