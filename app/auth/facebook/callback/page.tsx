"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MetaPageItem } from "@/lib/api/types";
import { config } from "@/lib/config";
import { useConnectFacebookPage } from "@/hooks/useFacebookPages";

/* ── Logo ────────────────────────────────────────────────────────────────── */
function FeoSyncLogo() {
  return (
    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center
                    text-primary-foreground font-bold text-sm tracking-wide">
      FS
    </div>
  )
}

/* ── Loader ──────────────────────────────────────────────────────────────── */
function CallbackLoader({
  message = "Récupération de vos pages Facebook...",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-xs text-center">

        {/* Halo + Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-primary/5 animate-pulse" />
          <div className="absolute w-16 h-16 rounded-full bg-primary/8" />
          <div className="relative z-10">
            <FeoSyncLogo />
          </div>
        </div>

        {/* Texte */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground tracking-wide">
            Connexion Facebook
          </p>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>

        {/* Dots animés */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
            />
          ))}
        </div>

        {/* Barre shimmer */}
        <div className="w-full h-px bg-border overflow-hidden rounded-full">
          <div
            className="h-full rounded-full"
            style={{
              animation: "shimmer 1.8s ease-in-out infinite",
              background: "linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)",
              transform: "translateX(-100%)",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

/* ── Sélecteur de page ───────────────────────────────────────────────────── */
function PageSelector({
  pages,
  connecting,
  onConnect,
  onCancel,
}: {
  pages: MetaPageItem[];
  connecting: string | null;
  onConnect: (page: MetaPageItem) => void;
  onCancel: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-sm">

        {/* En-tête */}
        <div className="flex flex-col items-center text-center mb-6 gap-3">
          <FeoSyncLogo />
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-foreground">
              Choisissez une page
            </h1>
            <p className="text-sm text-muted-foreground">
              Sélectionnez la page à connecter à votre organisation
            </p>
          </div>
        </div>

        {/* Aucune page */}
        {pages.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Aucune page disponible sur ce compte.
            </p>
            <Button variant="outline" onClick={onCancel}
                    className="border-border text-foreground hover:bg-accent">
              Retour
            </Button>
          </div>

        ) : (
          <div className="space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onConnect(page)}
                disabled={!!connecting}
                className="w-full flex items-center justify-between p-3 rounded-xl
                           border border-border text-left
                           hover:border-primary/50 hover:bg-primary/5
                           transition-colors disabled:opacity-60
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Avatar page */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center
                                  justify-center text-primary-foreground text-sm
                                  font-bold flex-shrink-0">
                    f
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {page.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {page.id}
                    </p>
                  </div>
                </div>

                {/* Indicateur état */}
                {connecting === page.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                ) : (
                  <Check className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                )}
              </button>
            ))}

            {/* Annuler */}
            <Button
              variant="ghost"
              className="w-full mt-1 text-muted-foreground hover:text-foreground
                         hover:bg-accent transition-colors"
              onClick={onCancel}
              disabled={!!connecting}
            >
              Annuler
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Handler ─────────────────────────────────────────────────────────────── */
function FacebookCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userProfile, setUserProfile] = useState<{
    fb_user_id: string;
    fb_user_name: string;
    fb_user_picture: string | null;
  } | null>(null);

  const [pages, setPages]         = useState<MetaPageItem[]>([]);
  const [orgId, setOrgId]         = useState("");
  const [loading, setLoading]     = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const code  = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
      toast.error("Connexion annulée");
      router.replace("/pages");
      return;
    }

    exchangeCode(code, state);
  }, []);

  const exchangeCode = async (code: string, state: string) => {
    try {
      const response = await fetch(
        `${config.apiUrl}/api/v1/fb/oauth/callback?code=${code}&state=${state}`,
        { credentials: "include" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Échec de l'échange du code");

      setPages(data.available_pages || []);
      setOrgId(data.org_id || state);
      setUserProfile(data.user_profile || null);
    } catch (err: any) {
      toast.error("Erreur", { description: err.message });
      router.replace("/pages");
    } finally {
      setLoading(false);
    }
  };

  const connectMutation = useConnectFacebookPage();

  const connectPage = async (page: MetaPageItem) => {
    setConnecting(page.id);
    try {
      await connectMutation.mutateAsync({
        fb_page_id:   page.id,
        page_name:    page.name,
        access_token: page.access_token,
        org_id:       orgId,
        user_profile: userProfile,
      });
      toast.success("Page connectée !", { description: page.name });
      window.location.href = "/pages";
    } catch {
      setConnecting(null);
    }
  };

  if (loading) return <CallbackLoader />;

  return (
    <PageSelector
      pages={pages}
      connecting={connecting}
      onConnect={connectPage}
      onCancel={() => router.replace("/pages")}
    />
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoader />}>
      <FacebookCallbackHandler />
    </Suspense>
  );
}