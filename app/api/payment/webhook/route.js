import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Subscription from "@/models/Subscription"
import Coupon from "@/models/Coupon"

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.text()
    const sig = request.headers.get("stripe-signature")

    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ message: "Webhook signature verification failed" }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const { userId, subscriptionId, couponId } = session.metadata

      // Get subscription details
      const subscription = await Subscription.findById(subscriptionId)
      if (!subscription) {
        console.error("Subscription not found:", subscriptionId)
        return NextResponse.json({ message: "Subscription not found" }, { status: 404 })
      }

      // Update user subscription
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + subscription.duration)

      await User.findByIdAndUpdate(userId, {
        "subscription.status": "active",
        "subscription.plan": subscription.name,
        "subscription.expiry": expiryDate,
        "subscription.stripeCustomerId": session.customer,
      })

      // Update coupon usage if used
      if (couponId) {
        await Coupon.findByIdAndUpdate(couponId, {
          $inc: { usedCount: 1 },
        })
      }

      console.log("Subscription activated for user:", userId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
