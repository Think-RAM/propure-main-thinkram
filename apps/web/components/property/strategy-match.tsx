import { Progress } from "../ui/progress";

interface Props {
  score: number;
  label?: string;
}

export function StrategyMatch({ score, label }: Props) {
  return (
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-zinc-300">
          Strategy Match
        </span>

        <span className="text-lg font-semibold text-emerald-400">{score}%</span>
      </div>

      {/* Progress */}
      <Progress
        value={score}
        className="h-2 bg-zinc-700 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-400"
      />
      {/* Description */}
      {label && (
        <p className="text-xs text-zinc-400 mt-2">
          This property aligns well with your{" "}
          <span className="text-white font-medium">{label}</span> strategy
        </p>
      )}
    </div>
  );
}
