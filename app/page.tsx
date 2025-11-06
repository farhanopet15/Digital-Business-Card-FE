"use client";
import Link from "next/link";

export default function LandingPage() {
  const features = [
    "Manajemen Sosial",
    "QR & Link",
    "Kustomisasi",
    "Analitik Dasar",
    "Tautan Sosial",
    "Export vCard",
  ];

  const scrollToFeatures = () => {
    const section = document.getElementById("fitur");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full text-neutral-900 dark:text-white">
      {/* Hero */}
      <section className="snap-start container max-w-6xl mx-auto py-20 md:py-28 min-h-[100svh] flex items-center">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* === CARD TEKS HERO === */}
          <div className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/30 dark:bg-neutral-900/55 border border-black/10 dark:border-white/15 shadow-xl">
            <span className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-sm text-black/70 dark:text-white/80">
              Digital Business Card
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
              Kenalkan diri Anda secara{" "}
              <span className="text-red-500 dark:text-red-400">elegan</span> dan instan.
            </h1>
            <p className="mt-4 text-neutral-800 dark:text-white/70 max-w-prose drop-shadow-sm">
              Buat kartu bisnis digital yang bisa dibagikan via QR atau link.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/register"
                className="rounded-xl px-6 py-3 font-medium bg-black text-white hover:bg-neutral-800 transition dark:bg-white dark:text-black"
              >
                Mulai Gratis
              </Link>
              <button
                onClick={scrollToFeatures}
                className="rounded-xl border px-5 py-3 border-black/10 bg-white/70 hover:bg-white transition dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20"
              >
                Lihat Fitur
              </button>
            </div>
          </div>

          {/* Preview card kanan */}
          <div className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg">
            <div className="aspect-[4/3] w-full grid place-items-center rounded-2xl border border-white/20 bg-white/20">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-black text-white grid place-items-center">
                  VC
                </div>
                <p className="mt-4 text-sm opacity-70">Pratinjau kartu Anda</p>
                <p className="text-lg font-medium">Nama Anda</p>
                <p className="opacity-70">Jabatan • Perusahaan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="fitur"
        className="snap-start container max-w-6xl mx-auto py-24 min-h-[100svh] flex flex-col justify-center"
      >
        <h2 className="text-3xl font-semibold mb-8">Semua yang Anda butuhkan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border backdrop-blur-md border-black/10 bg-white/60 hover:bg-white transition dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20"
            >
              <div className="h-10 w-10 rounded-xl bg-black text-white grid place-items-center dark:bg-white dark:text-black">
                {i + 1}
              </div>
              <h3 className="mt-4 font-medium">{t}</h3>
              <p className="text-sm opacity-70 mt-1">
                Deskripsi singkat fitur {t.toLowerCase()}.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
