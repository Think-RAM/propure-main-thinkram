interface Stat {
  label: string
  value: string | number
}

interface PropertyStatsProps {
  stats: Stat[]
}

export default function PropertyStats({ stats }: PropertyStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
          <div className="text-xs text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
