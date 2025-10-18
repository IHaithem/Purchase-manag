import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ShoppingCart, AlertTriangle } from "lucide-react"

const activities = [
  {
    type: "product",
    message: 'Product "Wireless Headphones" updated',
    time: "2 minutes ago",
    icon: Package,
    color: "text-primary",
  },
  {
    type: "supplier",
    message: 'New supplier "Tech Solutions" added',
    time: "1 hour ago",
    icon: Users,
    color: "text-secondary",
  },
  {
    type: "alert",
    message: 'Low stock alert for "USB Cables"',
    time: "3 hours ago",
    icon: AlertTriangle,
    color: "text-destructive",
  },
  {
    type: "order",
    message: "Purchase order PO-001 confirmed",
    time: "5 hours ago",
    icon: ShoppingCart,
    color: "text-green-600",
  },
  {
    type: "product",
    message: 'Product "Phone Case" stock updated',
    time: "1 day ago",
    icon: Package,
    color: "text-primary",
  },
]

export function RecentActivity() {
  return (
    <Card className="h-full max-h-[435px] overflow-y-auto">
      <CardHeader>
        <CardTitle className="font-heading">Recent Activity</CardTitle>
        <CardDescription>Latest updates in your inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                <activity.icon className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
