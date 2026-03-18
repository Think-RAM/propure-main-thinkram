export interface PropertyData {
  title: string;
  location: string;
  price: number;
  priceRange: string;
  features: {
    beds: number;
    baths: number;
    parking: number;
    area: number;
  };
  strategyScore: number;
  images: { id: string; url: string; alt: string }[];
  badge?: string;
  strategyLabel?: string;
  market: {
    type: "seller" | "buyer" | "neutral";
    title: string;
    description: string;
  };
  financials: FinancialMetric[];
  cashflow: {
    "5y": CashflowPoint[];
    "10y": CashflowPoint[];
    "20y": CashflowPoint[];
  };
  risk: {
    score: number; // e.g. 43
    label: string; // "Low-Medium Risk"

    factors: {
      name: string;
      value: number; // 0–100
    }[];
  };
  scenarios: Scenario[];
  comparables: ComparableProperty[];
  aiInsights: {
    confidence: number; // 0–100

    confidenceFactors: string[];

    cashFlow: {
      level: "strong" | "moderate" | "weak";
      description: string;
    };

    consideration: {
      title: string;
      description: string;
    };

    growth: {
      title: string;
      description: string;
    };
  };
}

export interface ComparableProperty {
  id: string;

  address: string;
  suburb: string;

  price: number;
  date: string;

  beds: number;
  landSize: number;
  pricePerSqm: number;

  comparison: {
    type: "similar" | "higher" | "lower" | "smaller" | "larger";
    label?: string;
  };

  image?: string;
}

export interface Scenario {
  id: string;
  type: "optimistic" | "base" | "pessimistic";

  title: string;
  subtitle: string;

  metrics: {
    propertyValue: number;
    equity: number;
    roi: number; // % value (number, not string)
  };

  isRecommended?: boolean; // optional override
}

export interface FinancialMetric {
  id: string;
  label: string;
  value: string;

  // comparison context
  comparison?: {
    value: string; // "+0.3%" / "-2%"
    type: "positive" | "negative" | "neutral";
    label?: string; // "vs suburb avg"
  };

  // optional emphasis override
  highlight?: "positive" | "negative" | "warning" | "neutral";
}

export interface CashflowPoint {
  year: string;
  cashflow: number;
  equity?: number; // optional (for future dual-line support)
}

const aiInsights = {
  confidence: 92,
  confidenceFactors: [
    "Strong yield (5.8% vs 5.5% target)",
    "Low vacancy rate (1.2% suburb avg)",
    "Stable demographics (4.2% income growth)",
    "Infrastructure investment ($5.3B project)",
  ],
  cashFlow: {
    level: "strong" as const,
    description:
      "Rental yield exceeds your target, driven by strong demand in the suburb.",
  },
  consideration: {
    title: "Flood Zone Proximity",
    description:
      "Property is near a minor flood zone. Review insurance and council maps.",
  },
  growth: {
    title: "Metro Line Expansion",
    description:
      "Upcoming infrastructure expected to improve connectivity and property value.",
  },
};

const comparables: ComparableProperty[] = [
  {
    id: "1",
    address: "18 Harbour View Drive",
    suburb: "Penrith, NSW",
    price: 812000,
    date: "Dec 2024",
    beds: 4,
    landSize: 680,
    pricePerSqm: 1194,
    comparison: { type: "similar" },
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
  },
  {
    id: "2",
    address: "42 River Road",
    suburb: "Penrith, NSW",
    price: 765000,
    date: "Nov 2024",
    beds: 3,
    landSize: 590,
    pricePerSqm: 1297,
    comparison: { type: "smaller" },
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea",
  },
];

const scenarios: Scenario[] = [
  {
    id: "1",
    type: "optimistic",
    title: "Optimistic",
    subtitle: "Strong market growth",
    metrics: {
      propertyValue: 1082000,
      equity: 454000,
      roi: 189,
    },
  },
  {
    id: "2",
    type: "base",
    title: "Base Case",
    subtitle: "Most likely outcome",
    metrics: {
      propertyValue: 1036200,
      equity: 408200,
      roi: 160,
    },
  },
  {
    id: "3",
    type: "pessimistic",
    title: "Pessimistic",
    subtitle: "Weak market conditions",
    metrics: {
      propertyValue: 863500,
      equity: 235500,
      roi: 50,
    },
  },
];

const financials: FinancialMetric[] = [
  {
    id: "yield",
    label: "Gross Rental Yield",
    value: "5.8%",
    comparison: {
      value: "+0.3%",
      type: "positive",
      label: "vs suburb avg",
    },
  },
  {
    id: "rent",
    label: "Weekly Rent",
    value: "$875",
    comparison: {
      value: "+4.2%",
      type: "positive",
      label: "1yr growth",
    },
  },
  {
    id: "cashflow",
    label: "Annual Cash Flow",
    value: "+$4,280",
    highlight: "positive",
    comparison: {
      value: "Positive",
      type: "positive",
    },
  },
  {
    id: "growth",
    label: "5Y Capital Growth",
    value: "+32%",
    comparison: {
      value: "Strong",
      type: "positive",
    },
  },
];

const cashflowData: {
  "5y": CashflowPoint[];
  "10y": CashflowPoint[];
  "20y": CashflowPoint[];
} = {
  "5y": [
    { year: "Year 1", cashflow: 5000 },
    { year: "Year 2", cashflow: 8000 },
    { year: "Year 3", cashflow: 12000 },
    { year: "Year 4", cashflow: 18000 },
    { year: "Year 5", cashflow: 25000 },
  ],
  "10y": [
    { year: "Year 1", cashflow: 5000 },
    { year: "Year 5", cashflow: 25000 },
    { year: "Year 10", cashflow: 60000 },
  ],
  "20y": [
    { year: "Year 1", cashflow: 5000 },
    { year: "Year 10", cashflow: 60000 },
    { year: "Year 20", cashflow: 140000 },
  ],
};

const risk = {
  score: 43,
  label: "Low-Medium Risk",
  factors: [
    { name: "Vacancy Risk", value: 20 },
    { name: "Market Volatility", value: 40 },
    { name: "Interest Rate", value: 60 },
    { name: "Flood Risk", value: 50 },
    { name: "Bushfire Risk", value: 10 },
    { name: "Infrastructure", value: 85 },
    { name: "Demographics", value: 90 },
    { name: "Liquidity Risk", value: 35 },
  ],
};

export const mockData: PropertyData = {
  title: "24 Harbour View Drive",
  location: "Penrith, NSW 2750",
  price: 785000,
  priceRange: "770K - 800K",
  features: { beds: 4, baths: 2, parking: 2, area: 650 },
  strategyScore: 92,
  images: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      alt: "Modern house exterior with pool",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      alt: "Luxury villa exterior front view",
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c",
      alt: "Contemporary home architecture",
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
      alt: "Modern living room interior",
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1600210492493-0946911123ea",
      alt: "Minimalist kitchen design",
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1600566752227-8f3b9c8c2a8e",
      alt: "Bedroom with modern decor",
    },
    {
      id: "7",
      url: "https://images.unsplash.com/photo-1599423300746-b62533397364",
      alt: "Luxury bathroom interior",
    },
    {
      id: "8",
      url: "https://images.unsplash.com/photo-1600607687644-c7171b42498d",
      alt: "Dining area with natural lighting",
    },
    {
      id: "9",
      url: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e",
      alt: "Backyard patio with seating",
    },
    {
      id: "10",
      url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
      alt: "Modern staircase interior",
    },
    {
      id: "11",
      url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
      alt: "Home office setup",
    },
    {
      id: "12",
      url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea",
      alt: "Luxury villa backyard with pool",
    },
    {
      id: "13",
      url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
      alt: "Modern hallway design",
    },
    {
      id: "14",
      url: "https://images.unsplash.com/photo-1600585154207-0c8cfd9b3d8e",
      alt: "Spacious open living area",
    },
    {
      id: "15",
      url: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
      alt: "Luxury bedroom with large windows",
    },
    {
      id: "16",
      url: "https://images.unsplash.com/photo-1600585152915-d208bec867a1",
      alt: "Front yard landscaping",
    },
  ],
  badge: "Cash Flow Positive",
  strategyLabel: "Cash Flow",
  market: {
    type: "seller",
    title: "Seller's Market",
    description:
      "High demand, low supply — properties selling above median with low days on market",
  },
  financials,
  cashflow: cashflowData,
  risk,
  scenarios,
  comparables,
  aiInsights,
};
