"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2, FileText, Search, MoreVertical, Pencil, Eye, BookOpen, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamsPage() {
  const [categories, setCategories] = useState([])
  const [exams, setExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    category: "all",
    examName: "all",
    type: "all",
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    examName: "",
    type: "mock",
    description: "",
    instructions: "Read all questions carefully before answering.",
    totalDuration: 120,
    totalMarks: 100,
    passingMarks: 40,
    negativeMarking: {
      enabled: true,
      value: 0.25,
    },
    settings: {
      allowReview: true,
      shuffleQuestions: false,
      showResults: true,
      allowPause: true,
      autoSubmit: true,
      showTimer: true,
      fullScreen: false,
    },
    visibility: {
      isPublished: false,
      isFree: false,
      subscriptionRequired: true,
    },
    sections: [],
    difficulty: "Medium",
    tags: [],
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const categoryParam = searchParams.get("category")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (categoryParam && categoryParam !== "all") {
      setFilters((prev) => ({ ...prev, category: categoryParam }))
    }
  }, [categoryParam])

  useEffect(() => {
    fetchExams()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        throw new Error("Failed to fetch categories")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchExams = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      if (filters.category !== "all") params.append("category", filters.category)
      if (filters.examName !== "all") params.append("examName", filters.examName)
      if (filters.type !== "all") params.append("type", filters.type)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/admin/exams?${params}`)
      if (response.ok) {
        const data = await response.json()
        // console.log(data)
        setExams(data)
      } else {
        throw new Error("Failed to fetch exams")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateExam = async () => {
    try {
      const response = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newExam = await response.json()
        setExams([...exams, newExam])
        setIsCreateDialogOpen(false)
        resetForm()
        toast({
          title: "Success",
          description: "Exam created successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to create exam")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateExam = async () => {
    try {
      const response = await fetch(`/api/admin/exams/${selectedExam._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedExam = await response.json()
        setExams(exams.map((exam) => (exam._id === updatedExam._id ? updatedExam : exam)))
        setIsEditDialogOpen(false)
        resetForm()
        toast({
          title: "Success",
          description: "Exam updated successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to update exam")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteExam = async () => {
    try {
      const response = await fetch(`/api/admin/exams/${selectedExam._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setExams(exams.filter((exam) => exam._id !== selectedExam._id))
        setIsDeleteDialogOpen(false)
        toast({
          title: "Success",
          description: "Exam deleted successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete exam")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (exam) => {
    setSelectedExam(exam)
    setFormData({
      title: exam.title,
      category: exam.category._id,
      examName: exam.examName,
      type: exam.type,
      description: exam.description || "",
      instructions: exam.instructions || "Read all questions carefully before answering.",
      totalDuration: exam.totalDuration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      negativeMarking: exam.negativeMarking,
      settings: exam.settings,
      visibility: exam.visibility,
      sections: exam.sections || [],
      difficulty: exam.difficulty || "Medium",
      tags: exam.tags || [],
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (exam) => {
    setSelectedExam(exam)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      examName: "",
      type: "mock",
      description: "",
      instructions: "Read all questions carefully before answering.",
      totalDuration: 120,
      totalMarks: 100,
      passingMarks: 40,
      negativeMarking: {
        enabled: true,
        value: 0.25,
      },
      settings: {
        allowReview: true,
        shuffleQuestions: false,
        showResults: true,
        allowPause: true,
        autoSubmit: true,
        showTimer: true,
        fullScreen: false,
      },
      visibility: {
        isPublished: false,
        isFree: false,
        subscriptionRequired: true,
      },
      sections: [],
      difficulty: "Medium",
      tags: [],
    })
    setCurrentStep(1)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNestedInputChange = (parent, name, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: value,
      },
    }))
  }

  const handleSectionChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedSections = [...prev.sections]
      updatedSections[index] = {
        ...updatedSections[index],
        [field]: value,
      }
      return {
        ...prev,
        sections: updatedSections,
      }
    })
  }

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          sectionId: `section_${Date.now()}`,
          name: `Section ${prev.sections.length + 1}`,
          duration: 30,
          questions: 25,
          marks: 25,
          negativeMarks: 0.25,
          questionIds: [],
        },
      ],
    }))
  }

  const removeSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }))
  }

  const getSelectedCategory = () => {
    return categories.find((cat) => cat._id === filters.category)
  }

  const getExamTypes = () => {
    return ["mock", "mini-mock", "section-wise", "chapter-wise", "practice"]
  }

  const navigateToQuestions = (examId) => {
    router.push(`/admin/questions?exam=${examId}`)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchExams()
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const renderCreateExamForm = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {currentStep === 1
              ? "Basic Information"
              : currentStep === 2
                ? "Sections & Configuration"
                : "Settings & Visibility"}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className={currentStep >= 1 ? "text-primary" : ""}>Basic</span>
            <span>→</span>
            <span className={currentStep >= 2 ? "text-primary" : ""}>Sections</span>
            <span>→</span>
            <span className={currentStep >= 3 ? "text-primary" : ""}>Settings</span>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., IBPS PO Mock Test 1"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examName">Exam Name</Label>
                <Select
                  value={formData.examName}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, examName: value }))}
                  disabled={!formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam name" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .find((cat) => cat._id === formData.category)
                      ?.exams?.map((exam, index) => (
                        <SelectItem key={index} value={exam.name}>
                          {exam.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Exam Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getExamTypes().map((type) => (
                      <SelectItem key={type} value={type}>
                        {type
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe this exam..."
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                name="instructions"
                placeholder="Instructions for test takers..."
                value={formData.instructions}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalDuration">Duration (minutes)</Label>
                <Input
                  id="totalDuration"
                  name="totalDuration"
                  type="number"
                  min="1"
                  value={formData.totalDuration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, totalDuration: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  min="1"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData((prev) => ({ ...prev, totalMarks: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input
                  id="passingMarks"
                  name="passingMarks"
                  type="number"
                  min="1"
                  max={formData.totalMarks}
                  value={formData.passingMarks}
                  onChange={(e) => setFormData((prev) => ({ ...prev, passingMarks: Number.parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="negativeMarking">Negative Marking</Label>
                <Switch
                  id="negativeMarking"
                  checked={formData.negativeMarking.enabled}
                  onCheckedChange={(checked) => handleNestedInputChange("negativeMarking", "enabled", checked)}
                />
              </div>
              {formData.negativeMarking.enabled && (
                <div className="pt-2">
                  <Label htmlFor="negativeValue">Negative Marks Value</Label>
                  <Select
                    value={formData.negativeMarking.value.toString()}
                    onValueChange={(value) =>
                      handleNestedInputChange("negativeMarking", "value", Number.parseFloat(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.25">0.25</SelectItem>
                      <SelectItem value="0.33">0.33</SelectItem>
                      <SelectItem value="0.5">0.5</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Exam Sections</h4>
              <Button size="sm" variant="outline" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" /> Add Section
              </Button>
            </div>

            {formData.sections.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No sections added yet</p>
                <p className="text-xs text-muted-foreground mb-4">Add sections to organize your exam questions</p>
                <Button size="sm" onClick={addSection}>
                  <Plus className="h-4 w-4 mr-1" /> Add First Section
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.sections.map((section, index) => (
                  <Card key={index}>
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Section {index + 1}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => removeSection(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label>Section Name</Label>
                          <Input
                            value={section.name}
                            onChange={(e) => handleSectionChange(index, "name", e.target.value)}
                            placeholder="e.g., Reasoning"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={section.duration}
                            onChange={(e) => handleSectionChange(index, "duration", Number.parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Questions</Label>
                          <Input
                            type="number"
                            min="1"
                            value={section.questions}
                            onChange={(e) => handleSectionChange(index, "questions", Number.parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Marks</Label>
                          <Input
                            type="number"
                            min="1"
                            value={section.marks}
                            onChange={(e) => handleSectionChange(index, "marks", Number.parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Negative Marks</Label>
                          <Select
                            value={section.negativeMarks.toString()}
                            onValueChange={(value) =>
                              handleSectionChange(index, "negativeMarks", Number.parseFloat(value))
                            }
                            disabled={!formData.negativeMarking.enabled}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0</SelectItem>
                              <SelectItem value="0.25">0.25</SelectItem>
                              <SelectItem value="0.33">0.33</SelectItem>
                              <SelectItem value="0.5">0.5</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
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
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., important, new pattern"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Exam Settings</h4>
              <div className="grid grid-cols-2 gap-y-4">
                <div className="flex items-center justify-between space-x-2 pr-4">
                  <Label htmlFor="allowReview">Allow Review</Label>
                  <Switch
                    id="allowReview"
                    checked={formData.settings.allowReview}
                    onCheckedChange={(checked) => handleNestedInputChange("settings", "allowReview", checked)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 pr-4">
                  <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                  <Switch
                    id="shuffleQuestions"
                    checked={formData.settings.shuffleQuestions}
                    onCheckedChange={(checked) => handleNestedInputChange("settings", "shuffleQuestions", checked)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 pr-4">
                  <Label htmlFor="showResults">Show Results</Label>
                  <Switch
                    id="showResults"
                    checked={formData.settings.showResults}
                    onCheckedChange={(checked) => handleNestedInputChange("settings", "showResults", checked)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 pr-4">
                  <Label htmlFor="allowPause">Allow Pause</Label>
                  <Switch
                    id="allowPause"
                    checked={formData.settings.allowPause}
                    onCheckedChange={(checked) => handleNestedInputChange("settings", "allowPause", checked)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 pr-4">
                  <Label htmlFor="autoSubmit">Auto Submit</Label>
                  <Switch
                    id="autoSubmit"
                    checked={formData.settings.autoSubmit}
                    onCheckedChange={(checked) => handleNestedInputChange("settings", "autoSubmit", checked)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 pr-4">
                  <Label htmlFor="showTimer">Show Timer</Label>
                  <Switch
                    id="showTimer"
                    checked={formData.settings.showTimer}
                    onCheckedChange={(checked) => handleNestedInputChange("settings", "showTimer", checked)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 pr-4">
                  <Label htmlFor="fullScreen">Full Screen Mode</Label>
                  <Switch
                    id="fullScreen"
                    checked={formData.settings.fullScreen}
                    onCheckedChange={(checked) => handleNestedInputChange("settings", "fullScreen", checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Visibility Settings</h4>
              <div className="grid grid-cols-1 gap-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="isPublished">Published</Label>
                    <p className="text-xs text-muted-foreground">Make this exam visible to users</p>
                  </div>
                  <Switch
                    id="isPublished"
                    checked={formData.visibility.isPublished}
                    onCheckedChange={(checked) => handleNestedInputChange("visibility", "isPublished", checked)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="isFree">Free Access</Label>
                    <p className="text-xs text-muted-foreground">Allow free users to take this exam</p>
                  </div>
                  <Switch
                    id="isFree"
                    checked={formData.visibility.isFree}
                    onCheckedChange={(checked) => handleNestedInputChange("visibility", "isFree", checked)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="subscriptionRequired">Subscription Required</Label>
                    <p className="text-xs text-muted-foreground">Require active subscription to access</p>
                  </div>
                  <Switch
                    id="subscriptionRequired"
                    checked={formData.visibility.subscriptionRequired}
                    onCheckedChange={(checked) =>
                      handleNestedInputChange("visibility", "subscriptionRequired", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={handleCreateExam}>Create Exam</Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Create and manage exam configurations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>Configure a new exam with sections and settings</DialogDescription>
            </DialogHeader>
            {renderCreateExamForm()}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Exams</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams..."
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
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.examName} onValueChange={(value) => setFilters({ ...filters, examName: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Exam Name" />
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
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getExamTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type
                      .split("-")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exam List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
            </div>
          ) : exams.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <p className="text-sm text-muted-foreground">{exam.examName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{exam.category?.icon}</span>
                          <span>{exam.category?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {exam.type
                            .split("-")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{exam.totalDuration}min</span>
                        </div>
                      </TableCell>
                      <TableCell>{exam.totalMarks}</TableCell>
                      <TableCell>{exam.sections?.length || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={exam.visibility?.isPublished ? "default" : "secondary"}>
                            {exam.visibility?.isPublished ? "Published" : "Draft"}
                          </Badge>
                          {!exam.visibility?.subscriptionRequired ? (<Badge variant="outline">Free</Badge>) : (<Badge variant="destructive">Paid</Badge>) }
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigateToQuestions(exam._id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Questions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(exam)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Exam
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(exam)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Exam
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Exams Found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.category !== "all" || filters.examName !== "all" || filters.type !== "all" || searchQuery
                  ? "No exams match your current filters"
                  : "Get started by creating your first exam"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Exam Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>Update exam configuration and settings</DialogDescription>
          </DialogHeader>
          {renderCreateExamForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the exam "{selectedExam?.title}" and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExam} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
