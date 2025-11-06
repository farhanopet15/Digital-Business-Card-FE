"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";

export type Mode = "login" | "register";

const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(8, { message: "Minimal 8 karakter" }),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, { message: "Minimal 2 karakter" }),
  username: z.string().min(3, { message: "Minimal 3 karakter" }),
});

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const schema = mode === "login" ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema as any) });

  const onSubmit = handleSubmit(async (values: any) => {
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const { data: resp } = await api.post(endpoint, values);

      const token =
        resp?.token || resp?.data?.token || resp?.data?.accessToken;
      if (token) localStorage.setItem("token", token);

      if (mode === "register") {
        localStorage.setItem("onboarding:complete", "false");
        router.push("/onboarding");
      } else {
        try {
          const { data } = await api.get("/auth/me");
          if (data?.data) {
            const u = data.data;
            const norm = {
              id: u.id,
              email: u.email,
              name: u.fullName || u.username || "User",
              avatar: u.photo || u.avatar || null,
            };
            localStorage.setItem("user", JSON.stringify(norm));
          }
        } catch {}
        // langsung ke dashboard setelah login
        router.push("/dashboard");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Terjadi kesalahan";
      alert(msg);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-md">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Selamat datang kembali" : "Buat akun Anda"}
        </h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          {mode === "login"
            ? "Masuk untuk melanjutkan ke Digital Business Card"
            : "Daftar untuk mulai membuat kartu digital Anda"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="card-glass rounded-3xl p-6 md:p-7">
        {/* Email */}
        <label className="block text-sm font-medium text-black/70 dark:text-white/80">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          disabled={loading}
          aria-invalid={!!errors.email}
          className="input mt-1"
          placeholder="nama@email.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">
            {String(errors.email.message)}
          </p>
        )}

        {/* Full name + username (register only) */}
        {mode === "register" && (
          <>
            <div className="mt-4">
              <label className="block text-sm font-medium text-black/70 dark:text-white/80">
                Nama
              </label>
              <input
                type="text"
                disabled={loading}
                className="input mt-1"
                placeholder="Nama lengkap"
                {...register("fullName")}
              />
              {(errors as any).fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {String((errors as any).fullName.message)}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-black/70 dark:text-white/80">
                Username
              </label>
              <input
                type="text"
                disabled={loading}
                className="input mt-1"
                placeholder="username"
                {...register("username")}
              />
              {(errors as any).username && (
                <p className="mt-1 text-sm text-red-600">
                  {String((errors as any).username.message)}
                </p>
              )}
            </div>
          </>
        )}

        {/* Password */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-black/70 dark:text-white/80">
              Password
            </label>
            {mode === "login" && (
              <Link href="/auth/forgot" className="text-sm link-muted">
                Lupa password?
              </Link>
            )}
          </div>
          <div className="relative mt-1">
            <input
              type={show ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              disabled={loading}
              aria-invalid={!!errors.password}
              className="input pr-12"
              placeholder={mode === "login" ? "Password Anda" : "Minimal 8 karakter"}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-black/50 hover:text-black dark:text-white/60 dark:hover:text-white"
              aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            >
              {show ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.password.message)}
            </p>
          )}
        </div>

        {/* Submit */}
        <button disabled={loading} className="btn-primary mt-6 disabled:opacity-60">
          {loading ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
        </button>

        {/* Switch link */}
        <p className="mt-4 text-center text-sm text-black/60 dark:text-white/60">
          {mode === "login" ? (
            <>
              Belum punya akun? <Link href="/register" className="link-muted">Daftar</Link>
            </>
          ) : (
            <>
              Sudah punya akun? <Link href="/login" className="link-muted">Masuk</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
