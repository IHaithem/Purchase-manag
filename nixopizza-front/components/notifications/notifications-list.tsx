"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, ShoppingCart, Users, Clock, CheckCircle, X } from "lucide-react"
import { useEffect, useState } from "react"
import { get_all_notifications } from "@/lib/apis/notifications"

interface Notification {
  id: string
  title: string
  message: string
  type: "critical" | "warning" | "info" | "success"
  category: "inventory" | "orders" | "suppliers" | "system"
  timestamp: string
  isRead: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Critical Stock Alert",
    message: "iPhone 15 Pro is critically low (2 units remaining)",
    type: "critical",
    category: "inventory",
    timestamp: "2 minutes ago",
    isRead: false,
  },
  {
    id: "2",
    title: "Purchase Order Completed",
    message: "PO-2024-001 from Apple Inc. has been delivered",
    type: "success",
    category: "orders",
    timestamp: "1 hour ago",
    isRead: false,
  },
  {
    id: "3",
    title: "New Supplier Added",
    message: "Samsung Electronics has been added to your supplier directory",
    type: "info",
    category: "suppliers",
    timestamp: "3 hours ago",
    isRead: true,
  },
  {
    id: "4",
    title: "Low Stock Warning",
    message: "5 products are running low on stock",
    type: "warning",
    category: "inventory",
    timestamp: "5 hours ago",
    isRead: false,
  },
  {
    id: "5",
    title: "System Maintenance",
    message: "Scheduled maintenance completed successfully",
    type: "info",
    category: "system",
    timestamp: "1 day ago",
    isRead: true,
  },
  {
    id: "6",
    title: "Purchase List Generated",
    message: "Weekly purchase list has been automatically generated",
    type: "info",
    category: "orders",
    timestamp: "2 days ago",
    isRead: true,
  },
]

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all")

  const getIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return Package
      case "orders":
        return ShoppingCart
      case "suppliers":
        return Users
      default:
        return AlertTriangle
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead
    if (filter === "critical") return notification.type === "critical"
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }
  const fetchNotifications = async () => {
    const data = await get_all_notifications()
    console.log(data)
    //setNotifications(data)
  }
  useEffect(() => {
    fetchNotifications()
  }, [])
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Notifications</CardTitle>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>
              Unread
            </Button>
            <Button
              variant={filter === "critical" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("critical")}
            >
              Critical
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.category)
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  notification.isRead ? "bg-muted/30" : "bg-background"
                }`}
              >
                <div className="p-2 rounded-full bg-muted">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-medium ${!notification.isRead ? "font-semibold" : ""}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => dismissNotification(notification.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {notification.timestamp}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
