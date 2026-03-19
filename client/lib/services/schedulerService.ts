import { v4 as uuidv4 } from 'uuid';
import { mockSchedules } from '../mockData';
import type { Schedule } from '../mockData';

interface CreateScheduleInput {
  organizationId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  days?: number[];
  dates?: number[];
}

interface UpdateScheduleInput {
  name?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  time?: string;
  days?: number[];
  dates?: number[];
  isActive?: boolean;
}

class SchedulerService {
  private schedules: Schedule[] = [...mockSchedules];

  async getSchedulesByOrganization(organizationId: string): Promise<Schedule[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.schedules.filter((s) => s.organizationId === organizationId));
      }, 300);
    });
  }

  async getScheduleById(id: string): Promise<Schedule | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.schedules.find((s) => s.id === id) || null);
      }, 200);
    });
  }

  async createSchedule(input: CreateScheduleInput): Promise<Schedule> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSchedule: Schedule = {
          id: uuidv4(),
          organizationId: input.organizationId,
          name: input.name,
          frequency: input.frequency,
          time: input.time,
          days: input.days,
          dates: input.dates,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.schedules.push(newSchedule);
        resolve(newSchedule);
      }, 400);
    });
  }

  async updateSchedule(id: string, input: UpdateScheduleInput): Promise<Schedule | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const schedule = this.schedules.find((s) => s.id === id);
        if (!schedule) {
          resolve(null);
          return;
        }
        if (input.name) schedule.name = input.name;
        if (input.frequency) schedule.frequency = input.frequency;
        if (input.time) schedule.time = input.time;
        if (input.days) schedule.days = input.days;
        if (input.dates) schedule.dates = input.dates;
        if (input.isActive !== undefined) schedule.isActive = input.isActive;
        schedule.updatedAt = new Date();
        resolve(schedule);
      }, 400);
    });
  }

  async deleteSchedule(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.schedules.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.schedules.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  }

  getLocalSchedules(): Schedule[] {
    return [...this.schedules];
  }

  setLocalSchedules(schedules: Schedule[]): void {
    this.schedules = [...schedules];
  }
}

export const schedulerService = new SchedulerService();
