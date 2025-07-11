import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" })

  // Clear cookies
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  })

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  })

  return response
}
