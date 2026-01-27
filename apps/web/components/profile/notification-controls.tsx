"use client";

import { Bell, BellRing, Mail } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { updateNotificationSetting } from "@/lib/clerk/updateNotificationSetting";

type NotifState = {
  all: boolean;
  inApp: boolean;
  email: boolean;
};

export function NotificationControls() {
  const [state, setState] = useState<NotifState>({
    all: true,
    inApp: true,
    email: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    setState(
      user.publicMetadata.notifSettings ?? {
        all: true,
        inApp: true,
        email: true,
      },
    );
  }, [user]);

  async function persist(next: NotifState) {
    if (!user) return;
    const toastId = toast.loading("Saving notification preferences...");
    setSubmitting(true);
    try {
      await updateNotificationSetting(user.id, next);
      await user.reload();
      setState(next);
      toast.success("Notification preferences saved", { id: toastId });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Failed to save notification preferences", { id: toastId });
    } finally {
      toast.dismiss(toastId);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Row
        icon={<BellRing className="h-4 w-4 text-cyan-300" />}
        title="All notifications"
        description="Master switch for all notifications."
        checked={state.all}
        disabled={submitting}
        onCheckedChange={(v) => {
          const next = {
            all: v,
            inApp: v ? state.inApp : false,
            email: v ? state.email : false,
          };
          // if turning ON all, keep previous individual toggles as-is
          if (v)
            ((next.inApp = state.inApp || true),
              (next.email = state.email || true));
          persist(next);
        }}
      />

      <Separator className="bg-cyan-500/10" />

      <Row
        icon={<Bell className="h-4 w-4 text-cyan-300" />}
        title="In-app notifications"
        description="Banners and in-app updates."
        checked={state.all && state.inApp}
        disabled={submitting}
        onCheckedChange={(v) => persist({ ...state, inApp: v, all: v || state.email })}
      />

      <Row
        icon={<Mail className="h-4 w-4 text-cyan-300" />}
        title="Email notifications"
        description="Email updates and important alerts."
        checked={state.all && state.email}
        disabled={submitting}
        onCheckedChange={(v) => persist({ ...state, email: v, all: v || state.inApp })}
      />
    </div>
  );
}

function Row(props: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-cyan-500/15 bg-black/30 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {props.icon}
          <Label className="text-sm font-medium text-cyan-50">
            {props.title}
          </Label>
        </div>
        <p className="mt-1 text-xs text-cyan-100/60">{props.description}</p>
      </div>

      <Switch
        checked={props.checked}
        disabled={props.disabled}
        onCheckedChange={props.onCheckedChange}
      />
    </div>
  );
}
