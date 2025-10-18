"use client"

import { Button } from "@/components/ui/button"
import { CheckCheck, Settings } from "lucide-react"

export function NotificationsHeader() {
  const handleMarkAllRead = () => {
    // In a real app, this would mark all notifications as read
    console.log("Marking all notifications as read")
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-heading font-bold text-balance">Notifications</h1>
        <p className="text-muted-foreground text-pretty">
          Stay updated with system alerts, inventory changes, and important updates
        </p>
      </div>
    </div>
  )
}
