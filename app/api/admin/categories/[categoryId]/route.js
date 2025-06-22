import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Category from "@/models/Category"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const category = await Category.findById(params.categoryId).populate("createdBy", "name email")

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Get category error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()

    const category = await Category.findByIdAndUpdate(params.categoryId, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email")

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Update category error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const category = await Category.findByIdAndUpdate(params.categoryId, { isActive: false }, { new: true })

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
