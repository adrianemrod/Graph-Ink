import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export type CurrentUser = { id: string; name: string; username: string; role: "OWNER" | "CASHIER" };

/** The logged-in user, re-checked against the database on every request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.uid },
    select: { id: true, name: true, username: true, role: true, active: true },
  });
  if (!user || !user.active) return null;
  return { id: user.id, name: user.name, username: user.username, role: user.role };
});

/** For pages: send to login if signed out, or to the POS if the role is not allowed. */
export async function requirePageUser(role?: "OWNER"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role === "OWNER" && user.role !== "OWNER") redirect("/pos");
  return user;
}

export class AuthError extends Error {}

/** For server actions: throws instead of redirecting. */
export async function requireActionUser(role?: "OWNER"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Your session has ended. Please log in again.");
  if (role === "OWNER" && user.role !== "OWNER") throw new AuthError("Only the owner can do this.");
  return user;
}
