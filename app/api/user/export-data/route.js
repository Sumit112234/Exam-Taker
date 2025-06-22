import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Result from "@/models/Result"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user data
    const user = await User.findById(currentUser.userId).select("-password")

    // Get user's exam results
    const results = await Result.find({ user: currentUser.userId }).populate("exam", "title category")

    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        subscription: user.subscription,
        settings: user.settings,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
      },
      examResults: results.map((result) => ({
        examTitle: result.exam?.title,
        examCategory: result.exam?.category,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeSpent: result.timeSpent,
        completedAt: result.completedAt,
      })),
      exportedAt: new Date().toISOString(),
    }

    const jsonData = JSON.stringify(exportData, null, 2)

    return new NextResponse(jsonData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="exampro-data-${user.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Export data error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
