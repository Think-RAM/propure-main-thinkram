"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Events, Notification, Novu } from "@novu/js";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (notificationId: string) => Promise<void>;
}

const applicationIdentifier = process.env.NEXT_PUBLIC_NOVU_APP_IDENTIFIER!;

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();
  const novu = useMemo(() => {
    if (!isLoaded || !user) return null;
    return new Novu({
      applicationIdentifier,
      subscriberId: user.id,
    });
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!novu) return;
    setIsLoading(true);
    try {
      console.log("Fetching Notifications")
      const response = await novu.notifications.list({ limit: 50 });
      setNotifications(response.data?.notifications ?? []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [novu]);

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (!novu) return;
      try {
        const notification = notifications.find(
          (notification) => notification.id === notificationId,
        );
        if (notification) {
          await notification.read();
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Failed to mark notification as read.");
      }
    },
    [novu, notifications],
  );

  const markAllAsRead = useCallback(async () => {
    if (!novu) return;
    try {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.isRead,
      );
      if (unreadNotifications.length === 0) return;
      await Promise.all(
        unreadNotifications.map((notification) => notification.read()),
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read.");
    }
  }, [novu, notifications]);

  const archiveNotification = useCallback(
    async (notificationId: string) => {
      if (!novu) return;
      try {
        const notification = notifications.find(
          (notification) => notification.id === notificationId,
        );
        if (notification) {
          await notification.archive();
        }
      } catch (error) {
        console.error("Error archiving notification:", error);
        toast.error("Failed to archive notification.");
      }
    },
    [novu, notifications],
  );

  useEffect(() => {
    if (!novu) return;

    fetchNotifications();

    const handleNotificationReceived = (
      data: Events["notifications.notification_received"],
    ) => {
      console.log("new notification =>", data);
      setNotifications((prev) => [data.result, ...prev]);
    };

    const handleUnreadCountChanged = (
      data: Events["notification.unread.resolved"],
    ) => {
      console.log("Data in Unread CountChanged", data);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === data.data?.id ? data.data : notification,
        ),
      );
    };

    const handleNotificationRead = (
      data: Events["notification.read.resolved"],
    ) => {
      console.log("Data in Notification Read", data);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === data.data?.id ? data.data : notification,
        ),
      );
    };

    const handleArchived = (data: Events["notification.archive.resolved"]) => {
      console.log("Data in Archived", data);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === data.data?.id ? data.data : notification,
        ),
      );
    };

    novu.on("notifications.notification_received", handleNotificationReceived);
    novu.on("notification.unread.resolved", handleUnreadCountChanged);
    novu.on("notification.read.resolved", handleNotificationRead);
    novu.on("notification.archive.resolved", handleArchived);
    return () => {
      novu.off(
        "notifications.notification_received",
        handleNotificationReceived,
      );
      novu.off("notification.unread.resolved", handleUnreadCountChanged);
      novu.off("notification.archive.resolved", handleArchived);
      novu.off("notification.read.resolved", handleNotificationRead);
    };
  }, [novu]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isLoading,
        fetchNotifications,
        markNotificationAsRead,
        markAllAsRead,
        archiveNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
