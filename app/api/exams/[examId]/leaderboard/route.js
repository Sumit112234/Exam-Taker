import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Result from "@/models/Result"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { examId } = params
    const user = await getCurrentUser()

    // Get top results for this exam
    const results = await Result.find({ exam: examId })
      .populate("user", "name email")
      .sort({ score: -1, submittedAt: 1 })
      .limit(50)

    // Create leaderboard with rankings
    const leaderboard = results.map((result, index) => ({
      rank: index + 1,
      userId: result.user._id.toString(),
      userName: result.user.name,
      score: result.score,
      timeTaken: result.timeTaken,
      submittedAt: result.submittedAt,
    }))

    // Find current user's rank
    let userRank = null
    if (user) {
      const userResult = results.find((r) => r.user._id.toString() === user.userId)
      if (userResult) {
        const rank = results.findIndex((r) => r.user._id.toString() === user.userId) + 1
        const totalParticipants = results.length
        const percentile = Math.round(((totalParticipants - rank + 1) / totalParticipants) * 100)

        userRank = {
          rank,
          totalParticipants,
          percentile,
          score: userResult.score,
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      userRank,
      totalParticipants: results.length,
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
