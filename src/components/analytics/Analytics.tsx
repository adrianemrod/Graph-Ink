import Script from "next/script";
import { siteConfig } from "@/config/site";

/** GA4 + Meta Pixel. Each initialises only when its env ID is present. */
export function Analytics() {
  const { gaId, metaPixelId } = siteConfig.analytics;
  const safe = (v: string) => /^[A-Za-z0-9-]+$/.test(v);
  return (
    <>
      {gaId && safe(gaId) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
      {metaPixelId && safe(metaPixelId) && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}

/** Fires a page-level analytics event once on mount (e.g. service_viewed). */
export { PageEvent } from "./PageEvent";
