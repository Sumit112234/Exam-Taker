"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Eye,
  Filter,
  Lock,
  Play,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const EASE = [0.16, 1, 0.3, 1]

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap');
.ep-body{font-family:'Public Sans',ui-sans-serif,system-ui,sans-serif}
.ep-display{font-family:'Bricolage Grotesque','Public Sans',ui-sans-serif,system-ui,sans-serif;font-optical-sizing:auto}
.ep-num{font-variant-numeric:tabular-nums}
.ep-body :focus-visible{outline:2px solid #1D4FE0;outline-offset:2px}
`

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"

/* ------------------------------------------------------------------ *
 *  Types / constants
 * ------------------------------------------------------------------ */

const DIFFICULTY_TONE = {
  Easy: { bg: "#E7F6EE", fg: "#0C6B37" },
  Medium: { bg: "#FFF6D6", fg: "#7A5B00" },
  Hard: { bg: "#FDECEC", fg: "#A6282E" },
}

const TYPE_LABEL = {
  full: "Full test",
  mini: "Mini test",
  sectional: "Sectional",
  "chapter-wise": "Chapter-wise",
}

/* ------------------------------------------------------------------ *
 *  Pills / badges
 * ------------------------------------------------------------------ */

function Pill({ children, tone = "muted", className = "" }) {
  const tones = {
    muted: { bg: "#F3F6FB", fg: "#56637F" },
    blue: { bg: "#E8EEFE", fg: "#1D4FE0" },
    green: { bg: "#E7F6EE", fg: "#0C6B37" },
    amber: { bg: "#FFF6D6", fg: "#7A5B00" },
    red: { bg: "#FDECEC", fg: "#A6282E" },
    purple: { bg: "#F2EBFD", fg: "#5A32A8" },
  }
  const t = tones[tone] || tones.muted
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${className}`}
      style={{ background: t.bg, color: t.fg }}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ *
 *  Select — native, mobile-friendly, brand-styled
 * ------------------------------------------------------------------ */

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-[#C9D3E6] bg-white px-3.5 py-2.5 pr-9 text-sm font-medium text-[#0C1A3A] transition-colors hover:border-[#1D4FE0]/50 focus:border-[#1D4FE0] focus:outline-none focus:ring-2 focus:ring-[#1D4FE0]/25"
      >
        <option value="all">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#56637F]" />
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Exam card
 * ------------------------------------------------------------------ */

function ExamCard({ exam, resultId, needsSubscription, index }) {
  const attempts = useMemo(() => Math.floor(Math.random() * 1000 + 142), [exam._id])
  const locked = needsSubscription

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: EASE }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[#DDE4F0] bg-white transition-shadow duration-200 hover:shadow-[0_24px_50px_-28px_rgba(12,26,58,0.35)]"
    >
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-[#1D4FE0] to-[#7C4DDB]" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Pill tone="blue">{TYPE_LABEL[exam.type] || exam.type}</Pill>
              {exam.difficulty && (
                <Pill tone={exam.difficulty === "Easy" ? "green" : exam.difficulty === "Hard" ? "red" : "amber"}>
                  {exam.difficulty}
                </Pill>
              )}
            </div>
            <h3 className="ep-display line-clamp-2 text-base font-bold leading-snug tracking-tight text-[#0C1A3A] group-hover:text-[#1D4FE0]">
              {exam.title}
            </h3>
            {exam.examName && (
              <p className="mt-1 truncate text-xs text-[#56637F]">{exam.examName}</p>
            )}
          </div>
          {locked && (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FFF6D6] text-[#7A5B00]">
              <Lock className="h-4 w-4" />
            </span>
          )}
        </div>

        {/* Meta grid */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
          <Meta icon={Clock} label={`${exam.totalDuration} min`} />
          <Meta icon={BookOpen} label={`${exam.totalQuestions} Q`} />
          <Meta icon={Award} label={`${Math.floor(exam.totalMarks || 0)} marks`} />
          <Meta icon={Users} label={`${attempts} attempts`} />
        </div>

        {/* Sections */}
        {exam.sections?.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1.5">
              {exam.sections.slice(0, 3).map((s, i) => (
                <span
                  key={i}
                  className="rounded-md border border-[#DDE4F0] bg-[#F8FAFD] px-2 py-0.5 text-[11px] font-medium text-[#56637F]"
                >
                  {s.name}
                </span>
              ))}
              {exam.sections.length > 3 && (
                <span className="rounded-md border border-[#DDE4F0] bg-[#F8FAFD] px-2 py-0.5 text-[11px] font-medium text-[#56637F]">
                  +{exam.sections.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-[#DDE4F0] p-3">
        {locked ? (
          <Link
            href="/subscriptions"
            className={`${btnBase} w-full bg-[#0C1A3A] px-4 py-2.5 text-sm text-white shadow-[0_3px_0_0_#000] hover:bg-[#1A2A50]`}
          >
            <Lock className="h-3.5 w-3.5" />
            Unlock with premium
          </Link>
        ) : resultId ? (
          <div className="flex gap-2">
            <Link
              href={`/exams/${exam._id}`}
              className={`${btnBase} flex-1 border border-[#C9D3E6] bg-white px-3 py-2.5 text-sm text-[#0C1A3A] shadow-[0_2px_0_0_#C9D3E6] hover:bg-[#F8FAFD]`}
            >
              <Eye className="h-3.5 w-3.5" />
              Details
            </Link>
            <Link
              href={`/results/${resultId}`}
              className={`${btnBase} flex-1 bg-[#12A150] px-3 py-2.5 text-sm text-white shadow-[0_3px_0_0_#0A6D34] hover:bg-[#16B85A]`}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              View result
            </Link>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href={`/u/exams/${exam._id}`}
              className={`${btnBase} flex-1 border border-[#C9D3E6] bg-white px-3 py-2.5 text-sm text-[#0C1A3A] shadow-[0_2px_0_0_#C9D3E6] hover:bg-[#F8FAFD]`}
            >
              <Eye className="h-3.5 w-3.5" />
              Details
            </Link>
            <Link
              href={`/u/exams/${exam._id}/instructions`}
              className={`${btnBase} flex-1 bg-[#1D4FE0] px-3 py-2.5 text-sm text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0]`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Meta({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-[#56637F]">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate text-[13px] font-medium">{label}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Empty state
 * ------------------------------------------------------------------ */

function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-[#C9D3E6] bg-[#F8FAFD] p-12 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#E8EEFE] text-[#1D4FE0]">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="ep-display mt-4 text-lg font-bold text-[#0C1A3A]">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#56637F]">{desc}</p>
      {action}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Skeleton
 * ------------------------------------------------------------------ */

function ExamsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-[#E8EEFE]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-[#DDE4F0] bg-white" />
        ))}
      </div>
      <div className="h-20 animate-pulse rounded-xl border border-[#DDE4F0] bg-white" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl border border-[#DDE4F0] bg-white" />
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Main page
 * ------------------------------------------------------------------ */

export default function ExamsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [exams, setExams] = useState({ exams: [], filters: { examNames: [], difficulties: [], types: [] } })
  const [resultIds, setResultIds] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("exams")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({ examType: "all", difficulty: "all", type: "all" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const resultsRes = await fetch("/api/results/exam")
      if (resultsRes.ok) {
        const resultData = await resultsRes.json()
        const map = {}
        resultData.results?.forEach(({ examId, resultId }) => {
          map[examId] = resultId
        })
        setResultIds(map)
      }

      const examsRes = await fetch("/api/exams")
      if (examsRes.ok) {
        const examsData = await examsRes.json()
        setExams({
          exams: examsData.exams || [],
          filters: examsData.filters || { examNames: [], difficulties: [], types: [] },
        })
      }
    } catch (err) {
      console.error("Error fetching exams:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredExams = useMemo(() => {
    const list = exams.exams || []
    const q = searchQuery.trim().toLowerCase()
    return list.filter((exam) => {
      if (!exam.isActive) return false
      if (exam.totalQuestions !== exam.totalQuestionsUploaded) return false
      if (filters.type !== "all" && exam.type !== filters.type) return false
      if (filters.difficulty !== "all" && exam.difficulty !== filters.difficulty) return false
      if (filters.examType !== "all" && exam.examName !== filters.examType) return false
      if (q && !exam.title?.toLowerCase().includes(q) && !exam.type?.toLowerCase().includes(q)) return false
      return true
    })
  }, [exams, filters, searchQuery])

  const checkUserSubscription = (required) => {
    if (!required) return false
    const sub = user?.subscription
    const active = sub?.status === "active"
    const valid = sub?.expiry ? new Date(sub.expiry) > new Date() : false
    return !(active && valid)
  }

  const clearFilters = () => {
    setFilters({ examType: "all", difficulty: "all", type: "all" })
    setSearchQuery("")
  }

  const activeFilterCount = [
    filters.examType !== "all",
    filters.difficulty !== "all",
    filters.type !== "all",
    searchQuery.trim() !== "",
  ].filter(Boolean).length

  if (isLoading) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="ep-body bg-[#F3F6FB]">
          <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <ExamsSkeleton />
          </div>
        </div>
      </MotionConfig>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="ep-body min-h-screen bg-[#F3F6FB] text-[#0C1A3A]">
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Back + heading */}
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={() => router.push("/u/dashboard")}
            className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-[#C9D3E6] bg-white px-3 py-1.5 text-sm font-semibold text-[#0C1A3A] shadow-[0_2px_0_0_#C9D3E6] transition-colors hover:bg-[#F8FAFD]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </motion.button>

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="ep-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                Exam portal
              </h1>
              <p className="mt-1.5 text-sm text-[#56637F] sm:text-base">
                Full-length mocks and chapter-wise tests across every exam you follow.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#56637F]">
              <span className="ep-num rounded-full bg-white px-3 py-1 font-semibold text-[#0C1A3A] shadow-[0_1px_0_0_#DDE4F0]">
                {filteredExams.length} {filteredExams.length === 1 ? "test" : "tests"}
              </span>
            </div>
          </div>

          {/* Filters — desktop */}
          <div className="mb-6 hidden rounded-xl border border-[#DDE4F0] bg-white p-4 sm:block">
            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA7C2]" />
                <input
                  type="text"
                  placeholder="Search tests…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#C9D3E6] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#0C1A3A] placeholder:text-[#9AA7C2] transition-colors hover:border-[#1D4FE0]/50 focus:border-[#1D4FE0] focus:outline-none focus:ring-2 focus:ring-[#1D4FE0]/25"
                />
              </div>
              <FilterSelect
                value={filters.examType}
                onChange={(v) => setFilters((f) => ({ ...f, examType: v }))}
                options={exams.filters?.examNames || []}
                placeholder="All exam types"
              />
              <FilterSelect
                value={filters.difficulty}
                onChange={(v) => setFilters((f) => ({ ...f, difficulty: v }))}
                options={exams.filters?.difficulties || []}
                placeholder="All difficulties"
              />
              <FilterSelect
                value={filters.type}
                onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
                options={exams.filters?.types || []}
                placeholder="All test types"
              />
            </div>
          </div>

          {/* Mobile filter toggle */}
          <div className="mb-4 flex gap-2 sm:hidden">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA7C2]" />
              <input
                type="text"
                placeholder="Search tests…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#C9D3E6] bg-white py-2.5 pl-10 pr-3.5 text-sm placeholder:text-[#9AA7C2] focus:border-[#1D4FE0] focus:outline-none focus:ring-2 focus:ring-[#1D4FE0]/25"
              />
            </div>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-lg border border-[#C9D3E6] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0C1A3A] shadow-[0_2px_0_0_#C9D3E6]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#1D4FE0] text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#56637F]">
                Active filters
              </span>
              {filters.examType !== "all" && (
                <Chip label={filters.examType} onClear={() => setFilters((f) => ({ ...f, examType: "all" }))} />
              )}
              {filters.difficulty !== "all" && (
                <Chip label={filters.difficulty} onClear={() => setFilters((f) => ({ ...f, difficulty: "all" }))} />
              )}
              {filters.type !== "all" && (
                <Chip label={filters.type} onClear={() => setFilters((f) => ({ ...f, type: "all" }))} />
              )}
              {searchQuery && <Chip label={`"${searchQuery}"`} onClear={() => setSearchQuery("")} />}
              <button
                onClick={clearFilters}
                className="ml-1 text-xs font-semibold text-[#1D4FE0] hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-5 flex gap-1 rounded-lg border border-[#DDE4F0] bg-white p-1">
            {[
              ["exams", "Full exams", filteredExams.length, BookOpen],
              ["mock-tests", "Mock tests", 0, Award],
            ].map(([id, label, count, Icon]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === id ? "text-white" : "text-[#56637F] hover:bg-[#F3F6FB] hover:text-[#0C1A3A]"
                }`}
              >
                {activeTab === id && (
                  <motion.span
                    layoutId="exams-tab"
                    className="absolute inset-0 rounded-md bg-[#1D4FE0]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                  <span className={`ep-num rounded-full px-1.5 text-[11px] ${activeTab === id ? "bg-white/20" : "bg-[#F3F6FB]"}`}>
                    {count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {activeTab === "exams" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredExams.length > 0 ? (
                    filteredExams.map((exam, i) => (
                      <ExamCard
                        key={exam._id}
                        exam={exam}
                        resultId={resultIds[exam._id]}
                        needsSubscription={checkUserSubscription(exam.visibility?.subscriptionRequired)}
                        index={i}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="No tests match your filters"
                      desc="Try clearing a filter or searching for a different exam."
                      action={
                        <button
                          onClick={clearFilters}
                          className={`${btnBase} mt-5 bg-[#1D4FE0] px-4 py-2.5 text-sm text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0]`}
                        >
                          Clear filters
                        </button>
                      }
                    />
                  )}
                </div>
              )}

              {activeTab === "mock-tests" && (
                <EmptyState
                  icon={Award}
                  title="Mock tests are coming soon"
                  desc="Full-length timed simulations will appear here once they're published."
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 z-40 bg-[#0C1A3A]/40 backdrop-blur-sm sm:hidden"
              />
              <motion.div
                key="drawer"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.32, ease: EASE }}
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-[#DDE4F0] bg-white p-5 shadow-[0_-20px_50px_-20px_rgba(12,26,58,0.35)] sm:hidden"
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#DDE4F0]" />
                <div className="flex items-center justify-between">
                  <h3 className="ep-display text-lg font-bold">Filters</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="grid h-8 w-8 place-items-center rounded-md text-[#56637F] hover:bg-[#F3F6FB]"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#56637F]">
                      Exam type
                    </label>
                    <FilterSelect
                      value={filters.examType}
                      onChange={(v) => setFilters((f) => ({ ...f, examType: v }))}
                      options={exams.filters?.examNames || []}
                      placeholder="All exam types"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#56637F]">
                      Difficulty
                    </label>
                    <FilterSelect
                      value={filters.difficulty}
                      onChange={(v) => setFilters((f) => ({ ...f, difficulty: v }))}
                      options={exams.filters?.difficulties || []}
                      placeholder="All difficulties"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#56637F]">
                      Test type
                    </label>
                    <FilterSelect
                      value={filters.type}
                      onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
                      options={exams.filters?.types || []}
                      placeholder="All test types"
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={clearFilters}
                    className={`${btnBase} flex-1 border border-[#C9D3E6] bg-white px-4 py-2.5 text-sm text-[#0C1A3A] shadow-[0_2px_0_0_#C9D3E6]`}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className={`${btnBase} flex-1 bg-[#1D4FE0] px-4 py-2.5 text-sm text-white shadow-[0_3px_0_0_#1237A6]`}
                  >
                    Apply ({filteredExams.length})
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

function Chip({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9D3E6] bg-white px-3 py-1 text-xs font-semibold text-[#0C1A3A]">
      {label}
      <button onClick={onClear} aria-label={`Remove ${label}`} className="text-[#56637F] hover:text-[#A6282E]">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Clock, Search, BookOpen, Users, Award, Play, Eye, Lock, ArrowLeft, SettingsIcon } from "lucide-react"
// import { useAuth } from "@/contexts/AuthContext"
// import { useRouter } from "next/navigation"


// // need to fetch result with resultId and exam id.
// export default function ExamsPage() {
//   const { user } = useAuth()
//   const [examTypes, setExamTypes] = useState([])
//   const [exams, setExams] = useState([])
//   const [resultIds, setResultIds] = useState([])
//   const [subscription, setSubscription] = useState(null)
//   const [mockTests, setMockTests] = useState([])
//   const [filteredExams, setFilteredExams] = useState([])
//   const [filteredMockTests, setFilteredMockTests] = useState([])
//   const [filters, setFilters] = useState({
//     examType: "all",
//     difficulty: "all",
//     type: "all",
//   })
//   const [searchQuery, setSearchQuery] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState("exams")

//   useEffect(() => {
//     fetchData()
//     fetchIsUserValidSubscription()
//   }, [])

//   useEffect(() => {
//     filterData()
//   }, [exams, mockTests, filters, searchQuery])


//    const router = useRouter()

//   const getAttampts = (attempts) => {
//     return Math.floor(Math.random() * 1000 + 142)
//   }

//   useEffect(()=>{
//     if(user)
//     {
//       setSubscription(user?.subscription?.subscriptionId )
//     }
//     if(subscription)
//     {

//       // subscription is mil chuki h now ek subscription route mai se fetch krna h ki konsi categories included h subscripion mai and then usko ek usestate bana k usme
//       // store krna h
      
//       console.log("subscription is ", subscription)
//     }
//   },[user, subscription])

//   const fetchData = async () => {
//     try {
//       setIsLoading(true)

//       // Fetch exam types
//       // const examTypesResponse = await fetch("/api/exam-types")
//       // if (examTypesResponse.ok) {
//       //   const examTypesData = await examTypesResponse.json()
//       //   setExamTypes(examTypesData)
//       // }
//       const resultResopnse = await fetch("/api/results/exam")
//       if (resultResopnse.ok) {
//         const resultData = await resultResopnse.json()
//         console.log("Fetched results:", resultData)

//         const resultMap = {}
//         resultData.results?.forEach(({ examId, resultId }) => {
//           resultMap[examId] = resultId
//         })

//         setResultIds(resultMap)
//         // setResultIds(resultData.examIds || [])


//       }

//       // Fetch exams
//       const examsResponse = await fetch("/api/exams")
//       if (examsResponse.ok) {
//         const examsData = await examsResponse.json()
//         console.log("Fetched exams:", examsData)
//         setExams(examsData)


//       }




//       // Fetch mock tests
//       // const mockTestsResponse = await fetch("/api/mock-tests")
//       // if (mockTestsResponse.ok) {
//       //   const mockTestsData = await mockTestsResponse.json()
//       //   setMockTests(mockTestsData)
//       // }
//     } catch (error) {
//       console.error("Error fetching data:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const filterData = () => {
//     // Filter exams
//     console.log( exams , filters, searchQuery)
    

//     const filteredExamsData =  exams?.exams?.filter((exam) => {
//       const matchesExamType = (filters.type === "all" || exam.type === filters.type) && (filters.difficulty === "all" || exam.difficulty === filters.difficulty) && (filters.examType === "all" || exam.examName
//  === filters.examType) && (exam.totalQuestions === exam.totalQuestionsUploaded)

//       const matchesSearch =
//         searchQuery === '' ||
//         exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         exam.type.toLowerCase().includes(searchQuery.toLowerCase())

//         console.log(matchesExamType, matchesSearch, exam.isActive)
//       // Check if exam is active

//       return matchesExamType && matchesSearch && exam.isActive
//     })

//     console.log("Filtered Exams:", filteredExamsData)

//     // Filter mock tests
//     const filteredMockTestsData = mockTests.filter((mockTest) => {
//       const matchesExamType = filters.examType === "all" || mockTest.examId?.examType === filters.examType
//       const matchesDifficulty = filters.difficulty === "all" || mockTest.difficulty === filters.difficulty
//       const matchesType = filters.type === "all" || mockTest.type === filters.type
//       const matchesSearch = !searchQuery || mockTest.title.toLowerCase().includes(searchQuery.toLowerCase())

//       return matchesExamType && matchesDifficulty && matchesType && matchesSearch && mockTest.isActive
//     })

//     // console.log("Filtered Exams:", filteredExamsData)
//     // console.log("Filtered Mock Tests:", filteredMockTestsData)
//     // Update state with filtered data
//     setFilteredExams(filteredExamsData ? filteredExamsData : [])
//     setFilteredMockTests(filteredMockTestsData)
//   }


//   console.log('user is :', user)
//   const fetchIsUserValidSubscription = async () => {
//     try {
//       console.log("Fetching user subscription status for user:", user)
//       return ;
//       const response = await fetch("/api/subscription?userId=" + user._id)

//       if (response.ok) {
//         const data = await response.json()
//         console.log("User subscription status:", data)
//       }

//     } catch (error) {
//       console.error("Error fetching user subscription status:", error)
//     }
//   }



//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }))
//   }

//   const checkUserSubscription = (subscriptionRequired) => {
//     if (!subscriptionRequired) {  
//       return false
//     }



//     // user?.subscription?.status === "active" && user?.subscription?.expiry && new Date(user.subscription.expiry) > new Date() ? false : true

//     return true;
//   }



//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
//       </div>
//     )
//   }


//   return (
//     <div className="min-h-screen  mx-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">

//            <div className="pt-5">
//         <Button variant="outline" className="" size="icon" onClick={() => router.push('/dashboard')}>
//             <ArrowLeft className="h-4 w-4 " />
//           </Button>
       
      
//       </div>

//       <div className="container py-6  mx-auto">
//         <div className="mb-6">
//           <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             Exam Portal
//           </h1>
//           <p className="text-muted-foreground mt-2">Choose from our comprehensive collection of exams and mock tests</p>
//         </div>

//         {/* Exam Types Overview */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
//           {examTypes.map((examType) => (
//             <Card key={examType._id} className="card-hover border-l-4" style={{ borderLeftColor: examType.color }}>
//               <CardHeader className="pb-3">
//                 <div className="flex items-center gap-2">
//                   <span className="text-2xl">{examType.icon}</span>
//                   <div>
//                     <CardTitle className="text-lg">{examType.name}</CardTitle>
//                     <CardDescription className="text-sm">{examType.code}</CardDescription>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex justify-between text-sm">
//                   <span>Exams: {exams.filter((e) => e.examType._id === examType._id).length}</span>
//                   <span>Mock Tests: {mockTests.filter((m) => m.examId?.examType === examType._id).length}</span>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Filters */}
//         <Card className="mb-6 card-hover">
//           <CardContent className="pt-6">
//             <div className="grid gap-4 md:grid-cols-4">
//               <div className="relative">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search exams and tests..."
//                   className="pl-8"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               {console.log(examTypes, exams)}
//               <Select value={filters.examType} onValueChange={(value) => handleFilterChange("examType", value)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Exam Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Exam Types</SelectItem>
//                   {exams.filters.examNames.map((type,id) => (
//                     <SelectItem key={id} value={type}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Difficulty" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Difficulties</SelectItem>
//                     {exams.filters.difficulties.map((type,id) => (
//                     <SelectItem key={id} value={type}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                   {/* <SelectItem value="Easy">Easy</SelectItem>
//                   <SelectItem value="Medium">Medium</SelectItem>
//                   <SelectItem value="Hard">Hard</SelectItem> */}
//                 </SelectContent>
//               </Select>
//               <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Test Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                     {exams.filters.types.map((type,id) => (
//                     <SelectItem key={id} value={type}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                   {/* <SelectItem value="full">Full Tests</SelectItem>
//                   <SelectItem value="mini">Mini Tests</SelectItem>
//                   <SelectItem value="sectional">Sectional Tests</SelectItem> */}
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Main Content */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//           <TabsList className="grid w-full grid-cols-2 lg:w-96">
//             <TabsTrigger value="exams" className="flex items-center gap-2">
//               <BookOpen className="h-4 w-4" />
//               Full Exams ({filteredExams.length})
//             </TabsTrigger>
//             <TabsTrigger value="mock-tests" className="flex items-center gap-2">
//               <Award className="h-4 w-4" />
//               Mock Tests ({filteredMockTests.length})
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="exams" className="space-y-6">
//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {filteredExams.length > 0 ? (
//                 filteredExams.map((exam) => (
//                   // {console.log(exam)}
//                   <Card key={exam._id} className="overflow-hidden card-hover group">
//                     <CardHeader>
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
//                             {exam.title}
//                           </CardTitle>
//                           <CardDescription className="mt-1 flex items-center gap-2">
//                             {/* {console.log(exam)} */}
//                             <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
//                               {exam.type}
//                             </span>
//                           </CardDescription>
//                         </div>
//                         {!exam?.visibility?.isFree && user?.subscription?.status === "inactive" && <Badge variant="secondary">Unlock Now</Badge>}
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-muted-foreground" />
//                             <span>{exam.totalDuration} mins</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <BookOpen className="h-4 w-4 text-muted-foreground" />
//                             <span>{exam.totalQuestions} questions</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Award className="h-4 w-4 text-muted-foreground" />
//                             <span>{Math.floor(exam.totalMarks)} marks</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Users className="h-4 w-4 text-muted-foreground" />
//                             <span>{getAttampts(exam.attempts)} attempts</span>
//                           </div>
//                         </div>

//                         {exam.sections && exam.sections.length > 0 && (
//                           <div>
//                             <p className="text-sm font-medium mb-2">Sections:</p>
//                             <div className="flex flex-wrap gap-1">
//                               {exam.sections.slice(0, 3).map((section, index) => (
//                                 <Badge key={index} variant="outline" className="text-xs">
//                                   {section.name}
//                                 </Badge>
//                               ))}
//                               {exam.sections.length > 3 && (
//                                 <Badge variant="outline" className="text-xs">
//                                   +{exam.sections.length - 3} more
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                     <CardFooter className="flex gap-2">
//                     {checkUserSubscription(exam.visibility.subscriptionRequired) ? (
//                       <Link href="/subscriptions" className="flex-1">
//                         <Button variant="destructive" className="w-full">
//                           <Lock className="mr-2 h-4 w-4" />
//                           Unlock Now
//                         </Button>
//                       </Link>
//                     ) : resultIds[exam._id] ? (
//                       <Link href={`/results/${resultIds[exam._id]}`} className="flex-1">
//                         <Button variant="outline" className="w-full">
//                           <Eye className="mr-2 h-4 w-4" />
//                           View Result
//                         </Button>
//                       </Link>
//                     ) : (
//                       <>
//                         <Link href={`/exams/${exam._id}`} className="flex-1">
//                           <Button variant="outline" className="w-full">
//                             <Eye className="mr-2 h-4 w-4" />
//                             View Details
//                           </Button>
//                         </Link>
//                         <Link href={`/exams/${exam._id}/instructions`} className="flex-1">
//                           <Button className="w-full">
//                             <Play className="mr-2 h-4 w-4" />
//                             Start Exam
//                           </Button>
//                         </Link>
//                       </>
//                     )}


//                     </CardFooter>

//                   </Card>
//                 ))
//               ) : (
//                 <div className="col-span-full text-center py-12">
//                   <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
//                   <p className="text-muted-foreground">
//                     No exams found matching your criteria. Try adjusting your filters.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </TabsContent>

//           <TabsContent value="mock-tests" className="space-y-6">
//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {filteredMockTests.length > 0 ? (
//                 filteredMockTests.map((mockTest) => (
//                   <Card key={mockTest._id} className="overflow-hidden card-hover group">
//                     <CardHeader>
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
//                             {mockTest.title}
//                           </CardTitle>
//                           <CardDescription className="mt-1 flex items-center gap-2">
//                             <Badge
//                               variant={
//                                 mockTest.type === "full"
//                                   ? "default"
//                                   : mockTest.type === "mini"
//                                     ? "secondary"
//                                     : "outline"
//                               }
//                               className="text-xs"
//                             >
//                               {mockTest.type === "full"
//                                 ? "Full Test"
//                                 : mockTest.type === "mini"
//                                   ? "Mini Test"
//                                   : "Sectional"}
//                             </Badge>
//                             <Badge
//                               variant={
//                                 mockTest.difficulty === "Easy"
//                                   ? "outline"
//                                   : mockTest.difficulty === "Medium"
//                                     ? "secondary"
//                                     : "default"
//                               }
//                               className="text-xs"
//                             >
//                               {mockTest.difficulty}
//                             </Badge>
//                           </CardDescription>
//                         </div>
//                         {!mockTest.isFree && !user?.subscription?.status && <Badge variant="secondary">Premium</Badge>}
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-muted-foreground" />
//                             <span>{mockTest.duration} mins</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <BookOpen className="h-4 w-4 text-muted-foreground" />
//                             <span>{mockTest.totalQuestions} questions</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Award className="h-4 w-4 text-muted-foreground" />
//                             <span>{mockTest.totalMarks} marks</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Users className="h-4 w-4 text-muted-foreground" />
//                             <span>{mockTest.attempts} attempts</span>
//                           </div>
//                         </div>

//                         {mockTest.sections && mockTest.sections.length > 0 && (
//                           <div>
//                             <p className="text-sm font-medium mb-2">Sections:</p>
//                             <div className="flex flex-wrap gap-1">
//                               {mockTest.sections.slice(0, 2).map((section, index) => (
//                                 <Badge key={index} variant="outline" className="text-xs">
//                                   {section.name}
//                                 </Badge>
//                               ))}
//                               {mockTest.sections.length > 2 && (
//                                 <Badge variant="outline" className="text-xs">
//                                   +{mockTest.sections.length - 2} more
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                     <CardFooter className="flex gap-2">
//                       <Link href={`/mock-tests/${mockTest._id}`} className="flex-1">
//                         <Button variant="outline" className="w-full">
//                           <Eye className="mr-2 h-4 w-4" />
//                           View Details
//                         </Button>
//                       </Link>
//                       <Link href={`/mock-tests/${mockTest._id}/start`} className="flex-1">
//                         <Button className="w-full">
//                           <Play className="mr-2 h-4 w-4" />
//                           Start Test
//                         </Button>
//                       </Link>
//                     </CardFooter>
//                   </Card>
//                 ))
//               ) : (
//                 <div className="col-span-full text-center py-12">
//                   <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
//                   <p className="text-muted-foreground">
//                     No mock tests found matching your criteria. Try adjusting your filters.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }


// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Clock, Search, BookOpen, Users, Award, Play, Eye, Lock, Loader2 } from "lucide-react"
// import { useAuth } from "@/contexts/AuthContext"

// // Mock API data - in a real app, this would come from actual API calls
// const mockExamTypes = [
//   { _id: "1", name: "JEE Main", code: "JEE", icon: "📘", color: "#3b82f6" },
//   { _id: "2", name: "NEET UG", code: "NEET", icon: "🧪", color: "#10b981" },
//   { _id: "3", name: "UPSC", code: "UPSC", icon: "📚", color: "#8b5cf6" },
//   { _id: "4", name: "GATE", code: "GATE", icon: "🔬", color: "#ec4899" },
// ]

// const mockExams = [
//   {
//     _id: "e1",
//     title: "JEE Main 2023 Paper 1",
//     examType: { _id: "1", name: "JEE Main" },
//     type: "Full Test",
//     totalDuration: 180,
//     totalQuestions: 75,
//     totalMarks: 300,
//     attempts: 12500,
//     isActive: true,
//     visibility: { isFree: true, subscriptionRequired: false },
//     sections: [
//       { name: "Physics", questions: 25 },
//       { name: "Chemistry", questions: 25 },
//       { name: "Mathematics", questions: 25 }
//     ]
//   },
//   {
//     _id: "e2",
//     title: "NEET UG 2023 Paper",
//     examType: { _id: "2", name: "NEET UG" },
//     type: "Full Test",
//     totalDuration: 200,
//     totalQuestions: 180,
//     totalMarks: 720,
//     attempts: 9800,
//     isActive: true,
//     visibility: { isFree: false, subscriptionRequired: true },
//     sections: [
//       { name: "Physics", questions: 45 },
//       { name: "Chemistry", questions: 45 },
//       { name: "Biology", questions: 90 }
//     ]
//   },
//   {
//     _id: "e3",
//     title: "UPSC Prelims 2023",
//     examType: { _id: "3", name: "UPSC" },
//     type: "Objective",
//     totalDuration: 120,
//     totalQuestions: 100,
//     totalMarks: 200,
//     attempts: 5600,
//     isActive: true,
//     visibility: { isFree: true, subscriptionRequired: false },
//     sections: [
//       { name: "General Studies I", questions: 100 }
//     ]
//   },
//   {
//     _id: "e4",
//     title: "GATE Computer Science 2023",
//     examType: { _id: "4", name: "GATE" },
//     type: "Full Test",
//     totalDuration: 180,
//     totalQuestions: 65,
//     totalMarks: 100,
//     attempts: 3200,
//     isActive: true,
//     visibility: { isFree: false, subscriptionRequired: true },
//     sections: [
//       { name: "Technical", questions: 55 },
//       { name: "General Aptitude", questions: 10 }
//     ]
//   },
// ]

// const mockMockTests = [
//   {
//     _id: "m1",
//     title: "JEE Main Physics Mock Test",
//     examType: "1",
//     difficulty: "Medium",
//     type: "sectional",
//     duration: 60,
//     totalQuestions: 25,
//     totalMarks: 100,
//     attempts: 4500,
//     isActive: true,
//     isFree: true,
//     sections: [
//       { name: "Mechanics", questions: 10 },
//       { name: "Electromagnetism", questions: 10 },
//       { name: "Modern Physics", questions: 5 }
//     ]
//   },
//   {
//     _id: "m2",
//     title: "NEET Biology Practice Test",
//     examType: "2",
//     difficulty: "Hard",
//     type: "sectional",
//     duration: 90,
//     totalQuestions: 90,
//     totalMarks: 360,
//     attempts: 3200,
//     isActive: true,
//     isFree: false,
//     sections: [
//       { name: "Botany", questions: 45 },
//       { name: "Zoology", questions: 45 }
//     ]
//   },
//   {
//     _id: "m3",
//     title: "UPSC Current Affairs Mini Test",
//     examType: "3",
//     difficulty: "Easy",
//     type: "mini",
//     duration: 30,
//     totalQuestions: 20,
//     totalMarks: 40,
//     attempts: 2100,
//     isActive: true,
//     isFree: true,
//     sections: [
//       { name: "Current Affairs", questions: 20 }
//     ]
//   },
// ]

// const mockResults = {
//   results: [
//     { examId: "e1", resultId: "r1" },
//     { examId: "e3", resultId: "r3" }
//   ]
// }

// export default function ExamsPage() {
//   const { user } = useAuth()
//   const [examTypes, setExamTypes] = useState([])
//   const [exams, setExams] = useState([])
//   const [resultIds, setResultIds] = useState({})
//   const [mockTests, setMockTests] = useState([])
//   const [filteredExams, setFilteredExams] = useState([])
//   const [filteredMockTests, setFilteredMockTests] = useState([])
//   const [filters, setFilters] = useState({
//     examType: "all",
//     difficulty: "all",
//     type: "all",
//   })
//   const [searchQuery, setSearchQuery] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState("exams")

//   useEffect(() => {
//     fetchData()
//   }, [])

//   useEffect(() => {
//     filterData()
//   }, [exams, mockTests, filters, searchQuery])

//   const fetchData = async () => {
//     try {
//       setIsLoading(true)

//       // Simulate API calls with timeouts
//       setTimeout(() => {
//         setExamTypes(mockExamTypes)
//       }, 300)

//       setTimeout(() => {
//         setResultIds(mockResults.results.reduce((acc, result) => {
//           acc[result.examId] = result.resultId
//           return acc
//         }, {}))
//       }, 400)

//       setTimeout(() => {
//         setExams(mockExams)
//       }, 500)

//       setTimeout(() => {
//         setMockTests(mockMockTests)
//       }, 600)

//     } catch (error) {
//       console.error("Error fetching data:", error)
//     } finally {
//       setTimeout(() => {
//         setIsLoading(false)
//       }, 800)
//     }
//   }

//   const filterData = () => {
//     // Filter exams
//     const filteredExamsData = exams.filter((exam) => {
//       const matchesExamType = filters.examType === "all" || exam.examType._id === filters.examType
//       const matchesSearch =
//         !searchQuery ||
//         exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         exam.type.toLowerCase().includes(searchQuery.toLowerCase())

//       return matchesExamType && matchesSearch && exam.isActive
//     })

//     // Filter mock tests
//     const filteredMockTestsData = mockTests.filter((mockTest) => {
//       const matchesExamType = filters.examType === "all" || mockTest.examType === filters.examType
//       const matchesDifficulty = filters.difficulty === "all" || mockTest.difficulty === filters.difficulty
//       const matchesType = filters.type === "all" || mockTest.type === filters.type
//       const matchesSearch = !searchQuery || mockTest.title.toLowerCase().includes(searchQuery.toLowerCase())

//       return matchesExamType && matchesDifficulty && matchesType && matchesSearch && mockTest.isActive
//     })

//     setFilteredExams(filteredExamsData)
//     setFilteredMockTests(filteredMockTestsData)
//   }

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }))
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
//       <div className="container py-6 px-4 sm:px-6">
//         <div className="mb-8 text-center">
//           <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//             Exam Portal
//           </h1>
//           <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
//             Choose from our comprehensive collection of exams and mock tests to enhance your preparation
//           </p>
//         </div>

//         {/* Exam Types Overview */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
//           {examTypes.map((examType) => (
//             <Card 
//               key={examType._id} 
//               className="border-l-4 hover:shadow-lg transition-shadow duration-300"
//               style={{ borderLeftColor: examType.color }}
//             >
//               <CardHeader className="pb-3">
//                 <div className="flex items-center gap-3">
//                   <span className="text-2xl">{examType.icon}</span>
//                   <div>
//                     <CardTitle className="text-lg text-gray-800">{examType.name}</CardTitle>
//                     <CardDescription className="text-sm text-gray-600">{examType.code}</CardDescription>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-700">Exams: {exams.filter((e) => e.examType._id === examType._id).length}</span>
//                   <span className="text-gray-700">Mock Tests: {mockTests.filter((m) => m.examType === examType._id).length}</span>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Filters */}
//         <Card className="mb-6 shadow-sm border border-blue-100">
//           <CardContent className="pt-6 pb-4">
//             <div className="grid gap-4 md:grid-cols-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <Input
//                   placeholder="Search exams and tests..."
//                   className="pl-10 border border-gray-300 rounded-lg"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <Select value={filters.examType} onValueChange={(value) => handleFilterChange("examType", value)}>
//                 <SelectTrigger className="border border-gray-300 rounded-lg">
//                   <SelectValue placeholder="Exam Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Exam Types</SelectItem>
//                   {examTypes.map((type) => (
//                     <SelectItem key={type._id} value={type._id}>
//                       {type.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
//                 <SelectTrigger className="border border-gray-300 rounded-lg">
//                   <SelectValue placeholder="Difficulty" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Difficulties</SelectItem>
//                   <SelectItem value="Easy">Easy</SelectItem>
//                   <SelectItem value="Medium">Medium</SelectItem>
//                   <SelectItem value="Hard">Hard</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
//                 <SelectTrigger className="border border-gray-300 rounded-lg">
//                   <SelectValue placeholder="Test Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                   <SelectItem value="full">Full Tests</SelectItem>
//                   <SelectItem value="mini">Mini Tests</SelectItem>
//                   <SelectItem value="sectional">Sectional Tests</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Main Content */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//           <TabsList className="grid w-full grid-cols-2 lg:w-96 bg-blue-50 border border-blue-100">
//             <TabsTrigger value="exams" className="flex items-center gap-2 data-[state=active]:bg-blue-500">
//               <BookOpen className="h-4 w-4" />
//               Full Exams ({filteredExams.length})
//             </TabsTrigger>
//             <TabsTrigger value="mock-tests" className="flex items-center gap-2 data-[state=active]:bg-blue-500">
//               <Award className="h-4 w-4" />
//               Mock Tests ({filteredMockTests.length})
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="exams" className="space-y-6">
//             <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//               {filteredExams.length > 0 ? (
//                 filteredExams.map((exam) => (
//                   <Card 
//                     key={exam._id} 
//                     className="overflow-hidden border border-blue-100 hover:shadow-lg transition-shadow duration-300 group"
//                   >
//                     <CardHeader>
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors text-gray-800">
//                             {exam.title}
//                           </CardTitle>
//                           <CardDescription className="mt-2 flex items-center gap-2">
//                             <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//                               {exam.examType.name}
//                             </Badge>
//                             <Badge className="bg-indigo-100 text-indigo-800">
//                               {exam.type}
//                             </Badge>
//                           </CardDescription>
//                         </div>
//                         {exam.visibility.subscriptionRequired && user?.subscription?.status === "inactive" && (
//                           <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Premium</Badge>
//                         )}
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-blue-500" />
//                             <span>{exam.totalDuration} mins</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <BookOpen className="h-4 w-4 text-blue-500" />
//                             <span>{exam.totalQuestions} questions</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Award className="h-4 w-4 text-blue-500" />
//                             <span>{exam.totalMarks} marks</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Users className="h-4 w-4 text-blue-500" />
//                             <span>{exam.attempts.toLocaleString()} attempts</span>
//                           </div>
//                         </div>

//                         {exam.sections && exam.sections.length > 0 && (
//                           <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">Sections:</p>
//                             <div className="flex flex-wrap gap-1">
//                               {exam.sections.slice(0, 3).map((section, index) => (
//                                 <Badge 
//                                   key={index} 
//                                   variant="outline" 
//                                   className="text-xs bg-blue-50 text-blue-700 border-blue-200"
//                                 >
//                                   {section.name} ({section.questions || section.questionsCount})
//                                 </Badge>
//                               ))}
//                               {exam.sections.length > 3 && (
//                                 <Badge 
//                                   variant="outline" 
//                                   className="text-xs bg-blue-50 text-blue-700 border-blue-200"
//                                 >
//                                   +{exam.sections.length - 3} more
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                     <CardFooter className="flex gap-2">
//                       {exam.visibility.subscriptionRequired && user?.subscription?.status === "inactive" ? (
//                         <Link href="/subscriptions" className="flex-1">
//                           <Button variant="destructive" className="w-full bg-gradient-to-r from-red-500 to-orange-500">
//                             <Lock className="mr-2 h-4 w-4" />
//                             Unlock Now
//                           </Button>
//                         </Link>
//                       ) : resultIds[exam._id] ? (
//                         <Link href={`/results/${resultIds[exam._id]}`} className="flex-1">
//                           <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
//                             <Eye className="mr-2 h-4 w-4" />
//                             View Result
//                           </Button>
//                         </Link>
//                       ) : (
//                         <>
//                           <Link href={`/exams/${exam._id}`} className="flex-1">
//                             <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
//                               <Eye className="mr-2 h-4 w-4" />
//                               View Details
//                             </Button>
//                           </Link>
//                           <Link href={`/exams/${exam._id}/start`} className="flex-1">
//                             <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
//                               <Play className="mr-2 h-4 w-4" />
//                               Start Exam
//                             </Button>
//                           </Link>
//                         </>
//                       )}
//                     </CardFooter>
//                   </Card>
//                 ))
//               ) : (
//                 <div className="col-span-full text-center py-12">
//                   <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                   <p className="text-gray-600">
//                     No exams found matching your criteria. Try adjusting your filters.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </TabsContent>

//           <TabsContent value="mock-tests" className="space-y-6">
//             <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//               {filteredMockTests.length > 0 ? (
//                 filteredMockTests.map((mockTest) => (
//                   <Card 
//                     key={mockTest._id} 
//                     className="overflow-hidden border border-blue-100 hover:shadow-lg transition-shadow duration-300 group"
//                   >
//                     <CardHeader>
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors text-gray-800">
//                             {mockTest.title}
//                           </CardTitle>
//                           <CardDescription className="mt-2 flex items-center gap-2">
//                             <Badge 
//                               variant={
//                                 mockTest.type === "full"
//                                   ? "default"
//                                   : mockTest.type === "mini"
//                                     ? "secondary"
//                                     : "outline"
//                               }
//                               className={`text-xs ${
//                                 mockTest.type === "full" 
//                                   ? "bg-indigo-100 text-indigo-800" 
//                                   : mockTest.type === "mini" 
//                                     ? "bg-purple-100 text-purple-800" 
//                                     : "bg-blue-100 text-blue-800"
//                               }`}
//                             >
//                               {mockTest.type === "full"
//                                 ? "Full Test"
//                                 : mockTest.type === "mini"
//                                   ? "Mini Test"
//                                   : "Sectional"}
//                             </Badge>
//                             <Badge
//                               variant={
//                                 mockTest.difficulty === "Easy"
//                                   ? "outline"
//                                   : mockTest.difficulty === "Medium"
//                                     ? "secondary"
//                                     : "default"
//                               }
//                               className={`text-xs ${
//                                 mockTest.difficulty === "Easy" 
//                                   ? "bg-green-100 text-green-800 border-green-200" 
//                                   : mockTest.difficulty === "Medium" 
//                                     ? "bg-yellow-100 text-yellow-800" 
//                                     : "bg-red-100 text-red-800"
//                               }`}
//                             >
//                               {mockTest.difficulty}
//                             </Badge>
//                           </CardDescription>
//                         </div>
//                         {!mockTest.isFree && !user?.subscription?.status && (
//                           <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Premium</Badge>
//                         )}
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-blue-500" />
//                             <span>{mockTest.duration} mins</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <BookOpen className="h-4 w-4 text-blue-500" />
//                             <span>{mockTest.totalQuestions} questions</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Award className="h-4 w-4 text-blue-500" />
//                             <span>{mockTest.totalMarks} marks</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Users className="h-4 w-4 text-blue-500" />
//                             <span>{mockTest.attempts.toLocaleString()} attempts</span>
//                           </div>
//                         </div>

//                         {mockTest.sections && mockTest.sections.length > 0 && (
//                           <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">Sections:</p>
//                             <div className="flex flex-wrap gap-1">
//                               {mockTest.sections.slice(0, 2).map((section, index) => (
//                                 <Badge 
//                                   key={index} 
//                                   variant="outline" 
//                                   className="text-xs bg-blue-50 text-blue-700 border-blue-200"
//                                 >
//                                   {section.name} ({section.questions})
//                                 </Badge>
//                               ))}
//                               {mockTest.sections.length > 2 && (
//                                 <Badge 
//                                   variant="outline" 
//                                   className="text-xs bg-blue-50 text-blue-700 border-blue-200"
//                                 >
//                                   +{mockTest.sections.length - 2} more
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                     <CardFooter className="flex gap-2">
//                       {!mockTest.isFree && !user?.subscription?.status ? (
//                         <Link href="/subscriptions" className="flex-1">
//                           <Button variant="destructive" className="w-full bg-gradient-to-r from-red-500 to-orange-500">
//                             <Lock className="mr-2 h-4 w-4" />
//                             Unlock Now
//                           </Button>
//                         </Link>
//                       ) : (
//                         <>
//                           <Link href={`/mock-tests/${mockTest._id}`} className="flex-1">
//                             <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
//                               <Eye className="mr-2 h-4 w-4" />
//                               View Details
//                             </Button>
//                           </Link>
//                           <Link href={`/mock-tests/${mockTest._id}/start`} className="flex-1">
//                             <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
//                               <Play className="mr-2 h-4 w-4" />
//                               Start Test
//                             </Button>
//                           </Link>
//                         </>
//                       )}
//                     </CardFooter>
//                   </Card>
//                 ))
//               ) : (
//                 <div className="col-span-full text-center py-12">
//                   <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                   <p className="text-gray-600">
//                     No mock tests found matching your criteria. Try adjusting your filters.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }