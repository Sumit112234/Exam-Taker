import mongoose from "mongoose"

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        userAnswer: {
          type: String,
        },
        correctAnswer: {
          type: String,
        },
        isCorrect: {
          type: Boolean,
        },
        marks: {
          type: Number,
          default: 0,
        },
        timeTaken: {
          type: Number, // seconds
          default: 0,
        },
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    wrongAnswers: {
      type: Number,
      required: true,
    },
    unattempted: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: String, // in format "MM:SS"
    },
    timeSpent: {
      type: Number, // total seconds
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    rank: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for percentage
resultSchema.virtual("percentage").get(function () {
  return this.totalMarks > 0 ? Math.round((this.obtainedMarks / this.totalMarks) * 100) : 0
})

// Indexes for better performance
resultSchema.index({ user: 1, exam: 1 })
resultSchema.index({ user: 1, submittedAt: -1 })
resultSchema.index({ exam: 1, score: -1 })

export default mongoose.models.Result || mongoose.model("Result", resultSchema)
