import { v4 as uuidv4 } from 'uuid';
import { mockScheduledPosts } from '../mockData';
import type { ScheduledPost } from '../mockData';

interface CreateScheduledPostInput {
  organizationId: string;
  templateId: string;
  pageIds: string[];
  caption: string;
  scheduleId: string;
  scheduledFor: Date;
}

interface UpdateScheduledPostInput {
  templateId?: string;
  pageIds?: string[];
  caption?: string;
  scheduleId?: string;
  scheduledFor?: Date;
  status?: 'scheduled' | 'published' | 'failed';
}

class ScheduledPostService {
  private posts: ScheduledPost[] = [...mockScheduledPosts];

  async getScheduledPostsByOrganization(organizationId: string): Promise<ScheduledPost[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.posts.filter((p) => p.organizationId === organizationId));
      }, 300);
    });
  }

  async getScheduledPostById(id: string): Promise<ScheduledPost | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.posts.find((p) => p.id === id) || null);
      }, 200);
    });
  }

  async createScheduledPost(input: CreateScheduledPostInput): Promise<ScheduledPost> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPost: ScheduledPost = {
          id: uuidv4(),
          organizationId: input.organizationId,
          templateId: input.templateId,
          pageIds: input.pageIds,
          caption: input.caption,
          scheduleId: input.scheduleId,
          status: 'scheduled',
          scheduledFor: input.scheduledFor,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.posts.push(newPost);
        resolve(newPost);
      }, 400);
    });
  }

  async updateScheduledPost(id: string, input: UpdateScheduledPostInput): Promise<ScheduledPost | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post = this.posts.find((p) => p.id === id);
        if (!post) {
          resolve(null);
          return;
        }
        if (input.templateId) post.templateId = input.templateId;
        if (input.pageIds) post.pageIds = input.pageIds;
        if (input.caption) post.caption = input.caption;
        if (input.scheduleId) post.scheduleId = input.scheduleId;
        if (input.scheduledFor) post.scheduledFor = input.scheduledFor;
        if (input.status) post.status = input.status;
        post.updatedAt = new Date();
        resolve(post);
      }, 400);
    });
  }

  async deleteScheduledPost(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.posts.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.posts.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  }

  async publishScheduledPost(id: string): Promise<ScheduledPost | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post = this.posts.find((p) => p.id === id);
        if (!post) {
          resolve(null);
          return;
        }
        post.status = 'published';
        post.publishedAt = new Date();
        post.updatedAt = new Date();
        resolve(post);
      }, 500);
    });
  }

  getLocalPosts(): ScheduledPost[] {
    return [...this.posts];
  }

  setLocalPosts(posts: ScheduledPost[]): void {
    this.posts = [...posts];
  }
}

export const scheduledPostService = new ScheduledPostService();
