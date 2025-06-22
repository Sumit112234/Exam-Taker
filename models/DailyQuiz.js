import mongoose from "mongoose"

const dailyQuizSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    duration: {
      type: Number,
      default: 15, // 15 minutes
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    participants: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
dailyQuizSchema.index({ date: -1 })
dailyQuizSchema.index({ isActive: 1 })

export default mongoose.models.DailyQuiz || mongoose.model("DailyQuiz", dailyQuizSchema)
