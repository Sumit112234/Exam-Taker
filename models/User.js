import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    subscription: {
      status: {
        type: String,
        enum: ["active", "inactive", "expired"],
        default: "inactive",
      },
      plan: {
        type: String,
        default: "",
      },
      expiry: {
        type: Date,
      },
      stripeCustomerId: {
        type: String,
      },
      stripeSubscriptionId: {
        type: String,
      },
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    examsTaken: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for average score
userSchema.virtual("averageScore").get(function () {
  return this.examsTaken > 0 ? Math.round(this.totalScore / this.examsTaken) : 0
})

// Index for better performance
userSchema.index({ email: 1 })
userSchema.index({ "subscription.status": 1 })

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.isSubscriptionActive = function () {
  return this.subscription.status === "active" && this.subscription.expiry && this.subscription.expiry > new Date()
}

export default mongoose.models.User || mongoose.model("User", userSchema)
