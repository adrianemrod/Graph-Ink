"use client";

import Link from "next/link";
import { track, type AnalyticsEvent } from "@/lib/analytics";

export function TrackedLink({ href, event, params, className, children }: { href: string; event: AnalyticsEvent; params?: Record<string, string>; className?: string; children: React.ReactNode }) {
  const external = /^(https?:|mailto:|tel:|viber:)/.test(href);
  const onClick = () => track(event, { href, ...params });
  if (external) {
    return (
      <a href={href} className={className} onClick={onClick} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}
