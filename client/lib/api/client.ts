// Typed API client with automatic Bearer token injection and error handling
import type {
  LoginRequest,
  LoginResponse,
  Organization,
  CreateOrgRequest,
  UpdateOrgRequest,
  FacebookPage,
  ConnectPageRequest,
  Template,
  CreateTemplateRequest,
  Schedule,
  CreateScheduleRequest,
  ScheduledPost,
  CreateScheduledPostRequest,
  PublishedPost,
  AIGeneratorRequest,
  AIGeneratorResponse,
  Notification,
  AnalyticsData,
  ApiResponse,
  ApiError,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export class ApiClient {
  private static instance: ApiClient;
  private token: string | null = null;

  private constructor() {
    this.loadToken();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: 'API request failed',
        code: 'API_ERROR',
        statusCode: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.error?.message || errorData.message || error.message;
        error.code = errorData.error?.code || error.code;
      } catch {
        // Response is not JSON
      }

      throw error;
    }

    return response.json();
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<ApiResponse<LoginResponse>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (response.data) {
      this.setToken(response.data.token);
    }
    return response.data!;
  }

  async googleLogin(token: string): Promise<LoginResponse> {
    const response = await this.request<ApiResponse<LoginResponse>>(
      '/auth/google',
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      }
    );
    if (response.data) {
      this.setToken(response.data.token);
    }
    return response.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.request<ApiResponse<any>>('/auth/me');
    return response.data;
  }

  // Organization endpoints
  async getOrganizations(): Promise<Organization[]> {
    const response = await this.request<ApiResponse<Organization[]>>(
      '/organizations'
    );
    return response.data || [];
  }

  async getOrganization(id: string): Promise<Organization> {
    const response = await this.request<ApiResponse<Organization>>(
      `/organizations/${id}`
    );
    return response.data!;
  }

  async createOrganization(data: CreateOrgRequest): Promise<Organization> {
    const response = await this.request<ApiResponse<Organization>>(
      '/organizations',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async updateOrganization(
    id: string,
    data: UpdateOrgRequest
  ): Promise<Organization> {
    const response = await this.request<ApiResponse<Organization>>(
      `/organizations/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async deleteOrganization(id: string): Promise<void> {
    await this.request(`/organizations/${id}`, { method: 'DELETE' });
  }

  // Facebook Pages endpoints
  async getFacebookPages(orgId: string): Promise<FacebookPage[]> {
    const response = await this.request<ApiResponse<FacebookPage[]>>(
      `/organizations/${orgId}/pages`
    );
    return response.data || [];
  }

  async connectFacebookPage(
    orgId: string,
    data: ConnectPageRequest
  ): Promise<FacebookPage> {
    const response = await this.request<ApiResponse<FacebookPage>>(
      `/organizations/${orgId}/pages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async togglePageActive(
    orgId: string,
    pageId: string,
    isActive: boolean
  ): Promise<FacebookPage> {
    const response = await this.request<ApiResponse<FacebookPage>>(
      `/organizations/${orgId}/pages/${pageId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }
    );
    return response.data!;
  }

  async deleteFacebookPage(orgId: string, pageId: string): Promise<void> {
    await this.request(
      `/organizations/${orgId}/pages/${pageId}`,
      { method: 'DELETE' }
    );
  }

  // Template endpoints
  async getTemplates(orgId: string): Promise<Template[]> {
    const response = await this.request<ApiResponse<Template[]>>(
      `/organizations/${orgId}/templates`
    );
    return response.data || [];
  }

  async createTemplate(
    orgId: string,
    data: CreateTemplateRequest
  ): Promise<Template> {
    const response = await this.request<ApiResponse<Template>>(
      `/organizations/${orgId}/templates`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async updateTemplate(
    orgId: string,
    templateId: string,
    data: Partial<CreateTemplateRequest>
  ): Promise<Template> {
    const response = await this.request<ApiResponse<Template>>(
      `/organizations/${orgId}/templates/${templateId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async deleteTemplate(orgId: string, templateId: string): Promise<void> {
    await this.request(
      `/organizations/${orgId}/templates/${templateId}`,
      { method: 'DELETE' }
    );
  }

  // Schedule endpoints
  async getSchedules(orgId: string): Promise<Schedule[]> {
    const response = await this.request<ApiResponse<Schedule[]>>(
      `/organizations/${orgId}/schedules`
    );
    return response.data || [];
  }

  async createSchedule(
    orgId: string,
    data: CreateScheduleRequest
  ): Promise<Schedule> {
    const response = await this.request<ApiResponse<Schedule>>(
      `/organizations/${orgId}/schedules`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async deleteSchedule(orgId: string, scheduleId: string): Promise<void> {
    await this.request(
      `/organizations/${orgId}/schedules/${scheduleId}`,
      { method: 'DELETE' }
    );
  }

  // Scheduled Posts endpoints
  async getScheduledPosts(orgId: string): Promise<ScheduledPost[]> {
    const response = await this.request<ApiResponse<ScheduledPost[]>>(
      `/organizations/${orgId}/scheduled-posts`
    );
    return response.data || [];
  }

  async createScheduledPost(
    orgId: string,
    data: CreateScheduledPostRequest
  ): Promise<ScheduledPost> {
    const response = await this.request<ApiResponse<ScheduledPost>>(
      `/organizations/${orgId}/scheduled-posts`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async deleteScheduledPost(orgId: string, postId: string): Promise<void> {
    await this.request(
      `/organizations/${orgId}/scheduled-posts/${postId}`,
      { method: 'DELETE' }
    );
  }

  // Published Posts endpoints
  async getPublishedPosts(orgId: string): Promise<PublishedPost[]> {
    const response = await this.request<ApiResponse<PublishedPost[]>>(
      `/organizations/${orgId}/published-posts`
    );
    return response.data || [];
  }

  async publishPost(orgId: string, scheduledPostId: string): Promise<PublishedPost> {
    const response = await this.request<ApiResponse<PublishedPost>>(
      `/organizations/${orgId}/scheduled-posts/${scheduledPostId}/publish`,
      { method: 'POST' }
    );
    return response.data!;
  }

  async deletePublishedPost(orgId: string, postId: string): Promise<void> {
    await this.request(
      `/organizations/${orgId}/published-posts/${postId}`,
      { method: 'DELETE' }
    );
  }

  // AI Generator endpoint
  async generateContent(
    orgId: string,
    data: AIGeneratorRequest
  ): Promise<AIGeneratorResponse> {
    const response = await this.request<ApiResponse<AIGeneratorResponse>>(
      `/organizations/${orgId}/ai/generate`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  // Notifications endpoints
  async getNotifications(): Promise<Notification[]> {
    const response = await this.request<ApiResponse<Notification[]>>(
      '/notifications'
    );
    return response.data || [];
  }

  async markNotificationRead(notificationId: string): Promise<Notification> {
    const response = await this.request<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`,
      { method: 'PATCH' }
    );
    return response.data!;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoint
  async getAnalytics(orgId: string): Promise<AnalyticsData> {
    const response = await this.request<ApiResponse<AnalyticsData>>(
      `/organizations/${orgId}/analytics`
    );
    return response.data!;
  }
}

export const apiClient = ApiClient.getInstance();
