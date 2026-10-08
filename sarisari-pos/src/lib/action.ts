import "server-only";
import { AuthError } from "@/lib/auth";
import { UserError } from "@/lib/services/errors";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

/** Run an action body and turn known errors into friendly messages. */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err instanceof UserError || err instanceof AuthError) return { ok: false, error: err.message };
    console.error("[action error]", err);
    return { ok: false, error: "Something went wrong. Nothing was saved. Please try again." };
  }
}
