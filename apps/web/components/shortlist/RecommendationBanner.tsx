import { Sparkles } from "lucide-react";
import { Progress } from "../ui/progress";

interface Props {
  recommendation: {
    title: string;
    description: string;
    confidence: number;
  };
}

export default function RecommendationBanner({ recommendation }: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-yellow-700/10 border border-yellow-500/20">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-yellow-500/20">
          <Sparkles />
        </div>

        <div>
          <h3 className="font-semibold text-yellow-300">
            AI Recommendation: {recommendation.title}
          </h3>
          <p className="text-sm text-neutral-400">
            {recommendation.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-400">Confidence</span>
        <Progress
          value={recommendation.confidence}
          className="
                w-32 h-2 rounded-full overflow-hidden
                bg-gray-800
                [&>div]:bg-yellow-400
            "
        />
        <span className="font-bold">{recommendation.confidence}%</span>
      </div>
    </div>
  );
}
