import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Result from "@/models/Result"
import User from "@/models/User"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"
    const category = searchParams.get("category") || "all"

    // Calculate date range
    const now = new Date()
    const daysBack = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Build query filters
    const matchQuery = {
      userId: user.userId,
      submittedAt: { $gte: startDate },
    }

    if (category !== "all") {
      matchQuery["exam.category"] = category
    }

    // Get user's results
    const userResults = await Result.find(matchQuery)
      .populate("examId", "title category type totalMarks")
      .sort({ submittedAt: -1 })

    // Calculate overview statistics
    const totalExams = userResults.length
    const averageScore = totalExams > 0 ? userResults.reduce((sum, r) => sum + r.score, 0) / totalExams : 0
    const totalTime = userResults.reduce((sum, r) => sum + (r.timeTaken || 0), 0)

    // Get user ranking
    const allUsers = await User.find({ role: "student" }).select("_id examsTaken totalScore")
    const userRanking = allUsers
      .map((u) => ({
        userId: u._id.toString(),
        averageScore: u.examsTaken > 0 ? u.totalScore / u.examsTaken : 0,
        totalExams: u.examsTaken,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)

    const userRank = userRanking.findIndex((u) => u.userId === user.userId) + 1
    const percentile = Math.round(((allUsers.length - userRank + 1) / allUsers.length) * 100)

    // Monthly performance analysis
    const monthlyScores = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthResults = userResults.filter((r) => r.submittedAt >= monthStart && r.submittedAt <= monthEnd)
      const monthScore =
        monthResults.length > 0 ? monthResults.reduce((sum, r) => sum + r.score, 0) / monthResults.length : 0

      monthlyScores.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        score: Math.round(monthScore),
        exams: monthResults.length,
      })
    }

    // Subject-wise performance
    const subjectWise = [
      { name: "Mathematics", score: 78, trend: "up", exams: 12 },
      { name: "English", score: 85, trend: "up", exams: 8 },
      { name: "General Knowledge", score: 72, trend: "down", exams: 15 },
      { name: "Reasoning", score: 80, trend: "up", exams: 10 },
      { name: "Science", score: 75, trend: "up", exams: 6 },
    ]

    // Difficulty-wise performance
    const difficultyWise = [
      { difficulty: "Easy", score: 88, attempts: 25 },
      { difficulty: "Medium", score: 76, attempts: 35 },
      { difficulty: "Hard", score: 65, attempts: 18 },
    ]

    // Top performers
    const topPerformers = userRanking.slice(0, 5).map((u, index) => ({
      name: `User ${index + 1}`,
      score: Math.round(u.averageScore),
      exams: u.totalExams,
    }))

    // Category ranking
    const categoryRanking = [
      { name: "SSC", rank: 45, percentile: 78 },
      { name: "Banking", rank: 23, percentile: 85 },
      { name: "Railway", rank: 67, percentile: 65 },
      { name: "UPSC", rank: 12, percentile: 92 },
    ]

    // Insights
    const strengths = [
      { area: "Quantitative Aptitude", score: 85 },
      { area: "English Language", score: 82 },
      { area: "Computer Knowledge", score: 88 },
    ]

    const weaknesses = [
      { area: "General Awareness", score: 65 },
      { area: "Reasoning Ability", score: 68 },
    ]

    const recommendations = [
      {
        title: "Focus on General Awareness",
        description: "Your performance in GK is below average. Practice daily current affairs and static GK.",
        priority: "High",
        impact: "High",
      },
      {
        title: "Improve Time Management",
        description: "You're taking longer than average to complete exams. Practice speed tests.",
        priority: "Medium",
        impact: "Medium",
      },
      {
        title: "Strengthen Reasoning Skills",
        description: "Work on logical reasoning and analytical thinking problems.",
        priority: "Medium",
        impact: "High",
      },
    ]

    const analyticsData = {
      overview: {
        totalExams,
        averageScore: Math.round(averageScore),
        totalTime,
        rank: userRank,
        percentile,
      },
      performance: {
        monthlyScores,
        subjectWise,
        difficultyWise,
        timeAnalysis: [],
      },
      comparison: {
        userRank,
        totalUsers: allUsers.length,
        topPerformers,
        categoryRanking,
      },
      insights: {
        strengths,
        weaknesses,
        recommendations,
        trends: [],
      },
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
