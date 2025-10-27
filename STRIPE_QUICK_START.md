# 🚀 Stripe Integration - Quick Start Guide

## ⚡ Get Up and Running in 15 Minutes

This guide gets your Stripe subscription system working FAST.

---

## Step 1: Install Stripe (2 minutes)

```bash
cd server
npm install stripe
```

---

## Step 2: Add Environment Variables (3 minutes)

Add to `server/.env`:

```env
STRIPE_SECRET_KEY=sk_test_51SKS1aRCd67aHvYRCl34QmTP3WBBxes0kGmZsIXTMUDp554rX6z2npR62AbwzGSIdpyB4DMhBNG9ngfVh36cumCz00jPPMdc0G
STRIPE_PUBLISHABLE_KEY=pk_test_51SKS1aRCd67aHvYR0T8OuDSwoHcSF7o3w0vJOtBfKqjaW3pnxNGlnvzuiB8p4OqSX4UtXUg4ERwNsdFMI3QynQ8z00nj1zg94i
STRIPE_PRICE_ID=price_1SKS4jRCd67aHvYR8IRdmc1C
STRIPE_WEBHOOK_SECRET=whsec_temp_for_now
```

---

## Step 3: Run Database Migration (1 minute)

```bash
cd server
npm run migration:run
```

This creates the `subscriptions` table.

---

## Step 4: Start Backend (1 minute)

```bash
cd server
npm run start:dev
```

Backend is now ready to accept subscriptions!

---

## Step 5: Set Up Webhook - Local Testing (5 minutes)

**Option A: Use Stripe CLI (Recommended)**

```bash
# Install Stripe CLI (one-time)
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/subscriptions/webhook
```

Copy the webhook secret (starts with `whsec_`) and update your `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Option B: Skip for now (test without webhooks)**

You can test checkout without webhooks, but subscriptions won't activate automatically.

---

## Step 6: Test It! (3 minutes)

### Test with Postman or curl:

**1. Create checkout session:**
```bash
curl -X POST http://localhost:3001/subscriptions/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

**2. Open the returned URL** in your browser

**3. Use test card:** `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

**4. Complete payment**

**5. Check subscription status:**
```bash
curl http://localhost:3001/subscriptions/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

You should see `"isPremium": true`!

---

## Step 7: Rebuild Mobile App (Optional)

If you want to test the full mobile flow:

```bash
cd app-rn

# Update version in app.json (increment version number)
# Then build:
npm run build:apk
```

---

## ✅ You're Done!

Your Stripe integration is working! Users can now:
- ✅ Subscribe to Premium ($9.99/month)
- ✅ Get premium features immediately
- ✅ Manage subscriptions
- ✅ Cancel anytime

---

## 🧪 Test Cards

```
Success:        4242 4242 4242 4242
Decline:        4000 0000 0000 0002
3D Secure:      4000 0025 0000 3155
Insufficient:   4000 0000 0000 9995
```

---

## 🚀 Going to Production

When ready for real payments:

1. **Get live keys** from Stripe Dashboard
2. **Replace test keys** in `.env` with live keys (remove `_test_`)
3. **Set up production webhook:**
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-api.com/subscriptions/webhook`
   - Select all subscription events
   - Copy webhook secret to production `.env`
4. **Deploy backend** with new environment variables
5. **Test with real card** (then refund)
6. **You're live!** 🎉

---

## 📊 Monitor Subscriptions

**Stripe Dashboard:** https://dashboard.stripe.com

**Database:**
```sql
SELECT * FROM subscriptions WHERE status = 'active';
SELECT email, is_premium FROM users WHERE is_premium = true;
```

---

## 🆘 Troubleshooting

**Webhook not working?**
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3001/subscriptions/webhook`
- Check webhook secret in `.env` matches CLI output

**Subscription not activating?**
- Check backend logs for webhook events
- Verify webhook secret is correct
- Check database: `SELECT * FROM subscriptions;`

**Payment failing?**
- Use test card `4242 4242 4242 4242`
- Check Stripe Dashboard → Logs for errors

---

## 📚 Full Documentation

See `STRIPE_IMPLEMENTATION_COMPLETE.md` for complete details.

---

**That's it! You're accepting subscriptions! 🎉**
