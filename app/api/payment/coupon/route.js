import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Coupon from "@/models/Coupon"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ message: "Coupon code is required" }, { status: 400 })
    }

    await connectDB()

    try {
      // Retrieve the coupon from database
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
      })

      if (!coupon) {
        return NextResponse.json({ message: "Invalid coupon code" }, { status: 400 })
      }

      // Check if coupon has expired
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ message: "Coupon has expired" }, { status: 400 })
      }

      // Check if coupon has reached max uses
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ message: "Coupon has reached maximum uses" }, { status: 400 })
      }

      return NextResponse.json({
        code: coupon.code,
        discount: coupon.discount,
        discountType: coupon.discountType, // "percentage" or "fixed"
        currency: "INR",
        valid: true,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
      })
    } catch (error) {
      throw error
    }
  } catch (error) {
    console.error("Coupon validation error:", error)
    return NextResponse.json({ message: "Error validating coupon" }, { status: 500 })
  }
}



// import { NextResponse } from "next/server"
// import stripe from "@/lib/stripe"

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const code = searchParams.get("code")

//     if (!code) {
//       return NextResponse.json({ message: "Coupon code is required" }, { status: 400 })
//     }

//     try {
//       // Try to retrieve the coupon from Stripe
//       const coupon = await stripe.coupons.retrieve(code.toUpperCase())

//       if (!coupon.valid) {
//         return NextResponse.json({ message: "Coupon is not valid" }, { status: 400 })
//       }

//       // Check if coupon has expired
//       if (coupon.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
//         return NextResponse.json({ message: "Coupon has expired" }, { status: 400 })
//       }

//       // Check if coupon has reached max redemptions
//       if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
//         return NextResponse.json({ message: "Coupon has reached maximum redemptions" }, { status: 400 })
//       }

//       return NextResponse.json({
//         code: coupon.id,
//         percent_off: coupon.percent_off,
//         amount_off: coupon.amount_off,
//         currency: coupon.currency,
//         valid: coupon.valid,
//       })
//     } catch (stripeError) {
//       if (stripeError.code === "resource_missing") {
//         return NextResponse.json({ message: "Invalid coupon code" }, { status: 400 })
//       }
//       throw stripeError
//     }
//   } catch (error) {
//     console.error("Coupon validation error:", error)
//     return NextResponse.json({ message: "Error validating coupon" }, { status: 500 })
//   }
// }
