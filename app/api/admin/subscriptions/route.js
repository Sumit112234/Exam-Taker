import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Subscription from "@/models/Subscription"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const subscriptions = await Subscription.find({}).sort({ price: 1 })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error("Get subscriptions error:", error)
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

    const subscriptionData = await request.json()

    const subscription = new Subscription(subscriptionData)
    await subscription.save()

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error("Create subscription error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
