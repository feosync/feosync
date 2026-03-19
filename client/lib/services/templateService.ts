import { v4 as uuidv4 } from 'uuid';
import { mockPostTemplates } from '../mockData';
import type { PostTemplate } from '../mockData';

interface CreateTemplateInput {
  organizationId: string;
  title: string;
  content: string;
}

interface UpdateTemplateInput {
  title?: string;
  content?: string;
}

class TemplateService {
  private templates: PostTemplate[] = [...mockPostTemplates];

  async getTemplatesByOrganization(organizationId: string): Promise<PostTemplate[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.templates.filter((t) => t.organizationId === organizationId));
      }, 300);
    });
  }

  async getTemplateById(id: string): Promise<PostTemplate | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.templates.find((t) => t.id === id) || null);
      }, 200);
    });
  }

  async createTemplate(input: CreateTemplateInput): Promise<PostTemplate> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTemplate: PostTemplate = {
          id: uuidv4(),
          organizationId: input.organizationId,
          title: input.title,
          content: input.content,
          category: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.templates.push(newTemplate);
        resolve(newTemplate);
      }, 400);
    });
  }

  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<PostTemplate | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const template = this.templates.find((t) => t.id === id);
        if (!template) {
          resolve(null);
          return;
        }
        if (input.title) template.title = input.title;
        if (input.content) template.content = input.content;
        template.updatedAt = new Date();
        resolve(template);
      }, 400);
    });
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.templates.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.templates.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  }

  getLocalTemplates(): PostTemplate[] {
    return [...this.templates];
  }

  setLocalTemplates(templates: PostTemplate[]): void {
    this.templates = [...templates];
  }
}

export const templateService = new TemplateService();
