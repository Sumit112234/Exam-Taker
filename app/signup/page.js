"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  UserPlus,
  Target,
  TrendingUp,
  GraduationCap,
  Clock,
  Check,
} from "lucide-react"
import { useRouter } from "next/navigation"

const EASE = [0.16, 1, 0.3, 1]

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap');
.ep-body{font-family:'Public Sans',ui-sans-serif,system-ui,sans-serif}
.ep-display{font-family:'Bricolage Grotesque','Public Sans',ui-sans-serif,system-ui,sans-serif;font-optical-sizing:auto}
.ep-num{font-variant-numeric:tabular-nums}
.ep-body :focus-visible{outline:2px solid #1D4FE0;outline-offset:2px}
.ep-on-dark :focus-visible{outline-color:#FFD84A}
@keyframes ep-ring{0%{box-shadow:0 0 0 0 rgba(255,255,255,.35)}100%{box-shadow:0 0 0 10px rgba(255,255,255,0)}}
.ep-pulse{animation:ep-ring 1.8s ease-out infinite}
@media (prefers-reduced-motion:reduce){.ep-pulse{animation:none}}
`

export default function ProfessionalSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const password = formData.password
    const newValidations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: formData.password === formData.confirmPassword && formData.confirmPassword !== ""
    }
    
    setValidations(newValidations)
    
    const strength = Object.values(newValidations).slice(0, 5).filter(Boolean).length
    setPasswordStrength(strength)
  }, [formData.password, formData.confirmPassword])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("") // Clear error when user starts typing
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Full name is required")
      return false
    }
    
    if (!formData.email.trim()) {
      setError("Email address is required")
      return false
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    
    if (passwordStrength < 4) {
      setError("Password must include uppercase, lowercase, number, and special character")
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    
    return true
  }
   const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    console.log("Form submitted with data:", formData)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

        if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Signup failed")
      }

      // Redirect to dashboard after successful signup
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }

  }

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "#E5484D"
    if (passwordStrength <= 3) return "#D97706"
    return "#12A150"
  }

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
  }

  if (!mounted) {
    return (
      <div className="ep-body flex min-h-screen items-center justify-center bg-[#F3F6FB]">
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <motion.div
          className="h-8 w-8 rounded-full border-4 border-[#1D4FE0] border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  const requirements = [
    { key: 'length', label: '8+ characters' },
    { key: 'uppercase', label: 'Uppercase letter' },
    { key: 'lowercase', label: 'Lowercase letter' },
    { key: 'number', label: 'Number' },
    { key: 'special', label: 'Special character' }
  ]

  const features = [
    {
      icon: Target,
      title: "Personalized plans",
      description: "Study plans built around your target exam, timeline and weak areas"
    },
    {
      icon: TrendingUp,
      title: "Progress tracking",
      description: "Detailed analytics to monitor accuracy and speed over time"
    },
    {
      icon: GraduationCap,
      title: "Expert-verified content",
      description: "Questions and solutions reviewed by subject matter experts"
    }
  ]

  return (
    <div className="ep-body relative min-h-screen bg-[#F3F6FB] lg:grid lg:grid-cols-2">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Left side - Branding and Features */}
      <div className="ep-on-dark relative hidden overflow-hidden bg-[#0C1A3A] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,.09) 1px, transparent 1.5px)',
            backgroundSize: '22px 22px',
            WebkitMaskImage: 'radial-gradient(circle at 30% 20%, black, transparent 75%)',
            maskImage: 'radial-gradient(circle at 30% 20%, black, transparent 75%)',
          }}
        />
        <div aria-hidden className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[#1D4FE0]/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#2FB8B0]/15 blur-3xl" />

        <motion.a
          href="/"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative flex items-center gap-3"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white p-1.5">
            <img src="/exampro-logo-mark.png" alt="" className="h-full w-full object-contain" />
          </span>
          <span className="ep-display text-xl font-bold text-white">ExamPro</span>
        </motion.a>

        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="ep-display max-w-md text-4xl font-bold leading-[1.08] tracking-[-0.02em] text-white xl:text-[2.75rem]"
          >
            Start your journey to exam success
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
            className="relative mt-4 max-w-sm text-white/70"
          >
            Join thousands of aspirants who trust ExamPro for SSC, Banking, Railways, UPSC and
            State PSC preparation. Free tests to start, premium tests when you&apos;re ready.
          </motion.p>

          <div className="relative mt-9 space-y-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.1, duration: 0.5, ease: EASE }}
                className="flex items-start gap-4"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/60">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="relative flex items-center gap-2 text-sm text-white/60"
        >
          <span className="ep-pulse h-2 w-2 rounded-full bg-[#3DDC84]" />
          <span className="ep-num font-semibold text-white">50,000+</span>
          aspirants already preparing on ExamPro
        </motion.div>
      </div>

      {/* Right side - Signup Form */}
      <form onSubmit={handleSubmit} className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto w-full max-w-md"
        >
          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#56637F] transition-colors hover:text-[#0C1A3A] lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ExamPro
          </motion.a>

          {/* Mobile branding */}
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#E8EEFE]">
              <img src="/exampro-logo-mark.png" alt="" className="h-6 w-6 object-contain" />
            </span>
            <span className="ep-display text-xl font-bold text-[#0C1A3A]">ExamPro</span>
          </div>

          {/* Form Header */}
          <div className="mb-7">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFE] px-3 py-1 text-sm font-semibold text-[#1D4FE0]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Create account
            </motion.div>

            <h2 className="ep-display text-3xl font-bold tracking-tight text-[#0C1A3A]">
              Join ExamPro today
            </h2>
            <p className="mt-1.5 text-[#56637F]">
              Create your account and start preparing for success
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-[#DDE4F0] bg-white p-7 shadow-[0_30px_70px_-35px_rgba(12,26,58,0.35)] sm:p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-lg border border-[#E5484D]/30 bg-[#FDECEC] p-4">
                    <AlertCircle className="h-5 w-5 shrink-0 text-[#E5484D]" />
                    <p className="text-sm font-medium text-[#A6282E]">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-[#0C1A3A]">
                  Full name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A97B3]" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full rounded-lg border-2 bg-white py-3 pl-11 pr-4 text-[#0C1A3A] outline-none transition-colors duration-200 placeholder:text-[#8A97B3] ${
                      focusedField === 'name' ? 'border-[#1D4FE0]' : 'border-[#DDE4F0] hover:border-[#C9D3E6]'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#0C1A3A]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A97B3]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full rounded-lg border-2 bg-white py-3 pl-11 pr-4 text-[#0C1A3A] outline-none transition-colors duration-200 placeholder:text-[#8A97B3] ${
                      focusedField === 'email' ? 'border-[#1D4FE0]' : 'border-[#DDE4F0] hover:border-[#C9D3E6]'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[#0C1A3A]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A97B3]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full rounded-lg border-2 bg-white py-3 pl-11 pr-11 text-[#0C1A3A] outline-none transition-colors duration-200 placeholder:text-[#8A97B3] ${
                      focusedField === 'password' ? 'border-[#1D4FE0]' : 'border-[#DDE4F0] hover:border-[#C9D3E6]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A97B3] transition-colors hover:text-[#1D4FE0]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                <AnimatePresence>
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#56637F]">Password strength</span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: getStrengthColor() }}
                        >
                          {getStrengthText()}
                        </span>
                      </div>
                      <div className="flex h-1.5 gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex-1 overflow-hidden rounded-full bg-[#DDE4F0]">
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: i < passwordStrength ? 1 : 0 }}
                              transition={{ duration: 0.3, delay: i * 0.05 }}
                              style={{ backgroundColor: getStrengthColor(), transformOrigin: "left" }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                        {requirements.map((req) => (
                          <div key={req.key} className="flex items-center gap-1.5">
                            {validations[req.key] ? (
                              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#12A150]" />
                            ) : (
                              <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#C9D3E6]" />
                            )}
                            <span className={validations[req.key] ? 'text-[#0C6B37]' : 'text-[#8A97B3]'}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-[#0C1A3A]">
                  Confirm password
                </label>
                <div className="relative">
                  <Shield className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A97B3]" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full rounded-lg border-2 bg-white py-3 pl-11 pr-11 text-[#0C1A3A] outline-none transition-colors duration-200 placeholder:text-[#8A97B3] ${
                      focusedField === 'confirmPassword' ? 'border-[#1D4FE0]' : 'border-[#DDE4F0] hover:border-[#C9D3E6]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A97B3] transition-colors hover:text-[#1D4FE0]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <AnimatePresence>
                  {formData.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 flex items-center gap-2"
                    >
                      {validations.match ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-[#12A150]" />
                          <span className="text-sm font-medium text-[#0C6B37]">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-[#E5484D]" />
                          <span className="text-sm font-medium text-[#A6282E]">Passwords don&apos;t match</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D4FE0] py-3.5 font-bold text-white shadow-[0_3px_0_0_#1237A6] transition-colors duration-200 hover:bg-[#2A5CF0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Sign In Link */}
            <div className="mt-6 text-center text-sm text-[#56637F]">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-[#1D4FE0] transition-colors hover:text-[#153CA8]">
                Sign in
              </a>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-[#8A97B3]">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="text-[#56637F] underline hover:text-[#1D4FE0]">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-[#56637F] underline hover:text-[#1D4FE0]">Privacy Policy</a>
          </p>
        </motion.div>
      </form>
    </div>
  )
}