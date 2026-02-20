import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { datasyncWorkflow, marketDataWorkflow } from "@propure/workflow";



export async function POST(req: NextRequest) {
  try {
    // const body = await req.json().catch(() => ({}));
    // const parsed = BodySchema.parse(body);

    // datasyncWorkflow currently reads locations itself and accepts no input.
    // Use the workflow runner API which returns a run object.
    const run = await start(datasyncWorkflow, []);
    // const run = await start(marketDataWorkflow, []);
    return NextResponse.json(
      { runId: run.runId, startedAt: new Date().toISOString() },
      { status: 202 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error("Failed to start datasync workflow", err);
    return NextResponse.json(
      { error: "Failed to start workflow" },
      { status: 500 },
    );
  }
}
