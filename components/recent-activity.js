"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    user: "John Doe",
    action: "Completed IBPS PO Mock Test",
    time: "2 hours ago",
    score: "78/100",
    type: "test-complete",
  },
  {
    user: "Jane Smith",
    action: "Registered new account",
    time: "4 hours ago",
    type: "registration",
  },
  {
    user: "Mike Johnson",
    action: "Started SBI Clerk Mock Test",
    time: "6 hours ago",
    type: "test-start",
  },
  {
    user: "Sarah Wilson",
    action: "Purchased Premium Plan",
    time: "8 hours ago",
    type: "purchase",
  },
  {
    user: "Robert Brown",
    action: "Completed SSC CGL Practice Test",
    time: "10 hours ago",
    score: "65/100",
    type: "test-complete",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity, i) => (
        <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`/placeholder.svg?height=36&width=36`} alt={activity.user} />
              <AvatarFallback>
                {activity.user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{activity.user}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{activity.action}</p>
                {activity.score && (
                  <Badge variant="outline" className="text-xs">
                    {activity.score}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{activity.time}</span>
        </div>
      ))}
    </div>
  )
}
