import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { examId } = params

    console.log(examId ? `Fetching exam with ID: ${examId}` : "Exam ID not provided")

    const exam = await Exam.findById(examId).populate("sections.questionIds")

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Get exam error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
