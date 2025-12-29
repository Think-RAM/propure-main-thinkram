"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, Heart, Bed, Bath, Square, MapPin, Calculator, Users, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Link from "next/link"

const propertyData = {
  id: "prop_001",
  name: "Modernica Apartment",
  address: "14 Happy Hollow Road, Croton-on-Hudson, NY 10520",
  price: {
    amount: 120,
    period: "month",
  },
  features: {
    bedrooms: 3,
    bathrooms: 2,
    sqft: 960,
  },
  images: [
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400",
  ],
  matching: {
    score: 92,
    explanation:
      "This property matches your criteria for a budget-friendly rental in a suburban area with good transportation links. The 3-bedroom layout fits your space requirements, and the location offers the quiet environment you're looking for.",
    badges: [
      { label: "Within Budget", color: "cyan" },
      { label: "Good Location", color: "green" },
      { label: "Right Size", color: "blue" },
      { label: "Low Crime Area", color: "purple" },
    ],
  },
  criteria: {
    level1: {
      title: "Australia-Based Criteria Check",
      data: {
        nationalAvgPrice: 650000,
        annualGrowth: 5.2,
        marketStability: {
          label: "Strong",
          score: 85,
        },
      },
    },
    level2: {
      title: "City-Based Criteria Check",
      data: {
        cityAvgPrice: 580000,
        cityGrowth: 6.8,
        transportScore: {
          label: "8.5/10",
          score: 85,
        },
      },
    },
    level3: {
      title: "Suburb-Based Criteria Check",
      data: {
        suburbAvgPrice: 520000,
        schoolRating: 9.2,
        crimeRate: "Low",
        walkability: "Moderate",
        recentSales: "15 in 3 months",
      },
    },
  },
  investment: {
    defaults: {
      rentalGrowth: 3,
      maintenanceCost: 2000,
    },
    projections: {
      rentalYield: 4.2,
      capitalGrowth: 45000,
      breakEvenPoint: "2.3 years",
      monthlyLoanRepayment: 2450,
    },
    score: {
      rating: "Excellent",
      description: "Strong rental yield with good capital growth potential in a stable market.",
    },
  },
}

export default function PropertyDetails() {
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  // Investment calculation states
  const [rentalGrowth, setRentalGrowth] = useState(propertyData.investment.defaults.rentalGrowth)
  const [maintenanceCost, setMaintenanceCost] = useState(propertyData.investment.defaults.maintenanceCost)

  const propertyImages = propertyData.images

  const matchScore = propertyData.matching.score

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Top Navigation */}
      <div className="absolute top-0 z-50">
        <div className="flex w-screen items-center justify-between p-4 text-slate-800">
          <Button variant="ghost" size="icon" className="hover:bg-transparent" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`hover:bg-transparent ${isFavorited ? "text-red-500" : ""}`}
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <Heart className={`h-6 w-6 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="pb-24">
        {/* Image Gallery */}
        <div className="relative">
          <div
            className="relative overflow-hidden"
            style={{ height: "75vh", maxHeight: "75svh" }}
          >
            <Image
              src={propertyImages[selectedImage] || "/placeholder.svg"}
              alt="Property main image"
              fill
              className="object-cover"
              style={{ objectFit: "cover" }}
            />

            {/* Image counter overlay */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">
          {selectedImage + 1} / {propertyImages.length}
              </span>
            </div>
          </div>

          {/* Minimalist Thumbnail Strip */}
          <div className="px-4 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide p-2">
              {propertyImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 relative w-8 h-8 rounded-md overflow-hidden transition-all duration-200 ${
                    selectedImage === index ? "ring-2 ring-cyan-400 scale-95" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Property thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Property Overview */}
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{propertyData.name}</h1>
            <div className="flex items-center text-slate-400 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{propertyData.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-cyan-400" />
              <span>{propertyData.features.bedrooms} Bedroom</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-cyan-400" />
              <span>{propertyData.features.bathrooms} Bathroom</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4 text-cyan-400" />
              <span>{propertyData.features.sqft} sqft</span>
            </div>
          </div>

          <div className="text-3xl font-bold text-cyan-400">
            ${propertyData.price.amount} /{propertyData.price.period}
          </div>

          {/* Want to Know More Link */}
          <Button variant="link" className="text-cyan-400 p-0 h-auto font-normal">
            View Full Listing Details →
          </Button>
        </div>

        {/* Creative Grid Layout */}
        <div className="px-4 grid grid-cols-6 gap-3 auto-rows-min">
          {/* Match Score Card - Large Feature Card */}
          <Card className="col-span-6 bg-slate-800/20 border-slate-600 text-white">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Match Score</span>
                <div className="flex items-center gap-2">
                  <Progress value={propertyData.matching.score} className="w-20 h-2 bg-slate-800" />
                  <span className="text-cyan-400 font-bold">{propertyData.matching.score}%</span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">{propertyData.matching.explanation}</p>

              <div className="flex flex-wrap gap-2">
                {propertyData.matching.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant={"secondary"}
                    className={cn(
                      {
                        cyan: "bg-cyan-900 text-cyan-100 hover:bg-cyan-800 hover:text-cyan-200",
                        green: "bg-green-900 text-green-100 hover:bg-green-800 hover:text-green-200",
                        blue: "bg-blue-900 text-blue-100 hover:bg-blue-800 hover:text-blue-200",
                        purple: "bg-purple-900 text-purple-100 hover:bg-purple-800 hover:text-purple-200",
                      }[badge.color] || "bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Australia Level - Medium Card */}
          <Card className="col-span-3 bg-slate-800/20 border-slate-700 hover:bg-slate-750 transition-colors">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm text-cyan-400">Australia-Based</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">
                    ${(propertyData.criteria.level1.data.nationalAvgPrice / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-slate-400">National Avg</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    +{propertyData.criteria.level1.data.annualGrowth}%
                  </div>
                  <div className="text-xs text-slate-400">Growth</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white">
                  <span>Market Stability</span>
                  <span className="text-green-400">{propertyData.criteria.level1.data.marketStability.label}</span>
                </div>
                <Progress
                  value={propertyData.criteria.level1.data.marketStability.score}
                  className="h-1 bg-slate-800"
                />
              </div>
            </CardContent>
          </Card>

          {/* City Level - Medium Card */}
          <Card className="col-span-3 bg-slate-800/20 border-slate-700 hover:bg-slate-750 transition-colors">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm text-cyan-400">City-Based</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">
                    ${(propertyData.criteria.level2.data.cityAvgPrice / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-slate-400">City Avg</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    +{propertyData.criteria.level2.data.cityGrowth}%
                  </div>
                  <div className="text-xs text-slate-400">Growth</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white">
                  <span>Transport Score</span>
                  <span className="text-green-400">{propertyData.criteria.level2.data.transportScore.label}</span>
                </div>
                <Progress value={propertyData.criteria.level2.data.transportScore.score} className="h-1 bg-slate-800" />
              </div>
            </CardContent>
          </Card>

          {/* Suburb Stats - Tall Card */}
          <Card className="col-span-2 row-span-2 bg-slate-800/20 border-slate-700 hover:bg-slate-750 transition-colors text-white">
            <CardContent className="p-4 space-y-4">
              <h4 className="font-medium text-sm text-cyan-400">Suburb Stats</h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">
                    ${(propertyData.criteria.level3.data.suburbAvgPrice / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-slate-400">Suburb Avg Price</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">
                    {propertyData.criteria.level3.data.schoolRating}/10
                  </div>
                  <div className="text-xs text-slate-400">School Rating</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Crime Rate</span>
                    <span className="text-green-400">{propertyData.criteria.level3.data.crimeRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Walkability</span>
                    <span className="text-yellow-400">{propertyData.criteria.level3.data.walkability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recent Sales</span>
                    <span className="text-cyan-400">{propertyData.criteria.level3.data.recentSales}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Yield - Square Card */}
          <Card className="col-span-2 bg-green-600/20 border-green-800">
            <CardContent className="p-4 text-center space-y-2">
              <div className="text-2xl font-bold text-green-400">
                {propertyData.investment.projections.rentalYield}%
              </div>
              <div className="text-xs text-slate-400">Rental Yield</div>
              <div className="text-xs text-green-300">5-Year Projection</div>
            </CardContent>
          </Card>

          {/* Capital Growth - Square Card */}
          <Card className="col-span-2 bg-cyan-600/20 border-cyan-800">
            <CardContent className="p-4 text-center space-y-2">
              <div className="text-2xl font-bold text-cyan-400">
                ${(propertyData.investment.projections.capitalGrowth / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-slate-400">Capital Growth</div>
              <div className="text-xs text-cyan-300">5-Year Projection</div>
            </CardContent>
          </Card>

          {/* Investment Controls - Wide Card */}
          <Card className="col-span-4 bg-slate-800/20 border-slate-700">
            <CardContent className="p-4 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-white">
                <Calculator className="h-4 w-4 text-cyan-400" />
                Investment Calculator
              </h4>
              <div className="grid grid-cols-2 gap-3 text-white">
                <div className="space-y-1">
                  <Label htmlFor="rental-growth" className="text-xs">
                    Rental Growth (%)
                  </Label>
                  <Input
                    id="rental-growth"
                    type="number"
                    value={rentalGrowth}
                    onChange={(e) => setRentalGrowth(Number(e.target.value))}
                    className="bg-slate-700 border-slate-600 h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maintenance" className="text-xs">
                    Maintenance ($)
                  </Label>
                  <Input
                    id="maintenance"
                    type="number"
                    value={maintenanceCost}
                    onChange={(e) => setMaintenanceCost(Number(e.target.value))}
                    className="bg-slate-700 border-slate-600 h-8 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Summary - Wide Card */}
          <Card className="col-span-6 bg-green-600/20 border-green-800/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <Calculator className="h-4 w-4" />
                  Investment Score: {propertyData.investment.score.rating}
                </div>
                <div className="text-sm font-semibold text-green-400">
                  Break-even: {propertyData.investment.projections.breakEvenPoint}
                </div>
              </div>
              <p className="text-xs text-green-300">{propertyData.investment.score.description}</p>
              <div className="flex justify-between items-center text-xs text-white">
                <span >Total Maintenance (5yr): ${(maintenanceCost * 5).toLocaleString()}</span>
                <span>Monthly Loan: ${propertyData.investment.projections.monthlyLoanRepayment.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4">
        <div className="flex gap-3">
          <Button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white">
            <Users className="h-4 w-4 mr-2" />
            Consult Agents
          </Button>
          <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white">
            <Phone className="h-4 w-4 mr-2" />
            Proceed Further
          </Button>
        </div>
      </div>
    </div>
  )
}
