"use client";

import * as React from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { revokeUserSessions } from "@/lib/clerk/revokeSession";

type Props =
  | { kind: "delete-account"; label?: never; sessionId?: never }
  | { kind: "revoke-session"; sessionId: string; label?: string };

export function DeleteAccountButton(props: Props) {
  const { user, signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const isDelete = props.kind === "delete-account";

  async function handleAction() {
    if(!user) return;
    setLoading(true);
    try {
      if (props.kind === "revoke-session") {
        // Revoke a specific session (sign out that device)
        await revokeUserSessions(props.sessionId);
        toast.success("Session revoked");
        router.refresh();
      } else {
        // Delete account
        await user?.delete();
        toast.success("Account deleted");
        await signOut({ redirectUrl: "/" });
      }
    } catch (e: any) {
      toast.error(e?.errors?.[0]?.message ?? "Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={isDelete ? "destructive" : "secondary"}
          className={
            isDelete
              ? "rounded-xl"
              : "rounded-xl bg-cyan-500/15 text-cyan-50 hover:bg-cyan-500/25"
          }
          disabled={loading}
        >
          {isDelete ? (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete account
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              {props.label ?? "Revoke"}
            </>
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="border-cyan-500/20 bg-zinc-950 text-cyan-50">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDelete ? "Delete your account?" : "Revoke this session?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-cyan-100/70">
            {isDelete
              ? "This is permanent. Your account and its data will be removed."
              : "This device will be signed out immediately."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-cyan-500/20 bg-black/30 text-cyan-50 hover:bg-black/40">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void handleAction()}
            className={isDelete ? "rounded-xl" : "rounded-xl bg-cyan-500/20 text-cyan-50 hover:bg-cyan-500/30"}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
