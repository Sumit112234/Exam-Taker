import mongoose from "mongoose"

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/exam-app"

// Category model schema
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: String,
    icon: { type: String, default: "📚" },
    color: { type: String, default: "#3B82F6" },
    exams: [
      {
        name: { type: String, required: true },
        code: { type: String, required: true },
        description: String,
        sections: [
          {
            name: { type: String, required: true },
            code: { type: String, required: true },
            duration: { type: Number, required: true },
            subjects: [String],
          },
        ],
        types: { type: [String], default: ["mock", "mini-mock", "section-wise"] },
        isActive: { type: Boolean, default: true },
      },
    ],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema)

// Sample categories data
const categoriesData = [
  {
    name: "Banking",
    code: "BANK",
    description: "Banking sector competitive exams",
    icon: "🏦",
    color: "#10B981",
    exams: [
      {
        name: "IBPS PO",
        code: "IBPS_PO",
        description: "Institute of Banking Personnel Selection - Probationary Officer",
        sections: [
          {
            name: "Reasoning Ability",
            code: "REASON",
            duration: 60,
            subjects: ["Logical Reasoning", "Verbal Reasoning", "Non-Verbal Reasoning", "Analytical Reasoning"],
          },
          {
            name: "Numerical Ability",
            code: "NUMERIC",
            duration: 45,
            subjects: ["Arithmetic", "Data Interpretation", "Number Series", "Simplification"],
          },
          {
            name: "English Language",
            code: "ENGLISH",
            duration: 40,
            subjects: ["Reading Comprehension", "Grammar", "Vocabulary", "Sentence Correction"],
          },
          {
            name: "General Awareness",
            code: "GA",
            duration: 35,
            subjects: ["Current Affairs", "Banking Awareness", "Static GK", "Financial Awareness"],
          },
          {
            name: "Computer Aptitude",
            code: "COMPUTER",
            duration: 45,
            subjects: ["Computer Fundamentals", "MS Office", "Internet", "Computer Abbreviations"],
          },
        ],
        types: ["mock", "mini-mock", "section-wise", "chapter-wise"],
        isActive: true,
      },
      {
        name: "SBI PO",
        code: "SBI_PO",
        description: "State Bank of India - Probationary Officer",
        sections: [
          {
            name: "Reasoning Ability",
            code: "REASON",
            duration: 60,
            subjects: ["Logical Reasoning", "Verbal Reasoning", "Puzzles", "Seating Arrangement"],
          },
          {
            name: "Numerical Ability",
            code: "NUMERIC",
            duration: 45,
            subjects: ["Arithmetic", "Data Interpretation", "Quadratic Equations", "Number Series"],
          },
          {
            name: "English Language",
            code: "ENGLISH",
            duration: 40,
            subjects: ["Reading Comprehension", "Grammar", "Vocabulary", "Para Jumbles"],
          },
          {
            name: "General Awareness",
            code: "GA",
            duration: 35,
            subjects: ["Current Affairs", "Banking Awareness", "Economic Affairs", "Sports"],
          },
        ],
        types: ["mock", "mini-mock", "section-wise", "chapter-wise"],
        isActive: true,
      },
      {
        name: "SBI Clerk",
        code: "SBI_CLERK",
        description: "State Bank of India - Junior Associate",
        sections: [
          {
            name: "Reasoning Ability",
            code: "REASON",
            duration: 60,
            subjects: ["Logical Reasoning", "Verbal Reasoning", "Coding-Decoding", "Direction Sense"],
          },
          {
            name: "Numerical Ability",
            code: "NUMERIC",
            duration: 45,
            subjects: ["Arithmetic", "Data Interpretation", "Simplification", "Number Series"],
          },
          {
            name: "English Language",
            code: "ENGLISH",
            duration: 40,
            subjects: ["Reading Comprehension", "Grammar", "Vocabulary", "Cloze Test"],
          },
          {
            name: "General Awareness",
            code: "GA",
            duration: 35,
            subjects: ["Current Affairs", "Banking Awareness", "Static GK", "History"],
          },
        ],
        types: ["mock", "mini-mock", "section-wise", "chapter-wise"],
        isActive: true,
      },
      {
        name: "RRB PO",
        code: "RRB_PO",
        description: "Regional Rural Banks - Officer Scale I",
        sections: [
          {
            name: "Reasoning Ability",
            code: "REASON",
            duration: 45,
            subjects: ["Logical Reasoning", "Verbal Reasoning", "Puzzles", "Inequalities"],
          },
          {
            name: "Numerical Ability",
            code: "NUMERIC",
            duration: 45,
            subjects: ["Arithmetic", "Data Interpretation", "Simplification", "Approximation"],
          },
          {
            name: "General Awareness",
            code: "GA",
            duration: 40,
            subjects: ["Current Affairs", "Banking Awareness", "Rural Banking", "Agriculture"],
          },
          {
            name: "English Language",
            code: "ENGLISH",
            duration: 40,
            subjects: ["Reading Comprehension", "Grammar", "Vocabulary", "Error Detection"],
          },
          {
            name: "Computer Knowledge",
            code: "COMPUTER",
            duration: 40,
            subjects: ["Computer Fundamentals", "MS Office", "Internet", "Banking Software"],
          },
        ],
        types: ["mock", "mini-mock", "section-wise", "chapter-wise"],
        isActive: true,
      },
    ],
    isActive: true,
  },
  {
    name: "SSC",
    code: "SSC",
    description: "Staff Selection Commission exams",
    icon: "🏛️",
    color: "#3B82F6",
    exams: [
      {
        name: "SSC CGL",
        code: "SSC_CGL",
        description: "Combined Graduate Level Examination",
        sections: [
          {
            name: "General Intelligence & Reasoning",
            code: "REASON",
            duration: 60,
            subjects: ["Logical Reasoning", "Verbal Reasoning", "Non-Verbal Reasoning", "Analytical Reasoning"],
          },
          {
            name: "General Awareness",
            code: "GA",
            duration: 60,
            subjects: ["Current Affairs", "History", "Geography", "Polity", "Economics", "Science"],
          },
          {
            name: "Quantitative Aptitude",
            code: "QUANT",
            duration: 60,
            subjects: ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Statistics"],
          },
          {
            name: "English Comprehension",
            code: "ENGLISH",
            duration: 60,
            subjects: ["Reading Comprehension", "Grammar", "Vocabulary", "Sentence Improvement"],
          },
        ],
        types: ["mock", "mini-mock", "section-wise", "chapter-wise"],
        isActive: true,
      },
      {
        name: "SSC CHSL",
        code: "SSC_CHSL",
        description: "Combined Higher Secondary Level",
        sections: [
          {
            name: "General Intelligence",
            code: "REASON",
            duration: 60,
            subjects: ["Logical Reasoning", "Verbal Reasoning", "Non-Verbal Reasoning"],
          },
          {
            name: "General Awareness",
            code: "GA",
            duration: 60,
            subjects: ["Current Affairs", "History", "Geography", "Polity", "Science"],
          },
          {
            name: "Quantitative Aptitude",
            code: "QUANT",
            duration: 60,
            subjects: ["Arithmetic", "Basic Mathematics", "Data Interpretation"],
          },
          {
            name: "English Language",
            code: "ENGLISH",
            duration: 60,
            subjects: ["Grammar", "Vocabulary", "Comprehension", "Writing Skills"],
          },
        ],
        types: ["mock", "mini-mock", "section-wise", "chapter-wise"],
        isActive: true,
      },
    ],
    isActive: true,
  },
  {
    name: "Railway",
    code: "RAIL",
    description: "Railway Recruitment Board exams",
    icon: "🚂",
    color: "#EF4444",
    exams: [
      {
        name: "RRB NTPC",
        code: "RRB_NTPC",
        description: "Non-Technical Popular Categories",
        sections: [
          {
            name: "General Awareness",
            code: "GA",
            duration: 90,
            subjects: ["Current Affairs", "History", "Geography", "Polity", "Economics", "Science"],
          },
          {
            name: "Mathematics",
            code: "MATH",
            duration: 90,
            subjects: ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Statistics"],
          },
          {
            name: "General Intelligence & Reasoning",
            code: "REASON",
            duration: 90,
            subjects: ["Logical Reasoning", "Verbal Reasoning", "Non-Verbal Reasoning", "Analytical Reasoning"],
          },
        ],
        types: ["mock", "mini-mock", "section-wise", "chapter-wise"],
        isActive: true,
      },
      {
        name: "RRB Group D",
        code: "RRB_GROUP_D",
        description: "Level 1 Posts",
        sections: [
          {
            name: "General Science",
            code: "SCIENCE",
            duration: 90,
            subjects: ["Physics", "Chemistry", "Biology", "Environmental Science"],
          },
          {
            name: "Mathematics",
            code: "MATH",
            duration: 90,
            subjects: ["Arithmetic", "Basic Mathematics", "Number System"],
          },
          {
            name: "General Intelligence & Reasoning",
            code: "REASON",
            duration: 90,
            subjects: ["Logical Reasoning", "Verbal Reasoning", "Analytical Reasoning"],
          },
          {
            name: "General Awareness",
            code: "GA",
            duration: 90,
            subjects: ["Current Affairs", "History", "Geography", "Polity", "Sports"],
          },
        ],
        types: ["mock", "mini-mock", "section-wise", "chapter-wise"],
        isActive: true,
      },
    ],
    isActive: true,
  },
]

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing categories
    await Category.deleteMany({})
    console.log("Cleared existing categories")

    // Create a default admin user ID (you should replace this with actual admin user ID)
    const defaultAdminId = new mongoose.Types.ObjectId()

    // Add createdBy field to each category
    const categoriesWithCreator = categoriesData.map((category) => ({
      ...category,
      createdBy: defaultAdminId,
    }))

    // Insert categories
    const insertedCategories = await Category.insertMany(categoriesWithCreator)
    console.log(`Inserted ${insertedCategories.length} categories`)

    // Log inserted categories
    insertedCategories.forEach((category) => {
      console.log(`- ${category.name} (${category.code}) with ${category.exams.length} exams`)
      category.exams.forEach((exam) => {
        console.log(`  - ${exam.name} (${exam.code}) with ${exam.sections.length} sections`)
      })
    })

    console.log("Categories seeded successfully!")
  } catch (error) {
    console.error("Error seeding categories:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the seeding function
seedCategories()
