// Mock data for FeoSync SaaS platform
import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacebookPage {
  id: string;
  organizationId: string;
  pageId: string;
  pageName: string;
  pageUrl: string;
  isActive: boolean;
  connectedAt: Date;
}

export interface PostTemplate {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  category: 'app' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  organizationId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm format
  days?: number[]; // For weekly: 0-6 (Sun-Sat)
  dates?: number[]; // For monthly: 1-31
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledPost {
  id: string;
  organizationId: string;
  templateId: string;
  pageIds: string[];
  caption: string;
  scheduleId: string;
  status: 'scheduled' | 'published' | 'failed';
  scheduledFor: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

// Mock current user
export const mockCurrentUser: User = {
  id: uuidv4(),
  name: 'Anicet RANDRIANAMBININA',
  email: 'anicet@feosync.com',
  avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJokR2H29U_PN5Jees5Z0gJ-kqJAF84dqUP5nC4uzMakqz6fSfa=s96-c',
};

// Mock organizations
export const mockOrganizations: Organization[] = [
  {
    id: uuidv4(),
    name: 'Urban Farms Co',
    description: 'Community farming and sustainability',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-15'),
  },
  {
    id: uuidv4(),
    name: 'Green Earth Initiative',
    description: 'Environmental conservation platform',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: uuidv4(),
    name: 'Sustainable Living Hub',
    description: 'Educational resources and community',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-14'),
  },
];

// Mock Facebook pages
export const mockFacebookPages: FacebookPage[] = [
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    pageId: 'page_001',
    pageName: 'Urban Farms Co Main',
    pageUrl: 'https://facebook.com/urbanfarmsmain',
    isActive: true,
    connectedAt: new Date('2024-01-20'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    pageId: 'page_002',
    pageName: 'Urban Farms Community',
    pageUrl: 'https://facebook.com/urbanfarmscommunity',
    isActive: true,
    connectedAt: new Date('2024-02-10'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[1].id,
    pageId: 'page_003',
    pageName: 'Green Earth News',
    pageUrl: 'https://facebook.com/greenearth',
    isActive: true,
    connectedAt: new Date('2024-02-15'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[2].id,
    pageId: 'page_004',
    pageName: 'Sustainable Living Tips',
    pageUrl: 'https://facebook.com/sustainabletips',
    isActive: false,
    connectedAt: new Date('2024-03-01'),
  },
];

// Mock post templates
export const mockPostTemplates: PostTemplate[] = [
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    title: 'Daily Farming Tip',
    content: 'Did you know? Crop rotation is essential for maintaining soil health and nutrients. Our farms practice this sustainable method! 🌱',
    category: 'app',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    title: 'Sustainability Spotlight',
    content: 'Join us as we highlight sustainable farming practices that make a difference. Together we can build a greener tomorrow! 🌍',
    category: 'app',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    title: 'Community Event',
    content: 'You are invited to our community farming event this weekend! Learn hands-on techniques and connect with fellow farmers. 👨‍🌾',
    category: 'app',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[1].id,
    title: 'Conservation News',
    content: 'Latest conservation efforts: Learn how our initiatives protect biodiversity in local ecosystems. 🦋',
    category: 'app',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[1].id,
    title: 'Environmental Impact',
    content: 'Check out the positive environmental impact our community has made this quarter! 📊',
    category: 'app',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
  },
];

// Mock schedules
export const mockSchedules: Schedule[] = [
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    name: 'Daily Morning Post',
    frequency: 'daily',
    time: '09:00',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    name: 'Weekly Newsletter',
    frequency: 'weekly',
    time: '18:00',
    days: [0, 3, 5], // Sun, Wed, Fri
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[1].id,
    name: 'Monthly Report',
    frequency: 'monthly',
    time: '10:00',
    dates: [1, 15],
    isActive: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
];

// Mock scheduled posts
export const mockScheduledPosts: ScheduledPost[] = [
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    templateId: mockPostTemplates[0].id,
    pageIds: [mockFacebookPages[0].id, mockFacebookPages[1].id],
    caption: 'Companion planting can improve crop yield by up to 30%!',
    scheduleId: mockSchedules[0].id,
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    templateId: mockPostTemplates[1].id,
    pageIds: [mockFacebookPages[0].id],
    caption: 'Organic farming reduces chemical usage by 80% compared to conventional methods.',
    scheduleId: mockSchedules[1].id,
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-03-12'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[1].id,
    templateId: mockPostTemplates[3].id,
    pageIds: [mockFacebookPages[2].id],
    caption: 'This month we achieved a 45% increase in community engagement!',
    scheduleId: mockSchedules[2].id,
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    createdAt: new Date('2024-03-14'),
    updatedAt: new Date('2024-03-14'),
  },
];

// Mock published posts
export const mockPublishedPosts: PublishedPost[] = [
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    pageId: mockFacebookPages[0].id,
    content: 'Water conservation is crucial during dry seasons. Use drip irrigation to reduce water usage by 50%! 💧',
    likes: 342,
    comments: 28,
    shares: 15,
    publishedAt: new Date('2024-03-16'),
    createdAt: new Date('2024-03-16'),
    updatedAt: new Date('2024-03-16'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    pageId: mockFacebookPages[1].id,
    content: 'Excited to announce our new community garden initiative! Join us next weekend for the grand opening! 🌻',
    likes: 521,
    comments: 67,
    shares: 32,
    publishedAt: new Date('2024-03-15'),
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[1].id,
    pageId: mockFacebookPages[2].id,
    content: 'Our reforestation project has planted over 10,000 trees this quarter! Together we are making a difference. 🌲',
    likes: 892,
    comments: 145,
    shares: 203,
    publishedAt: new Date('2024-03-14'),
    createdAt: new Date('2024-03-14'),
    updatedAt: new Date('2024-03-14'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[0].id,
    pageId: mockFacebookPages[0].id,
    content: 'Permaculture design principles help create self-sustaining agricultural systems. Learn more about regenerative farming! 🌿',
    likes: 267,
    comments: 34,
    shares: 18,
    publishedAt: new Date('2024-03-13'),
    createdAt: new Date('2024-03-13'),
    updatedAt: new Date('2024-03-13'),
  },
  {
    id: uuidv4(),
    organizationId: mockOrganizations[2].id,
    pageId: mockFacebookPages[3].id,
    content: 'Did you know? Solar energy can reduce your farm\'s energy costs by 70%! Explore renewable options with us. ☀️',
    likes: 156,
    comments: 22,
    shares: 9,
    publishedAt: new Date('2024-03-12'),
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-03-12'),
  },
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: uuidv4(),
    userId: mockCurrentUser.id,
    title: 'Post Published',
    message: 'Your post "Water conservation tips" was successfully published!',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
  },
  {
    id: uuidv4(),
    userId: mockCurrentUser.id,
    title: 'High Engagement',
    message: 'Your post about community gardens reached 500+ people!',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: uuidv4(),
    userId: mockCurrentUser.id,
    title: 'Scheduled Post Ready',
    message: 'Your scheduled post for tomorrow at 9 AM is ready to go.',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: uuidv4(),
    userId: mockCurrentUser.id,
    title: 'New Page Connected',
    message: 'Successfully connected "Urban Farms Community" page!',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: uuidv4(),
    userId: mockCurrentUser.id,
    title: 'Template Created',
    message: 'Your new template "Daily Farming Tip" has been saved.',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: uuidv4(),
    userId: mockCurrentUser.id,
    title: 'Monthly Report Ready',
    message: 'Your March performance report is now available.',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: uuidv4(),
    userId: mockCurrentUser.id,
    title: 'Post Failed to Publish',
    message: 'Failed to publish to "Sustainable Living Tips". Please try again.',
    type: 'error',
    read: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
];
