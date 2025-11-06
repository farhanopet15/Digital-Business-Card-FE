"use client";

import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/app/components/ThemeToggle";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const showVideo = useMemo(
    () => ["/", "/login", "/register", "/onboarding"].includes(pathname ?? "/"),
    [pathname]
  );

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen relative overflow-y-auto no-scrollbar snap-y snap-mandatory transition-colors duration-300`}
      >
        {showVideo && (
          <>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="fixed inset-0 w-full h-full object-cover z-[-2]"
            >
              <source src="/background.mp4" type="video/mp4" />
            </video>
            <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-[-1]" />
          </>
        )}

        <div className="fixed top-5 right-5 z-50">
          <ThemeToggle />
        </div>

        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}