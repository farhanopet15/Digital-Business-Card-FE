import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || ""; // kalau simpan token di cookie
  // kalau pakai localStorage, middleware tidak bisa cek — ini hanya contoh kalau nanti pindah token ke cookie.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/onboarding"],
};