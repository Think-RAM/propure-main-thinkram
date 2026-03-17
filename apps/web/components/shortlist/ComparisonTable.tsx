"use client";

import { Property } from "@/app/(main)/shortlist/[chatId]/page";
import PropertyColumn from "./PropertyColumn";
import LabelColumn from "./LabelColumn";

interface Props {
  properties: Property[];
}

export default function ComparisonTable({ properties }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <div
        className="
        grid min-w-[900px]
        grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))]
        rounded-xl border border-neutral-950 bg-[#1b212e] p-4
      "
      >
        <LabelColumn />

        {properties.map((property) => (
          <PropertyColumn key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}