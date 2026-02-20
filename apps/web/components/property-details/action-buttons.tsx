import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, Calendar, Share } from "lucide-react"

export default function ActionButtons() {
  const actions = [
    { icon: Phone, label: "Call", variant: "outline" as const },
    { icon: MessageCircle, label: "Message", variant: "outline" as const },
    { icon: Calendar, label: "Schedule", variant: "default" as const },
    { icon: Share, label: "Share", variant: "outline" as const },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant}
          size="sm"
          className="flex flex-col items-center space-y-1 h-auto py-3"
        >
          <action.icon className="h-4 w-4" />
          <span className="text-xs">{action.label}</span>
        </Button>
      ))}
    </div>
  )
}
