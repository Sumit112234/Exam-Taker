
const questionSchema = new mongoose.Schema(
  {
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
   
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
    },
    explanation: {
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
    
    
  }
)
