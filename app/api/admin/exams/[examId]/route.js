import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"
import Question from "@/models/Question"
import Result from "@/models/Result"

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    let param = await params

    // Check authentication and authorization
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Find the exam first
    const exam = await Exam.findById(param.examId)
    
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

    // Delete all results associated with this exam
    const { deletedCount: deletedResultsCount } = await Result.deleteMany({
      exam: param.examId,
    })

    // Delete the exam
    await Exam.findByIdAndDelete(param.examId)

    // If there are questions associated with this exam, delete them too
    if (allQuestionIds.length > 0) {
      await Question.deleteMany({
        _id: { $in: allQuestionIds }
      })
    }

    return NextResponse.json({ 
      message: "Exam, associated questions, and results deleted successfully",
      deletedQuestionsCount: allQuestionIds.length,
      deletedResultsCount,
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
    let param = await params

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const exam = await Exam.findById(param.examId)
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

// export async function PUT(request, { params }) {
//   try {
//     await connectDB()

//     const param = await params

//     const user = await getCurrentUser()

//     if (!user || user.role !== "admin") {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 401 }
//       )
//     }

//     const examData = await request.json()

//     // Remove unwanted fields
//     delete examData._id
//     delete examData.createdAt
//     delete examData.updatedAt

//     // Remove nested section _id if present
//     if (examData.sections) {
//       examData.sections = examData.sections.map((section) => ({
//         ...section,
//         _id: undefined,
//       }))
//     }

//     // Replace complete document data
//     const exam = await Exam.findOneAndUpdate(
//       { _id: param.examId },
//       {
//         $set: examData,
//       },
//       {
//         new: true,
//         runValidators: true,
//         overwrite: false,
//       }
//     )
//       .populate("category", "name code icon color")
//       .populate("createdBy", "name email")

//     if (!exam) {
//       return NextResponse.json(
//         { message: "Exam not found" },
//         { status: 404 }
//       )
//     }

//     return NextResponse.json(exam)

//   } catch (error) {
//     console.error("Update exam error:", error)

//     return NextResponse.json(
//       {
//         message: "Internal server error",
//         error: error.message,
//       },
//       { status: 500 }
//     )
//   }
// }

export async function PUT(request, { params }) {
  try {
    await connectDB()
        let param = await params

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const examData = await request.json()

    console.log("Received exam data for update:", examData, "Exam ID:", param.examId)

      const exam = await Exam.findByIdAndUpdate(
        param.examId,
        {
          $set: examData
        },
        {
          new: true,
          runValidators: true,
        }
      )
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