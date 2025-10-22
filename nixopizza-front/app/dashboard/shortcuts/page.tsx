// app/dashboard/shortcuts/page.tsx
"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ShortcutsGrid } from "@/components/shortcuts/shortcuts-grid";

export default function ShortcutsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quick Filters</h1>
            <p className="text-muted-foreground">
              Access frequently used filters with one click
            </p>
          </div>
        </div>
        <ShortcutsGrid />
      </div>
    </DashboardLayout>
  );
}