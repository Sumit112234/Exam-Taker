import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const exams = await Exam.find({
      category: params.categoryId,
      isActive: true,
    })
      .select("_id title type description sections")
      .sort({ createdAt: -1 })

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Get exams by category error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
