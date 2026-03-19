import { v4 as uuidv4 } from 'uuid';
import { mockOrganizations } from '../mockData';
import type { Organization } from '../mockData';

interface CreateOrgInput {
  name: string;
  description: string;
}

interface UpdateOrgInput {
  name?: string;
  description?: string;
}

class OrgService {
  private orgs: Organization[] = [...mockOrganizations];

  async getOrganizations(): Promise<Organization[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.orgs]);
      }, 300);
    });
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.orgs.find((org) => org.id === id) || null);
      }, 200);
    });
  }

  async createOrganization(input: CreateOrgInput): Promise<Organization> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrg: Organization = {
          id: uuidv4(),
          name: input.name,
          description: input.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.orgs.push(newOrg);
        resolve(newOrg);
      }, 400);
    });
  }

  async updateOrganization(id: string, input: UpdateOrgInput): Promise<Organization | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const org = this.orgs.find((o) => o.id === id);
        if (!org) {
          resolve(null);
          return;
        }
        if (input.name) org.name = input.name;
        if (input.description) org.description = input.description;
        org.updatedAt = new Date();
        resolve(org);
      }, 400);
    });
  }

  async deleteOrganization(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.orgs.findIndex((o) => o.id === id);
        if (index !== -1) {
          this.orgs.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  }

  getLocalOrgs(): Organization[] {
    return [...this.orgs];
  }

  setLocalOrgs(orgs: Organization[]): void {
    this.orgs = [...orgs];
  }
}

export const orgService = new OrgService();
