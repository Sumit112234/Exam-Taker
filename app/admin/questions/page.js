"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Edit, Trash2, Upload, Eye, ImageIcon, FileText, BarChart3, X, Save } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function QuestionsManagement() {
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [filters, setFilters] = useState({
    category: "all",
    examName: "all",
    sectionName: "all",
    subject: "all",
    difficulty: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [newTag, setNewTag] = useState("")
  const [availableExams, setAvailableExams] = useState([])
  const [availableSections, setAvailableSections] = useState([])

  const [newQuestion, setNewQuestion] = useState({
    category: "",
    examName: "",
    sectionName: "",
    subject: "",
    topic: "",
    chapter: "",
    type: "mcq",
    questionText: "",
    questionTextHindi: "",
    questionImage: "",
    passage: "",
    passageImage: "",
    options: ["", "", "", ""],
    optionsHindi: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    explanationHindi: "",
    explanationImage: "",
    marks: 1,
    negativeMarks: 0.25,
    difficulty: "Medium",
    tags: [],
  })

  const [bulkUploadData, setBulkUploadData] = useState({
    category: "",
    examId: "",
    sectionId: "",
    examName: "",
    sectionName: "",
    questions: "",
    file: null,
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterQuestions()
  }, [questions, filters, searchQuery])

  // Category/Exam/Section cascade effects for new question form
  useEffect(() => {
    if (newQuestion.category) {
      const category = categories.find((cat) => cat._id === newQuestion.category)
      setSelectedCategory(category)
      setSelectedExam(null)
      setSelectedSection(null)
      setNewQuestion((prev) => ({ ...prev, examName: "", sectionName: "", subject: "" }))
    }
  }, [newQuestion.category, categories])

  useEffect(() => {
    if (newQuestion.examName && selectedCategory) {
      const exam = selectedCategory.exams?.find((exam) => exam.name === newQuestion.examName)
      setSelectedExam(exam)
      setSelectedSection(null)
      setNewQuestion((prev) => ({ ...prev, sectionName: "", subject: "" }))
    }
  }, [newQuestion.examName, selectedCategory])

  useEffect(() => {
    if (newQuestion.sectionName && selectedExam) {
      const section = selectedExam.sections?.find((section) => section.name === newQuestion.sectionName)
      setSelectedSection(section)
      setNewQuestion((prev) => ({ ...prev, subject: "" }))
    }
  }, [newQuestion.sectionName, selectedExam])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch categories
      const categoriesResponse = await fetch("/api/admin/categories")
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

      // Fetch questions
      const questionsResponse = await fetch("/api/admin/questions")
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData.questions || questionsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterQuestions = () => {
    let filtered = questions

    if (searchQuery) {
      filtered = filtered.filter(
        (question) =>
          question.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          question.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          question.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          question.chapter?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((question) => question.category._id === filters.category)
    }

    if (filters.examName !== "all") {
      filtered = filtered.filter((question) => question.examName === filters.examName)
    }

    if (filters.sectionName !== "all") {
      filtered = filtered.filter((question) => question.sectionName === filters.sectionName)
    }

    if (filters.subject !== "all") {
      filtered = filtered.filter((question) => question.subject === filters.subject)
    }

    if (filters.difficulty !== "all") {
      filtered = filtered.filter((question) => question.difficulty === filters.difficulty)
    }

    setFilteredQuestions(filtered)
  }

  const handleInputChange = (field, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleOptionChange = (index, value, isHindi = false) => {
    const optionsField = isHindi ? "optionsHindi" : "options"
    setNewQuestion((prev) => ({
      ...prev,
      [optionsField]: prev[optionsField].map((option, i) => (i === index ? value : option)),
    }))
  }

  const addOption = () => {
    if (newQuestion.options.length < 6) {
      setNewQuestion((prev) => ({
        ...prev,
        options: [...prev.options, ""],
        optionsHindi: [...prev.optionsHindi, ""],
      }))
    }
  }

  const removeOption = (index) => {
    if (newQuestion.options.length > 2) {
      setNewQuestion((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
        optionsHindi: prev.optionsHindi.filter((_, i) => i !== index),
      }))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !newQuestion.tags.includes(newTag.trim())) {
      setNewQuestion((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setNewQuestion((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const fetchExamsByCategory = async (categoryId) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/exams`)
      if (response.ok) {
        const data = await response.json()
        setAvailableExams(data)
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
    }
  }

  const fetchSectionsByExam = async (examId) => {
    try {
      const response = await fetch(`/api/admin/exams/${examId}/sections`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSections(data)
      }
    } catch (error) {
      console.error("Error fetching sections:", error)
    }
  }

  const handleCreateQuestion = async () => {
    try {
      // Validate required fields
      if (
        !newQuestion.category ||
        !newQuestion.examName ||
        !newQuestion.sectionName ||
        !newQuestion.subject ||
        !newQuestion.questionText ||
        !newQuestion.correctAnswer
      ) {
        alert("Please fill in all required fields")
        return
      }

      // Filter out empty options
      const filteredOptions = newQuestion.options.filter((option) => option.trim() !== "")
      const filteredOptionsHindi = newQuestion.optionsHindi.filter((option) => option.trim() !== "")

      const submitData = {
        ...newQuestion,
        options: filteredOptions,
        optionsHindi: filteredOptionsHindi,
        // Add exam and section IDs if available
        examId: selectedExam?._id,
        sectionId: selectedSection?.sectionId,
      }

      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const createdQuestion = await response.json()
        setQuestions([createdQuestion, ...questions])
        setIsCreateDialogOpen(false)
        resetNewQuestion()
        alert("Question created successfully!")
      } else {
        const error = await response.json()
        alert(error.message || "Error creating question")
      }
    } catch (error) {
      console.error("Error creating question:", error)
      alert("Error creating question")
    }
  }

  const handleBulkUpload = async () => {
    try {
      if (!bulkUploadData.category || !bulkUploadData.examId || !bulkUploadData.sectionId) {
        alert("Please select category, exam, and section")
        return
      }

      const formData = new FormData()

      if (bulkUploadData.file) {
        formData.append("file", bulkUploadData.file)
      } else {
        formData.append("questions", bulkUploadData.questions)
      }

      formData.append("category", bulkUploadData.category)
      formData.append("examId", bulkUploadData.examId)
      formData.append("sectionId", bulkUploadData.sectionId)
      formData.append("examName", bulkUploadData.examName)
      formData.append("sectionName", bulkUploadData.sectionName)

      const response = await fetch("/api/admin/questions/bulk-upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        alert(
          `Successfully uploaded ${result.created} questions${result.errors > 0 ? ` with ${result.errors} errors` : ""}`,
        )
        fetchData() // Refresh questions
        setIsBulkUploadDialogOpen(false)
        setBulkUploadData({
          category: "",
          examId: "",
          sectionId: "",
          examName: "",
          sectionName: "",
          questions: "",
          file: null,
        })
        setAvailableExams([])
        setAvailableSections([])
      } else {
        const error = await response.json()
        alert(error.message || "Error uploading questions")
      }
    } catch (error) {
      console.error("Error uploading questions:", error)
      alert("Error uploading questions")
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await fetch(`/api/admin/questions/${questionId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setQuestions(questions.filter((q) => q._id !== questionId))
        }
      } catch (error) {
        console.error("Error deleting question:", error)
      }
    }
  }

  const resetNewQuestion = () => {
    setNewQuestion({
      category: "",
      examName: "",
      sectionName: "",
      subject: "",
      topic: "",
      chapter: "",
      type: "mcq",
      questionText: "",
      questionTextHindi: "",
      questionImage: "",
      passage: "",
      passageImage: "",
      options: ["", "", "", ""],
      optionsHindi: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      explanationHindi: "",
      explanationImage: "",
      marks: 1,
      negativeMarks: 0.25,
      difficulty: "Medium",
      tags: [],
    })
    setSelectedCategory(null)
    setSelectedExam(null)
    setSelectedSection(null)
    setNewTag("")
  }

  const getUniqueValues = (field) => {
    return [...new Set(questions.map((q) => q[field]))].filter(Boolean)
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
          <h1 className="text-3xl font-bold tracking-tight">Questions Management</h1>
          <p className="text-muted-foreground">Create and manage exam questions with advanced features</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Upload Questions</DialogTitle>
                <DialogDescription>
                  Upload multiple questions at once and assign them to specific exam sections
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Category/Exam/Section Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Question Assignment</CardTitle>
                    <CardDescription>Select where these questions should be assigned</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select
                          value={bulkUploadData.category}
                          onValueChange={(value) => {
                            setBulkUploadData({
                              ...bulkUploadData,
                              category: value,
                              examId: "",
                              sectionId: "",
                              examName: "",
                              sectionName: "",
                            })
                            fetchExamsByCategory(value)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
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
                      </div>

                      <div className="space-y-2">
                        <Label>Exam *</Label>
                        <Select
                          value={bulkUploadData.examId}
                          onValueChange={(value) => {
                            const selectedExam = availableExams.find((exam) => exam._id === value)
                            setBulkUploadData({
                              ...bulkUploadData,
                              examId: value,
                              examName: selectedExam?.title || "",
                              sectionId: "",
                              sectionName: "",
                            })
                            fetchSectionsByExam(value)
                          }}
                          disabled={!bulkUploadData.category}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableExams.map((exam) => (
                              <SelectItem key={exam._id} value={exam._id}>
                                {exam.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Section *</Label>
                        <Select
                          value={bulkUploadData.sectionId}
                          onValueChange={(value) => {
                            const selectedSection = availableSections.find((section) => section.sectionId === value)
                            setBulkUploadData({
                              ...bulkUploadData,
                              sectionId: value,
                              sectionName: selectedSection?.name || "",
                            })
                          }}
                          disabled={!bulkUploadData.examId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSections.map((section) => (
                              <SelectItem key={section.sectionId} value={section.sectionId}>
                                {section.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Assignment Summary */}
                    {bulkUploadData.category && bulkUploadData.examId && bulkUploadData.sectionId && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Assignment Summary</h4>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <p>
                            <strong>Category:</strong> {categories.find((c) => c._id === bulkUploadData.category)?.name}
                          </p>
                          <p>
                            <strong>Exam:</strong> {bulkUploadData.examName}
                          </p>
                          <p>
                            <strong>Section:</strong> {bulkUploadData.sectionName}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upload Method Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Method</CardTitle>
                    <CardDescription>Choose how you want to upload your questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="text" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text">JSON Text</TabsTrigger>
                        <TabsTrigger value="file">File Upload</TabsTrigger>
                      </TabsList>

                      <TabsContent value="text" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Questions JSON</Label>
                          <Textarea
                            placeholder="Paste your questions in JSON format..."
                            value={bulkUploadData.questions}
                            onChange={(e) => setBulkUploadData({ ...bulkUploadData, questions: e.target.value })}
                            rows={12}
                          />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <h4 className="font-medium mb-2">Expected JSON Format:</h4>
                          <pre className="text-xs text-muted-foreground overflow-x-auto">
                            {`[
  {
    "subject": "Mathematics",
    "topic": "Algebra",
    "questionText": "What is 2 + 2?",
    "type": "mcq",
    "options": ["2", "3", "4", "5"],
    "correctAnswer": "4",
    "explanation": "Basic addition",
    "marks": 1,
    "negativeMarks": 0.25,
    "difficulty": "Easy"
  }
]`}
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="file" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Upload File</Label>
                          <Input
                            type="file"
                            accept=".json,.csv"
                            onChange={(e) => setBulkUploadData({ ...bulkUploadData, file: e.target.files[0] })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Supported formats: JSON, CSV. Maximum file size: 10MB
                          </p>
                        </div>

                        {bulkUploadData.file && (
                          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium">File Selected:</span>
                              <span>{bulkUploadData.file.name}</span>
                            </div>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              Size: {(bulkUploadData.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Upload Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsBulkUploadDialogOpen(false)
                      setBulkUploadData({
                        category: "",
                        examId: "",
                        sectionId: "",
                        examName: "",
                        sectionName: "",
                        questions: "",
                        file: null,
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkUpload}
                    disabled={
                      !bulkUploadData.category ||
                      !bulkUploadData.examId ||
                      !bulkUploadData.sectionId ||
                      (!bulkUploadData.questions && !bulkUploadData.file)
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Questions
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Question</DialogTitle>
                <DialogDescription>Add a new question with all necessary details and media</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3 space-y-6">
                  {/* Question Classification */}
                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle>Question Classification</CardTitle>
                      <CardDescription>Categorize your question for better organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={newQuestion.category}
                            onValueChange={(value) => handleInputChange("category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
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
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="examName">Exam *</Label>
                          <Select
                            value={newQuestion.examName}
                            onValueChange={(value) => handleInputChange("examName", value)}
                            disabled={!selectedCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedCategory?.exams?.map((exam, index) => (
                                <SelectItem key={index} value={exam.name}>
                                  {exam.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sectionName">Section *</Label>
                          <Select
                            value={newQuestion.sectionName}
                            onValueChange={(value) => handleInputChange("sectionName", value)}
                            disabled={!selectedExam}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedExam?.sections?.map((section, index) => (
                                <SelectItem key={index} value={section.name}>
                                  {section.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Select
                            value={newQuestion.subject}
                            onValueChange={(value) => handleInputChange("subject", value)}
                            disabled={!selectedSection}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedSection?.subjects?.map((subject, index) => (
                                <SelectItem key={index} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="topic">Topic</Label>
                          <Input
                            id="topic"
                            value={newQuestion.topic}
                            onChange={(e) => handleInputChange("topic", e.target.value)}
                            placeholder="Enter topic"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="chapter">Chapter</Label>
                          <Input
                            id="chapter"
                            value={newQuestion.chapter}
                            onChange={(e) => handleInputChange("chapter", e.target.value)}
                            placeholder="Enter chapter"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="type">Question Type</Label>
                          <Select value={newQuestion.type} onValueChange={(value) => handleInputChange("type", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mcq">Multiple Choice</SelectItem>
                              <SelectItem value="numerical">Numerical</SelectItem>
                              <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="data-interpretation">Data Interpretation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Difficulty</Label>
                          <Select
                            value={newQuestion.difficulty}
                            onValueChange={(value) => handleInputChange("difficulty", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Marks</Label>
                            <Input
                              type="number"
                              step="0.5"
                              min="0.5"
                              max="10"
                              value={newQuestion.marks}
                              onChange={(e) => handleInputChange("marks", Number.parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Negative Marks</Label>
                            <Input
                              type="number"
                              step="0.25"
                              min="0"
                              max="5"
                              value={newQuestion.negativeMarks}
                              onChange={(e) => handleInputChange("negativeMarks", Number.parseFloat(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Question Content */}
                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle>Question Content</CardTitle>
                      <CardDescription>Enter the question text and any supporting content</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="questionText">Question Text (English) *</Label>
                        <Textarea
                          id="questionText"
                          value={newQuestion.questionText}
                          onChange={(e) => handleInputChange("questionText", e.target.value)}
                          placeholder="Enter the question text..."
                          rows={4}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="questionTextHindi">Question Text (Hindi)</Label>
                        <Textarea
                          id="questionTextHindi"
                          value={newQuestion.questionTextHindi}
                          onChange={(e) => handleInputChange("questionTextHindi", e.target.value)}
                          placeholder="प्रश्न का हिंदी अनुवाद..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="questionImage">Question Image URL</Label>
                        <Input
                          id="questionImage"
                          value={newQuestion.questionImage}
                          onChange={(e) => handleInputChange("questionImage", e.target.value)}
                          placeholder="https://example.com/question-image.jpg"
                        />
                      </div>

                      {(newQuestion.type === "data-interpretation" || newQuestion.passage) && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="passage">Passage/Data</Label>
                            <Textarea
                              id="passage"
                              value={newQuestion.passage}
                              onChange={(e) => handleInputChange("passage", e.target.value)}
                              placeholder="Enter passage or data for interpretation..."
                              rows={6}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="passageImage">Passage Image URL</Label>
                            <Input
                              id="passageImage"
                              value={newQuestion.passageImage}
                              onChange={(e) => handleInputChange("passageImage", e.target.value)}
                              placeholder="https://example.com/passage-image.jpg"
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Options for MCQ */}
                  {newQuestion.type === "mcq" && (
                    <Card className="card-hover">
                      <CardHeader>
                        <CardTitle>Answer Options</CardTitle>
                        <CardDescription>Add multiple choice options for the question</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="min-w-0">Option {String.fromCharCode(65 + index)}</Label>
                              {newQuestion.options.length > 2 && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + index)} (English)`}
                              />
                              <Input
                                value={newQuestion.optionsHindi[index] || ""}
                                onChange={(e) => handleOptionChange(index, e.target.value, true)}
                                placeholder={`विकल्प ${String.fromCharCode(65 + index)} (Hindi)`}
                              />
                            </div>
                          </div>
                        ))}

                        {newQuestion.options.length < 6 && (
                          <Button type="button" variant="outline" onClick={addOption}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                          </Button>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="correctAnswer">Correct Answer *</Label>
                          <Select
                            value={newQuestion.correctAnswer}
                            onValueChange={(value) => handleInputChange("correctAnswer", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {newQuestion.options.map(
                                (option, index) =>
                                  option.trim() && (
                                    <SelectItem key={index} value={option}>
                                      {String.fromCharCode(65 + index)}. {option}
                                    </SelectItem>
                                  ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Correct Answer for non-MCQ */}
                  {newQuestion.type !== "mcq" && (
                    <Card className="card-hover">
                      <CardHeader>
                        <CardTitle>Correct Answer</CardTitle>
                        <CardDescription>Provide the correct answer for this question</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label htmlFor="correctAnswer">Correct Answer *</Label>
                          <Input
                            id="correctAnswer"
                            value={newQuestion.correctAnswer}
                            onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                            placeholder="Enter the correct answer..."
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Explanation */}
                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle>Explanation</CardTitle>
                      <CardDescription>Provide detailed explanation for the answer</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="explanation">Explanation (English)</Label>
                        <Textarea
                          id="explanation"
                          value={newQuestion.explanation}
                          onChange={(e) => handleInputChange("explanation", e.target.value)}
                          placeholder="Explain why this is the correct answer..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="explanationHindi">Explanation (Hindi)</Label>
                        <Textarea
                          id="explanationHindi"
                          value={newQuestion.explanationHindi}
                          onChange={(e) => handleInputChange("explanationHindi", e.target.value)}
                          placeholder="उत्तर की व्याख्या..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="explanationImage">Explanation Image URL</Label>
                        <Input
                          id="explanationImage"
                          value={newQuestion.explanationImage}
                          onChange={(e) => handleInputChange("explanationImage", e.target.value)}
                          placeholder="https://example.com/explanation-image.jpg"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                      <CardDescription>Add tags to help categorize and search for this question</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag..."
                          onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                        />
                        <Button type="button" variant="outline" onClick={handleAddTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newQuestion.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle>Question Preview</CardTitle>
                      <CardDescription>How your question will appear</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Preview</h4>
                          <Badge variant="outline">{newQuestion.difficulty}</Badge>
                        </div>

                        {newQuestion.questionText && <p className="text-sm">{newQuestion.questionText}</p>}

                        {newQuestion.type === "mcq" && newQuestion.options.some((opt) => opt.trim()) && (
                          <div className="space-y-2">
                            {newQuestion.options.map(
                              (option, index) =>
                                option.trim() && (
                                  <div key={index} className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
                                    <span className="text-sm">{option}</span>
                                  </div>
                                ),
                            )}
                          </div>
                        )}

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Marks: +{newQuestion.marks}</span>
                          <span>Negative: -{newQuestion.negativeMarks}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle>Question Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="outline">{newQuestion.type}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <Badge
                            variant={
                              newQuestion.difficulty === "Easy"
                                ? "outline"
                                : newQuestion.difficulty === "Medium"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {newQuestion.difficulty}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Marks:</span>
                          <span>
                            +{newQuestion.marks} / -{newQuestion.negativeMarks}
                          </span>
                        </div>
                        {newQuestion.type === "mcq" && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Options:</span>
                            <span>{newQuestion.options.filter((opt) => opt.trim()).length}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetNewQuestion()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateQuestion}>
                  <Save className="mr-2 h-4 w-4" />
                  Create Question
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">All questions in database</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter((q) => q.questionImage || q.passageImage).length}
            </div>
            <p className="text-xs text-muted-foreground">Questions with visual content</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Interpretation</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.filter((q) => q.type === "data-interpretation").length}</div>
            <p className="text-xs text-muted-foreground">Complex question types</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Different subject categories</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Questions Database</CardTitle>
          <CardDescription>Manage all exam questions with advanced filtering and search</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-6 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
            <Select value={filters.examName} onValueChange={(value) => setFilters({ ...filters, examName: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {getUniqueValues("examName").map((examName) => (
                  <SelectItem key={examName} value={examName}>
                    {examName}
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
                {getUniqueValues("sectionName").map((sectionName) => (
                  <SelectItem key={sectionName} value={sectionName}>
                    {sectionName}
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
                {getUniqueValues("subject").map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.difficulty} onValueChange={(value) => setFilters({ ...filters, difficulty: value })}>
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
          </div>

          {/* Questions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Exam/Section</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium line-clamp-2">{question.questionText}</p>
                        <p className="text-sm text-muted-foreground">{question.subject}</p>
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
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{question.examName}</p>
                        <p className="text-muted-foreground">{question.sectionName}</p>
                      </div>
                    </TableCell>
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
                      <div className="flex gap-1">
                        {question.questionImage && (
                          <Badge variant="outline" className="text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />Q
                          </Badge>
                        )}
                        {question.passageImage && (
                          <Badge variant="outline" className="text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />P
                          </Badge>
                        )}
                        {question.explanationImage && (
                          <Badge variant="outline" className="text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />E
                          </Badge>
                        )}
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
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Question
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteQuestion(question._id)} className="text-red-600">
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

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No questions found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
