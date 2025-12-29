import type { Metadata } from "next";
import "@/app/globals.css";
import { MapProvider } from "@/context/MapContext";

export const metadata: Metadata = {
  title: "Dashboard - Propure",
  description: "Pure Insights, Smart Investments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MapProvider>{children}</MapProvider>;
}
