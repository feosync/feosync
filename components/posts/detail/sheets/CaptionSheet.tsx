"use client";

import { Sparkles, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCurrentUserDetail } from "@/hooks/useCurrentUserDetail";
import { checkCanGenerateCaption } from "@/lib/api/plan-limits";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  captionMode: "manual" | "llm";
  setCaptionMode: (m: "manual" | "llm") => void;
  captionText: string;
  setCaptionText: (v: string) => void;
  aiTopic: string;
  setAiTopic: (v: string) => void;
  aiLang: string;
  setAiLang: (v: string) => void;
  onSave: () => void;
  isPending?: boolean;
}

export function CaptionSheet({
  open,
  onClose,
  captionMode,
  setCaptionMode,
  captionText,
  setCaptionText,
  aiTopic,
  setAiTopic,
  aiLang,
  setAiLang,
  onSave,
  isPending,
}: Props) {
  const { data: userDetail } = useCurrentUserDetail();

  const saveDisabled =
    isPending ||
    (captionMode === "manual" && !captionText.trim()) ||
    (captionMode === "llm" && !aiTopic.trim());

  const handleSave = () => {
    if (captionMode === "llm" && !checkCanGenerateCaption(userDetail)) return;
    onSave();
  };

  const isLlm = captionMode === "llm";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-lg flex flex-col overflow-y-auto p-4",
          "bg-card border-l border-border",
        )}
      >
        {/* ── Header ── */}
        <SheetHeader className="mb-5">
          <SheetTitle className="text-base font-semibold text-card-foreground tracking-tight">
            Modifier le caption
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground leading-relaxed">
            Rédigez manuellement ou laissez l'IA générer pour vous.
          </SheetDescription>
        </SheetHeader>

        {/* ── Toggle manuel / IA ── */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-5">
          {(["manual", "llm"] as const).map((m) => {
            const active = captionMode === m;
            return (
              <button
                key={m}
                onClick={() => {
                  if (m === "llm" && !checkCanGenerateCaption(userDetail))
                    return;
                  setCaptionMode(m);
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] rounded-md",
                  "transition-all duration-150 font-medium",
                  active
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "llm" && (
                  <Sparkles
                    className={cn(
                      "w-3.5 h-3.5 transition-colors duration-150",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                )}
                {m === "manual" ? "Manuel" : "IA"}
              </button>
            );
          })}
        </div>

        {/* ── Contenu selon le mode ── */}
        {captionMode === "manual" ? (
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Caption
              </label>
              <span
                className={cn(
                  "text-[11px] tabular-nums transition-colors",
                  captionText.length > 2200
                    ? "text-destructive font-medium"
                    : "text-muted-foreground",
                )}
              >
                {captionText.length} / 2200
              </span>
            </div>
            <textarea
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              rows={10}
              maxLength={2200}
              placeholder="Rédigez votre caption..."
              className={cn(
                "w-full rounded-lg px-3 py-2.5 text-[13px] resize-none leading-relaxed",
                "bg-background border border-border text-foreground",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "transition-shadow",
              )}
            />
          </div>
        ) : (
          /* ── Mode IA — zone avec fond légèrement teinté ── */
          <div
            className={cn(
              "rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4",
              "transition-all duration-200",
            )}
          >
            {/* Label décoratif IA */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                Génération par IA
              </span>
            </div>

            {/* Sujet */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                Sujet
                <span className="text-destructive">*</span>
              </label>
              <input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Ex: Lancement d'un nouveau produit"
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-[13px]",
                  "bg-card border border-border text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "transition-shadow",
                )}
              />
            </div>

            {/* Langue */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Langue
              </label>
              <select
                value={aiLang}
                onChange={(e) => setAiLang(e.target.value)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-[13px]",
                  "bg-card border border-border text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "transition-shadow",
                )}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex-1 w-full gap-2 mt-6 pt-4 border-t border-border">
          <div className="w-full flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className={cn(
                "text-muted-foreground hover:text-foreground bg-accent flex-1",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                "transition-colors rounded-lg",
              )}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveDisabled}
              className={cn(
                "flex-1 bg-primary hover:bg-primary/90 text-primary-foreground",
                "active:scale-[0.98] shadow-sm hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:opacity-50 disabled:pointer-events-none",
                "transition-all duration-150 rounded-lg font-medium text-sm",
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLlm ? "Génération…" : "Enregistrement…"}
                </>
              ) : (
                <>
                  {isLlm && <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                  {isLlm ? "Générer le caption" : "Enregistrer"}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
