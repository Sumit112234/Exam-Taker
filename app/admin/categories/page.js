"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { useToast } from "@/components/ui/use-toast"
import { Plus, MoreVertical, Pencil, Trash2, FolderOpen, BookOpen, FileText, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    icon: "📚",
    color: "#3B82F6",
    exams: []
  })

  const [newExam, setNewExam] = useState({
    name: "",
    code: "",
    description: "",
    types: ["mock", "mini-mock", "section-wise"],
    isActive: true
  })

  const examTypes = ["mock", "mini-mock", "section-wise", "chapter-wise", "practice"]

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories([...categories, newCategory])
        setIsCreateDialogOpen(false)
        resetForm()
        toast({
          title: "Success",
          description: "Category created successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to create category")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateCategory = async () => {
    try {
      const response = await fetch(`/api/admin/categories/${selectedCategory._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories(categories.map((cat) => (cat._id === updatedCategory._id ? updatedCategory : cat)))
        setIsEditDialogOpen(false)
        resetForm()
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to update category")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async () => {
    try {
      const response = await fetch(`/api/admin/categories/${selectedCategory._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCategories(categories.filter((cat) => cat._id !== selectedCategory._id))
        setIsDeleteDialogOpen(false)
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete category")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      code: category.code,
      description: category.description || "",
      icon: category.icon || "📚",
      color: category.color || "#3B82F6",
      exams: category.exams || []
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      icon: "📚",
      color: "#3B82F6",
      exams: []
    })
    setNewExam({
      name: "",
      code: "",
      description: "",
      types: ["mock", "mini-mock", "section-wise"],
      isActive: true
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }))
  }

  const handleExamInputChange = (e) => {
    const { name, value } = e.target
    setNewExam((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }))
  }

  const handleExamTypeToggle = (type, checked) => {
    setNewExam((prev) => ({
      ...prev,
      types: checked 
        ? [...prev.types, type]
        : prev.types.filter(t => t !== type)
    }))
  }

  const addExamToCategory = () => {
    if (!newExam.name || !newExam.code) {
      toast({
        title: "Error",
        description: "Exam name and code are required",
        variant: "destructive",
      })
      return
    }

    const examToAdd = {
      ...newExam,
      sections: [] // Initialize with empty sections
    }

    setFormData(prev => ({
      ...prev,
      exams: [...prev.exams, examToAdd]
    }))

    setNewExam({
      name: "",
      code: "",
      description: "",
      types: ["mock", "mini-mock", "section-wise"],
      isActive: true
    })

    toast({
      title: "Success",
      description: "Exam added to category",
    })
  }

  const removeExamFromCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      exams: prev.exams.filter((_, i) => i !== index)
    }))
  }

  const navigateToExams = (categoryId) => {
    router.push(`/admin/exams?category=${categoryId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage exam categories and their associated exams</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>Add a new exam category and optionally add exams to it</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="category" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="category">Category Details</TabsTrigger>
                <TabsTrigger value="exams">Add Exams</TabsTrigger>
              </TabsList>
              
              <TabsContent value="category" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Banking"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Category Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g., BANK"
                      value={formData.code}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Input id="icon" name="icon" placeholder="📚" value={formData.icon} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={handleInputChange}
                        name="color"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe this category..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="exams" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Add Exam to Category</h3>
                    <Badge variant="outline">{formData.exams.length} Exams Added</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exam-name">Exam Name</Label>
                      <Input
                        id="exam-name"
                        name="name"
                        placeholder="e.g., IBPS PO"
                        value={newExam.name}
                        onChange={handleExamInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exam-code">Exam Code</Label>
                      <Input
                        id="exam-code"
                        name="code"
                        placeholder="e.g., IBPSPO"
                        value={newExam.code}
                        onChange={handleExamInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="exam-description">Exam Description</Label>
                    <Textarea
                      id="exam-description"
                      name="description"
                      placeholder="Describe this exam..."
                      value={newExam.description}
                      onChange={handleExamInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Exam Types</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {examTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={newExam.types.includes(type)}
                            onCheckedChange={(checked) => handleExamTypeToggle(type, checked)}
                          />
                          <Label htmlFor={type} className="text-sm capitalize">
                            {type.replace('-', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={addExamToCategory} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Exam
                  </Button>
                  
                  {formData.exams.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label>Added Exams</Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {formData.exams.map((exam, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{exam.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {exam.code} • {exam.types.join(', ')}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExamFromCategory(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details and manage exams</DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="category" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="category">Category Details</TabsTrigger>
              <TabsTrigger value="exams">Manage Exams</TabsTrigger>
            </TabsList>
            
            <TabsContent value="category" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Category Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Category Code</Label>
                  <Input
                    id="edit-code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-icon">Icon</Label>
                  <Input
                    id="edit-icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="edit-color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={handleInputChange}
                      name="color"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="exams" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Add New Exam</h3>
                  <Badge variant="outline">{formData.exams.length} Exams Total</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-exam-name">Exam Name</Label>
                    <Input
                      id="edit-exam-name"
                      name="name"
                      placeholder="e.g., IBPS PO"
                      value={newExam.name}
                      onChange={handleExamInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-exam-code">Exam Code</Label>
                    <Input
                      id="edit-exam-code"
                      name="code"
                      placeholder="e.g., IBPSPO"
                      value={newExam.code}
                      onChange={handleExamInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-exam-description">Exam Description</Label>
                  <Textarea
                    id="edit-exam-description"
                    name="description"
                    placeholder="Describe this exam..."
                    value={newExam.description}
                    onChange={handleExamInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Exam Types</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {examTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${type}`}
                          checked={newExam.types.includes(type)}
                          onCheckedChange={(checked) => handleExamTypeToggle(type, checked)}
                        />
                        <Label htmlFor={`edit-${type}`} className="text-sm capitalize">
                          {type.replace('-', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={addExamToCategory} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exam
                </Button>
                
                {formData.exams.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Current Exams</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {formData.exams.map((exam, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{exam.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {exam.code} • {exam.types.join(', ')}
                              </div>
                              {exam.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {exam.description}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExamFromCategory(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the category "{selectedCategory?.name}" and all associated data. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Categories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <Card key={category._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.icon}
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(category)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{category.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {category.exams?.length || 0} Exams
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {Math.floor(Math.random() * 500)} Questions
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigateToExams(category._id)}>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    View Exams
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Categories Found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first exam category</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}