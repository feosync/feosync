"use client";

import { Button } from "@/components/ui/button";
import {
  Loader2,
  Calendar,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Type,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ScheduledPost, FacebookPage } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StepConfirmProps {
  post: ScheduledPost;
  pages: FacebookPage[];
  publishAt: string;
  isLoading: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function StepConfirm({
  post,
  pages,
  publishAt,
  isLoading,
  onConfirm,
  onBack,
}: StepConfirmProps) {
  const page = pages.find((p) => p.id === Object.values(post.page_ids)[0]);
  const firstImage = post.images?.[0] ?? null;
  const imageCount = post.images?.length ?? 0;
  const canConfirm = !!post.caption || imageCount > 0;
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const checklist = [
    {
      id: "page",
      label: "Page",
      ok: !!page,
      value: page?.page_name ?? "Non sélectionnée",
      icon: Globe,
    },
    {
      id: "caption",
      label: "Caption",
      ok: !!post.caption,
      value: post.caption ? `${post.caption.length} caractères` : "Non rédigé",
      tooltip: post.caption || undefined,
      icon: Type,
    },
    {
      id: "images",
      label: "Images",
      ok: imageCount > 0,
      value: imageCount > 0 ? `${imageCount} image${imageCount > 1 ? "s" : ""}` : "Aucune",
      icon: ImageIcon,
    },
    {
      id: "date",
      label: "Publication",
      ok: !!publishAt,
      value: publishAt
        ? format(new Date(publishAt), "d MMM yyyy", { locale: fr })
        : "Non définie",
      tooltip: publishAt
        ? format(new Date(publishAt), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
        : undefined,
      icon: Calendar,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Preview card ── */}
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        {/* Image zone */}
        <div className="relative aspect-video bg-muted">
          {firstImage ? (
            <>
              <Image
                src={firstImage.image_url}
                alt="Aperçu"
                fill
                className="object-cover"
                unoptimized
              />
              {imageCount > 1 && (
                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  +{imageCount - 1}
                </span>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="w-8 h-8 opacity-30" />
              <span className="text-xs">Aucune image</span>
            </div>
          )}
        </div>

        {/* Caption preview */}
        {post.caption && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
              {post.caption}
            </p>
          </div>
        )}
      </div>

      {/* ── Checklist ── */}
      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border overflow-hidden bg-card">
        {checklist.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="relative flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
              onMouseEnter={() => item.tooltip && setActiveTooltip(item.id)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Status dot */}
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0",
                  item.ok ? "bg-emerald-500" : "bg-amber-400"
                )}
              />

              {/* Icon */}
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />

              {/* Label */}
              <span className="text-sm text-muted-foreground w-20 flex-shrink-0">
                {item.label}
              </span>

              {/* Value */}
              <span
                className={cn(
                  "text-sm font-medium ml-auto",
                  item.ok ? "text-foreground" : "text-amber-500"
                )}
              >
                {item.value}
              </span>

              {/* Tooltip */}
              {activeTooltip === item.id && item.tooltip && (
                <div className="absolute right-4 top-full mt-1.5 z-50 bg-popover border border-border text-popover-foreground text-xs px-3 py-2 rounded-xl shadow-lg max-w-[280px] text-right">
                  {item.tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Warning ── */}
      {!canConfirm && (
        <div className="flex items-start gap-2.5 text-amber-600 dark:text-amber-400 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">Un caption ou au moins une image est requis.</p>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-10 px-5 text-sm"
        >
          ← Modifier
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!canConfirm || isLoading}
          className="flex-1 h-10 text-sm font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Planification…
            </>
          ) : (
            "Confirmer & Planifier"
          )}
        </Button>
      </div>
    </div>
  );
}