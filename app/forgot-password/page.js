"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { AlertCircle, ArrowLeft, CheckCircle, Mail, Send } from "lucide-react"

const EASE = [0.16, 1, 0.3, 1]

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap');
.ep-body{font-family:'Public Sans',ui-sans-serif,system-ui,sans-serif}
.ep-display{font-family:'Bricolage Grotesque','Public Sans',ui-sans-serif,system-ui,sans-serif;font-optical-sizing:auto}
.ep-body :focus-visible{outline:2px solid #1D4FE0;outline-offset:2px}
@keyframes ep-ring{0%{box-shadow:0 0 0 0 rgba(29,79,224,.4)}100%{box-shadow:0 0 0 14px rgba(29,79,224,0)}}
.ep-pulse{animation:ep-ring 1.8s ease-out infinite}
@media (prefers-reduced-motion:reduce){.ep-pulse{animation:none}}
`

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 disabled:active:shadow-[0_3px_0_0_#1237A6]"

function Logo({ compact = false }) {
  return (
    <Link href="/" className="flex items-center">
      <img
        src="/exampro-logo-full.png"
        alt="ExamPro — Mock Tests & Assessment"
        className={compact ? "h-8 w-auto" : "h-9 w-auto sm:h-10"}
      />
    </Link>
  )
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email")
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="ep-body relative flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-[#F3F6FB] p-5 text-[#0C1A3A] selection:bg-[#FFD84A]">
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

        {/* Dotted backdrop with radial mask, matching the landing hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(12,26,58,.11) 1px, transparent 1.5px)",
            backgroundSize: "22px 22px",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mb-8"
        >
          <Logo />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
          className="relative w-full max-w-md overflow-hidden rounded-xl border border-[#C9D3E6] bg-white shadow-[0_30px_70px_-25px_rgba(12,26,58,0.35)]"
        >
          {/* Exam-style navy header strip */}
          <div className="flex items-center gap-3 bg-[#0C1A3A] px-6 py-4 text-white">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10">
              <Mail className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="ep-display truncate text-base font-bold leading-tight">Password recovery</p>
              <p className="text-[11px] leading-tight text-white/60">ExamPro account access</p>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <h1 className="ep-display text-2xl font-bold tracking-[-0.02em]">Forgot password?</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[#56637F]">
              Enter the email linked to your account and we&apos;ll send a reset link.
            </p>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  role="alert"
                  className="overflow-hidden rounded-lg bg-[#FDECEC] text-[#A6282E]"
                >
                  <div className="flex gap-2.5 p-3 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  role="status"
                  className="overflow-hidden rounded-lg bg-[#E7F6EE] text-[#0C6B37]"
                >
                  <div className="flex gap-2.5 p-3 text-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                    <span className="leading-relaxed">
                      <span className="font-bold">Reset link sent.</span> Check{" "}
                      <span className="font-semibold">{email}</span> or your spam folder — the link expires in 30 minutes.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#0C1A3A]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-[#C9D3E6] bg-white px-3.5 py-3 text-[15px] text-[#0C1A3A] placeholder:text-[#9AA7C2] transition-colors hover:border-[#1D4FE0]/50 focus:border-[#1D4FE0] focus:outline-none focus:ring-2 focus:ring-[#1D4FE0]/25"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className={`${btnBase} w-full bg-[#1D4FE0] px-6 py-3.5 text-base text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0]`}
              >
                {isLoading ? (
                  <>
                    <motion.span
                      aria-hidden
                      className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    />
                    Sending…
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4" strokeWidth={2.5} />
                    Link sent
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send reset link
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 border-t border-[#DDE4F0] pt-5 text-center text-sm text-[#56637F]">
              Remember your password?{" "}
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-[#1D4FE0] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          className="relative mt-6 text-center text-xs text-[#56637F]"
        >
          Free tests need no payment. Ever.
        </motion.p>
      </div>
    </MotionConfig>
  )
}