import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { peso } from "@/lib/money";
import { formatReceiptNo } from "@/lib/services/sales";
import { formatDate, formatTime } from "@/lib/time";
import { ReceiptActions } from "./receipt-actions";

export const metadata: Metadata = { title: "Receipt" };

// Product sale receipts only. GCash Cash In / Cash Out records never print here.
export default async function ReceiptPage(props: PageProps<"/receipt/[id]">) {
  await requirePageUser();
  const { id } = await props.params;
  const sp = await props.searchParams;
  const [sale, settings] = await Promise.all([
    db.sale.findUnique({ where: { id }, include: { items: true, cashier: { select: { name: true } } } }),
    db.storeSettings.findUnique({ where: { id: 1 } }),
  ]);
  if (!sale) notFound();

  return (
    <div className="min-h-dvh bg-canvas py-8 print:bg-white print:py-0">
      <ReceiptActions autoPrint={sp.print === "1"} />
      <article className="mx-auto w-[300px] bg-white px-5 py-6 font-mono text-[12px] leading-[1.5] text-black shadow-lift print:w-[72mm] print:px-1 print:py-2 print:shadow-none">
        <header className="text-center">
          <p className="text-[14px] font-bold uppercase">{settings?.storeName ?? "KUYA JE SARISARI STORE"}</p>
          {settings?.storeAddress ? <p>{settings.storeAddress}</p> : null}
          {settings?.contactNumber ? <p>{settings.contactNumber}</p> : null}
        </header>
        <Divider />
        <div className="flex justify-between"><span>Date</span><span>{formatDate(sale.createdAt)}</span></div>
        <div className="flex justify-between"><span>Time</span><span>{formatTime(sale.createdAt)}</span></div>
        <div className="flex justify-between"><span>Receipt #</span><span>{formatReceiptNo(sale.receiptNo)}</span></div>
        <div className="flex justify-between"><span>Cashier</span><span>{sale.cashier.name}</span></div>
        <Divider />
        {sale.items.map((it) => (
          <div key={it.id} className="mb-1">
            <p>{it.productName}</p>
            <div className="flex justify-between pl-2">
              <span>{it.quantity} x {peso(it.unitPrice)}</span>
              <span>{peso(it.lineTotal)}</span>
            </div>
          </div>
        ))}
        <Divider />
        {Number(sale.discountAmount) > 0 ? (
          <>
            <div className="flex justify-between"><span>Subtotal</span><span>{peso(sale.subtotal)}</span></div>
            <div className="flex justify-between">
              <span>Discount{sale.discountType === "PERCENT" ? ` (${Number(sale.discountValue)}%)` : ""}</span>
              <span>-{peso(sale.discountAmount)}</span>
            </div>
          </>
        ) : null}
        <div className="flex justify-between text-[15px] font-bold"><span>TOTAL</span><span>{peso(sale.total)}</span></div>
        <Divider />
        <div className="flex justify-between"><span>Payment</span><span>{sale.paymentMethod === "GCASH" ? "GCash" : "Cash"}</span></div>
        {sale.paymentMethod === "CASH" ? (
          <>
            <div className="flex justify-between"><span>Amount Received</span><span>{peso(sale.amountReceived)}</span></div>
            <div className="flex justify-between font-bold"><span>Change</span><span>{peso(sale.change)}</span></div>
          </>
        ) : null}
        <Divider />
        <p className="text-center">{settings?.receiptFooter || "Thank you!"}</p>
      </article>
    </div>
  );
}

function Divider() {
  return <div className="my-2 border-t border-dashed border-black/60" />;
}
