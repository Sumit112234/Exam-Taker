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
