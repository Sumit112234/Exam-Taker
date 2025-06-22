"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, Award, Play, ArrowLeft, AlertCircle, FileText, BarChart3, Target } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function ExamDetails({ params }) {
  const router = useRouter()
  const { user } = useAuth()
  // const { examId } = params
  const { examId } = use(params)
  const [exam, setExam] = useState(null)
  const [mockTests, setMockTests] = useState([])
  const [userAttempts, setUserAttempts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [canAttempt, setCanAttempt] = useState(true)
  
  useEffect(() => {
    if (examId) {
      fetchExamDetails()
      // fetchMockTests()
      fetchUserAttempts()
    }
  }, [examId])

  const fetchExamDetails = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`)
      if (response.ok) {
        const data = await response.json()
        setExam(data)

        // Check if user can attempt this exam
        if (!data.isFree && !user?.subscription?.status) {
          setCanAttempt(false)
        }
      } else {
        router.push("/exams")
      }
    } catch (error) {
      console.error("Error fetching exam details:", error)
      router.push("/exams")
    }
  }

  // const fetchMockTests = async () => {
  //   try {
  //     const response = await fetch(`/api/exams/${examId}/mock-tests`)
  //     if (response.ok) {
  //       const data = await response.json()
  //       setMockTests(data)
  //     }
  //   } catch (error) {
  //     console.error("Error fetching mock tests:", error)
  //   }
  // }

  const fetchUserAttempts = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}/attempts`)
      if (response.ok) {
        const data = await response.json()
        setUserAttempts(data)
      }
    } catch (error) {
      console.error("Error fetching user attempts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startExam = () => {
    if (!canAttempt) {
      router.push("/subscriptions")
      return
    }
    router.push(`/exams/${examId}/start`)
  }

  const getBestScore = () => {
    if (userAttempts.length === 0) return null
    return Math.max(...userAttempts.map((attempt) => attempt.score.percentage))
  }

  const getAverageScore = () => {
    if (userAttempts.length === 0) return null
    const total = userAttempts.reduce((sum, attempt) => sum + attempt.score.percentage, 0)
    return (total / userAttempts.length).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Exam Not Found</h1>
        <p className="text-muted-foreground mb-6">The exam you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/exams")}>Back to Exams</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
            <p className="text-muted-foreground">
              {exam.name} • {exam.totalQuestions} Questions • {exam.totalDuration} Minutes
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Overview */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Exam Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{exam.totalDuration}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{exam.totalQuestions}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{exam.totalMarks}</div>
                    <div className="text-sm text-muted-foreground">Total Marks</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold">{exam.passingMarks}%</div>
                    <div className="text-sm text-muted-foreground">Passing</div>
                  </div>
                </div>

                {exam.description && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{exam.description}</p>
                  </div>
                )}

                {exam.negativeMarking.enabled && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">Negative Marking</span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {exam.negativeMarking.value} marks will be deducted for each incorrect answer.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sections */}
            {exam.sections && exam.sections.length > 0 && (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Exam Sections</CardTitle>
                  <CardDescription>This exam is divided into the following sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exam.sections.map((section, index) => (
                      <div key={section._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{section.name}</h4>
                          {section.description && (
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{section.questions.length} Questions</div>
                          <div className="text-sm text-muted-foreground">{section.duration} mins</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mock Tests */}
            {mockTests.length > 0 && (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Available Mock Tests</CardTitle>
                  <CardDescription>Practice with these mock tests before taking the main exam</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {mockTests.map((mockTest) => (
                      <div key={mockTest._id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{mockTest.title}</h4>
                          <Badge
                            variant={
                              mockTest.type === "full" ? "default" : mockTest.type === "mini" ? "secondary" : "outline"
                            }
                          >
                            {mockTest.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          {mockTest.totalQuestions} questions • {mockTest.duration} mins
                        </div>
                        <Link href={`/mock-tests/${mockTest._id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Play className="mr-2 h-4 w-4" />
                            Start Mock Test
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: exam.instructions }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start Exam Card */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
                {!canAttempt && (
                  <CardDescription className="text-orange-600">
                    This exam requires a premium subscription
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button onClick={startExam} className="w-full mb-4" disabled={!canAttempt}>
                  <Play className="mr-2 h-4 w-4" />
                  {canAttempt ? "Start Exam" : "Upgrade to Premium"}
                </Button>

                {!exam.isFree && (
                  <div className="text-center">
                    <Badge variant="secondary">Premium Content</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Performance */}
            {userAttempts.length > 0 && (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Your Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Best Score</span>
                        <span className="font-medium">{getBestScore()}%</span>
                      </div>
                      <Progress value={getBestScore()} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Score</span>
                        <span className="font-medium">{getAverageScore()}%</span>
                      </div>
                      <Progress value={Number.parseFloat(getAverageScore())} className="h-2" />
                    </div>

                    <Separator />

                    <div className="text-center">
                      <div className="text-2xl font-bold">{userAttempts.length}</div>
                      <div className="text-sm text-muted-foreground">Attempts Made</div>
                    </div>

                    <Link href={`/results?examId=${examId}`}>
                      <Button variant="outline" className="w-full">
                        View All Results
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exam Stats */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Exam Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Attempts</span>
                    <span className="font-medium">{exam.attempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Since</span>
                    <span className="font-medium">{new Date(exam.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Exam Type</span>
                    <Badge variant="outline">{exam.name}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
