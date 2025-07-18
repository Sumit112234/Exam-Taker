import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { generateTokens } from "@/lib/auth"
import { handleLogin } from "@/app/api/lib/handlelogin"

export async function POST(request) {
  try {
    await connectDB()

    const { name, email, password,avatar, isVerified, google } = await request.json()

    // Validation
    if (!google && (!name || !email || !password)) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    if (name.length < 2) {
      return NextResponse.json({ message: "Name must be at least 2 characters" }, { status: 400 })
    }

    if ((password.length < 6) && !google) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser =  await User.findOne({ email: email.toLowerCase() })
    if (existingUser && !google) {
      return NextResponse.json({ message: "An account with this email already exists" }, { status: 400 })
    }
    let user = {};

    // Create user

    if(existingUser)
    {
      // If signing up with Google, update the existing user
      existingUser.name = name.trim()
      existingUser.avatar = avatar
      existingUser.isVerified = isVerified
      existingUser.google = true

      await existingUser.save()
      // return handleLogin(existingUser)
    }
    else{

       user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        avatar,
        isVerified,
        google
      })
      
      await user.save()
    }

    if(existingUser && existingUser.google) {
      user = existingUser;
    }
      
    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user)


    // Create response
    const response = NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        avatar: user.avatar,
        examsTaken: user.examsTaken,
        averageScore: user.averageScore,
        isVerified: user.isVerified,
      },
    })

    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    }

    console.log("setting cookies for signup")

    response.cookies.set("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 60, // 15 minutes
    })

    console.log("setting cookies for signup refresh token", response.cookies.get("accessToken"))
    
    response.cookies.set("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })
    
    console.log("setting cookies for signup refresh token", response.cookies.get("refreshToken"))
    
    return response
  } catch (error) {
    console.error("Signup error:", error)

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json({ message: messages[0] }, { status: 400 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
