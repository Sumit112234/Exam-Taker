import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Contact from "@/models/Contact"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request) {
  try {
    await connectDB()

    const { name, email, subject, message } = await request.json()

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Get current user if logged in
    const currentUser = await getCurrentUser()

    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      userId: currentUser?.userId || null,
    })

    await contact.save()

    return NextResponse.json({
      message: "Your message has been sent successfully. We'll get back to you soon!",
      contactId: contact._id,
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ message: "Failed to send message. Please try again." }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10

    const filter = {}
    if (status && status !== "all") {
      filter.status = status
    }

    const contacts = await Contact.find(filter)
      .populate("userId", "name email")
      .populate("resolvedBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Contact.countDocuments(filter)

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get contacts error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
