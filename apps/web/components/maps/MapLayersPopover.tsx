"use client";
import {
  Layers as LayersIcon,
  Map,
  Satellite,
  Flame,
  Waves,
  Mountain,
  CloudRain,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Layers as MapLayers } from "@/lib/map/layers";
import { MapViewType, useMap } from "@/context/MapContext";

type LayerOption = {
  id: MapLayers | "default";
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
  {
    id: "LANDSLIDE_HAZARD",
    label: "Landslide Hazard",
    icon: <Mountain className="h-4 w-4" />,
  },
  {
    id: "STORM_TIDE_HAZARD",
    label: "Storm Tide Hazard",
    icon: <CloudRain className="h-4 w-4" />,
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
  const { currentLayer, setMapLayer, setMapView, currentView } = useMap();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" className="h-10 w-10 rounded-full blur-none">
          <LayersIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent side="top" align="end" className="w-60 p-0">
        <Command>
          <CommandGroup heading="Map Layers">
            {layers.map((layer) => (
              <CommandItem
                key={layer.id}
                value={layer.id}
                onSelect={() => {
                  setMapLayer(layer.id === "default" ? undefined : layer.id);
                }}
                className={cn(
                  "flex items-center gap-3 rounded px-2 py-1 cursor-pointer transition-colors",
                  "hover:bg-gray-100 active:bg-gray-200",
                  "data-[selected=true]:bg-transparent data-[selected=true]:text-foreground",
                  "aria-selected:bg-transparent aria-selected:text-foreground"
                )}
              >
                <span className="text-muted-foreground">{layer.icon}</span>

                <span className="flex-1">{layer.label}</span>

                <span
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    currentLayer === layer.id ||
                      (currentLayer === undefined && layer.id === "default")
                      ? "bg-primary"
                      : "bg-muted"
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
                  "flex items-center gap-3 rounded px-2 py-1 cursor-pointer transition-colors",
                  "hover:bg-gray-100 active:bg-gray-200",
                  "data-[selected=true]:bg-transparent data-[selected=true]:text-foreground",
                  "aria-selected:bg-transparent aria-selected:text-foreground"
                )}
              >
                <span className="text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{label}</span>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    currentView === id
                      ? "bg-primary"
                      : "bg-muted"
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
