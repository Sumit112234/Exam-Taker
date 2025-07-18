import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { GoogleOAuthProvider } from "@react-oauth/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ExamPro - Online Examination Platform",
  description: "Take exams online and analyze your performance with advanced analytics",
  keywords: "online exams, test preparation, education, learning platform",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
         <GoogleOAuthProvider clientId={process.env.CLIENT_ID}>

         
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
              {children}
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        </GoogleOAuthProvider>
      </body>

    </html>
  )
}
