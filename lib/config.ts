
export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV!,
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
} as const;

export const serverConfig = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
} as const;

