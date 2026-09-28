"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  BookOpen,
  Clock,
  CreditCard,
  HelpCircle,
  User,
} from "lucide-react"

const items = [
  { title: "Dashboard", href: "/u/dashboard", icon: BarChart3 },
  { title: "Exams", href: "/u/exams", icon: BookOpen },
  { title: "Results", href: "/u/results", icon: Clock },
  { title: "Profile", href: "/u/profile", icon: User },
  { title: "Subscriptions", href: "/u/subscriptions", icon: CreditCard },
  { title: "Help", href: "/u/help", icon: HelpCircle },
]

export function DashboardNav({ onNavigate }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/")
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#1D4FE0] text-white shadow-[0_2px_0_0_#1237A6]"
                : "text-[#56637F] hover:bg-[#F3F6FB] hover:text-[#0C1A3A]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}