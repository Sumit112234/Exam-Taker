import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Test from "@/models/Test"
import Question from "@/models/Question"
import TestAttempt from "@/models/TestAttempt"
import Subscription from "@/models/Subscription"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get basic stats
    const [totalUsers, totalTests, totalQuestions, totalAttempts, activeSubscriptions] = await Promise.all([
      User.countDocuments(),
      Test.countDocuments(),
      Question.countDocuments(),
      TestAttempt.countDocuments(),
      Subscription.countDocuments({ status: "active" }),
    ])

    // Calculate revenue (mock data for now)
    const revenue = activeSubscriptions * 10 // Assuming $10 average per subscription

    // Get daily attempts for chart
    const dailyAttempts = await TestAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          attempts: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          attempts: 1,
          _id: 0,
        },
      },
    ])

    // Mock weekly revenue data
    const weeklyRevenue = [
      { week: 1, revenue: 2500 },
      { week: 2, revenue: 2800 },
      { week: 3, revenue: 3200 },
      { week: 4, revenue: 3500 },
    ]

    // Get recent activity (mock data)
    const recentActivity = [
      { action: "New user registered", user: "John Doe", time: "2 minutes ago" },
      { action: "Test completed", user: "Jane Smith", time: "5 minutes ago" },
      { action: "Subscription purchased", user: "Mike Johnson", time: "10 minutes ago" },
      { action: "New test created", user: "Admin", time: "15 minutes ago" },
      { action: "Question added", user: "Admin", time: "20 minutes ago" },
    ]

    // Get top tests
    const topTests = await Test.aggregate([
      {
        $lookup: {
          from: "testattempts",
          localField: "_id",
          foreignField: "test",
          as: "attempts",
        },
      },
      {
        $addFields: {
          attemptCount: { $size: "$attempts" },
          avgScore: {
            $avg: "$attempts.score",
          },
        },
      },
      {
        $sort: { attemptCount: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          title: 1,
          attemptCount: 1,
          avgScore: { $round: ["$avgScore", 0] },
        },
      },
    ])

    // Get recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name email createdAt subscription")

    const dashboardData = {
      stats: {
        totalUsers,
        totalTests,
        totalQuestions,
        totalAttempts,
        revenue,
        activeSubscriptions,
      },
      charts: {
        dailyAttempts,
        weeklyRevenue,
        userGrowth: [], // Mock data can be added
        testPerformance: [], // Mock data can be added
      },
      recentActivity,
      topTests,
      recentUsers: recentUsers.map((user) => ({
        name: user.name,
        email: user.email,
        joined: user.createdAt,
        plan: user.subscription?.status === "active" ? "Premium" : "Free",
      })),
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
