"use client";

import Link from "next/link";
import QRCode from "react-qr-code";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type User = { id: string; email: string; name: string; avatar?: string | null };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const NavItem = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
               hover:bg-black/5 text-black/70
               dark:text-white/75 dark:hover:bg-white/5"
  >
    <span className="h-2 w-2 rounded-full bg-black/40 dark:bg-white/40" />
    {label}
  </Link>
);

const Card = ({
  title,
  children,
  action,
  subtle = false,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  subtle?: boolean;
}) => (
  <div
    className={[
      "rounded-2xl p-5 backdrop-blur-xl",
      subtle
        ? "bg-white/70 border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_10px_30px_rgba(0,0,0,.35)]"
        : "card-glass",
    ].join(" ")}
  >
    <div className="flex items-center justify-between">
      <h3 className="font-medium">{title}</h3>
      {action}
    </div>
    <div className="mt-3 text-sm text-black/70 dark:text-white/70">{children}</div>
  </div>
);

function initials(name?: string) {
  return (name ?? "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

const BRAND = {
  instagram: { chip: "from-pink-500 to-violet-500", label: "IG" },
  linkedin: { chip: "from-sky-500 to-blue-600", label: "IN" },
  tiktok: { chip: "from-zinc-900 to-zinc-700", label: "TT" },
  x: { chip: "from-neutral-900 to-neutral-700", label: "X" },
  website: { chip: "from-emerald-500 to-teal-600", label: "WEB" },
} as const;

function withCacheBuster(url?: string | null, ver?: string | number | null) {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  const q = String(ver ?? "");
  if (!q) return url;
  const hasQuery = url.includes("?");
  return `${url}${hasQuery ? "&" : "?"}v=${encodeURIComponent(q)}`;
}

function resolveUrl(u?: string | null): string {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:") || u.startsWith("blob:")) return u;
  if (u.startsWith("//")) return (typeof window !== "undefined" ? window.location.protocol : "https:") + u;
  if (u.startsWith("/")) {
    const base =
      API_BASE ||
      (typeof window !== "undefined" ? window.location.origin : SITE_URL);
    return base.replace(/\/+$/, "") + u;
  }
  return u;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [bio, setBio] = useState<string>("");
  const [isOwner] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    // ⚠️ Hapus redirect ke onboarding
    // const done = localStorage.getItem("onboarding:complete") === "true";
    // if (!done) {
    //   router.replace("/onboarding");
    //   return;
    // }

    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const cached = JSON.parse(raw);
        const normFromCache: User = {
          id: cached.id,
          email: cached.email,
          name: cached.name || cached.fullName || "User",
          avatar: cached.avatar ?? cached.photo ?? null,
        };
        setUser(normFromCache);
      } catch {}
    }

    try { setAvatarPreview(localStorage.getItem("user:avatarPreview") || null); } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user:avatarPreview") {
        setAvatarPreview(e.newValue || null);
        setImgOk(true);
      }
    };
    window.addEventListener("storage", onStorage);

    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (data?.data) {
          const u = data.data;
          setUser((prev) => {
            const next: User = {
              id: u.id,
              email: u.email,
              name: u.fullName || u.username || prev?.name || "User",
              avatar: (u.photo || u.avatar) ?? prev?.avatar ?? null,
            };
            try {
              localStorage.setItem("user", JSON.stringify({
                ...(raw ? JSON.parse(raw) : {}),
                id: next.id,
                email: next.email,
                name: next.name,
                photo: next.avatar,
                avatar: next.avatar,
              }));
            } catch {}
            return next;
          });
        }

        const prof = await api.get("/profile");
        const personal = prof?.data?.data?.personal || null;
        if (personal?.bio) setBio(personal.bio || "");
        if (personal?.socialLinks) setSocials(personal.socialLinks || {});
        else {
          const socialsRes = await api.get("/profile/socials");
          if (socialsRes?.data?.data) setSocials(socialsRes.data.data);
        }

        const userData = prof?.data?.data || null;
        if (userData?.photo) {
          setUser((prev) => {
            const next: User = {
              id: prev?.id ?? userData.id,
              email: prev?.email ?? userData.email,
              name: prev?.name ?? userData.fullName ?? userData.username ?? "User",
              avatar: userData.photo,
            };
            try {
              localStorage.setItem("user", JSON.stringify({
                ...(raw ? JSON.parse(raw) : {}),
                id: next.id,
                email: next.email,
                name: next.name,
                photo: next.avatar,
                avatar: next.avatar,
              }));
            } catch {}
            return next;
          });
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        console.warn("Sync user/profile failed:", err);
      }
    })();

    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("storage", onStorage);
      obs.disconnect();
    };
  }, [router]);

  const profileUrl = useMemo(() => `${SITE_URL}/u/${user?.id ?? "me"}`, [user?.id]);
  const avatarVer = useMemo(() => {
    try { return localStorage.getItem("user:avatarVersion") || ""; } catch { return ""; }
  }, [user?.avatar, avatarPreview]);

  const serverUrl = withCacheBuster(resolveUrl(user?.avatar ?? null), avatarVer);
  const avatarSrc = avatarPreview || serverUrl;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("onboarding:complete");
    window.location.href = "/login";
  };

  return (
    <div className="relative w-full min-h-[100svh] overflow-hidden text-neutral-900 dark:text-white transition-colors duration-300 bg-[#FAFAFC] dark:bg-[#0A0A0C]">
      <div className="relative z-10 container max-w-7xl mx-auto py-8">
        <div className="mb-6 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_10px_30px_rgba(0,0,0,.35)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">
                Selamat Datang, {user?.name?.split(" ")?.[0] ?? "Friend"}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl px-4 py-2 text-sm font-medium border border-black/10 bg-white/70 hover:bg-white transition dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <div className="sticky top-6 rounded-2xl p-4 backdrop-blur-xl bg-white/70 border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_10px_30px_rgba(0,0,0,.35)]">
              <div className="flex items-center gap-3">
                {avatarSrc && imgOk ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={avatarPreview ? `preview-${avatarPreview.length}` : `ver-${avatarVer}`}
                    src={avatarSrc}
                    alt={user?.name || "User"}
                    className="h-11 w-11 rounded-2xl object-cover shadow"
                    onError={() => {
                      // Jika preview rusak → hapus & coba server. Jika server juga rusak → fallback ke inisial.
                      if (avatarPreview) {
                        try { localStorage.removeItem("user:avatarPreview"); } catch {}
                        setAvatarPreview(null);
                        setImgOk(true);
                      } else {
                        setImgOk(false);
                      }
                    }}
                  />
                ) : (
                  <div className="h-11 w-11 rounded-2xl bg-black text-white grid place-items-center text-sm font-semibold dark:bg-white dark:text-black shadow">
                    {initials(user?.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{user?.name ?? "Guest"}</p>
                  <p className="text-xs text-black/60 dark:text-white/60">Digital Card</p>
                </div>
              </div>

              <nav className="mt-4 space-y-1">
                <NavItem href="/settings" label="Setting Profile" />
                <NavItem href="/contacts" label="Contacts" />
                <NavItem href="/qrcode" label="QR Code" />
                <NavItem href="/portfolio" label="Portofolio" />
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* My Links */}
              <Card title="My Links" action={<Link href="/links" className="text-sm link-muted">View All</Link>}>
                {Object.entries(socials).length === 0 ? (
                  <p className="mt-3 text-sm text-black/60 dark:text-white/60">Belum ada link sosial.</p>
                ) : (
                  <ul className="mt-3 overflow-hidden rounded-xl border border-white/60 bg-white/70 dark:bg-white/10 dark:border-white/10">
                    {Object.entries(socials).map(([key, href]) => {
                      if (!href) return null;
                      const brand = BRAND[key as keyof typeof BRAND] || { chip: "from-neutral-600 to-neutral-800", label: "LN" };
                      return (
                        <li key={key} className="border-t border-white/60 first:border-t-0 dark:border-white/10">
                          <a
                            href={href}
                            target="_blank"
                            className="flex items-center justify-between gap-4 p-4 transition hover:bg-white dark:hover:bg-white/5"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`h-10 w-10 shrink-0 rounded-xl grid place-items-center text-xs font-semibold text-white bg-gradient-to-br ${brand.chip}`}
                              >
                                {brand.label}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium capitalize">{key}</p>
                                <p className="text-xs text-black/60 dark:text-white/60 truncate">{href}</p>
                              </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 opacity-60">
                              <path d="M7 17L17 7M7 7h10v10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              {/* QR Code */}
              <Card title="QR Code" subtle>
                <div className="grid place-items-center py-2">
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 dark:bg-white/10 dark:border-white/10">
                    <QRCode
                      value={profileUrl}
                      size={176}
                      bgColor="transparent"
                      fgColor={isDark ? "#ffffff" : "#000000"}
                      style={{ height: "176px", width: "176px" }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-black/60 dark:text-white/60 break-all text-center" suppressHydrationWarning>
                    {profileUrl}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="inline-flex items-center rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 text-xs hover:bg-white dark:bg-white/10 dark:border-white/10 dark:text-white"
                      onClick={() => navigator.clipboard.writeText(profileUrl)}
                    >
                      Copy Link
                    </button>
                    <Link
                      href="/qrcode"
                      className="inline-flex items-center rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 text-xs hover:bg-white dark:bg-white/10 dark:border-white/10 dark:text-white"
                    >
                      Fullscreen
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Bio */}
              <Card title="Bio" subtle>
                {bio ? (
                  <p className="whitespace-pre-wrap">{bio}</p>
                ) : (
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Belum ada bio. Tambahkan lewat halaman <Link className="underline" href="/settings">Setting Profile</Link>.
                  </p>
                )}
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
