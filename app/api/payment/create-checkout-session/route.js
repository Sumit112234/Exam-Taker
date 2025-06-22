import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import connectDB from "@/lib/mongodb"
import Subscription from "@/models/Subscription"
import Coupon from "@/models/Coupon"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { subscriptionId, couponCode } = await request.json()

    // Get subscription details
    const subscription = await Subscription.findById(subscriptionId)
    if (!subscription) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 })
    }

    let discountAmount = 0
    let coupon = null

    // Apply coupon if provided
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        isActive: true,
        expiresAt: { $gt: new Date() },
        usedCount: { $lt: "$maxUses" },
      })

      if (coupon) {
        discountAmount = Math.round((subscription.price * coupon.discount) / 100)
      }
    }

    const finalAmount = subscription.price - discountAmount

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: subscription.name,
              description: subscription.features.join(", "),
            },
            unit_amount: finalAmount * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscriptions`,
      metadata: {
        userId: user.userId,
        subscriptionId: subscription._id.toString(),
        couponId: coupon?._id.toString() || "",
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Create checkout session error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
