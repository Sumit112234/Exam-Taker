# Razorpay Integration - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Get Credentials
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Settings → API Keys
3. Copy: **Key ID** and **Key Secret**

### 2. Configure Environment
```bash
# .env.local
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxx
RAZORPAY_WEBHOOK_SECRET=test_webhook_secret_xxxxx
MONGODB_URI=mongodb://localhost:27017/exam-taker
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
```

### 3. Start Development
```bash
npm run dev
# Open http://localhost:3000/subscriptions
```

### 4. Test Payment
- Click "Subscribe Now"
- Use test card: `4111111111111111`
- Any future expiry date and any 3-digit CVV
- See success page

---

## 📚 Documentation

| Document | Purpose | Time |
|----------|---------|------|
| `RAZORPAY_SETUP.md` | Complete setup guide | 20 min |
| `TESTING.md` | Test cases & debugging | 2-3 hours |
| `MIGRATION_SUMMARY.md` | What changed | 10 min |
| `IMPLEMENTATION_COMPLETE.md` | Project summary | 15 min |

---

## 🔑 Key Files

### Backend
- `lib/razorpay.js` - Client initialization
- `utils/razorpay.js` - Helper functions
- `app/api/payment/create-checkout-session/route.js` - Order creation
- `app/api/payment/webhook/route.js` - Webhook handling
- `app/api/payment/session/[sessionId]/route.js` - Order details

### Frontend
- `app/subscriptions/page.js` - Payment UI with Razorpay modal
- `app/payment/success/page.js` - Success confirmation

---

## 🧪 Test Cards

### Success
- Visa: `4111111111111111`
- Mastercard: `5555555555554444`

### Failure
- Visa: `4000000000000002`
- Mastercard: `5105105105105100`

**Expiry**: Any future date  
**CVV**: Any 3 digits

---

## 🔐 Environment Variables

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public | Yes | `rzp_test_xxxx` |
| `RAZORPAY_KEY_SECRET` | Secret | Yes | `secret_key_xxxx` |
| `RAZORPAY_WEBHOOK_SECRET` | Secret | Yes | `webhook_secret_xxxx` |
| `MONGODB_URI` | Secret | Yes | `mongodb://...` |
| `NEXTAUTH_URL` | Public | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret | Yes | `random_string` |

---

## ✅ Quick Checklist

- [ ] Get Razorpay credentials
- [ ] Add environment variables
- [ ] Run `npm run dev`
- [ ] Test subscription payment
- [ ] Check success page
- [ ] Verify database update
- [ ] Test coupon (optional)
- [ ] Ready to deploy!

---

## 🚀 For Production

1. Get **live** Razorpay credentials (no `rzp_test_` prefix)
2. Update environment variables with live credentials
3. Set up webhook: Dashboard → Settings → Webhooks
4. Test thoroughly in staging
5. Deploy to production

---

## 🆘 Troubleshooting

**Modal not opening?**
```
→ Check browser console for errors
→ Verify NEXT_PUBLIC_RAZORPAY_KEY_ID is set
→ Ensure Razorpay script loaded
```

**Payment not processing?**
```
→ Check order was created successfully
→ Verify payment method is supported
→ Check browser console for errors
```

**Webhook not working?**
```
→ Verify webhook URL is public
→ Check webhook secret matches
→ Ensure events are selected
```

See `TESTING.md` for detailed debugging.

---

## 📱 Payment Methods Supported

- 💳 Credit/Debit Cards (Visa, Mastercard, Amex)
- 🔗 UPI
- 🏦 Net Banking
- 👛 Wallets (Paytm, PhonePe, Google Pay, etc.)

---

## 📞 Support

- **Docs**: https://razorpay.com/docs/api/
- **Dashboard**: https://dashboard.razorpay.com/
- **Support**: https://razorpay.com/support/
- **Project Docs**: See documentation files in root

---

## 💡 Useful Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Check logs
tail -f .next/logs/build.log
```

---

**Status**: ✅ Ready to use  
**Last Updated**: June 3, 2026  
**Version**: 1.0  

Start here → [RAZORPAY_SETUP.md](RAZORPAY_SETUP.md)
