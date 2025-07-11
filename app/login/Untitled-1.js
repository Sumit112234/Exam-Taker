
const questionSchema = new mongoose.Schema(
  {

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    chapter: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["mcq", "numerical", "fill-in-the-blank", "true-false", "data-interpretation"],
      default: "mcq",
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
   
    questionImage: {
      type: String, // URL to image
    },
    passage: {
      type: String, // For comprehension or data interpretation
    },
    passageImage: {
      type: String, // URL to passage image
    },
    options: {
      type: [String],
      validate: {
        validator: function (v) {
          return this.type !== "mcq" || (v && v.length >= 2 && v.length <= 6)
        },
        message: "MCQ questions must have between 2 and 6 options",
      },
    },
   
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
    },
    explanation: {
      type: String,
      trim: true,
    },
 
    explanationImage: {
      type: String, // URL to explanation image
    },
    marks: {
      type: Number,
      default: 1,
      min: [0.5, "Marks must be at least 0.5"],
      max: [10, "Marks cannot exceed 10"],
    },
    negativeMarks: {
      type: Number,
      default: 0.25,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },

    
  },
  {
    timestamps: true,
  },
)


"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Search, BookOpen, Users, Award, Play, Eye, Lock, Sparkles, TrendingUp } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
}

const examTypeVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  hover: {
    scale: 1.05,
    rotate: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

const filterVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
}

const tabVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1
    }
  }
}

const loadingVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

const titleVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
}

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export default function ExamsPage() {
  const { user } = useAuth()
  const [examTypes, setExamTypes] = useState([])
  const [exams, setExams] = useState([])
  const [resultIds, setResultIds] = useState([])
  const [mockTests, setMockTests] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [filteredMockTests, setFilteredMockTests] = useState([])
  const [filters, setFilters] = useState({
    examType: "all",
    difficulty: "all",
    type: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("exams")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterData()
  }, [exams, mockTests, filters, searchQuery])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const resultResponse = await fetch("/api/results/exam")
      if (resultResponse.ok) {
        const resultData = await resultResponse.json()
        console.log("Fetched results:", resultData)

        const resultMap = {}
        resultData.results?.forEach(({ examId, resultId }) => {
          resultMap[examId] = resultId
        })

        setResultIds(resultMap)
      }

      const examsResponse = await fetch("/api/exams")
      if (examsResponse.ok) {
        const examsData = await examsResponse.json()
        console.log("Fetched exams:", examsData)
        setExams(examsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterData = () => {
    console.log(exams, filters, searchQuery)
    
    const filteredExamsData = exams?.exams?.filter((exam) => {
      const matchesExamType = (filters.type === "all" || exam.type === filters.type) && 
                             (filters.difficulty === "all" || exam.difficulty === filters.difficulty) && 
                             (filters.examType === "all" || exam.examName === filters.examType)

      const matchesSearch =
        searchQuery === '' ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.type.toLowerCase().includes(searchQuery.toLowerCase())

      console.log(matchesExamType, matchesSearch, exam.isActive)
      return matchesExamType && matchesSearch && exam.isActive
    })

    console.log("Filtered Exams:", filteredExamsData)

    const filteredMockTestsData = mockTests.filter((mockTest) => {
      const matchesExamType = filters.examType === "all" || mockTest.examId?.examType === filters.examType
      const matchesDifficulty = filters.difficulty === "all" || mockTest.difficulty === filters.difficulty
      const matchesType = filters.type === "all" || mockTest.type === filters.type
      const matchesSearch = !searchQuery || mockTest.title.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesExamType && matchesDifficulty && matchesType && matchesSearch && mockTest.isActive
    })

    setFilteredExams(filteredExamsData ? filteredExamsData : [])
    setFilteredMockTests(filteredMockTestsData)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
        <motion.div
          variants={loadingVariants}
          animate="animate"
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"></div>
          <motion.div
            className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-b-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="container py-6 relative z-10">
        <motion.div
          className="mb-6"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.span
              className="inline-block"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Exam Portal
            </motion.span>
            <motion.div
              className="absolute -top-2 -right-2"
              variants={pulseVariants}
              animate="animate"
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mt-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Choose from our comprehensive collection of exams and mock tests
          </motion.p>
        </motion.div>

        {/* Exam Types Overview */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {examTypes.map((examType, index) => (
            <motion.div key={examType._id} variants={examTypeVariants}>
              <motion.div
                whileHover="hover"
                className="relative group"
              >
                <Card className="card-hover border-l-4 relative overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300" 
                      style={{ borderLeftColor: examType.color }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <motion.span 
                        className="text-2xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      >
                        {examType.icon}
                      </motion.span>
                      <div>
                        <CardTitle className="text-lg">{examType.name}</CardTitle>
                        <CardDescription className="text-sm">{examType.code}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="flex justify-between text-sm">
                      <span>Exams: {exams.filter((e) => e.examType._id === examType._id).length}</span>
                      <span>Mock Tests: {mockTests.filter((m) => m.examId?.examType === examType._id).length}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={filterVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <Card className="card-hover bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg" />
            <CardContent className="pt-6 relative z-10">
              <div className="grid gap-4 md:grid-cols-4">
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                >
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exams and tests..."
                    className="pl-8 bg-white/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Select value={filters.examType} onValueChange={(value) => handleFilterChange("examType", value)}>
                    <SelectTrigger className="bg-white/50 border-blue-200 hover:border-blue-400 transition-colors">
                      <SelectValue placeholder="Exam Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exam Types</SelectItem>
                      {exams?.filters?.examNames?.map((type, id) => (
                        <SelectItem key={id} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
                    <SelectTrigger className="bg-white/50 border-blue-200 hover:border-blue-400 transition-colors">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      {exams?.filters?.difficulties?.map((type, id) => (
                        <SelectItem key={id} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger className="bg-white/50 border-blue-200 hover:border-blue-400 transition-colors">
                      <SelectValue placeholder="Test Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {exams?.filters?.types?.map((type, id) => (
                        <SelectItem key={id} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TabsList className="grid w-full grid-cols-2 lg:w-96 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger 
                value="exams" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                <BookOpen className="h-4 w-4" />
                Full Exams ({filteredExams.length})
              </TabsTrigger>
              <TabsTrigger 
                value="mock-tests" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Award className="h-4 w-4" />
                Mock Tests ({filteredMockTests.length})
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            <TabsContent value="exams" className="space-y-6">
              <motion.div 
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                key="exams"
              >
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam, index) => (
                    <motion.div
                      key={exam._id}
                      variants={cardVariants}
                      whileHover="hover"
                      className="group"
                    >
                      <Card className="overflow-hidden card-hover group bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <CardHeader className="relative z-10">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                                {exam.title}
                              </CardTitle>
                              <CardDescription className="mt-1 flex items-center gap-2">
                                <motion.span 
                                  className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-200"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {exam.type}
                                </motion.span>
                              </CardDescription>
                            </div>
                            {!exam?.visibility?.isFree && user?.subscription?.status === "inactive" && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                              >
                                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                                  Premium
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="relative z-10">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <motion.div 
                                className="flex items-center gap-2"
                                whileHover={{ x: 2 }}
                              >
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span>{exam.totalDuration} mins</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center gap-2"
                                whileHover={{ x: 2 }}
                              >
                                <BookOpen className="h-4 w-4 text-green-500" />
                                <span>{exam.totalQuestions} questions</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center gap-2"
                                whileHover={{ x: 2 }}
                              >
                                <Award className="h-4 w-4 text-purple-500" />
                                <span>{exam.totalMarks} marks</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center gap-2"
                                whileHover={{ x: 2 }}
                              >
                                <Users className="h-4 w-4 text-orange-500" />
                                <span>{exam.attempts} attempts</span>
                              </motion.div>
                            </div>

                            {exam.sections && exam.sections.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Sections:</p>
                                <div className="flex flex-wrap gap-1">
                                  {exam.sections.slice(0, 3).map((section, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: index * 0.1 }}
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <Badge variant="outline" className="text-xs border-blue-200 hover:border-blue-400 transition-colors">
                                        {section.name}
                                      </Badge>
                                    </motion.div>
                                  ))}
                                  {exam.sections.length > 3 && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.3 }}
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <Badge variant="outline" className="text-xs border-blue-200 hover:border-blue-400 transition-colors">
                                        +{exam.sections.length - 3} more
                                      </Badge>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="flex gap-2 relative z-10">
                          {exam.visibility.subscriptionRequired ? (
                            <Link href="/subscriptions" className="flex-1">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full"
                              >
                                <Button variant="destructive" className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg">
                                  <Lock className="mr-2 h-4 w-4" />
                                  Unlock Now
                                </Button>
                              </motion.div>
                            </Link>
                          ) : resultIds[exam._id] ? (
                            <Link href={`/results/${resultIds[exam._id]}`} className="flex-1">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full"
                              >
                                <Button variant="outline" className="w-full border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Result
                                </Button>
                              </motion.div>
                            </Link>
                          ) : (
                            <>
                              <Link href={`/exams/${exam._id}`} className="flex-1">
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full"
                                >
                                  <Button variant="outline" className="w-full border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Button>
                                </motion.div>
                              </Link>
                              <Link href={`/exams/${exam._id}/instructions`} className="flex-1">
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full"
                                >
                                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 shadow-lg">
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Exam
                                  </Button>
                                </motion.div>
                              </Link>
                            </>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    className="col-span-full text-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    </motion.div>
                    <p className="text-muted-foreground">
                      No exams found matching your criteria. Try adjusting your filters.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="mock-tests" className="space-y-6">
              <motion.div 
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                key="mock-tests"
              >
                {filteredMockTests.length > 0 ? (
                  filteredMockTests.map((mockTest, index) => (
                    <motion.div
                      key={mockTest._id}
                      variants={cardVariants}
                      whileHover="hover"
                      className="group"
                    >
                      <Card className="overflow-hidden card-hover group bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <CardHeader className="relative z-10">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                                {mockTest.title}
                              </CardTitle>
                              <CardDescription className="mt-1 flex items-center gap-2">
                                <motion.div whileHover={{ scale: 1.05 }}>
                                  <Badge
                                    variant={
                                      mockTest.type === "full"
                                        ? "default"
                                        : mockTest.type === "mini"
                                          ? "secondary"
                                          : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {mockTest.type === "full"
                                      ? "Full Test"
                                      : mockTest.type === "mini"
                                        ? "Mini Test"
                                        : "Sectional"}
                                  </Badge>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }}></motion.div>