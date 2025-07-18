"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Users,
  BarChart3,
  FileText,
  Upload,
  Download,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function TestsManagement() {
  const [tests, setTests] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredTests, setFilteredTests] = useState([])
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    status: "all",
    difficulty: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    type: "mock",
    category: "",
    subject: "",
    chapter: "",
    difficulty: "Medium",
    duration: 60,
    totalQuestions: 10,
    totalMarks: 10,
    passingMarks: 40,
    negativeMarking: {
      enabled: false,
      value: 0.25,
    },
    instructions: "Read all questions carefully before answering.",
    tags: [],
    isPublished: false,
    isFree: false,
    maxAttempts: 1,
    showResults: true,
    showSolutions: true,
    shuffleQuestions: false,
    allowReview: true,
  })
  const [bulkUploadData, setBulkUploadData] = useState({
    file: null,
    category: "",
    type: "mock",
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterTests()
  }, [tests, filters, searchQuery])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch categories
      const categoriesResponse = await fetch("/api/admin/categories")
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

      // Fetch tests
      const testsResponse = await fetch("/api/admin/tests")
      if (testsResponse.ok) {
        const testsData = await testsResponse.json()
        setTests(testsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTests = () => {
    let filtered = tests

    if (searchQuery) {
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((test) => test.type === filters.type)
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((test) => test.category._id === filters.category)
    }

    if (filters.status !== "all") {
      if (filters.status === "published") {
        filtered = filtered.filter((test) => test.isPublished)
      } else if (filters.status === "draft") {
        filtered = filtered.filter((test) => !test.isPublished)
      }
    }

    if (filters.difficulty !== "all") {
      filtered = filtered.filter((test) => test.difficulty === filters.difficulty)
    }

    setFilteredTests(filtered)
  }

  const handleCreateTest = async () => {
    try {
      const response = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTest),
      })

      if (response.ok) {
        const createdTest = await response.json()
        setTests([createdTest, ...tests])
        setIsCreateDialogOpen(false)
        resetNewTest()
      }
    } catch (error) {
      console.error("Error creating test:", error)
    }
  }

  const handleTogglePublish = async (testId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })

      if (response.ok) {
        setTests(tests.map((test) => (test._id === testId ? { ...test, isPublished: !currentStatus } : test)))
      }
    } catch (error) {
      console.error("Error updating test:", error)
    }
  }

  const handleDeleteTest = async (testId) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        const response = await fetch(`/api/admin/tests/${testId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setTests(tests.filter((test) => test._id !== testId))
        }
      } catch (error) {
        console.error("Error deleting test:", error)
      }
    }
  }

  const handleBulkUpload = async () => {
    try {
      const formData = new FormData()
      formData.append("file", bulkUploadData.file)
      formData.append("category", bulkUploadData.category)
      formData.append("type", bulkUploadData.type)

      const response = await fetch("/api/admin/tests/bulk-upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        fetchData() // Refresh tests
        setIsBulkUploadDialogOpen(false)
        setBulkUploadData({ file: null, category: "", type: "mock" })
      }
    } catch (error) {
      console.error("Error uploading tests:", error)
    }
  }

  const resetNewTest = () => {
    setNewTest({
      title: "",
      description: "",
      type: "mock",
      category: "",
      subject: "",
      chapter: "",
      difficulty: "Medium",
      duration: 60,
      totalQuestions: 10,
      totalMarks: 10,
      passingMarks: 40,
      negativeMarking: {
        enabled: false,
        value: 0.25,
      },
      instructions: "Read all questions carefully before answering.",
      tags: [],
      isPublished: false,
      isFree: false,
      maxAttempts: 1,
      showResults: true,
      showSolutions: true,
      shuffleQuestions: false,
      allowReview: true,
    })
  }

  const downloadTemplate = () => {
    const template = [
      {
        title: "Sample Test",
        description: "This is a sample test",
        type: "mock",
        subject: "Mathematics",
        chapter: "Algebra",
        difficulty: "Medium",
        duration: 60,
        totalQuestions: 10,
        totalMarks: 10,
        instructions: "Read all questions carefully",
        tags: "math,algebra",
        isFree: true,
      },
    ]

    const csvContent = [
      Object.keys(template[0]).join(","),
      ...template.map((row) => Object.values(row).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "test-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Management</h1>
          <p className="text-muted-foreground">Create and manage all types of tests and quizzes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Upload Tests</DialogTitle>
                <DialogDescription>Upload multiple tests using CSV or Excel file</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={bulkUploadData.category}
                      onValueChange={(value) => setBulkUploadData({ ...bulkUploadData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Test Type *</Label>
                    <Select
                      value={bulkUploadData.type}
                      onValueChange={(value) => setBulkUploadData({ ...bulkUploadData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mock">Mock Test</SelectItem>
                        <SelectItem value="mini">Mini Test</SelectItem>
                        <SelectItem value="sectional">Sectional Test</SelectItem>
                        <SelectItem value="daily-quiz">Daily Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Upload File *</Label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setBulkUploadData({ ...bulkUploadData, file: e.target.files[0] })}
                  />
                  <p className="text-xs text-muted-foreground">Supported formats: CSV, Excel (.xlsx, .xls)</p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsBulkUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkUpload} disabled={!bulkUploadData.file || !bulkUploadData.category}>
                      Upload Tests
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Link href="/admin/tests/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.length}</div>
            <p className="text-xs text-muted-foreground">All test papers</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.filter((t) => t.isPublished).length}</div>
            <p className="text-xs text-muted-foreground">Live tests</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.reduce((sum, test) => sum + (test.statistics?.totalAttempts || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time attempts</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.length > 0
                ? Math.round(tests.reduce((sum, test) => sum + (test.statistics?.averageScore || 0), 0) / tests.length)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Across all tests</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-tests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-tests">All Tests</TabsTrigger>
          <TabsTrigger value="mock-tests">Mock Tests</TabsTrigger>
          <TabsTrigger value="mini-tests">Mini Tests</TabsTrigger>
          <TabsTrigger value="daily-quiz">Daily Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="all-tests" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>All Tests</CardTitle>
              <CardDescription>Manage all test papers across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-5 mb-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tests..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Test Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mock">Mock Test</SelectItem>
                    <SelectItem value="mini">Mini Test</SelectItem>
                    <SelectItem value="sectional">Sectional Test</SelectItem>
                    <SelectItem value="daily-quiz">Daily Quiz</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.difficulty}
                  onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tests Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Details</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.map((test) => (
                      <TableRow key={test._id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium line-clamp-1">{test.title}</p>
                            <p className="text-sm text-muted-foreground">{test.subject}</p>
                            <div className="flex gap-1">
                              {test.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {test.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{test.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              test.type === "mock"
                                ? "default"
                                : test.type === "mini"
                                  ? "secondary"
                                  : test.type === "sectional"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {test.type === "daily-quiz" ? "Daily Quiz" : test.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{test.category?.icon}</span>
                            <span className="text-sm">{test.category?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{test.duration}m</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{test.totalQuestions} questions</p>
                            <p className="text-muted-foreground">{test.totalMarks} marks</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={test.isPublished}
                              onCheckedChange={() => handleTogglePublish(test._id, test.isPublished)}
                            />
                            <span className="text-sm">{test.isPublished ? "Published" : "Draft"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{test.statistics?.totalAttempts || 0}</p>
                            <p className="text-muted-foreground">{test.statistics?.averageScore || 0}% avg</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tests/${test._id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tests/${test._id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Test
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tests/${test._id}/questions`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Manage Questions
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tests/${test._id}/analytics`}>
                                  <BarChart3 className="mr-2 h-4 w-4" />
                                  View Analytics
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteTest(test._id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Test
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredTests.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No tests found matching your criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mock-tests" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Mock Tests</CardTitle>
              <CardDescription>Full-length practice tests simulating real exams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTests
                  .filter((test) => test.type === "mock")
                  .map((test) => (
                    <Card key={test._id} className="card-hover">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg line-clamp-2">{test.title}</CardTitle>
                            <CardDescription>{test.subject}</CardDescription>
                          </div>
                          <Badge variant={test.isPublished ? "default" : "secondary"}>
                            {test.isPublished ? "Live" : "Draft"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{test.duration} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Questions:</span>
                            <span>{test.totalQuestions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Attempts:</span>
                            <span>{test.statistics?.totalAttempts || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Link href={`/admin/tests/${test._id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/tests/${test._id}/edit`} className="flex-1">
                            <Button size="sm" className="w-full">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mini-tests" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Mini Tests</CardTitle>
              <CardDescription>Quick practice tests for focused learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredTests
                  .filter((test) => test.type === "mini")
                  .map((test) => (
                    <Card key={test._id} className="card-hover">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base line-clamp-2">{test.title}</CardTitle>
                        <CardDescription className="text-sm">{test.subject}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{test.duration}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Questions:</span>
                            <span>{test.totalQuestions}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-3">
                          <Link href={`/admin/tests/${test._id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/tests/${test._id}/edit`} className="flex-1">
                            <Button size="sm" className="w-full text-xs">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-quiz" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Daily Quiz</CardTitle>
                  <CardDescription>Automated daily quizzes for continuous learning</CardDescription>
                </div>
                <Link href="/admin/daily-quiz/create">
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Quiz
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTests
                  .filter((test) => test.type === "daily-quiz")
                  .map((test) => (
                    <div key={test._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{test.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {test.totalQuestions} questions • {test.duration} minutes
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {test.category?.name}
                            </Badge>
                            <Badge variant={test.isPublished ? "default" : "secondary"} className="text-xs">
                              {test.isPublished ? "Active" : "Scheduled"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <p className="font-medium">{test.statistics?.totalAttempts || 0} attempts</p>
                          <p className="text-muted-foreground">{test.statistics?.averageScore || 0}% avg score</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tests/${test._id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tests/${test._id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Quiz
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
