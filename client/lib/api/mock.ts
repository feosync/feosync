// Mock API layer for testing without a real backend
import type {
  Organization,
  FacebookPage,
  Template,
  Schedule,
  ScheduledPost,
  PublishedPost,
  Notification,
  AnalyticsData,
} from './types';

// Mock data storage
let mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Farm Tech Solutions',
    description: 'Agricultural technology company',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'org-2',
    name: 'Green Earth Initiative',
    description: 'Environmental sustainability organization',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
  },
];

let mockPages: FacebookPage[] = [
  {
    id: 'page-1',
    organizationId: 'org-1',
    pageId: 'fb-001',
    name: 'Farm Tech Solutions',
    accessToken: 'token-123',
    isActive: true,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'page-2',
    organizationId: 'org-1',
    pageId: 'fb-002',
    name: 'Farm Tips & Tricks',
    accessToken: 'token-124',
    isActive: true,
    createdAt: new Date('2024-01-25'),
  },
];

let mockTemplates: Template[] = [
  {
    id: 'template-1',
    organizationId: 'org-1',
    name: 'Daily Tips',
    content: 'Did you know? {tip} Share this with your friends!',
    category: 'tips',
    isDefault: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'template-2',
    organizationId: 'org-1',
    name: 'Seasonal Guide',
    content: 'This season, remember to: {advice}',
    category: 'guide',
    isDefault: true,
    createdAt: new Date('2024-01-15'),
  },
];

let mockSchedules: Schedule[] = [
  {
    id: 'schedule-1',
    organizationId: 'org-1',
    name: 'Daily Morning',
    hours: [8],
    days: [1, 2, 3, 4, 5],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'schedule-2',
    organizationId: 'org-1',
    name: 'Weekly Friday',
    hours: [14],
    days: [5],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
];

let mockScheduledPosts: ScheduledPost[] = [
  {
    id: 'scheduled-1',
    organizationId: 'org-1',
    templateId: 'template-1',
    scheduleId: 'schedule-1',
    pageIds: ['page-1'],
    caption: 'Check out this amazing farming technique!',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
  {
    id: 'scheduled-2',
    organizationId: 'org-1',
    templateId: 'template-2',
    scheduleId: 'schedule-2',
    pageIds: ['page-1', 'page-2'],
    caption: 'Seasonal farming tips for optimal growth',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
];

let mockPublishedPosts: PublishedPost[] = [
  {
    id: 'published-1',
    organizationId: 'org-1',
    pageId: 'page-1',
    content: 'Organic farming is the future of sustainable agriculture!',
    likes: 342,
    comments: 28,
    shares: 15,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'published-2',
    organizationId: 'org-1',
    pageId: 'page-1',
    content: 'Crop rotation improves soil health and reduces pests naturally.',
    likes: 456,
    comments: 42,
    shares: 23,
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

let mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    message: 'Post published successfully to 2 pages',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    message: 'Your scheduled post is ready to publish',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

// Mock API functions
export async function delay(ms: number = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Organizations
export async function mockGetOrganizations(): Promise<Organization[]> {
  await delay();
  return mockOrganizations;
}

export async function mockCreateOrganization(data: any): Promise<Organization> {
  await delay();
  const org: Organization = {
    id: `org-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockOrganizations.push(org);
  return org;
}

export async function mockUpdateOrganization(
  id: string,
  data: any
): Promise<Organization> {
  await delay();
  const org = mockOrganizations.find((o) => o.id === id);
  if (!org) throw new Error('Organization not found');
  Object.assign(org, data, { updatedAt: new Date() });
  return org;
}

export async function mockDeleteOrganization(id: string): Promise<void> {
  await delay();
  mockOrganizations = mockOrganizations.filter((o) => o.id !== id);
}

// Facebook Pages
export async function mockGetFacebookPages(
  orgId: string
): Promise<FacebookPage[]> {
  await delay();
  return mockPages.filter((p) => p.organizationId === orgId);
}

export async function mockConnectFacebookPage(
  orgId: string,
  data: any
): Promise<FacebookPage> {
  await delay();
  const page: FacebookPage = {
    id: `page-${Date.now()}`,
    organizationId: orgId,
    ...data,
    isActive: true,
    createdAt: new Date(),
  };
  mockPages.push(page);
  return page;
}

export async function mockTogglePageActive(
  orgId: string,
  pageId: string,
  isActive: boolean
): Promise<FacebookPage> {
  await delay();
  const page = mockPages.find(
    (p) => p.id === pageId && p.organizationId === orgId
  );
  if (!page) throw new Error('Page not found');
  page.isActive = isActive;
  return page;
}

export async function mockDeleteFacebookPage(
  orgId: string,
  pageId: string
): Promise<void> {
  await delay();
  mockPages = mockPages.filter(
    (p) => !(p.id === pageId && p.organizationId === orgId)
  );
}

// Templates
export async function mockGetTemplates(orgId: string): Promise<Template[]> {
  await delay();
  return mockTemplates.filter((t) => t.organizationId === orgId);
}

export async function mockCreateTemplate(
  orgId: string,
  data: any
): Promise<Template> {
  await delay();
  const template: Template = {
    id: `template-${Date.now()}`,
    organizationId: orgId,
    ...data,
    isDefault: false,
    createdAt: new Date(),
  };
  mockTemplates.push(template);
  return template;
}

export async function mockDeleteTemplate(
  orgId: string,
  templateId: string
): Promise<void> {
  await delay();
  mockTemplates = mockTemplates.filter(
    (t) => !(t.id === templateId && t.organizationId === orgId)
  );
}

// Schedules
export async function mockGetSchedules(orgId: string): Promise<Schedule[]> {
  await delay();
  return mockSchedules.filter((s) => s.organizationId === orgId);
}

export async function mockCreateSchedule(
  orgId: string,
  data: any
): Promise<Schedule> {
  await delay();
  const schedule: Schedule = {
    id: `schedule-${Date.now()}`,
    organizationId: orgId,
    ...data,
    isActive: true,
    createdAt: new Date(),
  };
  mockSchedules.push(schedule);
  return schedule;
}

export async function mockDeleteSchedule(
  orgId: string,
  scheduleId: string
): Promise<void> {
  await delay();
  mockSchedules = mockSchedules.filter(
    (s) => !(s.id === scheduleId && s.organizationId === orgId)
  );
}

// Scheduled Posts
export async function mockGetScheduledPosts(
  orgId: string
): Promise<ScheduledPost[]> {
  await delay();
  return mockScheduledPosts.filter((p) => p.organizationId === orgId);
}

export async function mockCreateScheduledPost(
  orgId: string,
  data: any
): Promise<ScheduledPost> {
  await delay();
  const post: ScheduledPost = {
    id: `scheduled-${Date.now()}`,
    organizationId: orgId,
    ...data,
    status: 'scheduled',
    createdAt: new Date(),
  };
  mockScheduledPosts.push(post);
  return post;
}

export async function mockDeleteScheduledPost(
  orgId: string,
  postId: string
): Promise<void> {
  await delay();
  mockScheduledPosts = mockScheduledPosts.filter(
    (p) => !(p.id === postId && p.organizationId === orgId)
  );
}

// Published Posts
export async function mockGetPublishedPosts(
  orgId: string
): Promise<PublishedPost[]> {
  await delay();
  return mockPublishedPosts.filter((p) => p.organizationId === orgId);
}

export async function mockPublishPost(
  orgId: string,
  scheduledPostId: string
): Promise<PublishedPost> {
  await delay();
  const scheduledPost = mockScheduledPosts.find(
    (p) => p.id === scheduledPostId
  );
  if (!scheduledPost) throw new Error('Scheduled post not found');

  const published: PublishedPost = {
    id: `published-${Date.now()}`,
    organizationId: orgId,
    pageId: scheduledPost.pageIds[0],
    content: scheduledPost.caption,
    likes: 0,
    comments: 0,
    shares: 0,
    publishedAt: new Date(),
  };
  mockPublishedPosts.push(published);
  
  // Remove from scheduled
  mockScheduledPosts = mockScheduledPosts.filter(
    (p) => p.id !== scheduledPostId
  );

  return published;
}

// Analytics
export async function mockGetAnalytics(orgId: string): Promise<AnalyticsData> {
  await delay();
  const posts = mockPublishedPosts.filter((p) => p.organizationId === orgId);
  
  return {
    totalPosts: posts.length,
    totalScheduled: mockScheduledPosts.filter(
      (p) => p.organizationId === orgId
    ).length,
    connectedPages: mockPages.filter(
      (p) => p.organizationId === orgId && p.isActive
    ).length,
    avgEngagement:
      posts.length > 0
        ? Math.round(
            posts.reduce(
              (sum, p) => sum + p.likes + p.comments + p.shares,
              0
            ) / posts.length
          )
        : 0,
    topPost: posts.reduce(
      (top, p) =>
        p.likes + p.comments + p.shares >
        top.likes + top.comments + top.shares
          ? p
          : top,
      posts[0] || {
        id: '',
        organizationId: '',
        pageId: '',
        content: '',
        likes: 0,
        comments: 0,
        shares: 0,
        publishedAt: new Date(),
      }
    ),
    postMetricsOverTime: posts
      .slice(-30)
      .map((p) => ({
        date: p.publishedAt.toLocaleDateString(),
        likes: p.likes,
        comments: p.comments,
        shares: p.shares,
      })),
  };
}

// AI Generator
export async function mockGenerateContent(data: any): Promise<any> {
  await delay(500);
  const topics: Record<string, string[]> = {
    farming: [
      'Learn about crop rotation techniques for sustainable farming practices',
      'Discover the benefits of organic fertilizers for soil health',
      'Master water conservation methods in agriculture',
    ],
    agriculture: [
      'Advanced irrigation systems improve crop yields significantly',
      'Pest management strategies for organic farms',
      'Seasonal planting guide for maximum harvest',
    ],
    tips: [
      'Did you know? Companion planting can naturally repel pests',
      'Pro tip: Mulching helps retain soil moisture and nutrients',
      'Expert advice: Test your soil pH for optimal plant growth',
    ],
  };

  const category = data.topic?.split(' ')[0].toLowerCase() || 'farming';
  const variations = topics[category] || topics.farming;

  return {
    content: variations[Math.floor(Math.random() * variations.length)],
    variations: variations,
  };
}

// Notifications
export async function mockGetNotifications(): Promise<Notification[]> {
  await delay();
  return mockNotifications;
}

export async function mockMarkNotificationRead(
  notificationId: string
): Promise<Notification> {
  const notif = mockNotifications.find((n) => n.id === notificationId);
  if (!notif) throw new Error('Notification not found');
  notif.isRead = true;
  return notif;
}

export async function mockDeleteNotification(notificationId: string): Promise<void> {
  await delay();
  mockNotifications = mockNotifications.filter((n) => n.id !== notificationId);
}
