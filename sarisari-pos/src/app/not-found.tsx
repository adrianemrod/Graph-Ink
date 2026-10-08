import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-400">Not found</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">This page does not exist.</h1>
      <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-ink-900 px-5 text-sm font-semibold text-white">
        Go home
      </Link>
    </main>
  );
}
