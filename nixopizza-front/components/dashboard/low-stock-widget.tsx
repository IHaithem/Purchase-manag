import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, ArrowRight } from "lucide-react"
import Link from "next/link"

const lowStockItems = [
  { name: "USB-C Cable 2m", stock: 3, priority: "Critical" },
  { name: "Wireless Mouse", stock: 0, priority: "Critical" },
  { name: "Phone Charger", stock: 0, priority: "Critical" },
  { name: "Bluetooth Speaker", stock: 4, priority: "High" },
  { name: "Screen Protector", stock: 12, priority: "Medium" },
]

export function LowStockWidget() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "destructive"
      case "High":
        return "secondary"
      case "Medium":
        return "default"
      default:
        return "default"
    }
  }

  return (
    <Card className="h-full max-h-[435px] overflow-y-auto">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.slice(0, 4).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-muted rounded">
                  <Package className="h-3 w-3" />
                </div>
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">Stock: {item.stock}</div>
                </div>
              </div>
              <Badge variant={getPriorityColor(item.priority) as any} className="text-xs">
                {item.priority}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button asChild variant="outline" className="w-full gap-2 bg-transparent">
            <Link href="/dashboard/alerts">
              View All Alerts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
