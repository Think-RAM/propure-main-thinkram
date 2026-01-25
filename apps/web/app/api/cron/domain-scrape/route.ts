import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { start } from "workflow/api";

import { domainScrapeWorkflow } from "@/workflows/domain-scrape";
import { PropertySearchParamsSchema } from "@propure/mcp-shared";

const DomainScrapeRequestSchema = z.object({
  searches: z.array(PropertySearchParamsSchema).min(1).optional(),
});

export async function GET() {
  const run = await start(domainScrapeWorkflow, []);
  return NextResponse.json({ runId: run.runId });
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = DomainScrapeRequestSchema.safeParse(json ?? {});
  const args: Parameters<typeof domainScrapeWorkflow> =
    parsed.success && parsed.data.searches?.length ? [parsed.data] : [];

  const run = await start(domainScrapeWorkflow, args);
  return NextResponse.json({ runId: run.runId });
}
