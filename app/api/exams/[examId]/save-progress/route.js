import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { examId } = params
    const progressData = await request.json()

    // In a real implementation, you would save this to a database
    // For now, we'll just return success since we're using localStorage in the client

    return NextResponse.json({
      message: "Progress saved successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Save progress error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
