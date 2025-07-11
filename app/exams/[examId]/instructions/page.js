"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, BookOpen, Award, AlertCircle, CheckCircle, FileText, Target, ArrowRight, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

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
    if (examId) {
      fetchExamDetails()
    }
  }, [examId])

  const fetchExamDetails = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`)
      if (response.ok) {
        const data = await response.json()
        setExam(data)

        // Check if user can attempt this exam
        console.log(user, data, examId,data.visibility.isFree )
        if (!data.visibility.isFree && !user?.subscription?.status) {
          setCanAttempt(false)
        }
      } else {
        router.push("/exams")
      }
    } catch (error) {
      console.error("Error fetching exam details:", error)
      router.push("/exams")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartExam = () => {
    if (!canAttempt) {
      router.push("/subscriptions")
      return
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive",
      })
      return
    }

    router.push(`/exams/${examId}/start`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="container py-12 text-center ">
        <h1 className="text-3xl font-bold mb-4">Exam Not Found</h1>
        <p className="text-muted-foreground mb-6">The exam you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/exams")}>Back to Exams</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exam Instructions</h1>
            <p className="text-muted-foreground">{exam.title}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Instructions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Overview */}
            <Card>
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
              </CardContent>
            </Card>

            {/* General Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>General Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Time Management</p>
                      <p className="text-sm text-muted-foreground">
                        You have {exam.totalDuration} minutes to complete this exam. The timer will start as soon as you
                        begin.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Navigation</p>
                      <p className="text-sm text-muted-foreground">
                        You can navigate between questions using the question palette or navigation buttons.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Saving Answers</p>
                      <p className="text-sm text-muted-foreground">
                        Your answers are automatically saved. You can also mark questions for review.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Submission</p>
                      <p className="text-sm text-muted-foreground">
                        The exam will auto-submit when time expires. You can also submit manually at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Negative Marking */}
            {exam.negativeMarking?.enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-5 w-5" />
                    Negative Marking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This exam has negative marking. {exam.negativeMarking.value} marks will be deducted for each
                      incorrect answer. Unanswered questions will not affect your score.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Sections */}
            {exam.sections && exam.sections.length > 0 && (
              <Card>
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

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Terms and Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>By proceeding with this exam, you agree to the following terms:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>You will not use any unauthorized materials or assistance during the exam.</li>
                      <li>You will not share exam content with others or discuss questions during the exam.</li>
                      <li>You understand that any form of cheating or misconduct will result in disqualification.</li>
                      <li>You acknowledge that the exam results are final and binding.</li>
                      <li>You consent to the collection and processing of your exam data for evaluation purposes.</li>
                      <li>You will not attempt to compromise the integrity of the examination system.</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I have read and agree to the terms and conditions
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start Exam Card */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
                {!canAttempt && (
                  <CardDescription className="text-orange-600">
                    This exam requires a premium subscription
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleStartExam}
                  className="w-full mb-4"
                  disabled={!canAttempt || !agreedToTerms}
                  size="lg"
                >
                  {canAttempt ? (
                    <>
                      Start Exam <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Upgrade to Premium"
                  )}
                </Button>

                {!exam.isFree && (
                  <div className="text-center">
                    <Badge variant="secondary">Premium Content</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exam Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Exam Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Attempts</span>
                    <span className="font-medium">{exam.attempts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Score</span>
                    <span className="font-medium">{exam.averageScore || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pass Rate</span>
                    <span className="font-medium">{exam.passRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Exam Type</span>
                    <Badge variant="outline">{exam.examType?.name || "General"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Read each question carefully before selecting an answer.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use the mark for review feature for questions you're unsure about.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Keep an eye on the timer and manage your time effectively.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Review your answers before final submission.</p>
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
