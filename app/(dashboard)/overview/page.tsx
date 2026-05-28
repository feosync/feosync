"use client";

import { useState } from "react";
import { useOrganisations } from "@/hooks/useOrganisations";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import { usePublishedPosts } from "@/hooks/usePublishedPosts";
import { useFacebookPages } from "@/hooks/useFacebookPages";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCheckCircle,
  faPencil,
  faCircle,
  faPlus,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrganisationSelector } from "@/components/organizations/OrgSelector";

// ── Design tokens sémantiques ────────────────────────────────────────────────
const STAT_CONFIG = {
  success: {
    classes: "bg-card border border-border",
    iconClasses: "bg-primary/10 text-primary",
    valueClasses: "text-foreground",
    dot: "bg-primary",
  },
  scheduled: {
    classes: "bg-card border border-border",
    iconClasses: "bg-primary/10 text-primary",
    valueClasses: "text-foreground",
    dot: "bg-primary",
  },
  draft: {
    classes: "bg-card border border-border",
    iconClasses: "bg-muted text-muted-foreground",
    valueClasses: "text-foreground",
    dot: "bg-muted-foreground",
  },
  failed: {
    classes: "bg-card border border-border",
    iconClasses: "bg-destructive/10 text-destructive",
    valueClasses: "text-foreground",
    dot: "bg-destructive",
  },
} as const;

type StatVariant = keyof typeof STAT_CONFIG;

function StatCard({
  label,
  value,
  icon: iconDef,
  variant,
  trend,
}: {
  label: string;
  value: number;
  icon: any;
  variant: StatVariant;
  trend?: string;
}) {
  const cfg = STAT_CONFIG[variant];
  return (
    <div className={`rounded-xl p-5 ${cfg.classes} transition-shadow hover:shadow-sm`}>
      {/* Icône + label */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.iconClasses}`}>
          <FontAwesomeIcon icon={iconDef} className="w-4 h-4" />
        </div>
        {/* Indicateur de statut discret */}
        <span className={`w-1.5 h-1.5 rounded-full mt-1 ${cfg.dot}`} />
      </div>
      {/* Valeur */}
      <div className={`text-3xl font-semibold tracking-tight ${cfg.valueClasses}`}>
        {value}
      </div>
      {/* Label + trend */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {trend && (
          <span className="text-[10px] text-primary flex items-center gap-0.5">
            <FontAwesomeIcon icon={faArrowTrendUp} className="w-2.5 h-2.5" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Composant item publication ───────────────────────────────────────────────
function PostItem({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
        {children}
      </div>
    </Link>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function OverviewPage() {
  const { user } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 });
  const organisations = orgData?.items ?? [];
  const orgId = selectedOrgId || organisations[0]?.id || "";

  const { data: draftData, isLoading: l1 } = useScheduledPosts(orgId, { status: "DRAFT", page: 1, page_size: 1 });
  const { data: scheduledData, isLoading: l2 } = useScheduledPosts(orgId, { status: "SCHEDULED", page: 1, page_size: 3 });
  const { data: failedData, isLoading: l3 } = useScheduledPosts(orgId, { status: "FAILED", page: 1, page_size: 1 });
  const { data: publishedData, isLoading: l4 } = usePublishedPosts(orgId, { page: 1, page_size: 7 });

  const published = publishedData?.items ?? [];
  const publishedTotal = publishedData?.total ?? 0;
  const { data: pages = [] } = useFacebookPages(orgId);
  const isLoading = l1 || l2 || l3 || l4;

  const upcoming = (scheduledData?.items ?? [])
    .filter((p) => p.publish_at)
    .sort((a, b) => new Date(a.publish_at!).getTime() - new Date(b.publish_at!).getTime())
    .slice(0, 3);
  return (
    <div className="space-y-8 max-w-full h-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Bonjour, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Voici un aperçu de vos publications
          </p>
        </div>
        <Link href="/posts/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-4 h-9 text-sm font-medium transition-all hover:shadow-md">
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            Nouveau post
          </Button>
        </Link>
      </div>

      {/* ── Sélecteur d'organisation ── */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Organisation
        </span>
        <div className="min-w-45">
          <OrganisationSelector value={selectedOrgId} onChange={setSelectedOrgId} />
        </div>
      </div>

      {/* ── Stat cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Publiés" value={publishedTotal} icon={faCheckCircle} variant="success" />
          <StatCard label="Planifiés" value={scheduledData?.total ?? 0} icon={faCalendar} variant="scheduled" />
          <StatCard label="Brouillons" value={draftData?.total ?? 0} icon={faPencil} variant="draft" />
          <StatCard label="Échoués" value={failedData?.total ?? 0} icon={faCircle} variant="failed" />
        </div>
      )}

      {/* ── Grille principale ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
        {/* Prochaines publications */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header section */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h2 className="text-sm font-semibold text-card-foreground">
                Prochaines publications
              </h2>
            </div>
            {upcoming.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-3">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Aucune publication planifiée
                </p>
                <Link href="/posts/new">
                  <Button variant="outline" size="sm"
                    className="text-xs border-border hover:bg-accent transition-colors h-8 px-3">
                    Créer un post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-0.5">
                {upcoming.map((post) => {
                  const page = pages.find((p) => p.id === Object.values(post.page_ids || {})[0]);
                  return (
                    <PostItem key={post.id} href={`/posts/${post.id}`}>
                      {/* Avatar Facebook */}
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                        f
                      </div>
                      {/* Texte */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate leading-tight">
                          {post.caption?.slice(0, 48) || "Sans caption"}…
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {page?.page_name && <span>{page.page_name} · </span>}
                          {format(new Date(post.publish_at!), "d MMM 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                      {/* Flèche au hover */}
                      <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        →
                      </span>
                    </PostItem>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header section */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-muted-foreground/40 rounded-full" />
              <h2 className="text-sm font-semibold text-card-foreground">
                Activité récente
              </h2>
            </div>
            {published.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {publishedTotal} publiés
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-3">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : published.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Aucun post publié</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {published.map((p) => (
                  <div key={p.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Dot indicateur */}
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground leading-tight">
                          Post publié
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(p.published_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                    {/* Portée */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary tabular-nums">
                        {p.initial_reach.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        portée
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}