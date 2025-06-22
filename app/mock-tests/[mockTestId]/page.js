"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Clock, BookOpen, Award, Play, ArrowLeft, AlertCircle, FileText, BarChart3, Layers } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function MockTestDetails({ params }) {
  const router = useRouter()
  const { user } = useAuth()
  const { mockTestId } = params
  const [mockTest, setMockTest] = useState(null)
  const [userAttempts, setUserAttempts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [canAttempt, setCanAttempt] = useState(true)

  useEffect(() => {
    if (mockTestId) {
      fetchMockTestDetails()
      fetchUserAttempts()
    }
  }, [mockTestId])

  const fetchMockTestDetails = async () => {
    try {
      const response = await fetch(`/api/mock-tests/${mockTestId}`)
      if (response.ok) {
        const data = await response.json()
        setMockTest(data)

        // Check if user can attempt this mock test
        if (!data.isFree && !user?.subscription?.status) {
          setCanAttempt(false)
        }
      } else {
        router.push("/exams")
      }
    } catch (error) {
      console.error("Error fetching mock test details:", error)
      router.push("/exams")
    }
  }

  const fetchUserAttempts = async () => {
    try {
      const response = await fetch(`/api/mock-tests/${mockTestId}/attempts`)
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

  const startMockTest = () => {
    if (!canAttempt) {
      router.push("/subscriptions")
      return
    }
    router.push(`/mock-tests/${mockTestId}/start`)
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

  const getTypeColor = (type) => {
    switch (type) {
      case "full":
        return "bg-blue-500"
      case "mini":
        return "bg-green-500"
      case "sectional":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-50 border-green-200"
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "Hard":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!mockTest) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Mock Test Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The mock test you're looking for doesn't exist or has been removed.
        </p>
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
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{mockTest.title}</h1>
              <div className="flex gap-2">
                <Badge className={getTypeColor(mockTest.type)}>
                  {mockTest.type === "full" ? "Full Test" : mockTest.type === "mini" ? "Mini Test" : "Sectional Test"}
                </Badge>
                <Badge variant="outline" className={getDifficultyColor(mockTest.difficulty)}>
                  {mockTest.difficulty}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">
              {mockTest.examId?.title} • {mockTest.totalQuestions} Questions • {mockTest.duration} Minutes
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mock Test Overview */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Test Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{mockTest.duration}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{mockTest.totalQuestions}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{mockTest.totalMarks}</div>
                    <div className="text-sm text-muted-foreground">Total Marks</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <Layers className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold">{mockTest.sections?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Sections</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            {mockTest.sections && mockTest.sections.length > 0 && (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Test Sections</CardTitle>
                  <CardDescription>This mock test includes the following sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTest.sections.map((section, index) => (
                      <div key={section._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{section.name}</h4>
                          {section.description && (
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                          )}
                          {section.negativeMarking?.enabled && (
                            <div className="flex items-center gap-1 mt-2">
                              <AlertCircle className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-yellow-600">
                                Negative marking: -{section.negativeMarking.value} marks
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{section.questions?.length || 0} Questions</div>
                          <div className="text-sm text-muted-foreground">{section.duration} mins</div>
                          <div className="text-sm text-muted-foreground">{section.totalMarks} marks</div>
                        </div>
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
                  {mockTest.instructions ? (
                    <div dangerouslySetInnerHTML={{ __html: mockTest.instructions }} />
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p>• Read all questions carefully before answering.</p>
                      <p>• Each question carries equal marks unless specified otherwise.</p>
                      <p>• There is no negative marking unless mentioned in specific sections.</p>
                      <p>• You can review and change your answers before submitting.</p>
                      <p>• Make sure you have a stable internet connection.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start Test Card */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
                {!canAttempt && (
                  <CardDescription className="text-orange-600">
                    This mock test requires a premium subscription
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button onClick={startMockTest} className="w-full mb-4" disabled={!canAttempt}>
                  <Play className="mr-2 h-4 w-4" />
                  {canAttempt ? "Start Mock Test" : "Upgrade to Premium"}
                </Button>

                {!mockTest.isFree && (
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

                    <Link href={`/results?mockTestId=${mockTestId}`}>
                      <Button variant="outline" className="w-full">
                        View All Results
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Stats */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Test Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Attempts</span>
                    <span className="font-medium">{mockTest.attempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Test Type</span>
                    <Badge variant="outline">{mockTest.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Difficulty</span>
                    <Badge variant="outline" className={getDifficultyColor(mockTest.difficulty)}>
                      {mockTest.difficulty}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Created</span>
                    <span className="font-medium">{new Date(mockTest.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Exam */}
            {mockTest.examId && (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Related Exam</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium">{mockTest.examId.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      This mock test is part of the {mockTest.examId.title} exam series.
                    </p>
                    <Link href={`/exams/${mockTest.examId._id}`}>
                      <Button variant="outline" className="w-full">
                        View Full Exam
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
