import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import MockTest from "@/models/MockTest"
import Exam from "@/models/Exam"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")
    const type = searchParams.get("type")
    const difficulty = searchParams.get("difficulty")
    const isFree = searchParams.get("isFree")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 12

    // Build filter object
    const filter = {
      isActive: true,
    }

    if (examId && examId !== "all") {
      filter.examId = examId
    }

    if (type && type !== "all") {
      filter.type = type
    }

    if (difficulty && difficulty !== "all") {
      filter.difficulty = difficulty
    }

    if (isFree === "true") {
      filter.isFree = true
    }

    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await MockTest.countDocuments(filter)

    // Fetch mock tests with proper population
    const mockTests = await MockTest.find(filter)
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
        select: "question questionType marks difficulty",
        options: { limit: 1 }, // Just to check if questions exist
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Format mock tests with calculated statistics
    const formattedMockTests = mockTests.map((mockTest) => {
      // Calculate total questions from sections
      const totalQuestions =
        mockTest.sections?.reduce((total, section) => {
          return total + (section.questions?.length || 0)
        }, 0) || 0

      // Calculate total marks from sections
      const totalMarks =
        mockTest.sections?.reduce((total, section) => {
          return total + (section.totalMarks || 0)
        }, 0) || 0

      return {
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
            questionCount: section.questions?.length || 0,
            negativeMarking: section.negativeMarking,
          })) || [],
        instructions: mockTest.instructions,
        isFree: mockTest.isFree,
        attempts: mockTest.attempts || 0,
        createdAt: mockTest.createdAt,
        updatedAt: mockTest.updatedAt,
        isActive: mockTest.isActive,
      }
    })

    // Get available exams for filtering
    const availableExams = await Exam.find({
      isActive: true,
      "visibility.isPublished": true,
    })
      .populate("category", "name code")
      .select("title category examName")
      .sort({ title: 1 })

    return NextResponse.json({
      mockTests: formattedMockTests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
      filters: {
        exams: availableExams,
        types: ["full", "mini", "sectional"],
        difficulties: ["Easy", "Medium", "Hard"],
      },
    })
  } catch (error) {
    console.error("Get mock tests error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
