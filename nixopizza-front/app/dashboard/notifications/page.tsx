import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NotificationsHeader } from "@/components/notifications/notifications-header"
import { NotificationsList } from "@/components/notifications/notifications-list"
import { NotificationsStats } from "@/components/notifications/notifications-stats"

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <NotificationsHeader />
        <NotificationsList />
      </div>
    </DashboardLayout>
  )
}
