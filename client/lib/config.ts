
export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  apiUrl: "",    
  stripeSecretKey: process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV!,
  ...(process.env.NEXT_PUBLIC_APP_ENV === "production" && {
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  }),
} as const;


// ─── SERVEUR UNIQUEMENT (Route Handlers, Server Actions) ──────
export const serverConfig = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
} as const;

