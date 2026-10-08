import { ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex size-9 items-center justify-center rounded-xl bg-accent-600 text-white shadow-soft", className)}>
      <ShoppingBasket className="size-[18px]" strokeWidth={2.2} />
    </span>
  );
}
