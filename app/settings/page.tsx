"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import AvatarUpload from "@/app/components/AvatarUpload";
import Link from "next/link";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  fullName: z.string().min(2, "Minimal 2 karakter"),
  headline: z.string().max(80).optional(),
  bio: z.string().max(280).optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  avatar: z.string().optional(),
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

function compactPayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === "" || v === undefined || v === null) return;
    out[k as keyof T] = v as any;
  });
  return out;
}

export default function SettingsPage() {
  const router = useRouter();
  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const socialForm = useForm<SocialForm>({ resolver: zodResolver(socialSchema) });

  useEffect(() => {
    (async () => {
      try {
        const profRes = await api.get("/profile");
        const personal = profRes?.data?.data?.personal;
        const user = profRes?.data?.data;

        profileForm.reset({
          fullName: user?.fullName || "",
          headline: personal?.jobTitle || "",
          bio: personal?.bio || "",
          company: personal?.company || "",
          role: personal?.role || "",
          avatar: user?.photo || "",
        });

        if (personal?.socialLinks) {
          socialForm.reset(personal.socialLinks);
        } else {
          const socialsRes = await api.get("/profile/socials");
          socialForm.reset(socialsRes?.data?.data || {});
        }
      } catch (e) {
        console.warn("Failed to load profile:", e);
      }
    })();
  }, [profileForm, socialForm]);

  const onSubmitProfile = async (values: ProfileForm) => {
    try {
      const payload = compactPayload({
        fullName: values.fullName,
        headline: values.headline,
        bio: values.bio,
        company: values.company,
        role: values.role,
        photo: values.avatar, // kirim sebagai photo
      });
      await api.patch("/profile", payload);

      // sinkron cache + bump version + hapus preview
      try {
        const raw = localStorage.getItem("user");
        const prev = raw ? JSON.parse(raw) : {};
        const next = {
          ...prev,
          name: values.fullName || prev.name,
          fullName: values.fullName || prev.fullName,
          photo: payload.photo ?? prev.photo ?? null,
          avatar: payload.photo ?? prev.avatar ?? null,
        };
        localStorage.setItem("user", JSON.stringify(next));
        localStorage.setItem("user:avatarVersion", String(Date.now()));
        // localStorage.removeItem("user:avatarPreview");
      } catch {}

      alert("Profil berhasil diperbarui!");
    } catch (e) {
      alert("Gagal memperbarui profil.");
      console.error(e);
    }
  };

  const onSubmitSocials = async (values: SocialForm) => {
    try {
      const payload = compactPayload(values);
      await api.patch("/profile/socials", payload);
      alert("Social links berhasil diperbarui!");
    } catch (e) {
      alert("Gagal memperbarui social links.");
      console.error(e);
    }
  };

  return (
    <div className="relative w-full min-h-[100svh] bg-[#FAFAFC] dark:bg-[#0A0A0C] text-neutral-900 dark:text-white transition-colors duration-300">
      <div className="container max-w-4xl mx-auto py-10">
        <div className="mb-8 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-md">
            ⚙️
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Pengaturan Profil</h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            Atur informasi profil dan tautan sosial Anda di sini.
          </p>
        </div>

        {/* PROFILE */}
        <div className="card-glass rounded-3xl p-6 md:p-8 mb-10">
          <h2 className="text-lg font-semibold mb-5 border-b border-black/10 dark:border-white/10 pb-3">
            Profil Pribadi
          </h2>

          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black/70 dark:text-white/80 mb-2">
                Foto Profil
              </label>
              <AvatarUpload
                value={profileForm.watch("avatar")}
                onValueChange={(v?: string) => {
                  profileForm.setValue("avatar", v);
                  try {
                    if (v) localStorage.setItem("user:avatarPreview", v);
                    else localStorage.removeItem("user:avatarPreview");
                  } catch {}
                }}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-black/70 dark:text-white/80">
                  Nama Lengkap
                </label>
                <input className="input mt-1" {...profileForm.register("fullName")} placeholder="Nama lengkap" />
                {profileForm.formState.errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">
                    {String(profileForm.formState.errors.fullName.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 dark:text-white/80">
                  Headline
                </label>
                <input className="input mt-1" {...profileForm.register("headline")} placeholder="Contoh: Product Designer" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black/70 dark:text-white/80">
                Bio
              </label>
              <textarea className="input mt-1 min-h-[100px]" {...profileForm.register("bio")} placeholder="Ceritakan tentang Anda" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-black/70 dark:text-white/80">
                  Perusahaan
                </label>
                <input className="input mt-1" {...profileForm.register("company")} placeholder="Nama perusahaan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 dark:text-white/80">
                  Role / Posisi
                </label>
                <input className="input mt-1" {...profileForm.register("role")} placeholder="Jabatan / Posisi" />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="btn-primary px-6">💾 Simpan Profil</button>
            </div>
          </form>
        </div>

        {/* SOCIALS */}
        <div className="card-glass rounded-3xl p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-5 border-b border-black/10 dark:border-white/10 pb-3">
            Social Links
          </h2>
          <form onSubmit={socialForm.handleSubmit(onSubmitSocials)} className="space-y-5">
            {[
              { key: "instagram", label: "Instagram URL" },
              { key: "linkedin", label: "LinkedIn URL" },
              { key: "tiktok", label: "TikTok URL" },
              { key: "x", label: "X (Twitter) URL" },
              { key: "website", label: "Website URL" },
            ].map((f) => {
              const err = socialForm.formState.errors[f.key as keyof SocialForm];
              return (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-black/70 dark:text-white/80">
                    {f.label}
                  </label>
                  <input
                    className="input mt-1"
                    placeholder="https://..."
                    {...socialForm.register(f.key as keyof SocialForm)}
                  />
                  {err && <p className="mt-1 text-sm text-red-600">URL tidak valid</p>}
                </div>
              );
            })}

            <div className="flex justify-end">
              <button className="btn-primary px-6">💾 Simpan Social Links</button>
            </div>
          </form>
        </div>

        <div className="text-center mt-10">
          <Link href="/dashboard" className="text-sm text-black/60 hover:underline dark:text-white/60">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}