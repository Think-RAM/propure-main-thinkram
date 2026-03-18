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

interface PropertyPageProps {
  params: Promise<{
    id: `${string}-${string | undefined}`;
  }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const [propertyId, chatId] = id.split("-");
  const { isAuthenticated } = await auth();
  const data = await getPropertyDetails(propertyId, chatId); // Fetch property details with caching

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
