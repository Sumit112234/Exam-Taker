import mongoose from "mongoose"

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Test title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: ["mock", "mini", "sectional", "daily-quiz"],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    chapter: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mixed"],
      default: "Medium",
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [300, "Duration cannot exceed 300 minutes"],
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    passingMarks: {
      type: Number,
      default: 40,
    },
    negativeMarking: {
      enabled: {
        type: Boolean,
        default: false,
      },
      value: {
        type: Number,
        default: 0.25,
      },
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    instructions: {
      type: String,
      default: "Read all questions carefully before answering.",
    },
    tags: [String],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    scheduledFor: {
      type: Date,
    },
    validFrom: {
      type: Date,
    },
    validUntil: {
      type: Date,
    },
    maxAttempts: {
      type: Number,
      default: 1,
    },
    showResults: {
      type: Boolean,
      default: true,
    },
    showSolutions: {
      type: Boolean,
      default: true,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    allowReview: {
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
      averageScore: {
        type: Number,
        default: 0,
      },
      averageTime: {
        type: Number,
        default: 0,
      },
      passRate: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for question count
testSchema.virtual("questionCount").get(function () {
  return this.questions ? this.questions.length : 0
})

// Indexes for better performance
testSchema.index({ category: 1, subject: 1, type: 1 })
testSchema.index({ isPublished: 1, isActive: 1 })
testSchema.index({ scheduledFor: 1 })
testSchema.index({ createdAt: -1 })
testSchema.index({ tags: 1 })

export default mongoose.models.Test || mongoose.model("Test", testSchema)
