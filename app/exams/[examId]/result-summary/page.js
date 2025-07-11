"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Users,
  Medal,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function ResultSummary({ params, searchParams }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { examId } = params
  const resultId = searchParams.get("resultId")

  const [result, setResult] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (resultId) {
      fetchResultData()
      fetchLeaderboard()
    }
  }, [resultId])

  const fetchResultData = async () => {
    try {
      const response = await fetch(`/api/results/${resultId}`)
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch result data",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching result:", error)
      toast({
        title: "Error",
        description: "Failed to fetch result data",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}/leaderboard`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
        setUserRank(data.userRank || null)
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <Users className="h-5 w-5 text-muted-foreground" />
    }
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
        <p className="text-muted-foreground mb-6">The result you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
      <div className="container py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {result.isPassed ? (
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {result.isPassed ? "Congratulations!" : "Better Luck Next Time!"}
          </h1>
          <p className="text-muted-foreground">
            You have {result.isPassed ? "passed" : "not passed"} the {result.exam.title}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Overview */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}>{result.score}%</div>
                    <Badge variant={getScoreBadgeVariant(result.score)} className="mb-4">
                      {result.isPassed ? "Passed" : "Failed"}
                    </Badge>
                    <div className="space-y-2">
                      <Progress value={result.score} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {result.obtainedMarks.toFixed(1)} out of {result.totalMarks} marks
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Correct Answers</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-green-600">{result.correctAnswers}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Wrong Answers</span>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-bold text-red-600">{result.wrongAnswers}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Unattempted</span>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        <span className="font-bold text-gray-600">{result.unattempted}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Time Taken</span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-bold">{result.timeTaken}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section-wise Performance */}
            {result.sections && result.sections.length > 0 && (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Section-wise Performance</CardTitle>
                  <CardDescription>Your performance across different sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.sections.map((section, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{section.name}</h4>
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
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Link href={`/results/${result._id}`}>
                <Button size="lg" className="min-w-32">
                  <Eye className="mr-2 h-4 w-4" />
                  View Result
                </Button>
              </Link>
              <Link href={`/results/${result._id}?tab=solutions`}>
                <Button variant="outline" size="lg" className="min-w-32">
                  <FileText className="mr-2 h-4 w-4" />
                  View Solutions
                </Button>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rank Card */}
            {userRank && (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Your Rank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">#{userRank.rank}</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      out of {userRank.totalParticipants} participants
                    </p>
                    <div className="text-sm">
                      <p>
                        Percentile: <span className="font-bold">{userRank.percentile}%</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
                <CardDescription>Top performers in this exam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div key={entry.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8">{getRankIcon(index + 1)}</div>
                        <div>
                          <p className="font-medium text-sm">
                            {entry.userId === user?.userId ? "You" : entry.userName || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.timeTaken} • {new Date(entry.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getScoreColor(entry.score)}`}>{entry.score}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/exams">
                    <Button variant="outline" className="w-full">
                      Take Another Exam
                    </Button>
                  </Link>
                  <Link href={`/exams/${examId}`}>
                    <Button variant="outline" className="w-full">
                      Retake This Exam
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button variant="outline" className="w-full">
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
