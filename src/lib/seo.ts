import type { Metadata } from "next";
import { formattedAddress, siteConfig } from "@/config/site";

export function pageMetadata({ title, description, path, ogTitle }: { title?: string; description?: string; path: string; ogTitle?: string }): Metadata {
  const desc = description ?? siteConfig.description;
  return {
    title: title ?? { absolute: siteConfig.seo.defaultTitle },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: siteConfig.brandName,
      locale: siteConfig.locale,
      title: ogTitle ?? title ?? siteConfig.seo.defaultTitle,
      description: desc,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? title ?? siteConfig.seo.defaultTitle,
      description: desc,
      ...(siteConfig.seo.twitterHandle ? { site: siteConfig.seo.twitterHandle } : {}),
    },
  };
}

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path === "/" ? "" : path}`;
}

/** Organization schema — only fields that are actually known are included. */
export function organizationJsonLd(logoSrc?: string) {
  const { contact, social } = siteConfig;
  const sameAs = Object.values(social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.brandName,
    url: siteConfig.url,
    description: siteConfig.description,
    areaServed: { "@type": "Country", name: siteConfig.country },
    ...(logoSrc ? { logo: absoluteUrl(logoSrc) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.phone ? { telephone: contact.phone } : {}),
  };
}

/** LocalBusiness schema — emitted ONLY when a real address and phone exist. */
export function localBusinessJsonLd(logoSrc?: string) {
  const { contact } = siteConfig;
  if (!formattedAddress() || !contact.phone) return null;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.brandName,
    url: siteConfig.url,
    telephone: contact.phone,
    ...(contact.email ? { email: contact.email } : {}),
    ...(logoSrc ? { image: absoluteUrl(logoSrc) } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.street,
      addressLocality: contact.address.city,
      addressRegion: contact.address.region,
      postalCode: contact.address.postalCode,
      addressCountry: contact.address.country,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}
