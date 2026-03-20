const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiClient {
  private static instance: ApiClient
  private token: string | null = null

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('feosync_token')
    }
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) ApiClient.instance = new ApiClient()
    return ApiClient.instance
  }

  setToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') localStorage.setItem('feosync_token', token)
  }

  clearToken(): void {
    this.token = null
    if (typeof window !== 'undefined') localStorage.removeItem('feosync_token')
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })

    if (response.status === 401) {
      this.clearToken()
      window.location.href = '/login'
      throw new Error('Session expirée')
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Erreur inconnue' }))
      throw new Error(err.detail || 'Erreur API')
    }

    return response.json()
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async googleLogin(googleToken: string): Promise<{ access_token: string; user: any }> {
    // POST /api/v1/auth/google/auth
    const data = await this.request<{ access_token: string; token_type: string; user: any }>(
      '/api/v1/auth/google/auth',
      { method: 'POST', body: JSON.stringify({ token: googleToken }) }
    )
    this.setToken(data.access_token)
    return data
  }

  async getCurrentUser(): Promise<any> {
    return this.request('/api/v1/auth/me')
  }

  async logout(): Promise<void> {
    try { await this.request('/api/v1/auth/logout', { method: 'POST' }) } finally {
      this.clearToken()
    }
  }

  // ── Organisations ─────────────────────────────────────────────────────────

  async getOrganisations(): Promise<any[]> {
    return this.request('/api/v1/org/')
  }

  async createOrganisation(data: any): Promise<any> {
    return this.request('/api/v1/org/', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateOrganisation(id: string, data: any): Promise<any> {
    return this.request(`/api/v1/org/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteOrganisation(id: string): Promise<void> {
    await this.request(`/api/v1/org/${id}`, { method: 'DELETE' })
  }

  // ── Facebook Pages ────────────────────────────────────────────────────────

  async getFacebookPages(orgId: string): Promise<any[]> {
    return this.request(`/api/v1/fb/?org_id=${orgId}`)
  }

  async getFacebookOAuthUrl(orgId: string): Promise<{ oauth_url: string }> {
    return this.request(`/api/v1/fb/oauth/url?org_id=${orgId}`)
  }

  async connectFacebookPage(data: any): Promise<any> {
    return this.request('/api/v1/fb/connect', { method: 'POST', body: JSON.stringify(data) })
  }

  async toggleFacebookPage(pageId: string, orgId: string): Promise<any> {
    return this.request(`/api/v1/fb/${pageId}/toggle?org_id=${orgId}`, { method: 'PATCH' })
  }

  async disconnectFacebookPage(pageId: string, orgId: string): Promise<void> {
    await this.request(`/api/v1/fb/${pageId}?org_id=${orgId}`, { method: 'DELETE' })
  }

  async syncInsights(pageId: string, orgId: string): Promise<any> {
    return this.request(`/api/v1/fb/${pageId}/insights/sync?org_id=${orgId}`, { method: 'POST' })
  }

  async getInsights(pageId: string, orgId: string): Promise<any[]> {
    return this.request(`/api/v1/fb/${pageId}/insights?org_id=${orgId}`)
  }

  // ── Scheduled Posts ───────────────────────────────────────────────────────

  async getScheduledPosts(orgId: string): Promise<any[]> {
    return this.request(`/api/v1/scheduled/org/${orgId}`)
  }
  async getScheduledPostById(postId: string): Promise<any> {
    return this.request(`/api/v1/scheduled/${postId}`)
  }

  async createScheduledPost(data: any): Promise<any> {
    return this.request('/api/v1/scheduled/', { method: 'POST', body: JSON.stringify(data) })
  }
  
  async patchCaption(postId: string, data: any): Promise<any> {
    return this.request(`/api/v1/scheduled/${postId}/caption`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async patchImage(postId: string, data: any): Promise<any> {
    return this.request(`/api/v1/scheduled/${postId}/image`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async uploadImage(postId: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const response = await fetch(`${API_BASE_URL}/api/v1/scheduled/${postId}/image/upload`, {
      method: 'PATCH', body: formData, headers
    })
    if (!response.ok) throw new Error('Upload échoué')
    return response.json()
  }

  async confirmScheduledPost(postId: string, data: any): Promise<any> {
    return this.request(`/api/v1/scheduled/${postId}/confirm`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteScheduledPost(postId: string): Promise<void> {
    await this.request(`/api/v1/scheduled/${postId}`, { method: 'DELETE' })
  }

  // ── Published Posts ───────────────────────────────────────────────────────

  async getPublishedPosts(orgId: string): Promise<any[]> {
    return this.request(`/api/v1/published/org/${orgId}`)
  }


  async getPublishedPostById(postId: string): Promise<any> {
    return this.request(`/api/v1/published/${postId}`)
  }

  async deletePublishedPost(postId: string): Promise<void> {
      await this.request(`/api/v1/published/${postId}`, { method: 'DELETE' })
  }
  async publishPost(scheduledPostId: string): Promise<any> {
    return this.request('/api/v1/published/publish', {
      method: 'POST',
      body: JSON.stringify({ scheduled_post_id: scheduledPostId })
    })
  }



  async syncMetrics(postId: string): Promise<any> {
    return this.request(`/api/v1/published/${postId}/sync-metrics`, { method: 'POST' })
  }

  // ── AI ────────────────────────────────────────────────────────────────────

  async getAiHistory(orgId: string): Promise<any[]> {
    return this.request(`/api/v1/ai/history/${orgId}`)
  }

  async getAiQuota(orgId: string): Promise<any> {
    return this.request(`/api/v1/ai/quota?org_id=${orgId}`)
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  async getNotifications(unreadOnly = false): Promise<any[]> {
    return this.request(`/api/v1/notif/?unread_only=${unreadOnly}`)
  }

  async getNotificationSummary(): Promise<{ total: number; unread: number }> {
    return this.request('/api/v1/notif/summary')
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request(`/api/v1/notif/${id}/read`, { method: 'PATCH' })
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/api/v1/notif/read-all', { method: 'PATCH' })
  }

  async deleteNotification(id: string): Promise<void> {
    await this.request(`/api/v1/notif/${id}`, { method: 'DELETE' })
  }

  // ── Templates ─────────────────────────────────────────────────────────────

  async getTemplates(orgId: string): Promise<any[]> {
    return this.request(`/api/v1/post-template/available/${orgId}`)
  }

  async createTemplate(data: any): Promise<any> {
    return this.request('/api/v1/post-template/', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateTemplate(id: string, orgId: string, data: any): Promise<any> {
    return this.request(`/api/v1/post-template/${id}?org_id=${orgId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteTemplate(id: string, orgId: string): Promise<void> {
    await this.request(`/api/v1/post-template/${id}?org_id=${orgId}`, {
      method: 'DELETE'
    })
  }

  // ── Post Analytics ────────────────────────────────────────────────────────

  async getAnalyticsByOrg(orgId: string): Promise<any[]> {
    return this.request(`/api/v1/post-analytics/all_post/${orgId}`)
  }
}

export const apiClient = ApiClient.getInstance()
export const isUsingMockApi = () => false  // ← plus de mock