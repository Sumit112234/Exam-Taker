import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Subscription from "@/models/Subscription"
import Coupon from "@/models/Coupon"

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request) {
  try {
    const body = await request.text()
    const sig = request.headers.get("stripe-signature")

    let event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err.message)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    await connectDB()

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        await handleSuccessfulPayment(session)
        break
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        console.log(`Payment succeeded: ${paymentIntent.id}`)
        break
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        console.log(`Payment failed: ${failedPayment.id}`)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleSuccessfulPayment(session) {
  try {
    const { userId, subscriptionId, couponId, testMode } = session.metadata

    // Log test mode payments
    if (testMode === "true") {
      console.log(`Processing test mode payment for user: ${userId}`)
    }

    // Get user and subscription
    const user = await User.findById(userId)
    const subscription = await Subscription.findById(subscriptionId)

    if (!user || !subscription) {
      console.error("User or subscription not found")
      return
    }

    // Calculate subscription end date
    const subscriptionEndDate = new Date()
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + subscription.duration)

    // Update user subscription
    await User.findByIdAndUpdate(userId, {
      subscription: {
        plan: subscription.name,
        status: "active",
        startDate: new Date(),
        endDate: subscriptionEndDate,
        stripeSessionId: session.id,
        testMode: testMode === "true",
      },
      subscriptionStatus: "active",
    })

    // Update coupon usage if applicable
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, {
        $inc: { usedCount: 1 },
      })
    }

    console.log(`Subscription activated for user: ${userId} (${testMode === "true" ? "TEST MODE" : "LIVE MODE"})`)
  } catch (error) {
    console.error("Error handling successful payment:", error)
  }
}
