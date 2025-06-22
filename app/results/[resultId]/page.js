"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, BarChart3, BookOpen, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ResultsPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  // const { resultId } = params
  const { resultId } = use(params)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResultData()
  }, [resultId])

  const fetchResultData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/results/${resultId}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to fetch result")
      }

      const data = await response.json()
      console.log("Fetched result data:", data)
      setResult(data)
    } catch (error) {
      console.error("Error fetching result:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load result data",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Result Not Found</h1>
        <p className="text-muted-foreground mb-6">The result you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="container py-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
          <p className="text-muted-foreground">
            {result.exam.title} - {new Date(result.submittedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
                <Badge variant={getScoreBadgeVariant(result.score)} className="mt-2">
                  {result.isPassed ? "Passed" : "Failed"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{result.correctAnswers}</div>
                <p className="text-xs text-muted-foreground">out of {result.totalQuestions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wrong Answers</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{result.wrongAnswers}</div>
                <p className="text-xs text-muted-foreground">incorrect responses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.timeTaken}</div>
                <p className="text-xs text-muted-foreground">minutes</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your score breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-500">Correct ({result.correctAnswers})</span>
                  <span className="text-sm">{((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(result.correctAnswers / result.totalQuestions) * 100} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-500">Wrong ({result.wrongAnswers})</span>
                  <span className="text-sm">{((result.wrongAnswers / result.totalQuestions) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(result.wrongAnswers / result.totalQuestions) * 100} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Unattempted ({result.unattempted})</span>
                  <span className="text-sm">{((result.unattempted / result.totalQuestions) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(result.unattempted / result.totalQuestions) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Marks Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Marks Summary</CardTitle>
              <CardDescription>Your marks breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Marks</span>
                  <span>{result.totalMarks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Obtained Marks</span>
                  <span className={getScoreColor(result.score)}>{result.obtainedMarks.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Percentage</span>
                  <span className={getScoreColor(result.score)}>{result.score}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Result</span>
                  <Badge variant={result.isPassed ? "default" : "destructive"}>
                    {result.isPassed ? "Passed" : "Failed"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/exams">
              <Button variant="outline">Take Another Exam</Button>
            </Link>
            <Button onClick={() => setSelectedTab("solutions")}>
              View Solutions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section-wise Analysis</CardTitle>
              <CardDescription>Your performance across different sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.sections &&
                  result.sections.map((section, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{section.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(section.score)}`}>{section.score}%</span>
                          <span className="text-sm text-muted-foreground">
                            ({section.correct}/{section.total})
                          </span>
                        </div>
                      </div>
                      <Progress value={section.score} className="h-2" />
                    </div>
                  ))}

                {(!result.sections || result.sections.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">No section data available</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Areas to focus on for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.sections &&
                  result.sections
                    .filter((section) => section.score < 80)
                    .map((section, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="font-medium">{section.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Score: {section.score}% - Consider reviewing this section to improve your understanding.
                          </p>
                        </div>
                      </div>
                    ))}

                {result.sections &&
                  result.sections.length > 0 &&
                  result.sections.every((section) => section.score >= 80) && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-medium text-green-500">Excellent Performance!</h3>
                      <p className="text-muted-foreground">
                        You've scored well in all sections. Keep up the great work!
                      </p>
                    </div>
                  )}

                {(!result.sections || result.sections.length === 0) && (
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">Overall Performance</h4>
                      <p className="text-sm text-muted-foreground">
                        Score: {result.score}% -{" "}
                        {result.score < 60
                          ? "You need to improve your understanding of the subject matter."
                          : result.score < 80
                            ? "You have a good understanding but there's room for improvement."
                            : "Excellent performance! Keep up the good work."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solutions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Solutions</CardTitle>
              <CardDescription>Review your answers and explanations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.answers.map((answer, index) => (
                  <div key={answer.questionId} className="border rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0">
                        {answer.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">Question {index + 1}</h3>
                        <p className="text-muted-foreground mb-4">{answer.question}</p>

                        {answer.questionHindi && (
                          <p className="text-muted-foreground mb-4 italic">{answer.questionHindi}</p>
                        )}

                        {answer.questionImage && (
                          <div className="mb-4">
                            <img
                              src={answer.questionImage || "/placeholder.svg"}
                              alt="Question"
                              className="max-w-full h-auto rounded-lg border"
                            />
                          </div>
                        )}

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium mb-1">Your Answer:</p>
                            <p
                              className={`text-sm p-2 rounded ${
                                answer.userAnswer
                                  ? answer.isCorrect
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-gray-50 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {answer.userAnswer || "Not answered"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Correct Answer:</p>
                            <p className="text-sm p-2 rounded bg-green-50 text-green-700 border border-green-200">
                              {answer.correctAnswer}
                            </p>
                          </div>
                        </div>

                        {answer.explanation && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Explanation:</p>
                            <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
                              {answer.explanation}
                            </p>

                            {answer.explanationHindi && (
                              <p className="text-sm text-muted-foreground bg-blue-50 p-3 mt-2 rounded border border-blue-200 italic">
                                {answer.explanationHindi}
                              </p>
                            )}

                            {answer.explanationImage && (
                              <div className="mt-2">
                                <img
                                  src={answer.explanationImage || "/placeholder.svg"}
                                  alt="Explanation"
                                  className="max-w-full h-auto rounded-lg border"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {answer.subject && (
                            <Badge variant="outline" className="text-xs">
                              Subject: {answer.subject}
                            </Badge>
                          )}
                          {answer.topic && (
                            <Badge variant="outline" className="text-xs">
                              Topic: {answer.topic}
                            </Badge>
                          )}
                          {answer.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              {answer.difficulty}
                            </Badge>
                          )}
                          <Badge variant="outline" className={answer.marks > 0 ? "text-green-600" : "text-red-600"}>
                            {answer.marks > 0 ? `+${answer.marks}` : answer.marks} marks
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
