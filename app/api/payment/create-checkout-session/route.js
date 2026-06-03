import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Subscription from "@/models/Subscription"
import Coupon from "@/models/Coupon"
import User from "@/models/User"
import { getCurrentUser } from "@/lib/auth"
import razorpay from "@/lib/razorpay"

export async function POST(request) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { subscriptionId, couponCode } = await request.json()

    // Get subscription details from database
    const subscription = await Subscription.findById(subscriptionId)
    if (!subscription || !subscription.isActive) {
      return NextResponse.json({ message: "Subscription not found or inactive" }, { status: 404 })
    }

    let discountAmount = 0
    let coupon = null
    let finalAmount = subscription.price

    // Apply coupon if provided
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() },
        $expr: { $lt: ["$usedCount", "$maxUses"] },
      })

      if (coupon) {
        if (coupon.discountType === "percentage") {
          discountAmount = Math.round((subscription.price * coupon.discount) / 100)
        } else {
          discountAmount = Math.min(coupon.discount, subscription.price)
        }
        finalAmount = Math.max(0, subscription.price - discountAmount)

        // Update coupon usage
        coupon.usedCount += 1
        await coupon.save()
      }
    }

    // If final amount is zero, directly activate subscription
    if (finalAmount === 0) {
      const userData = await User.findById(user.userId)
      if (!userData) {
        return NextResponse.json({ message: "User not found" }, { status: 404 })
      }

      // Calculate expiry date
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + subscription.duration)

      // Update user subscription
      userData.subscription = {
        plan: subscription.name.toLowerCase(),
        status: "active",
        startDate: new Date(),
        endDate: expiryDate,
        subscriptionId: subscription._id,
        paymentMethod: "coupon",
        amount: 0,
        originalAmount: subscription.price,
        discountAmount,
        couponCode: coupon?.code,
      }

      await userData.save()

      // Update subscription statistics
      subscription.totalSubscribers += 1
      await subscription.save()

      return NextResponse.json({
        success: true,
        freeSubscription: true,
        message: "Subscription activated successfully!",
        subscription: userData.subscription,
      })
    }

    // Create Razorpay order for paid subscriptions
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    const orderConfig = {
      amount: finalAmount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `receipt_${subscription._id}_${user.userId}_${Date.now()}`,
      notes: {
        userId: user.userId,
        subscriptionId: subscription._id.toString(),
        couponId: coupon?._id.toString() || "",
        originalAmount: subscription.price.toString(),
        discountAmount: discountAmount.toString(),
        finalAmount: finalAmount.toString(),
        subscriptionName: subscription.name,
        userEmail: user.email,
      },
    }

    const order = await razorpay.orders.create(orderConfig)

    return NextResponse.json({
      orderId: order.id,
      amount: finalAmount * 100,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      finalAmount,
      originalAmount: subscription.price,
      discountAmount,
      couponApplied: !!coupon,
      subscriptionName: subscription.name,
    })
  } catch (error) {
    console.error("Create Razorpay order error:", error)

    return NextResponse.json(
      {
        message: "Payment processing error. Please try again.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
