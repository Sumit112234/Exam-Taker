import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Coupon from "@/models/Coupon"

export async function POST(request) {
  try {
    await connectDB()

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ message: "Coupon code is required" }, { status: 400 })
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
      $expr: { $lt: ["$usedCount", "$maxUses"] },
    })

    if (!coupon) {
      return NextResponse.json({ message: "Invalid or expired coupon" }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount,
      code: coupon.code,
    })
  } catch (error) {
    console.error("Validate coupon error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
