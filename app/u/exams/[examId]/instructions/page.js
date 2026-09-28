"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Clock,
  Crown,
  FileText,
  Layers,
  Lock,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const EASE = [0.16, 1, 0.3, 1]

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap');
.ep-body{font-family:'Public Sans',ui-sans-serif,system-ui,sans-serif}
.ep-display{font-family:'Bricolage Grotesque','Public Sans',ui-sans-serif,system-ui,sans-serif;font-optical-sizing:auto}
.ep-num{font-variant-numeric:tabular-nums}
.ep-rich p{margin:0 0 .5em}
.ep-rich p:last-child{margin-bottom:0}
.ep-rich strong{font-weight:700;color:#0C1A3A}
.ep-body :focus-visible{outline:2px solid #1D4FE0;outline-offset:2px}
@keyframes ep-ring{0%{box-shadow:0 0 0 0 rgba(29,79,224,.4)}100%{box-shadow:0 0 0 14px rgba(29,79,224,0)}}
.ep-pulse{animation:ep-ring 1.8s ease-out infinite}
@media (prefers-reduced-motion:reduce){.ep-pulse{animation:none}}
`

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0"

/* ------------------------------------------------------------------ *
 *  Helpers
 * ------------------------------------------------------------------ */

const round = (n) => {
  if (n == null || isNaN(n)) return 0
  const r = Math.round(n * 100) / 100
  return Number.isInteger(r) ? r : r.toFixed(2).replace(/\.?0+$/, "")
}

function countSectionQuestions(section) {
  if (Array.isArray(section?.questionIds)) return section.questionIds.length
  if (Array.isArray(section?.questions)) return section.questions.length
  if (typeof section?.questions === "number") return section.questions
  return 0
}

/* ------------------------------------------------------------------ *
 *  Small building blocks
 * ------------------------------------------------------------------ */

function Card({ children, className = "" }) {
  return <div className={`rounded-xl border border-[#DDE4F0] bg-white ${className}`}>{children}</div>
}

function StatTile({ icon: Icon, value, label, accent = "#1D4FE0" }) {
  return (
    <div className="rounded-lg border border-[#DDE4F0] bg-white p-4">
      <span
        className="grid h-9 w-9 place-items-center rounded-lg"
        style={{ background: `${accent}14`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="ep-display ep-num mt-3 text-2xl font-bold tracking-tight text-[#0C1A3A]">{value}</p>
      <p className="mt-0.5 text-xs text-[#56637F]">{label}</p>
    </div>
  )
}

function InfoRow({ icon: Icon, title, body }) {
  return (
    <li className="flex gap-3.5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#E7F6EE] text-[#0C6B37]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#0C1A3A]">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-[#56637F]">{body}</p>
      </div>
    </li>
  )
}

/* ------------------------------------------------------------------ *
 *  Skeleton + missing-exam
 * ------------------------------------------------------------------ */

function InstructionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-72 animate-pulse rounded-lg bg-[#E8EEFE]" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-[#DDE4F0] bg-white" />
          ))}
        </div>
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-[#DDE4F0] bg-white" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Main
 * ------------------------------------------------------------------ */

export default function ExamInstructions({ params }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { examId } = use(params)

  const [exam, setExam] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [canAttempt, setCanAttempt] = useState(true)

  useEffect(() => {
    if (examId) fetchExamDetails()
  }, [examId])

  const fetchExamDetails = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`)
      if (!response.ok) {
        router.push("/u/exams")
        return
      }
      const data = await response.json()
      setExam(data)

      // Correct subscription gate:
      // Locked only if subscriptionRequired === true AND the user has no active plan.
      const requiresSub = data?.visibility?.subscriptionRequired === true
      const hasActiveSub = user?.subscription?.status === "active"
      if (requiresSub && !hasActiveSub) setCanAttempt(false)
    } catch (err) {
      console.error("Error fetching exam details:", err)
      router.push("/u/exams")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartExam = () => {
    if (!canAttempt) {
      router.push("/u/subscriptions")
      return
    }
    if (!agreedToTerms) {
      toast({
        title: "Please accept the terms",
        description: "Tick the checkbox below the instructions to proceed.",
        variant: "destructive",
      })
      return
    }
    router.push(`/u/exams/${examId}/start`)
  }

  /* -------- loading -------- */
  if (isLoading) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="ep-body min-h-screen bg-[#F3F6FB] text-[#0C1A3A]">
          <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <InstructionsSkeleton />
          </div>
        </div>
      </MotionConfig>
    )
  }

  /* -------- not found -------- */
  if (!exam) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="ep-body grid min-h-screen place-items-center bg-[#F3F6FB] p-4">
          <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
          <Card className="w-full max-w-md p-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FDECEC] text-[#E5484D]">
              <AlertCircle className="h-7 w-7" />
            </span>
            <h1 className="ep-display mt-4 text-2xl font-bold">Exam not found</h1>
            <p className="mt-2 text-sm text-[#56637F]">
              The exam you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push("/u/exams")}
              className={`${btnBase} mt-6 bg-[#1D4FE0] px-5 py-3 text-sm text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0]`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to exams
            </button>
          </Card>
        </div>
      </MotionConfig>
    )
  }

  /* -------- derived -------- */
  const negative = exam.negativeMarking?.enabled && (exam.negativeMarking?.value ?? 0) > 0
  const totalQuestions = exam.totalQuestions ?? (exam.sections || []).reduce(
    (sum, s) => sum + countSectionQuestions(s),
    0
  )
  const totalMarks = round(exam.totalMarks)
  const passingMarks = round(exam.passingMarks)
  const stats = exam.statistics || {}
  const isPremium = exam.visibility?.subscriptionRequired === true

  return (
    <MotionConfig reducedMotion="user">
      <div className="ep-body min-h-screen bg-[#F3F6FB] text-[#0C1A3A]">
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-6">
          {/* Back + heading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-6 flex items-start gap-4"
          >
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#C9D3E6] bg-white text-[#0C1A3A] shadow-[0_2px_0_0_#C9D3E6] transition-colors hover:bg-[#F8FAFD]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFE] px-2.5 py-1 text-[11px] font-bold text-[#1D4FE0]">
                  <FileText className="h-3 w-3" />
                  {exam.type ? exam.type.charAt(0).toUpperCase() + exam.type.slice(1) : "Exam"}
                </span>
                {negative && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDECEC] px-2.5 py-1 text-[11px] font-bold text-[#A6282E]">
                    <AlertCircle className="h-3 w-3" />
                    Negative marking −{round(exam.negativeMarking.value)}
                  </span>
                )}
                {isPremium ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6D6] px-2.5 py-1 text-[11px] font-bold text-[#7A5B00]">
                    <Crown className="h-3 w-3" />
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F6EE] px-2.5 py-1 text-[11px] font-bold text-[#0C6B37]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    Free to attempt
                  </span>
                )}
              </div>
              <h1 className="ep-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
                {exam.title}
              </h1>
              <p className="mt-1 text-sm text-[#56637F]">
                {exam.examName ? `${exam.examName} · ` : ""}
                Read the instructions carefully before you begin.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* ================= MAIN COLUMN ================= */}
            <div className="space-y-6 lg:col-span-2">
              {/* ---- 1. TERMS CHECKBOX — FIRST, so it's visible immediately ---- */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03, duration: 0.6, ease: EASE }}
              >
                <Card
                  className={`overflow-hidden border-2 transition-colors ${
                    agreedToTerms ? "border-[#12A150]/40" : "border-[#FFD84A]/60"
                  }`}
                >
                  <div
                    className={`flex items-center gap-3 border-b px-5 py-3.5 ${
                      agreedToTerms
                        ? "border-[#12A150]/20 bg-[#E7F6EE] text-[#0C6B37]"
                        : "border-[#FFD84A]/40 bg-[#FFF6D6] text-[#7A5B00]"
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/70">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="ep-display text-sm font-bold leading-tight">
                        {agreedToTerms ? "Terms accepted" : "Before you begin"}
                      </p>
                      <p className="text-[11px] leading-tight opacity-80">
                        {agreedToTerms
                          ? "You can now start this exam."
                          : "Acknowledge the terms to unlock the Start button."}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <label
                      htmlFor="terms"
                      className="flex cursor-pointer select-none items-start gap-3 rounded-lg border border-transparent p-1 transition-colors hover:bg-[#F8FAFD]"
                    >
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#1D4FE0] ${
                          agreedToTerms ? "border-[#1D4FE0] bg-[#1D4FE0]" : "border-[#9AA7C2] bg-white"
                        }`}
                      >
                        <AnimatePresence>
                          {agreedToTerms && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 18 }}
                            >
                              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <span className="text-sm font-medium leading-relaxed text-[#0C1A3A]">
                        I have read and agree to the terms and conditions listed below.
                      </span>
                    </label>

                    {/* Compact term summary so the user knows what they're agreeing to, without scrolling */}
                    <ul className="mt-4 space-y-1.5 border-t border-[#DDE4F0] pt-4 text-xs leading-relaxed text-[#56637F]">
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#9AA7C2]" />
                        No unauthorized materials or assistance during the exam.
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#9AA7C2]" />
                        No sharing exam content or discussing questions.
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#9AA7C2]" />
                        Cheating or misconduct leads to disqualification.
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#9AA7C2]" />
                        Results are final and binding.
                      </li>
                    </ul>
                  </div>
                </Card>
              </motion.div>

              {/* ---- 2. Exam overview ---- */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
              >
                <Card className="p-5 sm:p-6">
                  <h2 className="ep-display mb-4 flex items-center gap-2 text-lg font-bold">
                    <Layers className="h-4 w-4 text-[#1D4FE0]" />
                    Exam overview
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatTile icon={Clock} value={exam.totalDuration} label="Minutes" accent="#1D4FE0" />
                    <StatTile icon={BookOpen} value={totalQuestions} label="Questions" accent="#12A150" />
                    <StatTile icon={Award} value={totalMarks} label="Total marks" accent="#7C4DDB" />
                    <StatTile icon={Target} value={passingMarks} label="Passing marks" accent="#D97706" />
                  </div>

                  {exam.instructions && (
                    <div className="ep-rich mt-4 rounded-lg border border-[#DDE4F0] bg-[#F8FAFD] p-4 text-sm leading-relaxed text-[#56637F]"
                      dangerouslySetInnerHTML={{ __html: exam.instructions }}
                    />
                  )}
                </Card>
              </motion.div>

              {/* ---- 3. General instructions ---- */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.13, duration: 0.6, ease: EASE }}
              >
                <Card className="p-5 sm:p-6">
                  <h2 className="ep-display mb-5 text-lg font-bold">General instructions</h2>
                  <ul className="space-y-4">
                    <InfoRow
                      icon={Clock}
                      title="Time management"
                      body={`You have ${exam.totalDuration} minutes to complete this exam. The timer starts as soon as you begin.${
                        exam.settings?.allowSectionWiseTiming
                          ? " Each section has its own time limit."
                          : ""
                      }`}
                    />
                    <InfoRow
                      icon={ArrowRight}
                      title="Navigation"
                      body="Move between questions using the question palette or the navigation buttons."
                    />
                    <InfoRow
                      icon={Check}
                      title="Saving answers"
                      body="Your answers save automatically. Mark questions for review if you want to revisit them."
                    />
                    <InfoRow
                      icon={Zap}
                      title="Submission"
                      body={
                        exam.settings?.autoSubmit
                          ? "The exam auto-submits when time runs out. You can also submit manually at any time."
                          : "You can submit the exam any time before the timer runs out."
                      }
                    />
                  </ul>
                </Card>
              </motion.div>

              {/* ---- 4. Negative marking ---- */}
              {negative && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.6, ease: EASE }}
                >
                  <Card className="overflow-hidden">
                    <div className="flex items-start gap-3 border-b border-[#FFD84A]/40 bg-[#FFF6D6] p-5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FFD84A]/40 text-[#7A5B00]">
                        <AlertCircle className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="ep-display text-base font-bold text-[#7A5B00]">
                          This exam has negative marking
                        </h2>
                        <p className="mt-0.5 text-sm text-[#7A5B00]/85">
                          <span className="ep-num font-bold">{round(exam.negativeMarking.value)}</span> mark
                          {exam.negativeMarking.value === 1 ? "" : "s"} deducted for each incorrect answer.
                          Unanswered questions don't affect your score.
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ---- 5. Sections ---- */}
              {exam.sections?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.23, duration: 0.6, ease: EASE }}
                >
                  <Card className="p-5 sm:p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="ep-display text-lg font-bold">Sections</h2>
                        <p className="text-sm text-[#56637F]">
                          {exam.sections.length} section{exam.sections.length === 1 ? "" : "s"} ·{" "}
                          {exam.settings?.allowSectionWiseTiming
                            ? "Section-wise timing applies"
                            : "Combined timing"}
                        </p>
                      </div>
                    </div>
                    <ol className="space-y-2.5">
                      {exam.sections.map((section, i) => {
                        const qCount = countSectionQuestions(section)
                        return (
                          <li
                            key={section._id || section.id || i}
                            className="flex items-center gap-4 rounded-lg border border-[#DDE4F0] bg-[#F8FAFD] p-4"
                          >
                            <span className="ep-num grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-sm font-bold text-[#1D4FE0] shadow-[0_1px_0_0_#DDE4F0]">
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{section.name}</p>
                              <p className="mt-0.5 text-xs text-[#56637F]">
                                {section.duration ? `${section.duration} min` : ""}
                                {section.negativeMarks != null
                                  ? ` · −${round(section.negativeMarks)} per wrong`
                                  : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="ep-num text-sm font-bold">{qCount} Q</p>
                              <p className="ep-num text-[11px] text-[#56637F]">
                                {round(section.marks)} marks
                              </p>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </Card>
                </motion.div>
              )}

              {/* ---- 6. Full terms (detail) ---- */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.6, ease: EASE }}
              >
                <Card className="p-5 sm:p-6">
                  <h2 className="ep-display mb-4 text-lg font-bold">Full terms &amp; conditions</h2>
                  <ul className="space-y-2 text-sm leading-relaxed text-[#56637F]">
                    {[
                      "You will not use any unauthorized materials or assistance during the exam.",
                      "You will not share exam content or discuss questions during the exam.",
                      "Any form of cheating or misconduct will result in disqualification.",
                      "Exam results are final and binding.",
                      "You consent to the collection of exam data for evaluation.",
                      "You will not attempt to compromise the integrity of the examination system.",
                    ].map((t) => (
                      <li key={t} className="flex gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9AA7C2]" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </div>

            {/* ================= SIDEBAR ================= */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* Start card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
              >
                <Card className="overflow-hidden">
                  <div className="border-b border-[#DDE4F0] bg-gradient-to-br from-[#0C1A3A] to-[#1A2A50] p-5 text-white">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">
                        {canAttempt ? (
                          <Zap className="h-4 w-4 text-[#FFD84A]" />
                        ) : (
                          <Lock className="h-4 w-4 text-[#FFD84A]" />
                        )}
                      </span>
                      <div>
                        <p className="ep-display text-base font-bold leading-tight">
                          {canAttempt ? "Ready to begin?" : "Premium exam"}
                        </p>
                        <p className="text-[11px] leading-tight text-white/60">
                          {canAttempt
                            ? "Once you start, the timer runs."
                            : "Unlock this test with a plan."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <button
                      onClick={handleStartExam}
                      disabled={canAttempt && !agreedToTerms}
                      className={`${btnBase} w-full bg-[#1D4FE0] px-5 py-3.5 text-base text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0] ${
                        canAttempt && !agreedToTerms ? "" : ""
                      }`}
                    >
                      {canAttempt ? (
                        <>
                          Start exam
                          <ArrowRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4" />
                          Upgrade to premium
                        </>
                      )}
                    </button>

                    {canAttempt && !agreedToTerms && (
                      <p className="mt-3 text-center text-xs text-[#56637F]">
                        Tick the terms checkbox above to enable the button.
                      </p>
                    )}

                    {!isPremium && canAttempt && (
                      <div className="mt-3 flex justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F6EE] px-2.5 py-1 text-[11px] font-bold text-[#0C6B37]">
                          <Check className="h-3 w-3" strokeWidth={3} />
                          Free on your account
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
              >
                <Card className="p-5">
                  <h2 className="ep-display mb-4 flex items-center gap-2 text-base font-bold">
                    <TrendingUp className="h-4 w-4 text-[#1D4FE0]" />
                    Exam statistics
                  </h2>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center justify-between">
                      <span className="text-[#56637F]">Total attempts</span>
                      <span className="ep-num font-bold">{stats.totalAttempts ?? 0}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-[#56637F]">Average score</span>
                      <span className="ep-num font-bold">{round(stats.averageScore)}%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-[#56637F]">Pass rate</span>
                      <span className="ep-num font-bold text-[#0C6B37]">{round(stats.passRate)}%</span>
                    </li>
                    <li className="flex items-center justify-between border-t border-[#DDE4F0] pt-3">
                      <span className="text-[#56637F]">Difficulty</span>
                      <span className="rounded-full bg-[#F3F6FB] px-2.5 py-0.5 text-[11px] font-bold text-[#56637F]">
                        {exam.difficulty || "Medium"}
                      </span>
                    </li>
                  </ul>
                </Card>
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
              >
                <Card className="p-5">
                  <h2 className="ep-display mb-4 text-base font-bold">Quick tips</h2>
                  <ul className="space-y-3 text-sm text-[#56637F]">
                    {[
                      ["Read each question carefully before answering.", "#1D4FE0"],
                      ["Mark questions for review if you're unsure.", "#12A150"],
                      ["Watch the timer and manage your pace.", "#D97706"],
                      ["Review your answers before final submit.", "#7C4DDB"],
                    ].map(([tip, color]) => (
                      <li key={tip} className="flex gap-2.5">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile sticky action bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#DDE4F0] bg-white/95 p-3 backdrop-blur-md lg:hidden">
          <button
            onClick={handleStartExam}
            disabled={canAttempt && !agreedToTerms}
            className={`${btnBase} w-full bg-[#1D4FE0] px-5 py-3.5 text-base text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0]`}
          >
            {canAttempt ? (
              <>
                Start exam
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <Crown className="h-4 w-4" />
                Upgrade to premium
              </>
            )}
          </button>
        </div>
      </div>
    </MotionConfig>
  )
}

// "use client"

// import { useState, useEffect, use } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Clock, BookOpen, Award, AlertCircle, CheckCircle, FileText, Target, ArrowRight, ArrowLeft } from "lucide-react"
// import { useAuth } from "@/contexts/AuthContext"
// import { useToast } from "@/hooks/use-toast"

// export default function ExamInstructions({ params }) {
//   const router = useRouter()
//   const { user } = useAuth()
//   const { toast } = useToast()
//   const { examId } = use(params)

//   const [exam, setExam] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [agreedToTerms, setAgreedToTerms] = useState(false)
//   const [canAttempt, setCanAttempt] = useState(true)

//   useEffect(() => {
//     if (examId) {
//       fetchExamDetails()
//     }
//   }, [examId])

//   const fetchExamDetails = async () => {
//     try {
//       const response = await fetch(`/api/exams/${examId}`)
//       if (response.ok) {
//         const data = await response.json()
//         setExam(data)

//         // Check if user can attempt this exam
//         console.log(user, data, examId,data.visibility.isFree )
//         if (!data.visibility.isFree && !user?.subscription?.status) {
//           setCanAttempt(false)
//         }
//       } else {
//         router.push("/exams")
//       }
//     } catch (error) {
//       console.error("Error fetching exam details:", error)
//       router.push("/exams")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleStartExam = () => {
//     if (!canAttempt) {
//       router.push("/subscriptions")
//       return
//     }

//     if (!agreedToTerms) {
//       toast({
//         title: "Terms Required",
//         description: "Please agree to the terms and conditions to proceed.",
//         variant: "destructive",
//       })
//       return
//     }

//     router.push(`/exams/${examId}/start`)
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     )
//   }

//   if (!exam) {
//     return (
//       <div className="container py-12 text-center ">
//         <h1 className="text-3xl font-bold mb-4">Exam Not Found</h1>
//         <p className="text-muted-foreground mb-6">The exam you're looking for doesn't exist or has been removed.</p>
//         <Button onClick={() => router.push("/exams")}>Back to Exams</Button>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen px-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
//       <div className="container py-6 mx-auto ">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="outline" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Exam Instructions</h1>
//             <p className="text-muted-foreground">{exam.title}</p>
//           </div>
//         </div>

//         <div className="grid gap-6 lg:grid-cols-3">
//           {/* Main Instructions */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Exam Overview */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <FileText className="h-5 w-5" />
//                   Exam Overview
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//                   <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
//                     <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
//                     <div className="text-2xl font-bold">{exam.totalDuration}</div>
//                     <div className="text-sm text-muted-foreground">Minutes</div>
//                   </div>
//                   <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
//                     <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
//                     <div className="text-2xl font-bold">{exam.totalQuestions}</div>
//                     <div className="text-sm text-muted-foreground">Questions</div>
//                   </div>
//                   <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
//                     <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
//                     <div className="text-2xl font-bold">{exam.totalMarks}</div>
//                     <div className="text-sm text-muted-foreground">Total Marks</div>
//                   </div>
//                   <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
//                     <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
//                     <div className="text-2xl font-bold">{exam.passingMarks}%</div>
//                     <div className="text-sm text-muted-foreground">Passing</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* General Instructions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>General Instructions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-start gap-3">
//                     <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <p className="font-medium">Time Management</p>
//                       <p className="text-sm text-muted-foreground">
//                         You have {exam.totalDuration} minutes to complete this exam. The timer will start as soon as you
//                         begin.
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <p className="font-medium">Navigation</p>
//                       <p className="text-sm text-muted-foreground">
//                         You can navigate between questions using the question palette or navigation buttons.
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <p className="font-medium">Saving Answers</p>
//                       <p className="text-sm text-muted-foreground">
//                         Your answers are automatically saved. You can also mark questions for review.
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <p className="font-medium">Submission</p>
//                       <p className="text-sm text-muted-foreground">
//                         The exam will auto-submit when time expires. You can also submit manually at any time.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Negative Marking */}
//             {exam.negativeMarking?.enabled && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2 text-orange-600">
//                     <AlertCircle className="h-5 w-5" />
//                     Negative Marking
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <Alert>
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertDescription>
//                       This exam has negative marking. {exam.negativeMarking.value} marks will be deducted for each
//                       incorrect answer. Unanswered questions will not affect your score.
//                     </AlertDescription>
//                   </Alert>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Sections */}
//             {exam.sections && exam.sections.length > 0 && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Exam Sections</CardTitle>
//                   <CardDescription>This exam is divided into the following sections</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {exam.sections.map((section, index) => (
//                       <div key={section._id} className="flex items-center justify-between p-4 border rounded-lg">
//                         <div className="flex-1">
//                           <h4 className="font-medium">{section.name}</h4>
//                           {section.description && (
//                             <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
//                           )}
//                         </div>
//                         <div className="text-right">
//                           <div className="text-sm font-medium">{section.questions.length} Questions</div>
//                           <div className="text-sm text-muted-foreground">{section.duration} mins</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Terms and Conditions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Terms and Conditions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="text-sm text-muted-foreground space-y-2">
//                     <p>By proceeding with this exam, you agree to the following terms:</p>
//                     <ul className="list-disc list-inside space-y-1 ml-4">
//                       <li>You will not use any unauthorized materials or assistance during the exam.</li>
//                       <li>You will not share exam content with others or discuss questions during the exam.</li>
//                       <li>You understand that any form of cheating or misconduct will result in disqualification.</li>
//                       <li>You acknowledge that the exam results are final and binding.</li>
//                       <li>You consent to the collection and processing of your exam data for evaluation purposes.</li>
//                       <li>You will not attempt to compromise the integrity of the examination system.</li>
//                     </ul>
//                   </div>

//                   <Separator />

//                   <div className="flex items-center space-x-2">
//                     <Checkbox
//                       id="terms"
//                       checked={agreedToTerms}
//                       onCheckedChange={setAgreedToTerms}
//                       className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
//                     />
//                     <label
//                       htmlFor="terms"
//                       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                     >
//                       I have read and agree to the terms and conditions
//                     </label>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Start Exam Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Ready to Start?</CardTitle>
//                 {!canAttempt && (
//                   <CardDescription className="text-orange-600">
//                     This exam requires a premium subscription
//                   </CardDescription>
//                 )}
//               </CardHeader>
//               <CardContent>
//                 <Button
//                   onClick={handleStartExam}
//                   className="w-full mb-4"
//                   disabled={!canAttempt || !agreedToTerms}
//                   size="lg"
//                 >
//                   {canAttempt ? (
//                     <>
//                       Start Exam <ArrowRight className="ml-2 h-4 w-4" />
//                     </>
//                   ) : (
//                     "Upgrade to Premium"
//                   )}
//                 </Button>

//                 {!exam.isFree && (
//                   <div className="text-center">
//                     <Badge variant="secondary">Premium Content</Badge>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Exam Statistics */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Exam Statistics</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-sm">Total Attempts</span>
//                     <span className="font-medium">{exam.attempts || 0}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm">Average Score</span>
//                     <span className="font-medium">{exam.averageScore || 0}%</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm">Pass Rate</span>
//                     <span className="font-medium">{exam.passRate || 0}%</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm">Exam Type</span>
//                     <Badge variant="outline">{exam.examType?.name || "General"}</Badge>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Quick Tips */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Quick Tips</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex items-start gap-2">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p>Read each question carefully before selecting an answer.</p>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p>Use the mark for review feature for questions you're unsure about.</p>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p>Keep an eye on the timer and manage your time effectively.</p>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p>Review your answers before final submission.</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
