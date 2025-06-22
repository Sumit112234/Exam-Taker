import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { examId } = params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the exam to access its sections and question IDs
    const exam = await Exam.findById(examId)
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    // Extract all question IDs from all sections
    const questionIds = exam.sections.reduce((ids, section) => {
      return [...ids, ...(section.questionIds || [])]
    }, [])

    // Fetch all questions for this exam
    const questions = await Question.find({
      _id: { $in: questionIds },
      isActive: true,
    }).select("-correctAnswer -explanation -explanationHindi -explanationImage -statistics")

    // If this is a premium exam and user doesn't have subscription, limit questions
    if (!exam.visibility.isFree && (!user.subscription || user.subscription.status !== "active")) {
      // For non-subscribers, only return first 5 questions as preview
      const previewQuestions = questions.slice(0, 5)
      return NextResponse.json(previewQuestions)
    }

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Get exam questions error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}


// import { NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import Question from "@/models/Question"

// export async function GET(request, { params }) {
//   try {
//     await connectDB()

//     const { exam } = params

    
//     const questions = exam.sections.map((ele)=>{
//       return ele.questionIds
//     });

//     return NextResponse.json(questions)
//   } catch (error) {
//     console.error("Get questions error:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }
// import { NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import Question from "@/models/Question"

// export async function GET(request, { params }) {
//   try {
//     await connectDB()

//     const { examId } = params

    
//     const questions = await Question.find({ examId }).select("-correctAnswer -explanation") // Don't send correct answers to client during exam

//     return NextResponse.json(questions)
//   } catch (error) {
//     console.error("Get questions error:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }
