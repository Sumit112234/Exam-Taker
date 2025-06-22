import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Question from "@/models/Question"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const examName = searchParams.get("examName")
    const sectionName = searchParams.get("sectionName")
    const subject = searchParams.get("subject")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    const filter = { isActive: true }

    if (category && category !== "all") {
      filter.category = category
    }

    if (examName && examName !== "all") {
      filter.examName = examName
    }

    if (sectionName && sectionName !== "all") {
      filter.sectionName = sectionName
    }

    if (subject && subject !== "all") {
      filter.subject = subject
    }

    if (search) {
      filter.$or = [
        { questionText: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { chapter: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate("category", "name code icon color")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Question.countDocuments(filter),
    ])

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get questions error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
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

    // Create question
    const question = new Question({
      ...questionData,
      createdBy: user.userId,
      isActive: true,
    })

    await question.save()

    // If examId and sectionId are provided, assign question to exam section
    if (questionData.examId && questionData.sectionId) {
      try {
        const exam = await Exam.findById(questionData.examId)
        if (exam) {
          const section = exam.sections.find((s) => s.sectionId === questionData.sectionId)
          if (section) {
            await Exam.findByIdAndUpdate(
              questionData.examId,
              {
                $addToSet: {
                  [`sections.$[section].questionIds`]: question._id,
                },
              },
              {
                arrayFilters: [{ "section.sectionId": questionData.sectionId }],
                new: true,
              },
            )

            // Update exam statistics
            await updateExamStatistics(questionData.examId)
          }
        }
      } catch (examError) {
        console.error("Error assigning question to exam section:", examError)
        // Don't fail the question creation if exam assignment fails
      }
    }

    const populatedQuestion = await Question.findById(question._id)
      .populate("category", "name code icon color")
      .populate("createdBy", "name email")

    return NextResponse.json(populatedQuestion, { status: 201 })
  } catch (error) {
    console.error("Create question error:", error)

    if (error.code === 11000) {
      return NextResponse.json({ message: "A question with similar content already exists" }, { status: 400 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Helper function to update exam statistics
async function updateExamStatistics(examId) {
  try {
    const exam = await Exam.findById(examId).populate("sections.questionIds")
    if (exam) {
      let totalQuestions = 0
      let totalMarks = 0

      exam.sections.forEach((section) => {
        section.questions = section.questionIds.length
        totalQuestions += section.questionIds.length

        // Calculate marks for this section
        const sectionMarks = section.questionIds.reduce((sum, question) => {
          return sum + (question.marks || 1)
        }, 0)
        section.marks = sectionMarks
        totalMarks += sectionMarks
      })

      exam.totalQuestions = totalQuestions
      exam.totalMarks = totalMarks

      await exam.save()
    }
  } catch (error) {
    console.error("Error updating exam statistics:", error)
  }
}
