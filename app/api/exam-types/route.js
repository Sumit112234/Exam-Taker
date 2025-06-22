import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ExamType from "@/models/ExamType"

export async function GET() {
  try {
    await connectDB()

    const examTypes = await ExamType.find({ isActive: true }).sort({ name: 1 })

    return NextResponse.json(examTypes)
  } catch (error) {
    console.error("Get exam types error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const examTypeData = await request.json()

    const examType = new ExamType(examTypeData)
    await examType.save()

    return NextResponse.json(examType, { status: 201 })
  } catch (error) {
    console.error("Create exam type error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
