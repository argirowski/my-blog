import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthSessionProvider } from "@/components/auth-session-provider";
import { NavigationLoader } from "@/components/navigation-loader";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth-options";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "My Blog",
    template: "%s · My Blog",
  },
  description: "Read, write, and connect.",
  openGraph: {
    siteName: "My Blog",
    type: "website",
    title: "My Blog",
    description: "Read, write, and connect.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Blog",
    description: "Read, write, and connect.",
    images: ["/opengraph-image"],
  },
};

/** Root layout calls `getServerSession` — dynamic app shell (topic: static vs dynamic). */
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthSessionProvider session={session}>
          <SiteHeader />
          <main className="flex flex-1 flex-col">
            <Suspense fallback={null}>
              <NavigationLoader>{children}</NavigationLoader>
            </Suspense>
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
