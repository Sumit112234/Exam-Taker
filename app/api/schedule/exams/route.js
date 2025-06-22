import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ScheduledExam from "@/models/ScheduledExam"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const query = {}
    if (user.role !== "admin") {
      query.createdBy = user.userId
    }

    if (status) {
      const now = new Date()
      if (status === "upcoming") {
        query.scheduledDateTime = { $gt: now }
      } else if (status === "live") {
        query.scheduledDateTime = { $lte: now }
        // Add duration check for live status
      } else if (status === "completed") {
        // Add logic for completed exams
      }
    }

    const scheduledExams = await ScheduledExam.find(query)
      .populate("examId", "title description totalQuestions totalDuration")
      .sort({ scheduledDateTime: 1 })

    return NextResponse.json(scheduledExams)
  } catch (error) {
    console.error("Get scheduled exams error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { examId, title, description, scheduledDateTime, duration, maxAttempts, reminderEnabled, reminderTime } = data

    // Validate exam exists
    const exam = await Exam.findById(examId)
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    // Create scheduled exam
    const scheduledExam = new ScheduledExam({
      examId,
      title,
      description,
      scheduledDateTime: new Date(scheduledDateTime),
      duration: Number.parseInt(duration),
      maxAttempts: Number.parseInt(maxAttempts),
      reminderEnabled,
      reminderTime: Number.parseInt(reminderTime),
      createdBy: user.userId,
      isActive: true,
    })

    await scheduledExam.save()

    return NextResponse.json(scheduledExam, { status: 201 })
  } catch (error) {
    console.error("Create scheduled exam error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
