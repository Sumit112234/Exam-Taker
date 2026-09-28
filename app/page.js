"use client"

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  Clock,
  Flag,
  Globe,
  LineChart,
  Menu,
  Play,
  Shield,
  Star,
  Target,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

/* ------------------------------------------------------------------ *
 *  Design tokens (kept as Tailwind arbitrary values below)
 *  screen  #F3F6FB   panel  #FFFFFF   ink    #0C1A3A   muted #56637F
 *  line    #DDE4F0   blue   #1D4FE0   marker #FFD84A
 *  status  green #12A150 · red #E5484D · purple #7C4DDB
 *  Type: Bricolage Grotesque (display) + Public Sans (body)
 * ------------------------------------------------------------------ */



const EASE = [0.16, 1, 0.3, 1]

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap');
.ep-body{font-family:'Public Sans',ui-sans-serif,system-ui,sans-serif}
.ep-display{font-family:'Bricolage Grotesque','Public Sans',ui-sans-serif,system-ui,sans-serif;font-optical-sizing:auto}
.ep-num{font-variant-numeric:tabular-nums}
html{scroll-behavior:smooth}
section[id]{scroll-margin-top:72px}
.ep-body :focus-visible{outline:2px solid #1D4FE0;outline-offset:2px}
.ep-on-blue :focus-visible{outline-color:#FFD84A}
@keyframes ep-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ep-marquee{animation:ep-marquee 45s linear infinite}
.ep-marquee:hover{animation-play-state:paused}
@keyframes ep-ring{0%{box-shadow:0 0 0 0 rgba(29,79,224,.4)}100%{box-shadow:0 0 0 14px rgba(29,79,224,0)}}
.ep-pulse{animation:ep-ring 1.8s ease-out infinite}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ep-marquee,.ep-pulse{animation:none}}
`

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why us", href: "#why-us" },
  { label: "Achievements", href: "#achievements" },
]

/* ------------------------------------------------------------------ *
 *  Small shared pieces
 * ------------------------------------------------------------------ */

function useCountdown(start) {
  const [s, setS] = useState(start)
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v > 0 ? v - 1 : start)), 1000)
    return () => clearInterval(id)
  }, [start])
  return s
}

function fmt(s) {
  const h = String(Math.floor(s / 3600)).padStart(2, "0")
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0")
  const sec = String(s % 60).padStart(2, "0")
  return [h, m, sec]
}

function CountdownText({ seconds, hideHours = false }) {
  const [h, m, sec] = fmt(seconds)
  return (
    <span className="ep-num text-sm font-bold">
      {!hideHours && <>{h}:</>}
      {m}:
      <span className="inline-block w-[2ch] overflow-hidden align-bottom">
        <motion.span
          key={sec}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="inline-block"
        >
          {sec}
        </motion.span>
      </span>
    </span>
  )
}

function CountUp({ to, decimals = 0, suffix = "", duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: setVal })
    return () => controls.stop()
  }, [inView, to, duration])
  const text = val.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return (
    <span ref={ref}>
      {text}
      {suffix}
    </span>
  )
}

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 active:translate-y-[3px] active:shadow-none"

function PrimaryButton({ children, onClick, size = "md", className = "" }) {
  const pad = size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3.5 text-base"
  return (
    <button
      onClick={onClick}
      className={`${btnBase} ${pad} bg-[#1D4FE0] text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0] ${className}`}
    >
      {children}
    </button>
  )
}

function SecondaryLink({ children, href }) {
  return (
    <a
      href={href}
      className={`${btnBase} border border-[#C9D3E6] bg-white px-6 py-3.5 text-base text-[#0C1A3A] shadow-[0_3px_0_0_#C9D3E6] hover:bg-[#F8FAFD]`}
    >
      {children}
    </a>
  )
}

function SectionHeading({ title, subtitle }) {
  return (
    <div className="max-w-2xl">
      <h2 className="ep-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-[#0C1A3A] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-[#56637F]">{subtitle}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Page
 * ------------------------------------------------------------------ */

export default function Home() {

  const { user } = useAuth();

// // if(user){
//   console.log("User is logged in:", user);
// // }

  const router = useRouter()

  const goToLogin = () => user ? router.push("/u/dashboard") : router.push("/login?redirect=/exams")  

  return (
    <MotionConfig reducedMotion="user">
      <div
        id="top"
        className="ep-body relative min-h-screen overflow-x-clip bg-[#F3F6FB] text-[#0C1A3A] selection:bg-[#FFD84A]"
      >
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <ScrollBar />
        <Navbar onLogin={goToLogin} />
        <main>
          <Hero onStart={goToLogin} />
          <Scorecard />
          <ExamStrip />
          <Features />
          <HowItWorks />
          <WhyUs />
          <Achievements />
          <FinalCta onStart={goToLogin} />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}

/* ------------------------------------------------------------------ *
 *  Scroll progress + navigation
 * ------------------------------------------------------------------ */

function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-[#1D4FE0]"
    />
  )
}

function Logo({ compact = false }) {
  return (
    <a href="#top" className="flex items-center">
      <img
        src="/exampro-logo-full.png"
        alt="ExamPro — Mock Tests &amp; Assessment"
        className={compact ? "h-8 w-auto" : "h-9 w-auto sm:h-10"}
      />
    </a>
  )
}

function Navbar({ onLogin }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(null)
  const { scrollY } = useScroll()

  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 12)), [scrollY])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-[#DDE4F0] bg-white/90 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav
          aria-label="Main"
          className="hidden items-center gap-1 md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onMouseEnter={() => setHovered(l.href)}
              className="relative rounded-md px-3.5 py-2 text-sm font-medium text-[#0C1A3A]/75 transition-colors hover:text-[#0C1A3A]"
            >
              {hovered === l.href && (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 rounded-md bg-[#1D4FE0]/[0.08]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <span className="mr-1 hidden items-center gap-1.5 rounded-full bg-[#E7F6EE] px-3 py-1.5 text-xs font-semibold text-[#0C6B37] lg:flex">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Free &amp; premium mock tests
          </span>
          <PrimaryButton onClick={onLogin} size="sm">
            Login to continue
          </PrimaryButton>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-md p-2 text-[#0C1A3A] md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-[#DDE4F0] bg-white md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-base font-medium text-[#0C1A3A]/80 hover:bg-[#F3F6FB]"
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-3">
                <PrimaryButton onClick={onLogin} className="w-full">
                  Login to continue
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ------------------------------------------------------------------ *
 *  Hero — headline + a live, playable exam window
 * ------------------------------------------------------------------ */

function Word({ children, delay = 0 }) {
  return (
    <span className="mr-[0.24em] inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]">
      <motion.span
        className="inline-block"
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function Hero({ onStart }) {
  const fade = (delay) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  })

  return (
    <section className="relative px-5 pb-20 pt-28 sm:px-8 lg:pt-32">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[640px]"
        style={{
          backgroundImage: "radial-gradient(rgba(12,26,58,.11) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
          WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent)",
          maskImage: "linear-gradient(to bottom, black 25%, transparent)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <motion.div
            {...fade(0.05)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C9D3E6] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#56637F]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#12A150]" />
            Built for SSC, Banking, Railways, UPSC &amp; State PSC aspirants
          </motion.div>

          <h1 className="ep-display text-[2.8rem] font-bold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[4.5rem]">
            {["Prepare", "for", "government", "exams", "the", "smart", "way"].map((w, i) => (
              <Word key={w} delay={0.15 + i * 0.07}>
                {w}
              </Word>
            ))}
          </h1>

          <motion.p
            {...fade(0.75)}
            className="mt-6 max-w-md text-lg leading-relaxed text-[#56637F]"
          >
            Login once to get full-length mock tests, sectional practice and real-time
            analytics for every major government exam. Some tests are free, others need a
            subscription — you choose what to attempt.
          </motion.p>

          <motion.div {...fade(0.85)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={onStart}>Login to continue</PrimaryButton>
            <SecondaryLink href="/login?redirect=/exams">
              <Play className="h-4 w-4 fill-current" />
              Try a sample question
            </SecondaryLink>
          </motion.div>

          <motion.ul
            {...fade(0.95)}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#56637F]"
          >
            {["Free tests to get started", "Subscribe only for what you need", "Trusted by 50,000+ aspirants"].map(
              (t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#12A150]" strokeWidth={3} />
                  {t}
                </li>
              )
            )}
          </motion.ul>
        </div>

        <ExamWindow />
      </div>
    </section>
  )
}

const QUESTIONS = [
  {
    n: 10,
    text: "A ball is thrown vertically upward at 20 m/s. Taking g = 10 m/s², what maximum height does it reach?",
    options: ["10 m", "20 m", "30 m", "40 m"],
    answer: 1,
    why: "h = v² / 2g = 400 / 20 = 20 m.",
  },
  {
    n: 11,
    text: "Which quantity stays constant for a body moving in uniform circular motion?",
    options: ["Velocity", "Acceleration", "Speed", "Momentum"],
    answer: 2,
    why: "The direction changes at every instant, but the magnitude of the velocity stays the same.",
  },
  {
    n: 12,
    text: "The voltage across a wire stays constant while its resistance is doubled. What happens to the current?",
    options: ["It doubles", "It halves", "It quadruples", "It stays the same"],
    answer: 1,
    why: "I = V / R, so doubling R halves I.",
  },
]

const TOTAL_Q = 20
const LIVE_START = 9
const BASE_STATUS = [
  "answered", "answered", "review", "answered", "answered", "unanswered", "answered", "answered", "answered",
  null, null, null,
  "unvisited", "unvisited", "unvisited", "unvisited", "unvisited", "unvisited", "unvisited", "unvisited",
]

const CELL = {
  answered: "bg-[#12A150] text-white",
  unanswered: "bg-[#E5484D] text-white",
  review: "bg-[#7C4DDB] text-white",
  unvisited: "border border-[#C9D3E6] bg-white text-[#56637F]",
}

const LEGEND = [
  ["answered", "Answered"],
  ["unanswered", "Not answered"],
  ["review", "For review"],
  ["unvisited", "Not visited"],
]

function OptionRow({ letter, text, state, onClick, disabled }) {
  const box = {
    idle: "border-[#DDE4F0] bg-white hover:border-[#1D4FE0]/50 hover:bg-[#1D4FE0]/[0.03]",
    picked: "border-[#1D4FE0] bg-[#1D4FE0]/[0.06]",
    correct: "border-[#12A150] bg-[#E7F6EE]",
    wrong: "border-[#E5484D] bg-[#FDECEC]",
  }
  const dot = {
    idle: "border-[#9AA7C2] text-[#56637F]",
    picked: "border-[#1D4FE0] bg-[#1D4FE0] text-white",
    correct: "border-[#12A150] bg-[#12A150] text-white",
    wrong: "border-[#E5484D] bg-[#E5484D] text-white",
  }
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      animate={state === "wrong" ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${box[state]}`}
    >
      <motion.span
        animate={state === "picked" ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold ${dot[state]}`}
      >
        {state === "correct" ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : state === "wrong" ? (
          <X className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          letter
        )}
      </motion.span>
      <span className="font-medium">{text}</span>
    </motion.button>
  )
}

function Burst() {
  const colors = ["#1D4FE0", "#FFD84A", "#12A150", "#7C4DDB"]
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2
        const d = 46 + (i % 3) * 20
        return (
          <motion.span
            key={i}
            className="absolute block h-2 w-2 rounded-[2px]"
            style={{ background: colors[i % 4] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d - 8, opacity: 0, scale: 0.4, rotate: 200 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )
      })}
    </span>
  )
}

function ExamWindow() {
  const secs = useCountdown(7182)
  const [cur, setCur] = useState(0)
  const [picked, setPicked] = useState(null)
  const [saved, setSaved] = useState({})
  const [flagged, setFlagged] = useState({})
  const [result, setResult] = useState(null)
  const [burst, setBurst] = useState(0)
  const [touched, setTouched] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const q = QUESTIONS[cur]
  const busy = result && result.type !== "hint"

  const statuses = BASE_STATUS.map((s, i) => {
    const k = i - LIVE_START
    if (k < 0 || k > 2) return s
    if (flagged[k]) return "review"
    if (saved[k] !== undefined) return "answered"
    return k < cur ? "unanswered" : "unvisited"
  })
  const count = (k) => statuses.filter((s) => s === k).length
  const score = Object.entries(saved).reduce(
    (t, [k, v]) => t + (v === QUESTIONS[k].answer ? 4 : -1),
    0
  )

  const pick = (i) => {
    if (busy) return
    setTouched(true)
    setPicked(i)
    setResult(null)
  }
  const clear = () => {
    if (busy) return
    setPicked(null)
    setSaved((s) => {
      const n = { ...s }
      delete n[cur]
      return n
    })
  }
  const flag = () => {
    if (busy) return
    setTouched(true)
    setFlagged((f) => ({ ...f, [cur]: !f[cur] }))
  }
  const save = () => {
    if (busy) return
    setTouched(true)
    clearTimeout(timer.current)
    if (picked === null) {
      setResult({ type: "hint" })
      timer.current = setTimeout(() => setResult(null), 1800)
      return
    }
    const ok = picked === q.answer
    setSaved((s) => ({ ...s, [cur]: picked }))
    setResult({ type: ok ? "ok" : "bad" })
    if (ok) setBurst((b) => b + 1)
    timer.current = setTimeout(() => {
      setResult(null)
      setPicked(null)
      if (cur < QUESTIONS.length - 1) {
        setCur(cur + 1)
      } else {
        setCur(0)
        setSaved({})
        setFlagged({})
      }
    }, 2400)
  }

  const optionState = (i) => {
    if (result && result.type !== "hint") {
      if (i === q.answer) return "correct"
      if (i === picked) return "wrong"
      return "idle"
    }
    return picked === i ? "picked" : "idle"
  }

  const banners = {
    ok: { cls: "bg-[#E7F6EE] text-[#0C6B37]", title: "Correct. +4 marks", body: q.why },
    bad: {
      cls: "bg-[#FDECEC] text-[#A6282E]",
      title: "Not quite. −1 mark",
      body: `Answer: ${q.options[q.answer]}. ${q.why}`,
    },
    hint: {
      cls: "bg-[#FFF6D6] text-[#7A5B00]",
      title: "Choose an option first",
      body: "Then press Save & next.",
    },
  }
  const banner = result ? banners[result.type] : null

  return (
    <motion.div
      id="sample"
      initial={{ opacity: 0, y: 56, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.3, ease: EASE }}
    >
      <div className="overflow-hidden rounded-xl border border-[#C9D3E6] bg-white shadow-[0_30px_70px_-25px_rgba(12,26,58,0.35)]">
        {/* Exam header */}
        <div className="flex items-center justify-between gap-3 bg-[#0C1A3A] px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white p-1">
              <img src="/exampro-logo-mark.png" alt="" className="h-full w-full object-contain" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">SSC CGL Tier I · Full mock 07</p>
              <p className="text-[11px] leading-tight text-white/60">Free sample question</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-md bg-[#FFD84A] px-2.5 py-1.5 text-[#0C1A3A]">
            <Clock className="h-4 w-4" />
            <CountdownText seconds={secs} />
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-[#DDE4F0] bg-[#F3F6FB] text-xs font-semibold">
          {["General Awareness", "Quant Aptitude", "Reasoning"].map((s, i) => (
            <span
              key={s}
              className={`px-4 py-2.5 ${
                i === 0 ? "border-b-2 border-[#1D4FE0] bg-white text-[#1D4FE0]" : "text-[#56637F]"
              }`}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="grid sm:grid-cols-[1fr_156px]">
          {/* Question panel */}
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="ep-display text-base font-bold">Question {q.n}</p>
              <span className="rounded bg-[#E7F6EE] px-1.5 py-0.5 text-[11px] font-semibold text-[#0C6B37]">+4</span>
              <span className="rounded bg-[#FDECEC] px-1.5 py-0.5 text-[11px] font-semibold text-[#A6282E]">−1</span>
              <p className="ml-auto text-xs text-[#56637F]">
                Marks{" "}
                <motion.span
                  key={score}
                  initial={{ scale: 1.6 }}
                  animate={{ scale: 1 }}
                  className="ep-num inline-block text-sm font-bold text-[#0C1A3A]"
                >
                  {score}
                </motion.span>
              </p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={cur}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <p className="mt-3 text-[15px] font-medium leading-relaxed">{q.text}</p>
                <div
                  className={`mt-4 space-y-2 rounded-lg ${!touched ? "ep-pulse" : ""}`}
                  role="radiogroup"
                  aria-label="Answer options"
                >
                  {q.options.map((o, i) => (
                    <OptionRow
                      key={o}
                      letter={"ABCD"[i]}
                      text={o}
                      state={optionState(i)}
                      onClick={() => pick(i)}
                      disabled={busy}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {banner && (
                <motion.div
                  key={result.type}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={`overflow-hidden rounded-lg text-xs leading-relaxed ${banner.cls}`}
                  role="status"
                >
                  <div className="p-3">
                    <p className="font-bold">{banner.title}</p>
                    <p className="mt-0.5">{banner.body}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={flag}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-md border border-[#C9D3E6] px-3 py-2 text-xs font-semibold text-[#0C1A3A] transition-colors hover:bg-[#F3F6FB] disabled:opacity-50"
              >
                <Flag className={`h-3.5 w-3.5 ${flagged[cur] ? "fill-[#7C4DDB] text-[#7C4DDB]" : ""}`} />
                {flagged[cur] ? "Marked for review" : "Mark for review"}
              </button>
              <button
                onClick={clear}
                disabled={busy}
                className="rounded-md border border-[#C9D3E6] px-3 py-2 text-xs font-semibold text-[#0C1A3A] transition-colors hover:bg-[#F3F6FB] disabled:opacity-50"
              >
                Clear
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={save}
                disabled={busy}
                className="relative ml-auto flex items-center gap-1 rounded-md bg-[#1D4FE0] px-4 py-2 text-xs font-bold text-white shadow-[0_2px_0_0_#1237A6] transition-colors hover:bg-[#2A5CF0] disabled:opacity-60"
              >
                Save &amp; next
                <ChevronRight className="h-3.5 w-3.5" />
                {burst > 0 && <Burst key={burst} />}
              </motion.button>
            </div>
          </div>

          {/* Candidate sidebar */}
          <aside className="border-t border-[#DDE4F0] bg-[#F3F6FB] p-4 sm:border-l sm:border-t-0">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1D4FE0] text-xs font-bold text-white">
                You
              </span>
              <div>
                <p className="text-xs font-bold leading-tight">Candidate</p>
                <p className="text-[11px] leading-tight text-[#56637F]">General Awareness</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-[#56637F] sm:grid-cols-1">
              {LEGEND.map(([k, label]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span
                    className={`ep-num grid h-5 min-w-[1.25rem] place-items-center rounded px-1 text-[10px] font-bold ${CELL[k]}`}
                  >
                    {count(k)}
                  </span>
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-10 gap-1.5 sm:grid-cols-5">
              {statuses.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.025, type: "spring", stiffness: 400, damping: 20 }}
                >
                  <motion.div
                    key={s}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 16 }}
                    className={`ep-num grid aspect-square place-items-center rounded text-[10px] font-semibold ${CELL[s]} ${
                      i === LIVE_START + cur ? "ring-2 ring-[#0C1A3A] ring-offset-1 ring-offset-[#F3F6FB]" : ""
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <a
              href="#start"
              className="mt-4 block rounded-md bg-[#1D4FE0] py-2 text-center text-xs font-bold text-white shadow-[0_2px_0_0_#1237A6] transition-colors hover:bg-[#2A5CF0]"
            >
              Submit test
            </a>
          </aside>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-[#56637F]">
        This is a live sample. Choose an answer, then press Save &amp; next.
      </p>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ *
 *  Scorecard + exam strip
 * ------------------------------------------------------------------ */

const STATS = [
  { to: 50, suffix: "K+", label: "Active aspirants" },
  { to: 1, suffix: "M+", label: "Practice questions" },
  { to: 99, suffix: "%", label: "Success rate" },
  { to: 4.9, decimals: 1, suffix: "/5", label: "User rating" },
]

function Scorecard() {
  return (
    <section className="relative px-5 sm:px-8" aria-label="ExamPro in numbers">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-[#C9D3E6] bg-[#C9D3E6]">
        <dl className="grid grid-cols-2 gap-px lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white px-6 py-5">
              <dt className="text-sm text-[#56637F]">{s.label}</dt>
              <dd className="ep-display ep-num mt-1 text-4xl font-bold tracking-tight">
                <CountUp to={s.to} decimals={s.decimals} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

const EXAMS = [
  "SSC CGL",
  "SSC CHSL",
  "IBPS PO",
  "IBPS Clerk",
  "SBI PO",
  "RRB NTPC",
  "RRB Group D",
  "UPSC CSE",
  "State PSC",
  "RBI Grade B",
  "NDA",
  "CDS",
]

function ExamStrip() {
  const row = [...EXAMS, ...EXAMS]
  const mask = "linear-gradient(to right, transparent, black 8%, black 92%, transparent)"
  return (
    <section aria-label="Exams we prepare you for" className="mt-16 border-y border-[#DDE4F0] bg-white">
      <div className="mx-auto flex max-w-6xl items-center">
        <p className="hidden shrink-0 border-r border-[#DDE4F0] px-8 py-5 text-sm font-semibold text-[#56637F] sm:block">
          Prepare for
        </p>
        <div
          className="flex-1 overflow-hidden py-5"
          style={{ maskImage: mask, WebkitMaskImage: mask }}
        >
          <div className="ep-marquee flex w-max" aria-hidden>
            {row.map((e, i) => (
              <span
                key={i}
                className="ep-display flex items-center text-2xl font-semibold text-[#0C1A3A]/70"
              >
                {e}
                <span className="mx-10 h-1.5 w-1.5 rounded-full bg-[#1D4FE0]" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
 *  Features — a tabbed stage that auto-plays until the visitor chooses
 * ------------------------------------------------------------------ */

function VisPractice() {
  const rows = [
    ["Number series", "Reasoning", "#7C4DDB"],
    ["Percentage & profit-loss", "Quant Aptitude", "#1D4FE0"],
    ["Indian polity: the Constitution", "General Awareness", "#12A150"],
    ["Reading comprehension", "English", "#D97706"],
    ["Data interpretation", "Quant Aptitude", "#1D4FE0"],
  ]
  return (
    <div>
      <p className="text-sm text-[#56637F]">Question bank</p>
      <p className="ep-display ep-num text-5xl font-bold tracking-tight">
        <CountUp to={1000000} suffix="+" duration={2.2} />
      </p>
      <div className="mt-6 space-y-2">
        {rows.map(([t, s, c], i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.09, duration: 0.5, ease: EASE }}
            className="flex items-center gap-3 rounded-lg border border-[#DDE4F0] bg-white px-3 py-2.5 text-sm"
          >
            <motion.span
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-white"
              animate={{
                backgroundColor: ["#ffffff", "#12A150", "#12A150", "#ffffff"],
                borderColor: ["#9AA7C2", "#12A150", "#12A150", "#9AA7C2"],
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.6 + i * 0.8, times: [0, 0.2, 0.8, 1] }}
            >
              <Check className="h-3 w-3" strokeWidth={3.5} />
            </motion.span>
            <span className="flex-1 font-medium">{t}</span>
            <span className="flex items-center gap-1.5 text-xs text-[#56637F]">
              <span className="h-2 w-2 rounded-full" style={{ background: c }} />
              {s}
            </span>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-sm text-[#56637F]">Every question comes with a step-by-step solution.</p>
    </div>
  )
}

const WEEK = [
  ["Mon", "Quant", "#1D4FE0"],
  ["Tue", "Reason", "#7C4DDB"],
  ["Wed", "GA", "#12A150"],
  ["Thu", "Mock", "#0C1A3A"],
  ["Fri", "English", "#D97706"],
  ["Sat", "Rev", "#D97706"],
  ["Sun", "Rest", "#8A97B3"],
]

function VisPlans() {
  const tasks = ["Percentage & profit-loss: 25 questions", "Review 8 mistakes from Friday", "Timed quiz, 15 minutes"]
  return (
    <div>
      <p className="text-sm text-[#56637F]">Your week</p>
      <div className="relative mt-3 overflow-hidden rounded-lg border border-[#DDE4F0] bg-[#F3F6FB] p-2">
        <motion.div
          aria-hidden
          className="absolute bottom-2 left-2 top-2 w-[calc((100%-1rem)/7)] rounded-md bg-[#FFD84A]/70"
          animate={{ x: ["0%", "600%"] }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <div className="relative grid grid-cols-7">
          {WEEK.map(([d, t, c], i) => (
            <div key={d} className="p-1.5 text-center">
              <p className="text-[11px] font-semibold text-[#56637F]">{d}</p>
              <motion.div
                initial={{ opacity: 0, scaleY: 0.2 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: EASE }}
                style={{ background: c, transformOrigin: "top" }}
                className="mt-2 rounded-md px-0.5 py-3 text-[10px] font-semibold text-white sm:text-xs"
              >
                {t}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 text-sm text-[#56637F]">Today</p>
      <ul className="mt-2 space-y-2">
        {tasks.map((t, i) => (
          <motion.li
            key={t}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.15, duration: 0.5, ease: EASE }}
            className="flex items-center gap-3 rounded-lg border border-[#DDE4F0] bg-white px-3 py-2.5 text-sm font-medium"
          >
            <span className="h-4 w-4 rounded border-2 border-[#9AA7C2]" />
            {t}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function VisTimed() {
  const s = useCountdown(3599)
  const [, m, sec] = fmt(s)
  const frac = (s % 60) / 60
  const sections = [
    ["Quantitative Aptitude", true],
    ["Reasoning", false],
    ["General Awareness", false],
  ]
  return (
    <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#DDE4F0" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#1D4FE0"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 1 }}
            animate={{ pathLength: frac }}
            transition={{ duration: sec === "59" ? 0 : 1, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="ep-display ep-num text-3xl font-bold">
              {m}:{sec}
            </p>
            <p className="text-xs text-[#56637F]">left in section</p>
          </div>
        </div>
      </div>
      <ul className="space-y-2">
        {sections.map(([name, active], i) => (
          <motion.li
            key={name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: EASE }}
            className={`rounded-lg border px-4 py-3 text-sm ${
              active ? "border-[#1D4FE0] bg-[#1D4FE0]/[0.05]" : "border-[#DDE4F0] bg-white"
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <span>{name}</span>
              <span className="ep-num text-xs font-medium text-[#56637F]">60 min · 30 questions</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#DDE4F0]">
              {active && (
                <motion.div
                  className="h-full rounded-full bg-[#1D4FE0]"
                  initial={{ width: "0%" }}
                  animate={{ width: "62%" }}
                  transition={{ delay: 0.5, duration: 1.6, ease: EASE }}
                />
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function VisAnalytics() {
  const bars = [38, 52, 45, 68, 60, 82, 91]
  const acc = [30, 42, 55, 50, 66, 74, 86]
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const pts = acc.map((v, i) => [((i + 0.5) / 7) * 100, 100 - v])
  const d = "M" + pts.map((p) => p.join(" ")).join(" L")
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#56637F]">This week</p>
          <p className="ep-display text-2xl font-bold">Accuracy and volume</p>
        </div>
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 400, damping: 18 }}
          className="rounded-md bg-[#E7F6EE] px-2.5 py-1 text-sm font-bold text-[#0C6B37]"
        >
          +24% accuracy
        </motion.span>
      </div>
      <div className="relative mt-6 h-52">
        <div className="absolute inset-0 flex items-end gap-3">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t bg-[#1D4FE0]/20"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.07, duration: 0.9, ease: EASE }}
            />
          ))}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <motion.path
            d={d}
            fill="none"
            stroke="#12A150"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 1.4, ease: EASE }}
          />
        </svg>
        {pts.map(([x, y], i) => (
          <motion.span
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full border-2 border-[#12A150] bg-white"
            style={{ left: `${x}%`, top: `${y}%`, translateX: "-50%", translateY: "-50%" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + (i / 7) * 1.3, type: "spring", stiffness: 500, damping: 20 }}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-3 text-[11px] text-[#56637F]">
        {days.map((dd) => (
          <span key={dd} className="flex-1 text-center">
            {dd}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-5 text-xs text-[#56637F]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#1D4FE0]/25" /> Questions attempted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[#12A150]" /> Accuracy
        </span>
      </div>
    </div>
  )
}

function VisImprove() {
  const topics = [
    ["Data interpretation", 42, 78],
    ["Static GK", 51, 64],
    ["Sentence correction", 60, 86],
  ]
  return (
    <div>
      <p className="text-sm text-[#56637F]">Weak areas, after targeted exercises</p>
      <div className="mt-5 space-y-6">
        {topics.map(([n, from, to], i) => (
          <div key={n}>
            <div className="mb-2 flex items-baseline justify-between text-sm font-semibold">
              <span>{n}</span>
              <span className="ep-num text-xs font-medium text-[#56637F]">
                {from}% <span className="mx-1">to</span>
                <span className="font-bold text-[#0C6B37]">{to}%</span>
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#DDE4F0]">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: `${from}%`, backgroundColor: "#E5484D" }}
                animate={{ width: `${to}%`, backgroundColor: "#12A150" }}
                transition={{ delay: 0.3 + i * 0.18, duration: 1.5, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.5, ease: EASE }}
        className="mt-8 flex items-center gap-3 rounded-lg border border-[#DDE4F0] bg-white p-3 text-sm"
      >
        <TrendingUp className="h-5 w-5 shrink-0 text-[#12A150]" />
        <span>12 new exercises unlocked for Static GK.</span>
      </motion.div>
    </div>
  )
}

function VisSupport() {
  const bubble = (side, text, delay) => (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
        side === "me"
          ? "ml-auto rounded-br-sm bg-[#1D4FE0] text-white"
          : "rounded-bl-sm border border-[#DDE4F0] bg-white"
      }`}
    >
      {text}
    </motion.div>
  )
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0C1A3A] text-sm font-bold text-white">
          MK
        </span>
        <div>
          <p className="text-sm font-bold leading-tight">Your mentor</p>
          <p className="flex items-center gap-1.5 text-xs text-[#56637F]">
            <span className="h-2 w-2 rounded-full bg-[#12A150]" /> Online now
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {bubble("me", "I keep losing marks on projectile motion.", 0.2)}
        {bubble("them", "Let's split it into horizontal and vertical parts. Want to try 5 questions together?", 0.9)}
        {bubble("me", "Yes, please.", 1.7)}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
          className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-bl-sm border border-[#DDE4F0] bg-white py-3"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#9AA7C2]"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: BookOpen,
    title: "Practice tests",
    desc: "Access thousands of practice questions with detailed explanations and step-by-step solutions.",
    Visual: VisPractice,
  },
  {
    icon: Target,
    title: "Personalized plans",
    desc: "Get custom study schedules based on your goals, timeline and learning patterns.",
    Visual: VisPlans,
  },
  {
    icon: Clock,
    title: "Timed simulations",
    desc: "Practice under real exam conditions with accurate timing and authentic formats.",
    Visual: VisTimed,
  },
  {
    icon: BarChart3,
    title: "Performance analytics",
    desc: "Track your progress with comprehensive dashboards and insights.",
    Visual: VisAnalytics,
  },
  {
    icon: TrendingUp,
    title: "Improvement plans",
    desc: "Identify weak areas and get targeted exercises to boost your scores.",
    Visual: VisImprove,
  },
  {
    icon: Star,
    title: "Expert support",
    desc: "Connect with tutors and mentors for personalized guidance and support.",
    Visual: VisSupport,
  },
]

function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: "-20% 0px" })
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [locked, setLocked] = useState(false)
  const auto = inView && !locked && !reduce
  const { Visual } = FEATURES[active]

  const choose = (i) => {
    setActive(i)
    setLocked(true)
  }

  return (
    <section id="features" ref={ref} className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Everything you practice with, in one place"
          subtitle="Six tools that work together, from your first question to your last mock test."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div role="tablist" aria-orientation="vertical" className="flex flex-col">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              const isActive = i === active
              return (
                <button
                  key={f.title}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => choose(i)}
                  className={`relative border-l-2 border-[#DDE4F0] py-4 pl-5 pr-4 text-left transition-colors ${
                    isActive ? "bg-white" : "hover:bg-white/60"
                  }`}
                >
                  {isActive && (auto || locked) && (
                    <motion.span
                      key={`${i}-${locked}`}
                      aria-hidden
                      className="absolute -left-0.5 top-0 h-full w-0.5 bg-[#1D4FE0]"
                      style={{ transformOrigin: "top" }}
                      initial={{ scaleY: locked ? 1 : 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: locked ? 0 : 7, ease: "linear" }}
                      onAnimationComplete={() => {
                        if (!locked) setActive((a) => (a + 1) % FEATURES.length)
                      }}
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
                        isActive ? "bg-[#1D4FE0] text-white" : "bg-[#E8EEFE] text-[#1D4FE0]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="ep-display text-xl font-semibold tracking-tight">{f.title}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden pl-12 pt-2 text-[15px] leading-relaxed text-[#56637F]"
                      >
                        {f.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            className="relative min-h-[420px] overflow-hidden rounded-xl border border-[#DDE4F0] bg-white p-6 sm:p-8"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(29,79,224,.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(29,79,224,.045) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <Visual />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
 *  How it works — OMR bubbles that fill as you scroll
 * ------------------------------------------------------------------ */

const STEPS = [
  { letter: "A", title: "Diagnose", desc: "Take a 20-minute placement test. We map your strengths, gaps and speed." },
  { letter: "B", title: "Plan", desc: "Our AI builds a day-by-day study plan around your goals and exam date." },
  { letter: "C", title: "Practice and simulate", desc: "Drill topics, then sit full-length timed mocks in real exam conditions." },
  { letter: "D", title: "Review and improve", desc: "Read instant explanations, fix weak spots and watch your scores climb." },
]

function Step({ step, index, progress }) {
  const start = 0.03 + (0.8 * index) / 3
  const bg = useTransform(progress, [start, start + 0.06], ["#FFFFFF", "#0C1A3A"])
  const color = useTransform(progress, [start, start + 0.06], ["#0C1A3A", "#FFFFFF"])
  const scale = useTransform(progress, [start, start + 0.03, start + 0.08], [1, 1.16, 1])
  return (
    <li className="relative text-center">
      <motion.div
        style={{ backgroundColor: bg, color, scale }}
        className="ep-display mx-auto grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#0C1A3A] text-xl font-bold"
      >
        {step.letter}
      </motion.div>
      <h3 className="ep-display mt-5 text-xl font-semibold tracking-tight">{step.title}</h3>
      <p className="mx-auto mt-2 max-w-[16rem] text-[15px] leading-relaxed text-[#56637F]">{step.desc}</p>
    </li>
  )
}

function HowItWorks() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 70%"] })
  const fill = useTransform(scrollYProgress, [0.05, 0.85], [0, 1])
  return (
    <section id="how-it-works" ref={ref} className="border-y border-[#DDE4F0] bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Four steps from first login to exam day"
          subtitle="Each step builds on the last, and your plan adjusts as you improve."
        />
        <div className="relative mt-16">
          <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-[3px] bg-[#DDE4F0] lg:block">
            <motion.div
              className="h-full bg-[#1D4FE0]"
              style={{ scaleX: fill, transformOrigin: "0% 50%" }}
            />
          </div>
          <ol className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((s, i) => (
              <Step key={s.letter} step={s} index={i} progress={scrollYProgress} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
 *  Why us
 * ------------------------------------------------------------------ */

const WHY = [
  {
    icon: Brain,
    title: "Adaptive AI learning",
    desc: "Our AI analyzes your performance and creates personalized study plans that adapt to your learning style.",
  },
  {
    icon: Shield,
    title: "Proven methodology",
    desc: "Based on the latest exam patterns and tested by thousands of successful aspirants.",
  },
  {
    icon: Zap,
    title: "Instant feedback",
    desc: "Get real-time explanations and insights to understand concepts immediately.",
  },
  {
    icon: LineChart,
    title: "Progress tracking",
    desc: "Visualize your improvement with detailed analytics and performance metrics.",
  },
]

function ProgressCard() {
  const bars = [
    ["Mon", 85],
    ["Tue", 70],
    ["Wed", 90],
    ["Thu", 75],
    ["Fri", 95],
  ]
  return (
    <div className="overflow-hidden rounded-xl border border-[#C9D3E6] bg-white shadow-[0_30px_70px_-30px_rgba(12,26,58,0.3)]">
      <div className="flex items-center justify-between bg-[#0C1A3A] px-5 py-3.5 text-white">
        <div>
          <p className="text-sm font-semibold leading-tight">Quantitative Aptitude: Data Interpretation</p>
          <p className="text-[11px] leading-tight text-white/60">Today&apos;s session</p>
        </div>
        <span className="flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#3DDC84]" />
          Live
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-sm text-[#56637F]">Your progress</p>
        <div className="mt-4 flex h-36 items-end gap-3 border-b border-[#DDE4F0]">
          {bars.map(([d, h], i) => (
            <motion.div
              key={d}
              className="flex-1 rounded-t bg-[#1D4FE0]"
              style={{ opacity: 0.35 + i * 0.13 }}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.09, duration: 0.9, ease: EASE }}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-3 text-[11px] text-[#56637F]">
          {bars.map(([d]) => (
            <span key={d} className="flex-1 text-center">
              {d}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-[#F3F6FB] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#56637F]">Next milestone</span>
            <span className="ep-num font-bold text-[#1D4FE0]">
              <CountUp to={87} suffix="%" duration={1.6} />
            </span>
          </div>
          <p className="mt-1 font-semibold">Chapter 5 complete</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#DDE4F0]">
            <motion.div
              className="h-full rounded-full bg-[#1D4FE0]"
              initial={{ width: 0 }}
              whileInView={{ width: "87%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: EASE }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function WhyUs() {
  return (
    <section id="why-us" className="px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            title="Why aspirants choose ExamPro"
            subtitle="Experience the difference that sets us apart."
          />
          <ul className="mt-10 divide-y divide-[#DDE4F0] border-y border-[#DDE4F0]">
            {WHY.map((w) => {
              const Icon = w.icon
              return (
                <li key={w.title} className="group flex gap-4 py-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#E8EEFE] text-[#1D4FE0] transition-colors duration-200 group-hover:bg-[#1D4FE0] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="ep-display text-lg font-semibold tracking-tight">{w.title}</h3>
                    <p className="mt-1 leading-relaxed text-[#56637F]">{w.desc}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <ProgressCard />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
 *  Achievements
 * ------------------------------------------------------------------ */

const ACHIEVEMENTS = [
  {
    icon: Trophy,
    title: "Industry leading",
    desc: "Recognized as the #1 exam preparation platform by education experts.",
  },
  {
    icon: Award,
    title: "Award winning",
    desc: "Winner of Best EdTech Innovation 2024 and Excellence in Learning.",
  },
  {
    icon: Globe,
    title: "Global reach",
    desc: "Supporting aspirants across every state and union territory, with 24/7 support.",
  },
]

function Achievements() {
  return (
    <section id="achievements" className="border-t border-[#DDE4F0] bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Our achievements"
          subtitle="A proven track record of helping aspirants succeed."
        />
        <div className="mt-12 grid overflow-hidden rounded-xl border border-[#DDE4F0] bg-[#F3F6FB] md:grid-cols-3 md:divide-x md:divide-[#DDE4F0]">
          {ACHIEVEMENTS.map((a, i) => {
            const Icon = a.icon
            return (
              <div
                key={a.title}
                className="border-b border-[#DDE4F0] p-8 last:border-b-0 md:border-b-0"
              >
                <div className="relative grid h-16 w-16 place-items-center">
                  <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden>
                    <circle cx="32" cy="32" r="29" fill="none" stroke="#DDE4F0" strokeWidth="2" />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="29"
                      fill="none"
                      stroke="#1D4FE0"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 1.4, delay: i * 0.25, ease: EASE }}
                    />
                  </svg>
                  <Icon className="h-7 w-7 text-[#1D4FE0]" />
                </div>
                <h3 className="ep-display mt-6 text-2xl font-semibold tracking-tight">{a.title}</h3>
                <p className="mt-2 leading-relaxed text-[#56637F]">{a.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
 *  Final CTA — styled as the "instructions" screen before an exam
 * ------------------------------------------------------------------ */

const INSTRUCTIONS = [
  "Login with your registered mobile number or email.",
  "Free tests unlock instantly on your dashboard.",
  "Premium tests need an active subscription for that exam.",
  "Switch between exams any time from your dashboard.",
]

function FinalCta({ onStart }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-25% 0px" })
  const [read, setRead] = useState(false)
  const touched = useRef(false)

  useEffect(() => {
    if (!inView) return
    const id = setTimeout(() => {
      if (!touched.current) setRead(true)
    }, 2000)
    return () => clearTimeout(id)
  }, [inView])

  return (
    <section id="start" className="px-5 py-24 sm:px-8">
      <div className="ep-on-blue mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[#1D4FE0] text-white">
        <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <h2 className="ep-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Ready for exam day?
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/85">
              Login to see every exam on ExamPro. Free tests are open to all, premium tests
              unlock with a subscription.
            </p>
          </div>

          <div ref={ref} className="rounded-xl bg-white p-6 text-[#0C1A3A] shadow-2xl sm:p-7">
            <p className="ep-display text-xl font-bold">Before you begin</p>
            <ol className="mt-4 space-y-3 text-[15px]">
              {INSTRUCTIONS.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -14 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.25, duration: 0.5, ease: EASE }}
                  className="flex gap-3"
                >
                  <span className="ep-num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E8EEFE] text-xs font-bold text-[#1D4FE0]">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{t}</span>
                </motion.li>
              ))}
            </ol>

            <label className="mt-6 flex cursor-pointer items-center gap-3 border-t border-[#DDE4F0] pt-5 text-sm font-medium">
              <input
                type="checkbox"
                checked={read}
                onChange={(e) => {
                  touched.current = true
                  setRead(e.target.checked)
                }}
                className="peer sr-only"
              />
              <span
                className={`grid h-5 w-5 place-items-center rounded border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#1D4FE0] ${
                  read ? "border-[#1D4FE0] bg-[#1D4FE0]" : "border-[#9AA7C2] bg-white"
                }`}
              >
                <AnimatePresence>
                  {read && (
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
              I have read the instructions
            </label>

            <button
              onClick={onStart}
              className={`${btnBase} mt-4 w-full py-3.5 text-base ${
                read
                  ? "ep-pulse bg-[#1D4FE0] text-white shadow-[0_3px_0_0_#1237A6] hover:bg-[#2A5CF0]"
                  : "bg-[#DDE4F0] text-[#56637F] shadow-[0_3px_0_0_#C9D3E6]"
              }`}
            >
              Login to continue
            </button>
            <p className="mt-3 text-center text-xs text-[#56637F]">Free tests need no payment. Ever.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
 *  Footer
 * ------------------------------------------------------------------ */

function Footer() {
  const cols = [
    ["Exams", [["SSC exams", "#"], ["Banking & insurance", "#"], ["Railways", "#"], ["Pricing", "#"]]],
    ["Company", [["About", "#"], ["Blog", "#"], ["Careers", "#"]]],
    ["Support", [["Help center", "#"], ["Contact", "#"], ["Privacy", "#"]]],
  ]
  return (
    <footer className="border-t border-[#DDE4F0] bg-white px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#56637F]">
              Free and premium mock tests for India&apos;s biggest government exams.
            </p>
          </div>
          {cols.map(([title, links]) => (
            <div key={title}>
              <h3 className="ep-display font-semibold">{title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#56637F]">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="transition-colors hover:text-[#1D4FE0]">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-[#DDE4F0] pt-6 text-sm text-[#56637F]">
          © {new Date().getFullYear()} ExamPro. All rights reserved.
        </div>
      </div>
    </footer>
  )
}