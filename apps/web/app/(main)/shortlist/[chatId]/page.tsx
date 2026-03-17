import Header from "@/components/shortlist/Header";
import RecommendationBanner from "@/components/shortlist/RecommendationBanner";
import ComparisonTable from "@/components/shortlist/ComparisonTable";
import AIInsights from "@/components/shortlist/AIInsights";
import SummarySection from "@/components/shortlist/SummarySection";
import NextSteps from "@/components/shortlist/NextSteps";

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

const properties: Property[] = [
  {
    id: "1",
    title: "24 Harbour View Drive",
    location: "Penrith",
    price: 785000,
    yield: 5.8,
    rent: 875,
    cashFlow: 4280,
    growth: 32,
    risk: "Low-Med",
    daysOnMarket: 21,
    score: 5,
    tag: "recommended",
  },
  {
    id: "2",
    title: "15 Maple Street",
    location: "Blacktown",
    price: 695000,
    yield: 5.6,
    rent: 750,
    cashFlow: 2840,
    growth: 28,
    risk: "Low",
    daysOnMarket: 35,
    score: 4,
    tag: "runner-up",
  },
  {
    id: "3",
    title: "8 Ocean Parade",
    location: "Wollongong",
    price: 925000,
    yield: 4.8,
    rent: 850,
    cashFlow: -1200,
    growth: 38,
    risk: "Medium",
    daysOnMarket: 14,
    score: 3,
  },
];

const recommendation = {
  title: "24 Harbour View Drive",
  description: "Best match for your cash flow strategy",
  confidence: 92,
};

const summary = {
  purchasePrice: {
    value: 785000,
    description: "Competitive price based on market analysis",
  },
  cashFlow: {
    value: 4280,
    description: "Positive cash flow of $4,280 in the first year",
  },
  growth: {
    value: 32,
    description: "Projected 32% equity growth over 5 years",
  },
};

const aiRecommendation = {
  recommendationSummaryMD: "Based on your preference for strong cash flow and growth potential, our AI analysis highlights 24 Harbour View Drive as the top recommendation. This property offers a compelling balance of a competitive purchase price, robust rental income, and significant projected equity growth. With a confidence score of 92%, it stands out as the best match for your investment goals.",
  strategy: "Harbour View offers the best balance of yield and growth while maintaining positive cash flow."
};

interface ShortlistPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function Page({ params }: ShortlistPageProps) {
  const { chatId } = await params;

  return (
    <div className="min-h-screen bg-[#0f1419] text-[#f7f9fc]">
      <Header count={properties.length} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <RecommendationBanner recommendation={recommendation} />

        <ComparisonTable properties={properties} />

        <AIInsights strategy={aiRecommendation.strategy} recommendationSummaryMD={aiRecommendation.recommendationSummaryMD} />

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
