"use client";

import { RefreshCw, ExternalLink, Eye, Users, Images, Play, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { isVideoUrl } from "@/lib/media";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import type {
  PublishedPost, ScheduledPost, AutoCommentRequest, FacebookPageResponse,
} from "@/lib/api/types";
import { AutoCommentPopover } from "@/components/published/AutoCommentPopover";

type PostType = "image" | "video" | "text" | "carousel";

function detectPostType(post: PublishedPost, scheduledPost?: ScheduledPost): PostType {
  const urls = post.media_urls ?? [];
  const scheduledImages = scheduledPost?.images ?? [];
  const allUrls = [...urls, ...scheduledImages.map(i => i.image_url)].filter(Boolean);
  const totalCount = allUrls.length || post.image_count || 0;

  if (post.post_type === "video" || post.post_type === "reel") return "video";

  const videoUrls = allUrls.filter(u => isVideoUrl(u));
  if (videoUrls.length > 0) return "video";

  const imageUrls = allUrls.filter(u => !isVideoUrl(u));
  if (imageUrls.length > 1) return "carousel";
  if (imageUrls.length === 1 && videoUrls.length === 0) return "image";

  if (totalCount > 1) return "carousel";
  if (totalCount === 1) return "image";
  if (scheduledPost?.caption) return "text";

  return "text";
}

function getFirstMedia(post: PublishedPost, scheduledPost?: ScheduledPost) {
  const urls = post.media_urls ?? [];
  const scheduledImages = scheduledPost?.images ?? [];
  if (urls.length > 0) return urls[0];
  if (scheduledImages.length > 0) return scheduledImages[0].image_url;
  return null;
}

function getPostMediaUrls(post: PublishedPost, scheduledPost?: ScheduledPost): string[] {
  const urls = post.media_urls ?? [];
  const scheduledImages = scheduledPost?.images ?? [];
  const fromScheduled = scheduledImages.map(i => i.image_url);
  return [...urls, ...fromScheduled].filter(Boolean);
}

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
  post, scheduledPost, page,
  onSyncMetrics, isSyncing,
  onAutoComment, isAutoCommenting, onClick,
}: Props) {
  const coverUrl = getFirstMedia(post, scheduledPost);
  const allMedia = getPostMediaUrls(post, scheduledPost);
  const coverIsVideo = coverUrl ? isVideoUrl(coverUrl) : false;
  const type = detectPostType(post, scheduledPost);
  const imageCount = allMedia.filter(u => !isVideoUrl(u)).length;
  const permalink = post.meta_permalink ?? (post.post_id ? `https://facebook.com/${post.post_id}` : null);
  const isText = type === "text";

  // ── Shared action buttons ──
  const actionButtons = (variant: "overlay" | "inline") => (
    <div className={cn(
      "flex gap-1.5 z-20",
      variant === "overlay" && "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200",
      variant === "inline" && "relative shrink-0",
    )}>
      <div onClick={(e) => e.stopPropagation()}>
        <AutoCommentPopover post={post} onSave={onAutoComment} isPending={isAutoCommenting} variant="icon" />
      </div>
      <Button
        variant="ghost" size="icon"
        className={cn(
          "h-8 w-8 rounded-lg",
          variant === "overlay" && "bg-background/60 hover:bg-background/80 backdrop-blur-md border border-white/10 text-white",
          variant === "inline" && "hover:bg-accent text-muted-foreground",
        )}
        onClick={(e) => { e.stopPropagation(); onSyncMetrics() }}
        disabled={isSyncing}
      >
        <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
      </Button>
      {permalink && (
        <Button
          variant="ghost" size="icon"
          className={cn(
            "h-8 w-8 rounded-lg",
            variant === "overlay" && "bg-background/60 hover:bg-background/80 backdrop-blur-md border border-background/10 text-white",
            variant === "inline" && "hover:bg-accent text-muted-foreground",
          )}
          asChild onClick={(e) => e.stopPropagation()}
        >
          <a href={permalink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
      )}
    </div>
  );

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-card border border-border rounded-xl overflow-hidden",
        "shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer",
        isText ? "hover:-translate-y-0.5" : "hover:-translate-y-0.5",
      )}
    >
      {/* ── Media / Visual Area ── */}
      <div className={cn("relative bg-muted overflow-hidden", !isText && "aspect-square")}>
        {coverIsVideo && coverUrl ? (
          <>
            <VideoPlayer src={coverUrl} className="absolute inset-0 w-full h-full" controls={false} muted loop />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-purple-600/80 text-white backdrop-blur-md">
                <Play className="w-2.5 h-2.5" />
                {post.post_type === "reel" ? "Reel" : "Vidéo"}
              </span>
            </div>
            {actionButtons("overlay")}
          </>
        ) : !coverIsVideo && coverUrl ? (
          <>
            <Image src={coverUrl} alt="Publication" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            {type === "carousel" && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2 py-0.5 rounded-lg z-10">
                <Images className="w-3 h-3" />{imageCount}
              </div>
            )}
            <div className="absolute top-3 left-3 z-10">
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase backdrop-blur-md",
                type === "carousel" && "bg-blue-600/80 text-white",
                type === "image" && "bg-emerald-600/80 text-white",
              )}>
                {type === "carousel" ? <Images className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                {type === "carousel" ? "Album" : "Photo"}
              </span>
            </div>
            {actionButtons("overlay")}
          </>
        ) : isText ? (
          <div className="w-full min-h-[220px] flex flex-col p-5 bg-card">
            {/* Page header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 overflow-hidden">
                {page?.fb_page_picture ? (
                  <img src={page.fb_page_picture} alt={page.page_name} referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover" />
                ) : "f"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">{page?.page_name || "Page Facebook"}</p>
                <p className="text-[11px] text-muted-foreground">{format(new Date(post.published_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0">
                <FileText className="w-2.5 h-2.5" />Texte
              </span>
            </div>

            {/* Text content */}
            {scheduledPost?.caption ? (
              <div className="flex-1 flex items-start">
                <p className="text-[15px] text-foreground/90 leading-relaxed whitespace-pre-wrap line-clamp-6" style={{ fontFamily: "Georgia, serif" }}>
                  {scheduledPost.caption}
                </p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground italic">Aucune description</p>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1 min-h-4" />

            {/* Stats + actions inline */}
            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="tabular-nums font-medium text-card-foreground">{post.initial_reach.toLocaleString("fr-FR")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="tabular-nums font-medium text-card-foreground">{post.initial_impressions.toLocaleString("fr-FR")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {actionButtons("inline")}
                <button
                  onClick={(e) => { e.stopPropagation(); onClick() }}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Eye className="w-3.5 h-3.5" />Voir
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Card Content (for media posts only) ── */}
      {!isText && (
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 flex items-center justify-center text-foreground text-sm font-bold shrink-0">
                {page?.fb_page_picture ? (
                  <img src={page.fb_page_picture} alt={page.page_name} referrerPolicy="no-referrer" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <div className="w-full h-full rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">f</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-card-foreground text-sm leading-tight truncate">{page?.page_name || "Page Facebook"}</p>
                <div className="flex items-center gap-1 text-success text-[11px] mt-0.5">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />Publié
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground">{format(new Date(post.published_at), "d MMM yyyy", { locale: fr })}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{format(new Date(post.published_at), "HH:mm", { locale: fr })}</p>
            </div>
          </div>

          {scheduledPost?.caption && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{scheduledPost.caption}</p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span className="tabular-nums font-medium text-card-foreground">{post.initial_reach.toLocaleString("fr-FR")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span className="tabular-nums font-medium text-card-foreground">{post.initial_impressions.toLocaleString("fr-FR")}</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onClick() }}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Eye className="w-3.5 h-3.5" />Voir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
