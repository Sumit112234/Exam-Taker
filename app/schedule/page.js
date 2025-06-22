"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, Plus, Edit, Trash2, Bell, Users, BookOpen, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function ExamSchedule() {
  const { toast } = useToast()
  const [scheduledExams, setScheduledExams] = useState([])
  const [availableExams, setAvailableExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState({
    examId: "",
    title: "",
    description: "",
    scheduledDate: new Date(),
    startTime: "",
    duration: "",
    maxAttempts: 1,
    isPublic: false,
    reminderEnabled: true,
    reminderTime: "30", // minutes before
  })

  useEffect(() => {
    fetchScheduledExams()
    fetchAvailableExams()
  }, [])

  const fetchScheduledExams = async () => {
    try {
      const response = await fetch("/api/schedule/exams")
      if (response.ok) {
        const data = await response.json()
        setScheduledExams(data)
      }
    } catch (error) {
      console.error("Error fetching scheduled exams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableExams = async () => {
    try {
      const response = await fetch("/api/exams?status=published")
      if (response.ok) {
        const data = await response.json()
        setAvailableExams(data.exams || [])
      }
    } catch (error) {
      console.error("Error fetching available exams:", error)
    }
  }

  const handleScheduleExam = async (e) => {
    e.preventDefault()

    try {
      const scheduleData = {
        ...formData,
        scheduledDateTime: new Date(`${format(formData.scheduledDate, "yyyy-MM-dd")}T${formData.startTime}:00`),
      }

      const response = await fetch("/api/schedule/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Exam scheduled successfully!",
        })
        setIsDialogOpen(false)
        fetchScheduledExams()
        resetForm()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to schedule exam",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule exam",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      const response = await fetch(`/api/schedule/exams/${scheduleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Scheduled exam deleted successfully!",
        })
        fetchScheduledExams()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete scheduled exam",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete scheduled exam",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      examId: "",
      title: "",
      description: "",
      scheduledDate: new Date(),
      startTime: "",
      duration: "",
      maxAttempts: 1,
      isPublic: false,
      reminderEnabled: true,
      reminderTime: "30",
    })
  }

  const getStatusBadge = (schedule) => {
    const now = new Date()
    const scheduledTime = new Date(schedule.scheduledDateTime)
    const endTime = new Date(scheduledTime.getTime() + schedule.duration * 60000)

    if (now < scheduledTime) {
      return <Badge variant="outline">Upcoming</Badge>
    } else if (now >= scheduledTime && now <= endTime) {
      return <Badge variant="default">Live</Badge>
    } else {
      return <Badge variant="secondary">Completed</Badge>
    }
  }

  const getUpcomingExams = () => {
    const now = new Date()
    return scheduledExams
      .filter((exam) => new Date(exam.scheduledDateTime) > now)
      .sort((a, b) => new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime))
      .slice(0, 5)
  }

  const getLiveExams = () => {
    const now = new Date()
    return scheduledExams.filter((exam) => {
      const startTime = new Date(exam.scheduledDateTime)
      const endTime = new Date(startTime.getTime() + exam.duration * 60000)
      return now >= startTime && now <= endTime
    })
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
          <h1 className="text-3xl font-bold tracking-tight">Exam Schedule</h1>
          <p className="text-muted-foreground">Schedule and manage your exams</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Exam</DialogTitle>
              <DialogDescription>Set up a new scheduled exam session</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleExam} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="examId">Select Exam</Label>
                  <Select
                    value={formData.examId}
                    onValueChange={(value) => setFormData({ ...formData, examId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an exam" />
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
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Morning Session"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about this exam session"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.scheduledDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduledDate ? format(formData.scheduledDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduledDate}
                        onSelect={(date) => setFormData({ ...formData, scheduledDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="120"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Select
                    value={formData.maxAttempts.toString()}
                    onValueChange={(value) => setFormData({ ...formData, maxAttempts: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Attempt</SelectItem>
                      <SelectItem value="2">2 Attempts</SelectItem>
                      <SelectItem value="3">3 Attempts</SelectItem>
                      <SelectItem value="0">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Reminder (minutes before)</Label>
                  <Select
                    value={formData.reminderTime}
                    onValueChange={(value) => setFormData({ ...formData, reminderTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="1440">1 day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule Exam</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="all">All Scheduled</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {getUpcomingExams().length > 0 ? (
            <div className="grid gap-4">
              {getUpcomingExams().map((exam) => (
                <Card key={exam._id} className="card-hover">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {exam.title}
                          {getStatusBadge(exam)}
                        </CardTitle>
                        <CardDescription>{exam.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteSchedule(exam._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{format(new Date(exam.scheduledDateTime), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{format(new Date(exam.scheduledDateTime), "p")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{exam.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{exam.registrations || 0} registered</span>
                      </div>
                    </div>
                    {exam.reminderEnabled && (
                      <Alert className="mt-4">
                        <Bell className="h-4 w-4" />
                        <AlertDescription>
                          Reminder set for {exam.reminderTime} minutes before the exam starts
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Exams</h3>
                <p className="text-muted-foreground mb-4">You don't have any exams scheduled for the near future.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Your First Exam
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          {getLiveExams().length > 0 ? (
            <div className="grid gap-4">
              {getLiveExams().map((exam) => (
                <Card key={exam._id} className="card-hover border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {exam.title}
                          <Badge variant="default" className="bg-green-600">
                            Live Now
                          </Badge>
                        </CardTitle>
                        <CardDescription>{exam.description}</CardDescription>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Take Exam
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Started at {format(new Date(exam.scheduledDateTime), "p")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{exam.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{exam.activeParticipants || 0} taking now</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Live Exams</h3>
                <p className="text-muted-foreground">There are no exams currently running.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {scheduledExams.map((exam) => (
              <Card key={exam._id} className="card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {exam.title}
                        {getStatusBadge(exam)}
                      </CardTitle>
                      <CardDescription>{exam.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSchedule(exam._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{format(new Date(exam.scheduledDateTime), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{format(new Date(exam.scheduledDateTime), "p")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{exam.registrations || 0} registered</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Calendar</CardTitle>
              <CardDescription>View all scheduled exams in calendar format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>
              <div className="mt-6">
                <h4 className="font-medium mb-4">
                  Exams on {selectedDate ? format(selectedDate, "PPP") : "selected date"}
                </h4>
                <div className="space-y-2">
                  {scheduledExams
                    .filter((exam) => {
                      if (!selectedDate) return false
                      const examDate = new Date(exam.scheduledDateTime)
                      return (
                        examDate.getDate() === selectedDate.getDate() &&
                        examDate.getMonth() === selectedDate.getMonth() &&
                        examDate.getFullYear() === selectedDate.getFullYear()
                      )
                    })
                    .map((exam) => (
                      <div key={exam._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(exam.scheduledDateTime), "p")} • {exam.duration} minutes
                          </p>
                        </div>
                        {getStatusBadge(exam)}
                      </div>
                    ))}
                  {scheduledExams.filter((exam) => {
                    if (!selectedDate) return false
                    const examDate = new Date(exam.scheduledDateTime)
                    return (
                      examDate.getDate() === selectedDate.getDate() &&
                      examDate.getMonth() === selectedDate.getMonth() &&
                      examDate.getFullYear() === selectedDate.getFullYear()
                    )
                  }).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No exams scheduled for this date</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
