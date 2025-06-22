"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Eye, Plus, X } from "lucide-react"
import Link from "next/link"

export default function CreateTest() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    type: "mock",
    category: "Banking",
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
    scheduledFor: "",
    validFrom: "",
    validUntil: "",
  })
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (testData.category) {
      const category = categories.find((cat) => cat._id === testData.category)
      setSelectedCategory(category)
    }
  }, [testData.category, categories])

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
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setTestData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setTestData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !testData.tags.includes(newTag.trim())) {
      setTestData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTestData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (isDraft = false) => {
    try {
      setIsLoading(true)

      const submitData = {
        ...testData,
        isPublished: !isDraft,
      }

      const response = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const createdTest = await response.json()
        router.push(`/admin/tests/${createdTest._id}`)
      } else {
        console.error("Error creating test")
      }
    } catch (error) {
      console.error("Error creating test:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tests">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
            <p className="text-muted-foreground">Set up a new test with questions and configurations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Publish Test
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure the basic details of your test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title *</Label>
                <Input
                  id="title"
                  value={testData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter test title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={testData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what this test covers..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Test Type *</Label>
                  <Select value={testData.type} onValueChange={(value) => handleInputChange("type", value)}>
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

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={testData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={testData.category} onValueChange={(value) => handleInputChange("category", value)}>
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
                  <Label htmlFor="subject">Subject *</Label>
                  {selectedCategory ? (
                    <Select value={testData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.subjects.map((subject, index) => (
                          <SelectItem key={index} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={testData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Enter subject"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapter</Label>
                  <Input
                    id="chapter"
                    value={testData.chapter}
                    onChange={(e) => handleInputChange("chapter", e.target.value)}
                    placeholder="Enter chapter"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Set up timing, scoring, and question parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="300"
                    value={testData.duration}
                    onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalQuestions">Total Questions *</Label>
                  <Input
                    id="totalQuestions"
                    type="number"
                    min="1"
                    value={testData.totalQuestions}
                    onChange={(e) => handleInputChange("totalQuestions", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks *</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min="1"
                    value={testData.totalMarks}
                    onChange={(e) => handleInputChange("totalMarks", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passingMarks">Passing Marks (%)</Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    min="0"
                    max="100"
                    value={testData.passingMarks}
                    onChange={(e) => handleInputChange("passingMarks", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="1"
                    value={testData.maxAttempts}
                    onChange={(e) => handleInputChange("maxAttempts", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Negative Marking</Label>
                    <p className="text-sm text-muted-foreground">Enable negative marking for incorrect answers</p>
                  </div>
                  <Switch
                    checked={testData.negativeMarking.enabled}
                    onCheckedChange={(checked) => handleInputChange("negativeMarking.enabled", checked)}
                  />
                </div>

                {testData.negativeMarking.enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="negativeValue">Negative Marks per Wrong Answer</Label>
                    <Input
                      id="negativeValue"
                      type="number"
                      step="0.25"
                      min="0"
                      max="5"
                      value={testData.negativeMarking.value}
                      onChange={(e) => handleInputChange("negativeMarking.value", Number.parseFloat(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Instructions & Tags</CardTitle>
              <CardDescription>Add instructions and tags for better organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions">Test Instructions</Label>
                <Textarea
                  id="instructions"
                  value={testData.instructions}
                  onChange={(e) => handleInputChange("instructions", e.target.value)}
                  placeholder="Enter test instructions..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {testData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {testData.type === "daily-quiz" && (
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Scheduling</CardTitle>
                <CardDescription>Set up scheduling for daily quiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledFor">Scheduled Date</Label>
                    <Input
                      id="scheduledFor"
                      type="date"
                      value={testData.scheduledFor}
                      onChange={(e) => handleInputChange("scheduledFor", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={testData.validUntil}
                      onChange={(e) => handleInputChange("validUntil", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Test Settings</CardTitle>
              <CardDescription>Configure test behavior and visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Free Test</Label>
                    <p className="text-sm text-muted-foreground">Make this test available to all users</p>
                  </div>
                  <Switch
                    checked={testData.isFree}
                    onCheckedChange={(checked) => handleInputChange("isFree", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Results</Label>
                    <p className="text-sm text-muted-foreground">Display results after test completion</p>
                  </div>
                  <Switch
                    checked={testData.showResults}
                    onCheckedChange={(checked) => handleInputChange("showResults", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Solutions</Label>
                    <p className="text-sm text-muted-foreground">Show correct answers and explanations</p>
                  </div>
                  <Switch
                    checked={testData.showSolutions}
                    onCheckedChange={(checked) => handleInputChange("showSolutions", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shuffle Questions</Label>
                    <p className="text-sm text-muted-foreground">Randomize question order for each attempt</p>
                  </div>
                  <Switch
                    checked={testData.shuffleQuestions}
                    onCheckedChange={(checked) => handleInputChange("shuffleQuestions", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Review</Label>
                    <p className="text-sm text-muted-foreground">Let users review answers before submission</p>
                  </div>
                  <Switch
                    checked={testData.allowReview}
                    onCheckedChange={(checked) => handleInputChange("allowReview", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Test Preview</CardTitle>
              <CardDescription>Preview of your test configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{testData.type}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{testData.duration} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questions:</span>
                  <span>{testData.totalQuestions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Marks:</span>
                  <span>{testData.totalMarks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Passing:</span>
                  <span>{testData.passingMarks}%</span>
                </div>
                {testData.negativeMarking.enabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Negative Marking:</span>
                    <span>-{testData.negativeMarking.value}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Attempts:</span>
                  <span>{testData.maxAttempts}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${testData.isFree ? "bg-green-500" : "bg-gray-300"}`} />
                    <span>Free Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${testData.showResults ? "bg-green-500" : "bg-gray-300"}`} />
                    <span>Show Results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${testData.showSolutions ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <span>Show Solutions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${testData.allowReview ? "bg-green-500" : "bg-gray-300"}`} />
                    <span>Allow Review</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>What to do after creating the test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <span>Add questions to your test</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <span>Review and test the configuration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <span>Publish when ready</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
