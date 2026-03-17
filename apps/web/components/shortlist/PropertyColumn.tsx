import { Property } from "@/app/(main)/shortlist/[chatId]/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X, MapPin, Phone, Calendar } from "lucide-react";
import NotesSection from "./NotesSection";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  property: Property;
}

export default function PropertyColumn({ property }: Props) {
  return (
    <div className="flex flex-col border-r last:border-r-0 border-neutral-950">
      {/* HEADER */}
      <div className="p-4 border-b border-neutral-950 bg-[#1b212e] relative">
        {property.tag && (
          <Badge className={cn("absolute top-3 left-3 z-50 py-1 text-sx", property.tag === "recommended" ? "bg-yellow-800 text-yellow-500 hover:bg-yellow-800" : "bg-gray-800 text-white hover:bg-gray-800")}>
            {property.tag.charAt(0).toUpperCase() +
              property.tag.slice(1).toLowerCase()}
          </Badge>
        )}

        <button className="absolute top-2 right-3 z-50 text-neutral-500 hover:text-red-800 hover:bg-red-800/10 rounded-full p-1">
          <X size={16} />
        </button>

        {/* Property Image */}
        <div className="relative h-28 rounded-md overflow-hidden mb-3">
          <Image
            src="https://images.unsplash.com/photo-1560185127-6ed189bf02f4"
            alt={property.title}
            fill
            sizes="300px"
            className="object-cover"
          />
        </div>

        <h3 className="text-sm font-semibold text-white leading-tight">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
          <MapPin size={12} />
          {property.location}
        </div>

        <p className="mt-2 text-lg font-semibold text-teal-400">
          ${property.price.toLocaleString()}
        </p>
      </div>

      {/* VALUE ROWS */}
      <ValueRow value={property.yield} suffix="%" highlight={property.yield > 5.6} textHighlight={property.yield > 5} prefix="+"/>
      <ValueRow value={property.rent} prefix="$" suffix="/wk" />
      <ValueRow value={property.cashFlow} prefix="$" highlight={property.cashFlow > 4000} textHighlight={property.cashFlow > 2500} />
      <ValueRow value={property.growth} suffix="%" prefix="+" textHighlight={property.growth > 25} />
      <ValueRow value={property.risk} />
      <ValueRow value={property.daysOnMarket} suffix=" days" />

      {/* STARS */}
      <div className="h-14 flex items-center justify-center border-t border-neutral-950">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < property.score ? "text-yellow-400" : "text-neutral-700"
              }
              fill="currentColor"
            />
          ))}
        </div>
      </div>

      {/* NOTES */}
      <div className="p-2">
        <NotesSection />
      </div>

      {/* ACTIONS */}
      <div className="mt-auto p-3 border-t border-neutral-950 flex flex-col gap-2">
        <Button size="sm" className="w-full">
          <Phone size={16} />
          Contact Agent
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full bg-white text-black hover:bg-white/90"
        >
          <Calendar size={16} />
          Book Inspection
        </Button>
      </div>
    </div>
  );
}

/* ---------- Row Component ---------- */

interface ValueRowProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  highlight?: boolean;
  textHighlight?: boolean;
}

function ValueRow({
  value,
  prefix = "",
  suffix = "",
  highlight,
  textHighlight,
}: ValueRowProps) {
  const isNumber = typeof value === "number";

  const isPositive = isNumber && value > 0;
  const isNegative = isNumber && value < 0;

  // Display formatting
  const displayValue =
    isNumber && prefix === "$"
      ? `${value > 0 ? "+" : "-"} ${prefix}${Math.abs(value).toLocaleString()}${suffix}`
      : `${prefix}${value}${suffix}`;

  return (
    <div
      className={`
        h-14 flex items-center justify-center text-sm border-t border-neutral-950
        ${
          highlight && isPositive
            ? "bg-green-500/10"
            : isNegative
            ? "bg-yellow-500/10"
            : ""
        }
      `}
    >
      <span
        className={`
          font-medium
          ${
            isPositive && textHighlight
              ? "text-green-400"
              : isNegative && textHighlight
              ? "text-yellow-400"
              : "text-neutral-200"
          }
        `}
      >
        {displayValue}
      </span>
    </div>
  );
}