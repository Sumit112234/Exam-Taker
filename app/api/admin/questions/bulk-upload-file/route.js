import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Question from "@/models/Question"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    const text = await file.text()
    let questionsData = []

    try {
      if (file.name.endsWith(".json")) {
        questionsData = JSON.parse(text)
      } else if (file.name.endsWith(".csv")) {
        // Simple CSV parsing - you might want to use a proper CSV parser
        const lines = text.split("\n")
        const headers = lines[0].split(",")

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(",")
            const question = {}
            headers.forEach((header, index) => {
              question[header.trim()] = values[index]?.trim()
            })

            // Convert options from CSV format
            if (question.option1) {
              question.options = [question.option1, question.option2, question.option3, question.option4]
              delete question.option1
              delete question.option2
              delete question.option3
              delete question.option4
            }

            questionsData.push(question)
          }
        }
      }
    } catch (error) {
      return NextResponse.json({ message: "Invalid file format" }, { status: 400 })
    }

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return NextResponse.json({ message: "No valid questions found in file" }, { status: 400 })
    }

    // Validate and create questions
    const createdQuestions = []
    const errors = []

    for (let i = 0; i < questionsData.length; i++) {
      try {
        const questionData = questionsData[i]

        // Validate required fields
        if (!questionData.question || !questionData.options || !questionData.correctAnswer) {
          errors.push(`Question ${i + 1}: Missing required fields`)
          continue
        }

        const question = new Question({
          ...questionData,
          createdBy: currentUser.userId,
        })

        await question.save()
        createdQuestions.push(question)
      } catch (error) {
        errors.push(`Question ${i + 1}: ${error.message}`)
      }
    }

    return NextResponse.json({
      message: `Successfully uploaded ${createdQuestions.length} questions`,
      questions: createdQuestions,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Bulk upload file error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
