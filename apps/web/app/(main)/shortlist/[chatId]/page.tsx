import Header from "@/components/shortlist/Header";
import RecommendationBanner from "@/components/shortlist/RecommendationBanner";
import ComparisonTable from "@/components/shortlist/ComparisonTable";
import AIInsights from "@/components/shortlist/AIInsights";
import SummarySection from "@/components/shortlist/SummarySection";
import NextSteps from "@/components/shortlist/NextSteps";
import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  yield: number;
  rent: number;
  cashFlow: number;
  growth: number;
  risk: string;
  daysOnMarket: number;
  score: number;
  tag?: "recommended" | "runner-up";
}

interface ShortlistPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function Page({ params }: ShortlistPageProps) {
  const { chatId } = await params;
  const { property, recommendedProperty, summary, aiInsights } = await client.query(api.functions.shortListReports.getShortListReport, { chatId });

  return (
    <div className="min-h-screen bg-[#0f1419] text-[#f7f9fc]">
      <Header count={property.length} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <RecommendationBanner recommendation={recommendedProperty} />

        <ComparisonTable properties={property} />

        <AIInsights strategy={aiInsights.strategy} recommendationSummaryMD={aiInsights.recommendationSummaryMD} />

        <SummarySection
          purchasePrice={summary.purchasePrice}
          cashFlow={summary.cashFlow}
          growth={summary.growth}
        />

        <NextSteps />
      </main>
    </div>
  );
}
