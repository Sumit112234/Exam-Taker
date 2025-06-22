"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, Maximize, User, Pause, Play, FileText, AlertCircle, Flag } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function TakeExam({ params }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  // const { examId } = params
  const { examId } = use(params) 

  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [markedForReview, setMarkedForReview] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(30)
  const [sectionTimeLeft, setSectionTimeLeft] = useState(30)
  const [isPaused, setIsPaused] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [autoSaveStatus, setAutoSaveStatus] = useState("")
  const [questionMap, setQuestionMap] = useState({}) // Maps section-question index to actual question object

  const timerRef = useRef(null)
  const sectionTimerRef = useRef(null)
  const hasSubmittedRef = useRef(false)


  useEffect(() => {
    fetchExamData()

    // Cleanup function
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (sectionTimerRef.current) clearInterval(sectionTimerRef.current)
    }
  }, [examId])

  useEffect(() => {
    if (exam && !isPaused) {
      startTimer()
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (sectionTimerRef.current) clearInterval(sectionTimerRef.current)
    }
  }, [exam, isPaused])

  useEffect(() => {
    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        saveProgress()
      }
    }, 30000)

    return () => clearInterval(autoSaveInterval)
  }, [answers])

  const fetchExamData = async () => {
    try {
      setIsLoading(true)

      const examResponse = await fetch(`/api/exams/${examId}`)
      // console.log("Exam Response:", examResponse)
      if (!examResponse.ok) {
        throw new Error("Failed to fetch exam")
      }

      const examData = await examResponse.json()
      console.log("Exam Data:", examData)
      setExam(examData)

      // Fetch questions for this exam
      const questionsResponse = await fetch(`/api/exams/${examId}/questions`)
      if (!questionsResponse.ok) {
        throw new Error("Failed to fetch questions")
      }

      const questionsData = await questionsResponse.json()

      // Create a map of questions by section and index
      const qMap = {}
      const questionIndex = 0

      console.log("Questions Data:", questionsData, "examData:", examData)

      // Process questions by section
      examData.sections.forEach((section, sectionIndex) => {
        const sectionQuestions = section.questionIds
          .map((qId) => {
            return questionsData.find((q) => q._id === qId.id) || null
          })
          .filter((q) => q !== null)
          // console.log("Section Questions:", sectionQuestions, sectionIndex, questionsData)

        sectionQuestions.forEach((question, qIndex) => {
          qMap[`${sectionIndex}-${qIndex}`] = question
        })
      })

      setQuestionMap(qMap)
      setQuestions(questionsData)

      console.log("Questions Map:", qMap,questionsData, examData)

      // Set initial time
      setTimeLeft(examData.totalDuration * 60)
      if (examData.sections && examData.sections.length > 0) {
        setSectionTimeLeft(examData.sections[0].duration * 60)
      }

      // Check for saved progress
      const savedProgress = localStorage.getItem(`exam-progress-${examId}`)
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress)
          setAnswers(progress.answers || {})
          setMarkedForReview(new Set(progress.markedForReview || []))
          setCurrentSectionIndex(progress.currentSection || 0)
          setCurrentQuestionIndex(progress.currentQuestion || 0)

          // Only restore time if it's within the last 24 hours
          const savedTime = new Date(progress.timestamp)
          const now = new Date()
          const hoursDiff = (now - savedTime) / (1000 * 60 * 60)

          if (hoursDiff < 24) {
            console.log("Restoring progress from local storage:", progress, timeLeft)
            setTimeLeft(progress.timeLeft || examData.totalDuration * 60)
            setSectionTimeLeft(progress.sectionTimeLeft || examData.sections[0].duration * 60)
          }

          toast({
            title: "Progress Restored",
            description: "Your previous exam progress has been restored.",
            variant: "default",
          })
        } catch (error) {
          console.error("Error restoring progress:", error)
        }
      }
    } catch (error) {
      console.error("Error fetching exam data:", error)
      toast({
        title: "Error",
        description: "Failed to load exam data. Please try again.",
        variant: "destructive",
      })
      console.log("Redirecting to exams page due to error")
      // router.push("/exams")
    } finally {
      setIsLoading(false)
    }
  }
const startTimer = () => {
  // Clear previous timers before setting new ones
  if (timerRef.current) clearInterval(timerRef.current)
  if (sectionTimerRef.current) clearInterval(sectionTimerRef.current)

  console.log("Timer started with time left:", timeLeft)

  timerRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timerRef.current) // Prevent additional triggers
        console.log("Time's up! Auto submitting exam.")
        handleAutoSubmit()
        return 0
      }
      return prev - 1
    })
  }, 1000)

  sectionTimerRef.current = setInterval(() => {
    setSectionTimeLeft((prev) => {
      if (prev <= 1) {
        handleSectionComplete()
        return 0
      }
      return prev - 1
    })
  }, 1000)
}

  const saveProgress = async () => {
    try {
      setAutoSaveStatus("Saving...")

      // Save to local storage for quick recovery
      const progress = {
        answers,
        markedForReview: Array.from(markedForReview),
        currentSection: currentSectionIndex,
        currentQuestion: currentQuestionIndex,
        timeLeft,
        sectionTimeLeft,
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem(`exam-progress-${examId}`, JSON.stringify(progress))

      // Also save to server
      await fetch(`/api/exams/${examId}/save-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progress),
      })

      setAutoSaveStatus("Saved")
      setTimeout(() => setAutoSaveStatus(""), 2000)
    } catch (error) {
      console.error("Error saving progress:", error)
      setAutoSaveStatus("Error saving")
      setTimeout(() => setAutoSaveStatus(""), 2000)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (value) => {
    const questionKey = `${currentSectionIndex}-${currentQuestionIndex}`
    setAnswers({
      ...answers,
      [questionKey]: value,
    })
  }

  const handleMarkForReview = () => {
    const questionKey = `${currentSectionIndex}-${currentQuestionIndex}`
    const newMarked = new Set(markedForReview)

    if (newMarked.has(questionKey)) {
      newMarked.delete(questionKey)
    } else {
      newMarked.add(questionKey)
    }

    setMarkedForReview(newMarked)
  }

  const handleClearResponse = () => {
    const questionKey = `${currentSectionIndex}-${currentQuestionIndex}`
    const newAnswers = { ...answers }
    delete newAnswers[questionKey]
    setAnswers(newAnswers)
  }

  const goToQuestion = (sectionIndex, questionIndex) => {
    if (sectionIndex !== currentSectionIndex) {
      // Save current section time
      saveProgress()

      // Update section time
      if (exam.sections[sectionIndex]) {
        setSectionTimeLeft(exam.sections[sectionIndex].duration * 60)
      }
    }

    setCurrentSectionIndex(sectionIndex)
    setCurrentQuestionIndex(questionIndex)
  }

  const goToNextQuestion = () => {
    const currentSection = exam.sections[currentSectionIndex]
    if (currentQuestionIndex < currentSection.questions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentSectionIndex < exam.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentQuestionIndex(0)
      setSectionTimeLeft(exam.sections[currentSectionIndex + 1].duration * 60)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      setCurrentQuestionIndex(exam.sections[currentSectionIndex - 1].questions - 1)
      setSectionTimeLeft(exam.sections[currentSectionIndex - 1].duration * 60)
    }
  }

  const handleSectionComplete = () => {
    if (currentSectionIndex < exam.sections.length - 1) {
      toast({
        title: "Section Time Up",
        description: `Moving to the next section: ${exam.sections[currentSectionIndex + 1].name}`,
        variant: "default",
      })

      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentQuestionIndex(0)
      setSectionTimeLeft(exam.sections[currentSectionIndex + 1].duration * 60)
    } else {
      console.log("coming to the handleAutoSubmit")
      // handleAutoSubmit()
    }
  }

  const handleAutoSubmit = async () => {


    console.log("inside handleAutoSubmit", hasSubmittedRef.current)
      // if (hasSubmittedRef.current) return // prevent duplicate submit
    
      // hasSubmittedRef.current = true


    toast({
      title: "Time's Up!",
      description: "Your exam is being submitted automatically.",
      variant: "default",
    })
    router.push(`/exams`)

    await submitExam()
  }

  const submitExam = async () => {
        console.log("inside submitExam", hasSubmittedRef.current)
    if (hasSubmittedRef.current) return // prevent duplicate submit
  
    hasSubmittedRef.current = true

    try {
      // Prepare submission data
      const submissionData = {
        answers: {},
        markedForReview: Array.from(markedForReview),
        timeSpent: exam.totalDuration * 60 - timeLeft,
      }

      // Convert answers to question ID format
      Object.entries(answers).forEach(([key, value]) => {
        const [sectionIndex, questionIndex] = key.split("-").map(Number)
        const question = questionMap[key]

        if (question && question._id) {
          submissionData.answers[question._id] = {
            answer: value,
            questionId: question._id,
            sectionIndex,
          }
        }
      })

      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        const result = await response.json()

        console.log("Exam submitted successfully:", result)
        // Clear local storage progress
        localStorage.removeItem(`exam-progress-${examId}`)

        toast({
          title: "Exam Submitted",
          description: "Your exam has been submitted successfully.",
          variant: "default",
        })

        // router.push(`/results/${result.resultId}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit exam")
      }
    } catch (error) {
      console.error("Error submitting exam:", error)
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit your exam. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false)
      startTimer()
      setShowPauseDialog(false)
    } else {
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
      if (sectionTimerRef.current) clearInterval(sectionTimerRef.current)
      setShowPauseDialog(true)
    }
  }

  const getQuestionStatus = (sectionIndex, questionIndex) => {
    const questionKey = `${sectionIndex}-${questionIndex}`
    const isAnswered = answers[questionKey] !== undefined
    const isMarked = markedForReview.has(questionKey)
    const isCurrent = sectionIndex === currentSectionIndex && questionIndex === currentQuestionIndex

    if (isCurrent) return "current"
    if (isAnswered && isMarked) return "answered-marked"
    if (isAnswered) return "answered"
    if (isMarked) return "marked"
    return "not-visited"
  }

  const getQuestionStatusColor = (status) => {
    switch (status) {
      case "current":
        return "bg-blue-500 text-white"
      case "answered":
        return "bg-green-500 text-white"
      case "answered-marked":
        return "bg-purple-500 text-white"
      case "marked":
        return "bg-orange-500 text-white"
      case "not-visited":
        return "bg-gray-200 text-gray-700"
      default:
        return "bg-gray-200 text-gray-700"
    }
  }

  const getCurrentQuestion = () => {
    const questionKey = `${currentSectionIndex}-${currentQuestionIndex}`
    return questionMap[questionKey] || null
  }

  const getQuestionStats = () => {
    let answered = 0
    let notAnswered = 0
    let notVisited = 0
    let markedForReviewCount = 0
    let answeredAndMarked = 0

    exam.sections.forEach((section, sectionIndex) => {
      for (let questionIndex = 0; questionIndex < section.questions; questionIndex++) {
        const status = getQuestionStatus(sectionIndex, questionIndex)
        switch (status) {
          case "answered":
            answered++
            break
          case "answered-marked":
            answeredAndMarked++
            break
          case "marked":
            markedForReviewCount++
            break
          case "not-visited":
            notVisited++
            break
          default:
            notAnswered++
            break
        }
      }
    })

    return { answered, notAnswered, notVisited, markedForReviewCount, answeredAndMarked }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!exam || !questions.length) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Exam Not Found</h1>
        <p className="text-muted-foreground mb-6">The exam you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/exams")}>Back to Exams</Button>
      </div>
    )
  }

  const currentQuestion = getCurrentQuestion()
  const currentSection = exam.sections[currentSectionIndex]
  const stats = getQuestionStats()

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-lg truncate max-w-[50%]">{exam.title}</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={toggleFullScreen}>
              <Maximize className="h-4 w-4 mr-2" />
              Full Screen
            </Button>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className={`font-mono text-lg ${timeLeft < 300 ? "text-red-500 font-bold" : ""}`}>
                Time Left: {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Section Tabs */}
          <div className="border-b p-4">
            <Tabs
              value={currentSectionIndex.toString()}
              onValueChange={(value) => {
                setCurrentSectionIndex(Number.parseInt(value))
                setCurrentQuestionIndex(0)
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                {exam.sections.map((section, index) => (
                  <TabsTrigger key={index} value={index.toString()} className="flex items-center gap-2">
                    {section.name}
                    <Badge variant="outline" className="text-xs">
                      {section.questions}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">Qus No. {currentQuestionIndex + 1}</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Marks</span>
                    <Badge variant="outline" className="text-green-600">
                      +{currentQuestion?.marks || 1}
                    </Badge>
                    {currentQuestion?.negativeMarks > 0 && (
                      <Badge variant="outline" className="text-red-600">
                        -{currentQuestion?.negativeMarks || 0.25}
                      </Badge>
                    )}
                    <span className="text-muted-foreground">Section: {currentSection.name}</span>
                  </div>
                </div>
                {autoSaveStatus && <div className="text-sm text-muted-foreground">{autoSaveStatus}</div>}
              </div>

              {currentQuestion && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-lg leading-relaxed">{currentQuestion.questionText}</div>

                      {currentQuestion.questionTextHindi && (
                        <div className="text-lg leading-relaxed text-gray-700 border-t pt-4">
                          {currentQuestion.questionTextHindi}
                        </div>
                      )}

                      {currentQuestion.questionImage && (
                        <div className="my-4">
                          <img
                            src={currentQuestion.questionImage || "/placeholder.svg"}
                            alt="Question"
                            className="max-w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}

                      {currentQuestion.passage && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h4 className="font-medium mb-2">Passage:</h4>
                          <p className="text-sm leading-relaxed">{currentQuestion.passage}</p>
                        </div>
                      )}

                      <RadioGroup
                        value={answers[`${currentSectionIndex}-${currentQuestionIndex}`] || ""}
                        onValueChange={handleAnswerChange}
                        className="space-y-3 mt-6"
                      >
                        {currentQuestion.options?.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent"
                          >
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Controls */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleMarkForReview}>
                    <Flag className="h-4 w-4 mr-2" />
                    Mark For Review & Next
                  </Button>
                  <Button variant="outline" onClick={handleClearResponse}>
                    Clear Response
                  </Button>
                  <Button onClick={goToNextQuestion}>Save & Next</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <Avatar>
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name || "Student"}</p>
                <p className="text-sm text-muted-foreground">ID: {user?.id || "N/A"}</p>
              </div>
            </div>

            {/* Question Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Answered</span>
                </div>
                <span className="font-medium">{stats.answered}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Not Answered</span>
                </div>
                <span className="font-medium">{stats.notAnswered}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span className="text-sm">Not Visited</span>
                </div>
                <span className="font-medium">{stats.notVisited}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm">Marked for Review</span>
                </div>
                <span className="font-medium">{stats.markedForReviewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">Answered & Marked for Review</span>
                </div>
                <span className="font-medium">{stats.answeredAndMarked}</span>
              </div>
            </div>

            {/* Current Section */}
            <div>
              <h3 className="font-medium mb-3">{currentSection.name}</h3>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: currentSection.questions }, (_, index) => {
                  const status = getQuestionStatus(currentSectionIndex, index)
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={`h-10 w-10 p-0 ${getQuestionStatusColor(status)}`}
                      onClick={() => goToQuestion(currentSectionIndex, index)}
                    >
                      {index + 1}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={togglePause} disabled={isPaused}>
                <Pause className="h-4 w-4 mr-2" />
                Pause Test
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Questions
              </Button>
              <Button className="w-full" onClick={() => setShowSubmitDialog(true)}>
                Submit Section
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam? You have answered {stats.answered} out of {exam.totalQuestions}{" "}
              questions.
              {stats.notAnswered > 0 && (
                <div className="flex items-center gap-2 mt-2 text-amber-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>You have {stats.notAnswered} unanswered questions.</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Exam
            </Button>
            <Button onClick={submitExam}>Submit Exam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exam Paused</DialogTitle>
            <DialogDescription>Your exam is currently paused. Click resume to continue.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={togglePause}>
              <Play className="h-4 w-4 mr-2" />
              Resume Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// "use client"

// import { useState, useEffect, useRef, use } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Label } from "@/components/ui/label"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Clock, Maximize, User, Pause, Play, FileText, AlertCircle, Flag } from "lucide-react"
// import { useAuth } from "@/contexts/AuthContext"

// export default function TakeExam({ params }) {
//   const router = useRouter()
//   const { user } = useAuth()
//   const { examId } = use(params) 
//   console.log("params:", examId)

//   const [exam, setExam] = useState(null)
//   const [questions, setQuestions] = useState([])
//   const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
//   const [answers, setAnswers] = useState({})
//   const [markedForReview, setMarkedForReview] = useState(new Set())
//   const [timeLeft, setTimeLeft] = useState(0)
//   const [sectionTimeLeft, setSectionTimeLeft] = useState(0)
//   const [isPaused, setIsPaused] = useState(false)
//   const [isFullScreen, setIsFullScreen] = useState(false)
//   const [showSubmitDialog, setShowSubmitDialog] = useState(false)
//   const [showPauseDialog, setShowPauseDialog] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)
//   const [autoSaveStatus, setAutoSaveStatus] = useState("")

//   const timerRef = useRef(null)
//   const sectionTimerRef = useRef(null)

//   useEffect(() => {
//     fetchExamData()
//   }, [examId])

//   useEffect(() => {
//     if (exam && !isPaused) {
//       startTimer()
//     }
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current)
//       if (sectionTimerRef.current) clearInterval(sectionTimerRef.current)
//     }
//   }, [exam, isPaused])

//   useEffect(() => {
//     // Auto-save every 30 seconds
//     const autoSaveInterval = setInterval(() => {
//       if (Object.keys(answers).length > 0) {
//         saveProgress()
//       }
//     }, 30000)

//     return () => clearInterval(autoSaveInterval)
//   }, [answers])

//   const fetchExamData = async () => {
//     try {
//       setIsLoading(true)

//       const examResponse = await fetch(`/api/exams/${examId}`)
//       if (!examResponse.ok) throw new Error("Failed to fetch exam")

//       const examData = await examResponse.json()
//       setExam(examData)

//       const questionsResponse = await fetch(`/api/exams/${exam}/questions`)
//       if (!questionsResponse.ok) throw new Error("Failed to fetch questions")

//       const questionsData = await questionsResponse.json()
//       setQuestions(questionsData)

//       // Set initial time
//       setTimeLeft(examData.totalDuration * 60)
//       if (examData.sections && examData.sections.length > 0) {
//         setSectionTimeLeft(examData.sections[0].duration * 60)
//       }
//     } catch (error) {
//       console.error("Error fetching exam data:", error)
//       router.push("/exams")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const startTimer = () => {
//     // Main timer
//     timerRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           handleAutoSubmit()
//           return 0
//         }
//         return prev - 1
//       })
//     }, 1000)

//     // Section timer
//     sectionTimerRef.current = setInterval(() => {
//       setSectionTimeLeft((prev) => {
//         if (prev <= 1) {
//           handleSectionComplete()
//           return 0
//         }
//         return prev - 1
//       })
//     }, 1000)
//   }

//   const saveProgress = async () => {
//     try {
//       setAutoSaveStatus("Saving...")

//       await fetch(`/api/exams/${examId}/save-progress`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           answers,
//           markedForReview: Array.from(markedForReview),
//           currentSection: currentSectionIndex,
//           currentQuestion: currentQuestionIndex,
//           timeLeft,
//           sectionTimeLeft,
//         }),
//       })

//       setAutoSaveStatus("Saved")
//       setTimeout(() => setAutoSaveStatus(""), 2000)
//     } catch (error) {
//       console.error("Error saving progress:", error)
//       setAutoSaveStatus("Error saving")
//       setTimeout(() => setAutoSaveStatus(""), 2000)
//     }
//   }

//   const formatTime = (seconds) => {
//     const hours = Math.floor(seconds / 3600)
//     const mins = Math.floor((seconds % 3600) / 60)
//     const secs = seconds % 60

//     if (hours > 0) {
//       return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
//     }
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
//   }

//   const handleAnswerChange = (value) => {
//     const questionKey = `${currentSectionIndex}-${currentQuestionIndex}`
//     setAnswers({
//       ...answers,
//       [questionKey]: value,
//     })
//   }

//   const handleMarkForReview = () => {
//     const questionKey = `${currentSectionIndex}-${currentQuestionIndex}`
//     const newMarked = new Set(markedForReview)

//     if (newMarked.has(questionKey)) {
//       newMarked.delete(questionKey)
//     } else {
//       newMarked.add(questionKey)
//     }

//     setMarkedForReview(newMarked)
//   }

//   const handleClearResponse = () => {
//     const questionKey = `${currentSectionIndex}-${currentQuestionIndex}`
//     const newAnswers = { ...answers }
//     delete newAnswers[questionKey]
//     setAnswers(newAnswers)
//   }

//   const goToQuestion = (sectionIndex, questionIndex) => {
//     setCurrentSectionIndex(sectionIndex)
//     setCurrentQuestionIndex(questionIndex)
//   }

//   const goToNextQuestion = () => {
//     const currentSection = exam.sections[currentSectionIndex]
//     if (currentQuestionIndex < currentSection.questions - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1)
//     } else if (currentSectionIndex < exam.sections.length - 1) {
//       setCurrentSectionIndex(currentSectionIndex + 1)
//       setCurrentQuestionIndex(0)
//       setSectionTimeLeft(exam.sections[currentSectionIndex + 1].duration * 60)
//     }
//   }

//   const goToPreviousQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1)
//     } else if (currentSectionIndex > 0) {
//       setCurrentSectionIndex(currentSectionIndex - 1)
//       setCurrentQuestionIndex(exam.sections[currentSectionIndex - 1].questions - 1)
//       setSectionTimeLeft(exam.sections[currentSectionIndex - 1].duration * 60)
//     }
//   }

//   const handleSectionComplete = () => {
//     if (currentSectionIndex < exam.sections.length - 1) {
//       setCurrentSectionIndex(currentSectionIndex + 1)
//       setCurrentQuestionIndex(0)
//       setSectionTimeLeft(exam.sections[currentSectionIndex + 1].duration * 60)
//     } else {
//       handleAutoSubmit()
//     }
//   }

//   const handleAutoSubmit = async () => {
//     await submitExam()
//   }

//   const submitExam = async () => {
//     try {
//       const response = await fetch(`/api/exams/${examId}/submit`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           answers,
//           markedForReview: Array.from(markedForReview),
//           timeSpent: exam.totalDuration * 60 - timeLeft,
//         }),
//       })

//       if (response.ok) {
//         const result = await response.json()
//         router.push(`/results/${result.resultId}`)
//       }
//     } catch (error) {
//       console.error("Error submitting exam:", error)
//     }
//   }

//   const toggleFullScreen = () => {
//     if (!document.fullscreenElement) {
//       document.documentElement.requestFullscreen()
//       setIsFullScreen(true)
//     } else {
//       document.exitFullscreen()
//       setIsFullScreen(false)
//     }
//   }

//   const togglePause = () => {
//     if (isPaused) {
//       setIsPaused(false)
//       startTimer()
//       setShowPauseDialog(false)
//     } else {
//       setIsPaused(true)
//       if (timerRef.current) clearInterval(timerRef.current)
//       if (sectionTimerRef.current) clearInterval(sectionTimerRef.current)
//       setShowPauseDialog(true)
//     }
//   }

//   const getQuestionStatus = (sectionIndex, questionIndex) => {
//     const questionKey = `${sectionIndex}-${questionIndex}`
//     const isAnswered = answers[questionKey] !== undefined
//     const isMarked = markedForReview.has(questionKey)
//     const isCurrent = sectionIndex === currentSectionIndex && questionIndex === currentQuestionIndex

//     if (isCurrent) return "current"
//     if (isAnswered && isMarked) return "answered-marked"
//     if (isAnswered) return "answered"
//     if (isMarked) return "marked"
//     return "not-visited"
//   }

//   const getQuestionStatusColor = (status) => {
//     switch (status) {
//       case "current":
//         return "bg-blue-500 text-white"
//       case "answered":
//         return "bg-green-500 text-white"
//       case "answered-marked":
//         return "bg-purple-500 text-white"
//       case "marked":
//         return "bg-orange-500 text-white"
//       case "not-visited":
//         return "bg-gray-200 text-gray-700"
//       default:
//         return "bg-gray-200 text-gray-700"
//     }
//   }

//   const getCurrentQuestion = () => {
//     if (!questions || !exam) return null

//     let questionIndex = 0
//     for (let i = 0; i < currentSectionIndex; i++) {
//       questionIndex += exam.sections[i].questions
//     }
//     questionIndex += currentQuestionIndex

//     return questions[questionIndex]
//   }

//   const getQuestionStats = () => {
//     let answered = 0
//     let notAnswered = 0
//     let notVisited = 0
//     let markedForReviewCount = 0
//     let answeredAndMarked = 0

//     exam.sections.forEach((section, sectionIndex) => {
//       for (let questionIndex = 0; questionIndex < section.questions; questionIndex++) {
//         const status = getQuestionStatus(sectionIndex, questionIndex)
//         switch (status) {
//           case "answered":
//             answered++
//             break
//           case "answered-marked":
//             answeredAndMarked++
//             break
//           case "marked":
//             markedForReviewCount++
//             break
//           case "not-visited":
//             notVisited++
//             break
//           default:
//             notAnswered++
//             break
//         }
//       }
//     })

//     return { answered, notAnswered, notVisited, markedForReviewCount, answeredAndMarked }
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
//       </div>
//     )
//   }
//   console.log("Exam Data:", exam, questions)
//   if (!exam || !questions.length) {
//     return (
//       <div className="container py-12 text-center">
//         <h1 className="text-3xl font-bold mb-4">Exam Not Found</h1>
//         <p className="text-muted-foreground mb-6">The exam you're looking for doesn't exist or has been removed.</p>
//         <Button onClick={() => router.push("/exams")}>Back to Exams</Button>
//       </div>
//     )
//   }

//   const currentQuestion = getCurrentQuestion()
//   const currentSection = exam.sections[currentSectionIndex]
//   const stats = getQuestionStats()

//   return (
//     <div className="flex flex-col h-screen bg-background">
//       {/* Header */}
//       <header className="border-b bg-background p-4 sticky top-0 z-10">
//         <div className="flex justify-between items-center">
//           <h1 className="font-bold text-lg truncate max-w-[50%]">{exam.title}</h1>
//           <div className="flex items-center gap-4">
//             <Button variant="outline" size="sm" onClick={toggleFullScreen}>
//               <Maximize className="h-4 w-4 mr-2" />
//               Full Screen
//             </Button>
//             <div className="flex items-center gap-2">
//               <Clock className="h-4 w-4 text-muted-foreground" />
//               <span className={`font-mono text-lg ${timeLeft < 300 ? "text-red-500 font-bold" : ""}`}>
//                 Time Left: {formatTime(timeLeft)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Main Content */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           {/* Section Tabs */}
//           <div className="border-b p-4">
//             <Tabs
//               value={currentSectionIndex.toString()}
//               onValueChange={(value) => {
//                 setCurrentSectionIndex(Number.parseInt(value))
//                 setCurrentQuestionIndex(0)
//               }}
//             >
//               <TabsList className="grid w-full grid-cols-2">
//                 {exam.sections.map((section, index) => (
//                   <TabsTrigger key={index} value={index.toString()} className="flex items-center gap-2">
//                     {section.name}
//                     <Badge variant="outline" className="text-xs">
//                       {
//                         questions.filter((_, qIndex) => {
//                           let sectionStart = 0
//                           for (let i = 0; i < index; i++) {
//                             sectionStart += exam.sections[i].questions
//                           }
//                           return qIndex >= sectionStart && qIndex < sectionStart + section.questions
//                         }).length
//                       }
//                     </Badge>
//                   </TabsTrigger>
//                 ))}
//               </TabsList>
//             </Tabs>
//           </div>

//           {/* Question Content */}
//           <div className="flex-1 overflow-y-auto p-6">
//             <div className="max-w-4xl mx-auto">
//               <div className="flex justify-between items-center mb-6">
//                 <div className="flex items-center gap-4">
//                   <h2 className="text-xl font-semibold">Qus No. {currentQuestionIndex + 1}</h2>
//                   <div className="flex items-center gap-2 text-sm">
//                     <span className="font-medium">Marks</span>
//                     <Badge variant="outline" className="text-green-600">
//                       +{currentQuestion?.marks || 1}
//                     </Badge>
//                     <Badge variant="outline" className="text-red-600">
//                       -{currentQuestion?.negativeMarks || 0.25}
//                     </Badge>
//                     <span className="text-muted-foreground">Time: 00:00:08</span>
//                   </div>
//                 </div>
//                 {autoSaveStatus && <div className="text-sm text-muted-foreground">{autoSaveStatus}</div>}
//               </div>

//               {currentQuestion && (
//                 <Card className="mb-6">
//                   <CardContent className="pt-6">
//                     <div className="space-y-4">
//                       <div className="text-lg leading-relaxed">{currentQuestion.questionText}</div>

//                       {currentQuestion.questionTextHindi && (
//                         <div className="text-lg leading-relaxed text-gray-700 border-t pt-4">
//                           {currentQuestion.questionTextHindi}
//                         </div>
//                       )}

//                       {currentQuestion.questionImage && (
//                         <div className="my-4">
//                           <img
//                             src={currentQuestion.questionImage || "/placeholder.svg"}
//                             alt="Question"
//                             className="max-w-full h-auto rounded-lg border"
//                           />
//                         </div>
//                       )}

//                       {currentQuestion.passage && (
//                         <div className="bg-gray-50 p-4 rounded-lg border">
//                           <h4 className="font-medium mb-2">Passage:</h4>
//                           <p className="text-sm leading-relaxed">{currentQuestion.passage}</p>
//                         </div>
//                       )}

//                       <RadioGroup
//                         value={answers[`${currentSectionIndex}-${currentQuestionIndex}`] || ""}
//                         onValueChange={handleAnswerChange}
//                         className="space-y-3 mt-6"
//                       >
//                         {currentQuestion.options?.map((option, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent"
//                           >
//                             <RadioGroupItem value={option} id={`option-${index}`} />
//                             <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
//                               {option}
//                             </Label>
//                           </div>
//                         ))}
//                       </RadioGroup>
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Navigation Controls */}
//               <div className="flex justify-between items-center">
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={goToPreviousQuestion}
//                     disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
//                   >
//                     Previous
//                   </Button>
//                 </div>

//                 <div className="flex gap-2">
//                   <Button variant="outline" onClick={handleMarkForReview}>
//                     <Flag className="h-4 w-4 mr-2" />
//                     Mark For Review & Next
//                   </Button>
//                   <Button variant="outline" onClick={handleClearResponse}>
//                     Clear Response
//                   </Button>
//                   <Button onClick={goToNextQuestion}>Save & Next</Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Sidebar */}
//         <div className="w-80 border-l bg-background overflow-y-auto">
//           <div className="p-4 space-y-6">
//             {/* User Info */}
//             <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
//               <Avatar>
//                 <AvatarImage src={user?.avatar || "/placeholder.svg"} />
//                 <AvatarFallback>
//                   <User className="h-4 w-4" />
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <p className="font-medium">{user?.name || "Student"}</p>
//                 <p className="text-sm text-muted-foreground">ID: {user?.id || "N/A"}</p>
//               </div>
//             </div>

//             {/* Question Stats */}
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-green-500 rounded"></div>
//                   <span className="text-sm">Answered</span>
//                 </div>
//                 <span className="font-medium">{stats.answered}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-red-500 rounded"></div>
//                   <span className="text-sm">Not Answered</span>
//                 </div>
//                 <span className="font-medium">{stats.notAnswered}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-gray-300 rounded"></div>
//                   <span className="text-sm">Not Visited</span>
//                 </div>
//                 <span className="font-medium">{stats.notVisited}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-purple-500 rounded"></div>
//                   <span className="text-sm">Marked for Review</span>
//                 </div>
//                 <span className="font-medium">{stats.markedForReviewCount}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-orange-500 rounded"></div>
//                   <span className="text-sm">Answered & Marked for Review</span>
//                 </div>
//                 <span className="font-medium">{stats.answeredAndMarked}</span>
//               </div>
//             </div>

//             {/* Current Section */}
//             <div>
//               <h3 className="font-medium mb-3">{currentSection.name}</h3>
//               <div className="grid grid-cols-4 gap-2">
//                 {Array.from({ length: currentSection.questions }, (_, index) => {
//                   const status = getQuestionStatus(currentSectionIndex, index)
//                   return (
//                     <Button
//                       key={index}
//                       variant="outline"
//                       size="sm"
//                       className={`h-10 w-10 p-0 ${getQuestionStatusColor(status)}`}
//                       onClick={() => goToQuestion(currentSectionIndex, index)}
//                     >
//                       {index + 1}
//                     </Button>
//                   )
//                 })}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="space-y-2">
//               <Button variant="outline" className="w-full" onClick={togglePause} disabled={isPaused}>
//                 <Pause className="h-4 w-4 mr-2" />
//                 Pause Test
//               </Button>
//               <Button variant="outline" className="w-full">
//                 <FileText className="h-4 w-4 mr-2" />
//                 Questions
//               </Button>
//               <Button className="w-full" onClick={() => setShowSubmitDialog(true)}>
//                 Submit Section
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Submit Dialog */}
//       <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Submit Exam</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to submit your exam? You have answered {stats.answered} out of {exam.totalQuestions}{" "}
//               questions.
//               {stats.notAnswered > 0 && (
//                 <div className="flex items-center gap-2 mt-2 text-amber-500">
//                   <AlertCircle className="h-4 w-4" />
//                   <span>You have {stats.notAnswered} unanswered questions.</span>
//                 </div>
//               )}
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
//               Continue Exam
//             </Button>
//             <Button onClick={submitExam}>Submit Exam</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Pause Dialog */}
//       <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Exam Paused</DialogTitle>
//             <DialogDescription>Your exam is currently paused. Click resume to continue.</DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button onClick={togglePause}>
//               <Play className="h-4 w-4 mr-2" />
//               Resume Exam
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Label } from "@/components/ui/label"
// import { Progress } from "@/components/ui/progress"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { AlertCircle, ChevronLeft, ChevronRight, Clock, Save } from "lucide-react"

// // Mock questions data
// const mockQuestions = {
//   "math-algebra": [
//     {
//       id: 1,
//       question: "Solve for x: 2x + 5 = 15",
//       options: ["x = 5", "x = 10", "x = 7.5", "x = 6"],
//       correctAnswer: "x = 5",
//     },
//     {
//       id: 2,
//       question: "If f(x) = x² + 3x + 2, what is f(2)?",
//       options: ["8", "10", "12", "14"],
//       correctAnswer: "12",
//     },
//     {
//       id: 3,
//       question: "Simplify: (3x² - 2x + 1) - (x² + 3x - 5)",
//       options: ["2x² - 5x + 6", "4x² - 5x - 4", "2x² - 5x - 4", "4x² + x + 6"],
//       correctAnswer: "2x² - 5x + 6",
//     },
//     {
//       id: 4,
//       question: "Solve the inequality: 3x - 7 > 2",
//       options: ["x > 3", "x < 3", "x > 3/2", "x < 3/2"],
//       correctAnswer: "x > 3",
//     },
//     {
//       id: 5,
//       question: "Factor completely: x² - 9",
//       options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²"],
//       correctAnswer: "(x-3)(x+3)",
//     },
//   ],
//   "physics-mechanics": [
//     {
//       id: 1,
//       question: "What is Newton's First Law of Motion?",
//       options: [
//         "Force equals mass times acceleration",
//         "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force",
//         "For every action, there is an equal and opposite reaction",
//         "Energy cannot be created or destroyed, only transformed",
//       ],
//       correctAnswer:
//         "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force",
//     },
//     {
//       id: 2,
//       question: "What is the SI unit of force?",
//       options: ["Watt", "Joule", "Newton", "Pascal"],
//       correctAnswer: "Newton",
//     },
//     {
//       id: 3,
//       question: "A 2 kg object is accelerating at 5 m/s². What is the net force acting on it?",
//       options: ["2.5 N", "7 N", "10 N", "0.4 N"],
//       correctAnswer: "10 N",
//     },
//     {
//       id: 4,
//       question: "What is the formula for kinetic energy?",
//       options: ["KE = mgh", "KE = 1/2 mv²", "KE = Fd", "KE = P/t"],
//       correctAnswer: "KE = 1/2 mv²",
//     },
//     {
//       id: 5,
//       question:
//         "What happens to the gravitational force between two objects when the distance between them is doubled?",
//       options: ["It doubles", "It halves", "It becomes one-fourth", "It remains the same"],
//       correctAnswer: "It becomes one-fourth",
//     },
//   ],
// }

// // Mock exam data
// const mockExams = {
//   "math-algebra": {
//     id: "math-algebra",
//     title: "Algebra Fundamentals",
//     duration: 60,
//   },
//   "physics-mechanics": {
//     id: "physics-mechanics",
//     title: "Classical Mechanics",
//     duration: 75,
//   },
// }

// export default function TakeExam({ params }) {
//   const router = useRouter()
//   const { examId } = params

//   const exam = mockExams[examId]
//   const questions = mockQuestions[examId] || []

//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
//   const [answers, setAnswers] = useState({})
//   const [timeLeft, setTimeLeft] = useState(exam ? exam.duration * 60 : 0)
//   const [confirmSubmitDialog, setConfirmSubmitDialog] = useState(false)
//   const [confirmExitDialog, setConfirmExitDialog] = useState(false)
//   const [autoSaveStatus, setAutoSaveStatus] = useState("")

//   // Timer countdown
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer)
//           handleSubmitExam()
//           return 0
//         }
//         return prev - 1
//       })
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [])

//   // Auto-save answers every 30 seconds
//   useEffect(() => {
//     const autoSaveTimer = setInterval(() => {
//       // In a real app, this would save to a database or localStorage
//       setAutoSaveStatus("Saving...")

//       setTimeout(() => {
//         setAutoSaveStatus("All changes saved")

//         setTimeout(() => {
//           setAutoSaveStatus("")
//         }, 2000)
//       }, 1000)
//     }, 30000)

//     return () => clearInterval(autoSaveTimer)
//   }, [answers])

//   // Format time remaining
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
//   }

//   // Handle answer selection
//   const handleAnswerChange = (value) => {
//     setAnswers({
//       ...answers,
//       [currentQuestionIndex]: value,
//     })

//     // Show saving indicator
//     setAutoSaveStatus("Saving...")

//     setTimeout(() => {
//       setAutoSaveStatus("All changes saved")

//       setTimeout(() => {
//         setAutoSaveStatus("")
//       }, 2000)
//     }, 1000)
//   }

//   // Navigation functions
//   const goToNextQuestion = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1)
//     }
//   }

//   const goToPreviousQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1)
//     }
//   }

//   const goToQuestion = (index) => {
//     setCurrentQuestionIndex(index)
//   }

//   // Submit exam
//   const handleSubmitExam = () => {
//     // In a real app, this would submit answers to the server
//     // For now, we'll just redirect to a mock results page
//     const resultId = Math.floor(Math.random() * 1000)
//     router.push(`/results/${resultId}`)
//   }

//   // Calculate progress
//   const answeredCount = Object.keys(answers).length
//   const progressPercentage = (answeredCount / questions.length) * 100

//   // Handle if exam not found
//   const examNotFound = !exam || !questions.length

//   return (
//     <div className="flex flex-col h-screen bg-background">
//       {examNotFound ? (
//         <div className="container py-12 text-center">
//           <h1 className="text-3xl font-bold mb-4">Exam Not Found</h1>
//           <p className="text-muted-foreground mb-6">The exam you're looking for doesn't exist or has been removed.</p>
//           <Button onClick={() => router.push("/exams")}>Back to Exams</Button>
//         </div>
//       ) : (
//         <>
//           {/* Exam Header */}
//           <header className="border-b bg-background p-4 sticky top-0 z-10">
//             <div className="container flex justify-between items-center">
//               <h1 className="font-bold truncate max-w-[50%]">{exam.title}</h1>
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <Clock className="h-4 w-4 text-muted-foreground" />
//                   <span className={`font-mono ${timeLeft < 300 ? "text-red-500 font-bold" : ""}`}>
//                     {formatTime(timeLeft)}
//                   </span>
//                 </div>
//                 <Button onClick={() => setConfirmSubmitDialog(true)}>Submit Exam</Button>
//               </div>
//             </div>
//           </header>

//           {/* Main Content */}
//           <div className="flex flex-1 overflow-hidden">
//             {/* Question Navigation Sidebar */}
//             <div className="hidden md:block w-64 border-r overflow-y-auto p-4">
//               <div className="mb-4">
//                 <h2 className="font-medium mb-2">Progress</h2>
//                 <Progress value={progressPercentage} className="h-2" />
//                 <p className="text-sm text-muted-foreground mt-2">
//                   {answeredCount} of {questions.length} answered
//                 </p>
//               </div>

//               <div className="grid grid-cols-5 gap-2">
//                 {questions.map((_, index) => (
//                   <Button
//                     key={index}
//                     variant={currentQuestionIndex === index ? "default" : answers[index] ? "outline" : "secondary"}
//                     className="h-10 w-10 p-0"
//                     onClick={() => goToQuestion(index)}
//                   >
//                     {index + 1}
//                   </Button>
//                 ))}
//               </div>
//             </div>

//             {/* Question Content */}
//             <div className="flex-1 overflow-y-auto p-4">
//               <div className="container max-w-3xl">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-lg font-medium">
//                     Question {currentQuestionIndex + 1} of {questions.length}
//                   </h2>
//                   {autoSaveStatus && (
//                     <div className="flex items-center text-sm text-muted-foreground">
//                       <Save className="h-3 w-3 mr-1" />
//                       {autoSaveStatus}
//                     </div>
//                   )}
//                 </div>

//                 <Card className="mb-6">
//                   <CardContent className="pt-6">
//                     <p className="text-lg mb-6">{questions[currentQuestionIndex].question}</p>
//                     <RadioGroup
//                       value={answers[currentQuestionIndex] || ""}
//                       onValueChange={handleAnswerChange}
//                       className="space-y-3"
//                     >
//                       {questions[currentQuestionIndex].options.map((option, index) => (
//                         <div key={index} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent">
//                           <RadioGroupItem value={option} id={`option-${index}`} />
//                           <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
//                             {option}
//                           </Label>
//                         </div>
//                       ))}
//                     </RadioGroup>
//                   </CardContent>
//                 </Card>

//                 <div className="flex justify-between">
//                   <Button
//                     variant="outline"
//                     onClick={goToPreviousQuestion}
//                     disabled={currentQuestionIndex === 0}
//                     className="gap-1"
//                   >
//                     <ChevronLeft className="h-4 w-4" /> Previous
//                   </Button>
//                   <div className="flex md:hidden gap-2">
//                     <Button variant="outline" onClick={() => setConfirmExitDialog(true)}>
//                       Exit
//                     </Button>
//                     <Button onClick={() => setConfirmSubmitDialog(true)}>Submit</Button>
//                   </div>
//                   <Button
//                     variant="outline"
//                     onClick={goToNextQuestion}
//                     disabled={currentQuestionIndex === questions.length - 1}
//                     className="gap-1"
//                   >
//                     Next <ChevronRight className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Submit Confirmation Dialog */}
//           <Dialog open={confirmSubmitDialog} onOpenChange={setConfirmSubmitDialog}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Submit Exam</DialogTitle>
//                 <DialogDescription>
//                   Are you sure you want to submit your exam? You have answered {answeredCount} out of {questions.length}{" "}
//                   questions.
//                   {answeredCount < questions.length && (
//                     <div className="flex items-center gap-2 mt-2 text-amber-500">
//                       <AlertCircle className="h-4 w-4" />
//                       <span>You have {questions.length - answeredCount} unanswered questions.</span>
//                     </div>
//                   )}
//                 </DialogDescription>
//               </DialogHeader>
//               <DialogFooter>
//                 <Button variant="outline" onClick={() => setConfirmSubmitDialog(false)}>
//                   Continue Exam
//                 </Button>
//                 <Button onClick={handleSubmitExam}>Submit Exam</Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>

//           {/* Exit Confirmation Dialog */}
//           <Dialog open={confirmExitDialog} onOpenChange={setConfirmExitDialog}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Exit Exam</DialogTitle>
//                 <DialogDescription>
//                   Are you sure you want to exit? Your progress will be saved, but the exam timer will continue.
//                 </DialogDescription>
//               </DialogHeader>
//               <DialogFooter>
//                 <Button variant="outline" onClick={() => setConfirmExitDialog(false)}>
//                   Continue Exam
//                 </Button>
//                 <Button variant="destructive" onClick={() => router.push(`/exams/${examId}`)}>
//                   Exit Exam
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </>
//       )}
//     </div>
//   )
// }
