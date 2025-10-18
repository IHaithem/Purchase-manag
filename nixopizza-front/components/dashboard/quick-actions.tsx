import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Zap, Package, BarChart3 } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    title: "Add New Product",
    description: "Create a new product entry",
    icon: Plus,
    href: "/dashboard/products",
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "Generate Purchase List",
    description: "Create orders for low stock items",
    icon: Zap,
    href: "/dashboard/purchases",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    title: "Update Stock Levels",
    description: "Bulk update product quantities",
    icon: Package,
    href: "/dashboard/products",
    color: "bg-muted text-muted-foreground",
  },
  {
    title: "View Reports",
    description: "Analyze inventory performance",
    icon: BarChart3,
    href: "/dashboard",
    color: "bg-accent text-accent-foreground",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Quick Actions</CardTitle>
        <CardDescription>Common tasks to get you started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent hover:bg-muted/50"
            >
              <Link href={action.href}>
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
