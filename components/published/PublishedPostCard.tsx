"use client";

import { RefreshCw, ExternalLink, Eye, Users, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import type {
  PublishedPost,
  ScheduledPost,
  FacebookPage,
  AutoCommentRequest,
  FacebookPageResponse,
} from "@/lib/api/types";
import { AutoCommentPopover } from "@/components/published/AutoCommentPopover";
import { cn } from "@/lib/utils";

// Couleur de marque Facebook — isolée intentionnellement
const FB_BLUE = "#1877F2";

interface Props {
  post: PublishedPost;
  scheduledPost?: ScheduledPost;
  page?: FacebookPageResponse;
  onSyncMetrics: () => void;
  isSyncing?: boolean;
  onAutoComment: (payload: AutoCommentRequest) => void;
  isAutoCommenting?: boolean;
  onClick: () => void;
}

export function PublishedPostCard({
  post,
  scheduledPost,
  page,
  onSyncMetrics,
  isSyncing,
  onAutoComment,
  isAutoCommenting,
  onClick,
}: Props) {
  const coverImage = scheduledPost?.images?.[0] ?? null;
  const imageCount = scheduledPost?.images?.length ?? post.image_count ?? 0;
  const permalink =
    post.meta_permalink ??
    (post.post_id ? `https://facebook.com/${post.post_id}` : null);

  return (
    <div
      onClick={onClick}
      className="group relative bg-card border border-border rounded-xl overflow-hidden
                 shadow-sm hover:shadow-lg hover:-translate-y-0.5
                 transition-all duration-300 cursor-pointer"
    >
      {/* ── Image Area ── */}
      <div className="relative w-full aspect-square bg-muted overflow-hidden">
        {coverImage ? (
          <>
            <Image
              src={coverImage.image_url}
              alt="Publication"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              unoptimized
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

            {/* Multi-image indicator */}
            {imageCount > 1 && (
              <div
                className="absolute top-3 right-3 flex items-center gap-1
                             bg-black/60 backdrop-blur-md text-white text-xs
                             font-semibold px-2 py-0.5 rounded-lg z-10"
              >
                <Images className="w-3 h-3" />
                {imageCount}
              </div>
            )}
          </>
        ) : (
          /* Placeholder sans image */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center
                         text-white text-5xl font-bold shadow-md"
              style={{ backgroundColor: FB_BLUE, fontFamily: "Georgia, serif" }}
            >
              f
            </div>
          </div>
        )}

        {/* Actions au survol (haut gauche) */}
        <div
          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100
                        transition-all duration-200 flex gap-1.5 z-20"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AutoCommentPopover
              post={post}
              onSave={onAutoComment}
              isPending={isAutoCommenting}
              variant="icon"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-black/60 hover:bg-black/80 backdrop-blur-md
                       border border-white/10 text-white rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              onSyncMetrics();
            }}
            disabled={isSyncing}
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")}
            />
          </Button>

          {permalink && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/60 hover:bg-black/80 backdrop-blur-md
                         border border-background/10 text-foreground rounded-lg"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a href={permalink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* ── Card Content ── */}
      <div className="p-4 space-y-4">
        {/* Header : Page + Date */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo Facebook */}
            <div
              className="w-8 h-8  flex items-center justify-center
                         text-foreground text-sm font-bold shrink-0"
            >
              {page?.fb_page_picture ? (
                <img
                  src={page.fb_page_picture}
                  alt={page.page_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-xl  object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                  f
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-card-foreground text-sm leading-tight truncate">
                {page?.page_name || "Page Facebook"}
              </p>
              {/* Statut publié — couleur sémantique intentionnelle */}
              <div className="flex items-center gap-1 text-success text-[11px] mt-0.5">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                Publié
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground">
              {format(new Date(post.published_at), "d MMM yyyy", {
                locale: fr,
              })}
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
              {format(new Date(post.published_at), "HH:mm", { locale: fr })}
            </p>
          </div>
        </div>

        {/* Caption */}
        {scheduledPost?.caption && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-10">
            {scheduledPost.caption}
          </p>
        )}

        {/* Stats + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {/* Métriques */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span className="tabular-nums font-medium text-card-foreground">
                {post.initial_reach.toLocaleString("fr-FR")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span className="tabular-nums font-medium text-card-foreground">
                {post.initial_impressions.toLocaleString("fr-FR")}
              </span>
            </div>
          </div>

          {/* Bouton Voir */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90
                       text-primary-foreground px-3 py-1.5 rounded-lg text-xs
                       font-semibold transition-colors active:scale-[0.97]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Eye className="w-3.5 h-3.5" />
            Voir
          </button>
        </div>
      </div>
    </div>
  );
}
