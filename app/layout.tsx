import type { Metadata } from "next";
import { headers } from "next/headers";

import { defaultLocale, LOCALE_HEADER } from "@/lib/i18n/config";

import "./globals.css";

export const metadata: Metadata = {
  title: "dannysir-labs",
  description: "Interactive demos for @dannysir libraries",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const lang = headerList.get(LOCALE_HEADER) ?? defaultLocale;
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
