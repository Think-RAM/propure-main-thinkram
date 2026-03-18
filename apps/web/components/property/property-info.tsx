"use client";

import { MapPin } from "lucide-react";
import { StrategyMatch } from "./strategy-match";
import { MarketContext } from "./market-context";
import { PropertyFeatures } from "./property-features";
import { PropertyData } from "@/lib/property";


interface Props {
  data: PropertyData;
  isAuth: boolean;
}

export function PropertyInfo({ data, isAuth }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col lg:flex-row justify-between gap-6">
      
      {/* LEFT */}
      <div className="flex-1 space-y-4">
        
        {/* Title + Location */}
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white">
            {data.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
            <MapPin className="h-4 w-4" />
            {data.location}
          </div>
        </div>

        {/* Strategy Match */}
        {isAuth && (
          <StrategyMatch
            score={data.strategyScore}
            label={data.strategyLabel}
          />
        )}

        {/* Market Context */}
        {data.market && <MarketContext market={data.market} />}

        {/* Features */}
        <PropertyFeatures features={data.features} />
      </div>

      {/* RIGHT (Price) */}
      <div className="lg:text-right">
        <p className="text-sm text-zinc-500">Asking Price</p>

        <p className="text-2xl lg:text-3xl font-bold text-emerald-400">
          ${data.price.toLocaleString()}
        </p>

        <p className="text-sm text-zinc-500">
          Guide: {data.priceRange}
        </p>
      </div>
    </div>
  );
}