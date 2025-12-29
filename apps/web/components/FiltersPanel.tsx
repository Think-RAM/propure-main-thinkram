"use client"

import type React from "react"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"

const propertyTypes = ["Apartment", "House", "Villa", "Condo", "Townhouse"]

export const FiltersPanel: React.FC = () => {
  const [priceRange, setPriceRange] = useState<[number, number]>([200000, 800000])
  const [rentRange, setRentRange] = useState<[number, number]>([800, 3500])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [age, setAge] = useState<[number, number]>([0, 30])
  const [bedrooms, setBedrooms] = useState<[number, number]>([1, 5])
  const [garage, setGarage] = useState<[number, number]>([0, 2])
  const [size, setSize] = useState<[number, number]>([400, 3000])

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const clearFilters = () => {
    setPriceRange([200000, 800000])
    setRentRange([800, 3500])
    setSelectedTypes([])
    setAge([0, 30])
    setBedrooms([1, 5])
    setGarage([0, 2])
    setSize([400, 3000])
  }

  return (
    <div className="bg-gradient-to-b from-white/95 to-cyan-50/95 backdrop-blur-md border border-cyan-200/50 rounded-xl shadow-xl h-full">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-cyan-50/95 to-teal-50/95 backdrop-blur-md border-b border-cyan-200/50 p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-cyan-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-100/50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-190px)]">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-cyan-700 mb-3">Price Range</label>
          <Slider
            min={200000}
            max={1000000}
            step={10000}
            value={priceRange}
            onValueChange={(val) => setPriceRange(val as [number, number])}
            className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-500 [&_[role=slider]]:to-teal-500 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
          />
          <div className="flex justify-between text-xs mt-2 text-gray-600 font-medium">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        {/* Monthly Rent */}
        <div>
          <label className="block text-sm font-semibold text-cyan-700 mb-3">Monthly Rent</label>
          <Slider
            min={800}
            max={5000}
            step={50}
            value={rentRange}
            onValueChange={(val) => setRentRange(val as [number, number])}
            className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-500 [&_[role=slider]]:to-teal-500 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
          />
          <div className="flex justify-between text-xs mt-2 text-gray-600 font-medium">
            <span>${rentRange[0]}</span>
            <span>${rentRange[1]}</span>
          </div>
        </div>

        {/* Property Types */}
        <div>
          <label className="block text-sm font-semibold text-cyan-700 mb-3">Property Type</label>
          <div className="space-y-3">
            {propertyTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:text-cyan-700 transition-colors"
              >
                <Checkbox
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-teal-500 data-[state=checked]:border-cyan-500"
                />
                <span className="font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="space-y-6">
          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-cyan-700 mb-3">Property Age (years)</label>
            <Slider
              min={0}
              max={50}
              step={1}
              value={age}
              onValueChange={(val) => setAge(val as [number, number])}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-500 [&_[role=slider]]:to-teal-500 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
            />
            <div className="flex justify-between text-xs mt-2 text-gray-600 font-medium">
              <span>{age[0]} yrs</span>
              <span>{age[1]} yrs</span>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-semibold text-cyan-700 mb-3">Bedrooms</label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={bedrooms}
              onValueChange={(val) => setBedrooms(val as [number, number])}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-500 [&_[role=slider]]:to-teal-500 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
            />
            <div className="flex justify-between text-xs mt-2 text-gray-600 font-medium">
              <span>{bedrooms[0]}</span>
              <span>{bedrooms[1]}</span>
            </div>
          </div>

          {/* Garage */}
          <div>
            <label className="block text-sm font-semibold text-cyan-700 mb-3">Garage Spaces</label>
            <Slider
              min={0}
              max={5}
              step={1}
              value={garage}
              onValueChange={(val) => setGarage(val as [number, number])}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-500 [&_[role=slider]]:to-teal-500 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
            />
            <div className="flex justify-between text-xs mt-2 text-gray-600 font-medium">
              <span>{garage[0]}</span>
              <span>{garage[1]}</span>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-semibold text-cyan-700 mb-3">Size (sq ft)</label>
            <Slider
              min={300}
              max={5000}
              step={100}
              value={size}
              onValueChange={(val) => setSize(val as [number, number])}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-500 [&_[role=slider]]:to-teal-500 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
            />
            <div className="flex justify-between text-xs mt-2 text-gray-600 font-medium">
              <span>{size[0].toLocaleString()} sq ft</span>
              <span>{size[1].toLocaleString()} sq ft</span>
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="pt-4 border-t border-cyan-200/50">
          <Button className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FiltersPanel
