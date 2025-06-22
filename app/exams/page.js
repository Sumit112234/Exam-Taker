"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Search, BookOpen, Users, Award, Play, Eye, Lock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"


// need to fetch result with resultId and exam id.
export default function ExamsPage() {
  const { user } = useAuth()
  const [examTypes, setExamTypes] = useState([])
  const [exams, setExams] = useState([])
  const [resultIds, setResultIds] = useState([])
  const [mockTests, setMockTests] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [filteredMockTests, setFilteredMockTests] = useState([])
  const [filters, setFilters] = useState({
    examType: "all",
    difficulty: "all",
    type: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("exams")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterData()
  }, [exams, mockTests, filters, searchQuery])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch exam types
      // const examTypesResponse = await fetch("/api/exam-types")
      // if (examTypesResponse.ok) {
      //   const examTypesData = await examTypesResponse.json()
      //   setExamTypes(examTypesData)
      // }
      const resultResopnse = await fetch("/api/results/exam")
      if (resultResopnse.ok) {
        const resultData = await resultResopnse.json()
        console.log("Fetched results:", resultData)

        const resultMap = {}
        resultData.results?.forEach(({ examId, resultId }) => {
          resultMap[examId] = resultId
        })

        setResultIds(resultMap)
        // setResultIds(resultData.examIds || [])


      }

      // Fetch exams
      const examsResponse = await fetch("/api/exams")
      if (examsResponse.ok) {
        const examsData = await examsResponse.json()
        console.log("Fetched exams:", examsData)
        setExams(examsData)


      }




      // Fetch mock tests
      // const mockTestsResponse = await fetch("/api/mock-tests")
      // if (mockTestsResponse.ok) {
      //   const mockTestsData = await mockTestsResponse.json()
      //   setMockTests(mockTestsData)
      // }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterData = () => {
    // Filter exams
    console.log( exams , filters, searchQuery)
    

    const filteredExamsData =  exams?.exams?.filter((exam) => {
      const matchesExamType = (filters.type === "all" || exam.type === filters.type) && (filters.difficulty === "all" || exam.difficulty === filters.difficulty) && (filters.examType === "all" || exam.examName
 === filters.examType)

      const matchesSearch =
        searchQuery === '' ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.type.toLowerCase().includes(searchQuery.toLowerCase())

        console.log(matchesExamType, matchesSearch, exam.isActive)
      // Check if exam is active

      return matchesExamType && matchesSearch && exam.isActive
    })

    console.log("Filtered Exams:", filteredExamsData)

    // Filter mock tests
    const filteredMockTestsData = mockTests.filter((mockTest) => {
      const matchesExamType = filters.examType === "all" || mockTest.examId?.examType === filters.examType
      const matchesDifficulty = filters.difficulty === "all" || mockTest.difficulty === filters.difficulty
      const matchesType = filters.type === "all" || mockTest.type === filters.type
      const matchesSearch = !searchQuery || mockTest.title.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesExamType && matchesDifficulty && matchesType && matchesSearch && mockTest.isActive
    })

    // console.log("Filtered Exams:", filteredExamsData)
    // console.log("Filtered Mock Tests:", filteredMockTestsData)
    // Update state with filtered data
    setFilteredExams(filteredExamsData ? filteredExamsData : [])
    setFilteredMockTests(filteredMockTestsData)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Exam Portal
          </h1>
          <p className="text-muted-foreground mt-2">Choose from our comprehensive collection of exams and mock tests</p>
        </div>

        {/* Exam Types Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {examTypes.map((examType) => (
            <Card key={examType._id} className="card-hover border-l-4" style={{ borderLeftColor: examType.color }}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{examType.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{examType.name}</CardTitle>
                    <CardDescription className="text-sm">{examType.code}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span>Exams: {exams.filter((e) => e.examType._id === examType._id).length}</span>
                  <span>Mock Tests: {mockTests.filter((m) => m.examId?.examType === examType._id).length}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6 card-hover">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams and tests..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {console.log(examTypes, exams)}
              <Select value={filters.examType} onValueChange={(value) => handleFilterChange("examType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exam Types</SelectItem>
                  {exams.filters.examNames.map((type,id) => (
                    <SelectItem key={id} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                    {exams.filters.difficulties.map((type,id) => (
                    <SelectItem key={id} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  {/* <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem> */}
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Test Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                    {exams.filters.types.map((type,id) => (
                    <SelectItem key={id} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  {/* <SelectItem value="full">Full Tests</SelectItem>
                  <SelectItem value="mini">Mini Tests</SelectItem>
                  <SelectItem value="sectional">Sectional Tests</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Full Exams ({filteredExams.length})
            </TabsTrigger>
            <TabsTrigger value="mock-tests" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Mock Tests ({filteredMockTests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  // {console.log(exam)}
                  <Card key={exam._id} className="overflow-hidden card-hover group">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                            {exam.title}
                          </CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2">
                            {/* {console.log(exam)} */}
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {exam.type}
                            </span>
                          </CardDescription>
                        </div>
                        {!exam?.visibility?.isFree && user?.subscription?.status === "inactive" && <Badge variant="secondary">Premium</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.totalDuration} mins</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.totalQuestions} questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.totalMarks} marks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.attempts} attempts</span>
                          </div>
                        </div>

                        {exam.sections && exam.sections.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Sections:</p>
                            <div className="flex flex-wrap gap-1">
                              {exam.sections.slice(0, 3).map((section, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {section.name}
                                </Badge>
                              ))}
                              {exam.sections.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{exam.sections.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
<CardFooter className="flex gap-2">
{exam.visibility.subscriptionRequired ? (
  <Link href="/subscriptions" className="flex-1">
    <Button variant="destructive" className="w-full">
      <Lock className="mr-2 h-4 w-4" />
      Unlock Now
    </Button>
  </Link>
) : resultIds[exam._id] ? (
  <Link href={`/results/${resultIds[exam._id]}`} className="flex-1">
    <Button variant="outline" className="w-full">
      <Eye className="mr-2 h-4 w-4" />
      View Result
    </Button>
  </Link>
) : (
  <>
    <Link href={`/exams/${exam._id}`} className="flex-1">
      <Button variant="outline" className="w-full">
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </Button>
    </Link>
    <Link href={`/exams/${exam._id}/start`} className="flex-1">
      <Button className="w-full">
        <Play className="mr-2 h-4 w-4" />
        Start Exam
      </Button>
    </Link>
  </>
)}


</CardFooter>

                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No exams found matching your criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mock-tests" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMockTests.length > 0 ? (
                filteredMockTests.map((mockTest) => (
                  <Card key={mockTest._id} className="overflow-hidden card-hover group">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                            {mockTest.title}
                          </CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2">
                            <Badge
                              variant={
                                mockTest.type === "full"
                                  ? "default"
                                  : mockTest.type === "mini"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {mockTest.type === "full"
                                ? "Full Test"
                                : mockTest.type === "mini"
                                  ? "Mini Test"
                                  : "Sectional"}
                            </Badge>
                            <Badge
                              variant={
                                mockTest.difficulty === "Easy"
                                  ? "outline"
                                  : mockTest.difficulty === "Medium"
                                    ? "secondary"
                                    : "default"
                              }
                              className="text-xs"
                            >
                              {mockTest.difficulty}
                            </Badge>
                          </CardDescription>
                        </div>
                        {!mockTest.isFree && !user?.subscription?.status && <Badge variant="secondary">Premium</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{mockTest.duration} mins</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{mockTest.totalQuestions} questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span>{mockTest.totalMarks} marks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{mockTest.attempts} attempts</span>
                          </div>
                        </div>

                        {mockTest.sections && mockTest.sections.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Sections:</p>
                            <div className="flex flex-wrap gap-1">
                              {mockTest.sections.slice(0, 2).map((section, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {section.name}
                                </Badge>
                              ))}
                              {mockTest.sections.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{mockTest.sections.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Link href={`/mock-tests/${mockTest._id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/mock-tests/${mockTest._id}/start`} className="flex-1">
                        <Button className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Start Test
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No mock tests found matching your criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Clock, Search, BookOpen, Users, Award, Play, Eye, Lock, Loader2 } from "lucide-react"
// import { useAuth } from "@/contexts/AuthContext"

// // Mock API data - in a real app, this would come from actual API calls
// const mockExamTypes = [
//   { _id: "1", name: "JEE Main", code: "JEE", icon: "📘", color: "#3b82f6" },
//   { _id: "2", name: "NEET UG", code: "NEET", icon: "🧪", color: "#10b981" },
//   { _id: "3", name: "UPSC", code: "UPSC", icon: "📚", color: "#8b5cf6" },
//   { _id: "4", name: "GATE", code: "GATE", icon: "🔬", color: "#ec4899" },
// ]

// const mockExams = [
//   {
//     _id: "e1",
//     title: "JEE Main 2023 Paper 1",
//     examType: { _id: "1", name: "JEE Main" },
//     type: "Full Test",
//     totalDuration: 180,
//     totalQuestions: 75,
//     totalMarks: 300,
//     attempts: 12500,
//     isActive: true,
//     visibility: { isFree: true, subscriptionRequired: false },
//     sections: [
//       { name: "Physics", questions: 25 },
//       { name: "Chemistry", questions: 25 },
//       { name: "Mathematics", questions: 25 }
//     ]
//   },
//   {
//     _id: "e2",
//     title: "NEET UG 2023 Paper",
//     examType: { _id: "2", name: "NEET UG" },
//     type: "Full Test",
//     totalDuration: 200,
//     totalQuestions: 180,
//     totalMarks: 720,
//     attempts: 9800,
//     isActive: true,
//     visibility: { isFree: false, subscriptionRequired: true },
//     sections: [
//       { name: "Physics", questions: 45 },
//       { name: "Chemistry", questions: 45 },
//       { name: "Biology", questions: 90 }
//     ]
//   },
//   {
//     _id: "e3",
//     title: "UPSC Prelims 2023",
//     examType: { _id: "3", name: "UPSC" },
//     type: "Objective",
//     totalDuration: 120,
//     totalQuestions: 100,
//     totalMarks: 200,
//     attempts: 5600,
//     isActive: true,
//     visibility: { isFree: true, subscriptionRequired: false },
//     sections: [
//       { name: "General Studies I", questions: 100 }
//     ]
//   },
//   {
//     _id: "e4",
//     title: "GATE Computer Science 2023",
//     examType: { _id: "4", name: "GATE" },
//     type: "Full Test",
//     totalDuration: 180,
//     totalQuestions: 65,
//     totalMarks: 100,
//     attempts: 3200,
//     isActive: true,
//     visibility: { isFree: false, subscriptionRequired: true },
//     sections: [
//       { name: "Technical", questions: 55 },
//       { name: "General Aptitude", questions: 10 }
//     ]
//   },
// ]

// const mockMockTests = [
//   {
//     _id: "m1",
//     title: "JEE Main Physics Mock Test",
//     examType: "1",
//     difficulty: "Medium",
//     type: "sectional",
//     duration: 60,
//     totalQuestions: 25,
//     totalMarks: 100,
//     attempts: 4500,
//     isActive: true,
//     isFree: true,
//     sections: [
//       { name: "Mechanics", questions: 10 },
//       { name: "Electromagnetism", questions: 10 },
//       { name: "Modern Physics", questions: 5 }
//     ]
//   },
//   {
//     _id: "m2",
//     title: "NEET Biology Practice Test",
//     examType: "2",
//     difficulty: "Hard",
//     type: "sectional",
//     duration: 90,
//     totalQuestions: 90,
//     totalMarks: 360,
//     attempts: 3200,
//     isActive: true,
//     isFree: false,
//     sections: [
//       { name: "Botany", questions: 45 },
//       { name: "Zoology", questions: 45 }
//     ]
//   },
//   {
//     _id: "m3",
//     title: "UPSC Current Affairs Mini Test",
//     examType: "3",
//     difficulty: "Easy",
//     type: "mini",
//     duration: 30,
//     totalQuestions: 20,
//     totalMarks: 40,
//     attempts: 2100,
//     isActive: true,
//     isFree: true,
//     sections: [
//       { name: "Current Affairs", questions: 20 }
//     ]
//   },
// ]

// const mockResults = {
//   results: [
//     { examId: "e1", resultId: "r1" },
//     { examId: "e3", resultId: "r3" }
//   ]
// }

// export default function ExamsPage() {
//   const { user } = useAuth()
//   const [examTypes, setExamTypes] = useState([])
//   const [exams, setExams] = useState([])
//   const [resultIds, setResultIds] = useState({})
//   const [mockTests, setMockTests] = useState([])
//   const [filteredExams, setFilteredExams] = useState([])
//   const [filteredMockTests, setFilteredMockTests] = useState([])
//   const [filters, setFilters] = useState({
//     examType: "all",
//     difficulty: "all",
//     type: "all",
//   })
//   const [searchQuery, setSearchQuery] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState("exams")

//   useEffect(() => {
//     fetchData()
//   }, [])

//   useEffect(() => {
//     filterData()
//   }, [exams, mockTests, filters, searchQuery])

//   const fetchData = async () => {
//     try {
//       setIsLoading(true)

//       // Simulate API calls with timeouts
//       setTimeout(() => {
//         setExamTypes(mockExamTypes)
//       }, 300)

//       setTimeout(() => {
//         setResultIds(mockResults.results.reduce((acc, result) => {
//           acc[result.examId] = result.resultId
//           return acc
//         }, {}))
//       }, 400)

//       setTimeout(() => {
//         setExams(mockExams)
//       }, 500)

//       setTimeout(() => {
//         setMockTests(mockMockTests)
//       }, 600)

//     } catch (error) {
//       console.error("Error fetching data:", error)
//     } finally {
//       setTimeout(() => {
//         setIsLoading(false)
//       }, 800)
//     }
//   }

//   const filterData = () => {
//     // Filter exams
//     const filteredExamsData = exams.filter((exam) => {
//       const matchesExamType = filters.examType === "all" || exam.examType._id === filters.examType
//       const matchesSearch =
//         !searchQuery ||
//         exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         exam.type.toLowerCase().includes(searchQuery.toLowerCase())

//       return matchesExamType && matchesSearch && exam.isActive
//     })

//     // Filter mock tests
//     const filteredMockTestsData = mockTests.filter((mockTest) => {
//       const matchesExamType = filters.examType === "all" || mockTest.examType === filters.examType
//       const matchesDifficulty = filters.difficulty === "all" || mockTest.difficulty === filters.difficulty
//       const matchesType = filters.type === "all" || mockTest.type === filters.type
//       const matchesSearch = !searchQuery || mockTest.title.toLowerCase().includes(searchQuery.toLowerCase())

//       return matchesExamType && matchesDifficulty && matchesType && matchesSearch && mockTest.isActive
//     })

//     setFilteredExams(filteredExamsData)
//     setFilteredMockTests(filteredMockTestsData)
//   }

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }))
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
//       <div className="container py-6 px-4 sm:px-6">
//         <div className="mb-8 text-center">
//           <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//             Exam Portal
//           </h1>
//           <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
//             Choose from our comprehensive collection of exams and mock tests to enhance your preparation
//           </p>
//         </div>

//         {/* Exam Types Overview */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
//           {examTypes.map((examType) => (
//             <Card 
//               key={examType._id} 
//               className="border-l-4 hover:shadow-lg transition-shadow duration-300"
//               style={{ borderLeftColor: examType.color }}
//             >
//               <CardHeader className="pb-3">
//                 <div className="flex items-center gap-3">
//                   <span className="text-2xl">{examType.icon}</span>
//                   <div>
//                     <CardTitle className="text-lg text-gray-800">{examType.name}</CardTitle>
//                     <CardDescription className="text-sm text-gray-600">{examType.code}</CardDescription>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-700">Exams: {exams.filter((e) => e.examType._id === examType._id).length}</span>
//                   <span className="text-gray-700">Mock Tests: {mockTests.filter((m) => m.examType === examType._id).length}</span>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Filters */}
//         <Card className="mb-6 shadow-sm border border-blue-100">
//           <CardContent className="pt-6 pb-4">
//             <div className="grid gap-4 md:grid-cols-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <Input
//                   placeholder="Search exams and tests..."
//                   className="pl-10 border border-gray-300 rounded-lg"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <Select value={filters.examType} onValueChange={(value) => handleFilterChange("examType", value)}>
//                 <SelectTrigger className="border border-gray-300 rounded-lg">
//                   <SelectValue placeholder="Exam Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Exam Types</SelectItem>
//                   {examTypes.map((type) => (
//                     <SelectItem key={type._id} value={type._id}>
//                       {type.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
//                 <SelectTrigger className="border border-gray-300 rounded-lg">
//                   <SelectValue placeholder="Difficulty" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Difficulties</SelectItem>
//                   <SelectItem value="Easy">Easy</SelectItem>
//                   <SelectItem value="Medium">Medium</SelectItem>
//                   <SelectItem value="Hard">Hard</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
//                 <SelectTrigger className="border border-gray-300 rounded-lg">
//                   <SelectValue placeholder="Test Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                   <SelectItem value="full">Full Tests</SelectItem>
//                   <SelectItem value="mini">Mini Tests</SelectItem>
//                   <SelectItem value="sectional">Sectional Tests</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Main Content */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//           <TabsList className="grid w-full grid-cols-2 lg:w-96 bg-blue-50 border border-blue-100">
//             <TabsTrigger value="exams" className="flex items-center gap-2 data-[state=active]:bg-blue-500">
//               <BookOpen className="h-4 w-4" />
//               Full Exams ({filteredExams.length})
//             </TabsTrigger>
//             <TabsTrigger value="mock-tests" className="flex items-center gap-2 data-[state=active]:bg-blue-500">
//               <Award className="h-4 w-4" />
//               Mock Tests ({filteredMockTests.length})
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="exams" className="space-y-6">
//             <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//               {filteredExams.length > 0 ? (
//                 filteredExams.map((exam) => (
//                   <Card 
//                     key={exam._id} 
//                     className="overflow-hidden border border-blue-100 hover:shadow-lg transition-shadow duration-300 group"
//                   >
//                     <CardHeader>
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors text-gray-800">
//                             {exam.title}
//                           </CardTitle>
//                           <CardDescription className="mt-2 flex items-center gap-2">
//                             <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//                               {exam.examType.name}
//                             </Badge>
//                             <Badge className="bg-indigo-100 text-indigo-800">
//                               {exam.type}
//                             </Badge>
//                           </CardDescription>
//                         </div>
//                         {exam.visibility.subscriptionRequired && user?.subscription?.status === "inactive" && (
//                           <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Premium</Badge>
//                         )}
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-blue-500" />
//                             <span>{exam.totalDuration} mins</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <BookOpen className="h-4 w-4 text-blue-500" />
//                             <span>{exam.totalQuestions} questions</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Award className="h-4 w-4 text-blue-500" />
//                             <span>{exam.totalMarks} marks</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Users className="h-4 w-4 text-blue-500" />
//                             <span>{exam.attempts.toLocaleString()} attempts</span>
//                           </div>
//                         </div>

//                         {exam.sections && exam.sections.length > 0 && (
//                           <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">Sections:</p>
//                             <div className="flex flex-wrap gap-1">
//                               {exam.sections.slice(0, 3).map((section, index) => (
//                                 <Badge 
//                                   key={index} 
//                                   variant="outline" 
//                                   className="text-xs bg-blue-50 text-blue-700 border-blue-200"
//                                 >
//                                   {section.name} ({section.questions || section.questionsCount})
//                                 </Badge>
//                               ))}
//                               {exam.sections.length > 3 && (
//                                 <Badge 
//                                   variant="outline" 
//                                   className="text-xs bg-blue-50 text-blue-700 border-blue-200"
//                                 >
//                                   +{exam.sections.length - 3} more
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                     <CardFooter className="flex gap-2">
//                       {exam.visibility.subscriptionRequired && user?.subscription?.status === "inactive" ? (
//                         <Link href="/subscriptions" className="flex-1">
//                           <Button variant="destructive" className="w-full bg-gradient-to-r from-red-500 to-orange-500">
//                             <Lock className="mr-2 h-4 w-4" />
//                             Unlock Now
//                           </Button>
//                         </Link>
//                       ) : resultIds[exam._id] ? (
//                         <Link href={`/results/${resultIds[exam._id]}`} className="flex-1">
//                           <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
//                             <Eye className="mr-2 h-4 w-4" />
//                             View Result
//                           </Button>
//                         </Link>
//                       ) : (
//                         <>
//                           <Link href={`/exams/${exam._id}`} className="flex-1">
//                             <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
//                               <Eye className="mr-2 h-4 w-4" />
//                               View Details
//                             </Button>
//                           </Link>
//                           <Link href={`/exams/${exam._id}/start`} className="flex-1">
//                             <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
//                               <Play className="mr-2 h-4 w-4" />
//                               Start Exam
//                             </Button>
//                           </Link>
//                         </>
//                       )}
//                     </CardFooter>
//                   </Card>
//                 ))
//               ) : (
//                 <div className="col-span-full text-center py-12">
//                   <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                   <p className="text-gray-600">
//                     No exams found matching your criteria. Try adjusting your filters.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </TabsContent>

//           <TabsContent value="mock-tests" className="space-y-6">
//             <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//               {filteredMockTests.length > 0 ? (
//                 filteredMockTests.map((mockTest) => (
//                   <Card 
//                     key={mockTest._id} 
//                     className="overflow-hidden border border-blue-100 hover:shadow-lg transition-shadow duration-300 group"
//                   >
//                     <CardHeader>
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors text-gray-800">
//                             {mockTest.title}
//                           </CardTitle>
//                           <CardDescription className="mt-2 flex items-center gap-2">
//                             <Badge 
//                               variant={
//                                 mockTest.type === "full"
//                                   ? "default"
//                                   : mockTest.type === "mini"
//                                     ? "secondary"
//                                     : "outline"
//                               }
//                               className={`text-xs ${
//                                 mockTest.type === "full" 
//                                   ? "bg-indigo-100 text-indigo-800" 
//                                   : mockTest.type === "mini" 
//                                     ? "bg-purple-100 text-purple-800" 
//                                     : "bg-blue-100 text-blue-800"
//                               }`}
//                             >
//                               {mockTest.type === "full"
//                                 ? "Full Test"
//                                 : mockTest.type === "mini"
//                                   ? "Mini Test"
//                                   : "Sectional"}
//                             </Badge>
//                             <Badge
//                               variant={
//                                 mockTest.difficulty === "Easy"
//                                   ? "outline"
//                                   : mockTest.difficulty === "Medium"
//                                     ? "secondary"
//                                     : "default"
//                               }
//                               className={`text-xs ${
//                                 mockTest.difficulty === "Easy" 
//                                   ? "bg-green-100 text-green-800 border-green-200" 
//                                   : mockTest.difficulty === "Medium" 
//                                     ? "bg-yellow-100 text-yellow-800" 
//                                     : "bg-red-100 text-red-800"
//                               }`}
//                             >
//                               {mockTest.difficulty}
//                             </Badge>
//                           </CardDescription>
//                         </div>
//                         {!mockTest.isFree && !user?.subscription?.status && (
//                           <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Premium</Badge>
//                         )}
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-3">
//                         <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-blue-500" />
//                             <span>{mockTest.duration} mins</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <BookOpen className="h-4 w-4 text-blue-500" />
//                             <span>{mockTest.totalQuestions} questions</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Award className="h-4 w-4 text-blue-500" />
//                             <span>{mockTest.totalMarks} marks</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Users className="h-4 w-4 text-blue-500" />
//                             <span>{mockTest.attempts.toLocaleString()} attempts</span>
//                           </div>
//                         </div>

//                         {mockTest.sections && mockTest.sections.length > 0 && (
//                           <div>
//                             <p className="text-sm font-medium mb-2 text-gray-700">Sections:</p>
//                             <div className="flex flex-wrap gap-1">
//                               {mockTest.sections.slice(0, 2).map((section, index) => (
//                                 <Badge 
//                                   key={index} 
//                                   variant="outline" 
//                                   className="text-xs bg-blue-50 text-blue-700 border-blue-200"
//                                 >
//                                   {section.name} ({section.questions})
//                                 </Badge>
//                               ))}
//                               {mockTest.sections.length > 2 && (
//                                 <Badge 
//                                   variant="outline" 
//                                   className="text-xs bg-blue-50 text-blue-700 border-blue-200"
//                                 >
//                                   +{mockTest.sections.length - 2} more
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                     <CardFooter className="flex gap-2">
//                       {!mockTest.isFree && !user?.subscription?.status ? (
//                         <Link href="/subscriptions" className="flex-1">
//                           <Button variant="destructive" className="w-full bg-gradient-to-r from-red-500 to-orange-500">
//                             <Lock className="mr-2 h-4 w-4" />
//                             Unlock Now
//                           </Button>
//                         </Link>
//                       ) : (
//                         <>
//                           <Link href={`/mock-tests/${mockTest._id}`} className="flex-1">
//                             <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
//                               <Eye className="mr-2 h-4 w-4" />
//                               View Details
//                             </Button>
//                           </Link>
//                           <Link href={`/mock-tests/${mockTest._id}/start`} className="flex-1">
//                             <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
//                               <Play className="mr-2 h-4 w-4" />
//                               Start Test
//                             </Button>
//                           </Link>
//                         </>
//                       )}
//                     </CardFooter>
//                   </Card>
//                 ))
//               ) : (
//                 <div className="col-span-full text-center py-12">
//                   <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                   <p className="text-gray-600">
//                     No mock tests found matching your criteria. Try adjusting your filters.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }