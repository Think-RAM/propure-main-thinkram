// import type React from "react";
// import type { Metadata } from "next";
// import { Inter, Poppins, Lato } from "next/font/google";
// import "./globals.css";
// import "leaflet/dist/leaflet.css";
// import { ThemeProvider } from "@/components/theme-provider";
// import { ClerkProvider } from "@clerk/nextjs";
// import { Toaster } from "sonner";

// const inter = Inter({ subsets: ["latin"] });

// const poppins = Poppins({
//   weight: ["400", "500", "600", "700"],
//   subsets: ["latin"],
//   variable: "--font-poppins",
//   display: "swap",
// });

// const lato = Lato({
//   weight: ["300", "400", "700"],
//   subsets: ["latin"],
//   variable: "--font-lato",
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: "Propure - Pure Insights, Smart Investments",
//   description:
//     "AI-Powered Property Investment Insights for Smarter Australian Investors",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

//   const appShell = (content: React.ReactNode) => (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <link rel="preconnect" href="https://basemaps.cartocdn.com" />
//       </head>
//       <body
//         className={`${poppins.variable} ${lato.variable} ${inter.className}`}
//       >
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="light"
//           enableSystem
//           disableTransitionOnChange
//           storageKey="propure-theme"
//         >
//           {content}
//           <Toaster richColors />
//         </ThemeProvider>
//       </body>
//     </html>
//   );

//   if (!clerkPublishableKey) {
//     // eslint-disable-next-line no-console
//     console.warn(
//       "[propure/web] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing; rendering without ClerkProvider."
//     );
//     return appShell(
//       <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-md space-y-3">
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Missing Clerk configuration
//           </h1>
//           <p className="text-gray-600">
//             Add{" "}
//             <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
//             (and <code className="font-mono">CLERK_SECRET_KEY</code>) to your
//             env to enable authentication and run/build the app.
//           </p>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <ClerkProvider publishableKey={clerkPublishableKey}>
//       {appShell(children)}
//     </ClerkProvider>
//   );
// }

import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono , Libre_Baskerville } from 'next/font/google'
import './globals.css'
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import ConvexClientProvider from "@/context/ConvexClientProvider";
import type React from "react";

 const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
  weight: ["400", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Propure — AI-driven property investment insights',
  description: 'Propure uses multi-agent AI to offer conversational discovery and analysis of property investment strategies.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const appShell = (content: React.ReactNode) => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://basemaps.cartocdn.com" />
      </head>
      <body
        className={`${libreBaskerville.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
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
  )
}

