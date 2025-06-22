import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Category from "@/models/Category"
import Question from "@/models/Question"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const examName = searchParams.get("examName")
    const type = searchParams.get("type")
    const difficulty = searchParams.get("difficulty")
    const isFree = searchParams.get("isFree")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 12

    // Build filter object
    const filter = {
      isActive: true,
      "visibility.isPublished": true,
    }

    if (category && category !== "all") {
      filter.category = category
    }

    if (examName && examName !== "all") {
      filter.examName = examName
    }

    if (type && type !== "all") {
      filter.type = type
    }

    if (difficulty && difficulty !== "all") {
      filter.difficulty = difficulty
    }

    if (isFree === "true") {
      filter["visibility.isFree"] = true
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { examName: { $regex: search, $options: "i" } },
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await Exam.countDocuments(filter)


    // Fetch exams with proper population
    const exams = await Exam.find(filter)
      .populate({
        path: "category",
        select: "name code icon color",
      })
      .populate({
        path: "sections.questionIds",
        select: "question questionType marks difficulty subject topic",
        options: { limit: 1 }, // Just to check if questions exist
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

      // console.log("Exams fetched:", exams.sections, exams)
      // Format exams with calculated statistics
      const formattedExams = exams.map((exam) => {
      // console.log("Exams section before  :",  exam.sections)
      // Calculate total questions from sections
      const totalQuestions =
        exam.sections?.reduce((total, section) => {
          return total + (section.questions || 0)
        }, 0) || 0

      // Calculate total marks from sections
      const totalMarks =
        exam.sections?.reduce((total, section) => {
          return total + (section.marks || 0)
        }, 0) || 0

      // Calculate total duration from sections
      const totalDuration =
        exam.sections?.reduce((total, section) => {
          return total + (section.duration || 0)
        }, 0) ||
        exam.totalDuration ||
        0

              console.log("Exams section after  :",  exam.sections)
      return {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        category: exam.category,
        examName: exam.examName,
        type: exam.type,
        difficulty: exam.difficulty,
        totalQuestions,
        totalMarks,
        totalDuration,
        passingMarks: exam.passingMarks,
        negativeMarking: exam.negativeMarking,
        sections:
          exam.sections?.map((section) => ({
            _id: section.id,
            name: section.name,
            description: section.description, // no desc
            duration: section.duration,
            totalMarks: section.marks,
            questionCount: section.questions || 0,
          })) || [],
        settings: exam.settings,
        visibility: exam.visibility,
        attempts: exam.attempts || 0,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
        isActive: exam.isActive,
      }
    })

    // Get categories for filtering
    const categories = await Category.find({ isActive: true }).select("name code icon color").sort({ name: 1 })

    // Get unique exam names for filtering
    const examNames = await Exam.distinct("examName", {
      isActive: true,
      "visibility.isPublished": true,
    })

  return NextResponse.json({
  exams: formattedExams,
  pagination: {
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPrevPage: page > 1,
  },
  filters: {
    categories,
    examNames: examNames.filter(Boolean).sort(),
    types: (await Exam.distinct("type", {
      isActive: true,
      "visibility.isPublished": true,
    })).filter(Boolean).sort(),
    difficulties: (await Exam.distinct("difficulty", {
      isActive: true,
      "visibility.isPublished": true,
    })).filter(Boolean).sort(),
  },
})

  } catch (error) {
    console.error("Get exams error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// import { NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import Exam from "@/models/Exam"
// import Category from "@/models/Category"
// import Question from "@/models/Question"

// export async function GET(request) {
//   try {
//     await connectDB()

//     const { searchParams } = new URL(request.url)
//     const category = searchParams.get("category")
//     const examName = searchParams.get("examName")
//     const type = searchParams.get("type")

//     const filter = {
//       isActive: true,
//       "visibility.isPublished": true,
//     }

//     if (category && category !== "all") {
//       filter.category = category
//     }

//     if (examName && examName !== "all") {
//       filter.examName = examName
//     }

//     if (type && type !== "all") {
//       filter.type = type
//     }


//     const exams = await Exam.find(filter).populate("category", "name code icon color exams")
//     .populate('sections.questionIds').sort({ createdAt: -1 })

//     return NextResponse.json(exams)
//   } catch (error) {
//     console.error("Get exams error:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }
