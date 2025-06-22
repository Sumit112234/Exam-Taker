import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Result from "@/models/Result"
import Question from "@/models/Question"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { resultId } = params

    const result = await Result.findById(resultId).populate("exam").populate("user", "name email")

    if (!result) {
      return NextResponse.json({ message: "Result not found" }, { status: 404 })
    }

    // Check if user owns this result or is admin
    if (result.user._id.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get questions with explanations
    const questions = await Question.find({
      _id: { $in: result.answers.map((a) => a.questionId) },
    })

    // Create a map of questions by ID for easier access
    const questionMap = {}
    questions.forEach((question) => {
      questionMap[question._id.toString()] = question
    })

    // Combine result answers with question details
    const detailedAnswers = result.answers.map((answer) => {
      const question = questionMap[answer.questionId.toString()]

      return {
        ...answer.toObject(),
        question: question?.questionText,
        questionHindi: question?.questionTextHindi,
        questionImage: question?.questionImage,
        options: question?.options,
        optionsHindi: question?.optionsHindi,
        explanation: question?.explanation,
        explanationHindi: question?.explanationHindi,
        explanationImage: question?.explanationImage,
        subject: question?.subject,
        topic: question?.topic,
        difficulty: question?.difficulty,
      }
    })

    // Group answers by section
    const sectionAnswers = {}

    if (result.exam && result.exam.sections) {
      result.exam.sections.forEach((section, index) => {
        sectionAnswers[section.sectionId || index] = {
          name: section.name,
          answers: [],
          correct: 0,
          total: 0,
          score: 0,
        }
      })

      // Assign answers to sections
      detailedAnswers.forEach((answer) => {
        const question = questionMap[answer.questionId.toString()]
        if (!question) return

        // Find which section this question belongs to
        let sectionId = null

        result.exam.sections.forEach((section, index) => {
          if (
            section.questionIds &&
            section.questionIds.some((qId) => qId.toString() === answer.questionId.toString())
          ) {
            sectionId = section.sectionId || index
          }
        })

        if (sectionId !== null && sectionAnswers[sectionId]) {
          sectionAnswers[sectionId].answers.push(answer)
          sectionAnswers[sectionId].total++

          if (answer.isCorrect) {
            sectionAnswers[sectionId].correct++
          }
        }
      })

      // Calculate section scores
      Object.keys(sectionAnswers).forEach((sectionId) => {
        const section = sectionAnswers[sectionId]
        section.score = section.total > 0 ? Math.round((section.correct / section.total) * 100) : 0
      })
    }

    const resultData = {
      ...result.toObject(),
      answers: detailedAnswers,
      sections: Object.values(sectionAnswers),
    }

    return NextResponse.json(resultData)
  } catch (error) {
    console.error("Get result error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// import { NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import Result from "@/models/Result"
// import Question from "@/models/Question"
// import { getCurrentUser } from "@/lib/auth"

// export async function GET(request, { params }) {
//   try {
//     await connectDB()

//     const user = await getCurrentUser()
//     if (!user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }

//     const { resultId } = params

//     const result = await Result.findById(resultId).populate("exam").populate("user", "name email")

//     if (!result) {
//       return NextResponse.json({ message: "Result not found" }, { status: 404 })
//     }

//     // Check if user owns this result or is admin
//     if (result.user._id.toString() !== user.userId && user.role !== "admin") {
//       return NextResponse.json({ message: "Forbidden" }, { status: 403 })
//     }

//     // Get questions with explanations
//     const questions = await Question.find({
//       _id: { $in: result.answers.map((a) => a.questionId) },
//     })

//     // Create a map of questions by ID for easier access
//     const questionMap = {}
//     questions.forEach((question) => {
//       questionMap[question._id.toString()] = question
//     })

//     // Combine result answers with question details
//     const detailedAnswers = result.answers.map((answer) => {
//       const question = questionMap[answer.questionId.toString()]

//       return {
//         ...answer.toObject(),
//         question: question?.questionText,
//         questionHindi: question?.questionTextHindi,
//         questionImage: question?.questionImage,
//         options: question?.options,
//         optionsHindi: question?.optionsHindi,
//         explanation: question?.explanation,
//         explanationHindi: question?.explanationHindi,
//         explanationImage: question?.explanationImage,
//         subject: question?.subject,
//         topic: question?.topic,
//         difficulty: question?.difficulty,
//       }
//     })

//     // Group answers by section
//     const sectionAnswers = {}

//     if (result.exam && result.exam.sections) {
//       result.exam.sections.forEach((section, index) => {
//         sectionAnswers[section.sectionId || index] = {
//           name: section.name,
//           answers: [],
//           correct: 0,
//           total: 0,
//           score: 0,
//         }
//       })

//       // Assign answers to sections
//       detailedAnswers.forEach((answer) => {
//         const question = questionMap[answer.questionId.toString()]
//         if (!question) return

//         // Find which section this question belongs to
//         let sectionId = null

//         result.exam.sections.forEach((section, index) => {
//           if (
//             section.questionIds &&
//             section.questionIds.some((qId) => qId.toString() === answer.questionId.toString())
//           ) {
//             sectionId = section.sectionId || index
//           }
//         })

//         if (sectionId !== null && sectionAnswers[sectionId]) {
//           sectionAnswers[sectionId].answers.push(answer)
//           sectionAnswers[sectionId].total++

//           if (answer.isCorrect) {
//             sectionAnswers[sectionId].correct++
//           }
//         }
//       })

//       // Calculate section scores
//       Object.keys(sectionAnswers).forEach((sectionId) => {
//         const section = sectionAnswers[sectionId]
//         section.score = section.total > 0 ? Math.round((section.correct / section.total) * 100) : 0
//       })
//     }

//     const resultData = {
//       ...result.toObject(),
//       answers: detailedAnswers,
//       sections: Object.values(sectionAnswers),
//     }

//     return NextResponse.json(resultData)
//   } catch (error) {
//     console.error("Get result error:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }
