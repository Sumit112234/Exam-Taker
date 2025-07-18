"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  BookOpen, 
  Clock, 
  BarChart3, 
  Sparkles, 
  Trophy, 
  Target,
  ChevronDown,
  Star,
  Zap,
  Brain,
  TrendingUp
} from "lucide-react"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -100])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])

  useEffect(() => {
    setMounted(true)
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen overflow-hidden w-fit px-11 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
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
        
        {/* Floating Particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Mouse Follower */}
      <motion.div
        className="fixed pointer-events-none z-50 w-6 h-6 border border-purple-400/50 rounded-full"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />

      {/* Header */}
      <motion.header 
        className="relative z-10 container flex items-center justify-between py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="relative">
            <BookOpen className="h-8 w-8 text-purple-400" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ExamPro
          </h1>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button 
              variant="ghost" 
              className="text-purple-200 hover:text-white hover:bg-purple-800/50 transition-all duration-300"
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              Sign Up
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 container flex flex-col items-center justify-center min-h-[80vh] py-12 text-center">
        <motion.div
          style={{ y: y1 }}
          className="max-w-5xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-800/50 to-pink-800/50 border border-purple-500/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-purple-300" />
              <span className="text-sm text-purple-200">AI-Powered Learning Platform</span>
              <Star className="h-4 w-4 text-pink-300" />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-tight"
          >
            <span className="block text-white">Master Your</span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              Exams
            </span>
            <motion.span 
              className="block text-white"
              animate={{ 
                textShadow: [
                  "0 0 0px rgba(168, 85, 247, 0)",
                  "0 0 20px rgba(168, 85, 247, 0.5)",
                  "0 0 0px rgba(168, 85, 247, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              with ExamPro
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 text-xl sm:text-2xl text-purple-200 max-w-3xl mx-auto leading-relaxed"
          >
            The ultimate AI-powered platform for exam preparation with 
            <span className="text-purple-300 font-semibold"> immersive practice tests</span>, 
            <span className="text-pink-300 font-semibold"> real-time analytics</span>, and 
            <span className="text-purple-300 font-semibold"> personalized learning paths</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-semibold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 border-0"
                >
                  <span className="flex items-center gap-3">
                    Start Your Journey
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Button>
              </motion.div>
            </Link>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-purple-400/50 text-purple-200 hover:bg-purple-800/30 hover:text-white transition-all duration-300"
              >
                <Trophy className="h-5 w-5 mr-2" />
                View Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <StatCard number="50K+" label="Students" />
            <StatCard number="99%" label="Success Rate" />
            <StatCard number="1M+" label="Questions" />
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-purple-300"
          >
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section 
        style={{ y: y2 }}
        className="relative z-10 container py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Why Choose <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ExamPro?</span>
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Experience the future of exam preparation with our cutting-edge features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="h-12 w-12" />}
            title="AI-Powered Learning"
            description="Adaptive algorithms that personalize your learning experience based on your strengths and weaknesses."
            gradient="from-purple-500 to-blue-500"
            delay={0.1}
          />
          <FeatureCard
            icon={<Zap className="h-12 w-12" />}
            title="Lightning Fast Practice"
            description="Instant feedback and real-time scoring to accelerate your learning process."
            gradient="from-pink-500 to-purple-500"
            delay={0.2}
          />
          <FeatureCard
            icon={<Target className="h-12 w-12" />}
            title="Precision Targeting"
            description="Focus on specific topics and question types to maximize your study efficiency."
            gradient="from-blue-500 to-cyan-500"
            delay={0.3}
          />
          <FeatureCard
            icon={<BookOpen className="h-12 w-12" />}
            title="Vast Question Bank"
            description="Access over 1 million carefully curated questions across all major subjects and exam formats."
            gradient="from-green-500 to-blue-500"
            delay={0.4}
          />
          <FeatureCard
            icon={<Clock className="h-12 w-12" />}
            title="Realistic Exam Simulation"
            description="Practice under real exam conditions with precise timing and authentic question formats."
            gradient="from-orange-500 to-red-500"
            delay={0.5}
          />
          <FeatureCard
            icon={<TrendingUp className="h-12 w-12" />}
            title="Advanced Analytics"
            description="Deep insights into your performance with detailed progress tracking and improvement suggestions."
            gradient="from-purple-500 to-pink-500"
            delay={0.6}
          />
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 container py-12 border-t border-purple-800/30">
        <div className="text-center">
          <motion.p 
            className="text-purple-300"
            whileHover={{ scale: 1.05 }}
          >
            © 2025 ExamPro. Empowering students worldwide. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
      }}
      className="group relative"
    >
      <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
        {/* Glow Effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300`} />
        
        {/* Content */}
        <div className="relative">
          <motion.div 
            className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${gradient} mb-6`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-white">
              {icon}
            </div>
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors">
            {title}
          </h3>
          
          <p className="text-purple-300 leading-relaxed group-hover:text-purple-200 transition-colors">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ number, label }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: Math.random() * 0.2 }}
        className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
      >
        {number}
      </motion.div>
      <div className="text-purple-300 mt-1">{label}</div>
    </motion.div>
  )
}