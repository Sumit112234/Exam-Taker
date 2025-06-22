import mongoose from "mongoose"

const examTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, "Code is required"],
      trim: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "📚",
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    category: {
      type: String,
      enum: ["Banking", "Railway", "SSC", "UPSC", "State", "Other"],
      default: "Other",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    examNames: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        code: {
          type: String,
          required: true,
          trim: true,
          uppercase: true,
        },
        description: String,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    sections: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        code: {
          type: String,
          required: true,
          trim: true,
          uppercase: true,
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
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Indexes
examTypeSchema.index({ category: 1, isActive: 1 })
examTypeSchema.index({ code: 1 })

export default mongoose.models.ExamType || mongoose.model("ExamType", examTypeSchema)
