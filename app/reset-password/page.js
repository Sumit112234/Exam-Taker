"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldAlert,
} from "lucide-react"

const EASE = [0.16, 1, 0.3, 1]

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap');
.ep-body{font-family:'Public Sans',ui-sans-serif,system-ui,sans-serif}
.ep-display{font-family:'Bricolage Grotesque','Public Sans',ui-sans-serif,system-ui,sans-serif;font-optical-sizing:auto}
.ep-num{font-variant-numeric:tabular-nums}
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

/* ---------------- Password rules + strength ---------------- */

const RULES = [
  { id: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "num", label: "One number", test: (p) => /\d/.test(p) },
  { id: "sym", label: "One symbol (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function useStrength(pw) {
  const passed = RULES.filter((r) => r.test(pw)).length
  const pct = (passed / RULES.length) * 100
  const label = passed <= 1 ? "Weak" : passed <= 3 ? "Fair" : passed === 4 ? "Good" : "Strong"
  const color = passed <= 1 ? "#E5484D" : passed <= 3 ? "#D97706" : passed === 4 ? "#1D4FE0" : "#12A150"
  return { passed, pct, label, color }
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete = "new-password",
  show,
  onToggle,
  onBlur,
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[#0C1A3A]">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA7C2]" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="w-full rounded-lg border border-[#C9D3E6] bg-white py-3 pl-10 pr-11 text-[15px] text-[#0C1A3A] placeholder:text-[#9AA7C2] transition-colors hover:border-[#1D4FE0]/50 focus:border-[#1D4FE0] focus:outline-none focus:ring-2 focus:ring-[#1D4FE0]/25 disabled:bg-[#F3F6FB] disabled:text-[#56637F]"
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-[#56637F] transition-colors hover:bg-[#F3F6FB] hover:text-[#0C1A3A]"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Main form ---------------- */

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const strength = useStrength(password)
  const allRulesMet = strength.passed === RULES.length
  const matches = confirmPassword.length > 0 && password === confirmPassword
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword

  useEffect(() => {
    if (!success) return
    setCountdown(3)
    const id = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
    const go = setTimeout(() => router.push("/login"), 3000)
    return () => {
      clearInterval(id)
      clearTimeout(go)
    }
  }, [success, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!allRulesMet) {
      setError("Your password doesn't meet all the requirements yet.")
      return
    }
    if (!matches) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed")
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  /* ---- Invalid / missing token state ---- */

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-[#C9D3E6] bg-white shadow-[0_30px_70px_-25px_rgba(12,26,58,0.35)]"
      >
        <div className="flex items-center gap-3 bg-[#0C1A3A] px-6 py-4 text-white">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#E5484D]/20 text-[#FF8A8E]">
            <ShieldAlert className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="ep-display truncate text-base font-bold leading-tight">Link not valid</p>
            <p className="text-[11px] leading-tight text-white/60">Password recovery</p>
          </div>
        </div>

        <div className="p-6 text-center sm:p-7">
          <h1 className="ep-display text-2xl font-bold tracking-[-0.02em]">Invalid reset link</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#56637F]">
            This password reset link is invalid or has expired. Reset links are valid for 30 minutes.
          </p>
          <Link
            href="/forgot-password"
            className={`${btnBase} mt-6 w-full bg-[#1D4FE0] px-6 py-3.5 text-base text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0]`}
          >
            Request a new link
          </Link>
          <p className="mt-5 border-t border-[#DDE4F0] pt-5 text-sm text-[#56637F]">
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
    )
  }

  /* ---- Success state ---- */

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-[#C9D3E6] bg-white shadow-[0_30px_70px_-25px_rgba(12,26,58,0.35)]"
      >
        <div className="flex items-center gap-3 bg-[#0C1A3A] px-6 py-4 text-white">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#12A150]/20 text-[#3DDC84]">
            <CheckCircle className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="ep-display truncate text-base font-bold leading-tight">Password updated</p>
            <p className="text-[11px] leading-tight text-white/60">ExamPro account access</p>
          </div>
        </div>

        <div className="p-6 text-center sm:p-7">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.15 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#E7F6EE] text-[#12A150]"
          >
            <Check className="h-8 w-8" strokeWidth={3} />
          </motion.span>
          <h1 className="ep-display mt-5 text-2xl font-bold tracking-[-0.02em]">All set</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#56637F]">
            Your password has been reset. Redirecting you to login&hellip;
          </p>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#DDE4F0]">
            <motion.div
              className="h-full rounded-full bg-[#1D4FE0]"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
          <p className="ep-num mt-3 text-xs text-[#56637F]">
            Redirecting in {countdown}s
          </p>

          <Link
            href="/login"
            className={`${btnBase} mt-5 w-full border border-[#C9D3E6] bg-white px-6 py-3.5 text-base text-[#0C1A3A] shadow-[0_3px_0_0_#C9D3E6] hover:bg-[#F8FAFD]`}
          >
            Go to login now
          </Link>
        </div>
      </motion.div>
    )
  }

  /* ---- Default form ---- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
      className="relative w-full max-w-md overflow-hidden rounded-xl border border-[#C9D3E6] bg-white shadow-[0_30px_70px_-25px_rgba(12,26,58,0.35)]"
    >
      <div className="flex items-center gap-3 bg-[#0C1A3A] px-6 py-4 text-white">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10">
          <KeyRound className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="ep-display truncate text-base font-bold leading-tight">Set a new password</p>
          <p className="text-[11px] leading-tight text-white/60">Password recovery</p>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <h1 className="ep-display text-2xl font-bold tracking-[-0.02em]">Reset password</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#56637F]">
          Choose a strong password you haven&apos;t used before.
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
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <PasswordField
            id="password"
            label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            show={showPw}
            onToggle={() => setShowPw((s) => !s)}
          />

          {/* Strength meter */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#56637F]">Password strength</span>
              <span className="font-bold" style={{ color: strength.color }}>
                {password ? strength.label : "—"}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#DDE4F0]">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                transition={{ duration: 0.35, ease: EASE }}
              />
            </div>

            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {RULES.map((r) => {
                const ok = r.test(password)
                return (
                  <li key={r.id} className="flex items-center gap-2 text-xs">
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors ${
                        ok ? "border-[#12A150] bg-[#12A150] text-white" : "border-[#C9D3E6] bg-white text-transparent"
                      }`}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={4} />
                    </span>
                    <span className={ok ? "text-[#0C6B37]" : "text-[#56637F]"}>{r.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <PasswordField
              id="confirmPassword"
              label="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              show={showCpw}
              onToggle={() => setShowCpw((s) => !s)}
            />
            <AnimatePresence>
              {(matches || mismatch) && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${
                    matches ? "text-[#0C6B37]" : "text-[#A6282E]"
                  }`}
                >
                  {matches ? (
                    <>
                      <Check className="h-3.5 w-3.5" strokeWidth={3} /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" /> Passwords don&apos;t match
                    </>
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isLoading || !allRulesMet || !matches}
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
                Resetting…
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Reset password
              </>
            )}
          </button>
        </form>

        <p className="mt-5 border-t border-[#DDE4F0] pt-5 text-center text-sm text-[#56637F]">
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
  )
}

/* ---------------- Page shell ---------------- */

export default function ResetPassword() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="ep-body relative flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-[#F3F6FB] p-5 text-[#0C1A3A] selection:bg-[#FFD84A]">
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(12,26,58,.11) 1px, transparent 1.5px)",
            backgroundSize: "22px 22px",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)",
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

        <div className="relative w-full max-w-md">
          <Suspense
            fallback={
              <div className="overflow-hidden rounded-xl border border-[#C9D3E6] bg-white shadow-[0_30px_70px_-25px_rgba(12,26,58,0.35)]">
                <div className="h-16 animate-pulse bg-[#0C1A3A]" />
                <div className="space-y-4 p-6 sm:p-7">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-[#E8EEFE]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#F3F6FB]" />
                  <div className="h-11 w-full animate-pulse rounded-lg bg-[#F3F6FB]" />
                  <div className="h-11 w-full animate-pulse rounded-lg bg-[#F3F6FB]" />
                  <div className="h-11 w-full animate-pulse rounded-lg bg-[#E8EEFE]" />
                </div>
              </div>
            }
          >
            {mounted && <ResetPasswordForm />}
          </Suspense>
        </div>

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