import type React from "react";
import type { Metadata } from "next";
import { Inter, Poppins, Lato } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import ConvexClientProvider from "@/context/ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Propure - Pure Insights, Smart Investments",
  description:
    "AI-Powered Property Investment Insights for Smarter Australian Investors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const appShell = (content: React.ReactNode) => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://basemaps.cartocdn.com" />
      </head>
      <body
        className={`${poppins.variable} ${lato.variable} ${inter.className}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="propure-theme"
        >
          {content}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );

  if (!clerkPublishableKey) {
    // eslint-disable-next-line no-console
    console.warn(
      "[propure/web] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing; rendering without ClerkProvider.",
    );
    return appShell(
      <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-md space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            Missing Clerk configuration
          </h1>
          <p className="text-gray-600">
            Add{" "}
            <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
            (and <code className="font-mono">CLERK_SECRET_KEY</code>) to your
            env to enable authentication and run/build the app.
          </p>
        </div>
      </main>,
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexClientProvider>{appShell(children)}</ConvexClientProvider>
    </ClerkProvider>
  );
}
