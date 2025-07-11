import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Test from "@/models/Test"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    const filter = {}

    if (type && type !== "all") {
      filter.type = type
    }

    if (category && category !== "all") {
      filter.category = category
    }

    if (status && status !== "all") {
      if (status === "published") {
        filter.isPublished = true
      } else if (status === "draft") {
        filter.isPublished = false
      }
    }

    const tests = await Test.find(filter)
      .populate("category", "name icon color")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })

    return NextResponse.json(tests)
  } catch (error) {
    console.error("Get tests error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const testData = await request.json()

    console.log("Test data received:", testData)
    const test = new Test({
      ...testData,
      createdBy: currentUser.userId,
    })

    await test.save()
    // await test.populate("category", "name icon color")

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error("Create test error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
