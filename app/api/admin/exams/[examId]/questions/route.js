import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { examId } = params
    const { questionId } = await request.json()

    const exam = await Exam.findByIdAndUpdate(examId, { $addToSet: { questions: questionId } }, { new: true })

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Question added to exam successfully" })
  } catch (error) {
    console.error("Add question to exam error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
