"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// LeftPanel vit TOUJOURS sur fond sombre (#0d1520)
// → toutes les couleurs sont hardcodées en dark, sans dark: conditionnel
export function LeftPanel() {
  return (
    <div
      className="w-full p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden h-full"
      style={{ background: "rgba(0,3,7,0.60)", color: "#f7f7f7" }}
    >
      <div className="relative z-10 flex flex-col gap-5">
        {/* Badge IA */}
        <div
          className="flex items-center gap-2 w-fit px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase"
          style={{
            border: "1px solid rgba(34,211,238,0.20)",
            background: "rgba(34,211,238,0.10)",
            color: "#22d3ee",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#22d3ee" }}
          />
          PROPULSÉ PAR L'IA
        </div>

        {/* Headlines */}
        <div className="flex flex-col gap-4">
          <h2 className="text-5xl font-bold tracking-tight leading-none" style={{ color: "#f7f7f7" }}>
            <span
              className="text-transparent bg-clip-text pr-2"
              style={{ backgroundImage: "linear-gradient(to right, #22d3ee, #3b62e0)" }}
            >
              Moins de
            </span>
            temps
          </h2>
          <h2 className="text-5xl font-bold tracking-tight leading-none" style={{ color: "#f7f7f7" }}>
            Plus
            <span
              className="text-transparent bg-clip-text pl-2"
              style={{ backgroundImage: "linear-gradient(to right, #22d3ee, #3b62e0)" }}
            >
              d'impact
            </span>
          </h2>
        </div>

        <div
          className="w-10 h-0.5 rounded-full"
          style={{ backgroundImage: "linear-gradient(to right, #22d3ee, transparent)" }}
        />

        {/* Feature list */}
        <ul className="flex flex-col gap-3">
          {[
            "Planifiez toutes vos publications",
            "Publiez sur tous vos réseaux en un clic",
            "Insights actionnables, pas juste des stats",
            "Contenu IA adapté à chaque plateforme",
          ].map((f) => (
            <li key={f} className="flex items-center gap-3 text-xs" style={{ color: "#7a9ab5" }}>
              <div
                className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center"
                style={{
                  border: "1px solid rgba(34,211,238,0.30)",
                  background: "rgba(34,211,238,0.10)",
                }}
              >
                <svg viewBox="0 0 10 8" className="w-2" fill="none">
                  <path
                    d="M1 4l2.5 2.5L9 1"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleGoogleLogin = () => {
    setLoading(true);
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col">
      {/* Logo */}
      <div className="absolute top-6 left-6 flex flex-col gap-1">
        <h2 className="text-2xl lg:text-5xl font-bold tracking-tight leading-none text-foreground">
          Feo
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-3">
            Sync
          </span>
        </h2>
        <p className="text-muted-foreground text-xs tracking-widest font-light lowercase">
          Synchronisez votre voix digitale
        </p>
      </div>

      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-chart-2/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] bg-chart-3/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-1 p-6 lg:p-8 gap-6">
        {/* ── Colonne gauche — formulaire ── */}
        <div className="flex-1 lg:w-[42%] flex items-center justify-center p-4 lg:p-10">
          <div className="w-full max-w-sm">
            <div className="mb-10 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-foreground text-center leading-tight">
                Connectez vous & Continuer
              </h2>
            </div>

            {error && (
              <div className="mb-5 bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive-foreground backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Bouton Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 h-12 relative
                  bg-input hover:bg-input/[1.5]
                  cursor-pointer
                  border border-border hover:border-primary/40
                  rounded-xl text-sm font-medium text-foreground
                  transition-all duration-200
                  hover:shadow-[0_0_20px_hsl(var(--ring)/0.08)]
                  disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
                {loading ? "Redirection vers Google..." : "Continuer avec Google"}
              </button>

              {/* Bouton Microsoft */}
              <button
                className="group w-full flex items-center justify-center gap-3 h-12 relative
                  bg-input hover:bg-input/[1.5]
                  cursor-pointer
                  border border-border hover:border-chart-2/40
                  rounded-xl text-sm font-medium text-foreground
                  transition-all duration-200
                  hover:shadow-[0_0_20px_hsl(var(--chart-2)/0.08)]
                  disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
                {loading ? "Redirection vers Microsoft..." : "Continuer avec Microsoft"}
              </button>
            </div>

            {/* Séparateur */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">
                Connexion sécurisée
              </span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            {/* Badges de confiance */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { label: "SSL chiffré", icon: "🔒" },
                { label: "RGPD conforme", icon: "🇪🇺" },
                { label: "OAuth 2.0", icon: "✓" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-1.5 p-2.5
                    bg-input hover:bg-secondary
                    rounded-xl border border-border hover:border-border/80
                    transition-colors duration-200"
                >
                  <span className="text-sm">{b.icon}</span>
                  <span className="text-[10px] text-muted-foreground/70 text-center leading-tight">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Mentions légales */}
            <p className="text-center text-[11px] text-muted-foreground/50">
              En continuant, vous acceptez nos{" "}
              <Link href="#cgu" className="text-accent/70 hover:text-primary transition-colors">
                conditions d'utilisation
              </Link>{" "}
              et notre{" "}
              <Link href="#confidentialite" className="text-accent/70 hover:text-primary transition-colors">
                politique de confidentialité
              </Link>
            </p>
          </div>
        </div>

        {/* ── Colonne droite — panneau visuel ── */}
        {/* bg-[#0d1520] est hardcodé : ce panneau est TOUJOURS sombre,
            indépendamment du thème light/dark de la page               */}
        <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden rounded-3xl justify-center items-start">
          <div className="absolute inset-0 bg-[#0d1520]" />

          {/* Grille cyber — couleur hardcodée pour rester visible en light mode */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Glow intérieur */}
          <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(34,211,238,0.10)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.10)" }} />

          <div className="relative z-10 flex flex-col w-full h-full">
            {/* Image */}
            <div className="h-[100%] w-full flex justify-end items-end absolute bottom-0">
              <div className="lg:w-[600px] lg:h-[800px] relative">
                <Image
                  src="/images/social.png"
                  alt="social network (instagram, facebook, whatsapp)"
                  fill
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>

            <LeftPanel />
          </div>

          {/* Coins décoratifs--- */}
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[#22d3ee]/40 rounded-br-3xl" />
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#7c3aed]/40 rounded-tl-3xl" />
        </div>
      </div>
    </div>
  );
}