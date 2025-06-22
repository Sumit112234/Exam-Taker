import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Subscription from "@/models/Subscription"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { subscriptionId } = params
    const updateData = await request.json()

    const subscription = await Subscription.findByIdAndUpdate(subscriptionId, updateData, { new: true })

    if (!subscription) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error("Update subscription error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { subscriptionId } = params

    const subscription = await Subscription.findByIdAndDelete(subscriptionId)

    if (!subscription) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Subscription deleted successfully" })
  } catch (error) {
    console.error("Delete subscription error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
