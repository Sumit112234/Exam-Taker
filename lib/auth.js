// lib/auth.js
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'your-refresh-secret')

// Generate tokens
export async function generateTokens(user) {
  const accessToken = await new SignJWT({
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({ userId: user._id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(JWT_REFRESH_SECRET)

    console.log('Generated accessToken:', accessToken , JWT_SECRET)
    console.log('Generated refreshToken:', refreshToken, JWT_REFRESH_SECRET)

  return { accessToken, refreshToken }
}

// Verify token
export async function verifyToken(token) {
  if (!token) return null
  console.log('Verifying token:', token, JWT_SECRET)
  try {
    const  { payload }  = await jwtVerify(token, JWT_SECRET)
    
    return {
      ...payload,
       userId: payload.userId?.toString(),
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    

    // console.log('Access token from cookies:', token, cookieStore.get('accessToken'))

    if (!token || token === '') return null

    const decoded = await verifyToken(token)

    console.log('Decoded user:', decoded)
    return decoded
  } catch (error) {
    return null
  }
}


// import jwt from "jsonwebtoken"
// import { cookies } from "next/headers"

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret"

// export function generateTokens(user) {

//   console.log("Generating tokens for user:", user)
//   const accessToken = jwt.sign(
//     {
//       userId: user._id,
//       email: user.email,
//       role: user.role,
//     },
//     JWT_SECRET,
//     { expiresIn: "15m" },
//   )

//   const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: "7d" })
//   console.log("Generated accessToken:", accessToken)
//   console.log("Generated refreshToken:", refreshToken)
//   return { accessToken, refreshToken }
// }

// export function verifyToken(token) {
//   console.log("Verifying token:", token , jwt.verify(token, JWT_SECRET), JWT_SECRET)
//   if (!token) {
//     console.error("No token provided for verification")
//     return null
//   }
//   try {
//     return jwt.verify(token, JWT_SECRET)
//   } catch (error) {
//     return null
//   }
// }

// export async function getCurrentUser() {
//   try {
//     const cookieStore = await cookies()
//     const token = cookieStore.get("accessToken")?.value

//     console.log("Access token from cookies:", token, cookieStore.get("accessToken"))

//     if (!token) return null

//     const decoded = verifyToken(token)
//     return decoded
//   } catch (error) {
//     return null
//   }
// }
