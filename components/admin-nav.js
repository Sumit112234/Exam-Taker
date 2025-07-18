"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  FileText,
  BookOpen,
  Users,
  Settings,
  CreditCard,
  FolderOpen,
  Database,
  BookMarked,
  GraduationCap,
} from "lucide-react"

const items = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderOpen,
  },
  {
    title: "Exams",
    href: "/admin/exams",
    icon: BookOpen,
  },
  {
    title: "Questions",
    href: "/admin/questions",
    icon: FileText,
  },
  {
    title: "Question Bank",
    href: "/admin/question-bank",
    icon: Database,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Results",
    href: "/admin/results",
    icon: GraduationCap,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-2 p-4">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              (pathname === item.href || pathname.startsWith(`${item.href}/`)) && "bg-primary text-primary-foreground",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}
    </div>
  )
}
