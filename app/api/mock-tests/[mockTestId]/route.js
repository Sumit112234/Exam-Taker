import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import MockTest from "@/models/MockTest"
import TestAttempt from "@/models/TestAttempt"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()
    const { mockTestId } = params

    const mockTest = await MockTest.findById(mockTestId)
      .populate({
        path: "examId",
        select: "title category examName type",
        populate: {
          path: "category",
          select: "name code icon color",
        },
      })
      .populate({
        path: "sections.questions",
        select: "question questionHindi questionType options marks difficulty subject topic tags",
      })

    if (!mockTest || !mockTest.isActive) {
      return NextResponse.json({ message: "Mock test not found" }, { status: 404 })
    }

    // Calculate statistics
    const totalQuestions =
      mockTest.sections?.reduce((total, section) => {
        return total + (section.questions?.length || 0)
      }, 0) || 0

    const totalMarks =
      mockTest.sections?.reduce((total, section) => {
        return total + (section.totalMarks || 0)
      }, 0) || 0

    // Format response
    const formattedMockTest = {
      _id: mockTest._id,
      title: mockTest.title,
      description: mockTest.description,
      examId: mockTest.examId,
      type: mockTest.type,
      difficulty: mockTest.difficulty,
      duration: mockTest.duration,
      totalQuestions,
      totalMarks,
      sections:
        mockTest.sections?.map((section) => ({
          _id: section._id,
          name: section.name,
          description: section.description,
          duration: section.duration,
          totalMarks: section.totalMarks,
          questions: section.questions || [],
          negativeMarking: section.negativeMarking,
        })) || [],
      instructions: mockTest.instructions,
      isFree: mockTest.isFree,
      attempts: mockTest.attempts || 0,
      createdAt: mockTest.createdAt,
      isActive: mockTest.isActive,
    }

    return NextResponse.json(formattedMockTest)
  } catch (error) {
    console.error("Get mock test error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Get user attempts for this mock test
export async function POST(request, { params }) {
  try {
    await connectDB()
    const { mockTestId } = params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const attempts = await TestAttempt.find({
      user: currentUser.userId,
      mockTest: mockTestId,
    })
      .populate("mockTest", "title type difficulty")
      .sort({ submittedAt: -1 })

    const formattedAttempts = attempts.map((attempt) => ({
      _id: attempt._id,
      score: {
        percentage: attempt.score,
        obtained: attempt.obtainedMarks,
        total: attempt.totalMarks,
      },
      timeTaken: attempt.timeTaken,
      submittedAt: attempt.submittedAt,
      isPassed: attempt.isPassed,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      unattempted: attempt.unattempted,
    }))

    return NextResponse.json(formattedAttempts)
  } catch (error) {
    console.error("Get mock test attempts error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
