"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { usePageAnalysis } from "@/hooks/useAnalytics";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsKpiGrid } from "@/components/analytics/AnalyticsKpiGrid";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { AnalyticsErrorBanner } from "@/components/analytics/AnalyticsErrorBanner";
import type { AnalyticsPeriod } from "@/lib/api/types";
import { useFacebookPages } from "@/hooks/useFacebookPages";

/* ── Composant état vide ─────────────────────────────────────────────────── */
function EmptyState({ message }: { message: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16
                    bg-card border border-border rounded-lg text-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ── Skeleton loading ────────────────────────────────────────────────────── */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-3 w-28 rounded-md" />
        </div>
      </div>

      {/* KPI grid — 2 × 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Chart */}
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────────────────────── */
export default function PageAnalyticsDetail() {
  const params       = useParams();
  const searchParams = useSearchParams();

  const fbModelId = params.id as string;
  const orgId     = searchParams.get("org_id") ?? "";

  const { data: pages = [] } = useFacebookPages(orgId);
  const picture = pages.find((p) => p.id === fbModelId)?.fb_page_picture ?? "";

  const [period, setPeriod] = useState<AnalyticsPeriod>("week");

  const { data, isLoading, isFetching } = usePageAnalysis(fbModelId, orgId, period);

  /* ── Guard org_id ──────────────────────────────────────────────────────── */
  if (!orgId) {
    return (
      <EmptyState
        message={
          <>
            Paramètre <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">org_id</code> manquant dans l'URL.
          </>
        }
      />
    );
  }

  /* ── Loading ───────────────────────────────────────────────────────────── */
  if (isLoading) return <AnalyticsSkeleton />;

  /* ── No data ───────────────────────────────────────────────────────────── */
  if (!data) {
    return <EmptyState message="Aucune donnée disponible pour cette page." />;
  }

  /* ── Contenu ───────────────────────────────────────────────────────────── */
  return (
    <div
      className={`space-y-5 transition-opacity duration-200 ease-in-out
                  ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}
    >
      <AnalyticsHeader
        pageName={data.page_name}
        url={picture}
        followersTotal={data.followers_total}
        period={period}
        onPeriodChange={(p) => setPeriod(p)}
      />

      <Separator className="bg-border" />

      {Object.keys(data.errors).length > 0 && (
        <AnalyticsErrorBanner errors={data.errors} />
      )}

      <AnalyticsKpiGrid summary={data.summary} period={period} />

      <AnalyticsCharts daily={data.daily} />
    </div>
  );
}