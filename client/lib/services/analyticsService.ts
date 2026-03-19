import { mockPublishedPosts, mockScheduledPosts } from '../mockData';
import type { PublishedPost } from '../mockData';

interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagement: number;
  postCount: number;
}

interface PostMetric {
  postId: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  totalEngagement: number;
  publishedAt: Date;
}

class AnalyticsService {
  async getEngagementMetrics(organizationId: string): Promise<EngagementMetrics> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const posts = mockPublishedPosts.filter((p) => p.organizationId === organizationId);
        const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
        const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
        const totalShares = posts.reduce((sum, p) => sum + p.shares, 0);
        const totalEngagement = totalLikes + totalComments + totalShares;

        resolve({
          totalLikes,
          totalComments,
          totalShares,
          averageEngagement: posts.length > 0 ? Math.round(totalEngagement / posts.length) : 0,
          postCount: posts.length,
        });
      }, 300);
    });
  }

  async getPostMetrics(organizationId: string): Promise<PostMetric[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const posts = mockPublishedPosts.filter((p) => p.organizationId === organizationId);
        const metrics = posts.map((p) => ({
          postId: p.id,
          content: p.content.substring(0, 100) + (p.content.length > 100 ? '...' : ''),
          likes: p.likes,
          comments: p.comments,
          shares: p.shares,
          totalEngagement: p.likes + p.comments + p.shares,
          publishedAt: p.publishedAt,
        }));
        // Sort by most recent first
        metrics.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        resolve(metrics);
      }, 300);
    });
  }

  async getEngagementTrend(organizationId: string, days: number = 30): Promise<Array<{ date: string; engagement: number }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const posts = mockPublishedPosts.filter((p) => p.organizationId === organizationId);
        const trend: { [key: string]: number } = {};

        // Generate trend data
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          trend[dateStr] = 0;
        }

        // Aggregate engagement by date
        posts.forEach((post) => {
          const dateStr = new Date(post.publishedAt).toISOString().split('T')[0];
          if (trend[dateStr] !== undefined) {
            trend[dateStr] += post.likes + post.comments + post.shares;
          }
        });

        const result = Object.entries(trend)
          .map(([date, engagement]) => ({ date, engagement }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        resolve(result);
      }, 400);
    });
  }

  async getScheduledPostStats(organizationId: string): Promise<{ scheduled: number; published: number; failed: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const posts = mockScheduledPosts.filter((p) => p.organizationId === organizationId);
        const stats = {
          scheduled: posts.filter((p) => p.status === 'scheduled').length,
          published: posts.filter((p) => p.status === 'published').length,
          failed: posts.filter((p) => p.status === 'failed').length,
        };
        resolve(stats);
      }, 300);
    });
  }
}

export const analyticsService = new AnalyticsService();
