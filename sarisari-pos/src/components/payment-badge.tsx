import { Badge } from "@/components/ui/card";

export function PaymentBadge({ method }: { method: "CASH" | "GCASH" }) {
  return method === "GCASH" ? <Badge tone="blue">GCash</Badge> : <Badge tone="slate">Cash</Badge>;
}
