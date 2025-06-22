import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const totalUsers = await User.countDocuments({})
    const activeUsers = await User.countDocuments({ "subscription.status": "active" })
    const premiumUsers = await User.countDocuments({
      "subscription.status": "active",
      "subscription.plan": { $ne: "Basic" },
    })

    // Users created this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    })

    return NextResponse.json({
      totalUsers,
      activeUsers,
      premiumUsers,
      newUsersThisMonth,
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
