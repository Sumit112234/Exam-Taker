import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Category from "@/models/Category"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const categories = await Category.find({ isActive: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Get categories error:", error)
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

    const categoryData = await request.json()

    const category = new Category({
      ...categoryData,
      createdBy: currentUser.userId,
    })

    await category.save()

    const populatedCategory = await Category.findById(category._id).populate("createdBy", "name email")

    return NextResponse.json(populatedCategory, { status: 201 })
  } catch (error) {
    console.error("Create category error:", error)
    if (error.code === 11000) {
      return NextResponse.json({ message: "Category name or code already exists" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
