import { Badge } from "@/components/ui/card";
import type { StockStatus } from "@/lib/services/reports";

export function StockBadge({ status }: { status: StockStatus }) {
  if (status === "OUT_OF_STOCK") return <Badge tone="red">Out of stock</Badge>;
  if (status === "LOW_STOCK") return <Badge tone="amber">Low stock</Badge>;
  return <Badge tone="green">In stock</Badge>;
}
