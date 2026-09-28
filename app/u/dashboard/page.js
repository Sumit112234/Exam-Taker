"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Crown,
  Flame,
  LineChart,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const EASE = [0.16, 1, 0.3, 1]

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap');
.ep-body{font-family:'Public Sans',ui-sans-serif,system-ui,sans-serif}
.ep-display{font-family:'Bricolage Grotesque','Public Sans',ui-sans-serif,system-ui,sans-serif;font-optical-sizing:auto}
.ep-num{font-variant-numeric:tabular-nums}
.ep-body :focus-visible{outline:2px solid #1D4FE0;outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;transition-duration:.001ms!important}}
`

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"

function PrimaryButton({ children, href, onClick, className = "", size = "md" }) {
  const pad = size === "sm" ? "px-3.5 py-2 text-sm" : "px-5 py-3 text-[15px]"
  const cls = `${btnBase} ${pad} bg-[#1D4FE0] text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0] ${className}`
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

function GhostButton({ children, href, onClick, className = "" }) {
  const cls = `${btnBase} border border-[#C9D3E6] bg-white px-4 py-2 text-sm text-[#0C1A3A] shadow-[0_2px_0_0_#C9D3E6] hover:bg-[#F8FAFD] ${className}`
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

/* ---------------- Helpers ---------------- */

function CountUp({ to, decimals = 0, suffix = "", duration = 1.6 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(to * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  const text = val.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return (
    <span className="ep-num">
      {text}
      {suffix}
    </span>
  )
}

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

/* ---------------- Skeleton ---------------- */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-[#E8EEFE]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-[#DDE4F0] bg-white" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="h-72 animate-pulse rounded-xl border border-[#DDE4F0] bg-white lg:col-span-4" />
        <div className="h-72 animate-pulse rounded-xl border border-[#DDE4F0] bg-white lg:col-span-3" />
      </div>
    </div>
  )
}

/* ---------------- Stat Card ---------------- */

function StatCard({ icon: Icon, label, value, sub, accent = "#1D4FE0", badge, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: EASE }}
      className="group relative overflow-hidden rounded-xl border border-[#DDE4F0] bg-white p-5 transition-shadow duration-200 hover:shadow-[0_20px_45px_-25px_rgba(12,26,58,0.35)]"
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.06] transition-transform duration-500 group-hover:scale-125"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#56637F]">{label}</p>
          <p className="ep-display mt-2 text-3xl font-bold tracking-tight text-[#0C1A3A]">{value}</p>
          {sub && <p className="mt-1.5 text-xs text-[#56637F]">{sub}</p>}
        </div>
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{ background: `${accent}14`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {badge && (
        <div className="relative mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: `${accent}14`, color: accent }}>
          {badge}
        </div>
      )}
    </motion.div>
  )
}

/* ---------------- Empty chart placeholder ---------------- */

function PerformanceChart({ recentExams }) {
  const hasData = recentExams.length > 0
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  // Placeholder shape when no real data — shows what will appear
  const placeholder = [0, 0, 0, 0, 0, 0, 0]

  if (!hasData) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-[#C9D3E6] bg-[#F8FAFD] text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#E8EEFE] text-[#1D4FE0]">
          <BarChart3 className="h-6 w-6" />
        </span>
        <p className="mt-3 font-semibold text-[#0C1A3A]">No performance data yet</p>
        <p className="mt-1 max-w-xs text-sm text-[#56637F]">
          Attempt a few mock tests and your score trend will show up here.
        </p>
        <PrimaryButton href="/exams" size="sm" className="mt-4">
          <Play className="h-3.5 w-3.5 fill-current" />
          Take a test
        </PrimaryButton>
      </div>
    )
  }

  const score = recentExams[0]?.score || 0
  const bars = [40, 52, 45, 60, 55, 70, score]

  return (
    <div>
      <div className="flex h-[200px] items-end gap-3 border-b border-[#DDE4F0] pb-1">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t bg-[#1D4FE0]"
            style={{ opacity: 0.35 + i * 0.1 }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(h, 4)}%` }}
            transition={{ delay: i * 0.06, duration: 0.9, ease: EASE }}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-3 text-[11px] text-[#56637F]">
        {days.map((d) => (
          <span key={d} className="flex-1 text-center">
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Section: Recommended exam row ---------------- */

function RecommendedRow({ exam, index }) {
  const c = exam.categoryColor || "#1D4FE0"
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: EASE }}
      className="flex items-center gap-3 rounded-lg border border-[#DDE4F0] bg-white p-3 transition-colors hover:border-[#1D4FE0]/40 hover:bg-[#F8FAFD]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold" style={{ background: `${c}18`, color: c }}>
        {exam.title?.charAt(0) || "?"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#0C1A3A]">{exam.title}</p>
        <p className="truncate text-xs text-[#56637F]">
          {exam.examName} · {exam.totalQuestions} Q · {exam.totalDuration} min
        </p>
      </div>
      <span
        className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-block"
        style={{ background: `${c}18`, color: c }}
      >
        {exam.difficulty}
      </span>
      <Link
        href={`/exams/${exam.id}`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#1D4FE0] text-white shadow-[0_2px_0_0_#1237A6] transition-colors hover:bg-[#2A5CF0]"
        aria-label={`Start ${exam.title}`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </motion.div>
  )
}

/* ---------------- Recent exam row ---------------- */

function RecentRow({ exam, index }) {
  const passed = exam.status === "Passed"
  const accent = passed ? "#12A150" : "#E5484D"
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: EASE }}
      className="flex items-center gap-3 border-b border-[#DDE4F0] py-4 last:border-0 last:pb-0 sm:gap-4"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#F3F6FB] text-[#56637F] sm:h-11 sm:w-11">
        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>

      {/* min-w-0 is the fix — lets truncate actually work inside flex */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#0C1A3A] sm:text-base">
          {exam.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#56637F]">
          {exam.examName} · {exam.date}
        </p>
        {/* timeTaken + correctness move to a second line on mobile instead of hiding */}
        <p className="mt-0.5 truncate text-xs text-[#56637F] sm:hidden">
          {exam.timeTaken} · {exam.correctAnswers}/{exam.totalQuestions} correct
        </p>
      </div>

      {/* Correct count stays hidden on mobile (moved into the meta line above) */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="ep-num text-sm font-bold text-[#0C1A3A]">
          {exam.correctAnswers}/{exam.totalQuestions}
        </p>
        <p className="text-[11px] text-[#56637F]">correct</p>
      </div>

      <span
        className="ep-num shrink-0 rounded-md px-2 py-1 text-xs font-bold sm:px-2.5 sm:text-sm"
        style={{ background: `${accent}14`, color: accent }}
      >
        {exam.score}%
      </span>

      <Link
        href={`/results/${exam.resultId}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#C9D3E6] bg-white text-[#0C1A3A] transition-colors hover:bg-[#F3F6FB] sm:h-8 sm:w-8"
        aria-label="View result"
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  )
}

/* ---------------- Main Dashboard ---------------- */

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    stats: { totalExams: 0, averageScore: 0, studyTime: 0, improvement: 0, bestScore: 0 },
    recentExams: [],
    recommendedExams: [],
    categoryStats: [],
    insights: { consistencyScore: 0, strongestCategory: null, weakestCategory: null, totalTimeSpent: null },
  })
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState("overview")

  useEffect(() => {
    setMounted(true)
    if (user) fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (response.ok) {
        const data = await response.json()
        // Normalize with safe defaults
        setDashboardData({
          stats: { totalExams: 0, averageScore: 0, studyTime: 0, improvement: 0, bestScore: 0, ...(data.stats || {}) },
          recentExams: data.recentExams || [],
          recommendedExams: data.recommendedExams || [],
          categoryStats: data.categoryStats || [],
          insights: { consistencyScore: 0, strongestCategory: null, weakestCategory: null, totalTimeSpent: null, ...(data.insights || {}) },
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  if (!mounted || loading) return <DashboardSkeleton />
  if (!user) return null

  const { stats, recentExams, recommendedExams, insights } = dashboardData
  const totalExams = stats.totalExams || user.examsTaken || 0
  const avgScore = stats.averageScore || user.averageScore || 0
  const isNewUser = totalExams === 0
  const hasSubscription = user.subscription?.status === "active"

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  return (
    <MotionConfig reducedMotion="user">
      <div className="ep-body space-y-6 text-[#0C1A3A]">
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

        {/* ---------- Welcome header ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full border-2 border-white shadow-[0_4px_12px_-2px_rgba(12,26,58,0.2)]"
              />
            ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#1D4FE0] text-base font-bold text-white">
                {user.name?.charAt(0) || "U"}
              </span>
            )}
            <div>
              <h1 className="ep-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
                {greeting()}, {user.name?.split(" ")[0] || "there"}
              </h1>
              <p className="text-sm text-[#56637F]">
                {isNewUser ? "Let's get your first test on the board." : "Here's how your prep is tracking."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-[#DDE4F0] bg-white px-3 py-2 text-sm text-[#56637F] sm:flex">
              <Calendar className="h-4 w-4" />
              {today}
            </div>
            <PrimaryButton href="/exams" size="sm">
              <Play className="h-3.5 w-3.5 fill-current" />
              Take a test
            </PrimaryButton>
          </div>
        </motion.div>

        {/* ---------- Subscription nudge ---------- */}
        <AnimatePresence>
          {!hasSubscription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex flex-col items-start gap-4 rounded-xl border border-[#FFD84A]/40 bg-gradient-to-r from-[#FFF6D6] to-white p-5 sm:flex-row sm:items-center">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#FFD84A]/30 text-[#7A5B00]">
                  <Crown className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="ep-display font-bold">You&apos;re on the free plan</p>
                  <p className="mt-0.5 text-sm text-[#56637F]">
                    Free mock tests are open to everyone. Premium tests unlock with a subscription.
                  </p>
                </div>
                <GhostButton href="/subscriptions" className="shrink-0">
                  View plans
                  <ArrowRight className="h-3.5 w-3.5" />
                </GhostButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Stat cards ---------- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            index={0}
            icon={BookOpen}
            label="Tests attempted"
            value={<CountUp to={totalExams} />}
            sub={stats.improvement ? `${stats.improvement > 0 ? "+" : ""}${stats.improvement}% from last week` : "Your first attempt awaits"}
            accent="#1D4FE0"
          />
          <StatCard
            index={1}
            icon={Target}
            label="Average score"
            value={<CountUp to={avgScore} suffix="%" />}
            sub={avgScore > 0 ? "Keep pushing" : "No score yet"}
            accent="#7C4DDB"
            badge={avgScore >= 70 ? "On track" : null}
          />
          <StatCard
            index={2}
            icon={Clock}
            label="Best score"
            value={<CountUp to={stats.bestScore || 0} suffix="%" />}
            sub={stats.bestScore > 0 ? "Personal record" : "Set your first record"}
            accent="#12A150"
          />
          <StatCard
            index={3}
            icon={hasSubscription ? Award : Zap}
            label={hasSubscription ? "Plan" : "Consistency"}
            value={hasSubscription ? user.subscription.plan || "Active" : <CountUp to={insights.consistencyScore || 0} suffix="%" />}
            sub={hasSubscription ? user.subscription.status : "Based on recent activity"}
            accent={hasSubscription ? "#12A150" : "#D97706"}
          />
        </div>

        {/* ---------- Tabs ---------- */}
        <div className="flex flex-wrap gap-1 rounded-lg border border-[#DDE4F0] bg-white p-1">
          {[
            ["overview", "Overview"],
            ["recent", "Recent activity"],
            ["performance", "Performance"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                tab === id ? "text-white" : "text-[#56637F] hover:bg-[#F3F6FB] hover:text-[#0C1A3A]"
              }`}
            >
              {tab === id && (
                <motion.span
                  layoutId="dash-tab"
                  className="absolute inset-0 rounded-md bg-[#1D4FE0]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        {/* ---------- Tab panels ---------- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="space-y-4"
          >
            {tab === "overview" && (
              <>
                <div className="grid gap-4 lg:grid-cols-7">
                  <div className="rounded-xl border border-[#DDE4F0] bg-white p-5 lg:col-span-4">
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h2 className="ep-display text-lg font-bold">Performance overview</h2>
                        <p className="text-sm text-[#56637F]">Your score trend, last 7 days</p>
                      </div>
                      {recentExams.length > 0 && (
                        <span className="rounded-md bg-[#E7F6EE] px-2.5 py-1 text-xs font-bold text-[#0C6B37]">
                          Latest: {recentExams[0].score}%
                        </span>
                      )}
                    </div>
                    <PerformanceChart recentExams={recentExams} />
                  </div>

                  <div className="rounded-xl border border-[#DDE4F0] bg-white p-5 lg:col-span-3">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h2 className="ep-display text-lg font-bold">Recommended for you</h2>
                        <p className="text-sm text-[#56637F]">Based on your activity</p>
                      </div>
                      <Sparkles className="h-4 w-4 text-[#7C4DDB]" />
                    </div>
                    {recommendedExams.length > 0 ? (
                      <div className="space-y-2.5">
                        {recommendedExams.slice(0, 3).map((exam, i) => (
                          <RecommendedRow key={exam.id} exam={exam} index={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#C9D3E6] bg-[#F8FAFD] p-6 text-center">
                        <p className="text-sm text-[#56637F]">No recommendations yet.</p>
                      </div>
                    )}
                    <Link
                      href="/exams"
                      className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-[#C9D3E6] bg-white py-2.5 text-sm font-semibold text-[#0C1A3A] transition-colors hover:bg-[#F8FAFD]"
                    >
                      Browse all exams
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: Play, title: "Take an exam", desc: "Jump into a mock test", href: "/exams", cta: "Browse", primary: true },
                    { icon: LineChart, title: "View results", desc: "Analyze past attempts", href: "/results", cta: "Open results" },
                    { icon: Crown, title: "Upgrade plan", desc: "Unlock premium tests", href: "/subscriptions", cta: "See plans" },
                  ].map(({ icon: Icon, title, desc, href, cta, primary }, i) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: EASE }}
                      className="group rounded-xl border border-[#DDE4F0] bg-white p-5 transition-shadow hover:shadow-[0_20px_45px_-25px_rgba(12,26,58,0.3)]"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#E8EEFE] text-[#1D4FE0] transition-colors group-hover:bg-[#1D4FE0] group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="ep-display mt-4 text-base font-bold">{title}</h3>
                      <p className="mt-1 text-sm text-[#56637F]">{desc}</p>
                      {primary ? (
                        <PrimaryButton href={href} size="sm" className="mt-4 w-full">
                          {cta}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </PrimaryButton>
                      ) : (
                        <GhostButton href={href} className="mt-4 w-full">
                          {cta}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </GhostButton>
                      )}
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {tab === "recent" && (
              <div className="rounded-xl border border-[#DDE4F0] bg-white p-5 sm:p-6">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h2 className="ep-display text-lg font-bold">Recent activity</h2>
                    <p className="text-sm text-[#56637F]">Your exam history</p>
                  </div>
                  {recentExams.length > 0 && (
                    <span className="ep-num rounded-full bg-[#F3F6FB] px-2.5 py-1 text-xs font-bold text-[#56637F]">
                      {recentExams.length} {recentExams.length === 1 ? "attempt" : "attempts"}
                    </span>
                  )}
                </div>
                {recentExams.length > 0 ? (
                  <div>
                    {recentExams.map((exam, i) => (
                      <RecentRow key={exam.id || i} exam={exam} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-[#E8EEFE] text-[#1D4FE0]">
                      <BookOpen className="h-7 w-7" />
                    </span>
                    <h3 className="ep-display mt-4 text-lg font-bold">No attempts yet</h3>
                    <p className="mt-1 max-w-xs text-sm text-[#56637F]">
                      Every mock you take will show up here with a full breakdown.
                    </p>
                    <PrimaryButton href="/exams" className="mt-5">
                      <Play className="h-4 w-4 fill-current" />
                      Take your first test
                    </PrimaryButton>
                  </div>
                )}
              </div>
            )}

            {tab === "performance" && (
              <>
                <div className="rounded-xl border border-[#DDE4F0] bg-white p-5 sm:p-6">
                  <h2 className="ep-display text-lg font-bold">Subject breakdown</h2>
                  <p className="text-sm text-[#56637F]">Where you stand across categories</p>

                  {dashboardData.categoryStats.length > 0 ? (
                    <div className="mt-6 space-y-5">
                      {dashboardData.categoryStats.map((s, i) => (
                        <div key={s.category || i}>
                          <div className="mb-2 flex items-baseline justify-between text-sm">
                            <span className="font-semibold">{s.category}</span>
                            <span className="ep-num font-bold text-[#0C1A3A]">{s.score}%</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-[#DDE4F0]">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: s.color || "#1D4FE0" }}
                              initial={{ width: 0 }}
                              animate={{ width: `${s.score}%` }}
                              transition={{ delay: i * 0.1, duration: 1, ease: EASE }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-lg border border-dashed border-[#C9D3E6] bg-[#F8FAFD] p-8 text-center">
                      <BarChart3 className="mx-auto h-8 w-8 text-[#9AA7C2]" />
                      <p className="mt-3 font-semibold text-[#0C1A3A]">Not enough data yet</p>
                      <p className="mt-1 text-sm text-[#56637F]">
                        Category-level analytics appear after you attempt a few tests.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#DDE4F0] bg-white p-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="ep-display text-lg font-bold">Insights</h2>
                      <p className="text-sm text-[#56637F]">What to focus on next</p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-[#12A150]" />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <InsightCard
                      icon={Trophy}
                      label="Strongest area"
                      value={insights.strongestCategory || "—"}
                      tone={insights.strongestCategory ? "good" : "muted"}
                    />
                    <InsightCard
                      icon={Target}
                      label="Needs work"
                      value={insights.weakestCategory || "—"}
                      tone={insights.weakestCategory ? "warn" : "muted"}
                    />
                    <InsightCard
                      icon={Flame}
                      label="Consistency"
                      value={`${insights.consistencyScore || 0}%`}
                      tone="accent"
                    />
                    <InsightCard
                      icon={Clock}
                      label="Total time"
                      value={insights.totalTimeSpent || "—"}
                      tone="muted"
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

function InsightCard({ icon: Icon, label, value, tone = "muted" }) {
  const tones = {
    good: { bg: "#E7F6EE", fg: "#0C6B37" },
    warn: { bg: "#FFF6D6", fg: "#7A5B00" },
    accent: { bg: "#E8EEFE", fg: "#1D4FE0" },
    muted: { bg: "#F3F6FB", fg: "#56637F" },
  }
  const t = tones[tone]
  return (
    <div className="rounded-lg border border-[#DDE4F0] bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md" style={{ background: t.bg, color: t.fg }}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#56637F]">{label}</p>
      </div>
      <p className="ep-display mt-3 truncate text-xl font-bold text-[#0C1A3A]">{value}</p>
    </div>
  )
}