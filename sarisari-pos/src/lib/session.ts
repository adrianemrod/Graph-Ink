import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "kj_session";
export const SESSION_DAYS = 7;

export type SessionPayload = { uid: string; role: "OWNER" | "CASHIER" };

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET is missing or too short (min 16 characters).");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.uid !== "string" || (payload.role !== "OWNER" && payload.role !== "CASHIER")) return null;
    return { uid: payload.uid, role: payload.role };
  } catch {
    return null;
  }
}
