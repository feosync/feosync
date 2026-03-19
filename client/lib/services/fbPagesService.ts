import { v4 as uuidv4 } from 'uuid';
import { mockFacebookPages } from '../mockData';
import type { FacebookPage } from '../mockData';

interface ConnectPageInput {
  organizationId: string;
  pageId: string;
  pageName: string;
  pageUrl: string;
}

class FBPagesService {
  private pages: FacebookPage[] = [...mockFacebookPages];

  async getPagesByOrganization(organizationId: string): Promise<FacebookPage[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.pages.filter((p) => p.organizationId === organizationId));
      }, 300);
    });
  }

  async getPageById(id: string): Promise<FacebookPage | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.pages.find((p) => p.id === id) || null);
      }, 200);
    });
  }

  async connectPage(input: ConnectPageInput): Promise<FacebookPage> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPage: FacebookPage = {
          id: uuidv4(),
          organizationId: input.organizationId,
          pageId: input.pageId,
          pageName: input.pageName,
          pageUrl: input.pageUrl,
          isActive: true,
          connectedAt: new Date(),
        };
        this.pages.push(newPage);
        resolve(newPage);
      }, 600);
    });
  }

  async togglePageActive(id: string): Promise<FacebookPage | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const page = this.pages.find((p) => p.id === id);
        if (!page) {
          resolve(null);
          return;
        }
        page.isActive = !page.isActive;
        resolve(page);
      }, 300);
    });
  }

  async deletePage(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.pages.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.pages.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  }

  getLocalPages(): FacebookPage[] {
    return [...this.pages];
  }

  setLocalPages(pages: FacebookPage[]): void {
    this.pages = [...pages];
  }
}

export const fbPagesService = new FBPagesService();
