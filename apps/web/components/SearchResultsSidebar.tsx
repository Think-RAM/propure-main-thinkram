"use client";

import { useMap } from "@/context/MapContext";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

type SearchResult = {
  title: string;
  description: string;
  yield: string;
  gradientFrom: string;
  gradientTo: string;
  yieldColor: string;
  lat: number;
  lng: number;
};

type Props = {
  isSearchActive: boolean;
  searchValue: string;
  setIsSearchActive: (active: boolean) => void;
};

const baseSearchResults: SearchResult[] = [
  {
    title: "Downtown District",
    description: "High ROI potential - $450K avg",
    yield: "8.5% yield",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-teal-500",
    yieldColor: "text-cyan-600",
    lat: 40.7589,
    lng: -73.9851,
  },
  {
    title: "Riverside Heights",
    description: "Emerging market - $320K avg",
    yield: "7.2% yield",
    gradientFrom: "from-teal-500",
    gradientTo: "to-cyan-500",
    yieldColor: "text-teal-600",
    lat: 40.6892,
    lng: -74.0445,
  },
  {
    title: "Tech Quarter",
    description: "Premium location - $680K avg",
    yield: "6.8% yield",
    gradientFrom: "from-cyan-400",
    gradientTo: "to-teal-400",
    yieldColor: "text-cyan-700",
    lat: 40.7505,
    lng: -73.9934,
  },
  {
    title: "Marina Bay",
    description: "Waterfront properties - $520K avg",
    yield: "7.8% yield",
    gradientFrom: "from-teal-400",
    gradientTo: "to-cyan-600",
    yieldColor: "text-teal-700",
    lat: 40.7282,
    lng: -73.7949,
  },
];

const SearchResultsSidebar: React.FC<Props> = ({
  isSearchActive,
  searchValue,
  setIsSearchActive,
}) => {
  const { setResults, setCenter } = useMap();
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);

  // Filtered search result matching query (simulate actual search)
  const matchedResults = baseSearchResults.filter((r) =>
    r.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    if (isSearchActive && searchValue.length > 0) {
      setResults(matchedResults);
    } else {
      setResults([]);
    }
  }, [searchValue, isSearchActive]);

  const handleSelect = (result: SearchResult) => {
    setCenter({ lat: result.lat, lng: result.lng });
    setRecentSearches((prev) => [
      result,
      ...prev.filter((r) => r.title !== result.title),
    ]);
  };

  const displayResults =
    searchValue && isSearchActive ? matchedResults : recentSearches;

  return (
    <div
      className={`absolute left-6 top-20 bottom-6 w-80 bg-gradient-to-b from-white/95 to-cyan-50/95 backdrop-blur-md rounded-lg shadow-xl border border-cyan-200/50 transition-all duration-500 ${
        isSearchActive
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {searchValue.length !== 0 ? "Search Results" : "Recent Searches"}
          </h3>
          <Button variant="ghost" size="icon" onClick={() => setIsSearchActive(false)}>
            <X className="text-gray-500 hover:text-gray-800 cursor-pointer hover:bg-transparent" />
          </Button>
        </div>
        <div className="space-y-4">
          {displayResults.length > 0 ? (
            displayResults.map((result, index) => (
              <div
                key={index}
                className="p-4 border border-cyan-200 rounded-lg hover:bg-cyan-50/50 cursor-pointer transition-colors"
                onClick={() => handleSelect(result)}
              >
                <h4 className="font-medium text-gray-800">{result.title}</h4>
                <p className="text-sm text-gray-600">{result.description}</p>
                <div className="flex items-center mt-2">
                  <div
                    className={`w-2 h-2 bg-gradient-to-r ${result.gradientFrom} ${result.gradientTo} rounded-full mr-2`}
                  ></div>
                  <span className={`text-xs font-medium ${result.yieldColor}`}>
                    {result.yield}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No recent searches</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsSidebar;
