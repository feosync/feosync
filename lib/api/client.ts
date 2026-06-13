import {
  User,
  UserSummary,
  UserDetail,
  PaginatedResponse,
  Organisation,
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateOrgRequest,
  UpdateOrgRequest,
  ScheduledPost,
  CreateScheduledPostRequest,
  PublishedPost,
  PostAnalytics,
  PageAnalysisResponse,
  PostsWithReactionsResponse,
  AnalyticsPeriod,
  CaptionPatchRequest,
  CaptionPatchResponse,
  AddImageResponse,
  ImageAddRequest,
  AutoCommentRequest,
  ConfirmRequest,
  PromoteDemoteResponse,
  SubscriptionRequest,
  SubscriptionResponse,
  Subscription,
  Channel,
  FacebookPageResponse,
  ConnectFacebookPagePayload,
  PageInsights,
  AiGeneration,
  AiQuota,
  Notification,
  PostTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CollaboratorListResponse,
  CollaboratorOrganization,
  InvitationListResponse,
} from "@/lib/api/types";

import { config } from "@/lib/config";

const API_BASE_URL = config.apiUrl || "";

export class ApiClient {
  private static instance: ApiClient;
  private isRefreshing = false;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) ApiClient.instance = new ApiClient();
    return ApiClient.instance;
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.isRefreshing) return false;
    this.isRefreshing = true;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const doFetch = (): Promise<Response> =>
      fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

    let response = await doFetch();

    if (response.status === 401) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        response = await doFetch();
      } else {
        throw new Error("Session expirée");
      }
    }

    if (!response.ok) {
      const err = await response
        .json()
        .catch(() => ({ detail: "Erreur inconnue" }));
      const message = Array.isArray(err.detail)
        ? err.detail.map((d: { msg?: string }) => d.msg).join("; ")
        : err.detail || "Erreur API";
      throw new Error(message);
    }

    return response.json();
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async googleLogin(googleToken: string): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(
      "/api/v1/auth/google/auth",
      {
        method: "POST",
        body: JSON.stringify({ token: googleToken }),
      },
    );
  }

  async getCurrentUser(): Promise<User> {
    return this.request("/api/v1/auth/me");
  }

  async logout(): Promise<void> {
    await this.request("/api/v1/auth/logout", { method: "POST" });
  }

  // ── Upload image (fetch manuel) ───────────────────────────────────────────

  async addImageUpload(postId: string, file: File): Promise<AddImageResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const doFetch = (): Promise<Response> =>
      fetch(`${API_BASE_URL}/api/v1/scheduled/${postId}/images/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

    let response = await doFetch();

    if (response.status === 401) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        response = await doFetch();
      } else {
        throw new Error("Session expirée");
      }
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Upload échoué");
    }
    return response.json();
  }

  // ── Organisation & Plans ─────────────────────────────────────────────────

  async getCurrentUserDetail(): Promise<UserDetail> {
    return this.request("/api/v1/user/me");
  }

  async getPlans(): Promise<Plan[]> {
    return this.request("/api/v1/plans/");
  }

  async getPlanById(planId: string): Promise<Plan> {
    return this.request(`/api/v1/plans/${planId}`);
  }

  async subscribeToPlan(planId: string): Promise<User> {
    return this.request(`/api/v1/plans/${planId}/subscribe`, {
      method: "POST",
    });
  }

  async unsubscribeFromPlan(): Promise<User> {
    return this.request("/api/v1/plans/me/unsubscribe", { method: "DELETE" });
  }

  async adminGetAllPlans(): Promise<Plan[]> {
    return this.request("/api/v1/plans/admin/all");
  }

  async adminCreatePlan(data: CreatePlanRequest): Promise<Plan> {
    return this.request("/api/v1/plans/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async adminUpdatePlan(planId: string, data: UpdatePlanRequest): Promise<Plan> {
    return this.request(`/api/v1/plans/${planId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async adminDeletePlan(planId: string): Promise<void> {
    await this.request(`/api/v1/plans/${planId}`, { method: "DELETE" });
  }

  async adminGetAllUsers(params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<PaginatedResponse<UserSummary>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));
    if (params?.search) query.set("search", params.search);
    return this.request(`/api/v1/admin/users/?${query.toString()}`);
  }

  async adminGetUserById(userId: string): Promise<UserDetail> {
    return this.request(`/api/v1/admin/users/${userId}`);
  }

  async adminPromoteUser(userId: string): Promise<PromoteDemoteResponse> {
    return this.request(`/api/v1/admin/users/${userId}/promote`, {
      method: "PATCH",
    });
  }

  async adminDemoteUser(userId: string): Promise<PromoteDemoteResponse> {
    return this.request(`/api/v1/admin/users/${userId}/demote`, {
      method: "PATCH",
    });
  }

  async adminDeleteUser(userId: string): Promise<void> {
    await this.request(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
  }

  async getOrganisations(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    scope?: "owned" | "assigned" | "all";
  }): Promise<PaginatedResponse<Organisation>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));
    if (params?.search) query.set("search", params.search);
    if (params?.scope) query.set("scope", params.scope);
    return this.request(`/api/v1/org/?${query.toString()}`);
  }

  async getOrganisationById(orgId: string): Promise<Organisation> {
    return this.request(`/api/v1/org/${orgId}`);
  }

  async createOrganisation(data: CreateOrgRequest): Promise<Organisation> {
    return this.request("/api/v1/org/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOrganisation(id: string, data: UpdateOrgRequest): Promise<Organisation> {
    return this.request(`/api/v1/org/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteOrganisation(id: string): Promise<void> {
    await this.request(`/api/v1/org/${id}`, { method: "DELETE" });
  }

  async getFacebookPages(orgId: string): Promise<FacebookPageResponse[]> {
    return this.request(`/api/v1/fb/?org_id=${orgId}`);
  }

  async getFacebookOAuthUrl(orgId: string): Promise<{ oauth_url: string }> {
    return this.request(`/api/v1/fb/oauth/url?org_id=${orgId}`);
  }

  async connectFacebookPage(data: ConnectFacebookPagePayload): Promise<FacebookPageResponse> {
    return this.request("/api/v1/fb/connect", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async toggleFacebookPage(pageId: string, orgId: string): Promise<FacebookPageResponse> {
    return this.request(`/api/v1/fb/${pageId}/toggle?org_id=${orgId}`, {
      method: "PATCH",
    });
  }

  async disconnectFacebookPage(pageId: string, orgId: string): Promise<void> {
    await this.request(`/api/v1/fb/${pageId}?org_id=${orgId}`, {
      method: "DELETE",
    });
  }

  async syncInsights(pageId: string, orgId: string): Promise<{ status: string }> {
    return this.request(`/api/v1/fb/${pageId}/insights/sync?org_id=${orgId}`, {
      method: "POST",
    });
  }

  async getInsights(pageId: string, orgId: string): Promise<PageInsights[]> {
    return this.request(`/api/v1/fb/${pageId}/insights?org_id=${orgId}`);
  }

  async getScheduledPosts(
    orgId: string,
    params?: {
      page?: number;
      page_size?: number;
      status?: string;
      search?: string;
      year?: number;
      month?: number;
      week?: number;
    },
  ): Promise<PaginatedResponse<ScheduledPost>> {
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

  async createScheduledPost(data: CreateScheduledPostRequest): Promise<ScheduledPost> {
    return this.request("/api/v1/scheduled/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async patchCaption(postId: string, data: CaptionPatchRequest): Promise<CaptionPatchResponse> {
    return this.request(`/api/v1/scheduled/${postId}/caption`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async addImage(
    postId: string,
    data: ImageAddRequest,
  ): Promise<AddImageResponse> {
    return this.request(`/api/v1/scheduled/${postId}/images`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removeImage(postId: string, imageId: string): Promise<ScheduledPost> {
    return this.request(`/api/v1/scheduled/${postId}/images/${imageId}`, {
      method: "DELETE",
    });
  }

  async reorderImages(
    postId: string,
    orderedIds: string[],
  ): Promise<ScheduledPost> {
    return this.request(`/api/v1/scheduled/${postId}/images/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ ordered_ids: orderedIds }),
    });
  }

  async confirmScheduledPost(
    postId: string,
    data: ConfirmRequest,
  ): Promise<ScheduledPost> {
    return this.request(`/api/v1/scheduled/${postId}/confirm`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteScheduledPost(postId: string): Promise<void> {
    await this.request(`/api/v1/scheduled/${postId}`, { method: "DELETE" });
  }

  async getPublishedPosts(
    orgId: string,
    params?: {
      page?: number;
      page_size?: number;
      search?: string;
      year?: number;
      month?: number;
      week?: number;
    },
  ): Promise<PaginatedResponse<PublishedPost>> {
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
    return this.request("/api/v1/published/publish", {
      method: "POST",
      body: JSON.stringify({ scheduled_post_id: scheduledPostId }),
    });
  }

  async setAutoComment(
    postId: string,
    payload: AutoCommentRequest,
  ): Promise<PublishedPost> {
    return this.request(`/api/v1/published/${postId}/auto-comment`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async syncMetrics(postId: string): Promise<PublishedPost> {
    return this.request(`/api/v1/published/${postId}/sync-metrics`, {
      method: "POST",
    });
  }

  async getAiHistory(orgId: string): Promise<AiGeneration[]> {
    return this.request(`/api/v1/ai/history/${orgId}`);
  }

  async getAiQuota(orgId: string): Promise<AiQuota> {
    return this.request(`/api/v1/ai/quota/${orgId}`);
  }

  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    return this.request(`/api/v1/notif/?unread_only=${unreadOnly}`);
  }

  async getNotificationSummary(): Promise<{ total: number; unread: number }> {
    return this.request("/api/v1/notif/summary");
  }

  async markNotificationRead(id: string): Promise<Notification> {
    return this.request(`/api/v1/notif/${id}/read`, { method: "PATCH" });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request("/api/v1/notif/read-all", { method: "PATCH" });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.request(`/api/v1/notif/${id}`, { method: "DELETE" });
  }

  async getTemplates(orgId: string): Promise<PostTemplate[]> {
    return this.request(`/api/v1/post-template/available/${orgId}`);
  }

  async createTemplate(data: CreateTemplateRequest): Promise<PostTemplate> {
    return this.request("/api/v1/post-template/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string, orgId: string, data: UpdateTemplateRequest): Promise<PostTemplate> {
    return this.request(`/api/v1/post-template/${id}?org_id=${orgId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string, orgId: string): Promise<void> {
    await this.request(`/api/v1/post-template/${id}?org_id=${orgId}`, {
      method: "DELETE",
    });
  }

  async getAnalyticsByOrg(orgId: string): Promise<PostAnalytics[]> {
    return this.request(`/api/v1/post-analytics/org/${orgId}`);
  }

  async getPageAnalysis(
    fbModelId: string,
    orgId: string,
    period: AnalyticsPeriod = "week",
  ): Promise<PageAnalysisResponse> {
    return this.request(
      `/api/v1/post-analytics/page/${fbModelId}/analysis?org_id=${orgId}&period=${period}`,
    );
  }

  async getPostsWithReactions(
    fbModelId: string,
    orgId: string,
    params?: { limit?: number; after?: string },
  ): Promise<PostsWithReactionsResponse> {
    const query = new URLSearchParams({ org_id: orgId });
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.after) query.set("after", params.after);
    return this.request(
      `/api/v1/post-analytics/page/${fbModelId}/posts?${query}`,
    );
  }

  async subscription(sub: SubscriptionRequest): Promise<SubscriptionResponse> {
    return this.request(`/api/v1/subscription/subscriptions/`, {
      method: "POST",
      body: JSON.stringify(sub),
    });
  }

  async createSetupIntent(
    customer_id: string,
  ): Promise<{ client_secret: string; status: string }> {
    return this.request(
      `/api/v1/subscription/setup-intent?customer_id=${customer_id}`,{
        method: "POST",
      }
    );
  }

  async upgradePlan(stripe_price_id: string, stripe_subscription_id:string): Promise<SubscriptionResponse>{
    return this.request(`/api/v1/subscription/update/${stripe_subscription_id}?stripe_price_id=${stripe_price_id}`,{
      method:"PUT",
    })
  }
  async getSubcription():Promise<Subscription>{
    return this.request(`/api/v1/subscription/`,{
      method: "GET"
    })
  }
  async getChannelByUser():Promise<Channel[]>{
    return this.request(`/api/v1/channel/`,{
      method: "GET"
    })
  }

  // ── Reels & Stories ──────────────────────────────────────────────────────────

  async scheduleReel(formData: FormData, onProgress?: (pct: number) => void): Promise<{ id: string; status: string; scheduledAt: string | null }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${API_BASE_URL}/api/v1/posts/reels`)
      xhr.withCredentials = true

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          try {
            const err = JSON.parse(xhr.responseText)
            reject(new Error(err.detail || "Upload échoué"))
          } catch {
            reject(new Error("Upload échoué — vérifiez le format du fichier"))
          }
        }
      }

      xhr.onerror = () => reject(new Error("Erreur réseau"))
      xhr.send(formData)
    })
  }

  async scheduleStory(formData: FormData, onProgress?: (pct: number) => void): Promise<{ id: string; status: string; scheduledAt: string | null; expiresAt?: string | null }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${API_BASE_URL}/api/v1/posts/stories`)
      xhr.withCredentials = true

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          try {
            const err = JSON.parse(xhr.responseText)
            reject(new Error(err.detail || "Upload échoué"))
          } catch {
            reject(new Error("Upload échoué — vérifiez le format du fichier"))
          }
        }
      }

      xhr.onerror = () => reject(new Error("Erreur réseau"))
      xhr.send(formData)
    })
  }

  // ── Collaborators ──────────────────────────────────────────────────────────

  async inviteCollaborator(email: string): Promise<{ id: string; email: string; status: string; role: string }> {
    return this.request("/api/v1/collaborators/invite", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async getCollaborators(): Promise<CollaboratorListResponse> {
    return this.request("/api/v1/collaborators/")
  }

  async revokeCollaborator(collaboratorId: string): Promise<{ detail: string }> {
    return this.request(`/api/v1/collaborators/${collaboratorId}`, {
      method: "DELETE",
    })
  }

  async assignOrganizations(collaboratorId: string, organizationIds: string[]): Promise<{ detail: string }> {
    return this.request(`/api/v1/collaborators/${collaboratorId}/assign`, {
      method: "POST",
      body: JSON.stringify({ organization_ids: organizationIds }),
    })
  }

  async getAssignedOrganizations(collaboratorId: string): Promise<CollaboratorOrganization[]> {
    return this.request(`/api/v1/collaborators/${collaboratorId}/organizations`)
  }

  async getMyCollaboratorRole(): Promise<{ role: "owner" | "collaborator"; owner_name: string | null }> {
    return this.request("/api/v1/collaborators/me/role")
  }

  async acceptInvitation(token: string): Promise<{ message: string; access_token: string; user_id: string }> {
    return this.request(`/api/v1/collaborators/invitations/accept?token=${encodeURIComponent(token)}`, {
      method: "POST",
    })
  }

  async declineInvitation(token: string): Promise<{ message: string }> {
    return this.request(`/api/v1/collaborators/invitations/decline?token=${encodeURIComponent(token)}`, {
      method: "POST",
    })
  }

  async getInvitations(): Promise<InvitationListResponse> {
    return this.request("/api/v1/collaborators/invitations")
  }

  async revokeInvitation(invitationId: string): Promise<{ detail: string }> {
    return this.request(`/api/v1/collaborators/invitations/${invitationId}`, {
      method: "DELETE",
    })
  }
}


export const apiClient = ApiClient.getInstance();
