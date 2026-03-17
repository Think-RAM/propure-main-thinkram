import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  purchasePrice: {
    value: number;
    description: string;
  };
  cashFlow: {
    value: number;
    description: string;
  };
  growth: {
    value: number;
    description: string;
  };
}

export default function SummarySection({
  purchasePrice,
  cashFlow,
  growth,
}: Props) {
  return (
    <section className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <BarChart3 className="text-teal-400" size={20} />
        <h2 className="text-lg font-semibold">Recommended Portfolio Summary</h2>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Purchase Price */}
        <Card className="bg-neutral-900 border-neutral-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-neutral-400 uppercase tracking-wide">
              Purchase Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-white">
              ${purchasePrice.value.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              {purchasePrice.description}
            </p>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card className="bg-neutral-900 border-neutral-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-neutral-400 uppercase tracking-wide">
              Year 1 Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-semibold",
                cashFlow.value > 0 ? "text-green-400" : "text-red-400",
              )}
            >
              {cashFlow.value > 0 ? "+" : ""}${cashFlow.value.toLocaleString()}
            </p>

            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              {cashFlow.description}
            </p>
          </CardContent>
        </Card>

        {/* Growth */}
        <Card className="bg-neutral-900 border-neutral-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-neutral-400 uppercase tracking-wide">
              5-Year Equity Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-white">
              ${growth.value.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              {growth.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
