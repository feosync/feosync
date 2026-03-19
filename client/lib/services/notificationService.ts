import { v4 as uuidv4 } from 'uuid';
import { mockNotifications } from '../mockData';
import type { Notification } from '../mockData';

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

class NotificationService {
  private notifications: Notification[] = [...mockNotifications];

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.notifications.filter((n) => n.userId === userId));
      }, 300);
    });
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const count = this.notifications.filter((n) => n.userId === userId && !n.read).length;
        resolve(count);
      }, 200);
    });
  }

  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newNotification: Notification = {
          id: uuidv4(),
          userId: input.userId,
          title: input.title,
          message: input.message,
          type: input.type,
          read: false,
          createdAt: new Date(),
        };
        this.notifications.push(newNotification);
        resolve(newNotification);
      }, 300);
    });
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notification = this.notifications.find((n) => n.id === id);
        if (!notification) {
          resolve(null);
          return;
        }
        notification.read = true;
        resolve(notification);
      }, 200);
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let count = 0;
        this.notifications.forEach((n) => {
          if (n.userId === userId && !n.read) {
            n.read = true;
            count++;
          }
        });
        resolve(count);
      }, 300);
    });
  }

  async deleteNotification(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.notifications.findIndex((n) => n.id === id);
        if (index !== -1) {
          this.notifications.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 200);
    });
  }

  getLocalNotifications(): Notification[] {
    return [...this.notifications];
  }

  setLocalNotifications(notifications: Notification[]): void {
    this.notifications = [...notifications];
  }
}

export const notificationService = new NotificationService();
