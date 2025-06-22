import mongoose from "mongoose"

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, "Category code is required"],
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
    exams: [
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
        description: {
          type: String,
          trim: true,
        },
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
            subjects: [String],
          },
        ],
        types: {
          type: [String],
          enum: ["mock", "mini-mock", "section-wise", "chapter-wise", "practice"],
          default: ["mock", "mini-mock", "section-wise"],
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
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
categorySchema.index({ name: 1, isActive: 1 })
categorySchema.index({ code: 1 })
categorySchema.index({ "exams.name": 1, "exams.isActive": 1 })

export default mongoose.models.Category || mongoose.model("Category", categorySchema)
