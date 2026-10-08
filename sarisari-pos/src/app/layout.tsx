import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kuya Je Sari-Sari Store", template: "%s · Kuya Je Store" },
  description: "Point of sale and store management for KUYA JE SARISARI STORE.",
};

export const viewport: Viewport = {
  themeColor: "#111a2b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH">
      <body className="min-h-dvh font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
