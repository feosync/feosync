"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faChartBar,
  faRefresh,
  faHeart,
  faPlug,
  faArrowRight,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { FacebookPageResponse } from "@/lib/api/types";
import { useOrganisations } from "@/hooks/useOrganisations";
import { usePublishedPosts, useSyncMetrics } from "@/hooks/usePublishedPosts";
import {
  useFacebookPages,
  useFacebookInsights,
} from "@/hooks/useFacebookPages";
import { OrganisationSelector } from "@/components/organizations/OrgSelector";
import { OrgScopeFilter } from "@/components/organizations/OrgScopeFilter";
import type { ScopeFilter } from "@/components/organizations/OrgScopeFilter";

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: IconDefinition;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
          <FontAwesomeIcon icon={icon} className="w-3 h-3 text-primary" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-2xl font-semibold text-foreground tracking-tight">
        {value}
      </div>
    </div>
  );
}

function SocialNetworkCard({
  page,
  orgId,
  onSync,
  isSyncing,
}: {
  page: FacebookPageResponse;
  orgId: string;
  onSync: (e: React.MouseEvent) => void;
  isSyncing: boolean;
}) {
  const router = useRouter();
  const { data: insights = [] } = useFacebookInsights(page.id, orgId);
  const latest = insights[0];

  return (
    <div
      onClick={() => router.push(`/analytics/${page.id}?org_id=${orgId}`)}
      className="group bg-card border border-border rounded-2xl p-6 cursor-pointer
                 hover:border-primary hover:shadow-xl hover:-translate-y-0.5
                 transition-all duration-300 relative overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {page.fb_page_picture ? (
              <img
                src={page.fb_page_picture}
                alt={page.page_name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-sm">
                f
              </div>
            )}
            {page.is_active && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-card" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
              {page.page_name}
            </p>
            {page.fb_page_fan_count != null && page.fb_page_fan_count > 0 && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <span className="tabular-nums">
                  {page.fb_page_fan_count.toLocaleString()}
                </span>
                <span className="text-xs">abonnés</span>
              </p>
            )}
          </div>
        </div>

        <div
          className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 transition-colors ${
            page.is_active
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {page.is_active ? "Actif" : "Inactif"}
        </div>
      </div>

      {/* Métriques */}
      {latest ? (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Abonnés", value: latest.fans_total ?? 0, icon: faUsers },
            {
              label: "Impressions",
              value: latest.impressions_unique ?? 0,
              icon: faChartBar,
            },
            {
              label: "Engagement",
              value: latest.engaged_users ?? 0,
              icon: faHeart,
            },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-muted/50 dark:bg-muted/70 rounded-xl p-4 flex flex-col items-center gap-2
                         group-hover:bg-muted transition-colors duration-200 border border-transparent hover:border-primary/20"
            >
              <FontAwesomeIcon
                icon={icon}
                className="w-4 h-4 text-primary/70"
              />
              <p className="text-xl font-semibold tabular-nums text-foreground tracking-tight">
                {value.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                {label}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-muted/60 border border-dashed border-border rounded-2xl p-8 text-center mb-6">
          <p className="text-sm text-muted-foreground">
            Aucune donnée disponible
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Synchronise ta page pour voir les statistiques
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          Voir les statistiques détaillées
          <FontAwesomeIcon
            icon={faArrowRight}
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation(); // Important : empêche le clic de remonter sur la carte
            onSync(e);
          }}
          disabled={isSyncing}
          className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl
                     border border-border hover:border-primary/50 hover:bg-primary/5
                     transition-all duration-200 disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faRefresh}
            className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
          />
          Sync
        </button>
      </div>
    </div>
  );
}
// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyChannels() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
        <FontAwesomeIcon
          icon={faPlug}
          className="w-5 h-5 text-muted-foreground"
        />
      </div>
      <p className="text-sm font-semibold text-foreground">
        Aucun canal connecté
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
        Connectez une page Facebook pour voir vos statistiques ici
      </p>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [scope, setScope] = useState<ScopeFilter>("owned");

  const { data: orgData } = useOrganisations({ page: 1, page_size: 50, scope });
  const organisations = orgData?.items ?? [];
  const orgId = selectedOrgId || organisations[0]?.id || "";

  const { data: publishedData, isLoading } = usePublishedPosts(orgId, {
    page: 1,
    page_size: 3,
  });
  const published = publishedData?.items ?? [];

  const { data: pages = [], isLoading: pagesLoading } = useFacebookPages(orgId);
  const syncMutation = useSyncMetrics(orgId);

  return (
    <div className="space-y-10">
      {/* ── Header ── */}
      <div className="pb-6 border-b border-border space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
            Vue d'ensemble
          </p>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Analytics
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <OrgScopeFilter value={scope} onChange={setScope} />
          <div className="sm:ml-auto">
            <OrganisationSelector
              value={orgId}
              onChange={setSelectedOrgId}
              placeholder="Organisation"
              scope={scope}
            />
          </div>
        </div>
      </div>

      {/* ── Canaux connectés ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Canaux connectés
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pages.length} canal{pages.length > 1 ? "x" : ""} actif
              {pages.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {pagesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.length === 0 ? (
              <EmptyChannels />
            ) : (
              pages.map((page) => (
                <SocialNetworkCard
                  key={page.id}
                  page={page}
                  orgId={orgId}
                  onSync={(e) => {
                    e.stopPropagation();
                    syncMutation.mutate(page.id);
                  }}
                  isSyncing={syncMutation.isPending}
                />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
