import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Result from "@/models/Result"
import { getCurrentUser } from "@/lib/auth"

export async function DELETE() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Delete user's exam results
    await Result.deleteMany({ user: currentUser.userId })

    // Delete user account
    await User.findByIdAndDelete(currentUser.userId)

    // Clear the authentication cookie
    const response = NextResponse.json({ message: "Account deleted successfully" })
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
