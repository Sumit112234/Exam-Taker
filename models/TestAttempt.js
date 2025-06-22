import mongoose from "mongoose"

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswer: {
          type: String,
        },
        isCorrect: {
          type: Boolean,
        },
        marksAwarded: {
          type: Number,
          default: 0,
        },
        timeSpent: {
          type: Number,
          default: 0,
        },
        isReviewed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    unattempted: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "submitted", "auto-submitted"],
      default: "in-progress",
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    rank: {
      type: Number,
    },
    analytics: {
      subjectWise: [
        {
          subject: String,
          correct: Number,
          incorrect: Number,
          unattempted: Number,
          score: Number,
          percentage: Number,
        },
      ],
      difficultyWise: {
        easy: {
          correct: { type: Number, default: 0 },
          incorrect: { type: Number, default: 0 },
          unattempted: { type: Number, default: 0 },
        },
        medium: {
          correct: { type: Number, default: 0 },
          incorrect: { type: Number, default: 0 },
          unattempted: { type: Number, default: 0 },
        },
        hard: {
          correct: { type: Number, default: 0 },
          incorrect: { type: Number, default: 0 },
          unattempted: { type: Number, default: 0 },
        },
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
testAttemptSchema.index({ user: 1, test: 1 })
testAttemptSchema.index({ submittedAt: -1 })
testAttemptSchema.index({ status: 1 })

export default mongoose.models.TestAttempt || mongoose.model("TestAttempt", testAttemptSchema)
