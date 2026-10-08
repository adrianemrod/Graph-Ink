"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { changePassword, saveSettings } from "@/actions/settings";
import { PageContainer } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, PageHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError, Input, MoneyInput } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type Form = { storeName: string; storeAddress: string; contactNumber: string; startingGcashBalance: string; receiptFooter: string };
type U = { id: string; name: string; username: string; role: "OWNER" | "CASHIER" };

export function SettingsView({ initial, users }: { initial: Form; users: U[] }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [pwUser, setPwUser] = useState<U | null>(null);
  const toast = useToast();
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await saveSettings(form);
      if (!r.ok) return setError(r.error);
      toast({ title: "Settings saved" });
    });
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Settings" />
      <Card>
        <CardHeader title="Store" description="Shown on the dashboard and printed on receipts." />
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field label="Store Name">
            <Input value={form.storeName} onChange={set("storeName")} required />
          </Field>
          <Field label="Store Address">
            <Input value={form.storeAddress} onChange={set("storeAddress")} placeholder="Street, Barangay, City" />
          </Field>
          <Field label="Contact Number">
            <Input value={form.contactNumber} onChange={set("contactNumber")} placeholder="09XX XXX XXXX" inputMode="tel" />
          </Field>
          <Field label="Starting GCash Balance" hint="The GCash wallet balance when you started using this system.">
            <MoneyInput value={form.startingGcashBalance} onChange={set("startingGcashBalance")} />
          </Field>
          <Field label="Receipt Footer">
            <Input value={form.receiptFooter} onChange={set("receiptFooter")} placeholder="Thank you! Come again." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Currency">
              <Input value="₱ PHP" disabled />
            </Field>
            <Field label="Timezone">
              <Input value="Asia/Manila" disabled />
            </Field>
          </div>
          <FormError message={error} />
          <div className="flex justify-end">
            <Button type="submit" loading={pending}>
              Save Settings
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Accounts" description="Owner has full access. Cashier can use the POS, sales history and GCash." />
        <ul className="mt-3 divide-y divide-line">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div>
                <p className="text-sm font-semibold">{u.name}</p>
                <p className="text-xs text-slate-500">
                  {u.username} · {u.role === "OWNER" ? "Owner" : "Cashier"}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setPwUser(u)}>
                <KeyRound /> Change password
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <PasswordDialog key={pwUser?.id ?? "none"} user={pwUser} onClose={() => setPwUser(null)} />
    </PageContainer>
  );
}

function PasswordDialog({ user, onClose }: { user: U | null; onClose: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <Dialog
      open={user !== null}
      onClose={onClose}
      title="Change password"
      description={user ? `${user.name} (${user.username})` : undefined}
      size="sm"
      footer={
        <Button
          loading={pending}
          onClick={() =>
            start(async () => {
              const r = await changePassword({ userId: user!.id, password: pw });
              if (!r.ok) return setError(r.error);
              toast({ title: "Password changed" });
              onClose();
            })
          }
        >
          Save
        </Button>
      }
    >
      <Field label="New password" hint="At least 6 characters">
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus autoComplete="new-password" />
      </Field>
      <div className="mt-3">
        <FormError message={error} />
      </div>
    </Dialog>
  );
}
