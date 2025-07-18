"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  Calendar,
  Clock,
  Search,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [results, setResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
    passedExams: 0,
    recentTrend: 0,
  })

  useEffect(() => {
    fetchResults()
  }, [])

  useEffect(() => {
    filterAndSortResults()
  }, [results, searchTerm, filterCategory, filterStatus, sortBy])

  const fetchResults = async () => {
    try {
      setIsLoading(true)
      const examId = searchParams.get("examId")
      const url = examId ? `/api/results?examId=${examId}` : "/api/results"

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setStats(data.stats || stats)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch results",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching results:", error)
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortResults = () => {
    let filtered = [...results]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.exam.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((result) => result.exam.category === filterCategory)
    }

    // Apply status filter
    if (filterStatus !== "all") {
      if (filterStatus === "passed") {
        filtered = filtered.filter((result) => result.isPassed)
      } else if (filterStatus === "failed") {
        filtered = filtered.filter((result) => !result.isPassed)
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.submittedAt) - new Date(a.submittedAt)
        case "oldest":
          return new Date(a.submittedAt) - new Date(b.submittedAt)
        case "highest":
          return b.score - a.score
        case "lowest":
          return a.score - b.score
        case "title":
          return a.exam.title.localeCompare(b.exam.title)
        default:
          return 0
      }
    })

    setFilteredResults(filtered)
  }

  const handleRetakeExam = (examId) => {
    router.push(`/exams/${examId}`)
  }

  const exportResults = async () => {
    try {
      const response = await fetch("/api/results/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `exam-results-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "Results exported successfully!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export results",
        variant: "destructive",
      })
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

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-10 py-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="outline" className="ml-4" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 " />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
          <p className="text-muted-foreground">View and analyze your exam performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchResults}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
            <p className="text-xs text-muted-foreground">Completed exams</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(stats.recentTrend)}
              <span className="ml-1">
                {stats.recentTrend > 0 ? "+" : ""}
                {stats.recentTrend}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.bestScore)}`}>{stats.bestScore}%</div>
            <p className="text-xs text-muted-foreground">Personal best</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalExams > 0 ? Math.round((stats.passedExams / stats.totalExams) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.passedExams} of {stats.totalExams} passed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Filters and Search */}
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ssc">SSC</SelectItem>
                <SelectItem value="banking">Banking</SelectItem>
                <SelectItem value="railway">Railway</SelectItem>
                <SelectItem value="upsc">UPSC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest Score</SelectItem>
                <SelectItem value="lowest">Lowest Score</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {filteredResults.length > 0 ? (
            <div className="grid gap-4">
              {filteredResults.map((result) => (
                <Card key={result._id} className="card-hover">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {result.exam.title}
                          <Badge variant={result.isPassed ? "default" : "destructive"}>
                            {result.isPassed ? "Passed" : "Failed"}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {result.timeTaken} minutes
                          </span>
                          <Badge variant="outline">{result.exam.category}</Badge>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/results/${result._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => handleRetakeExam(result.examId)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retake
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Score</p>
                        <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Correct Answers</p>
                        <div className="text-2xl font-bold text-green-600">{result.correctAnswers}</div>
                        <p className="text-xs text-muted-foreground">of {result.totalQuestions}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Marks Obtained</p>
                        <div className="text-2xl font-bold">{result.obtainedMarks.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">of {result.totalMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Accuracy</p>
                        <div className="space-y-1">
                          <Progress value={(result.correctAnswers / result.totalQuestions) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterCategory !== "all"
                    ? "No results match your current filters."
                    : "You haven't taken any exams yet."}
                </p>
                {!searchTerm && filterCategory === "all" && (
                  <Link href="/exams">
                    <Button>Take Your First Exam</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="passed" className="space-y-4">
          <div className="grid gap-4">
            {filteredResults
              .filter((result) => result.isPassed)
              .map((result) => (
                <Card key={result._id} className="card-hover border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {result.exam.title}
                          <Badge variant="default" className="bg-green-600">
                            Passed
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {result.timeTaken} minutes
                          </span>
                        </CardDescription>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <div className="grid gap-4">
            {filteredResults
              .filter((result) => !result.isPassed)
              .map((result) => (
                <Card key={result._id} className="card-hover border-red-200 bg-red-50 dark:bg-red-950/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {result.exam.title}
                          <Badge variant="destructive">Failed</Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {result.timeTaken} minutes
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetakeExam(result.examId)}
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retake
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Your score progression over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Performance trend chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Your performance across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["SSC", "Banking", "Railway", "UPSC"].map((category) => {
                    const categoryResults = results.filter((r) => r.exam.category === category)
                    const avgScore =
                      categoryResults.length > 0
                        ? categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length
                        : 0

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category}</span>
                          <span className={`text-sm font-bold ${getScoreColor(avgScore)}`}>
                            {Math.round(avgScore)}%
                          </span>
                        </div>
                        <Progress value={avgScore} className="h-2" />
                        <p className="text-xs text-muted-foreground">{categoryResults.length} exams taken</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>Comprehensive analysis of your exam performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-2">{Math.round(stats.totalTime / 60)}h</div>
                  <p className="text-sm text-muted-foreground">Total Study Time</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-2">
                    {stats.totalExams > 0 ? Math.round(stats.totalTime / stats.totalExams) : 0}m
                  </div>
                  <p className="text-sm text-muted-foreground">Average Time per Exam</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-2">
                    {results.length > 0
                      ? Math.round(results.reduce((sum, r) => sum + r.correctAnswers, 0) / results.length)
                      : 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Correct Answers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
