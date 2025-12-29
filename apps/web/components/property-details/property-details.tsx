import { Star } from "lucide-react"

interface PropertyDetailsProps {
  rating: number
  reviewCount: number
  price: number
  period: string
  description: string
}

export default function PropertyDetails({ rating, reviewCount, price, period, description }: PropertyDetailsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm font-medium">{rating}</span>
          </div>
          <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">${price}</div>
          <div className="text-sm text-gray-500">{period}</div>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
