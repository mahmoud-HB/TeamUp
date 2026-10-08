/**
 * NotificationsService: système de notifications en temps réel
 */

import { ServiceResult, ok } from "./index";

export interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'application' | 'message';
  actor_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'follow',
    actor_name: 'Alice Martin',
    content: 'a commencé à vous suivre',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'like',
    actor_name: 'Bob Johnson',
    content: 'a aimé votre publication',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'application',
    actor_name: 'Claire Dupont',
    content: 'a postulé à votre offre',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const NotificationsService = {
  async getNotifications(userId: string): Promise<ServiceResult<Notification[]>> {
    return ok(MOCK_NOTIFICATIONS);
  },

  async markAsRead(notificationId: string): Promise<ServiceResult<null>> {
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);
    if (notif) {
      notif.is_read = true;
    }
    return ok(null);
  },

  async markAllAsRead(userId: string): Promise<ServiceResult<null>> {
    MOCK_NOTIFICATIONS.forEach((n) => (n.is_read = true));
    return ok(null);
  },

  async deleteNotification(notificationId: string): Promise<ServiceResult<null>> {
    const idx = MOCK_NOTIFICATIONS.findIndex((n) => n.id === notificationId);
    if (idx !== -1) {
      MOCK_NOTIFICATIONS.splice(idx, 1);
    }
    return ok(null);
  },
};
