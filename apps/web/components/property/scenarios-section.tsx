import { Scenario } from "@/lib/property";
import { ScenarioCard } from "./scenario-card";

interface Props {
  scenarios: Scenario[];
}

export function ScenariosSection({ scenarios }: Props) {
  if (!scenarios?.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">
        Investment Scenarios (5 Year)
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} scenarios={scenarios} />
        ))}
      </div>
    </div>
  );
}