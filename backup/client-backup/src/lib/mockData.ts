export const MOCK_STATS = {
  postsThisMonth: 47,
  postsTrend: 12,
  totalReach: 23400,
  reachTrend: 34,
  engagementRate: 8.2,
  engagementTrend: 5,
  aiGenerations: 32,
  aiTrend: 18,
  followers: 4850,
  followersTrend: 8,
  reviews: 128,
  reviewsAvg: 4.7,
};

export type PostStatus = "scheduled" | "published" | "draft";
export type Channel = "facebook" | "whatsapp";

export interface MockPost {
  id: string;
  caption: string;
  imageUrl: string;
  status: PostStatus;
  channels: Channel[];
  pageName: string;
  publishAt: string;
  publishedAt?: string;
  reach?: number;
  engagement?: number;
  aiGenerated: boolean;
}

export const MOCK_POSTS: MockPost[] = [
  { id: "p1", caption: "🔥 Plat du jour : Ravitoto au porc croustillant ! Commandez maintenant sur notre page.", imageUrl: "/placeholder.svg", status: "published", channels: ["facebook"], pageName: "Le Grill d'Ivandry", publishAt: "2026-03-03T09:00:00", publishedAt: "2026-03-03T09:01:00", reach: 1240, engagement: 8.4, aiGenerated: true },
  { id: "p2", caption: "📍 Nouveau ! Notre terrasse rénovée vous attend ce weekend. Réservez votre table.", imageUrl: "/placeholder.svg", status: "published", channels: ["facebook", "whatsapp"], pageName: "Le Grill d'Ivandry", publishAt: "2026-03-02T12:00:00", publishedAt: "2026-03-02T12:00:30", reach: 2100, engagement: 11.2, aiGenerated: true },
  { id: "p3", caption: "🍕 Menu spécial Saint-Valentin — Pour 2 : entrée + plat + dessert à 85 000 Ar", imageUrl: "/placeholder.svg", status: "scheduled", channels: ["facebook"], pageName: "Le Grill d'Ivandry", publishAt: "2026-03-05T18:00:00", aiGenerated: true },
  { id: "p4", caption: "⭐ Merci à nos clients ! 4.8/5 sur Google — Votre satisfaction est notre moteur.", imageUrl: "/placeholder.svg", status: "scheduled", channels: ["facebook", "whatsapp"], pageName: "Le Grill d'Ivandry", publishAt: "2026-03-06T09:00:00", aiGenerated: false },
  { id: "p5", caption: "🎉 Happy Hour tous les vendredis de 17h à 19h — Cocktails à -30% !", imageUrl: "/placeholder.svg", status: "draft", channels: ["facebook"], pageName: "Le Grill d'Ivandry", publishAt: "", aiGenerated: false },
  { id: "p6", caption: "📸 Découvrez notre nouvelle carte en images ! Des saveurs authentiques malgaches revisitées.", imageUrl: "/placeholder.svg", status: "published", channels: ["facebook"], pageName: "Boutique Zara Tana", publishAt: "2026-03-01T10:00:00", publishedAt: "2026-03-01T10:00:15", reach: 890, engagement: 6.1, aiGenerated: true },
  { id: "p7", caption: "🛍️ Soldes d'été — Jusqu'à -50% sur toute la collection printemps !", imageUrl: "/placeholder.svg", status: "scheduled", channels: ["facebook", "whatsapp"], pageName: "Boutique Zara Tana", publishAt: "2026-03-07T08:00:00", aiGenerated: true },
];

export interface MockPage {
  id: string;
  name: string;
  fbPageId: string;
  isActive: boolean;
  followers: number;
  lastSync: string;
  postsThisMonth: number;
}

export const MOCK_PAGES: MockPage[] = [
  { id: "pg1", name: "Le Grill d'Ivandry", fbPageId: "1234567890", isActive: true, followers: 3200, lastSync: "2026-03-04T08:00:00", postsThisMonth: 32 },
  { id: "pg2", name: "Boutique Zara Tana", fbPageId: "0987654321", isActive: true, followers: 1650, lastSync: "2026-03-04T07:30:00", postsThisMonth: 15 },
  { id: "pg3", name: "Hotel Sakamanga", fbPageId: "1122334455", isActive: false, followers: 5400, lastSync: "2026-02-28T12:00:00", postsThisMonth: 0 },
];

export interface MockSchedule {
  id: string;
  name: string;
  ruleType: string;
  cronExpr: string;
  active: boolean;
  lastRun: string;
  nextRun: string;
  pages: string[];
}

export const MOCK_SCHEDULES: MockSchedule[] = [
  { id: "s1", name: "Plat du jour quotidien", ruleType: "google_sheets", cronExpr: "0 9 * * *", active: true, lastRun: "2026-03-04T09:00:00", nextRun: "2026-03-05T09:00:00", pages: ["Le Grill d'Ivandry"] },
  { id: "s2", name: "Promo weekend", ruleType: "manual", cronExpr: "0 10 * * 5", active: true, lastRun: "2026-02-28T10:00:00", nextRun: "2026-03-07T10:00:00", pages: ["Le Grill d'Ivandry", "Boutique Zara Tana"] },
  { id: "s3", name: "Avis 5★ auto-publish", ruleType: "reviews", cronExpr: "0 14 * * 1,4", active: false, lastRun: "2026-02-27T14:00:00", nextRun: "", pages: ["Le Grill d'Ivandry"] },
];

export interface MockReview {
  id: string;
  source: "facebook" | "google";
  reviewerName: string;
  rating: number;
  text: string;
  date: string;
  handled: boolean;
}

export const MOCK_REVIEWS: MockReview[] = [
  { id: "r1", source: "google", reviewerName: "Nirina A.", rating: 5, text: "Excellent restaurant ! Le ravitoto est le meilleur de Tana. Service rapide et accueillant.", date: "2026-03-03", handled: false },
  { id: "r2", source: "facebook", reviewerName: "Jean-Claude M.", rating: 5, text: "Cadre magnifique et cuisine authentique. On y retourne chaque semaine !", date: "2026-03-02", handled: true },
  { id: "r3", source: "google", reviewerName: "Fanja R.", rating: 4, text: "Très bon plat mais un peu d'attente au service. À améliorer.", date: "2026-03-01", handled: false },
  { id: "r4", source: "facebook", reviewerName: "Patrick L.", rating: 5, text: "Le menu spécial était incroyable ! Bravo à toute l'équipe.", date: "2026-02-28", handled: true },
  { id: "r5", source: "google", reviewerName: "Sandra T.", rating: 3, text: "Correct mais sans plus. La carte pourrait être plus variée.", date: "2026-02-25", handled: false },
];

export const ANALYTICS_DAILY = Array.from({ length: 30 }, (_, i) => ({
  date: `${String(i + 1).padStart(2, "0")}/03`,
  reach: Math.floor(400 + Math.random() * 1200),
  engagement: +(2 + Math.random() * 10).toFixed(1),
  posts: Math.floor(Math.random() * 4),
  impressions: Math.floor(800 + Math.random() * 3000),
}));

export const NOTIFICATIONS = [
  { id: "n1", type: "post_published", message: "Post \"Plat du jour\" publié avec succès sur Le Grill d'Ivandry", time: "Il y a 2 min", read: false },
  { id: "n2", type: "review", message: "Nouvel avis 5★ de Nirina A. sur Google", time: "Il y a 15 min", read: false },
  { id: "n3", type: "schedule", message: "Règle \"Promo weekend\" exécutée — 1 post programmé", time: "Il y a 1h", read: true },
  { id: "n4", type: "ai", message: "Génération IA terminée — 3 variantes disponibles", time: "Il y a 2h", read: true },
  { id: "n5", type: "alert", message: "Token Facebook Le Grill expire dans 5 jours", time: "Il y a 3h", read: true },
];
