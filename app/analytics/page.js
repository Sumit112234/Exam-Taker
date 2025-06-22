"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, Target, Clock, Award, BookOpen, Activity } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function AdvancedAnalytics() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalExams: 0,
      averageScore: 0,
      totalTime: 0,
      rank: 0,
      percentile: 0,
    },
    performance: {
      monthlyScores: [],
      subjectWise: [],
      difficultyWise: [],
      timeAnalysis: [],
    },
    comparison: {
      userRank: 0,
      totalUsers: 0,
      topPerformers: [],
      categoryRanking: [],
    },
    insights: {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      trends: [],
    },
  })
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange, selectedCategory])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/analytics?range=${timeRange}&category=${selectedCategory}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive performance insights and comparisons</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ssc">SSC</SelectItem>
              <SelectItem value="banking">Banking</SelectItem>
              <SelectItem value="railway">Railway</SelectItem>
              <SelectItem value="upsc">UPSC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Rank</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{analyticsData.overview.rank}</div>
            <p className="text-xs text-muted-foreground">{analyticsData.overview.percentile}th percentile</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalExams}</div>
            <p className="text-xs text-muted-foreground">Completed successfully</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analyticsData.overview.totalTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">Total time spent</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Your score progression over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Monthly performance chart</p>
                    <div className="flex justify-center gap-4 text-sm">
                      {analyticsData.performance.monthlyScores.slice(0, 6).map((month, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xs text-muted-foreground">{month.month}</div>
                          <div className="font-medium">{month.score}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
                <CardDescription>Your performance across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.performance.subjectWise.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{subject.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{subject.score}%</span>
                          {subject.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                      <Progress value={subject.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Difficulty Analysis</CardTitle>
              <CardDescription>Your performance across different difficulty levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {analyticsData.performance.difficultyWise.map((level, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{level.difficulty}</h3>
                    <div className="text-2xl font-bold mb-2">{level.score}%</div>
                    <Progress value={level.score} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{level.attempts} attempts</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Your Ranking</CardTitle>
                <CardDescription>How you compare with other users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-4xl font-bold text-primary">#{analyticsData.comparison.userRank}</div>
                    <p className="text-muted-foreground">out of {analyticsData.comparison.totalUsers} users</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Position</span>
                      <span>{analyticsData.overview.percentile}th percentile</span>
                    </div>
                    <Progress value={analyticsData.overview.percentile} className="h-2" />
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {analyticsData.overview.percentile >= 90
                      ? "Top Performer"
                      : analyticsData.overview.percentile >= 75
                        ? "Above Average"
                        : analyticsData.overview.percentile >= 50
                          ? "Average"
                          : "Below Average"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Leading users in your category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.comparison.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-xs text-muted-foreground">{performer.exams} exams</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{performer.score}%</p>
                        <p className="text-xs text-muted-foreground">avg score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Category-wise Ranking</CardTitle>
              <CardDescription>Your position in different exam categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {analyticsData.comparison.categoryRanking.map((category, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{category.name}</h3>
                    <div className="text-xl font-bold mb-1">#{category.rank}</div>
                    <p className="text-xs text-muted-foreground mb-2">{category.percentile}th percentile</p>
                    <Badge variant={category.rank <= 10 ? "default" : "outline"} className="text-xs">
                      {category.rank <= 10 ? "Top 10" : `Rank ${category.rank}`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Your Strengths</CardTitle>
                <CardDescription>Areas where you excel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.insights.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
                    >
                      <Target className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">{strength.area}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{strength.score}% average</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
                <CardDescription>Focus areas to boost your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.insights.weaknesses.map((weakness, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg"
                    >
                      <Activity className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800 dark:text-orange-200">{weakness.area}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">{weakness.score}% average</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{recommendation.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{recommendation.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {recommendation.priority} Priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {recommendation.impact} Impact
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

        <TabsContent value="trends" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Your learning journey over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Performance trends visualization</p>
                  <div className="grid grid-cols-3 gap-8 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">+15%</div>
                      <div className="text-xs text-muted-foreground">Score Improvement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">-8min</div>
                      <div className="text-xs text-muted-foreground">Avg Time Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">+23</div>
                      <div className="text-xs text-muted-foreground">Rank Improvement</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Consistency Score</CardTitle>
                <CardDescription>How consistent your performance is</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">8.5/10</div>
                  <Progress value={85} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">Very consistent performance</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Learning Velocity</CardTitle>
                <CardDescription>Rate of improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-green-600">+2.3%</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Per week</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Above average improvement</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Study Efficiency</CardTitle>
                <CardDescription>Score improvement per hour studied</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">1.8%</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">Per hour</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Highly efficient learning</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
