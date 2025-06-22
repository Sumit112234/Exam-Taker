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

    console.log("Current user:", user)

    // Fetch only examId and resultId for the current user
    const results = await Result.find({ user: user.userId }, { exam: 1 }).lean()

    // Map to desired format
    const data = results.map((result) => ({
      resultId: result._id,
      examId: result.exam,
    }))

    return NextResponse.json({ results: data })
  } catch (error) {
    console.error("Error fetching result IDs and exam IDs:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
