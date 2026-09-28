"use client"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"

const EASE = [0.16, 1, 0.3, 1]

export default function Layout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <>{children}</>
  )
}