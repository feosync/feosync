'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient } from './client';
import type {
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
} from './types';

// Organizations
export const useOrganizations = (options?: UseQueryOptions<Organization[]>) => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => apiClient.getOrganizations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useOrganization = (
  id: string,
  options?: UseQueryOptions<Organization>
) => {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => apiClient.getOrganization(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useCreateOrganization = (options?: UseMutationOptions<Organization, Error, CreateOrgRequest>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.createOrganization(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['organizations'], (old: Organization[] = []) => [
        ...old,
        data,
      ]);
    },
    ...options,
  });
};

export const useUpdateOrganization = (
  id: string,
  options?: UseMutationOptions<Organization, Error, UpdateOrgRequest>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.updateOrganization(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['organizations', id], data);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    ...options,
  });
};

export const useDeleteOrganization = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    ...options,
  });
};

// Facebook Pages
export const useFacebookPages = (
  orgId: string,
  options?: UseQueryOptions<FacebookPage[]>
) => {
  return useQuery({
    queryKey: ['organizations', orgId, 'pages'],
    queryFn: () => apiClient.getFacebookPages(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useConnectFacebookPage = (
  orgId: string,
  options?: UseMutationOptions<FacebookPage, Error, ConnectPageRequest>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.connectFacebookPage(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'pages'],
      });
    },
    ...options,
  });
};

export const useTogglePageActive = (
  orgId: string,
  options?: UseMutationOptions<FacebookPage, Error, { pageId: string; isActive: boolean }>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, isActive }) =>
      apiClient.togglePageActive(orgId, pageId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'pages'],
      });
    },
    ...options,
  });
};

export const useDeleteFacebookPage = (
  orgId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId) => apiClient.deleteFacebookPage(orgId, pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'pages'],
      });
    },
    ...options,
  });
};

// Templates
export const useTemplates = (
  orgId: string,
  options?: UseQueryOptions<Template[]>
) => {
  return useQuery({
    queryKey: ['organizations', orgId, 'templates'],
    queryFn: () => apiClient.getTemplates(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useCreateTemplate = (
  orgId: string,
  options?: UseMutationOptions<Template, Error, CreateTemplateRequest>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.createTemplate(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'templates'],
      });
    },
    ...options,
  });
};

export const useUpdateTemplate = (
  orgId: string,
  templateId: string,
  options?: UseMutationOptions<Template, Error, Partial<CreateTemplateRequest>>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      apiClient.updateTemplate(orgId, templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'templates'],
      });
    },
    ...options,
  });
};

export const useDeleteTemplate = (
  orgId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId) =>
      apiClient.deleteTemplate(orgId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'templates'],
      });
    },
    ...options,
  });
};

// Schedules
export const useSchedules = (
  orgId: string,
  options?: UseQueryOptions<Schedule[]>
) => {
  return useQuery({
    queryKey: ['organizations', orgId, 'schedules'],
    queryFn: () => apiClient.getSchedules(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useCreateSchedule = (
  orgId: string,
  options?: UseMutationOptions<Schedule, Error, CreateScheduleRequest>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.createSchedule(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'schedules'],
      });
    },
    ...options,
  });
};

export const useDeleteSchedule = (
  orgId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId) =>
      apiClient.deleteSchedule(orgId, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'schedules'],
      });
    },
    ...options,
  });
};

// Scheduled Posts
export const useScheduledPosts = (
  orgId: string,
  options?: UseQueryOptions<ScheduledPost[]>
) => {
  return useQuery({
    queryKey: ['organizations', orgId, 'scheduled-posts'],
    queryFn: () => apiClient.getScheduledPosts(orgId),
    enabled: !!orgId,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useCreateScheduledPost = (
  orgId: string,
  options?: UseMutationOptions<ScheduledPost, Error, CreateScheduledPostRequest>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.createScheduledPost(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'scheduled-posts'],
      });
    },
    ...options,
  });
};

export const useDeleteScheduledPost = (
  orgId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId) =>
      apiClient.deleteScheduledPost(orgId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'scheduled-posts'],
      });
    },
    ...options,
  });
};

// Published Posts
export const usePublishedPosts = (
  orgId: string,
  options?: UseQueryOptions<PublishedPost[]>
) => {
  return useQuery({
    queryKey: ['organizations', orgId, 'published-posts'],
    queryFn: () => apiClient.getPublishedPosts(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

export const usePublishPost = (
  orgId: string,
  options?: UseMutationOptions<PublishedPost, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduledPostId) =>
      apiClient.publishPost(orgId, scheduledPostId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'published-posts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'scheduled-posts'],
      });
    },
    ...options,
  });
};

export const useDeletePublishedPost = (
  orgId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId) =>
      apiClient.deletePublishedPost(orgId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'published-posts'],
      });
    },
    ...options,
  });
};

// AI Generator
export const useGenerateContent = (
  orgId: string,
  options?: UseMutationOptions<AIGeneratorResponse, Error, AIGeneratorRequest>
) => {
  return useMutation({
    mutationFn: (data) => apiClient.generateContent(orgId, data),
    ...options,
  });
};

// Notifications
export const useNotifications = (options?: UseQueryOptions<Notification[]>) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.getNotifications(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useMarkNotificationRead = (
  options?: UseMutationOptions<Notification, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) =>
      apiClient.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    ...options,
  });
};

export const useDeleteNotification = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) =>
      apiClient.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    ...options,
  });
};

// Analytics
export const useAnalytics = (
  orgId: string,
  options?: UseQueryOptions<AnalyticsData>
) => {
  return useQuery({
    queryKey: ['organizations', orgId, 'analytics'],
    queryFn: () => apiClient.getAnalytics(orgId),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  });
};
