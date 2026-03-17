import { generateShortListReport } from "@propure/workflow";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { start } from "workflow/api";

const ReportRequestSchema = z.object({
    chatId: z.string(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = ReportRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
        }
        const args: Parameters<typeof generateShortListReport> = [parsed.data];
        const run = await start(generateShortListReport, args);

        return NextResponse.json({ success: true, message: "Shortlist report generation started", runId: run.runId });
    } catch (error) {
        console.error("Error parsing request body:", error);
        return NextResponse.json({ success: false, message: "Failed" }, { status: 500 });
    }
}