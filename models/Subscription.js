import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in days
    features: [String],
    stripePriceId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema)
