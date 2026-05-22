// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  google_id: string | null
  google_email: string | null
  profile_picture: string | null
  is_active: boolean
  is_admin: boolean
  plan_id: number | null
  created_at: string
  updated_at: string
  avatar?: string
  customer_id: string
  current_period_end: string | null
}



export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface GoogleCallbackRequest {
  code: string
  redirect_uri: string
}

export interface UserSummary {
  id: string
  name: string
  email: string
  is_active: boolean
  is_admin: boolean
  plan_id: number | null
  created_at: string
}

export interface PromoteDemoteResponse {
  detail: string
}

// ── User Details ─────────────────────────────────────────────────────────────
export interface UserDetail {
  user: User
  plan: Plan | null
  org_count: number
  post_month_count: number
  ai_caption_count: number
  ai_image_count: number
}
// ── Organisation ──────────────────────────────────────────────────────────────

export type ToneEnum = "formal" | "informal" | "friendly" | "professional" | "casual"
export type SectorEnum = "technology" | "finance" | "healthcare" | "education" | "retail" | "manufacturing"

export interface Organisation {
  id: string
  name: string
  description: string
  logo_url: string | null
  tone: ToneEnum
  sector: SectorEnum
  brand_color: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export interface CreateOrgRequest {
  name: string
  description: string
  tone: ToneEnum
  sector: SectorEnum
  logo_url?: string | null
  brand_color?: string | null
}

export interface UpdateOrgRequest extends Partial<CreateOrgRequest> {}

// ── Facebook Pages ────────────────────────────────────────────────────────────

export interface FacebookPage {
  id: string
  fb_page_id: string
  page_name: string
  is_active: boolean
  token_expires_at: string | null
  last_sync_at: string | null
  organisation_id: string
  created_at: string
  updated_at: string
}

export interface ConnectPageRequest {
  fb_page_id: string
  page_name: string
  access_token: string
  org_id: string
}

export interface PageInsights {
  id: string
  fb_page_id: string
  date: string
  fans_total: number
  impressions_unique: number
  engaged_users: number
  new_followers: number
  created_at: string
}

export interface FacebookOAuthURL {
  oauth_url: string
}

export interface FacebookOAuthCallbackResponse {
  org_id: string
  available_pages: MetaPageItem[]
  instruction: string
}

export interface MetaPageItem {
  id: string
  name: string
  access_token: string
}

// ── Scheduled Posts ───────────────────────────────────────────────────────────

export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED"
export type ImageSource = "url" | "upload" | "ai" | "URL" | "UPLOAD" | "AI"

export interface ScheduledPostImage {
  id: string
  image_url: string
  image_source: ImageSource
  position: number
  ai_generation_id: string | null
  created_at: string
}

export interface ScheduledPost {
  id: string
  organisation_id: string
  caption: string | null
  images: ScheduledPostImage[]        // ← multi-image, remplace image_url/image_source
  publish_at: string | null
  status: PostStatus
  page_ids: Record<string, string>
  post_template_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateScheduledPostRequest {
  facebook_page_id: string
  publish_at?: string
  caption?: string
  post_template_id?: string
}

export interface CaptionPatchRequest {
  mode: "manual" | "llm"
  text?: string
  topic?: string
  language?: string
  max_length?: number
  additional_instructions?: string
}

export interface CaptionPatchResponse {
  scheduled_post: ScheduledPost
  caption: string
  ai_generation_id: string | null
}

export interface ImageAddRequest {
  mode: "url" | "llm"
  url?: string
  description?: string
  style?: string
}

export interface AddImageResponse {
  scheduled_post: ScheduledPost
  image: ScheduledPostImage
  ai_generation_id: string | null
}

export interface ReorderRequest {
  ordered_ids: string[]
}

export interface ConfirmRequest {
  publish_at?: string
}

// ── Published Posts ───────────────────────────────────────────────────────────

export interface PublishedPost {
  id: string
  scheduled_post_id: string
  facebook_page_id: string
  post_id: string | null
  meta_permalink: string | null       // ← nouveau
  channel: string
  image_count: number                 // ← nouveau
  published_at: string
  is_auto_comment: boolean         // ← nouveau
  instructions: string | null 
  keywords: string | null
  initial_reach: number
  initial_impressions: number
  created_at: string
  updated_at: string
}

export interface AutoCommentRequest{
  is_auto_comment: boolean
  instructions?: string | null
  keywords?: string | null
}

export interface ManualPublishRequest {
  scheduled_post_id: string
}

// ── Post Templates ────────────────────────────────────────────────────────────

export interface PostTemplate {
  id: string
  name: string
  description: string | null
  asset_url: string
  sector: SectorEnum
  usage_count: number
  is_app_template: boolean
  organisation_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateTemplateRequest {
  name: string
  asset_url: string
  sector: SectorEnum
  organisation_id: string
  description?: string
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}

// ── AI ────────────────────────────────────────────────────────────────────────

export type AiGenerationType = "caption" | "image"
export type AiProvider = "gemini" | "openai" | "replicate"

export interface AiGeneration {
  id: string
  organisation_id: string
  user_id: string
  generation_type: AiGenerationType
  provider: AiProvider
  model_used: string
  caption: string | null
  image_url: string | null
  tokens_used: number
  created_at: string
}

export interface AiQuota {
  period: string
  caption_count: number
  image_count: number
  total_tokens: number
  caption_limit: number
  image_limit: number
  caption_remaining: number
  image_remaining: number
}

// ── Post Analytics ────────────────────────────────────────────────────────────

export interface PostAnalytics {
  id: string
  published_post_id: string
  measured_at: string
  reach: number
  impressions: number
  reactions: Record<string, number>
  comments_count: number
  shares_count: number
  clicks: number
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "post_published"
  | "post_failed"
  | "insights_updated"
  | "token_expiring"
  | "welcome"
  | "schedule_created"

export type NotificationChannel = "in_app" | "email" | "both"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  channel: NotificationChannel
  is_read: boolean
  email_sent: boolean
  created_at: string
  user_id: string
}

export interface NotificationSummary {
  total: number
  unread: number
}

// ── Plans ─────────────────────────────────────────────────────────────────────

export interface Plan {
  id: number
  name: string
  price: number
  max_org: number
  max_post_month: number
  max_ai_caption: number
  max_ai_image: number
  features: string[]
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
  price_id: string 
}

export interface CreatePlanRequest {
  name: string
  price: number
  max_org: number
  max_post_month: number
  max_ai_caption: number
  max_ai_image: number
  features?: string[]
  is_active?: boolean
  is_default?: boolean
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

export interface SubscribeResponse {
  detail: string
  plan: Plan
}

export interface UnsubscribeResponse {
  detail: string
}

// ── Errors ────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string
}

export interface ValidationError {
  detail: Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
}

// ── Auth Context ──────────────────────────────────────────────────────────────

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  googleLogin: (token: string) => Promise<void>
  setUserFromToken: (token: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface SubscriptionRequest{
    stripe_price_id: string
    stripe_customer_id: string
    payment_method_id: string
}



export interface EngagementValue { value: number; end_time: string }
export interface EngagementItem { name: string; period: string; values: EngagementValue[]; title?: string | null; description?: string | null; id: string }
export interface Paging { previous?: string | null }
export interface PagePostEngagementsResponse { data: EngagementItem[]; paging?: Paging | null }

export interface FollowValue { value: number; end_time?: string | null }
export interface FollowItem { name: string; period: string; values: FollowValue[]; description?: string | null; id: string }
export interface PageFollowsResponse { data: FollowItem[]; paging?: Paging | null }

export interface ReactionValue { like?: number; love?: number; wow?: number; haha?: number; sad?: number; angry?: number }
export interface InsightValue { value: ReactionValue; end_time?: string }
export interface InsightItem { id: string; name: string; period: string; values: InsightValue[]; title?: string; description?: string }
export interface PageInsightsResponse { data: InsightItem[]; paging?: Paging }

export interface DailyMetric {
  date: string; views: number; engagements: number; follows: number; unfollows: number
  like: number; love: number; haha: number; wow: number; sad: number; angry: number; care: number; total_reactions: number
}
export interface PeriodSummary {
  total_views: number; total_engagements: number; net_followers: number; total_reactions: number
  engagement_rate: number; avg_daily_views: number; avg_daily_engagements: number; top_reaction: string; reaction_breakdown: Record<string, number>
}
export interface PageAnalysisResponse {
  page_id: string; fb_page_id: string; page_name: string; period: string; since: string; until: string
  summary: PeriodSummary; daily: DailyMetric[]; followers_total: number; errors: Record<string, string>; generated_at: string
}
export interface PostReaction { like: number; love: number; haha: number; wow: number; sad: number; angry: number; care: number }
export interface PostWithReactions { post_id: string; message: string; created_time: string; reactions: PostReaction; total_reactions: number }
export interface PostsPagination { after: string | null; before: string | null; has_next: boolean; has_previous: boolean }
export interface PostsWithReactionsResponse { data: PostWithReactions[]; pagination: PostsPagination }
export type AnalyticsPeriod = "day" | "week" | "days_28"
export interface Subscription{
  curent_period_start: number; // attention: faute dans la clé originale
  user_id: string;
  id: string;
  stripe_customer_id: string;
  payment_method_id: string;
  current_period_start: number;
  current_period_end: number;
  last_payment_amount: number;
  is_active: boolean;
  updated_at: number;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: "active" | "inactive" | "canceled" | "past_due";
  last_payment_date: number | null;
  last_payment_status: "succeeded" | "failed" | "pending" | null;
  created_at: number;
}
export interface SubscriptionResponse{
  subcription: Subscription,
  user: User
}