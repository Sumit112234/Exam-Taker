import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Subscription from "@/models/Subscription"
import Exam from "@/models/Exam"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const subscriptionData = await request.json()

//     console.log("Received subscription data:", subscriptionData)
// return NextResponse.json({ message: "Received subscription data" }, { status: 200 })
    // Create Subscription
    const subscription = await Subscription.create(subscriptionData)

    // Update all selected exams with subscription reference
    // if (
    //   subscriptionData.includedExams &&
    //   subscriptionData.includedExams.length > 0
    // ) {
    //  let result = await Exam.updateMany(
    //     {
    //       _id: {
    //         $in: subscriptionData.includedExams,
    //       },
    //     },
    //     {
    //       $set: {
    //         subscriptionPlan: subscription._id,
    //       },
    //     }
    //   )
    //   console.log('result = ', result)
    // }


    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error("Create subscription error:", error)

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}


export async function GET() {
  try {
    await connectDB()

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const subscriptions = await Subscription.find({}).sort({ price: 1 })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error("Get subscriptions error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}


