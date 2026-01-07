import "@/app/globals.css";
import { ChatProvider } from "@/context/ChatContext";
import { MapProvider } from "@/context/MapContext";
import { Metadata } from "next";

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
  return (
    <MapProvider>
      <ChatProvider>{children}</ChatProvider>
    </MapProvider>
  );
}
