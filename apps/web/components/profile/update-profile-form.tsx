"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { Camera, Save, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type Props = {
  initialFirstName: string;
  initialLastName: string;
  initialImageUrl: string;
};

export function UpdateProfileForm({
  initialFirstName,
  initialLastName,
  initialImageUrl,
}: Props) {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = React.useState(initialFirstName);
  const [lastName, setLastName] = React.useState(initialLastName);
  const [imageUrl, setImageUrl] = React.useState(initialImageUrl);
  const [saving, setSaving] = React.useState(false);

  if (!isLoaded) return null;

  async function onSaveName() {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName, lastName });
      toast.success("Name updated");
    } catch (e: any) {
      toast.error(e?.errors?.[0]?.message ?? "Failed to update name");
    } finally {
      setSaving(false);
    }
  }

  async function onPickAvatar(file: File) {
    if (!user) return;
    setSaving(true);
    try {
      await user.setProfileImage({ file });
      toast.success("Profile picture updated");
    } catch (e: any) {
      toast.error(e?.errors?.[0]?.message ?? "Failed to update picture");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Avatar"
          className="h-14 w-14 rounded-2xl border border-cyan-500/20 object-cover"
          onLoad={() => {}}
        />
        <div className="flex items-center gap-2">
          <Label
            htmlFor="pfp"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-500/20 bg-black/30 px-3 py-2 text-sm text-cyan-50 hover:border-cyan-400/40"
          >
            <Camera className="h-4 w-4 text-cyan-300" />
            Update picture
          </Label>
          <input
            id="pfp"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPickAvatar(f);
            }}
          />
        </div>
      </div>

      <Separator className="bg-cyan-500/10" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-cyan-100/70">First name</Label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border-cyan-500/20 bg-black/30 text-cyan-50 placeholder:text-cyan-100/40"
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-cyan-100/70">Last name</Label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border-cyan-500/20 bg-black/30 text-cyan-50 placeholder:text-cyan-100/40"
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-cyan-100/70">
          <UserRound className="h-4 w-4 text-cyan-300" />
          <span>Changes sync to Clerk immediately.</span>
        </div>

        <Button
          onClick={() => void onSaveName()}
          disabled={saving}
          className="rounded-xl bg-cyan-500/15 text-cyan-50 hover:bg-cyan-500/25"
          variant="secondary"
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
