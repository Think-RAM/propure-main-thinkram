"use cache";
import { Header } from "@/components/property/header";
import { HeroGallery } from "@/components/property/hero-gallery";
import { PropertyInfo } from "@/components/property/property-info";
import { FinancialGrid } from "@/components/property/financial-grid";
import { CashflowChart } from "@/components/property/cashflow-chart";
import { RiskAnalysis } from "@/components/property/risk-analysis";
import { ScenariosSection } from "@/components/property/scenarios-section";
import { ComparablesTable } from "@/components/property/comparables-table";
import { AIInsights } from "@/components/property/ai-insights";
import { getPropertyDetails } from "@/lib/property";
import { auth } from "@clerk/nextjs/server";
import { toast } from "sonner";
import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";
import { Metadata } from "next";

interface PropertyPageProps {
  params: Promise<{
    id: `${string}-${string | undefined}`;
  }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const propertyId = id.split("-")[0];
  const data = await getPropertyDetails(propertyId, undefined); // Fetch property details without caching for metadata

  return {
    title: `${data.title} - ${data.location} | Propure`,
    description: `Explore detailed information, financial metrics, and AI insights for ${data.title} located in ${data.location}.`,
    applicationName: "Propure",
    keywords: [
      "real estate",
      "property investment",
      "financial analysis",
      "cash flow",
      "rental yield",
      "property growth",
      data.location,
      data.title,
    ],
    openGraph: {
      title: `${data.title} - ${data.location} | Propure`,
      description: `Explore detailed information, financial metrics, and AI insights for ${data.title} located in ${data.location}.`,
      images:
        data.images.length > 0
          ? {
              url: data.images[0].url,
              alt: data.images[0].alt || data.title,
              width: 1200,
              height: 630,
            }
          : undefined,
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const { isAuthenticated } = await auth();
  const [propertyId, chatId] = id.split("-");
  const data = await getPropertyDetails(
    propertyId,
    chatId === "undefined" ? undefined : chatId,
  ); // Fetch property details with caching

  const handleShortlist = async () => {
    if (!isAuthenticated && chatId !== "undefined") {
      toast.error("Please log in to add properties to your shortlist.");
      return;
    }
    await client.mutation(api.functions.chat.saveShortlistedProperties, {
      chatSessionId: chatId,
      shortlistedPropertyIds: [propertyId], // send full latest state
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-zinc-100">
      <Header isAuthenticated={isAuthenticated} onShortlist={handleShortlist} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <HeroGallery images={data.images} />

        <PropertyInfo data={data} isAuth={isAuthenticated} />

        <FinancialGrid metrics={data.financials} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CashflowChart data={data.cashflow} />
          </div>
          <RiskAnalysis risk={data.risk} />
        </div>

        <ScenariosSection scenarios={data.scenarios} />

        <ComparablesTable data={data.comparables} />

        {isAuthenticated && <AIInsights data={data.aiInsights!} />}
      </main>
    </div>
  );
}
