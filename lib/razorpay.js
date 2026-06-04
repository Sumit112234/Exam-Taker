import Razorpay from "razorpay"


const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

// console.log("Razorpay Key ID:", razorpayKeyId )
// console.log("Razorpay Key Secret:", razorpayKeySecret )


if (!razorpayKeyId || !razorpayKeySecret) {
  throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not defined in environment variables")
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
})

// Log the mode for debugging (remove in production)
if (process.env.NODE_ENV === "development") {
  console.log("Razorpay initialized successfully")
}

export default razorpay
