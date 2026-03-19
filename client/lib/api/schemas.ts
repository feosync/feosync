import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const googleLoginSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// Organization schemas
export const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100),
  description: z.string().max(500).optional(),
});

export const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

// Facebook Pages schemas
export const connectPageSchema = z.object({
  pageId: z.string().min(1, 'Page ID is required'),
  name: z.string().min(1, 'Page name is required'),
  accessToken: z.string().min(1, 'Access token is required'),
});

// Template schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000),
  category: z.string().min(1, 'Category is required'),
});

// Schedule schemas
export const createScheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  hours: z.array(z.number().min(0).max(23)).min(1, 'At least one hour is required'),
  days: z.array(z.number().min(1).max(31)).min(1, 'At least one day is required'),
  months: z.array(z.number().min(1).max(12)).min(1, 'At least one month is required'),
});

// Post schemas
export const createScheduledPostSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  scheduleId: z.string().min(1, 'Schedule is required'),
  pageIds: z.array(z.string()).min(1, 'At least one page is required'),
  caption: z.string().max(2000).optional(),
});

// AI Generator schemas
export const aiGeneratorSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(500),
  style: z.string().optional(),
  tone: z.string().optional(),
});

// Type exports for form usage
export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateOrgFormData = z.infer<typeof createOrgSchema>;
export type UpdateOrgFormData = z.infer<typeof updateOrgSchema>;
export type ConnectPageFormData = z.infer<typeof connectPageSchema>;
export type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;
export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;
export type CreateScheduledPostFormData = z.infer<typeof createScheduledPostSchema>;
export type AIGeneratorFormData = z.infer<typeof aiGeneratorSchema>;
