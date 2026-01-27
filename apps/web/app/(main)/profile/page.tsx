import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  Shield,
  UserRound,
  Smartphone,
  Bell,
  Mail,
  BellRing,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";
import { DeleteAccountButton } from "@/components/profile/delete-account-button";
import { NotificationControls } from "@/components/profile/notification-controls";

function fmtDate(d?: number | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function SettingsPage() {
  const { userId, sessionId } = await auth();

  if (!userId) {
    return (
      <main className="min-h-[70vh] grid place-items-center bg-black text-cyan-50">
        <Card className="w-full max-w-lg border-cyan-500/20 bg-zinc-950/60 text-cyan-50">
          <CardHeader>
            <CardTitle className="text-xl">You’re not signed in</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-cyan-100/80">
            Please sign in to view settings.
          </CardContent>
        </Card>
      </main>
    );
  }

  const user = await currentUser();
  const client = await clerkClient();

  // Active sessions across devices for this user
  const sessions = await client.sessions.getSessionList({ userId, limit: 50 });

  // Primary email (best effort)
  const primaryEmail =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress;

  // Primary phone (best effort)
  const primaryPhone =
    user?.phoneNumbers?.find((p) => p.id === user.primaryPhoneNumberId)
      ?.phoneNumber ?? user?.phoneNumbers?.[0]?.phoneNumber;

  const fullName =
    user?.firstName || user?.lastName
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : "—";

  return (
    <main className="min-h-screen bg-black text-cyan-50">
      {/* subtle cyan glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.10),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(34,211,238,0.12),transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-zinc-950/60 px-3 py-2 text-sm text-cyan-50 shadow-sm transition hover:border-cyan-400/40 hover:bg-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-100">
            Settings
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: Account overview */}
          <Card className="lg:col-span-1 border-cyan-500/20 bg-zinc-950/60 text-cyan-50 max-h-[80vh]">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-cyan-300" />
                Account
              </CardTitle>
              <p className="text-sm text-cyan-100/70">
                Your Clerk profile + identity details.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.imageUrl ?? ""}
                  alt="Profile"
                  className="h-12 w-12 rounded-2xl border border-cyan-500/20 object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">
                    {fullName}
                  </div>
                  <div className="truncate text-xs text-cyan-100/60">
                    {user?.username ? `@${user.username}` : user?.id}
                  </div>
                </div>
              </div>

              <Separator className="bg-cyan-500/10" />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-cyan-100/70">Email</span>
                  <span className="truncate text-cyan-50">
                    {primaryEmail ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-cyan-100/70">Phone</span>
                  <span className="truncate text-cyan-50">
                    {primaryPhone ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-cyan-100/70">Created</span>
                  <span className="text-cyan-50">
                    {fmtDate(user?.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-cyan-100/70">Last sign-in</span>
                  <span className="text-cyan-50">
                    {fmtDate(user?.lastSignInAt)}
                  </span>
                </div>
              </div>

              <Separator className="bg-cyan-500/10" />

              <div className="flex items-start gap-2 rounded-xl border border-cyan-500/15 bg-black/30 p-3">
                <Shield className="mt-0.5 h-4 w-4 text-cyan-300" />
                <div className="text-xs text-cyan-100/70">
                  Session:{" "}
                  <span className="text-cyan-50">{sessionId ?? "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Forms + sessions + notifications */}
          <div
            className="
                lg:col-span-2 space-y-6 max-h-[80vh] overflow-y-auto
                pr-2
                scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent
                hover:scrollbar-thumb-cyan-300/50
              "
          >
            {/* Update fields */}
            <Card className="border-cyan-500/20 bg-zinc-950/60 text-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-cyan-300" />
                  Update profile
                </CardTitle>
                <p className="text-sm text-cyan-100/70">
                  Update name and profile picture.
                </p>
              </CardHeader>
              <CardContent>
                <UpdateProfileForm
                  initialFirstName={user?.firstName ?? ""}
                  initialLastName={user?.lastName ?? ""}
                  initialImageUrl={user?.imageUrl ?? ""}
                />
              </CardContent>
            </Card>

            {/* Sessions / devices */}
            <Card className="border-cyan-500/20 bg-zinc-950/60 text-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-cyan-300" />
                  Devices & sessions
                </CardTitle>
                <p className="text-sm text-cyan-100/70">
                  See where you’re logged in and revoke old sessions.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions?.data?.length ? (
                  <div className="space-y-2">
                    {sessions.data.map((s) => {
                      const isCurrent = s.id === sessionId;
                      return (
                        <div
                          key={s.id}
                          className="flex flex-col gap-2 rounded-2xl border border-cyan-500/15 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium">
                                {s.latestActivity?.deviceType ??
                                  s.latestActivity?.browserName ??
                                  "Session"}
                              </span>
                              {isCurrent ? (
                                <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-100">
                                  Current
                                </Badge>
                              ) : (
                                <Badge className="border-cyan-500/20 bg-zinc-900 text-cyan-100/80">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-cyan-100/60">
                              {[
                                s.latestActivity?.browserName,
                                s.latestActivity?.browserVersion,
                                s.latestActivity?.deviceType,
                                s.latestActivity?.ipAddress,
                              ]
                                .filter(Boolean)
                                .join(" • ") || "—"}
                            </div>
                            <div className="mt-1 text-xs text-cyan-100/60">
                              Last active:{" "}
                              <span className="text-cyan-50">
                                {fmtDate(s.lastActiveAt)}
                              </span>
                            </div>
                          </div>

                          {/* Revoke on other devices (client action component below) */}
                          <div className="flex items-center gap-2">
                            {!isCurrent ? (
                              <DeleteAccountButton
                                kind="revoke-session"
                                sessionId={s.id}
                                label="Revoke"
                              />
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-cyan-500/15 bg-black/30 p-4 text-sm text-cyan-100/70">
                    No sessions found.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-cyan-500/20 bg-zinc-950/60 text-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-cyan-300" />
                  Notifications
                </CardTitle>
                <p className="text-sm text-cyan-100/70">
                  Control how you receive updates.
                </p>
              </CardHeader>
              <CardContent>
                <NotificationControls />
              </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border-red-500/25 bg-zinc-950/60 text-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-200">
                  <Trash2 className="h-5 w-5" />
                  Danger zone
                </CardTitle>
                <p className="text-sm text-cyan-100/70">
                  Permanently delete your account.
                </p>
              </CardHeader>
              <CardContent>
                <DeleteAccountButton kind="delete-account" />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-cyan-100/50">
          <Bell className="h-3.5 w-3.5" />
          <span>Tap toggles to save preferences instantly.</span>
          <Mail className="h-3.5 w-3.5" />
        </div>
      </div>
    </main>
  );
}
