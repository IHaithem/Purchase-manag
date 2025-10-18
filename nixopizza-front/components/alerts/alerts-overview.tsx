import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

export function AlertsOverview({
  critical,
  high,
  medium,
}: {
  critical: number;
  high: number;
  medium: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Critical */}
      <Card className="border-l-4 border-l-destructive/30 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Critical Alerts
            </CardTitle>
            <div className="rounded-lg bg-destructive/10 p-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{critical}</div>
          <p className="text-xs text-muted-foreground mt-1">Out of stock</p>
        </CardContent>
      </Card>

      {/* High Priority */}
      <Card className="border-l-4 border-l-orange-500/30 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              High Priority
            </CardTitle>
            <div className="rounded-lg bg-orange-500/10 p-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{high}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Below 50% of min threshold
          </p>
        </CardContent>
      </Card>

      {/* Medium Priority */}
      <Card className="border-l-4 border-l-amber-500/30 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Medium Priority
            </CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Package className="h-4 w-4 text-amber-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{medium}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Below min threshold
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
