"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Edit, Trash2, Eye, BookOpen, FileText, ImageIcon, BarChart3, FolderPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function QuestionBank() {
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [filters, setFilters] = useState({
    category: "all",
    examName: "all",
    sectionName: "all",
    subject: "all",
    difficulty: "all",
    type: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false)
  const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    code: "",
    description: "",
    icon: "📚",
    color: "#3B82F6",
    exams: [],
  })
  const [newExam, setNewExam] = useState({
    name: "",
    code: "",
    description: "",
    sections: [],
    types: ["mock", "mini-mock", "section-wise"],
  })
  const [newSection, setNewSection] = useState({
    name: "",
    code: "",
    duration: 60,
    subjects: [],
  })
  const [newSubject, setNewSubject] = useState("")
  const [selectedExamIndex, setSelectedExamIndex] = useState(-1)
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(-1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchQuestions()
  }, [filters, searchQuery, pagination.page])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch categories
      const categoriesResponse = await fetch("/api/admin/categories")
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.category !== "all") params.append("category", filters.category)
      if (filters.examName !== "all") params.append("examName", filters.examName)
      if (filters.sectionName !== "all") params.append("sectionName", filters.sectionName)
      if (filters.subject !== "all") params.append("subject", filters.subject)
      if (filters.difficulty !== "all") params.append("difficulty", filters.difficulty)
      if (filters.type !== "all") params.append("type", filters.type)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/admin/questions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    }
  }

  const handleCreateCategory = async () => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      if (response.ok) {
        const createdCategory = await response.json()
        setCategories([createdCategory, ...categories])
        setIsCreateCategoryDialogOpen(false)
        setNewCategory({
          name: "",
          code: "",
          description: "",
          icon: "📚",
          color: "#3B82F6",
          exams: [],
        })
      }
    } catch (error) {
      console.error("Error creating category:", error)
    }
  }

  const handleAddExam = () => {
    if (newExam.name.trim() && newExam.code.trim()) {
      setNewCategory((prev) => ({
        ...prev,
        exams: [...prev.exams, { ...newExam, isActive: true }],
      }))
      setNewExam({
        name: "",
        code: "",
        description: "",
        sections: [],
        types: ["mock", "mini-mock", "section-wise"],
      })
    }
  }

  const handleAddSection = () => {
    if (newSection.name.trim() && newSection.code.trim() && selectedExamIndex >= 0) {
      setNewCategory((prev) => {
        const updatedExams = [...prev.exams]
        updatedExams[selectedExamIndex].sections.push({ ...newSection })
        return { ...prev, exams: updatedExams }
      })
      setNewSection({
        name: "",
        code: "",
        duration: 60,
        subjects: [],
      })
    }
  }

  const handleAddSubject = () => {
    if (newSubject.trim() && selectedExamIndex >= 0 && selectedSectionIndex >= 0) {
      setNewCategory((prev) => {
        const updatedExams = [...prev.exams]
        updatedExams[selectedExamIndex].sections[selectedSectionIndex].subjects.push(newSubject.trim())
        return { ...prev, exams: updatedExams }
      })
      setNewSubject("")
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await fetch(`/api/admin/questions/${questionId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchQuestions() // Refresh questions
        }
      } catch (error) {
        console.error("Error deleting question:", error)
      }
    }
  }

  const getSelectedCategory = () => {
    return categories.find((cat) => cat._id === filters.category)
  }

  const getSelectedExam = () => {
    const category = getSelectedCategory()
    if (category && filters.examName !== "all") {
      return category.exams.find((exam) => exam.name === filters.examName)
    }
    return null
  }

  const getQuestionStats = () => {
    const stats = {
      total: pagination.total,
      withImages: questions.filter((q) => q.questionImage || q.passageImage || q.explanationImage).length,
      dataInterpretation: questions.filter((q) => q.type === "data-interpretation").length,
      byDifficulty: {
        Easy: questions.filter((q) => q.difficulty === "Easy").length,
        Medium: questions.filter((q) => q.difficulty === "Medium").length,
        Hard: questions.filter((q) => q.difficulty === "Hard").length,
      },
      byType: {
        mcq: questions.filter((q) => q.type === "mcq").length,
        numerical: questions.filter((q) => q.type === "numerical").length,
        "fill-in-the-blank": questions.filter((q) => q.type === "fill-in-the-blank").length,
        "true-false": questions.filter((q) => q.type === "true-false").length,
        "data-interpretation": questions.filter((q) => q.type === "data-interpretation").length,
      },
    }
    return stats
  }

  const stats = getQuestionStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground">Manage your reusable question repository</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>Add a new category with exams and sections</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category Name *</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g., Banking"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category Code *</Label>
                    <Input
                      value={newCategory.code}
                      onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., BANK"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      placeholder="🏦"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Describe this category..."
                    rows={2}
                  />
                </div>

                {/* Add Exam Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-medium">Add Exams</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Exam Name</Label>
                      <Input
                        value={newExam.name}
                        onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                        placeholder="e.g., IBPS PO"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Exam Code</Label>
                      <Input
                        value={newExam.code}
                        onChange={(e) => setNewExam({ ...newExam, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., IBPS_PO"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Action</Label>
                      <Button type="button" onClick={handleAddExam} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exam
                      </Button>
                    </div>
                  </div>

                  {newCategory.exams.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Exams & Sections</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {newCategory.exams.map((exam, examIndex) => (
                          <div key={examIndex} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <span className="font-medium">{exam.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">({exam.code})</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedExamIndex(examIndex)
                                  setNewSection({
                                    name: "",
                                    code: "",
                                    duration: 60,
                                    subjects: [],
                                  })
                                }}
                              >
                                Add Section
                              </Button>
                            </div>

                            {selectedExamIndex === examIndex && (
                              <div className="grid gap-3 sm:grid-cols-4 mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                <Input
                                  value={newSection.name}
                                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                                  placeholder="Section name"
                                />
                                <Input
                                  value={newSection.code}
                                  onChange={(e) => setNewSection({ ...newSection, code: e.target.value.toUpperCase() })}
                                  placeholder="Section code"
                                />
                                <Input
                                  type="number"
                                  value={newSection.duration}
                                  onChange={(e) =>
                                    setNewSection({ ...newSection, duration: Number.parseInt(e.target.value) })
                                  }
                                  placeholder="Duration (min)"
                                />
                                <Button type="button" onClick={handleAddSection} size="sm">
                                  Add
                                </Button>
                              </div>
                            )}

                            <div className="space-y-2">
                              {exam.sections.map((section, sectionIndex) => (
                                <div
                                  key={sectionIndex}
                                  className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded"
                                >
                                  <div>
                                    <span className="text-sm font-medium">{section.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">({section.duration}min)</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedExamIndex(examIndex)
                                      setSelectedSectionIndex(sectionIndex)
                                      setNewSubject("")
                                    }}
                                  >
                                    Add Subject
                                  </Button>
                                </div>
                              ))}
                            </div>

                            {selectedExamIndex === examIndex && selectedSectionIndex >= 0 && (
                              <div className="flex gap-2 mt-2">
                                <Input
                                  value={newSubject}
                                  onChange={(e) => setNewSubject(e.target.value)}
                                  placeholder="Subject name"
                                  onKeyPress={(e) => e.key === "Enter" && handleAddSubject()}
                                />
                                <Button type="button" onClick={handleAddSubject} size="sm">
                                  Add Subject
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateCategoryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCategory}>Create Category</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In question bank</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withImages}</div>
            <p className="text-xs text-muted-foreground">Visual content</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Interpretation</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dataInterpretation}</div>
            <p className="text-xs text-muted-foreground">Complex types</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Subject areas</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MCQ Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType.mcq}</div>
            <p className="text-xs text-muted-foreground">Multiple choice</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">All Questions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Question Repository</CardTitle>
              <CardDescription>Browse and manage all questions in your bank</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-7 mb-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value, examName: "all", sectionName: "all" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.examName}
                  onValueChange={(value) => setFilters({ ...filters, examName: value, sectionName: "all" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {getSelectedCategory()?.exams?.map((exam, index) => (
                      <SelectItem key={index} value={exam.name}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sectionName}
                  onValueChange={(value) => setFilters({ ...filters, sectionName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {getSelectedExam()?.sections?.map((section, index) => (
                      <SelectItem key={index} value={section.name}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {getSelectedExam()
                      ?.sections?.find((s) => s.name === filters.sectionName)
                      ?.subjects?.map((subject, index) => (
                        <SelectItem key={index} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
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
                  </SelectContent>
                </Select>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="numerical">Numerical</SelectItem>
                    <SelectItem value="fill-in-the-blank">Fill in Blank</SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                    <SelectItem value="data-interpretation">Data Interpretation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Questions Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question._id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium line-clamp-2">{question.questionText}</p>
                            <p className="text-sm text-muted-foreground">{question.topic}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{question.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{question.category?.icon}</span>
                            <span className="text-sm">{question.category?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{question.examName}</TableCell>
                        <TableCell>{question.sectionName}</TableCell>
                        <TableCell>{question.subject}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              question.difficulty === "Easy"
                                ? "outline"
                                : question.difficulty === "Medium"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {question.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>+{question.marks}</p>
                            {question.negativeMarks > 0 && <p className="text-red-500">-{question.negativeMarks}</p>}
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedQuestion(question)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Question
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Question
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteQuestion(question._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Question
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} questions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {questions.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No questions found matching your criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Categories & Exams</CardTitle>
              <CardDescription>Organize your question bank with categories, exams, and sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {categories.map((category) => (
                  <Card key={category._id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <CardDescription>{category.code}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">{category.description}</p>

                        <div className="space-y-3">
                          <p className="text-sm font-medium">Exams ({category.exams?.length || 0}):</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {category.exams?.map((exam, index) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <span className="font-medium">{exam.name}</span>
                                    <span className="text-sm text-muted-foreground ml-2">({exam.code})</span>
                                  </div>
                                  <div className="flex gap-1">
                                    {exam.types?.map((type, typeIndex) => (
                                      <Badge key={typeIndex} variant="outline" className="text-xs">
                                        {type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {exam.sections && exam.sections.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Sections:</p>
                                    {exam.sections.map((section, sectionIndex) => (
                                      <div
                                        key={sectionIndex}
                                        className="text-xs bg-gray-100 dark:bg-gray-800 rounded p-2"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium">{section.name}</span>
                                          <span className="text-muted-foreground">{section.duration}min</span>
                                        </div>
                                        {section.subjects && section.subjects.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {section.subjects.map((subject, subjectIndex) => (
                                              <Badge key={subjectIndex} variant="outline" className="text-xs">
                                                {subject}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Questions:</span>
                          <span className="font-medium">
                            {questions.filter((q) => q.category?._id === category._id).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Question Distribution by Difficulty</CardTitle>
                <CardDescription>Breakdown of questions by difficulty level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Easy</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${stats.total > 0 ? (stats.byDifficulty.Easy / stats.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.byDifficulty.Easy}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{
                            width: `${stats.total > 0 ? (stats.byDifficulty.Medium / stats.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.byDifficulty.Medium}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hard</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${stats.total > 0 ? (stats.byDifficulty.Hard / stats.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.byDifficulty.Hard}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Question Types</CardTitle>
                <CardDescription>Distribution of different question types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{type.replace("-", " ")}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Category-wise Question Count</CardTitle>
              <CardDescription>Number of questions in each category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const categoryQuestions = questions.filter((q) => q.category?._id === category._id)
                  return (
                    <div key={category._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{categoryQuestions.length}</p>
                        <p className="text-xs text-muted-foreground">questions</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
            <DialogDescription>Complete question information and media</DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <p className="text-sm">{selectedQuestion.category?.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Exam</Label>
                  <p className="text-sm">{selectedQuestion.examName}</p>
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <p className="text-sm">{selectedQuestion.sectionName}</p>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <p className="text-sm">{selectedQuestion.subject}</p>
                </div>
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <p className="text-sm">{selectedQuestion.topic || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Badge variant="outline">{selectedQuestion.type}</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Badge
                    variant={
                      selectedQuestion.difficulty === "Easy"
                        ? "outline"
                        : selectedQuestion.difficulty === "Medium"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {selectedQuestion.difficulty}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Marks</Label>
                  <p className="text-sm">
                    +{selectedQuestion.marks}
                    {selectedQuestion.negativeMarks > 0 && (
                      <span className="text-red-500 ml-2">-{selectedQuestion.negativeMarks}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm">{selectedQuestion.questionText}</p>
                  </div>
                </div>

                {selectedQuestion.questionTextHindi && (
                  <div className="space-y-2">
                    <Label>Question (Hindi)</Label>
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <p className="text-sm">{selectedQuestion.questionTextHindi}</p>
                    </div>
                  </div>
                )}

                {selectedQuestion.questionImage && (
                  <div className="space-y-2">
                    <Label>Question Image</Label>
                    <img
                      src={selectedQuestion.questionImage || "/placeholder.svg"}
                      alt="Question"
                      className="max-w-full h-auto border rounded-lg"
                    />
                  </div>
                )}

                {selectedQuestion.passage && (
                  <div className="space-y-2">
                    <Label>Passage/Data</Label>
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <p className="text-sm whitespace-pre-wrap">{selectedQuestion.passage}</p>
                    </div>
                  </div>
                )}

                {selectedQuestion.passageImage && (
                  <div className="space-y-2">
                    <Label>Passage Image</Label>
                    <img
                      src={selectedQuestion.passageImage || "/placeholder.svg"}
                      alt="Passage"
                      className="max-w-full h-auto border rounded-lg"
                    />
                  </div>
                )}

                {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="space-y-2">
                      {selectedQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg ${
                            option === selectedQuestion.correctAnswer
                              ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                              : "bg-gray-50 dark:bg-gray-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                            <span className="text-sm">{option}</span>
                            {option === selectedQuestion.correctAnswer && (
                              <Badge variant="outline" className="ml-auto text-green-600">
                                Correct
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedQuestion.explanation && (
                  <div className="space-y-2">
                    <Label>Explanation</Label>
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                      <p className="text-sm">{selectedQuestion.explanation}</p>
                    </div>
                  </div>
                )}

                {selectedQuestion.explanationImage && (
                  <div className="space-y-2">
                    <Label>Explanation Image</Label>
                    <img
                      src={selectedQuestion.explanationImage || "/placeholder.svg"}
                      alt="Explanation"
                      className="max-w-full h-auto border rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
