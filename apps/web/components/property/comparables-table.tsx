"use client";

import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ComparableProperty } from "@/lib/property";



interface Props {
  data: ComparableProperty[];
}

export function ComparablesTable({ data }: Props) {
  if (!data?.length) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      
      {/* Title */}
      <h2 className="text-lg font-semibold text-white mb-4">
        Comparable Sales
      </h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead>Property</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Beds</TableHead>
              <TableHead>Land</TableHead>
              <TableHead>$/m²</TableHead>
              <TableHead>Comparison</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                className="border-zinc-800 hover:bg-zinc-800/50 transition"
              >
                
                {/* Property */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    
                    {/* Thumbnail */}
                    <div className="relative w-14 h-10 rounded-md overflow-hidden bg-zinc-800">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.address}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    {/* Address */}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.address}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {item.suburb}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Price */}
                <TableCell className="text-white font-medium">
                  ${item.price.toLocaleString()}
                </TableCell>

                {/* Date */}
                <TableCell className="text-zinc-400 text-sm">
                  {item.date}
                </TableCell>

                {/* Beds */}
                <TableCell className="text-zinc-300">
                  {item.beds}
                </TableCell>

                {/* Land */}
                <TableCell className="text-zinc-300">
                  {item.landSize} m²
                </TableCell>

                {/* Price per sqm */}
                <TableCell className="text-zinc-300">
                  ${item.pricePerSqm.toLocaleString()}
                </TableCell>

                {/* Comparison Badge */}
                <TableCell>
                  <ComparisonBadge comparison={item.comparison} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ComparisonBadge({
  comparison,
}: {
  comparison: ComparableProperty["comparison"];
}) {
  const config = getComparisonStyle(comparison.type);

  return (
    <span
      className={`
        px-2.5 py-1 rounded-full text-xs font-medium
        ${config.bg} ${config.text}
      `}
    >
      {comparison.label || config.label}
    </span>
  );
}

function getComparisonStyle(type: ComparableProperty["comparison"]["type"]) {
  switch (type) {
    case "similar":
      return {
        label: "Similar",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
      };

    case "higher":
    case "larger":
      return {
        label: "Higher",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
      };

    case "lower":
    case "smaller":
      return {
        label: "Lower",
        bg: "bg-amber-500/10",
        text: "text-amber-400",
      };

    default:
      return {
        label: "Neutral",
        bg: "bg-zinc-700/50",
        text: "text-zinc-300",
      };
  }
}