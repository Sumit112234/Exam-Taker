import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
// import connectDB from "@/lib/mongodb"
import connectDB from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    console.log("Current user:", user)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = params

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    console.log("Retrieved session:", session)

    // Check if session belongs to current user
    if (session.metadata.userId !== user.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      subscription: session.line_items?.data?.[0]?.description || "Premium Plan",
      amount: session.amount_total / 100,
      currency: session.currency?.toUpperCase(),
      testMode: session.metadata.testMode === "true",
      endDate: null, // Will be calculated based on subscription duration
    })
  } catch (error) {
    console.error("Error retrieving payment session:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
