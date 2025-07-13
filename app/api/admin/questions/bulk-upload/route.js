import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Question from "@/models/Question"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"
import User from '@/models/User'
import Category from "@/models/Category"

export async function POST(request) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const category = formData.get("category")
    const examId = formData.get("examId")
    const sectionId = formData.get("sectionId")
    const examName = formData.get("examName")
    const sectionName = formData.get("sectionName")
    const file = formData.get("file")
    const questionsText = formData.get("questions")

    console.log("Bulk upload request received:", {
      category,
      examId,
      sectionId,
      examName,
      sectionName,
      file: file ? file.name : "No file uploaded",
      questionsText: questionsText ? "Provided" : "Not provided",
    })

    // Validate required fields
    if (!category || !examId || !sectionId) {
      return NextResponse.json({ message: "Category, exam, and section are required" }, { status: 400 })
    }

    // Verify exam exists and section exists within exam
    const exam = await Exam.findById(examId)
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    const section = exam.sections.find((s) => s.sectionId === sectionId)
    if (!section) {
      return NextResponse.json({ message: "Section not found in exam" }, { status: 404 })
    }

    let questionsData = []

    if (file) {
      // Handle file upload
      const fileContent = await file.text()

      if (file.name.endsWith(".json")) {
        try {
          questionsData = JSON.parse(fileContent)
        } catch (error) {
          return NextResponse.json({ message: "Invalid JSON format in uploaded file" }, { status: 400 })
        }
      } else if (file.name.endsWith(".csv")) {
        // Enhanced CSV parsing
        const lines = fileContent.split("\n").filter((line) => line.trim())
        if (lines.length < 2) {
          return NextResponse.json(
            { message: "CSV file must contain headers and at least one data row" },
            { status: 400 },
          )
        }

        const headers = lines[0].split(",").map((h) => h.trim())

        questionsData = lines
          .slice(1)
          .map((line, index) => {
            const values = line.split(",").map((v) => v.trim())
            const question = {}

            headers.forEach((header, headerIndex) => {
              const value = values[headerIndex] || ""

              // Handle special fields
              if (header === "options" && value) {
                question[header] = value
                  .split("|")
                  .map((opt) => opt.trim())
                  .filter((opt) => opt)
              } else if (header === "tags" && value) {
                question[header] = value
                  .split("|")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag)
              } else if (header === "marks" || header === "negativeMarks") {
                question[header] = Number.parseFloat(value) || (header === "marks" ? 1 : 0.25)
              } else {
                question[header] = value
              }
            })

            return question
          })
          .filter((q) => q.questionText && q.questionText.trim()) // Filter out empty rows
      } else {
        return NextResponse.json({ message: "Unsupported file format. Please use JSON or CSV" }, { status: 400 })
      }
    } else if (questionsText) {
      // Handle JSON text input
      try {
        questionsData = JSON.parse(questionsText)
      } catch (error) {
        return NextResponse.json({ message: "Invalid JSON format in text input" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ message: "No questions data provided" }, { status: 400 })
    }

    if (!Array.isArray(questionsData)) {
      questionsData = [questionsData]
    }

    if (questionsData.length === 0) {
      return NextResponse.json({ message: "No valid questions found in the uploaded data" }, { status: 400 })
    }

    const createdQuestions = []
    const errors = []

    // Process each question
    for (let i = 0; i < questionsData.length; i++) {
      try {
        const questionData = {
          ...questionsData[i],
          category: category,
          examName: examName,
          sectionName: sectionName,
          createdBy: user.userId,
          isActive: true,
        }

        // Validate required fields
        const requiredFields = ["subject", "questionText", "correctAnswer"]
        const missingFields = requiredFields.filter(
          (field) => !questionData[field] || !questionData[field].toString().trim(),
        )

        if (missingFields.length > 0) {
          errors.push(`Question ${i + 1}: Missing required fields: ${missingFields.join(", ")}`)
          continue
        }

        // Set default values
        questionData.type = questionData.type || "mcq"
        questionData.difficulty = questionData.difficulty || "Medium"
        questionData.marks = questionData.marks || 1
        questionData.negativeMarks = questionData.negativeMarks || 0.25

        // Validate MCQ questions have options
        if (questionData.type === "mcq") {
          if (!questionData.options || !Array.isArray(questionData.options) || questionData.options.length < 2) {
            errors.push(`Question ${i + 1}: MCQ questions must have at least 2 options`)
            continue
          }

          // Validate correct answer is one of the options
          if (!questionData.options.includes(questionData.correctAnswer)) {
            errors.push(`Question ${i + 1}: Correct answer must be one of the provided options`)
            continue
          }
        }

        // Create and save question
        // console.log(`Creating question ${i + 1}:`, questionData)
        const question = new Question(questionData)
        await question.save()

        // Add question ID to exam section
        await Exam.findByIdAndUpdate(
          examId,
          {
            $addToSet: {
              [`sections.$[section].questionIds`]: question._id,
            },
          },
          {
            arrayFilters: [{ "section.sectionId": sectionId }],
            new: true,
          },
        )

        const populatedQuestion = await Question.findById(question._id)
          .populate("category", "name code icon color")
          .populate("createdBy", "name email")

        createdQuestions.push(populatedQuestion)
      } catch (error) {
        console.error(`Error processing question ${i + 1}:`, error)
        errors.push(`Question ${i + 1}: ${error.message}`)
      }
    }

    // Update exam statistics
    if (createdQuestions.length > 0) {
      await updateExamStatistics(examId)
    }

    const response = {
      success: true,
      created: createdQuestions.length,
      errors: errors.length,
      raw : questionsData,
      total: questionsData.length,
      message: `Successfully processed ${questionsData.length} questions. Created: ${createdQuestions.length}, Errors: ${errors.length}`,
      questions: createdQuestions,
    }

    if (errors.length > 0) {
      response.errorDetails = errors
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Bulk upload error:", error)
    return NextResponse.json(
      {
        message: "Internal server error during bulk upload",
        error: error.message,
      },
      { status: 500 },
    )
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
