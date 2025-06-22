import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Coupon from "@/models/Coupon"
import { getCurrentUser } from "@/lib/auth"

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { couponId } = params

    const coupon = await Coupon.findByIdAndDelete(couponId)

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Delete coupon error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
