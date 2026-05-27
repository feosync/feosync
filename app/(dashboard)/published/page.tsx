"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  usePublishedPosts,
  useSyncMetrics,
  useDeletePublishedPost,
  useSetAutoComment,
} from "@/hooks/usePublishedPosts";
import { useScheduledPost } from "@/hooks/useScheduledPosts";
import { useOrganisations } from "@/hooks/useOrganisations";
import { useFacebookPages } from "@/hooks/useFacebookPages";
import { PublishedPostCard } from "@/components/published/PublishedPostCard";
import { PublishedPostDetailSheet } from "@/components/published/PublishedPostDetailSheet";
import { OrganisationSelector } from "@/components/organizations/OrgSelector";
import { useDebounce } from "@/hooks/useDebounce";
import type { AutoCommentRequest, PublishedPost } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

// ── Utils ─────────────────────────────────────────────────────────────────────

function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeeksOfMonth(year: number, month: number): number[] {
  const weeks = new Set<number>();
  const lastDay = new Date(year, month, 0).getDate();
  for (let day = 1; day <= lastDay; day++) {
    weeks.add(getISOWeekNumber(new Date(year, month - 1, day)));
  }
  return Array.from(weeks).sort((a, b) => a - b);
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 4; // multiple de 3 pour le grid 3 colonnes
const THIS_YEAR = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;
const CURRENT_WEEK = getISOWeekNumber(new Date());

const YEARS = Array.from({ length: 3 }, (_, i) => THIS_YEAR - i);

const MONTHS = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublishedPage() {
  const [selected, setSelected] = useState<PublishedPost | null>(null);

  // ── Org ───────────────────────────────────────────────────────────────────
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 });
  const orgId = selectedOrgId || orgData?.items[0]?.id || "";
  const { data: pages = [] } = useFacebookPages(orgId);

  const autoCommentMutation = useSetAutoComment(orgId);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [year, setYear] = useState<number | undefined>(THIS_YEAR);
  const [month, setMonth] = useState<number | undefined>(THIS_MONTH);
  const [week, setWeek] = useState<number | undefined>(CURRENT_WEEK);
  const [page, setPage] = useState(1);

  const availableWeeks = year && month ? getWeeksOfMonth(year, month) : [];

  const handleYear = (v: string) => {
    setYear(v !== "all" ? Number(v) : undefined);
    setWeek(undefined);
    setPage(1);
  };
  const handleMonth = (v: string) => {
    setMonth(v !== "all" ? Number(v) : undefined);
    setWeek(undefined);
    setPage(1);
  };
  const handleWeek = (v: string) => {
    setWeek(v !== "all" ? Number(v) : undefined);
    setPage(1);
  };
  const handleSearch = (v: string) => {
    setSearchInput(v);
    setPage(1);
  };

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = usePublishedPosts(orgId, {
    page,
    page_size: PAGE_SIZE,
    search,
    year,
    month,
    week,
  });

  const posts = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  const syncMutation = useSyncMetrics(orgId);
  const deleteMutation = useDeletePublishedPost(orgId);

  const disabledClass = (cond: boolean) =>
    cond ? "pointer-events-none opacity-50" : "cursor-pointer";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          {/* <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">Posts publiés</h1> */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} publication{total > 1 ? "s" : ""}
            {search && ` pour « ${search} »`}
          </p>
        </div>
        <div className="w-full flex items-center justify-start">
          <div className="w-full md:w-5/6  lg:w-1/3 xl:w-1/6">
            <OrganisationSelector
              value={selectedOrgId}
              onChange={(v) => {
                setSelectedOrgId(v);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            style={{ width: "0.875rem", height: "0.875rem" }}
          />
          <Input
            placeholder="Rechercher…"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-9 w-52 h-9 text-sm"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSearch("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-400 hover:text-slate-600"
            >
              <FontAwesomeIcon
                icon={faTimes}
                style={{ width: "0.875rem", height: "0.875rem" }}
              />
            </Button>
          )}
        </div>

        {/* Année */}
        <Select value={year ? String(year) : "all"} onValueChange={handleYear}>
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mois */}
        <Select
          value={month ? String(month) : "all"}
          onValueChange={handleMonth}
        >
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Semaine */}
        <Select
          value={week ? String(week) : "all"}
          onValueChange={handleWeek}
          disabled={!month}
        >
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder={month ? "Semaine" : "Choisir un mois"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {availableWeeks.map((w) => (
              <SelectItem key={w} value={String(w)}>
                Semaine {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Grille Pinterest ── */}
      <div
        className={`transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-60" : "opacity-100"}`}
      >
        {isLoading ? (
          /* Skeletons en grille masonry */
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-0">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="mb-4 break-inside-avoid">
                <Skeleton
                  className="w-full rounded-2xl"
                  style={{ height: `${180 + (i % 3) * 60}px` }}
                />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <ImageOff className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-[15px] font-medium text-slate-800 dark:text-white mb-1">
              Aucun post publié
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-xs">
              {search || year || month
                ? "Aucun résultat pour ces filtres. Essayez d'élargir votre recherche."
                : "Vos publications Facebook apparaîtront ici une fois publiées."}
            </p>
          </div>
        ) : (
          /* Masonry grid — chaque carte gère sa propre hauteur d'image */
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2">
            {posts.map((post) => (
              <div key={post.id} className="mb-4 break-inside-avoid">
                <PublishedPostCardWrapper
                  post={post}
                  pages={pages}
                  onSync={() => syncMutation.mutate(post.id)}
                  isSyncing={syncMutation.isPending}
                  onClick={() => setSelected(post)}
                  onAutoComment={(payload) =>
                    autoCommentMutation.mutate({ postId: post.id, payload })
                  }
                  isAutoCommenting={autoCommentMutation.isPending}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between pt-1">
          <p className="text-sm text-slate-500">
            Page {page} sur {totalPages} — {total} résultat
            {total > 1 ? "s" : ""}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={disabledClass(page === 1 || isFetching)}
                />
              </PaginationItem>

              {page > 2 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setPage(1)}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {page > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {page > 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setPage(page - 1)}
                    className="cursor-pointer"
                  >
                    {page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>

              {page < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setPage(page + 1)}
                    className="cursor-pointer"
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {page < totalPages - 1 && (
                <>
                  {page < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setPage(totalPages)}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={disabledClass(page === totalPages || isFetching)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ── Sheet détail ── */}
      {selected && (
        <PublishedPostDetailSheetWrapper
          post={selected}
          pages={pages}
          onClose={() => setSelected(null)}
          onSync={() => syncMutation.mutate(selected.id)}
          onDelete={() => {
            deleteMutation.mutate(selected.id);
            setSelected(null);
          }}
          isSyncing={syncMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onAutoComment={(payload) =>
            autoCommentMutation.mutate({ postId: selected.id, payload })
          }
          isAutoCommenting={autoCommentMutation.isPending}
        />
      )}
    </div>
  );
}

// ── Wrappers ──────────────────────────────────────────────────────────────────

function PublishedPostCardWrapper({
  post,
  pages,
  onSync,
  isSyncing,
  onAutoComment,
  isAutoCommenting,
  onClick,
}: {
  post: PublishedPost;
  pages: any[];
  onSync: () => void;
  isSyncing?: boolean;
  onAutoComment: (payload: AutoCommentRequest) => void;
  isAutoCommenting?: boolean;
  onClick: () => void;
}) {
  const { data: scheduledPost } = useScheduledPost(post.scheduled_post_id);
  const page = pages.find((p) => p.id === post.facebook_page_id);
  return (
    <PublishedPostCard
      post={post}
      scheduledPost={scheduledPost}
      page={page}
      onSyncMetrics={onSync}
      isSyncing={isSyncing}
      onAutoComment={onAutoComment}
      isAutoCommenting={isAutoCommenting}
      onClick={onClick}
    />
  );
}

function PublishedPostDetailSheetWrapper({
  post,
  pages,
  onClose,
  onSync,
  onDelete,
  isSyncing,
  isDeleting,
  onAutoComment,
  isAutoCommenting,
}: {
  post: PublishedPost;
  pages: any[];
  onClose: () => void;
  onSync: () => void;
  onDelete: () => void;
  isSyncing?: boolean;
  isDeleting?: boolean;
  onAutoComment: (payload: AutoCommentRequest) => void;
  isAutoCommenting?: boolean;
}) {
  const { data: scheduledPost } = useScheduledPost(post.scheduled_post_id);
  const page = pages.find((p) => p.id === post.facebook_page_id);
  return (
    <PublishedPostDetailSheet
      open
      onClose={onClose}
      post={post}
      scheduledPost={scheduledPost}
      page={page}
      onSyncMetrics={onSync}
      onDelete={onDelete}
      isSyncing={isSyncing}
      isDeleting={isDeleting}
      onAutoComment={onAutoComment}
      isAutoCommenting={isAutoCommenting}
    />
  );
}
