import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Subscription from "@/models/Subscription"

export async function GET() {
  try {
    await connectDB()

    const subscriptions = await Subscription.find({ isActive: true }).sort({ price: 1 })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error("Get subscriptions error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
