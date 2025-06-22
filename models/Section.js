import mongoose from "mongoose"

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Section name is required"],
      trim: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Section duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    totalMarks: {
      type: Number,
      default: 0,
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
      default: "",
    },
    order: {
      type: Number,
      default: 0,
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

export default mongoose.models.Section || mongoose.model("Section", sectionSchema)
