"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, TrendingUp, Eye, Users, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "day" | "week" | "days_28";
interface ReactionValue { like: number; love: number; wow: number; haha: number; sad: number; angry: number }
interface MetricValue   { value: number; end_time: string | null }
interface ReactionEntry { period: Period | "lifetime"; values: { value: ReactionValue; end_time: string | null }[] }
interface MetricEntry   { name: string; period: Period | "lifetime"; values: MetricValue[] }

// ─── Static data ──────────────────────────────────────────────────────────────
const DATES_ISO = [
  "2026-03-21T07:00:00Z","2026-03-22T07:00:00Z","2026-03-23T07:00:00Z",
  "2026-03-24T07:00:00Z","2026-03-25T07:00:00Z","2026-03-26T07:00:00Z","2026-03-27T07:00:00Z",
];
const mk = (name: string, period: Period, vals: number[]): MetricEntry => ({
  name, period, values: vals.map((value, i) => ({ value, end_time: DATES_ISO[i] })),
});
const PAGE_VIEWS: MetricEntry[] = [
  mk("page_views_total","day",[6,3,0,0,0,0,0]),
  mk("page_views_total","week",[30,27,24,15,12,9,9]),
  mk("page_views_total","days_28",[643,619,594,567,556,409,276]),
];
const PAGE_ENGAGEMENTS: MetricEntry[] = [
  mk("page_post_engagements","day",[7,9,1,1,0,0,0]),
  mk("page_post_engagements","week",[47,42,31,29,25,24,18]),
  mk("page_post_engagements","days_28",[512,468,444,406,392,329,307]),
];
const PAGE_FOLLOWS: MetricEntry[] = [
  mk("page_follows","day",Array(7).fill(34)),
  mk("page_follows","week",Array(7).fill(34)),
  mk("page_follows","days_28",Array(7).fill(34)),
];
const mkR = (period: Period, rows: ReactionValue[]): ReactionEntry => ({
  period, values: rows.map((value, i) => ({ value, end_time: DATES_ISO[i] })),
});
const PAGE_REACTIONS: ReactionEntry[] = [
  { period: "lifetime", values: [{ value: { like:0,love:0,wow:0,haha:0,sad:0,angry:0 }, end_time: null }] },
  mkR("day",[
    {like:7,love:0,wow:0,haha:0,sad:0,angry:0},{like:7,love:1,wow:0,haha:0,sad:0,angry:0},
    {like:1,love:0,wow:0,haha:0,sad:0,angry:0},{like:1,love:0,wow:0,haha:0,sad:0,angry:0},
    {like:0,love:0,wow:0,haha:0,sad:0,angry:0},{like:0,love:0,wow:0,haha:0,sad:0,angry:0},
    {like:0,love:0,wow:0,haha:0,sad:0,angry:0},
  ]),
  mkR("week",[
    {like:37,love:6,wow:0,haha:0,sad:0,angry:0},{like:34,love:5,wow:0,haha:0,sad:0,angry:0},
    {like:27,love:3,wow:0,haha:0,sad:0,angry:0},{like:26,love:2,wow:0,haha:0,sad:0,angry:0},
    {like:23,love:1,wow:0,haha:0,sad:0,angry:0},{like:22,love:1,wow:0,haha:0,sad:0,angry:0},
    {like:16,love:1,wow:0,haha:0,sad:0,angry:0},
  ]),
  mkR("days_28",[
    {like:297,love:33,wow:0,haha:0,sad:0,angry:0},{like:275,love:33,wow:0,haha:0,sad:0,angry:0},
    {like:263,love:32,wow:0,haha:0,sad:0,angry:0},{like:244,love:26,wow:0,haha:0,sad:0,angry:0},
    {like:236,love:25,wow:0,haha:0,sad:0,angry:0},{like:206,love:14,wow:0,haha:0,sad:0,angry:0},
    {like:196,love:12,wow:0,haha:0,sad:0,angry:0},
  ]),
];

// ─── Config ───────────────────────────────────────────────────────────────────
const PERIOD_LABELS: Record<Period, string> = { day: "Aujourd'hui", week: "7 jours", days_28: "28 jours" };

const LINE_SERIES = [
  { key: "views",       label: "Vues",        color: "#2563eb" },
  { key: "engagements", label: "Engagements", color: "#16a34a" },
  { key: "follows",     label: "Abonnés",     color: "#9333ea" },
] as const;

const BAR_SERIES = [
  { key: "like",  label: "👍 J'aime",  color: "#2563eb" },
  { key: "love",  label: "❤️ J'adore", color: "#e11d48" },
  { key: "haha",  label: "😂 Haha",    color: "#d97706" },
  { key: "angry", label: "😠 Grrr",    color: "#dc2626" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (n: number) => n.toLocaleString("fr-FR");
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
const byPeriod = <T extends { period: Period | "lifetime" }>(arr: T[], p: Period) => arr.find(e => e.period === p);
const sumNum   = (e: MetricEntry | undefined) => e?.values.reduce((a, v) => a + v.value, 0) ?? 0;
const sumReact = (e: ReactionEntry | undefined, k: keyof ReactionValue) => e?.values.reduce((a, v) => a + v.value[k], 0) ?? 0;

function buildLineData(period: Period) {
  const vv = byPeriod(PAGE_VIEWS, period)?.values ?? [];
  const ev = byPeriod(PAGE_ENGAGEMENTS, period)?.values ?? [];
  const fv = byPeriod(PAGE_FOLLOWS, period)?.values ?? [];
  return vv.map((v, i) => ({
    date: v.end_time ? fmtDate(v.end_time) : `J${i+1}`,
    views: v.value, engagements: ev[i]?.value ?? 0, follows: fv[i]?.value ?? 0,
  }));
}
function buildBarData(period: Period) {
  const rEntry = byPeriod(PAGE_REACTIONS, period);
  const vv = byPeriod(PAGE_VIEWS, period)?.values ?? [];
  return vv.map((v, i) => ({
    date: v.end_time ? fmtDate(v.end_time) : `J${i+1}`,
    like: rEntry?.values[i]?.value.like ?? 0,
    love: rEntry?.values[i]?.value.love ?? 0,
    haha: rEntry?.values[i]?.value.haha ?? 0,
    angry: rEntry?.values[i]?.value.angry ?? 0,
  }));
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-lg text-[13px]">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="flex-1 text-slate-500 dark:text-slate-400">{p.name}</span>
          <span className="font-semibold text-slate-900 dark:text-white">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: number | string; sub: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium opacity-80">{label}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="text-[24px] font-semibold leading-none mb-1">
        {typeof value === "number" ? fmt(value) : value}
      </div>
      <div className="text-[11px] opacity-70">{sub}</div>
    </div>
  );
}

// ─── Chart Legend ─────────────────────────────────────────────────────────────
function ChartLegend({ series, isBar }: {
  series: readonly { key: string; label: string; color: string }[]; isBar: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {series.map(s => (
        <div key={s.key} className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
          <span className={cn("h-2.5 w-2.5 flex-shrink-0", isBar ? "rounded-sm" : "rounded-full")}
            style={{ background: s.color }} />
          {s.label}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PageDeepAnalis() {
  const params = useParams();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("week");

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
  const barData  = useMemo(() => buildBarData(period), [period]);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              f
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-medium text-slate-900 dark:text-white">
                  Insights de la page
                </h1>
                <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-0 text-[11px] gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                ID: {params.id ?? "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Abonnés */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
              {fmt(kpis.follows)} abonnés
            </span>
          </div>

          {/* Période */}
          <Tabs value={period} onValueChange={v => setPeriod(v as Period)}>
            <TabsList className="h-8 bg-slate-100 dark:bg-slate-800">
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([p, label]) => (
                <TabsTrigger key={p} value={p} className="text-[12px] h-7">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Separator className="bg-slate-200 dark:bg-slate-800" />

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Vues"          value={kpis.views}
          sub={PERIOD_LABELS[period]}
          icon={Eye}            color="bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200"
        />
        <StatCard
          label="Engagements"   value={kpis.engagements}
          sub="Likes · Com. · Partages"
          icon={TrendingUp}     color="bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-200"
        />
        <StatCard
          label="Taux eng."     value={`${kpis.engRate}%`}
          sub="Eng. / Vues"
          icon={TrendingUp}     color="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        />
        <StatCard
          label="👍 J'aime"     value={kpis.like}
          sub={PERIOD_LABELS[period]}
          icon={Heart}          color="bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200"
        />
        <StatCard
          label="❤️ J'adore"   value={kpis.love}
          sub={PERIOD_LABELS[period]}
          icon={Heart}          color="bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200"
        />
        <StatCard
          label="😠 + 😂"       value={kpis.angry + kpis.haha}
          sub="Grrr + Haha"
          icon={Heart}          color="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200"
        />
      </div>

      {/* ── Main Chart ── */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Tabs defaultValue="lines">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0 flex-wrap">
            <div>
              <CardTitle className="text-[14px] font-medium text-slate-900 dark:text-white">
                Évolution des métriques
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                Vues · Engagements · Abonnés · Réactions
              </CardDescription>
            </div>
            <TabsList className="h-8 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="lines" className="text-[12px] h-7 gap-1.5">
                <TrendingUp className="w-3 h-3" />
                Tendances
              </TabsTrigger>
              <TabsTrigger value="bars" className="text-[12px] h-7 gap-1.5">
                <span className="font-mono text-[10px]">▌▌</span>
                Réactions
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Line chart */}
            <TabsContent value="lines" className="mt-0">
              <ChartLegend series={LINE_SERIES} isBar={false} />
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
                  {LINE_SERIES.map(s => (
                    <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color}
                      strokeWidth={2} dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: s.color }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* Bar chart */}
            <TabsContent value="bars" className="mt-0">
              <ChartLegend series={BAR_SERIES} isBar />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={3} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  {BAR_SERIES.map(s => (
                    <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color}
                      radius={[4, 4, 0, 0]} maxBarSize={24} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* ── Résumé textuel ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            title: "Portée",
            value: fmt(kpis.views),
            detail: `${kpis.views} personnes ont vu votre contenu sur ${PERIOD_LABELS[period].toLowerCase()}.`,
            color: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20",
          },
          {
            title: "Engagement",
            value: `${kpis.engRate}%`,
            detail: `${fmt(kpis.engagements)} interactions sur ${fmt(kpis.views)} vues.`,
            color: "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
          },
          {
            title: "Réactions",
            value: fmt(kpis.like + kpis.love + kpis.haha + kpis.angry),
            detail: `${fmt(kpis.like)} j'aime · ${fmt(kpis.love)} j'adore · ${fmt(kpis.haha + kpis.angry)} autres`,
            color: "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20",
          },
        ].map(({ title, value, detail, color }) => (
          <div key={title} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className="text-[20px] font-semibold text-slate-900 dark:text-white mb-1">{value}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}