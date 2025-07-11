import Stripe from "stripe"

// Ensure we're using the correct API key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables")
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
  typescript: true,
})

// Log the mode for debugging (remove in production)
if (process.env.NODE_ENV === "development") {
  console.log(`Stripe initialized in ${stripeSecretKey.startsWith("sk_test_") ? "TEST" : "LIVE"} mode`)
}

export default stripe
