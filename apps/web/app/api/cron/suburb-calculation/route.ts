import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";
import { suburbAsyncWorkflow } from "@propure/workflow";
import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import z from "zod";

const SuburbLocationSchema = z.array(
  z.object({
    suburb: z.string(),
    state: z.string(),
    postcode: z.string(),
  }),
);

export async function POST(request: NextRequest) {
  // const json = await request.json().catch(() => null);

  const suburbs = (
    await client.query(api.functions.scrapingLocations.listAll, {})
  ).map((record) => ({
    suburb: record.suburb,
    state: record.state,
    postcode: record.postcode,
  }));

  const parsed = SuburbLocationSchema.safeParse(suburbs ?? []);
  const args: Parameters<typeof suburbAsyncWorkflow> =
    parsed.success && parsed.data?.length ? [parsed.data] : [[]];

  const run = await start(suburbAsyncWorkflow, args);
  return NextResponse.json({ runId: run.runId });
}
