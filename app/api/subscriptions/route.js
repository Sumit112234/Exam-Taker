import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Subscription from "@/models/Subscription"

export async function GET() {
  try {
    await connectDB()

    const subscriptions = await Subscription.find({ isActive: true }).sort({ price: 1 })

    const stats = {
      totalSubscriptions: subscriptions.length,
      averagePrice: subscriptions.reduce((sum, sub) => sum + sub.price, 0) / subscriptions.length || 0,
      mostPopular: subscriptions.find((sub) => sub.isPopular) || subscriptions[0],
    }

    return NextResponse.json({
      subscriptions,
      stats,
    })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
