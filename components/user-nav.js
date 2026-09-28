"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
  Crown,
  ChevronDown,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

export function UserNav() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isActive = user.subscription?.status === "active"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 gap-2 rounded-full px-1 pr-1 sm:pr-3 hover:bg-[#F3F6FB] data-[state=open]:bg-[#F3F6FB]"
        >
          <Avatar className="h-8 w-8 ring-2 ring-white">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-[#1D4FE0] text-xs font-bold text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          {/* Name + plan shown on ≥sm only — keeps mobile compact */}
          <span className="hidden min-w-0 flex-col items-start text-left sm:flex">
            <span className="max-w-[120px] truncate text-sm font-semibold leading-tight text-[#0C1A3A]">
              {user.name?.split(" ")[0] || "You"}
            </span>
            <span className="text-[10px] font-medium leading-tight text-[#56637F]">
              {isActive ? user.subscription.plan || "Premium" : "Free plan"}
            </span>
          </span>

          <ChevronDown className="hidden h-3.5 w-3.5 text-[#56637F] sm:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] max-w-72 overflow-hidden rounded-xl border border-[#DDE4F0] p-0 shadow-[0_20px_45px_-15px_rgba(12,26,58,0.3)]"
      >
        {/* User header */}
        <div className="flex items-center gap-3 border-b border-[#DDE4F0] bg-[#F8FAFD] p-3.5">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-[#1D4FE0] text-sm font-bold text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0C1A3A]">{user.name}</p>
            <p className="truncate text-xs text-[#56637F]">{user.email}</p>
          </div>
        </div>

        {/* Plan pill */}
        <div className="border-b border-[#DDE4F0] px-3.5 py-2.5">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              isActive
                ? "bg-[#E7F6EE] text-[#0C6B37]"
                : "bg-[#FFF6D6] text-[#7A5B00]"
            }`}
          >
            <Crown className="h-3 w-3" />
            {isActive
              ? `${user.subscription.plan || "Premium"} plan`
              : "Free plan · upgrade anytime"}
          </div>
        </div>

        {/* Menu items */}
        <DropdownMenuGroup className="p-1.5">
          <NavItem href="/u/profile" icon={User}>Profile</NavItem>
          <NavItem href="/u/subscriptions" icon={CreditCard}>Subscription</NavItem>
          <NavItem href="/u/settings" icon={Settings}>Settings</NavItem>
          <NavItem href="/u/help" icon={HelpCircle}>Help & Support</NavItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-0" />

        <div className="p-1.5">
          <DropdownMenuItem
            onClick={logout}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#A6282E] focus:bg-[#FDECEC] focus:text-[#A6282E]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* Small helper for consistent menu items */
function NavItem({ href, icon: Icon, children }) {
  return (
    <DropdownMenuItem asChild>
      <Link
        href={href}
        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#0C1A3A] focus:bg-[#F3F6FB] focus:text-[#1D4FE0]"
      >
        <Icon className="h-4 w-4 text-[#56637F]" />
        {children}
      </Link>
    </DropdownMenuItem>
  )
}