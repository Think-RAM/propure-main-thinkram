import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Market {
  type: "seller" | "buyer" | "neutral";
  title: string;
  description: string;
}

export function MarketContext({ market }: { market: Market }) {
  const config = {
    seller: {
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    buyer: {
      icon: TrendingDown,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
    },
    neutral: {
      icon: Minus,
      color: "text-zinc-400",
      bg: "bg-zinc-500/10 border-zinc-500/30",
    },
  };

  const Icon = config[market.type].icon;

  return (
    <div className={`rounded-lg border p-3 ${config[market.type].bg}`}>
      
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${config[market.type].color}`} />
        <span className={`text-sm font-medium ${config[market.type].color}`}>
          {market.title}
        </span>
      </div>

      <p className="text-xs text-zinc-400">
        {market.description}
      </p>
    </div>
  );
}