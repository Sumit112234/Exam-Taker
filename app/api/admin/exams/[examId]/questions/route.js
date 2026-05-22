import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import { getCurrentUser } from "@/lib/auth"


export async function POST(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    let param = await params
    const { examId } = param
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


export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { examId } = await params

    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get("sectionId")

    const exam = await Exam.findById(examId)
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    if (sectionId) {
  const section = exam.sections.find((s) => s.sectionId === sectionId)
  if (!section) {
    return NextResponse.json({ message: "Section not found" }, { status: 404 })
  }

  const questionIdsToDelete = [...section.questionIds]
  const { deletedCount } = await Question.deleteMany({ _id: { $in: questionIdsToDelete } })

  // ✅ Direct mutation
  exam.totalQuestions -= deletedCount
  section.questionIds = []
  section.questions = 0

  await exam.save()

  return NextResponse.json({
    message: `Deleted ${deletedCount} question(s) from section "${section.name}"`,
    sectionId,
    deletedCount,
  })

} else {
  const allQuestionIds = exam.sections.flatMap((s) => s.questionIds)
  const { deletedCount } = await Question.deleteMany({ _id: { $in: allQuestionIds } })

  // ✅ Direct mutation instead of map+spread
  exam.sections.forEach((section) => {
    section.questionIds = []
    
  })

  exam.totalQuestions = 0
  // exam.totalMarks = 0

  await exam.save()

  return NextResponse.json({
    message: `Deleted ${deletedCount} question(s) from all sections`,
    totalDeleted: deletedCount,
  })
}
  } catch (error) {
    console.error("Delete questions from exam error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}