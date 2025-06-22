import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const protectedRoutes = ["/dashboard", "/exams", "/results", "/admin", "/subscriptions", "/profile"]
  const adminRoutes = ["/admin"]
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/contact"]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next()
  }

  if (isProtectedRoute) {
    const accessToken = request.cookies.get("accessToken")?.value

    if (!accessToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const decoded = await verifyToken(accessToken)

      if (!decoded) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
      }

      if (isAdminRoute && decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", decoded.userId)
      requestHeaders.set("x-user-role", decoded.role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error("Token verification error:", error)
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// export function middleware(request) {
//   const { pathname } = request.nextUrl

//   // Protected routes that require authentication
//   const protectedRoutes = ["/dashboard", "/exams", "/results", "/admin", "/subscriptions", "/profile"]
//   const adminRoutes = ["/admin"]
//   const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/contact"]

//   // Check if the current path is protected
//   const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
//   const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
//   const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

//   // Allow public routes
//   if (isPublicRoute && !isProtectedRoute) {
//     return NextResponse.next()
//   }

//   // Check authentication for protected routes
//   if (isProtectedRoute) {
//     const accessToken = request.cookies.get("accessToken")?.value

//     console.log("getting accessToken:", accessToken)

//     if (!accessToken) {
//       const loginUrl = new URL("/login", request.url)
//       loginUrl.searchParams.set("redirect", pathname)
//       return NextResponse.redirect(loginUrl)
//     }

//     try {
//       const decoded = verifyToken(accessToken)
//       console.log("decoded token:", decoded)

//       if (!decoded) {
//         const loginUrl = new URL("/login", request.url)
//         loginUrl.searchParams.set("redirect", pathname)
//         return NextResponse.redirect(loginUrl)
//       }

//       // Check admin access
//       if (isAdminRoute && decoded.role !== "admin") {
//         return NextResponse.redirect(new URL("/dashboard", request.url))
//       }

//       // Add user info to headers for API routes
//       const requestHeaders = new Headers(request.headers)
//       requestHeaders.set("x-user-id", decoded.userId)
//       requestHeaders.set("x-user-role", decoded.role)

//       return NextResponse.next({
//         request: {
//           headers: requestHeaders,
//         },
//       })
//     } catch (error) {
//       console.error("Token verification error:", error)
//       const loginUrl = new URL("/login", request.url)
//       loginUrl.searchParams.set("redirect", pathname)
//       return NextResponse.redirect(loginUrl)
//     }
//   }

//   return NextResponse.next()
// }

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

