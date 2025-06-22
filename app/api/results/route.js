import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Result from "@/models/Result"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    // Build query
    const query = { user: user.userId }
    console.log("examId:", examId)
    if (examId) {
      query.exam = examId
    }

    // Get results with pagination
    const skip = (page - 1) * limit
    const results = await Result.find(query)
      .populate("exam", "title category type totalMarks totalQuestions")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)

      console.log("Results fetched:", results)

    // Get total count for pagination
    const totalResults = await Result.countDocuments(query)

    // Calculate statistics
    const allUserResults = await Result.find({ userId: user.userId })
    const stats = {
      totalExams: allUserResults.length,
      averageScore:
        allUserResults.length > 0
          ? Math.round(allUserResults.reduce((sum, r) => sum + r.score, 0) / allUserResults.length)
          : 0,
      bestScore: allUserResults.length > 0 ? Math.max(...allUserResults.map((r) => r.score)) : 0,
      totalTime: allUserResults.reduce((sum, r) => sum + (r.timeTaken || 0), 0),
      passedExams: allUserResults.filter((r) => r.isPassed).length,
      recentTrend: 0, // Calculate based on recent vs older results
    }

    console.log("Stats calculated:", stats)

    // Calculate recent trend (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    const recentResults = allUserResults.filter((r) => new Date(r.submittedAt) >= thirtyDaysAgo)
    const previousResults = allUserResults.filter(
      (r) => new Date(r.submittedAt) >= sixtyDaysAgo && new Date(r.submittedAt) < thirtyDaysAgo,
    )

    if (recentResults.length > 0 && previousResults.length > 0) {
      const recentAvg = recentResults.reduce((sum, r) => sum + r.score, 0) / recentResults.length
      const previousAvg = previousResults.reduce((sum, r) => sum + r.score, 0) / previousResults.length
      stats.recentTrend = Math.round(recentAvg - previousAvg)
    }

    // Format results for frontend
    const formattedResults = results.map((result) => ({
      _id: result._id,
      examId: result.exam._id,
      exam: {
        title: result.exam.title,
        category: result.exam.category,
        type: result.exam.type,
        totalMarks: result.exam.totalMarks,
        totalQuestions: result.exam.totalQuestions,
      },
      score: result.score,
      obtainedMarks: result.obtainedMarks,
      totalMarks: result.totalMarks,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      unattempted: result.unattempted,
      totalQuestions: result.totalQuestions,
      timeTaken: result.timeTaken,
      isPassed: result.isPassed,
      submittedAt: result.submittedAt,
    }))

    return NextResponse.json({
      results: formattedResults,
      stats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        hasNext: page < Math.ceil(totalResults / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get results error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
