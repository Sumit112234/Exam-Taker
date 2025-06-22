import mongoose from "mongoose"

const scheduledExamSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduledDateTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: 0, // 0 means unlimited
    },
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
    reminderTime: {
      type: Number,
      default: 30, // minutes before exam
    },
    registrations: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        attempts: {
          type: Number,
          default: 0,
        },
      },
    ],
    settings: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      requireRegistration: {
        type: Boolean,
        default: true,
      },
      allowLateEntry: {
        type: Boolean,
        default: false,
      },
      lateEntryDuration: {
        type: Number,
        default: 15, // minutes
      },
    },
    statistics: {
      totalRegistrations: {
        type: Number,
        default: 0,
      },
      totalAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
scheduledExamSchema.index({ scheduledDateTime: 1 })
scheduledExamSchema.index({ createdBy: 1 })
scheduledExamSchema.index({ examId: 1 })

// Virtual for status
scheduledExamSchema.virtual("status").get(function () {
  const now = new Date()
  const startTime = this.scheduledDateTime
  const endTime = new Date(startTime.getTime() + this.duration * 60000)

  if (now < startTime) {
    return "upcoming"
  } else if (now >= startTime && now <= endTime) {
    return "live"
  } else {
    return "completed"
  }
})

export default mongoose.models.ScheduledExam || mongoose.model("ScheduledExam", scheduledExamSchema)
