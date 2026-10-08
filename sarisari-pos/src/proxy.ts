import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Fast gate: signed-out visitors go to /login. Each page and action still checks the role itself.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    if (session) return NextResponse.redirect(new URL(session.role === "OWNER" ? "/dashboard" : "/pos", request.url));
    return NextResponse.next();
  }
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  if (pathname === "/") return NextResponse.redirect(new URL(session.role === "OWNER" ? "/dashboard" : "/pos", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
