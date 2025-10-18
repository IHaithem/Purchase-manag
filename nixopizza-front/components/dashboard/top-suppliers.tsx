import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Building2, Package, DollarSign } from "lucide-react"

const suppliers = [
  {
    name: "Audio Tech Co.",
    products: 15,
    totalValue: 12450.75,
    performance: 95,
    status: "Excellent",
  },
  {
    name: "Mobile Accessories",
    products: 22,
    totalValue: 8920.5,
    performance: 88,
    status: "Good",
  },
  {
    name: "Cable Solutions",
    products: 8,
    totalValue: 3240.25,
    performance: 92,
    status: "Excellent",
  },
  {
    name: "Storage Pro",
    products: 12,
    totalValue: 15680.0,
    performance: 85,
    status: "Good",
  },
]

export function TopSuppliers() {
  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-secondary"
    return "text-destructive"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Top Suppliers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers.map((supplier, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{supplier.name}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {supplier.products} orders
                    </div>
                    <div className="flex items-center gap-1">
                      {supplier.totalValue.toLocaleString()} DZA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
