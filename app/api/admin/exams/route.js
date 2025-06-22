import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
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
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    const filter = { isActive: true }

    if (category && category !== "all") {
      filter.category = category
    }

    if (examName && examName !== "all") {
      filter.examName = examName
    }

    if (type && type !== "all") {
      filter.type = type
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { examName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const exams = await Exam.find(filter)
      .populate("category", "name code icon color")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Get exams error:", error)
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

    const examData = await request.json()

    const exam = new Exam({
      ...examData,
      createdBy: user.userId,
    })

    await exam.save()

    
    const populatedExam = await Exam.findById(exam._id)
      .populate("category", "name code icon color")
      .populate("createdBy", "name email")

    return NextResponse.json(populatedExam, { status: 201 })
  } catch (error) {
    console.error("Create exam error:", error)
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