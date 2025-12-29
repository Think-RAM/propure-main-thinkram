"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PropertyHeaderProps {
  title: string
  isFavorited: boolean
  onToggleFavorite: () => void
}

export default function PropertyHeader({ title, isFavorited, onToggleFavorite }: PropertyHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <Button variant="ghost" size="sm" onClick={onToggleFavorite} className="p-2">
        <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      </Button>
    </div>
  )
}
