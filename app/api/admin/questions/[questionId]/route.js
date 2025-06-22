import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Question from "@/models/Question"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const question = await Question.findById(params.questionId)
      .populate("category", "name code icon color")
      .populate("createdBy", "name email")

    if (!question) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("Get question error:", error)
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

    const questionData = await request.json()

    // Validate required fields
    const requiredFields = ["category", "examName", "sectionName", "subject", "questionText", "correctAnswer"]
    const missingFields = requiredFields.filter(
      (field) => !questionData[field] || !questionData[field].toString().trim(),
    )

    if (missingFields.length > 0) {
      return NextResponse.json({ message: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Validate MCQ questions
    if (questionData.type === "mcq") {
      if (!questionData.options || !Array.isArray(questionData.options) || questionData.options.length < 2) {
        return NextResponse.json({ message: "MCQ questions must have at least 2 options" }, { status: 400 })
      }

      if (!questionData.options.includes(questionData.correctAnswer)) {
        return NextResponse.json({ message: "Correct answer must be one of the provided options" }, { status: 400 })
      }
    }

    const question = await Question.findByIdAndUpdate(params.questionId, questionData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name code icon color")
      .populate("createdBy", "name email")

    if (!question) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("Update question error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Find the question first to get exam information
    const question = await Question.findById(params.questionId)
    if (!question) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 })
    }

    // Remove question from exam sections
    if (question.examName && question.sectionName) {
      try {
        await Exam.updateMany(
          {
            "sections.questionIds": params.questionId,
          },
          {
            $pull: {
              "sections.$.questionIds": params.questionId,
            },
          },
        )
      } catch (examError) {
        console.error("Error removing question from exam sections:", examError)
      }
    }

    // Soft delete the question
    await Question.findByIdAndUpdate(params.questionId, { isActive: false })

    return NextResponse.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Delete question error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
