import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Result from "@/models/Result"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"
import Category from "@/models/Category"

export async function GET() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user's recent results with proper population
    const recentResults = await Result.find({ user: currentUser.userId })
      .populate({
        path: "exam",
        select: "title category examName type",
        populate: {
          path: "category",
          select: "name code icon color",
        },
      })
      .sort({ submittedAt: -1 })
      .limit(5)

    // Calculate comprehensive stats
    const totalExams = await Result.countDocuments({ user: currentUser.userId })
    const allResults = await Result.find({ user: currentUser.userId })

    let averageScore = 0
    let totalStudyTime = 0
    let bestScore = 0
    let recentImprovement = 0

    if (allResults.length > 0) {
      const totalScore = allResults.reduce((sum, result) => sum + result.score, 0)
      averageScore = Math.round(totalScore / allResults.length)

      // Calculate best score
      bestScore = Math.max(...allResults.map((result) => result.score))

      // Calculate total study time (convert seconds to hours)
      totalStudyTime = allResults.reduce((sum, result) => {
        const timeSpent = result.timeTaken || 0
        return sum + timeSpent / 60 // Convert minutes to hours
      }, 0)

      // Calculate recent improvement (last 5 vs previous 5)
      if (allResults.length >= 2) {
        const recent5 = allResults.slice(0, Math.min(5, allResults.length))
        const previous5 = allResults.slice(5, Math.min(10, allResults.length))

        if (previous5.length > 0) {
          const recentAvg = recent5.reduce((sum, r) => sum + r.score, 0) / recent5.length
          const previousAvg = previous5.reduce((sum, r) => sum + r.score, 0) / previous5.length
          recentImprovement = Math.round(recentAvg - previousAvg)
        }
      }
    }

    // Get recommended exams based on user's category preferences
    const userCategories = [...new Set(allResults.map((r) => r.exam?.category?.toString()).filter(Boolean))]

    let recommendedExams = []
    if (userCategories.length > 0) {
      recommendedExams = await Exam.find({
        isActive: true,
        "visibility.isPublished": true,
        category: { $in: userCategories },
      })
        .populate("category", "name code icon color")
        .limit(3)
        .select("title category examName type difficulty totalQuestions totalDuration")
    } else {
      // If no history, recommend popular free exams
      recommendedExams = await Exam.find({
        isActive: true,
        "visibility.isPublished": true,
        "visibility.isFree": true,
      })
        .populate("category", "name code icon color")
        .limit(3)
        .select("title category examName type difficulty totalQuestions totalDuration")
    }

    // Format recent exams with enhanced data
    const recentExams = recentResults.map((result) => ({
      id: result._id,
      name: result.exam?.title || "Unknown Exam",
      category: result.exam?.category?.name || "Unknown Category",
      examName: result.exam?.examName || "",
      date: result.submittedAt.toLocaleDateString(),
      score: result.score,
      status: result.isPassed ? "Passed" : "Failed",
      resultId: result._id,
      timeTaken: result.timeTaken,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
    }))

    // Get category-wise performance
    const categoryPerformance = {}
    allResults.forEach((result) => {
      if (result.exam?.category) {
        const categoryName = result.exam.category.name || "Unknown"
        if (!categoryPerformance[categoryName]) {
          categoryPerformance[categoryName] = {
            totalAttempts: 0,
            totalScore: 0,
            bestScore: 0,
          }
        }
        categoryPerformance[categoryName].totalAttempts++
        categoryPerformance[categoryName].totalScore += result.score
        categoryPerformance[categoryName].bestScore = Math.max(
          categoryPerformance[categoryName].bestScore,
          result.score,
        )
      }
    })

    // Format category performance
    const categoryStats = Object.entries(categoryPerformance).map(([category, stats]) => ({
      category,
      averageScore: Math.round(stats.totalScore / stats.totalAttempts),
      bestScore: stats.bestScore,
      attempts: stats.totalAttempts,
    }))

    return NextResponse.json({
      stats: {
        totalExams,
        averageScore,
        bestScore,
        studyTime: Math.round(totalStudyTime * 10) / 10, // Round to 1 decimal
        improvement: recentImprovement,
      },
      recentExams,
      recommendedExams: recommendedExams.map((exam) => ({
        id: exam._id,
        title: exam.title,
        category: exam.category?.name || "Unknown",
        examName: exam.examName,
        type: exam.type,
        difficulty: exam.difficulty,
        totalQuestions: exam.totalQuestions,
        totalDuration: exam.totalDuration,
        categoryColor: exam.category?.color || "#6366f1",
      })),
      categoryStats,
      insights: {
        strongestCategory:
          categoryStats.length > 0
            ? categoryStats.reduce((prev, current) => (prev.averageScore > current.averageScore ? prev : current))
                .category
            : null,
        weakestCategory:
          categoryStats.length > 0
            ? categoryStats.reduce((prev, current) => (prev.averageScore < current.averageScore ? prev : current))
                .category
            : null,
        totalTimeSpent: Math.round(totalStudyTime),
        consistencyScore:
          allResults.length > 1
            ? Math.max(
                0,
                100 -
                  Math.sqrt(
                    allResults.reduce((sum, result) => sum + Math.pow(result.score - averageScore, 2), 0) /
                      allResults.length,
                  ),
              )
            : 100,
      },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
