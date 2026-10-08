"use server";

import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_DAYS, signSession } from "@/lib/session";

export async function login(_prev: { error?: string } | undefined, formData: FormData): Promise<{ error?: string }> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Enter your username and password." };

  const user = await db.user.findUnique({ where: { username } });
  const valid = user && user.active ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) return { error: "Wrong username or password." };

  const token = await signSession({ uid: user.id, role: user.role });
  // Secure cookie on HTTPS. Plain HTTP is allowed so a tablet can use the store PC over the local network.
  const h = await headers();
  const isHttps = h.get("x-forwarded-proto") === "https" || (h.get("origin") ?? "").startsWith("https://");
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect(user.role === "OWNER" ? "/dashboard" : "/pos");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
