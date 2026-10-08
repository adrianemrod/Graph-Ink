import type { Metadata } from "next";
import { requirePageUser } from "@/lib/auth";
import { getGcashBalance } from "@/lib/services/gcash";
import { getGcashSummary, listGcash } from "@/lib/services/reports";
import { resolveRange, todayRange } from "@/lib/time";
import { GcashView } from "./gcash-view";

export const metadata: Metadata = { title: "GCash" };

export default async function GcashPage() {
  const user = await requirePageUser();
  const isOwner = user.role === "OWNER";
  const today = todayRange();
  const [balance, todaySummary, monthSummary, recent] = await Promise.all([
    getGcashBalance(),
    getGcashSummary(today),
    isOwner ? getGcashSummary(resolveRange({ preset: "month" })) : null,
    listGcash(isOwner ? null : today, 25),
  ]);

  return (
    <GcashView
      isOwner={isOwner}
      stats={
        isOwner
          ? {
              balance: balance.balance,
              todayCashIn: todaySummary.cashIn,
              todayCashOut: todaySummary.cashOut,
              todayFees: todaySummary.serviceFees,
              monthFees: monthSummary!.serviceFees,
            }
          : null
      }
      recent={recent}
    />
  );
}
