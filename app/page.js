"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { 
  BookOpen, 
  Clock, 
  BarChart3, 
  Trophy, 
  Target,
  Star,
  Zap,
  Brain,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  LineChart,
  Shield,
  Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.9])

  const router = useRouter();

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(139 92 246 / 0.15) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Gradient Orbs - Subtle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="relative">
                <GraduationCap className="h-9 w-9 text-purple-500" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-bold text-white">ExamPro</span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#achievements">Achievements</NavLink>
              <NavLink href="#why-us">Why Us</NavLink>
              <NavLink href="#what-we-do">What We Do</NavLink>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button onClick={()=>router.push('/login')} className="px-5 py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
                Login
              </button>
              <motion.button 
              onClick={()=>router.push('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
              >
                Start Free Trial
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/5 bg-slate-900/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 space-y-3">
              <MobileNavLink href="#features">Features</MobileNavLink>
              <MobileNavLink href="#achievements">Achievements</MobileNavLink>
              <MobileNavLink href="#why-us">Why Us</MobileNavLink>
              <MobileNavLink href="#what-we-do">What We Do</MobileNavLink>
              <div className="pt-4 space-y-3">
                <button className="w-full px-5 py-2.5 text-sm font-medium text-white/80 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  Login
                </button>
                <button className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg">
                  Start Free Trial
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">Trusted by 50,000+ Students</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Master Your Exams with{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Precision
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              Transform your exam preparation with personalized learning paths, real-time analytics, and a vast library of practice questions
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <motion.button
              onClick={()=>router.push('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
              >
                <span className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button
              onClick={()=>router.push('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 text-white text-lg font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            >
              <StatCard number="50K+" label="Active Students" />
              <StatCard number="1M+" label="Questions" />
              <StatCard number="99%" label="Success Rate" />
              <StatCard number="4.9/5" label="User Rating" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="relative py-20 px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            title="Our Achievements"
            subtitle="Proven track record of helping students succeed"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <AchievementCard
              icon={<Trophy className="h-8 w-8" />}
              title="Industry Leading"
              description="Recognized as the #1 exam preparation platform by education experts"
              gradient="from-yellow-500 to-orange-500"
            />
            <AchievementCard
              icon={<Award className="h-8 w-8" />}
              title="Award Winning"
              description="Winner of Best EdTech Innovation 2024 and Excellence in Learning"
              gradient="from-purple-500 to-pink-500"
            />
            <AchievementCard
              icon={<Users className="h-8 w-8" />}
              title="Global Reach"
              description="Serving students in over 150 countries with 24/7 support"
              gradient="from-blue-500 to-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section id="why-us" className="relative py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            title="Why Choose ExamPro"
            subtitle="Experience the difference that sets us apart"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <WhyUsItem
                icon={<Brain className="h-6 w-6" />}
                title="Adaptive AI Learning"
                description="Our AI analyzes your performance and creates personalized study plans that adapt to your learning style"
              />
              <WhyUsItem
                icon={<Shield className="h-6 w-6" />}
                title="Proven Methodology"
                description="Based on cognitive science research and tested by thousands of successful students"
              />
              <WhyUsItem
                icon={<Zap className="h-6 w-6" />}
                title="Instant Feedback"
                description="Get real-time explanations and insights to understand concepts immediately"
              />
              <WhyUsItem
                icon={<LineChart className="h-6 w-6" />}
                title="Progress Tracking"
                description="Visualize your improvement with detailed analytics and performance metrics"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 p-8 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl" />
                <div className="relative h-full flex flex-col justify-center space-y-6">
                  <div className="bg-slate-900/80 rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-slate-400">Live Session</span>
                    </div>
                    <p className="text-white font-semibold">Mathematics - Advanced Calculus</p>
                  </div>
                  <div className="bg-slate-900/80 rounded-xl p-6 border border-blue-500/20">
                    <p className="text-slate-400 text-sm mb-2">Your Progress</p>
                    <div className="flex items-end gap-2">
                      {[85, 70, 90, 75, 95].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-purple-600 to-blue-600 rounded-t" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 rounded-xl p-6 border border-pink-500/20">
                    <p className="text-slate-400 text-sm mb-2">Next Milestone</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">Chapter 5 Complete</span>
                      <span className="text-purple-400">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section id="what-we-do" className="relative py-20 px-6 lg:px-8 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            title="What We Do"
            subtitle="Comprehensive exam preparation solutions"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Practice Tests"
              description="Access thousands of practice questions with detailed explanations and step-by-step solutions"
              color="purple"
            />
            <FeatureCard
              icon={<Target className="h-8 w-8" />}
              title="Personalized Plans"
              description="Get custom study schedules based on your goals, timeline, and learning patterns"
              color="blue"
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Timed Simulations"
              description="Practice under real exam conditions with accurate timing and authentic formats"
              color="indigo"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Performance Analytics"
              description="Track your progress with comprehensive dashboards and insights"
              color="cyan"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Improvement Plans"
              description="Identify weak areas and get targeted exercises to boost your scores"
              color="pink"
            />
            <FeatureCard
              icon={<Star className="h-8 w-8" />}
              title="Expert Support"
              description="Connect with tutors and mentors for personalized guidance and support"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Ace Your Exams?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of successful students today
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-purple-600 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all"
              >
                Start Your Free Trial
              </motion.button>
              <p className="text-sm text-white/80 mt-4">No credit card required • 14-day free trial</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="h-8 w-8 text-purple-500" />
                <span className="text-xl font-bold text-white">ExamPro</span>
              </div>
              <p className="text-slate-400 text-sm">
                Empowering students worldwide with AI-powered exam preparation
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-slate-400 text-sm">
            <p>© 2025 ExamPro. All rights reserved. Empowering students worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, children }) {
  return (
    <a 
      href={href}
      className="text-sm font-medium text-white/70 hover:text-white transition-colors"
    >
      {children}
    </a>
  )
}

function MobileNavLink({ href, children }) {
  return (
    <a 
      href={href}
      className="block text-sm font-medium text-white/70 hover:text-white transition-colors py-2"
    >
      {children}
    </a>
  )
}

function StatCard({ number, label }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="text-center"
    >
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-sm text-slate-400">{label}</div>
    </motion.div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
        {title}
      </h2>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </motion.div>
  )
}

function AchievementCard({ icon, title, description, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <div className="relative p-8 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} mb-4`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

function WhyUsItem({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ x: 10 }}
      className="flex gap-4"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
    </motion.div>
  )
}

function FeatureCard({ icon, title, description, color }) {
  const colorClasses = {
    purple: "from-purple-500 to-purple-600 hover:shadow-purple-500/25",
    blue: "from-blue-500 to-blue-600 hover:shadow-blue-500/25",
    indigo: "from-indigo-500 to-indigo-600 hover:shadow-indigo-500/25",
    cyan: "from-cyan-500 to-cyan-600 hover:shadow-cyan-500/25",
    pink: "from-pink-500 to-pink-600 hover:shadow-pink-500/25",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <div className="relative h-full p-8 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all hover:shadow-2xl">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} mb-4 shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}