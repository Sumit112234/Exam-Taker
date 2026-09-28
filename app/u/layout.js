"use client"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { usePathname } from "next/navigation"

const EASE = [0.16, 1, 0.3, 1]

export default function Layout({ children }) {

  const pathname = usePathname()

  // No layout for /u/exams/[examId] and anything under it
  const isExamRoute = /^\/u\/exams\/[^/]+/.test(pathname)

  if (isExamRoute) {
    return <>{children}</>   // ← render nothing but the page
  }
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-[#F3F6FB] text-[#0C1A3A]">
        {/* Sticky header */}
        <header className="sticky top-0 z-40 border-b border-[#DDE4F0] bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileNavOpen((o) => !o)}
                aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileNavOpen}
                className="grid h-9 w-9 place-items-center rounded-md text-[#0C1A3A] transition-colors hover:bg-[#F3F6FB] md:hidden"
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <h1 className="ep-display text-lg font-bold tracking-tight sm:text-xl">ExamPro</h1>
            </div>
            <UserNav />
          </div>
        </header>

        {/* Body grid */}
        <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:gap-10 lg:px-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-[220px] shrink-0 md:block lg:w-[240px]">
            <div className="sticky top-[calc(4rem+1.5rem)]">
              <DashboardNav />
            </div>
          </aside>

          {/* Main content — min-w-0 is critical for truncation & no overflow */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileNavOpen(false)}
                className="fixed inset-0 z-40 bg-[#0C1A3A]/40 backdrop-blur-sm md:hidden"
              />
              <motion.aside
                key="drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.32, ease: EASE }}
                className="fixed inset-y-0 left-0 z-50 w-[260px] overflow-y-auto border-r border-[#DDE4F0] bg-white md:hidden"
              >
                <div className="flex h-16 items-center justify-between border-b border-[#DDE4F0] px-4">
                  <span className="ep-display font-bold">Menu</span>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close menu"
                    className="grid h-9 w-9 place-items-center rounded-md text-[#0C1A3A] hover:bg-[#F3F6FB]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <DashboardNav onNavigate={() => setMobileNavOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}