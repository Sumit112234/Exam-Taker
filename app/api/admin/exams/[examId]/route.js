import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"
import Question from "@/models/Question"



export async function DELETE(request, { params }) {
  try {
    await connectDB()

    // Check authentication and authorization
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Find the exam first
    const exam = await Exam.findById(params.examId)
    
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    // Collect all question IDs from all sections
    const allQuestionIds = []
    exam.sections.forEach(section => {
      if (section.questionIds && section.questionIds.length > 0) {
        allQuestionIds.push(...section.questionIds)
      }
    })

    // Delete the exam
    await Exam.findByIdAndDelete(params.examId)

    // If there are questions associated with this exam, delete them too
    if (allQuestionIds.length > 0) {
      await Question.deleteMany({
        _id: { $in: allQuestionIds }
      })
    }

    return NextResponse.json({ 
      message: "Exam and associated questions deleted successfully",
      deletedQuestionsCount: allQuestionIds.length
    })
  } catch (error) {
    console.error("Delete exam error:", error)
    return NextResponse.json({ 
      message: "Internal server error",
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const exam = await Exam.findById(params.examId)
      .populate("category", "name code icon color")
      .populate("createdBy", "name email")

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Get exam error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const examData = await request.json()

    const exam = await Exam.findByIdAndUpdate(params.examId, examData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name code icon color")
      .populate("createdBy", "name email")

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Update exam error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}