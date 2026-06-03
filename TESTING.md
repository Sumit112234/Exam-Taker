# Razorpay Integration Testing Guide

This guide provides comprehensive testing instructions for the Razorpay payment gateway integration.

## Prerequisites

1. Node.js and npm installed
2. MongoDB running (local or Atlas)
3. Razorpay test account created
4. All environment variables configured in `.env.local`

## Test Environment Setup

### 1. Get Test Credentials

Visit [Razorpay Dashboard](https://dashboard.razorpay.com/) and get:
- Key ID (starts with `rzp_test_`)
- Key Secret

### 2. Configure Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
MONGODB_URI=mongodb://localhost:27017/exam-taker
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

### 3. Start Development Server

```bash
npm run dev
```

Server will run at `http://localhost:3000`

## Test Cases

### Test 1: View Subscriptions Page

**Steps:**
1. Navigate to `/subscriptions`
2. Verify subscription cards are displayed
3. Confirm "Razorpay" is mentioned at the bottom
4. Check all subscription plans load correctly

**Expected Result:** ✅ All subscription plans visible with correct pricing

---

### Test 2: Apply Coupon Code

**Steps:**
1. Go to `/subscriptions`
2. Enter a valid coupon code in the "Have a coupon code?" section
3. Click "Apply"
4. Verify discount is applied

**Expected Result:** ✅ Discount percentage displayed, prices updated

**Test Coupons:**
- Create test coupons in MongoDB
- Ensure `isActive: true`, `expiresAt` is in future
- Test with percentage discount: `"SAVE50"` (50% off)
- Test with fixed discount: `"FLAT100"` (₹100 off)

---

### Test 3: Create Payment Order

**Steps:**
1. Go to `/subscriptions`
2. Click "Subscribe Now" on any plan
3. Wait for Razorpay modal to load
4. Verify modal shows correct amount and plan name

**Expected Result:** ✅ Razorpay modal opens with correct order details

**Debugging:**
```javascript
// Check browser console for:
- Order ID displayed
- Amount in paise (₹100 = 10000 paise)
- Razorpay script loaded
- Modal configuration valid
```

---

### Test 4: Test Payment with Success Card

**Steps:**
1. Complete Test 3 (modal opens)
2. Select "Card" payment method
3. Enter test card: `4111111111111111`
4. Expiry: Any future date (MM/YY)
5. CVV: Any 3 digits
6. Cardholder name: Any name
7. Click "Pay Now"

**Expected Result:** ✅ Payment succeeds, redirected to success page

**Success Page Should Show:**
- ✅ Green checkmark and "Payment Successful!" message
- Amount in ₹
- Plan name
- Buttons to go to Dashboard or start exams

---

### Test 5: Test Payment Failure

**Steps:**
1. Open Razorpay modal
2. Enter failed test card: `4000000000000002`
3. Complete payment
4. Modal should show error or close

**Expected Result:** ⚠️ Payment fails gracefully, can retry

---

### Test 6: Test UPI Payment

**Steps:**
1. Open Razorpay modal
2. Select "UPI" method
3. Enter test UPI: `success@razorpay`
4. Complete payment

**Expected Result:** ✅ Payment succeeds via UPI

---

### Test 7: Webhook Testing (Development)

**For Local Testing with ngrok:**

```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Expose local server to internet
ngrok http 3000

# Copy ngrok URL: https://xxxx-xx-xx-xxx-xx.ngrok.io

# In Razorpay Dashboard:
# Settings > Webhooks
# Add webhook: https://xxxx-xx-xx-xxx-xx.ngrok.io/api/payment/webhook
```

**Monitor Webhook Events:**

```bash
# Terminal 3: Watch for webhook calls
tail -f /vercel/share/v0-project/.next/logs/webhook.log
```

---

### Test 8: Database Updates

**After Successful Payment:**

Check MongoDB for user subscription update:

```bash
# In MongoDB
db.users.findOne({ userId: "test_user_id" })

# Should show:
{
  subscription: {
    plan: "premium",
    status: "active",
    startDate: ISODate("2026-06-03"),
    endDate: ISODate("2026-06-10"),
    razorpayPaymentId: "pay_xxxxx",
    razorpayOrderId: "order_xxxxx"
  }
}
```

---

### Test 9: Signature Verification

**Test in Node REPL:**

```javascript
const { verifyWebhookSignature } = require("./utils/razorpay.js")

const testBody = JSON.stringify({
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_test123"
      }
    }
  }
})

// Generate test signature using Razorpay secret
const crypto = require("crypto")
const signature = crypto
  .createHmac("sha256", "RAZORPAY_WEBHOOK_SECRET")
  .update(testBody)
  .digest("hex")

// Verify
const isValid = verifyWebhookSignature(
  testBody,
  signature,
  "RAZORPAY_WEBHOOK_SECRET"
)

console.log("Signature valid:", isValid) // Should be true
```

---

### Test 10: Error Scenarios

#### Missing Environment Variables

**Test:**
1. Remove `NEXT_PUBLIC_RAZORPAY_KEY_ID` from `.env.local`
2. Try to subscribe
3. Should see error in console

**Expected:** Error message about missing Key ID

#### Invalid Order

**Test:**
1. Manually call `/api/payment/session/invalid_order_id`
2. Should return 404 error

**Expected:** "Order not found" message

#### Unauthorized Access

**Test:**
1. Call API without authentication
2. Should return 401 error

**Expected:** "Unauthorized" message

---

## Debugging Checklist

### Razorpay Modal Not Opening

- [ ] Check browser console for JavaScript errors
- [ ] Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- [ ] Ensure Razorpay script loaded: `window.Razorpay` exists
- [ ] Check network tab for script loading
- [ ] Verify order creation API returns `keyId` and `orderId`

### Payment Not Processing

- [ ] Check browser console for errors
- [ ] Verify payment is in "created" status (not already paid)
- [ ] Check webhook is receiving events
- [ ] Verify webhook secret is correct
- [ ] Check database connection is active

### Webhook Not Triggering

- [ ] Verify webhook URL is publicly accessible
- [ ] Check webhook is enabled in Razorpay dashboard
- [ ] Verify webhook events are selected
- [ ] Check server logs for webhook requests
- [ ] Verify signature verification passes

---

## Performance Testing

### Test Payment Creation Time

```javascript
// In browser console
const start = performance.now()
// Click subscribe button
// Time when modal opens
const end = performance.now()
console.log(`Payment order created in ${end - start}ms`)
```

**Expected:** < 2 seconds

### Test Payment Confirmation Time

From payment successful to subscription activation:

```javascript
// Check database before and after
db.users.find({ subscription: { status: "active" } }).count()
```

**Expected:** < 5 seconds after successful payment

---

## Load Testing

### Test Multiple Concurrent Orders

```bash
# Use Apache Bench
ab -n 100 -c 10 -p order.json http://localhost:3000/api/payment/create-checkout-session

# Where order.json contains:
# {"subscriptionId": "test_id", "couponCode": null}
```

**Expected:** All requests succeed with < 5% error rate

---

## Security Testing

### Test 1: Signature Validation

Modify webhook signature in test and verify it's rejected:

```javascript
const fakeSignature = "invalid_signature_here"
// Send webhook with fake signature
// Should return 400 error
```

**Expected:** ✅ Webhook rejected with 400 error

### Test 2: User Authorization

Try to access order belonging to another user:

```javascript
// User A creates order
// User B tries to fetch: /api/payment/session/USER_A_ORDER_ID
// Should return 401 Unauthorized
```

**Expected:** ✅ 401 Unauthorized response

### Test 3: SQL Injection

Try to inject MongoDB query in coupon code:

```javascript
const maliciousCode = '{"$ne": null}'
// Try to apply as coupon
// Should handle gracefully
```

**Expected:** ✅ Invalid coupon code message

---

## Cleanup After Testing

### Clear Test Data

```bash
# MongoDB cleanup
db.orders.deleteMany({ createdAt: { $lt: ISODate("2026-06-01") } })
db.users.updateMany(
  { "subscription.status": "active" },
  { $set: { "subscription.status": "inactive" } }
)
```

### Reset Webhook Secret

If exposed during testing, regenerate in Razorpay dashboard.

---

## Continuous Integration Testing

### Automated Test Script

```bash
#!/bin/bash
# tests/integration.sh

set -e

echo "Starting Razorpay Integration Tests..."

# Check environment variables
test -n "$NEXT_PUBLIC_RAZORPAY_KEY_ID" || exit 1
test -n "$RAZORPAY_KEY_SECRET" || exit 1
test -n "$MONGODB_URI" || exit 1

echo "✅ Environment variables configured"

# Run tests
npm test

echo "✅ All tests passed"
```

---

## Test Results Checklist

Before considering Razorpay integration complete:

- [ ] Subscriptions page loads correctly
- [ ] Coupon validation works
- [ ] Razorpay modal opens
- [ ] Test card payment succeeds
- [ ] Failed card payment handled
- [ ] UPI payment succeeds
- [ ] Webhook receives events
- [ ] Signature verification passes
- [ ] Database updates correctly
- [ ] User subscription activated
- [ ] Error scenarios handled
- [ ] Security validations pass
- [ ] Performance is acceptable

---

## Support & Issues

If tests fail:

1. Check console logs for errors
2. Verify environment variables
3. Check Razorpay dashboard for events
4. Review webhook logs
5. Check MongoDB for data consistency
6. See RAZORPAY_SETUP.md for detailed setup

---

**Last Updated**: June 3, 2026
**Status**: Ready for Production Testing
