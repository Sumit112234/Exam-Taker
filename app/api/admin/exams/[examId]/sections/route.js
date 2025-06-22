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

    const exam = await Exam.findById(params.examId).select("sections")

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam.sections || [])
  } catch (error) {
    console.error("Get sections by exam error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
