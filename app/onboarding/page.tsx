"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Stepper from "@/app/components/Stepper";
import AvatarUpload from "@/app/components/AvatarUpload";
import { api } from "@/lib/api";
import {
  loadOnboarding,
  saveOnboarding,
  clearOnboarding,
  type OnboardingData,
  setOnboardingComplete,
} from "@/lib/onboarding";
import { useRouter } from "next/navigation";

const steps = ["Profile", "Social Links"] as const;

const profileSchema = z.object({
  name: z.string().min(2, "Minimal 2 karakter"),
  headline: z.string().max(80).optional(),
  bio: z.string().max(280).optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  avatarDataUrl: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const socialSchema = z.object({
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  x: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});
type SocialForm = z.infer<typeof socialSchema>;
type SocialKey = keyof SocialForm;

function compactPayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === "" || v === undefined || v === null) return;
    out[k as keyof T] = v as any;
  });
  return out;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState<OnboardingData>({ profile: {}, socials: {} });

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const socialForm = useForm<SocialForm>({ resolver: zodResolver(socialSchema) });

  useEffect(() => {
    const saved = loadOnboarding();
    setData(saved);
    profileForm.reset(saved.profile as ProfileForm);
    socialForm.reset(saved.socials as SocialForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goto = (i: number) => setCurrent(Math.max(0, Math.min(steps.length - 1, i)));

  async function submitProfile(values: ProfileForm) {
    const merged = saveOnboarding({ profile: values });
    setData(merged);

    try {
      const payload = compactPayload({
        fullName: values.name,
        headline: values.headline,
        bio: values.bio,
        company: values.company,
        role: values.role,
        photo: values.avatarDataUrl,
      });
      await api.patch("/profile", payload);
      try {
        localStorage.setItem("user:avatarVersion", String(Date.now()));
        // localStorage.removeItem("user:avatarPreview");
      } catch {}
    } catch (e) {
      console.warn("Failed to update profile:", e);
    }

    try {
      const raw = localStorage.getItem("user");
      const prev = raw ? JSON.parse(raw) : {};
      const next = {
        ...prev,
        name: values.name,
        fullName: values.name,
        photo: values.avatarDataUrl ?? prev.photo ?? null,
        avatar: values.avatarDataUrl ?? prev.avatar ?? null,
      };
      localStorage.setItem("user", JSON.stringify(next));
      localStorage.setItem("user:avatarVersion", String(Date.now()));
    } catch {}

    goto(1);
  }

  async function submitSocial(values: SocialForm) {
    const merged = saveOnboarding({ socials: values });
    setData(merged);

    try {
      const payload = compactPayload(values);
      await api.patch("/profile/socials", payload);
    } catch (e) {
      console.warn("Failed to update socials:", e);
    }

    setOnboardingComplete(true);
    clearOnboarding();
    router.push("/dashboard");
  }

  const socialFields: { key: SocialKey; label: string }[] = [
    { key: "instagram", label: "Instagram URL" },
    { key: "linkedin", label: "LinkedIn URL" },
    { key: "tiktok", label: "TikTok URL" },
    { key: "x", label: "X (Twitter) URL" },
    { key: "website", label: "Website URL" },
  ];

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8 text-center">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-md">
          VC
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Lengkapi Profil Anda</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Hanya butuh beberapa langkah untuk membuat kartu digital Anda siap dipakai.
        </p>
      </div>

      <div className="card-glass rounded-3xl p-6 md:p-7">
        <Stepper steps={Array.from(steps)} current={current} />

        {current === 0 && (
          <form onSubmit={profileForm.handleSubmit(submitProfile)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-black/70 dark:text-white/80">Foto Profil</label>
              <div className="mt-2">
                <AvatarUpload
                  value={profileForm.watch("avatarDataUrl")}
                  onValueChange={(v?: string) => {
                    profileForm.setValue("avatarDataUrl", v);
                    try {
                      if (v) localStorage.setItem("user:avatarPreview", v);
                      else localStorage.removeItem("user:avatarPreview");
                    } catch {}
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-black/70 dark:text-white/80">Nama</label>
                <input className="input mt-1" {...profileForm.register("name")} placeholder="Nama lengkap" />
                {profileForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{String(profileForm.formState.errors.name.message)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 dark:text-white/80">Headline</label>
                <input className="input mt-1" {...profileForm.register("headline")} placeholder="Contoh: Product Designer" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black/70 dark:text-white/80">Bio</label>
              <textarea className="input mt-1 min-h-[96px]" {...profileForm.register("bio")} placeholder="Cerita singkat tentang Anda" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-black/70 dark:text-white/80">Perusahaan</label>
                <input className="input mt-1" {...profileForm.register("company")} placeholder="Nama perusahaan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 dark:text-white/80">Role</label>
                <input className="input mt-1" {...profileForm.register("role")} placeholder="Jabatan/Posisi" />
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <Link href="/dashboard" className="link-muted text-sm">Lewati</Link>
              <button className="btn-primary w-auto px-5">Simpan & Lanjut</button>
            </div>
          </form>
        )}

        {current === 1 && (
          <form onSubmit={socialForm.handleSubmit(submitSocial)} className="space-y-4">
            {socialFields.map((f) => {
              const err = socialForm.formState.errors[f.key];
              return (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-black/70 dark:text-white/80">{f.label}</label>
                  <input className="input mt-1" placeholder="https://..." {...socialForm.register(f.key)} />
                  {err && <p className="mt-1 text-sm text-red-600">URL tidak valid</p>}
                </div>
              );
            })}

            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrent(0)}
                className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm hover:bg-white dark:bg-white/10 dark:border-white/10 dark:text-white"
              >
                Kembali
              </button>
              <button className="btn-primary w-auto px-5">Selesai</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
