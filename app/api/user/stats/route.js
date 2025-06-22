import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Result from "@/models/Result"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const results = await Result.find({ user: currentUser.userId })

    const totalExams = results.length
    const averageScore =
      totalExams > 0 ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / totalExams) : 0

    const totalTime = results.reduce((sum, result) => {
      return sum + (result.timeSpent || 0)
    }, 0)

    return NextResponse.json({
      totalExams,
      averageScore,
      totalTime,
      achievements: [], // Can be expanded with actual achievement logic
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
