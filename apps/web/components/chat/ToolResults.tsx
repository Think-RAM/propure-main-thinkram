"use client";

import * as React from "react";
import type {
  DynamicToolUIPart,
  FileUIPart,
  ReasoningUIPart,
  SourceDocumentUIPart,
  SourceUrlUIPart,
  StepStartUIPart,
  ToolUIPart,
} from "ai";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { ChatTools } from "@/types/ai";

/**
 * ---------
 *  TYPES
 * ---------
 */

/**
 * This union represents “UI parts” you might render in your stream.
 * We only handle tool-* parts here, but keep union for your upstream list typing.
 */
export type ToolType =
  | ReasoningUIPart
  | DynamicToolUIPart
  | SourceUrlUIPart
  | SourceDocumentUIPart
  | FileUIPart
  | StepStartUIPart
  | { type: `data-${string}`; id?: string; data: unknown }
  | ToolUIPart<ChatTools>;

/**
 * A strongly-typed view of ONLY tool parts.
 */
type ToolPart = Extract<ToolType, { type: `tool-${string}` }>;

/**
 * Tool execution state we care about.
 * (We avoid `as any` by narrowing with type guards below.)
 */
type ToolState =
  | "pending"
  | "partial-call"
  | "call"
  | "output-available"
  | "output-error";

/**
 * A typed refinement of ToolPart that includes state/output when present.
 * We don't assume the AI SDK always includes them, so we guard at runtime.
 */
type ToolPartWithState = ToolPart & { state: ToolState };
type ToolPartWithOutput = ToolPartWithState & {
  state: "output-available";
  output: unknown;
};
type ToolPartWithError = ToolPartWithState & { state: "output-error" };

/**
 * Known tool names (tightens switch statements).
 * If you add more named tools later, extend this union.
 */
type KnownToolName = "strategist" | "researcher" | "analyst";

/**
 * Your tool output schemas (define them once, use everywhere).
 * If you have real types in `@/types/ai`, replace these with imports.
 */
type StrategyOutputData = {
  strategyDiscovery?: {
    summary?: string;
    keyInsights?: string[];
  };
  [k: string]: unknown;
};

type ResearchOutputData = {
  propertySearches?: {
    query?: { suburb?: string };
    listings?: unknown[];
  };
  suburbStatistics?: {
    medianPrice?: { amount: number };
    medianRentWeekly?: { amount: number };
    grossRentalYieldPct?: number;
    vacancyRatePct?: number;
  };
  [k: string]: unknown;
};

type AnalystOutputData = {
  insights?: string;
  recommendations?: string;
  [k: string]: unknown;
};

/**
 * --------------
 *  TYPE GUARDS
 * --------------
 */

function isToolPart(part: ToolType): part is ToolPart {
  return part.type.startsWith("tool-");
}

function isToolState(x: unknown): x is ToolState {
  return (
    x === "pending" ||
    x === "partial-call" ||
    x === "call" ||
    x === "output-available" ||
    x === "output-error"
  );
}

function hasToolState(part: ToolPart): part is ToolPartWithState {
  return "state" in part && isToolState((part as { state?: unknown }).state);
}

function hasToolOutput(part: ToolPartWithState): part is ToolPartWithOutput {
  return part.state === "output-available" && "output" in part;
}

function isKnownToolName(name: string): name is KnownToolName {
  return name === "strategist" || name === "researcher" || name === "analyst";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asStrategyData(v: unknown): StrategyOutputData | null {
  if (!isRecord(v)) return null;
  // Lightweight structural check
  if ("strategyDiscovery" in v && isRecord(v.strategyDiscovery))
    return v as StrategyOutputData;
  return null;
}

function asResearchData(v: unknown): ResearchOutputData | null {
  if (!isRecord(v)) return null;
  if ("propertySearches" in v || "suburbStatistics" in v)
    return v as ResearchOutputData;
  return null;
}

function asAnalystData(v: unknown): AnalystOutputData | null {
  if (!isRecord(v)) return null;
  if ("insights" in v || "recommendations" in v) return v as AnalystOutputData;
  return null;
}

function toolNameFromType(type: ToolPart["type"]): string {
  return type.replace(/^tool-/, "");
}

/**
 * ----------
 *  COMPONENT
 * ----------
 */

interface ToolResultProps {
  part: ToolType;
}

/**
 * ToolResult component renders tool execution states and outputs for AI agents.
 * Handles different states: pending, partial-call, call, output-available, output-error.
 */
export function ToolResult({ part }: ToolResultProps) {
  // Only render tool-* parts
  if (!isToolPart(part)) return null;

  const toolName = toolNameFromType(part.type);

  // Must have a known/valid tool state
  if (!hasToolState(part)) return null;

  switch (part.state as ToolState) {
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
      console.log("Tool Ouput: ", part);
      // ensure output exists before passing down
      if (!hasToolOutput(part)) return null;
      return <ToolOutput toolName={toolName} output={part.output} />;

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

function ToolOutput({
  toolName,
  output,
}: {
  toolName: string;
  output: unknown;
}) {
  // Tighten toolName discrimination, fall back to generic
  if (isKnownToolName(toolName)) {
    switch (toolName) {
      case "strategist": {
        const data = asStrategyData(output);
        return data ? (
          <StrategyOutput data={data} />
        ) : (
          <GenericOutput data={output} />
        );
      }
      case "researcher": {
        const data = asResearchData(output);
        return data ? (
          <ResearchOutput data={data} />
        ) : (
          <GenericOutput data={output} />
        );
      }
      case "analyst": {
        const data = asAnalystData(output);
        return data ? (
          <AnalystOutput data={data} />
        ) : (
          <GenericOutput data={output} />
        );
      }
    }
  }

  return <GenericOutput data={output} />;
}

/**
 * StrategyOutput displays strategy discovery results from the Strategist agent.
 */
function StrategyOutput({ data }: { data: StrategyOutputData }) {
  const summary = data.strategyDiscovery?.summary;

  if (!summary) {
    return <GenericOutput data={data} />;
  }

  const keyInsights = data.strategyDiscovery?.keyInsights ?? [];

  return (
    <div className="rounded-lg bg-[#242b33]/85 border border-white/10 p-4 space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-[#55d6be]" />
        <h4 className="text-sm font-semibold text-white">Strategy Discovery</h4>
      </div>

      <p className="text-sm text-white/80 leading-relaxed">{summary}</p>

      {keyInsights.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-white/60 uppercase tracking-wide">
            Key Insights
          </h5>
          <ul className="space-y-1">
            {keyInsights.map((insight, i) => (
              <li
                key={i}
                className="text-sm text-white/70 flex items-start gap-2"
              >
                <span className="text-[#55d6be] mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * ResearchOutput displays property search results from the Researcher agent.
 */
function ResearchOutput({ data }: { data: ResearchOutputData }) {
  const listingsCount = data.propertySearches?.listings?.length ?? 0;
  const suburb = data.propertySearches?.query?.suburb;

  const stats = data.suburbStatistics;

  return (
    <div className="rounded-lg bg-[#242b33]/85 border border-white/10 p-4 space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-[#55d6be]" />
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

          {stats && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {stats.medianPrice && (
                <Stat
                  label="Median Price"
                  value={`$${stats.medianPrice.amount.toLocaleString()}`}
                />
              )}
              {stats.medianRentWeekly && (
                <Stat
                  label="Median Rent"
                  value={`$${stats.medianRentWeekly.amount}/wk`}
                />
              )}
              {typeof stats.grossRentalYieldPct === "number" && (
                <Stat
                  label="Gross Yield"
                  value={`${stats.grossRentalYieldPct.toFixed(2)}%`}
                />
              )}
              {typeof stats.vacancyRatePct === "number" && (
                <Stat
                  label="Vacancy Rate"
                  value={`${stats.vacancyRatePct.toFixed(2)}%`}
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
function AnalystOutput({ data }: { data: AnalystOutputData }) {
  const { insights, recommendations } = data;

  return (
    <div className="rounded-lg bg-[#242b33]/85 border border-white/10 p-4 space-y-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-[#55d6be]" />
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

          {recommendations && (
            <div>
              <h5 className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2">
                Recommendations
              </h5>
              <p className="text-sm text-white/80 leading-relaxed">
                {recommendations}
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
function GenericOutput({ data }: { data: unknown }) {
  return (
    <div className="rounded-lg bg-[#242b33]/60 border border-white/10 p-3 min-w-0 overflow-hidden">
      <pre
        className="
          text-xs text-white/60
          max-h-40 overflow-auto
          whitespace-pre-wrap break-words
          rounded-xl border border-white/10 bg-black/20
          p-3
          scrollbar-thin
        "
      >
        {safeStringify(data)}
      </pre>
    </div>
  );
}

function safeStringify(v: unknown) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
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
