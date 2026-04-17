
export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,   // ← ajout
  stripeSecretKey: process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!,
} as const;


// ─── SERVEUR UNIQUEMENT (Route Handlers, Server Actions) ──────
export const serverConfig = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
} as const;

