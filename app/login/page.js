"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, AlertCircle, Eye, EyeOff, Sparkles, Star, ArrowLeft, Shield, Zap } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const redirectPath = searchParams.get("redirect") || "/dashboard"

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
      router.push(user.role === "admin" ? "/admin" : "/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error)
    } else {
      // Redirect to intended page or dashboard
      router.push(redirectPath)
    }

    setIsLoading(false)
  }

  const fillDemoCredentials = (type) => {
    if (type === 'student') {
      setEmail('user@example.com')
      setPassword('password123')
    } else {
      setEmail('admin@example.com')
      setPassword('admin123')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden border-2 border-purple-400/50 bg-slate-800/95 backdrop-blur-xl shadow-2xl shadow-purple-500/20">
        {/* Animated background elements - more visible */}
        <div className="absolute inset-0 opacity-40">
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-2xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <CardHeader className="relative text-center pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 border border-purple-400/40 shadow-lg">
              <Shield className="h-4 w-4 text-white" />
              <span className="text-sm text-white font-medium">Secure Login</span>
            </div>
          </motion.div>
          
          <CardTitle className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </CardTitle>
          <CardDescription className="text-slate-300 text-base">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="border-2 border-red-400/70 bg-red-900/80 backdrop-blur-sm shadow-lg">
                  <AlertCircle className="h-5 w-5 text-red-300" />
                  <AlertDescription className="text-red-100 font-medium">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Label htmlFor="email" className="text-white font-semibold text-base">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="email"
                  className="bg-slate-700/90 border-2 border-slate-500/50 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 h-12 text-base"
                />
                {focusedField === 'email' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
                  />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white font-semibold text-base">
                  Password
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-purple-300 hover:text-purple-200 hover:underline transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="current-password"
                  className="bg-slate-700/90 border-2 border-slate-500/50 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 pr-14 transition-all duration-300 h-12 text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-md"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
                {focusedField === 'password' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
                  />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-base shadow-xl hover:shadow-purple-500/30 transition-all duration-300 border-0 h-12" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Signing in...
                  </motion.div>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Sign In
                  </span>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>

        <CardFooter className="relative flex justify-center pt-6">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base text-slate-300"
          >
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-purple-300 hover:text-white font-semibold hover:underline transition-colors">
              Sign up
            </Link>
          </motion.p>
        </CardFooter>
      </Card>

      {/* Demo Accounts - Enhanced visibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center"
      >
        <p className="text-base text-slate-300 mb-6 flex items-center justify-center gap-3 font-medium">
          <Star className="h-5 w-5 text-yellow-400" />
          Quick Demo Access
          <Star className="h-5 w-5 text-yellow-400" />
        </p>
        <div className="flex gap-6 justify-center">
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fillDemoCredentials('student')}
            className="cursor-pointer bg-slate-800/90 border-2 border-blue-400/50 p-6 rounded-xl backdrop-blur-sm hover:border-blue-400/80 hover:bg-slate-700/90 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 min-w-[140px]"
          >
            <p className="font-bold text-blue-300 mb-3 text-lg">Student Demo</p>
            <p className="text-sm text-blue-200 mb-1 font-medium">user@example.com</p>
            <p className="text-sm text-blue-200 mb-3 font-medium">password123</p>
            <div className="text-xs text-blue-400 font-semibold bg-blue-900/30 px-3 py-1 rounded-full">Click to fill</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fillDemoCredentials('admin')}
            className="cursor-pointer bg-slate-800/90 border-2 border-purple-400/50 p-6 rounded-xl backdrop-blur-sm hover:border-purple-400/80 hover:bg-slate-700/90 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 min-w-[140px]"
          >
            <p className="font-bold text-purple-300 mb-3 text-lg">Admin Demo</p>
            <p className="text-sm text-purple-200 mb-1 font-medium">admin@example.com</p>
            <p className="text-sm text-purple-200 mb-3 font-medium">admin123</p>
            <div className="text-xs text-purple-400 font-semibold bg-purple-900/30 px-3 py-1 rounded-full">Click to fill</div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Login() {
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background - Reduced opacity for better visibility */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating Particles - Reduced quantity and opacity */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Mouse Follower - More visible */}
      <motion.div
        className="fixed pointer-events-none z-50 w-8 h-8 border-2 border-purple-400/60 rounded-full shadow-lg shadow-purple-400/20"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        {/* Header - Enhanced visibility */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link href="/" className="flex items-center gap-4 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-2 rounded-full bg-slate-800/50 border border-purple-400/30"
            >
              <ArrowLeft className="h-6 w-6 text-purple-300 group-hover:text-white transition-colors" />
            </motion.div>
            
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <BookOpen className="h-10 w-10 text-purple-400" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <h1 className="text-4xl font-bold text-white">
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  ExamPro
                </span>
              </h1>
            </div>
          </Link>
        </motion.div>

        {/* Login Form */}
        <Suspense
          fallback={
            <motion.div
              className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}