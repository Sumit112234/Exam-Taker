"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Award, BarChart3, ArrowRight, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalExams: 0,
      averageScore: 0,
      studyTime: 0,
      improvement: 0,
    },
    recentExams: [],
    recommendedExams: [],
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Here&apos;s an overview of your exam progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Exams Taken</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.examsTaken || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.stats.improvement > 0 ? "+" : ""}
                  {dashboardData.stats.improvement}% from last week
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.averageScore || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Improving steadily
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.studyTime}h</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{user.subscription?.status || "Inactive"}</div>
                <p className="text-xs text-muted-foreground">{user.subscription?.plan || "No active plan"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 card-hover">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your progress over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Performance chart will be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-1">Take more exams to see your progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 card-hover">
              <CardHeader>
                <CardTitle>Recommended Exams</CardTitle>
                <CardDescription>Based on your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Mathematics - Algebra",
                      difficulty: "Intermediate",
                      id: "math-algebra",
                    },
                    {
                      title: "Physics - Mechanics",
                      difficulty: "Beginner",
                      id: "physics-mechanics",
                    },
                    {
                      title: "Chemistry - Organic",
                      difficulty: "Advanced",
                      id: "chemistry-organic",
                    },
                  ].map((exam, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{exam.title}</p>
                        <p className="text-xs text-muted-foreground">{exam.difficulty}</p>
                      </div>
                      <Link href={`/exams/${exam.id}`}>
                        <Button variant="outline" size="sm">
                          Start
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/exams">
                    <Button variant="outline" className="w-full">
                      View All Exams
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">Take an Exam</CardTitle>
                <CardDescription>Start practicing with our exam collection</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/exams">
                  <Button className="w-full">
                    Browse Exams
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">View Results</CardTitle>
                <CardDescription>Check your past exam performances</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/results">
                  <Button variant="outline" className="w-full">
                    View Results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">Upgrade Plan</CardTitle>
                <CardDescription>Unlock premium features and unlimited exams</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/subscriptions">
                  <Button variant="outline" className="w-full">
                    View Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Exam Activity</CardTitle>
              <CardDescription>Your exam history from the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentExams.length > 0 ? (
                  dashboardData.recentExams.map((exam, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-sm text-muted-foreground">{exam.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{exam.score}%</p>
                          <p className="text-sm text-green-500">{exam.status}</p>
                        </div>
                        <Link href={`/results/${exam.resultId}`}>
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No recent exams</h3>
                    <p className="text-muted-foreground mb-4">Start taking exams to see your activity here</p>
                    <Link href="/exams">
                      <Button>Take Your First Exam</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Your performance across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { subject: "Mathematics", score: 85, progress: 85 },
                  { subject: "Physics", score: 72, progress: 72 },
                  { subject: "Chemistry", score: 68, progress: 68 },
                  { subject: "Biology", score: 91, progress: 91 },
                ].map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{subject.subject}</h3>
                      <span className="font-bold text-lg">{subject.score}%</span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Study Recommendations</CardTitle>
              <CardDescription>Areas to focus on for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Chemistry - Organic Compounds</h4>
                    <p className="text-sm text-muted-foreground">
                      Score: 68% - Consider reviewing this topic to improve your understanding.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Physics - Electromagnetism</h4>
                    <p className="text-sm text-muted-foreground">
                      Score: 72% - Practice more problems to strengthen your concepts.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
