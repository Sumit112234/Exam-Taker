import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(currentUser.userId).select("settings")

    return NextResponse.json(user?.settings || {})
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const settings = await request.json()

    await User.findByIdAndUpdate(currentUser.userId, { settings }, { new: true })

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
