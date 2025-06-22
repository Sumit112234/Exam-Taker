import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Question from "@/models/Question"
import Result from "@/models/Result"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { examId } = params
    const { answers, markedForReview, timeSpent } = await request.json()

    // Get the exam
    const exam = await Exam.findById(examId)
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    // Get all question IDs from the exam sections
    const questionIds = exam.sections.reduce((ids, section) => {
      return [...ids, ...(section.questionIds || [])]
    }, [])

    // Fetch all questions for this exam
    const questions = await Question.find({
      _id: { $in: questionIds },
    })

    // Process answers and calculate score
    let correctAnswers = 0
    let wrongAnswers = 0
    let unattempted = 0
    let totalMarks = 0
    let obtainedMarks = 0

    const processedAnswers = []

    // Create a map of questions by ID for easier access
    const questionMap = {}
    questions.forEach((question) => {
      questionMap[question._id.toString()] = question
      totalMarks += question.marks || 1
    })

    // Process each question
    questionIds.forEach((questionId) => {
      const qId = questionId.toString()
      const question = questionMap[qId]

      if (!question) return // Skip if question not found

      const userAnswer = answers[qId]?.answer || null
      const correctAnswer = question.correctAnswer

      let isCorrect = false
      let marks = 0

      if (!userAnswer) {
        unattempted++
      } else if (userAnswer === correctAnswer) {
        isCorrect = true
        correctAnswers++
        marks = question.marks || 1
        obtainedMarks += marks

        // Update question statistics
        question.statistics.totalAttempts += 1
        question.statistics.correctAttempts += 1
      } else {
        wrongAnswers++

        // Apply negative marking if enabled
        if (exam.negativeMarking.enabled) {
          const negativeMarks = question.negativeMarks || exam.negativeMarking.value || 0
          marks = -negativeMarks
          obtainedMarks -= negativeMarks
        }

        // Update question statistics
        question.statistics.totalAttempts += 1
      }

      // Add to processed answers
      processedAnswers.push({
        questionId: question._id,
        userAnswer,
        correctAnswer,
        isCorrect,
        marks,
        timeTaken: 0, // We don't track individual question time in this implementation
      })
    })

    // Calculate score percentage
    const score = Math.round((obtainedMarks / totalMarks) * 100)
    const isPassed = score >= exam.passingMarks


    let result = await Result.findOne({exam: exam._id, user: user.userId})
    
    if(result ){
      return NextResponse.json({
        message: "Result already exists for this exam",
        resultId: result._id,
        score,
        isPassed,
      })
    }
    else{
          // Create result


    const result = new Result({
      user: user.userId,
      exam: exam._id,
      answers: processedAnswers,
      score,
      totalQuestions: questionIds.length,
      correctAnswers,
      wrongAnswers,
      unattempted,
      totalMarks,
      obtainedMarks,
      timeTaken: formatTime(timeSpent),
      timeSpent,
      submittedAt: new Date(),
      isPassed,
    })

    await result.save()

    // Update exam statistics
    exam.statistics.totalAttempts += 1
    exam.statistics.averageScore =
      (exam.statistics.averageScore * (exam.statistics.totalAttempts - 1) + score) / exam.statistics.totalAttempts
    exam.statistics.passRate =
      (exam.statistics.passRate * (exam.statistics.totalAttempts - 1) + (isPassed ? 100 : 0)) /
      exam.statistics.totalAttempts

    await exam.save()

    // Save updated question statistics
    for (const question of questions) {
      await question.save()
    }

    return NextResponse.json({
      message: "Exam submitted successfully",
      resultId: result._id,
      score,
      isPassed,
    })
    }

  } catch (error) {
    console.error("Submit exam error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Helper function to format time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}
