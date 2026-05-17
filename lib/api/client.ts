import {
  UserSummary,
  UserDetail,
  PaginatedResponse,
  Organisation,
  ScheduledPost,
  PublishedPost,
  PostAnalytics,
  PageAnalysisResponse,
  PostsWithReactionsResponse,
  AnalyticsPeriod,
  CaptionPatchResponse,
  AddImageResponse,
  ImageAddRequest,
  AutoCommentRequest,
  SubscriptionRequest,
} from "@/lib/api/types";

import { config } from "@/lib/config";

const API_BASE_URL = config.apiUrl  || "";

export class ApiClient {
  private static instance: ApiClient;

  private constructor() {
    // ← plus de localStorage, plus de this.token
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) ApiClient.instance = new ApiClient();
    return ApiClient.instance;
  }

  // ← setToken() supprimé
  // ← clearToken() supprimé

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };
    // ← plus de headers["Authorization"] = Bearer
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",   // ← cookie envoyé automatiquement à chaque requête
    });

    if (response.status === 401) {
      // ← plus de clearToken(), le cookie est géré par le serveur
      // window.location.href = "/login";
      throw new Error("Session expirée");
    }

    if (!response.ok) {
      const err = await response
        .json()
        .catch(() => ({ detail: "Erreur inconnue" }));
      throw new Error(err.detail || "Erreur API");
    }

    return response.json();
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async googleLogin(googleToken: string): Promise<{ user: any }> {
     console.log("Attempting Google login with token:", googleToken);  // Debug log
    const data = await this.request<{ message: string; user: any }>(
      "/api/v1/auth/google/auth",
      {
        method: "POST",
        body: JSON.stringify({ token: googleToken }),
      }
    );
    // ← plus de this.setToken(data.access_token)
    // le cookie est posé automatiquement par le serveur dans Set-Cookie
    return data;
  }

  async getCurrentUser(): Promise<any> {
    return this.request("/api/v1/auth/me");
    // ← credentials: "include" déjà dans request(), cookie envoyé auto
  }

  async logout(): Promise<void> {
    await this.request("/api/v1/auth/logout", { method: "POST" });
    // ← plus de this.clearToken()
    // le serveur supprime le cookie avec delete_cookie()
  }

  // ── Upload image (fetch manuel) ───────────────────────────────────────────
  // Ce fetch est spécial car il envoie FormData, pas du JSON
  // Il n'utilise pas request() donc il faut ajouter credentials manuellement

  async addImageUpload(postId: string, file: File): Promise<AddImageResponse> {
    const formData = new FormData();
    formData.append("file", file);

    // ← plus de headers Authorization
    // ← ajoute credentials: "include" pour envoyer le cookie
    const response = await fetch(
      `${API_BASE_URL}/api/v1/scheduled/${postId}/images/upload`,
      {
        method: "POST",
        body: formData,
        credentials: "include",   // ← ajouté
      },
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Upload échoué");
    }
    return response.json();
  }

  // ── Le reste ne change pas du tout ───────────────────────────────────────
  // Toutes les méthodes suivantes utilisent this.request()
  // qui a déjà credentials: "include" → rien à toucher

  async getCurrentUserDetail(): Promise<UserDetail> {
    return this.request("/api/v1/user/me");
  }

  async getPlans(): Promise<any[]> {
    return this.request("/api/v1/plans/");
  }

  async getPlanById(planId: string): Promise<any> {
    return this.request(`/api/v1/plans/${planId}`);
  }

  async subscribeToPlan(planId: string): Promise<any> {
    return this.request(`/api/v1/plans/${planId}/subscribe`, { method: "POST" });
  }

  async unsubscribeFromPlan(): Promise<any> {
    return this.request("/api/v1/plans/me/unsubscribe", { method: "DELETE" });
  }

  async adminGetAllPlans(): Promise<any[]> {
    return this.request("/api/v1/plans/admin/all");
  }

  async adminCreatePlan(data: any): Promise<any> {
    return this.request("/api/v1/plans/", { method: "POST", body: JSON.stringify(data) });
  }

  async adminUpdatePlan(planId: string, data: any): Promise<any> {
    return this.request(`/api/v1/plans/${planId}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  async adminDeletePlan(planId: string): Promise<void> {
    await this.request(`/api/v1/plans/${planId}`, { method: "DELETE" });
  }

  async adminGetAllUsers(params?: { page?: number; page_size?: number; search?: string }): Promise<PaginatedResponse<UserSummary>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));
    if (params?.search) query.set("search", params.search);
    return this.request(`/api/v1/admin/users/?${query.toString()}`);
  }

  async adminGetUserById(userId: string): Promise<any> {
    return this.request(`/api/v1/admin/users/${userId}`);
  }

  async adminPromoteUser(userId: string): Promise<any> {
    return this.request(`/api/v1/admin/users/${userId}/promote`, { method: "PATCH" });
  }

  async adminDemoteUser(userId: string): Promise<any> {
    return this.request(`/api/v1/admin/users/${userId}/demote`, { method: "PATCH" });
  }

  async adminDeleteUser(userId: string): Promise<void> {
    await this.request(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
  }

  async getOrganisations(params?: { page?: number; page_size?: number; search?: string }): Promise<PaginatedResponse<Organisation>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));
    if (params?.search) query.set("search", params.search);
    return this.request(`/api/v1/org/?${query.toString()}`);
  }

  async getOrganisationById(orgId: string): Promise<any> {
    return this.request(`/api/v1/org/${orgId}`);
  }

  async createOrganisation(data: any): Promise<any> {
    return this.request("/api/v1/org/", { method: "POST", body: JSON.stringify(data) });
  }

  async updateOrganisation(id: string, data: any): Promise<any> {
    return this.request(`/api/v1/org/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  async deleteOrganisation(id: string): Promise<void> {
    await this.request(`/api/v1/org/${id}`, { method: "DELETE" });
  }

  async getFacebookPages(orgId: string): Promise<any[]> {
    return this.request(`/api/v1/fb/?org_id=${orgId}`);
  }

  async getFacebookOAuthUrl(orgId: string): Promise<{ oauth_url: string }> {
    return this.request(`/api/v1/fb/oauth/url?org_id=${orgId}`);
  }

  async connectFacebookPage(data: any): Promise<any> {
    return this.request("/api/v1/fb/connect", { method: "POST", body: JSON.stringify(data) });
  }

  async toggleFacebookPage(pageId: string, orgId: string): Promise<any> {
    return this.request(`/api/v1/fb/${pageId}/toggle?org_id=${orgId}`, { method: "PATCH" });
  }

  async disconnectFacebookPage(pageId: string, orgId: string): Promise<void> {
    await this.request(`/api/v1/fb/${pageId}?org_id=${orgId}`, { method: "DELETE" });
  }

  async syncInsights(pageId: string, orgId: string): Promise<any> {
    return this.request(`/api/v1/fb/${pageId}/insights/sync?org_id=${orgId}`, { method: "POST" });
  }

  async getInsights(pageId: string, orgId: string): Promise<any[]> {
    return this.request(`/api/v1/fb/${pageId}/insights?org_id=${orgId}`);
  }

  async getScheduledPosts(orgId: string, params?: { page?: number; page_size?: number; status?: string; search?: string; year?: number; month?: number; week?: number }): Promise<PaginatedResponse<ScheduledPost>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.year) query.set("year", String(params.year));
    if (params?.month) query.set("month", String(params.month));
    if (params?.week) query.set("week", String(params.week));
    return this.request(`/api/v1/scheduled/org/${orgId}?${query.toString()}`);
  }

  async getScheduledPostById(postId: string): Promise<ScheduledPost> {
    return this.request(`/api/v1/scheduled/${postId}`);
  }

  async createScheduledPost(data: any): Promise<ScheduledPost> {
    return this.request("/api/v1/scheduled/", { method: "POST", body: JSON.stringify(data) });
  }

  async patchCaption(postId: string, data: any): Promise<CaptionPatchResponse> {
    return this.request(`/api/v1/scheduled/${postId}/caption`, { method: "PATCH", body: JSON.stringify(data) });
  }

  async addImage(postId: string, data: ImageAddRequest): Promise<AddImageResponse> {
    return this.request(`/api/v1/scheduled/${postId}/images`, { method: "POST", body: JSON.stringify(data) });
  }

  async removeImage(postId: string, imageId: string): Promise<ScheduledPost> {
    return this.request(`/api/v1/scheduled/${postId}/images/${imageId}`, { method: "DELETE" });
  }

  async reorderImages(postId: string, orderedIds: string[]): Promise<ScheduledPost> {
    return this.request(`/api/v1/scheduled/${postId}/images/reorder`, { method: "PATCH", body: JSON.stringify({ ordered_ids: orderedIds }) });
  }

  async confirmScheduledPost(postId: string, data: any): Promise<ScheduledPost> {
    return this.request(`/api/v1/scheduled/${postId}/confirm`, { method: "PATCH", body: JSON.stringify(data) });
  }

  async deleteScheduledPost(postId: string): Promise<void> {
    await this.request(`/api/v1/scheduled/${postId}`, { method: "DELETE" });
  }

  async getPublishedPosts(orgId: string, params?: { page?: number; page_size?: number; search?: string; year?: number; month?: number; week?: number }): Promise<PaginatedResponse<PublishedPost>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));
    if (params?.search) query.set("search", params.search);
    if (params?.year) query.set("year", String(params.year));
    if (params?.month) query.set("month", String(params.month));
    if (params?.week) query.set("week", String(params.week));
    return this.request(`/api/v1/published/org/${orgId}?${query.toString()}`);
  }

  async getPublishedPostById(postId: string): Promise<PublishedPost> {
    return this.request(`/api/v1/published/${postId}`);
  }

  async deletePublishedPost(postId: string): Promise<void> {
    await this.request(`/api/v1/published/${postId}`, { method: "DELETE" });
  }

  async publishPost(scheduledPostId: string): Promise<PublishedPost> {
    return this.request("/api/v1/published/publish", { method: "POST", body: JSON.stringify({ scheduled_post_id: scheduledPostId }) });
  }

  async setAutoComment(postId: string, payload: AutoCommentRequest): Promise<PublishedPost> {
    return this.request(`/api/v1/published/${postId}/auto-comment`, { method: "PATCH", body: JSON.stringify(payload) });
  }

  async syncMetrics(postId: string): Promise<PublishedPost> {
    return this.request(`/api/v1/published/${postId}/sync-metrics`, { method: "POST" });
  }

  async getAiHistory(orgId: string): Promise<any[]> {
    return this.request(`/api/v1/ai/history/${orgId}`);
  }

  async getAiQuota(orgId: string): Promise<any> {
    return this.request(`/api/v1/ai/quota?org_id=${orgId}`);
  }

  async getNotifications(unreadOnly = false): Promise<any[]> {
    return this.request(`/api/v1/notif/?unread_only=${unreadOnly}`);
  }

  async getNotificationSummary(): Promise<{ total: number; unread: number }> {
    return this.request("/api/v1/notif/summary");
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request(`/api/v1/notif/${id}/read`, { method: "PATCH" });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request("/api/v1/notif/read-all", { method: "PATCH" });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.request(`/api/v1/notif/${id}`, { method: "DELETE" });
  }

  async getTemplates(orgId: string): Promise<any[]> {
    return this.request(`/api/v1/post-template/available/${orgId}`);
  }

  async createTemplate(data: any): Promise<any> {
    return this.request("/api/v1/post-template/", { method: "POST", body: JSON.stringify(data) });
  }

  async updateTemplate(id: string, orgId: string, data: any): Promise<any> {
    return this.request(`/api/v1/post-template/${id}?org_id=${orgId}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  async deleteTemplate(id: string, orgId: string): Promise<void> {
    await this.request(`/api/v1/post-template/${id}?org_id=${orgId}`, { method: "DELETE" });
  }

  async getAnalyticsByOrg(orgId: string): Promise<PostAnalytics[]> {
    return this.request(`/api/v1/post-analytics/org/${orgId}`);
  }

  async getPageAnalysis(fbModelId: string, orgId: string, period: AnalyticsPeriod = "week"): Promise<PageAnalysisResponse> {
    return this.request(`/api/v1/post-analytics/page/${fbModelId}/analysis?org_id=${orgId}&period=${period}`);
  }

  async getPostsWithReactions(fbModelId: string, orgId: string, params?: { limit?: number; after?: string }): Promise<PostsWithReactionsResponse> {
    const query = new URLSearchParams({ org_id: orgId });
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.after) query.set("after", params.after);
    return this.request(`/api/v1/post-analytics/page/${fbModelId}/posts?${query}`);
  }

  async subscription(sub: SubscriptionRequest): Promise<any> {
    return this.request(`/api/v1/subscription/subscriptions/`, {
      method: "POST",
      body: JSON.stringify(sub),
    });
  }
}

export const apiClient = ApiClient.getInstance();