import { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locale = req.cookies.get("NEXT_LOCALE")?.value || "en";

  if (
    pathname.startsWith("/_next") ||
    pathname.includes("/api/") ||
    PUBLIC_FILE.test(pathname) ||
    pathname.includes("/unavailable")
  ) {
    return;
  }
}


