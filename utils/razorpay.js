import crypto from "crypto"

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature from webhook
 * @param {string} secret - Razorpay key secret
 * @returns {boolean} - True if signature is valid
 */
export function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  const body = `${orderId}|${paymentId}`
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")
  return expectedSignature === signature
}

/**
 * Verify Razorpay webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - Razorpay signature header
 * @param {string} secret - Razorpay webhook secret
 * @returns {boolean} - True if signature is valid
 */
export function verifyWebhookSignature(body, signature, secret) {
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")
  return expectedSignature === signature
}

/**
 * Get Razorpay public key for frontend
 * @returns {string} - Razorpay public key
 */
export function getRazorpayPublicKey() {
  const key = process.env.RAZORPAY_KEY_ID
  if (!key) {
    throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not defined")
  }
  return key
}
