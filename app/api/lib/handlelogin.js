import { NextResponse } from "next/server"
import { generateTokens } from "@/lib/auth"

export function handleLogin(user, message = "Login successful") {
  const { accessToken, refreshToken } = generateTokens(user)

  const response = new NextResponse(
    JSON.stringify({
      message,
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
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  }

  response.cookies.set("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60,
  })
  response.cookies.set("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  })

  return response
}
