import { NextResponse } from "next/server"
import razorpay from "@/lib/razorpay"
import connectDB from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import User from "@/models/User"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    console.log("Current user:", user)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    let param = await params
    const { sessionId } = param // This is the orderId from Razorpay

    // Retrieve the order from Razorpay
    const order = await razorpay.orders.fetch(sessionId)

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    console.log("Retrieved order:", order)

    // Check if order belongs to current user
    if (order.notes.userId !== user.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the payment details if order is paid
    let paymentStatus = "created"
    let paymentId = null

    if (order.status === "paid") {
      paymentStatus = "paid"
      // Fetch payment details
      const payments = await razorpay.payments.all({ limit: 1 })
      if (payments.items && payments.items.length > 0) {
        paymentId = payments.items[0].id
      }
    }

    return NextResponse.json({
      orderId: order.id,
      paymentStatus: paymentStatus,
      paymentId: paymentId,
      subscription: order.notes.subscriptionName || "Premium Plan",
      amount: order.amount / 100, // Convert from paise to rupees
      currency: order.currency,
      endDate: null, // Will be calculated based on subscription duration
    })
  } catch (error) {
    console.error("Error retrieving payment order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}



// import { NextResponse } from "next/server"
// import stripe from "@/lib/stripe"
// // import connectDB from "@/lib/mongodb"
// import connectDB from "@/lib/mongodb"
// import { getCurrentUser } from "@/lib/auth"

// export async function GET(request, { params }) {
//   try {
//     await connectDB()

//     const user = await getCurrentUser()
//     console.log("Current user:", user)
//     if (!user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }
//     let param = await params
//     const { sessionId } = param

//     // Retrieve the session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(sessionId)

//     if (!session) {
//       return NextResponse.json({ message: "Session not found" }, { status: 404 })
//     }

//     console.log("Retrieved session:", session)

//     // Check if session belongs to current user
//     if (session.metadata.userId !== user.userId) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }

//     return NextResponse.json({
//       sessionId: session.id,
//       paymentStatus: session.payment_status,
//       subscription: session.line_items?.data?.[0]?.description || "Premium Plan",
//       amount: session.amount_total / 100,
//       currency: session.currency?.toUpperCase(),
//       testMode: session.metadata.testMode === "true",
//       endDate: null, // Will be calculated based on subscription duration
//     })
//   } catch (error) {
//     console.error("Error retrieving payment session:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }
