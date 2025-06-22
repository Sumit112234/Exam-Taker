import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Mock data for now - replace with actual calculations
    const stats = {
      totalRevenue: 15420,
      activeSubscriptions: 234,
      monthlyGrowth: 12,
      churnRate: 3.2,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get subscription stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
