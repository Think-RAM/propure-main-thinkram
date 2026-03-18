import {
  BedDouble,
  Bath,
  Car,
  Ruler,
} from "lucide-react";

interface Features {
  beds: number;
  baths: number;
  parking: number;
  area: number;
}

export function PropertyFeatures({ features }: { features: Features }) {
  return (
    <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
      
      <Feature icon={BedDouble} label={`${features.beds} Beds`} />
      <Feature icon={Bath} label={`${features.baths} Baths`} />
      <Feature icon={Car} label={`${features.parking} Parking`} />
      <Feature icon={Ruler} label={`${features.area} m²`} />
    </div>
  );
}

function Feature({
  icon: Icon,
  label,
}: {
  icon: any;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}