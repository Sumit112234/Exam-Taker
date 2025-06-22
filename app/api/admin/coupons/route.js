import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Coupon from "@/models/Coupon"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const coupons = await Coupon.find({}).sort({ createdAt: -1 })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Get coupons error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const couponData = await request.json()

    const coupon = new Coupon(couponData)
    await coupon.save()

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error("Create coupon error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
