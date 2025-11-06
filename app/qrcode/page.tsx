"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";

type User = { id: string; name: string; email: string };
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function QRFullPage() {
  const [user, setUser] = useState<User | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) { try { setUser(JSON.parse(raw)); } catch {} }
  }, []);

  const profileUrl = useMemo(() => `${SITE_URL}/u/${user?.id ?? "me"}`, [user?.id]);

  const downloadPNG = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 1024;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      const a = document.createElement("a");
      a.download = "my-card-qr.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="min-h-dvh w-full grid place-items-center p-6 text-neutral-900 dark:text-white bg-[#FAFAFC] dark:bg-[#0A0A0C]">
      <div className="max-w-xl w-full rounded-3xl p-8 text-center
                      border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,.08)]
                      dark:bg-white/5 dark:border-white/10 dark:shadow-[0_10px_30px_rgba(0,0,0,.35)]">
        <h1 className="text-xl font-semibold">QR Code</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mt-1" suppressHydrationWarning>
          {profileUrl}
        </p>

        <div className="mt-6 grid place-items-center">
          {/* frame tipis mengikuti tema */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6
                          dark:bg-white/10 dark:border-white/10">
            {/* kanvas putih murni untuk QR (biar kontras) */}
            <div className="bg-white p-3 rounded-2xl">
              <QRCode
                value={profileUrl}
                size={320}
                bgColor="#FFFFFF"
                fgColor="#000000"
                ref={(node: unknown) => { svgRef.current = node as unknown as SVGSVGElement; }}
                style={{ height: "320px", width: "320px" }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm hover:bg-white
                       dark:bg-white/10 dark:border-white/10"
            onClick={() => window.print()}
          >
            Print
          </button>
          <button
            className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm hover:bg-white
                       dark:bg-white/10 dark:border-white/10"
            onClick={downloadPNG}
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}