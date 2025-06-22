// Seed script to populate exam types with banking exams
const examTypes = [
  {
    name: "Banking",
    code: "BANK",
    description: "Banking sector examinations",
    icon: "🏦",
    color: "#059669",
    category: "Banking",
    examNames: [
      {
        name: "IBPS PO",
        code: "IBPS_PO",
        description: "Institute of Banking Personnel Selection - Probationary Officer",
      },
      { name: "SBI PO", code: "SBI_PO", description: "State Bank of India - Probationary Officer" },
      { name: "RRB PO", code: "RRB_PO", description: "Regional Rural Banks - Probationary Officer" },
      { name: "IBPS Clerk", code: "IBPS_CLERK", description: "Institute of Banking Personnel Selection - Clerk" },
      { name: "SBI Clerk", code: "SBI_CLERK", description: "State Bank of India - Clerk" },
      { name: "RRB Clerk", code: "RRB_CLERK", description: "Regional Rural Banks - Clerk" },
    ],
    sections: [
      { name: "Reasoning Ability", code: "REASONING", duration: 60, questions: 35, marks: 35, negativeMarks: 0.25 },
      { name: "Numerical Ability", code: "NUMERICAL", duration: 45, questions: 35, marks: 35, negativeMarks: 0.25 },
      { name: "English Language", code: "ENGLISH", duration: 40, questions: 30, marks: 30, negativeMarks: 0.25 },
      { name: "General Awareness", code: "GK", duration: 35, questions: 40, marks: 40, negativeMarks: 0.25 },
      { name: "Computer Aptitude", code: "COMPUTER", duration: 45, questions: 20, marks: 20, negativeMarks: 0.25 },
    ],
  },
  {
    name: "Railway",
    code: "RAIL",
    description: "Railway recruitment examinations",
    icon: "🚂",
    color: "#DC2626",
    category: "Railway",
    examNames: [
      {
        name: "RRB NTPC",
        code: "RRB_NTPC",
        description: "Railway Recruitment Board - Non-Technical Popular Categories",
      },
      { name: "RRB JE", code: "RRB_JE", description: "Railway Recruitment Board - Junior Engineer" },
      { name: "RRB Group D", code: "RRB_GROUP_D", description: "Railway Recruitment Board - Group D" },
    ],
    sections: [
      {
        name: "General Intelligence",
        code: "INTELLIGENCE",
        duration: 90,
        questions: 30,
        marks: 30,
        negativeMarks: 0.33,
      },
      { name: "Mathematics", code: "MATHEMATICS", duration: 90, questions: 30, marks: 30, negativeMarks: 0.33 },
      { name: "General Awareness", code: "GK", duration: 90, questions: 40, marks: 40, negativeMarks: 0.33 },
    ],
  },
  {
    name: "SSC",
    code: "SSC",
    description: "Staff Selection Commission examinations",
    icon: "🏛️",
    color: "#7C3AED",
    category: "SSC",
    examNames: [
      { name: "SSC CGL", code: "SSC_CGL", description: "Staff Selection Commission - Combined Graduate Level" },
      {
        name: "SSC CHSL",
        code: "SSC_CHSL",
        description: "Staff Selection Commission - Combined Higher Secondary Level",
      },
      { name: "SSC MTS", code: "SSC_MTS", description: "Staff Selection Commission - Multi Tasking Staff" },
    ],
    sections: [
      {
        name: "General Intelligence",
        code: "INTELLIGENCE",
        duration: 60,
        questions: 25,
        marks: 50,
        negativeMarks: 0.5,
      },
      { name: "General Awareness", code: "GK", duration: 60, questions: 25, marks: 50, negativeMarks: 0.5 },
      { name: "Quantitative Aptitude", code: "QUANT", duration: 60, questions: 25, marks: 50, negativeMarks: 0.5 },
      { name: "English Comprehension", code: "ENGLISH", duration: 60, questions: 25, marks: 50, negativeMarks: 0.5 },
    ],
  },
]

console.log("Exam types data ready for seeding:")
console.log(JSON.stringify(examTypes, null, 2))
