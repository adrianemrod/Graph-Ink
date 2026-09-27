"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="flex min-h-svh items-center pb-20 pt-32">
      <div className="container-gi max-w-3xl">
        <p className="spec text-smoke">Something went wrong</p>
        <h1 className="mt-6 text-[clamp(2.4rem,1rem+4vw,4.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.04em]">We hit a problem loading this page.</h1>
        <p className="mt-6 text-lg text-smoke">Please try again. If it keeps happening, you can still reach us through the contact page.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={() => reset()} arrow>Try again</Button>
          <ButtonLink href="/" variant="secondary">Back to home</ButtonLink>
        </div>
        {error.digest && <p className="spec mt-8 text-mute">Ref {error.digest}</p>}
      </div>
    </section>
  );
}
