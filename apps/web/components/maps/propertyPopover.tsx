import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { LayerInfoLabelNames, Layers } from "@/lib/map/layers";
import { fetchDetailsAtPoint } from "@/lib/utils";
import { SearchResult } from "@/context/MapContext";
import { useEffect, useState } from "react";

type PropertyCardProps = {
  property: SearchResult;
};

function layerLabel(layer: Layers) {
  switch (layer) {
    case "LANDIND_ZONES":
      return "Land Zone";
    case "FLOOD_HAZARD":
      return "Flood";
    case "BUSHFIRE_HAZARD":
      return "Bushfire";
    case "HERITAGE_ZONES":
      return "Heritage";
    case "LANDSLIDE_HAZARD":
      return "Landslide";
    case "STORM_TIDE_HAZARD":
      return "Storm Tide";
    default:
      return layer;
  }
}

/**
 * Each layer may have different attribute keys.
 * Add/adjust mapping as you learn the schema.
 */
function formatLayerValue(layer: Layers, data?: Record<string, any> | null) {
  console.log(`Data for ${layer}`, data);

  const safe = data ?? {};

  const get = (...keys: string[]) =>
    keys
      .map((k) => safe?.[k]) // ✅ safe access
      .find((v) => v !== undefined && v !== null && String(v).trim() !== "");

  switch (layer) {
    case "LANDIND_ZONES": {
      const v = get(...LayerInfoLabelNames[layer]);
      return { value: v ? String(v) : "No zone found", tone: v ? ("ok" as const) : ("muted" as const) };
    }
    case "FLOOD_HAZARD": {
      const v = get(...LayerInfoLabelNames[layer]);
      return { value: v ? String(v) : "No flood hazard", tone: v ? ("warn" as const) : ("muted" as const) };
    }
    case "BUSHFIRE_HAZARD": {
      const v = get(...LayerInfoLabelNames[layer]);
      return { value: v ? String(v) : "No bushfire hazard", tone: v ? ("warn" as const) : ("muted" as const) };
    }
    case "HERITAGE_ZONES": {
      const v = get(...LayerInfoLabelNames[layer]);
      return { value: v ? String(v) : "Not heritage-listed", tone: v ? ("info" as const) : ("muted" as const) };
    }
    case "LANDSLIDE_HAZARD": {
      const v = get(...LayerInfoLabelNames[layer]);
      return { value: v ? String(v) : "No landslide hazard", tone: v ? ("warn" as const) : ("muted" as const) };
    }
    case "STORM_TIDE_HAZARD": {
      const v = get(...LayerInfoLabelNames[layer]);
      return { value: v ? String(v) : "No storm tide hazard", tone: v ? ("warn" as const) : ("muted" as const) };
    }
    default:
      return { value: "—", tone: "muted" as const };
  }
}


function toneBadge(tone: "ok" | "warn" | "info" | "muted") {
  // use shadcn badge variants if you have them; otherwise keep it simple
  switch (tone) {
    case "ok":
      return <Badge>OK</Badge>;
    case "warn":
      return <Badge variant="destructive">Risk</Badge>;
    case "info":
      return <Badge variant="secondary">Info</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
}

type LayerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; raw: any; attrs: string[] };

const DEFAULT_LAYERS: Layers[] = [
  "LANDIND_ZONES",
  "FLOOD_HAZARD",
  "BUSHFIRE_HAZARD",
  "HERITAGE_ZONES",
];

export function PropertyPreviewCard({ property }: PropertyCardProps) {
  const router = useRouter();

  const [layers] = useState<Layers[]>(DEFAULT_LAYERS);

  const [layerState, setLayerState] = useState<Record<Layers, LayerState>>(() => {
    const init: any = {};
    for (const l of layers) init[l] = { status: "idle" };
    return init;
  });

  // Fetch when point changes
  useEffect(() => {
    let cancelled = false;

    async function run() {
      // mark all loading
      setLayerState((prev) => {
        const next: any = { ...prev };
        for (const l of layers) next[l] = { status: "loading" };
        return next;
      });

      await Promise.all(
        layers.map(async (layer) => {
          try {
            const { data, attrs } = await fetchDetailsAtPoint(layer, property.lat, property.lng);
            if (cancelled) return;

            setLayerState((prev) => ({
              ...prev,
              [layer]: { status: "success", raw: data.attributes, attrs },
            }));
          } catch (e: any) {
            if (cancelled) return;
            setLayerState((prev) => ({
              ...prev,
              [layer]: { status: "error", error: e?.message ?? "Failed to fetch" },
            }));
          }
        })
      );
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="max-w-xl w-full shadow-none border-none p-0">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{property.title}</CardTitle>
            {property.description ? (
              <CardDescription className="text-sm line-clamp-2">
                {property.description}
              </CardDescription>
            ) : null}
          </div>

          {/* keep your yield, but render it as a badge */}
          {property.yield ? (
            <Badge variant="secondary" className="shrink-0">
              {property.yield}
            </Badge>
          ) : null}
        </div>

        <div className="text-xs text-muted-foreground">
          {property.lat.toFixed(5)}, {property.lng.toFixed(5)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Layers summary table */}
        <div className="rounded-lg border">
          <Table>
            <TableBody>
              {layers.map((layer) => {
                const st = layerState[layer];
                if (!st) return null;

                if (st.status === "loading" || st.status === "idle") {
                  return (
                    <TableRow key={layer}>
                      <TableCell className="w-28 text-sm font-medium">
                        {layerLabel(layer)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }

                if (st.status === "error") {
                  return (
                    <TableRow key={layer}>
                      <TableCell className="w-28 text-sm font-medium">
                        {layerLabel(layer)}
                      </TableCell>
                      <TableCell className="flex items-center justify-between gap-2">
                        <span className="text-sm text-destructive line-clamp-1">
                          {st.error}
                        </span>
                        <Badge variant="destructive">Error</Badge>
                      </TableCell>
                    </TableRow>
                  );
                }

                const formatted = formatLayerValue(layer, st.raw);
                return (
                  <TableRow key={layer}>
                    <TableCell className="w-28 text-sm font-medium">
                      {layerLabel(layer)}
                    </TableCell>
                    <TableCell className="flex items-center justify-between gap-3">
                      <span className="text-sm line-clamp-1">{formatted.value}</span>
                      {toneBadge(formatted.tone)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              router.push(
                `/details?id=${encodeURIComponent(
                  property.title.toLowerCase().split(" ").join("-")
                )}`
              )
            }
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
