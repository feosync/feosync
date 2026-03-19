// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface GoogleLoginRequest {
  token: string;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrgRequest {
  name: string;
  description: string;
}

export interface UpdateOrgRequest {
  name?: string;
  description?: string;
}

// Facebook Pages Types
export interface FacebookPage {
  id: string;
  organizationId: string;
  pageId: string;
  name: string;
  accessToken: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ConnectPageRequest {
  pageId: string;
  name: string;
  accessToken: string;
}

// Template Types
export interface Template {
  id: string;
  organizationId: string;
  name: string;
  content: string;
  category: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface CreateTemplateRequest {
  name: string;
  content: string;
  category: string;
}

// Schedule Types
export interface Schedule {
  id: string;
  organizationId: string;
  name: string;
  hours: number[];
  days: number[];
  months: number[];
  isActive: boolean;
  createdAt: Date;
}

export interface CreateScheduleRequest {
  name: string;
  hours: number[];
  days: number[];
  months: number[];
}

// Post Types
export interface ScheduledPost {
  id: string;
  organizationId: string;
  templateId: string;
  scheduleId: string;
  pageIds: string[];
  caption: string;
  status: 'scheduled' | 'published' | 'failed';
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
}

export interface CreateScheduledPostRequest {
  templateId: string;
  scheduleId: string;
  pageIds: string[];
  caption: string;
}

export interface PublishedPost {
  id: string;
  organizationId: string;
  pageId: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  publishedAt: Date;
}

// AI Generator Types
export interface AIGeneratorRequest {
  topic: string;
  style?: string;
  tone?: string;
}

export interface AIGeneratorResponse {
  content: string;
  variations: string[];
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

// Analytics Types
export interface PostMetrics {
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  clicks: number;
  engagementRate: number;
}

export interface AnalyticsData {
  totalPosts: number;
  totalScheduled: number;
  connectedPages: number;
  avgEngagement: number;
  topPost: PublishedPost;
  postMetricsOverTime: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
