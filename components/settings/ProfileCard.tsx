"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import { removeAvatar, updateProfile, uploadAvatar } from "@/app/actions/settings";
import { reportErrors } from "@/lib/notify";
import { validateName } from "@/lib/settings";
import Avatar from "@/components/app/Avatar";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import ChangePasswordModal from "./ChangePasswordModal";

type ProfileCardProps = {
  name: string;
  email: string;
  avatarVersion: number | null;
};

// center-crop to a square, 256x256, WebP (JPEG where WebP isn't supported)
async function resizeAvatar(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const size = 256;
  const side = Math.min(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size
  );
  bitmap.close();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));

  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp") return webp;

  const jpeg = await encode("image/jpeg");
  if (!jpeg) throw new Error("Could not encode");
  return jpeg;
}

export default function ProfileCard({ name, email, avatarVersion }: ProfileCardProps) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 10_000_000) {
      toast.error("That image is too big. Choose one under 10 MB.");
      return;
    }

    setUploading(true);
    try {
      const blob = await resizeAvatar(file);
      const data = new FormData();
      data.append("avatar", blob, "avatar");

      const result = await uploadAvatar(data);
      if (!result.ok) {
        toast.error(result.message ?? "Couldn't upload the image.");
        return;
      }
      toast.success("Profile picture updated.");
      router.refresh();
    } catch {
      toast.error("We couldn't read that image. Try a JPG, PNG or WebP file.");
    } finally {
      setUploading(false);
    }
  }

  async function onRemove() {
    setUploading(true);
    try {
      await removeAvatar();
      toast.success("Profile picture removed.");
      router.refresh();
    } catch {
      toast.error("Couldn't remove the picture. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found = validateName(value);
    if (found) {
      setError(found);
      reportErrors({ name: found });
      return;
    }
    if (value.trim() === name) {
      toast.info("Nothing to save. Your name is the same.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile(value);
      if (!result.ok) {
        const msg = result.errors?.name ?? result.message;
        if (msg) {
          setError(result.errors?.name);
          toast.error(msg);
        }
        return;
      }
      toast.success("Profile saved.");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-8">
      <h2 className="font-heading text-lg font-semibold text-stone-900">Profile</h2>
      <p className="mt-1 text-sm text-stone-400">Your personal information</p>

      <div className="mt-6 flex items-center gap-4 border-b border-stone-100 pb-6 sm:gap-5">
        <Avatar
          name={name}
          version={avatarVersion}
          className="h-16 w-16 rounded-2xl text-2xl sm:h-20 sm:w-20 sm:rounded-3xl sm:text-3xl"
        />
        <div className="min-w-0">
          <p className="font-heading truncate text-lg font-semibold text-stone-900">{name}</p>
          <p className="truncate text-stone-400">{email}</p>

          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="text-sm font-semibold text-green-600 hover:underline disabled:opacity-50"
            >
              {uploading ? "Working..." : avatarVersion ? "Change avatar" : "Add avatar"}
            </button>
            {avatarVersion && (
              <button
                type="button"
                onClick={onRemove}
                disabled={uploading}
                className="text-sm font-semibold text-stone-400 hover:text-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={onPick}
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose a profile picture"
          />
        </div>
      </div>

      <form onSubmit={onSave} noValidate className="mt-6 space-y-5">
        <FormField
          label="Name"
          id="settings-name"
          autoComplete="name"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(undefined);
          }}
          error={error}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Email</p>
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-5 py-3.5 text-stone-500">
            <span className="min-w-0 flex-1 truncate">{email}</span>
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
          </div>
          <p className="mt-1.5 text-sm text-stone-400">
            Your email can&apos;t be changed after sign up.
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Password</p>
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-5 py-3">
            <span className="min-w-0 flex-1 tracking-widest text-stone-500" aria-hidden>
              ••••••••••
            </span>
            <button
              type="button"
              onClick={() => setChangingPassword(true)}
              className="shrink-0 text-sm font-semibold text-green-600 hover:underline"
            >
              Change password
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="w-full sm:w-48">
            <Button type="submit" loading={saving}>
              Save profile
            </Button>
          </div>
        </div>
      </form>

      <ChangePasswordModal
        open={changingPassword}
        onClose={() => setChangingPassword(false)}
      />
    </section>
  );
}