"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function AdminBreadcrumb() {
  const pathname = usePathname()

  if (!pathname.startsWith("/admin") || pathname === "/admin") {
    return null
  }

  const pathSegments = pathname.split("/").filter(Boolean)

  return (
    <nav className="flex mb-4 text-sm text-muted-foreground">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/admin" className="hover:text-foreground flex items-center">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {pathSegments.slice(1).map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 2).join("/")}`
          const isLast = index === pathSegments.slice(1).length - 1

          return (
            <li key={segment} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              {isLast ? (
                <span className="capitalize text-foreground font-medium">{segment.replace(/-/g, " ")}</span>
              ) : (
                <Link href={href} className="hover:text-foreground capitalize">
                  {segment.replace(/-/g, " ")}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
