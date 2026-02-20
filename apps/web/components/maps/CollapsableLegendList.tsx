import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Styles } from "@/lib/map/layers";

interface LegendGroup {
    group: string;
    items: Styles[];
}

export function LegendGroupCollapsible({ group }: { group: LegendGroup }) {
  const [open, setOpen] = React.useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-1">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted transition"
        >
          <h4 className="text-xs font-semibold text-gray-700">{group.group}</h4>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pl-3 pt-1 space-y-1">
        {group.items.map((l, i) => (
          <div key={`${group.group}-${l.label}-${i}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm border"
              style={{ backgroundColor: l.fillColor }}
            />
            <span className="text-xs text-gray-600">{l.label}</span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}