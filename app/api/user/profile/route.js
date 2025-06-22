import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password
    delete updateData.role
    delete updateData.subscription

    const user = await User.findByIdAndUpdate(currentUser.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json({ message: messages[0] }, { status: 400 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
