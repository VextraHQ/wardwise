"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  HiBell,
  HiMail,
  HiInformationCircle,
  HiCheck,
  HiTrash,
} from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * TODO: [BACKEND] Notifications API
 * - GET /api/voters/:nin/notifications
 * - Should return paginated list with unread count
 * - Support filtering by type (campaign, system, reminder)
 */

/**
 * TODO: [SYNC] Candidate Dashboard Integration
 * - Notifications created on candidate dashboard should appear here
 * - Campaign updates, survey invites, event announcements
 * - Real-time sync via WebSocket or polling
 */

/**
 * TODO: [BACKEND] Notification actions
 * - PATCH /api/notifications/:id/read - mark as read
 * - DELETE /api/notifications/:id - delete notification
 * - POST /api/notifications/mark-all-read - mark all as read
 */

interface Notification {
  id: string;
  type: "campaign" | "system" | "reminder";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// Mock notifications - replace with API data in production
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "campaign",
    title: "Town Hall Meeting Scheduled",
    message:
      "Your Governor candidate is hosting a virtual town hall on January 15th. Check your email for the link.",
    date: "Today",
    read: false,
  },
  {
    id: "2",
    type: "system",
    title: "Registration Complete",
    message: "Your voter registration has been completed successfully.",
    date: "Yesterday",
    read: false,
  },
  {
    id: "3",
    type: "reminder",
    title: "Complete Your Survey",
    message: "You have 1 pending survey from your House Rep candidate.",
    date: "2 days ago",
    read: true,
  },
];

export function UpdatesTab() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    /**
     * TODO: [BACKEND] Call mark all read API
     * - Should update all notifications server-side
     * - Handle partial failures gracefully
     */
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markAsRead = async (id: string) => {
    /**
     * TODO: [BACKEND] Call mark as read API
     */
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const deleteNotification = async (id: string) => {
    /**
     * TODO: [BACKEND] Call delete notification API
     * - Consider soft delete for audit trail
     */
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "campaign":
        return HiMail;
      case "reminder":
        return HiInformationCircle;
      default:
        return HiBell;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/60 bg-card relative overflow-hidden border"
      >
        <div className="border-primary/30 absolute top-0 left-0 size-3 border-t border-l" />
        <div className="border-primary/30 absolute top-0 right-0 size-3 border-t border-r" />

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/5 text-primary border-primary/20 flex size-8 items-center justify-center rounded-lg border">
                <HiBell className="size-4" />
              </div>
              <div>
                <h3 className="text-foreground text-xs font-bold tracking-tight uppercase sm:text-sm">
                  Notifications
                </h3>
                <p className="text-muted-foreground font-mono text-xs font-medium tracking-widest uppercase">
                  {unreadCount > 0 ? `${unreadCount} New` : "All caught up"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 gap-1 px-2 text-xs font-bold tracking-widest uppercase"
              >
                <HiCheck className="size-3" />
                Mark all read
              </Button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group flex items-start gap-3 rounded-lg p-3 transition-colors ${
                      notification.read
                        ? "bg-muted/30"
                        : "bg-primary/5 border-primary/10 border"
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        notification.read
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`text-xs font-bold ${
                              notification.read
                                ? "text-foreground/80"
                                : "text-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge className="h-4 px-1 text-[7px]">New</Badge>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification.id)}
                              className="text-muted-foreground hover:text-foreground p-1"
                              title="Mark as read"
                            >
                              <HiCheck className="size-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            title="Delete"
                          >
                            <HiTrash className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                        {notification.message}
                      </p>
                      <p className="text-muted-foreground/60 mt-1 text-xs">
                        {notification.date}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="bg-muted/50 mb-3 flex size-12 items-center justify-center rounded-xl">
                <HiBell className="text-muted-foreground size-6" />
              </div>
              <p className="text-foreground text-sm font-medium">
                No notifications
              </p>
              <p className="text-muted-foreground mt-1 max-w-[200px] text-xs">
                You're all caught up! New updates from your candidates will
                appear here.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-border/40 bg-muted/20 flex items-start gap-3 border p-4"
      >
        <HiInformationCircle className="text-muted-foreground size-5 shrink-0" />
        <div className="text-muted-foreground text-xs leading-relaxed">
          <p>
            <strong>Campaign updates</strong> come from candidates you selected.
          </p>
          <p className="mt-1">
            <strong>System notifications</strong> are about your account status.
          </p>
          <p className="mt-1">
            You can manage notification preferences in{" "}
            <span className="font-semibold">Settings</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
