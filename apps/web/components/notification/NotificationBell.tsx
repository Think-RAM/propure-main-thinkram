"use client";

import * as React from "react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Bell,
  CheckCheck,
  Inbox,
  Loader2,
  Trash2,
  X,
  Sparkles,
  ExternalLink,
  RefreshCcw,
  Archive,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import type { Notification } from "@novu/js";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useMemo, useState } from "react";

type InboxTab = "all" | "unread";

function UnreadDot({ unread }: { unread: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full transition-opacity",
        unread
          ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.55)]"
          : "opacity-0",
      )}
      aria-hidden="true"
    />
  );
}

function InboxSkeleton() {
  return (
    <div className="space-y-3 p-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-cyan-500/15 bg-black/30 p-3"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 bg-white/5" />
              <Skeleton className="h-3 w-full bg-white/5" />
              <Skeleton className="h-3 w-1/2 bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FloatingNotificationInbox({
  align = "bottom-right",
  maxHeight = 480,
}: {
  align?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  maxHeight?: number;
}) {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markNotificationAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotification();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<InboxTab>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const filtered = useMemo(() => {
    if (tab === "unread") {
      return notifications.filter((n) => !n.isRead && !n.isArchived);
    };
    return notifications.filter((n) => !n.isArchived);
  }, [notifications, tab]);

  const containerPos = cn("fixed z-50 p-4", {
    "bottom-4 right-4": align === "bottom-right",
    "bottom-4 left-4": align === "bottom-left",
    "top-4 right-4": align === "top-right",
    "top-4 left-4": align === "top-left",
  });

  const onOpenChange = (v: boolean) => setOpen(v);

  async function handleMarkAll() {
    try {
      setBusyAll(true);
      await markAllAsRead();
      //   await fetchNotifications();
    } finally {
      setBusyAll(false);
    }
  }

  async function handleMarkOne(id: string) {
    try {
      setBusyId(id);
      await markNotificationAsRead(id);
      //   await fetchNotifications();
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(id: string) {
    try {
      setBusyId(id);
      await archiveNotification(id);
      //   await fetchNotifications();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRefresh() {
    await fetchNotifications();
  }

  return (
    <div className={containerPos}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open notifications"
            className={cn(
              "group relative grid h-12 w-12 place-items-center rounded-full",
              "bg-black/80 backdrop-blur-xl",
              "border border-cyan-500/25 shadow-[0_10px_30px_rgba(0,0,0,0.55)]",
              "transition-all hover:scale-[1.03] hover:border-cyan-400/45",
              "focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-black",
            )}
          >
            {/* glow */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl opacity-0 transition-opacity group-hover:opacity-100"
            />
            <Bell className="relative h-5 w-5 text-cyan-200" />

            {/* unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-400 px-1 text-[11px] font-semibold text-black shadow-[0_0_12px_rgba(34,211,238,0.55)]">
                {unreadCount > 10 ? "10+" : unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align={align === "bottom-right" ? "end" : "start"}
          side="top"
          sideOffset={14}
          className={cn(
            "w-[380px] p-0",
            "border border-cyan-500/20 bg-black/80 text-white backdrop-blur-xl",
            "shadow-[0_20px_60px_rgba(0,0,0,0.65)]",
            "rounded-2xl overflow-hidden",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-500/20 bg-black/40">
                <Inbox className="h-4 w-4 text-cyan-200" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">Notifications</p>
                  {unreadCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="border border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                    >
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/60">
                  Stay updated with the latest news
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleRefresh}
                    className="h-9 w-9 rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                    aria-label="Refresh"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-4 w-4 text-cyan-200" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border border-white/10 bg-black text-white">
                  Refresh
                </TooltipContent>
              </Tooltip>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator className="bg-cyan-500/10" />

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as InboxTab)}>
              <TabsList className="h-9 rounded-xl border border-cyan-500/20 bg-black/40 p-1">
                <TabsTrigger
                  value="all"
                  className="rounded-lg data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-200"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="rounded-lg data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleMarkAll}
              disabled={busyAll || unreadCount === 0}
              className={cn(
                "h-9 rounded-xl",
                "border border-cyan-500/20 bg-cyan-400/10 text-cyan-200",
                "hover:bg-cyan-400/15",
              )}
            >
              {busyAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Mark all read
            </Button>
          </div>

          <Separator className="bg-cyan-500/10" />

          {/* List */}
          <ScrollArea
            className="px-3 py-3"
            style={{ height: Math.min(maxHeight, 520) }}
          >
            {isLoading ? (
              <InboxSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-500/20 bg-black/40">
                  <Inbox className="h-5 w-5 text-cyan-200" />
                </div>
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs text-white/60">
                  {tab === "unread"
                    ? "You're all caught up."
                    : "New updates will appear here in real-time."}
                </p>
              </div>
            ) : (
              <div className="space-y-2" key={filtered.length}>
                {filtered.map((n) => {
                  const title = n.subject ?? "No title";
                  const body = n.body ?? "";
                  const url = n.primaryAction
                    ? n.primaryAction.redirect!
                    : null;
                  const createdAt = n.createdAt ? new Date(n.createdAt) : null;
                  const isBusy = busyId === n.id;

                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "group rounded-2xl border p-3 transition-colors",
                        "border-cyan-500/15 bg-black/35 hover:bg-black/50",
                        !n.isRead &&
                          "border-cyan-400/30 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 grid h-9 w-9 place-items-center rounded-xl border border-cyan-500/15 bg-black/40">
                          <UnreadDot unread={!n.isRead} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {title}
                              </p>
                              {createdAt && (
                                <p className="mt-0.5 text-[11px] text-white/55">
                                  {formatDistanceToNowStrict(createdAt, {
                                    addSuffix: true,
                                  })}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                                    onClick={() => handleMarkOne(n.id)}
                                    disabled={isBusy || n.isRead}
                                    aria-label="Mark as read"
                                  >
                                    {isBusy ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCheck className="h-4 w-4 text-cyan-200" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="border border-white/10 bg-black text-white">
                                  Mark read
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                                    onClick={() => handleArchive(n.id)}
                                    disabled={isBusy}
                                    aria-label="Archive"
                                  >
                                    {isBusy ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Archive className="h-4 w-4 text-white/70" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="border border-white/10 bg-black text-white">
                                  Archive
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>

                          {body && (
                            <p className="mt-2 line-clamp-2 text-sm text-white/70">
                              {body}
                            </p>
                          )}

                          {(url || (n as any)?.payload) && (
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-xs text-white/55">
                                {!n.isRead ? (
                                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-cyan-200">
                                    Unread
                                  </span>
                                ) : (
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                                    Read
                                  </span>
                                )}
                              </div>

                              {url ? (
                                <a
                                  href={url.url}
                                  target={url.target}
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200 hover:bg-cyan-400/15"
                                  onClick={() => {
                                    // nice UX: mark read when user engages
                                    if (!n.isRead) handleMarkOne(n.id);
                                  }}
                                >
                                  Open <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <Separator className="bg-cyan-500/10" />

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-xs text-white/55">
              {filtered.length} item{filtered.length === 1 ? "" : "s"}{" "}
              {tab === "unread" ? "unread" : "total"}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
