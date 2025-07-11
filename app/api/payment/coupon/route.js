import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ message: "Coupon code is required" }, { status: 400 })
    }

    try {
      // Try to retrieve the coupon from Stripe
      const coupon = await stripe.coupons.retrieve(code.toUpperCase())

      if (!coupon.valid) {
        return NextResponse.json({ message: "Coupon is not valid" }, { status: 400 })
      }

      // Check if coupon has expired
      if (coupon.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
        return NextResponse.json({ message: "Coupon has expired" }, { status: 400 })
      }

      // Check if coupon has reached max redemptions
      if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
        return NextResponse.json({ message: "Coupon has reached maximum redemptions" }, { status: 400 })
      }

      return NextResponse.json({
        code: coupon.id,
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off,
        currency: coupon.currency,
        valid: coupon.valid,
      })
    } catch (stripeError) {
      if (stripeError.code === "resource_missing") {
        return NextResponse.json({ message: "Invalid coupon code" }, { status: 400 })
      }
      throw stripeError
    }
  } catch (error) {
    console.error("Coupon validation error:", error)
    return NextResponse.json({ message: "Error validating coupon" }, { status: 500 })
  }
}
