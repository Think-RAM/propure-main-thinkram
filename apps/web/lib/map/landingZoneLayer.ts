export type ZoningStyle = {
  label: string;
  fillColor: string;
  strokeColor?: string;
};

export const ZONING_LEGEND: Record<string, ZoningStyle> = {
  "Residential (Low Density)": { label: "Residential (Low Density)", fillColor: "#F6E59A" },
  "Urban Expansion": { label: "Urban Expansion", fillColor: "#EAD08C" },

  "Environmental Protection (Habitat)": { label: "Environmental Protection (Habitat)", fillColor: "#4F9A7A" },
  "Environmental Protection (Wetlands and Littoral Rainforests)": { label: "Environmental Protection (Wetlands)", fillColor: "#3E8F7A" },

  "Agribusiness": { label: "Agribusiness", fillColor: "#C4B27C" },

  "Local Centre": { label: "Local Centre", fillColor: "#F29F05" },
  "Neighbourhood Centre": { label: "Neighbourhood Centre", fillColor: "#F5B041" },
  "Commercial Core": { label: "Commercial Core", fillColor: "#E74C3C" },
  "Mixed Use": { label: "Mixed Use", fillColor: "#D35400" },

  "Business Development": { label: "Business Development", fillColor: "#CA6F1E" },
  "Enterprise Corridor": { label: "Enterprise Corridor", fillColor: "#AF601A" },
  "Business Park": { label: "Business Park", fillColor: "#A04000" },

  "National Parks and Nature Reserves": { label: "National Parks", fillColor: "#2ECC71" },
  "Environmental Conservation": { label: "Environmental Conservation", fillColor: "#27AE60" },
  "Environmental Management": { label: "Environmental Management", fillColor: "#1E8449" },
  "Environmental Living": { label: "Environmental Living", fillColor: "#239B56" },

  "General Residential": { label: "General Residential", fillColor: "#F7DC6F" },
  "Medium Density Residential": { label: "Medium Density Residential", fillColor: "#F4D03F" },
  "High Density Residential": { label: "High Density Residential", fillColor: "#F1C40F" },
  "Large Lot Residential": { label: "Large Lot Residential", fillColor: "#F9E79F" },

  "Primary Production": { label: "Primary Production", fillColor: "#82E0AA" },
  "Rural Landscape": { label: "Rural Landscape", fillColor: "#7DCEA0" },
  "Forestry": { label: "Forestry", fillColor: "#229954" },
  "Village": { label: "Village", fillColor: "#A9DFBF" },
  "Transition": { label: "Transition", fillColor: "#A2D9CE" },

  "Public Recreation": { label: "Public Recreation", fillColor: "#AED6F1" },
  "Private Recreation": { label: "Private Recreation", fillColor: "#85C1E9" },
  "Regional Park": { label: "Regional Park", fillColor: "#76D7C4" },
  "Parkland": { label: "Parkland", fillColor: "#7FB3D5" },

  "Waterway": { label: "Waterway", fillColor: "#5DADE2" },
  "Natural Waterways": { label: "Natural Waterways", fillColor: "#3498DB" },
  "Recreational Waterways": { label: "Recreational Waterways", fillColor: "#2E86C1" },
  "Working Waterways": { label: "Working Waterways", fillColor: "#2874A6" },

  "Unzoned": { label: "Unzoned", fillColor: "#BFC9CA" },
  "Unzoned Land": { label: "Unzoned Land", fillColor: "#D5D8DC" },
  "Deferred Matter": { label: "Deferred Matter", fillColor: "#7F8C8D" },
};
