"use client";

const integrations = [
  {
    name: "Facebook",
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433"/>
            <stop offset="50%" stopColor="#dc2743"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: "Cloudflare",
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#F48120">
        <path d="M16.5 15.9c.1-.4.1-.7-.1-1-.2-.3-.5-.5-.9-.5l-9.1-.1c-.1 0-.2-.1-.1-.2.1-.1.1-.2.2-.2l9.2.1c1.1.1 2.3-.8 2.7-1.9l.5-1.5c0-.1 0-.2-.1-.3C17.9 8 15.3 6 12.3 6 9.8 6 7.6 7.4 6.5 9.5c-.8-.6-1.8-.9-2.8-.8C1.7 8.9 0 10.7 0 12.9c0 .2 0 .5.1.7C.1 13.7 0 13.8 0 14c0 1.1.9 2 2 2h14.2c.1 0 .2-.1.3-.1z"/>
      </svg>
    ),
  },
  {
    name: "Google Ads",
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M1.05 19.65l7.08-12.27 3.54 2.05-7.08 12.26z" fill="#FBBC04"/>
        <path d="M15.87 19.65l-7.08-12.27L12.33 5.1l7.08 12.27z" fill="#4285F4"/>
        <circle cx="20.95" cy="18.4" r="2.6" fill="#34A853"/>
      </svg>
    ),
  },
  {
    name: "Gemini AI",
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4285F4"/>
            <stop offset="100%" stopColor="#9C27B0"/>
          </linearGradient>
        </defs>
        <path d="M12 2C12 2 8 8 8 12C8 16 12 22 12 22C12 22 16 16 16 12C16 8 12 2 12 2Z" fill="url(#gem)"/>
        <path d="M2 12C2 12 8 8 12 8C16 8 22 12 22 12C22 12 16 16 12 16C8 16 2 12 2 12Z" fill="url(#gem)" opacity="0.6"/>
      </svg>
    ),
  },
  {
    name: "Canva",
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="canva" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7D2AE8"/>
            <stop offset="100%" stopColor="#00C4CC"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="12" fill="url(#canva)"/>
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">C</text>
      </svg>
    ),
  },
  {
    name: "Zapier",
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF4A00">
        <path d="M14.9 12c0 .6-.1 1.2-.2 1.8l4.6 2.6c.8-1.3 1.3-2.8 1.3-4.4H14.9zm-1.8 5.8c-1.2.4-2.4.4-3.7 0l-2.3 4.4c1.3.5 2.6.8 4.1.8 1.5 0 2.9-.3 4.2-.8l-2.3-4.4zm-5.5-4c-.1-.6-.2-1.2-.2-1.8H1.7c0 1.6.5 3.1 1.3 4.4l4.6-2.6zM12 9.1c1.6 0 3 .9 3.7 2.2h5.6C20.5 7.6 16.6 4.4 12 4.4S3.5 7.6 2.7 11.3h5.6C9 10 10.4 9.1 12 9.1zm0-7.1C5.9 2 1 6.9 1 13s4.9 11 11 11 11-4.9 11-11S18.1 2 12 2z"/>
      </svg>
    ),
  },
];

// Rangée inversée pour la deuxième ligne (décalée + sens opposé)
const row2 = [...integrations].reverse();

const Pill = ({ item }: { item: (typeof integrations)[0] }) => (
  <div
    className="flex items-center gap-2.5 px-5 py-2.5
               bg-card border border-border rounded-full
               text-sm text-muted-foreground whitespace-nowrap
               hover:border-primary/50 hover:text-foreground
               hover:[animation-play-state:paused]
               transition-colors duration-200 cursor-default select-none"
  >
    {item.logo}
    <span>{item.name}</span>
  </div>
);

const IntegrationsMarquee = () => {
  const row1 = [...integrations, ...integrations, ...integrations];
  const row2Items = [...row2, ...row2, ...row2];

  return (
    <section id="integrations" className="py-20 bg-background overflow-hidden">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Intégrations
        </p>
        <h2 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.01em] text-foreground">
          S'intègre parfaitement avec
        </h2>
      </div>

      {/* ── Rangée 1 — gauche → droite ── */}
      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-background to-transparent" />
        <div
          className="flex gap-4 w-max"
          style={{ animation: "marquee-ltr 30s linear infinite" }}
        >
          {row1.map((item, i) => <Pill key={i} item={item} />)}
        </div>
      </div>

      {/* ── Rangée 2 — droite → gauche ── */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-background to-transparent" />
        <div
          className="flex gap-4 w-max"
          style={{ animation: "marquee-rtl 35s linear infinite" }}
        >
          {row2Items.map((item, i) => <Pill key={i} item={item} />)}
        </div>
      </div>

      {/* Keyframes injectées directement — pas besoin de modifier tailwind.config */}
      <style>{`
        @keyframes marquee-ltr {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-rtl {
          0%   { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        .flex:hover > * {
          animation-play-state: running;
        }
      `}</style>

    </section>
  );
};

export default IntegrationsMarquee;