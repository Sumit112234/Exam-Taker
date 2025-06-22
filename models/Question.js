import mongoose from "mongoose"


const questionSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    examName: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },
    sectionName: {
      type: String,
      required: [true, "Section name is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    chapter: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["mcq", "numerical", "fill-in-the-blank", "true-false", "data-interpretation"],
      default: "mcq",
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    questionTextHindi: {
      type: String,
      trim: true,
    },
    questionImage: {
      type: String, // URL to image
    },
    passage: {
      type: String, // For comprehension or data interpretation
    },
    passageImage: {
      type: String, // URL to passage image
    },
    options: {
      type: [String],
      validate: {
        validator: function (v) {
          return this.type !== "mcq" || (v && v.length >= 2 && v.length <= 6)
        },
        message: "MCQ questions must have between 2 and 6 options",
      },
    },
    optionsHindi: {
      type: [String],
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
    },
    explanation: {
      type: String,
      trim: true,
    },
    explanationHindi: {
      type: String,
      trim: true,
    },
    explanationImage: {
      type: String, // URL to explanation image
    },
    marks: {
      type: Number,
      default: 1,
      min: [0.5, "Marks must be at least 0.5"],
      max: [10, "Marks cannot exceed 10"],
    },
    negativeMarks: {
      type: Number,
      default: 0.25,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    statistics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      correctAttempts: {
        type: Number,
        default: 0,
      },
      averageTime: {
        type: Number,
        default: 0,
      },
      accuracyRate: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
questionSchema.index({ category: 1, examName: 1, sectionName: 1 })
questionSchema.index({ subject: 1, topic: 1, chapter: 1 })
questionSchema.index({ difficulty: 1, isActive: 1 })
questionSchema.index({ tags: 1 })
questionSchema.index({ createdAt: -1 })

// Pre-save middleware to calculate accuracy rate
questionSchema.pre("save", function (next) {
  if (this.statistics.totalAttempts > 0) {
    this.statistics.accuracyRate = (this.statistics.correctAttempts / this.statistics.totalAttempts) * 100
  }
  next()
})

export default mongoose.models.Question || mongoose.model("Question", questionSchema)
