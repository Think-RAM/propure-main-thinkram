import { Header } from "@/components/property/header";
import { HeroGallery } from "@/components/property/hero-gallery";
import { PropertyInfo } from "@/components/property/property-info";
import { FinancialGrid } from "@/components/property/financial-grid";
import { CashflowChart } from "@/components/property/cashflow-chart";
import { RiskAnalysis } from "@/components/property/risk-analysis";
import { ScenariosSection } from "@/components/property/scenarios-section";
import { ComparablesTable } from "@/components/property/comparables-table";
import { AIInsights } from "@/components/property/ai-insights";
import { mockData } from "@/lib/property";
import { auth } from "@clerk/nextjs/server";

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const [propertyId, chatId] = id.split("-");
  const { isAuthenticated } = await auth();


  return (
    <div className="min-h-screen bg-[#0f1419] text-zinc-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <HeroGallery images={mockData.images} />

        <PropertyInfo data={mockData} isAuth={isAuthenticated} />

        <FinancialGrid metrics={mockData.financials} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CashflowChart data={mockData.cashflow} />
          </div>
          <RiskAnalysis risk={mockData.risk} />
        </div>

        <ScenariosSection scenarios={mockData.scenarios} />

        <ComparablesTable data={mockData.comparables} />

        {isAuthenticated && <AIInsights data={mockData.aiInsights} />}
      </main>
    </div>
  );
}
