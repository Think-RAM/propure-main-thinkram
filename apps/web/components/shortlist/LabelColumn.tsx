import { Separator } from "@/components/ui/separator";

const labels = [
  "Gross Yield",
  "Weekly Rent",
  "Annual Cash Flow",
  "5Y Growth",
  "Risk",
  "Days on Market",
  "Strategy Match",
];

export default function LabelColumn() {
  return (
    <div className="border-r border-neutral-950">
      {/* Header Spacer (matches property header height) */}
      <div className="h-[220px] flex items-end p-4 text-xs text-neutral-500 uppercase tracking-wide mt-[10px]">
        Compare
      </div>

      {labels.map((label, i) => (
        <div
          key={i}
          className="h-14 flex items-center px-4 text-sm text-neutral-400 border-t border-neutral-950"
        >
          {label}
        </div>
      ))}

      {/* Notes */}
      <div className="h-16 border-t border-neutral-950 px-4 flex items-center text-sm text-neutral-400">
        Notes
      </div>

      {/* Footer Spacer */}
      <div className="h-24 border-t border-neutral-950" />
    </div>
  );
}