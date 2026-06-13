"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { PostsOrgSelector } from "@/app/(dashboard)/posts/_components/PostsOrgSelector";
import { OrgScopeFilter } from "@/components/organizations/OrgScopeFilter";
import type { ScopeFilter } from "@/components/organizations/OrgScopeFilter";
import { PostsSearchBar } from "@/app/(dashboard)/posts/_components/PostsSearchBar";
import { PostsFiltersPanel } from "@/app/(dashboard)/posts/_components/PostsFiltersPanel";
import { useDebounce } from "@/hooks/useDebounce";
import type { AutoCommentRequest, FacebookPageResponse, PublishedPost } from "@/lib/api/types";

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

const PAGE_SIZE = 4;
const THIS_YEAR = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;
const CURRENT_WEEK = getISOWeekNumber(new Date());

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublishedPage() {
  const [selected, setSelected] = useState<PublishedPost | null>(null);

  // ── Org ───────────────────────────────────────────────────────────────────
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("owned");
  const { data: orgData } = useOrganisations({ page: 1, page_size: 10, scope });
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableWeeks = year && month ? getWeeksOfMonth(year, month) : [];
  const activeFilterCount = [
    year !== THIS_YEAR,
    month !== THIS_MONTH,
    week !== CURRENT_WEEK,
  ].filter(Boolean).length;

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
    cond ? "pointer-events-none opacity-40" : "cursor-pointer";

  return (
    <div className="space-y-5.5">
      {/* ── Header ── */}
      <div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Post publié ({total} post{total > 1 ? "s" : ""})
          </h1>
        </div>
      </div>

      {/* ── Scope + Organisation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <OrgScopeFilter value={scope} onChange={setScope} />
        <div className="sm:ml-auto">
          <PostsOrgSelector
            value={selectedOrgId}
            onChange={(v) => {
              setSelectedOrgId(v);
              setPage(1);
            }}
            scope={scope}
          />
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="space-y-2">
        <PostsSearchBar
          searchInput={searchInput}
          onSearch={handleSearch}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen(o => !o)}
          activeFilterCount={activeFilterCount}
        />
        {filtersOpen && (
          <PostsFiltersPanel
            year={year}
            month={month}
            week={week}
            availableWeeks={availableWeeks}
            activeFilterCount={activeFilterCount}
            onYear={handleYear}
            onMonth={handleMonth}
            onWeek={handleWeek}
            onReset={() => {
              setYear(THIS_YEAR); setMonth(THIS_MONTH); setWeek(CURRENT_WEEK); setPage(1)
            }}
          />
        )}
      </div>

      {/* ── Grille masonry ── */}
      <div
        className={`transition-all duration-300 ${
          isFetching && !isLoading
            ? "opacity-50 scale-[0.995]"
            : "opacity-100 scale-100"
        }`}
      >
        {isLoading ? (
          /* Skeletons masonry — hauteurs variées pour effet naturel */
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-2">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="mb-2 break-inside-avoid">
                <Skeleton
                  className="w-full rounded-xl "
                  style={{ height: `${400 + Math.random() * 20 * 10}px` }}
                />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-dashed border-border bg-muted/20 dark:bg-muted/10">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ImageOff className="w-6 h-6 text-primary" />
            </div>
            <p className="text-[15px] font-semibold text-foreground mb-1">
              Aucun post publié
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
              {search || year || month
                ? "Aucun résultat pour ces filtres. Essayez d'élargir votre recherche."
                : "Vos publications Facebook apparaîtront ici une fois publiées."}
            </p>
          </div>
        ) : (
          /* Masonry grid */
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-2">
            {posts.map((post) => (
              <div key={post.id} className="mb-2 break-inside-avoid">
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
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> sur{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
            {" — "}
            <span className="font-medium text-foreground">{total}</span>{" "}
            résultat{total > 1 ? "s" : ""}
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

// ── Wrappers (inchangés) ──────────────────────────────────────────────────────

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
  pages: FacebookPageResponse[];
  onSync: () => void;
  isSyncing?: boolean;
  onAutoComment: (payload: AutoCommentRequest) => void;
  isAutoCommenting?: boolean;
  onClick: () => void;
}) {
  const { data: scheduledPost } = useScheduledPost(post.scheduled_post_id);
  const page: FacebookPageResponse | undefined = pages.find((p) => p.id === post.facebook_page_id);
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
  pages: FacebookPageResponse[];
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
