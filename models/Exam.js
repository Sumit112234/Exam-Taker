import mongoose from "mongoose"

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
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
    type: {
      type: String,
      enum: ["mock", "mini-mock", "section-wise", "chapter-wise", "practice"],
      required: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    instructions: {
      type: String,
      default: "Read all questions carefully before answering.",
    },
    sections: [
      {
        sectionId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
          min: 1,
        },
        questions: {
          type: Number,
          required: true,
          min: 1,
        },
        marks: {
          type: Number,
          required: true,
          min: 1,
        },
        negativeMarks: {
          type: Number,
          default: 0.25,
        },
        questionIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
          },
        ],
      },
    ],
    totalDuration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    passingMarks: {
      type: Number,
      default: 40,
    },
    negativeMarking: {
      enabled: {
        type: Boolean,
        default: true,
      },
      value: {
        type: Number,
        default: 0.25,
      },
    },
    settings: {
      allowReview: {
        type: Boolean,
        default: true,
      },
      shuffleQuestions: {
        type: Boolean,
        default: false,
      },
      showResults: {
        type: Boolean,
        default: true,
      },
      allowPause: {
        type: Boolean,
        default: true,
      },
      autoSubmit: {
        type: Boolean,
        default: true,
      },
      showTimer: {
        type: Boolean,
        default: true,
      },
      fullScreen: {
        type: Boolean,
        default: false,
      },
    },
    scheduling: {
      startDate: Date,
      endDate: Date,
      isScheduled: {
        type: Boolean,
        default: false,
      },
    },
    visibility: {
      isPublished: {
        type: Boolean,
        default: false,
      },
      isFree: {
        type: Boolean,
        default: false,
      },
      subscriptionRequired: {
        type: Boolean,
        default: true,
      },
    },
    tags: [String],
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// // Virtual for question count
// examSchema.virtual("questionCount").get(function () {
//   return this.sections.reduce((total, section) => total + section.questions, 0)
// })

// // Indexes for better performance
// examSchema.index({ category: 1, examName: 1, type: 1, isActive: 1 })
// examSchema.index({ "visibility.isPublished": 1, isActive: 1 })
// examSchema.index({ createdAt: -1 })
// examSchema.index({ tags: 1 })

// // Pre-save middleware to calculate totals
// examSchema.pre("save", function (next) {
//   if (this.sections && this.sections.length > 0) {
//     this.totalQuestions = this.sections.reduce((total, section) => total + section.questions, 0)
//     this.totalMarks = this.sections.reduce((total, section) => total + section.marks, 0)
//     this.totalDuration = this.sections.reduce((total, section) => total + section.duration, 0)
//   }
//   next()
// })

export default mongoose.models.Exam || mongoose.model("Exam", examSchema)
