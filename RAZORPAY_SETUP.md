# Razorpay Payment Gateway Integration

This document provides a complete guide for setting up and using the Razorpay payment gateway in the Exam-Taker application.

## Overview

The Exam-Taker application has been successfully migrated from Stripe to Razorpay for payment processing. Razorpay is a leading payment gateway in India that supports multiple payment methods including cards, UPI, net banking, and wallets.

## What Changed

### Removed
- Stripe SDK (`@stripe/stripe-js`, `stripe`)
- `lib/stripe.js` - Stripe initialization
- `utils/stripe.js` - Stripe utilities

### Added
- Razorpay SDK (`razorpay`)
- `lib/razorpay.js` - Razorpay initialization
- `utils/razorpay.js` - Razorpay utilities including signature verification

### Updated
- `app/api/payment/create-checkout-session/route.js` - Now creates Razorpay orders instead of Stripe sessions
- `app/api/payment/webhook/route.js` - Handles Razorpay webhooks
- `app/api/payment/session/[sessionId]/route.js` - Fetches Razorpay order details
- `app/subscriptions/page.js` - Uses Razorpay modal instead of Stripe redirect
- `app/payment/success/page.js` - Displays Razorpay payment confirmation

## Setup Instructions

### 1. Get Razorpay Credentials

1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create a free account or sign in
3. Navigate to **Settings > API Keys**
4. Copy your:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret**

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Important:**
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is visible in the browser (public, safe to expose)
- `RAZORPAY_KEY_SECRET` must be kept secret and only used on the server
- `RAZORPAY_WEBHOOK_SECRET` is used to verify webhook signatures

### 3. Setup Webhook (For Production)

1. In [Razorpay Dashboard](https://dashboard.razorpay.com/):
   - Go to **Settings > Webhooks**
   - Click **Add New Webhook**
   - Set Webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Select events:
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `order.paid`
   - Copy the **Webhook Secret** and add it to your `.env.local`

## Features

### Payment Processing
- **Order Creation**: Creates Razorpay orders with subscription details
- **Modal Checkout**: Opens Razorpay's secure checkout modal
- **Payment Confirmation**: Automatic subscription activation on successful payment
- **Webhook Verification**: Secure signature verification for webhooks

### Supported Payment Methods
- Credit/Debit Cards
- UPI
- Net Banking
- Wallets
- Digital Lending

### Coupon Integration
- Coupon validation before payment
- Discount application to subscription amounts
- Automatic coupon usage tracking

## File Structure

```
lib/
├── razorpay.js                 # Razorpay client initialization

utils/
├── razorpay.js                 # Utility functions for signature verification

app/api/payment/
├── create-checkout-session/    # Creates Razorpay orders
├── webhook/                    # Handles Razorpay webhooks
└── session/[sessionId]/        # Fetches order details

app/
├── subscriptions/page.js       # Subscription plans with Razorpay modal
└── payment/
    └── success/page.js         # Payment success page
```

## Usage

### Creating a Payment Order

```javascript
const response = await fetch("/api/payment/create-checkout-session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    subscriptionId: "subscription_id",
    couponCode: "DISCOUNT10" // optional
  })
})

const data = await response.json()
// Returns: { orderId, amount, currency, keyId, ... }
```

### Opening Razorpay Checkout

```javascript
const options = {
  key: data.keyId,
  amount: data.amount,
  currency: data.currency,
  order_id: data.orderId,
  handler: function(response) {
    // Handle successful payment
    // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
  }
}

const razorpay = new window.Razorpay(options)
razorpay.open()
```

## Testing

### Test Mode
When using test API keys (starting with `rzp_test_`):

**Test Cards:**
- **Visa Success**: 4111111111111111
- **Visa Fail**: 4000000000000002
- **Mastercard Success**: 5555555555554444
- **Mastercard Fail**: 5105105105105100

**Expiry**: Any future date (MM/YY format)
**CVV**: Any 3-digit number

### UPI Test Numbers
- Success: `success@razorpay` or `success@okhdfcbank`
- Failure: `fail@razorpay`

## Signature Verification

All webhook events are verified using HMAC SHA256 signatures. The verification happens in:
- `utils/razorpay.js` - `verifyWebhookSignature()` function
- `app/api/payment/webhook/route.js` - Signature verification before processing

## Error Handling

The integration includes comprehensive error handling for:
- Missing environment variables
- Invalid orders
- Webhook signature mismatches
- Payment failures
- User authorization errors

## Database Updates

When a payment is successful, the following happens:
1. User subscription is activated in the database
2. Subscription end date is calculated based on duration
3. Razorpay payment ID and order ID are stored
4. Coupon usage count is incremented (if coupon was used)
5. Subscription statistics are updated

## Migration Checklist

✅ Installed Razorpay SDK
✅ Created Razorpay initialization files
✅ Updated API routes for Razorpay
✅ Updated subscription page UI
✅ Updated success page
✅ Removed Stripe dependencies
✅ Added environment variable configuration
✅ Implemented webhook signature verification

## Troubleshooting

### "RAZORPAY_KEY_ID is not defined"
- Make sure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `.env.local`
- Restart the development server

### "Webhook signature verification failed"
- Verify `RAZORPAY_WEBHOOK_SECRET` is correct
- Check webhook URL is publicly accessible
- Ensure webhook is enabled in Razorpay dashboard

### "Order not found"
- Verify order ID is correct
- Check database connection
- Ensure order was created successfully

### Payment Modal Not Opening
- Check browser console for errors
- Verify Razorpay script is loaded
- Ensure Key ID is correct and in test/live mode

## Support

For more information:
- [Razorpay Documentation](https://razorpay.com/docs/api/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)
- [Razorpay Support](https://razorpay.com/support/)

## Security Notes

1. **Never expose Key Secret** in frontend code
2. **Always verify signatures** on webhooks
3. **Use HTTPS** in production
4. **Keep webhook secret safe** - don't share it
5. **Validate all user inputs** before creating orders
6. **Use environment variables** for sensitive data

---

**Last Updated**: June 2026
**Integration Status**: ✅ Complete and Production Ready
