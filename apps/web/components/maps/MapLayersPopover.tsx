"use client";
import {
  Layers as LayersIcon,
  Map,
  Satellite,
  Flame,
  Waves,
  Mountain,
  CloudRain,
  Landmark,
  School,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Layers as MapLayers } from "@/lib/map/layers";
import { MapViewType, useMap } from "@/context/MapContext";
import { MetricType } from "@/lib/map/heatmap-config";

type LayerOption = {
  id: MapLayers | "default";
  label: string;
  icon: React.ReactNode;
};

type HeatMapLayerOption = {
  id: MetricType | "default";
  label: string;
  icon: React.ReactNode;
};

const layers: LayerOption[] = [
  {
    id: "default",
    label: "Default",
    icon: <Map className="h-4 w-4" />,
  },
  {
    id: "LANDIND_ZONES",
    label: "Land Zoning",
    icon: <Satellite className="h-4 w-4" />,
  },
  {
    id: "FLOOD_HAZARD",
    label: "Flood Hazard",
    icon: <Waves className="h-4 w-4" />,
  },
  {
    id: "BUSHFIRE_HAZARD",
    label: "Bushfire Hazard",
    icon: <Flame className="h-4 w-4" />,
  },
  // {
  //   id: "LANDSLIDE_HAZARD",
  //   label: "Landslide Hazard",
  //   icon: <Mountain className="h-4 w-4" />,
  // },
  // {
  //   id: "STORM_TIDE_HAZARD",
  //   label: "Storm Tide Hazard",
  //   icon: <CloudRain className="h-4 w-4" />,
  // },
  {
    id: "HERITAGE_ZONES",
    label: "Heritage Zones",
    icon: <Landmark className="h-4 w-4" />,
  },
  {
    id: "SCHOOL_ZONES",
    label: "School Zones",
    icon: <School className="h-4 w-4" />,
  },
];

const heatMapLayers: HeatMapLayerOption[] = [
  {
    id: "capital_growth_score",
    label: "Capital Growth",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    id: "risk_score",
    label: "Investment Risk",
    icon: <AlertTriangle  className="h-4 w-4" />,
  },
  {
    id: "cash_flow_score",
    label: "Cash Flow",
    icon: <DollarSign  className="h-4 w-4" />,
  },
];

export const MAP_VIEWS: {
  id: MapViewType;
  label: string;
  icon: React.ElementType;
  layer?: string;
}[] = [
  {
    id: "default",
    label: "Default View",
    icon: Map,
    layer: undefined,
  },
  {
    id: "satellite",
    label: "Satellite View",
    icon: Satellite,
    layer: "satellite",
  },
  {
    id: "terrain",
    label: "Terrain View",
    icon: Mountain,
    layer: "terrain",
  },
];

export function MapLayersPopover() {
  const { currentLayer, currentHeatmapLayer, setMapLayer, setHeatmapLayer, setMapView, currentView } = useMap();

  return (
    <Popover>
      <PopoverTrigger asChild className="z-100">
        <Button
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full",
            "pointer-events-auto",
            "bg-[#1a1f26]/90 border border-white/10 shadow-xl",
            "hover:bg-[#242b33] hover:border-[#0d7377]/30",
            "text-[#f7f9fc]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7377]/50",
          )}
        >
          <LayersIcon className="h-5 w-5 text-[#9fe7ea]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        className={cn(
          "w-72 p-0",
          "bg-[#242b33] border border-white/10 shadow-2xl",
          "text-[#f7f9fc]",
        )}
      >
        <Command className="bg-transparent">
          <CommandGroup heading="Map Layers">
            {layers.map((layer) => (
              <CommandItem
                key={layer.id}
                value={layer.id}
                onSelect={() => {
                  setMapLayer(layer.id === "default" ? undefined : layer.id);
                }}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2 cursor-pointer transition-colors",
                  "hover:bg-white/5 active:bg-white/10",
                  "data-[selected=true]:bg-transparent data-[selected=true]:text-[#f7f9fc]",
                  "aria-selected:bg-transparent aria-selected:text-[#f7f9fc]",
                )}
              >
                <span className="text-white/60">{layer.icon}</span>

                <span className="flex-1 text-white">{layer.label}</span>

                <Switch
                  checked={
                    currentLayer === layer.id ||
                    (currentLayer === undefined && layer.id === "default")
                  }
                  onCheckedChange={(checked) => {
                    // Single active layer behavior:
                    // - turning ON selects that layer
                    // - turning OFF returns to default (undefined)
                    if (checked) {
                      setMapLayer(
                        layer.id === "default" ? undefined : layer.id,
                      );
                    } else {
                      setMapLayer(undefined);
                    }
                  }}
                  // prevent item click from double-triggering when toggling switch
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "data-[state=checked]:bg-[#0d7377]",
                    "data-[state=unchecked]:bg-white/10",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Heatmap Layers">
            {heatMapLayers.map((layer) => (
              <CommandItem
                key={layer.id}
                value={layer.id}
                onSelect={() => {
                  setHeatmapLayer(layer.id === "default" ? undefined : layer.id);
                }}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2 cursor-pointer transition-colors",
                  "hover:bg-white/5 active:bg-white/10",
                  "data-[selected=true]:bg-transparent data-[selected=true]:text-[#f7f9fc]",
                  "aria-selected:bg-transparent aria-selected:text-[#f7f9fc]",
                )}
              >
                <span className="text-white/60">{layer.icon}</span>

                <span className="flex-1 text-white">{layer.label}</span>

                <Switch
                  checked={
                    currentHeatmapLayer === layer.id ||
                    (currentHeatmapLayer === undefined && layer.id === "default")
                  }
                  onCheckedChange={(checked) => {
                    // Single active layer behavior:
                    // - turning ON selects that layer
                    // - turning OFF returns to default (undefined)
                    if (checked) {
                      setHeatmapLayer(
                        layer.id === "default" ? undefined : layer.id,
                      );
                    } else {
                      setHeatmapLayer(undefined);
                    }
                  }}
                  // prevent item click from double-triggering when toggling switch
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "data-[state=checked]:bg-[#0d7377]",
                    "data-[state=unchecked]:bg-white/10",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Map View">
            {MAP_VIEWS.map(({ id, label, icon: Icon }) => (
              <CommandItem
                key={id}
                onSelect={() => setMapView(id)}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2 cursor-pointer transition-colors",
                  "hover:bg-white/5 active:bg-white/10",
                  "data-[selected=true]:bg-transparent data-[selected=true]:text-[#f7f9fc]",
                  "aria-selected:bg-transparent aria-selected:text-[#f7f9fc]",
                )}
              >
                <span className="text-white/60">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-white">{label}</span>
                <Switch
                  checked={
                    currentView === id
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setMapView(id);
                    }
                  }}
                  // prevent item click from double-triggering when toggling switch
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "data-[state=checked]:bg-[#0d7377]",
                    "data-[state=unchecked]:bg-white/10",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
