import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const exam = await Exam.findById(params.examId)
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

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const examData = await request.json()

    const exam = await Exam.findByIdAndUpdate(params.examId, examData, {
      new: true,
      runValidators: true,
    })
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

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const exam = await Exam.findByIdAndUpdate(params.examId, { isActive: false }, { new: true })

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Exam deleted successfully" })
  } catch (error) {
    console.error("Delete exam error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
