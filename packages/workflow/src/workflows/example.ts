export interface ExampleWorkflowResult {
  message: string;
  triggeredAt: string;
}

export async function exampleWorkflow(): Promise<ExampleWorkflowResult> {
  "use workflow";

  return {
    message: "workflow package scaffolded",
    triggeredAt: new Date().toISOString(),
  };
}
