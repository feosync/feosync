import { v4 as uuidv4 } from 'uuid';
import { mockPublishedPosts } from '../mockData';
import type { PublishedPost } from '../mockData';

interface CreatePublishedPostInput {
  organizationId: string;
  pageId: string;
  content: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

interface UpdatePublishedPostInput {
  likes?: number;
  comments?: number;
  shares?: number;
}

class PublishedPostService {
  private posts: PublishedPost[] = [...mockPublishedPosts];

  async getPublishedPostsByOrganization(organizationId: string): Promise<PublishedPost[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.posts.filter((p) => p.organizationId === organizationId));
      }, 300);
    });
  }

  async getPublishedPostsByPage(pageId: string): Promise<PublishedPost[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.posts.filter((p) => p.pageId === pageId));
      }, 300);
    });
  }

  async getPublishedPostById(id: string): Promise<PublishedPost | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.posts.find((p) => p.id === id) || null);
      }, 200);
    });
  }

  async createPublishedPost(input: CreatePublishedPostInput): Promise<PublishedPost> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPost: PublishedPost = {
          id: uuidv4(),
          organizationId: input.organizationId,
          pageId: input.pageId,
          content: input.content,
          likes: input.likes || 0,
          comments: input.comments || 0,
          shares: input.shares || 0,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.posts.push(newPost);
        resolve(newPost);
      }, 400);
    });
  }

  async updatePublishedPost(id: string, input: UpdatePublishedPostInput): Promise<PublishedPost | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post = this.posts.find((p) => p.id === id);
        if (!post) {
          resolve(null);
          return;
        }
        if (input.likes !== undefined) post.likes = input.likes;
        if (input.comments !== undefined) post.comments = input.comments;
        if (input.shares !== undefined) post.shares = input.shares;
        post.updatedAt = new Date();
        resolve(post);
      }, 300);
    });
  }

  async deletePublishedPost(id: string): Promise<boolean> {
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

  getLocalPosts(): PublishedPost[] {
    return [...this.posts];
  }

  setLocalPosts(posts: PublishedPost[]): void {
    this.posts = [...posts];
  }
}

export const publishedPostService = new PublishedPostService();
