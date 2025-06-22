"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import Link from "next/link"

export default function CreateQuestion() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [questionData, setQuestionData] = useState({
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
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (questionData.category) {
      const category = categories.find((cat) => cat._id === questionData.category)
      setSelectedCategory(category)
      setSelectedExam(null)
      setSelectedSection(null)
      setQuestionData((prev) => ({ ...prev, examName: "", sectionName: "", subject: "" }))
    }
  }, [questionData.category, categories])

  useEffect(() => {
    if (questionData.examName && selectedCategory) {
      const exam = selectedCategory.exams.find((exam) => exam.name === questionData.examName)
      setSelectedExam(exam)
      setSelectedSection(null)
      setQuestionData((prev) => ({ ...prev, sectionName: "", subject: "" }))
    }
  }, [questionData.examName, selectedCategory])

  useEffect(() => {
    if (questionData.sectionName && selectedExam) {
      const section = selectedExam.sections.find((section) => section.name === questionData.sectionName)
      setSelectedSection(section)
      setQuestionData((prev) => ({ ...prev, subject: "" }))
    }
  }, [questionData.sectionName, selectedExam])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleInputChange = (field, value) => {
    setQuestionData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleOptionChange = (index, value, isHindi = false) => {
    const optionsField = isHindi ? "optionsHindi" : "options"
    setQuestionData((prev) => ({
      ...prev,
      [optionsField]: prev[optionsField].map((option, i) => (i === index ? value : option)),
    }))
  }

  const addOption = () => {
    if (questionData.options.length < 6) {
      setQuestionData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
        optionsHindi: [...prev.optionsHindi, ""],
      }))
    }
  }

  const removeOption = (index) => {
    if (questionData.options.length > 2) {
      setQuestionData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
        optionsHindi: prev.optionsHindi.filter((_, i) => i !== index),
      }))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !questionData.tags.includes(newTag.trim())) {
      setQuestionData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setQuestionData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // Validate required fields
      if (
        !questionData.category ||
        !questionData.examName ||
        !questionData.sectionName ||
        !questionData.subject ||
        !questionData.questionText ||
        !questionData.correctAnswer
      ) {
        alert("Please fill in all required fields")
        return
      }

      // Filter out empty options
      const filteredOptions = questionData.options.filter((option) => option.trim() !== "")
      const filteredOptionsHindi = questionData.optionsHindi.filter((option) => option.trim() !== "")

      const submitData = {
        ...questionData,
        options: filteredOptions,
        optionsHindi: filteredOptionsHindi,
      }

      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const createdQuestion = await response.json()
        router.push("/admin/question-bank")
      } else {
        const error = await response.json()
        alert(error.message || "Error creating question")
      }
    } catch (error) {
      console.error("Error creating question:", error)
      alert("Error creating question")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/question-bank">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Question</h1>
            <p className="text-muted-foreground">Add a new question to the question bank</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Question"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Question Classification</CardTitle>
              <CardDescription>Categorize your question for better organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={questionData.category} onValueChange={(value) => handleInputChange("category", value)}>
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
                    value={questionData.examName}
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
                    value={questionData.sectionName}
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
                    value={questionData.subject}
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
                    value={questionData.topic}
                    onChange={(e) => handleInputChange("topic", e.target.value)}
                    placeholder="Enter topic"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapter</Label>
                  <Input
                    id="chapter"
                    value={questionData.chapter}
                    onChange={(e) => handleInputChange("chapter", e.target.value)}
                    placeholder="Enter chapter"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="type">Question Type</Label>
                  <Select value={questionData.type} onValueChange={(value) => handleInputChange("type", value)}>
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
                    value={questionData.difficulty}
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

                <div className="space-y-2">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={questionData.marks}
                    onChange={(e) => handleInputChange("marks", Number.parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                  value={questionData.questionText}
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
                  value={questionData.questionTextHindi}
                  onChange={(e) => handleInputChange("questionTextHindi", e.target.value)}
                  placeholder="प्रश्न का हिंदी अनुवाद..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionImage">Question Image URL</Label>
                <Input
                  id="questionImage"
                  value={questionData.questionImage}
                  onChange={(e) => handleInputChange("questionImage", e.target.value)}
                  placeholder="https://example.com/question-image.jpg"
                />
              </div>

              {(questionData.type === "data-interpretation" || questionData.passage) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="passage">Passage/Data</Label>
                    <Textarea
                      id="passage"
                      value={questionData.passage}
                      onChange={(e) => handleInputChange("passage", e.target.value)}
                      placeholder="Enter passage or data for interpretation..."
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passageImage">Passage Image URL</Label>
                    <Input
                      id="passageImage"
                      value={questionData.passageImage}
                      onChange={(e) => handleInputChange("passageImage", e.target.value)}
                      placeholder="https://example.com/passage-image.jpg"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {questionData.type === "mcq" && (
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Answer Options</CardTitle>
                <CardDescription>Add multiple choice options for the question</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questionData.options.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="min-w-0">Option {String.fromCharCode(65 + index)}</Label>
                      {questionData.options.length > 2 && (
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
                        value={questionData.optionsHindi[index] || ""}
                        onChange={(e) => handleOptionChange(index, e.target.value, true)}
                        placeholder={`विकल्प ${String.fromCharCode(65 + index)} (Hindi)`}
                      />
                    </div>
                  </div>
                ))}

                {questionData.options.length < 6 && (
                  <Button type="button" variant="outline" onClick={addOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                )}

                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer *</Label>
                  <Select
                    value={questionData.correctAnswer}
                    onValueChange={(value) => handleInputChange("correctAnswer", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionData.options.map(
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

          {questionData.type !== "mcq" && (
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
                    value={questionData.correctAnswer}
                    onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                    placeholder="Enter the correct answer..."
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

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
                  value={questionData.explanation}
                  onChange={(e) => handleInputChange("explanation", e.target.value)}
                  placeholder="Explain why this is the correct answer..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanationHindi">Explanation (Hindi)</Label>
                <Textarea
                  id="explanationHindi"
                  value={questionData.explanationHindi}
                  onChange={(e) => handleInputChange("explanationHindi", e.target.value)}
                  placeholder="उत्तर की व्याख्या..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanationImage">Explanation Image URL</Label>
                <Input
                  id="explanationImage"
                  value={questionData.explanationImage}
                  onChange={(e) => handleInputChange("explanationImage", e.target.value)}
                  placeholder="https://example.com/explanation-image.jpg"
                />
              </div>
            </CardContent>
          </Card>

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
                {questionData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Question Settings</CardTitle>
              <CardDescription>Configure scoring and difficulty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marks">Positive Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={questionData.marks}
                  onChange={(e) => handleInputChange("marks", Number.parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="negativeMarks">Negative Marks</Label>
                <Input
                  id="negativeMarks"
                  type="number"
                  step="0.25"
                  min="0"
                  max="5"
                  value={questionData.negativeMarks}
                  onChange={(e) => handleInputChange("negativeMarks", Number.parseFloat(e.target.value))}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Question Summary:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{questionData.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <Badge
                      variant={
                        questionData.difficulty === "Easy"
                          ? "outline"
                          : questionData.difficulty === "Medium"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {questionData.difficulty}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marks:</span>
                    <span>
                      +{questionData.marks} / -{questionData.negativeMarks}
                    </span>
                  </div>
                  {questionData.type === "mcq" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Options:</span>
                      <span>{questionData.options.filter((opt) => opt.trim()).length}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your question will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Question Preview</h4>
                  <Badge variant="outline">{questionData.difficulty}</Badge>
                </div>

                {questionData.questionText && <p className="text-sm">{questionData.questionText}</p>}

                {questionData.type === "mcq" && questionData.options.some((opt) => opt.trim()) && (
                  <div className="space-y-2">
                    {questionData.options.map(
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
                  <span>Marks: +{questionData.marks}</span>
                  <span>Negative: -{questionData.negativeMarks}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
