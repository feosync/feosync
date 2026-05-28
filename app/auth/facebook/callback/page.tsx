"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MetaPageItem } from "@/lib/api/types";
import { config } from "@/lib/config";
import { useConnectFacebookPage } from "@/hooks/useFacebookPages";

function CallbackLoader({
  message = "Récupération de vos pages Facebook...",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <FeoSyncLogo />
      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function FeoSyncLogo() {
  return (
    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
      FS
    </div>
  );
}

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="text-center mb-6">
          <FeoSyncLogo />
          <h1 className="text-[18px] font-medium text-slate-900 dark:text-white mt-3">
            Choisissez une page
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sélectionnez la page à connecter à votre organisation
          </p>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 mb-4">
              Aucune page disponible sur ce compte.
            </p>
            <Button variant="outline" onClick={onCancel}>
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
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors disabled:opacity-60 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    f
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {page.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {page.id}
                    </p>
                  </div>
                </div>
                {connecting === page.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Check className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                )}
              </button>
            ))}
            <Button
              variant="ghost"
              className="w-full mt-1 text-slate-500"
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

function FacebookCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<{
    fb_user_id: string;
    fb_user_name: string;
    fb_user_picture: string | null;
  } | null>(null);

  const [pages, setPages] = useState<MetaPageItem[]>([]);
  const [orgId, setOrgId] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
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
        {
          credentials: "include",
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail || "Échec de l'échange du code");

      setPages(data.available_pages || []);
      setOrgId(data.org_id || state);
      setUserProfile(data.user_profile || null); // ← ajout
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
        fb_page_id: page.id,
        page_name: page.name,
        access_token: page.access_token,
        org_id: orgId,
        user_profile: userProfile,
      });
      toast.success("Page connectée !", { description: page.name });
      window.location.href = "/pages";
    } catch (err: any) {
      // onError du hook gère déjà le toast
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

export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoader />}>
      <FacebookCallbackHandler />
    </Suspense>
  );
}
