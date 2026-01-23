"use client";

import { CheckCircle, Loader2, XCircle } from "lucide-react";

interface ToolResultProps {
  part: {
    type: string;
    [key: string]: any;
  };
}

/**
 * ToolResult component renders tool execution states and outputs for AI agents.
 * Handles different states: pending, partial-call, call, output-available, output-error.
 */
export function ToolResult({ part }: ToolResultProps) {
  // Only render if this is a tool-related part
  if (!part.type.startsWith("tool-")) {
    return null;
  }

  // Extract tool name by removing 'tool-' prefix
  const toolName = part.type.replace(/^tool-/, "");

  // Cast to access state property (AI SDK internal structure)
  const state = (part as any).state as string | undefined;

  if (!state) {
    return null;
  }

  // Render based on state
  switch (state) {
    case "pending":
    case "partial-call":
    case "call":
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#242b33]/60 border border-white/10 text-sm text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Running {toolName}...</span>
        </div>
      );

    case "output-available":
      return <ToolOutput toolName={toolName} part={part} />;

    case "output-error":
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-200">
          <XCircle className="h-4 w-4" />
          <span>{toolName} failed</span>
        </div>
      );

    default:
      return null;
  }
}

interface ToolOutputProps {
  toolName: string;
  part: {
    type: string;
    [key: string]: any;
  };
}

/**
 * ToolOutput component renders tool-specific UI based on the agent type.
 * Each agent (strategist, researcher, analyst) has a custom output component.
 */
function ToolOutput({ toolName, part }: ToolOutputProps) {
  // Extract output data from part
  const data = (part as any).output;

  if (!data) {
    return null;
  }

  switch (toolName) {
    case "strategist":
      return <StrategyOutput data={data} />;

    case "researcher":
      return <ResearchOutput data={data} />;

    case "analyst":
      return <AnalystOutput data={data} />;

    default:
      return <GenericOutput data={data} />;
  }
}

/**
 * StrategyOutput displays strategy discovery results from the Strategist agent.
 */
function StrategyOutput({ data }: { data: any }) {
  const summary = data?.strategyDiscovery?.summary;

  if (!summary) {
    return <GenericOutput data={data} />;
  }

  return (
    <div className="rounded-lg bg-[#242b33]/85 border border-white/10 p-4 space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-[#55d6be]" />
        <h4 className="text-sm font-semibold text-white">Strategy Discovery</h4>
      </div>
      <p className="text-sm text-white/80 leading-relaxed">{summary}</p>

      {data.strategyDiscovery?.keyInsights?.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-white/60 uppercase tracking-wide">
            Key Insights
          </h5>
          <ul className="space-y-1">
            {data.strategyDiscovery.keyInsights.map(
              (insight: string, i: number) => (
                <li
                  key={i}
                  className="text-sm text-white/70 flex items-start gap-2"
                >
                  <span className="text-[#55d6be] mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * ResearchOutput displays property search results from the Researcher agent.
 */
function ResearchOutput({ data }: { data: any }) {
  const listingsCount = data?.propertySearches?.listings?.length ?? 0;
  const suburb = data?.propertySearches?.query?.suburb;

  return (
    <div className="rounded-lg bg-[#242b33]/85 border border-white/10 p-4 space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-[#55d6be]" />
        <h4 className="text-sm font-semibold text-white">Research Complete</h4>
      </div>

      {listingsCount > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-white/80">
            Found{" "}
            <span className="font-semibold text-[#55d6be]">
              {listingsCount}
            </span>{" "}
            properties
            {suburb && <span className="text-white/60"> in {suburb}</span>}
          </p>

          {data.suburbStatistics && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {data.suburbStatistics.medianPrice && (
                <Stat
                  label="Median Price"
                  value={`$${data.suburbStatistics.medianPrice.amount.toLocaleString()}`}
                />
              )}
              {data.suburbStatistics.medianRentWeekly && (
                <Stat
                  label="Median Rent"
                  value={`$${data.suburbStatistics.medianRentWeekly.amount}/wk`}
                />
              )}
              {data.suburbStatistics.grossRentalYieldPct && (
                <Stat
                  label="Gross Yield"
                  value={`${data.suburbStatistics.grossRentalYieldPct.toFixed(2)}%`}
                />
              )}
              {data.suburbStatistics.vacancyRatePct && (
                <Stat
                  label="Vacancy Rate"
                  value={`${data.suburbStatistics.vacancyRatePct.toFixed(2)}%`}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/60">No properties found</p>
      )}
    </div>
  );
}

/**
 * AnalystOutput displays financial insights from the Analyst agent.
 */
function AnalystOutput({ data }: { data: any }) {
  const insights = data?.insights;

  return (
    <div className="rounded-lg bg-[#242b33]/85 border border-white/10 p-4 space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-[#55d6be]" />
        <h4 className="text-sm font-semibold text-white">Analysis Complete</h4>
      </div>

      {insights ? (
        <div className="space-y-3">
          <div>
            <h5 className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2">
              Insights
            </h5>
            <p className="text-sm text-white/80 leading-relaxed">{insights}</p>
          </div>

          {data.recommendations && (
            <div>
              <h5 className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2">
                Recommendations
              </h5>
              <p className="text-sm text-white/80 leading-relaxed">
                {data.recommendations}
              </p>
            </div>
          )}
        </div>
      ) : (
        <GenericOutput data={data} />
      )}
    </div>
  );
}

/**
 * GenericOutput displays raw JSON for unknown tool types.
 */
function GenericOutput({ data }: { data: any }) {
  return (
    <div className="rounded-lg bg-[#242b33]/60 border border-white/10 p-3 min-w-0 overflow-hidden">
      <pre className="text-xs text-white/60 overflow-x-auto max-h-40 whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Stat component for displaying key-value pairs.
 */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#1a1f26]/80 px-3 py-2">
      <div className="text-xs text-white/40 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
