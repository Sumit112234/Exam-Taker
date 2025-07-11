import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(decoded.userId).select("subscription")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if subscription is expired
    const subscription = user.subscription
    if (subscription && subscription.endDate && new Date(subscription.endDate) < new Date()) {
      subscription.status = "expired"
    }

    return NextResponse.json({
      subscription: subscription || null,
    })
  } catch (error) {
    console.error("Error fetching user subscription:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { plan, duration = 30 } = await request.json()

    if (!plan || !["basic", "pro"].includes(plan)) {
      return NextResponse.json({ message: "Invalid plan" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(decoded.userId)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Calculate end date
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)

    // Update user subscription
    user.subscription = {
      plan,
      status: "active",
      startDate,
      endDate,
      stripeSubscriptionId: null, // Will be updated by webhook
    }

    await user.save()

    return NextResponse.json({
      message: "Subscription updated successfully",
      subscription: user.subscription,
    })
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
