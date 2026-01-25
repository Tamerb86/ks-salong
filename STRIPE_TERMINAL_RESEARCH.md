# Stripe Terminal + WisePOS E Integration Research

## Overview
Stripe Terminal allows businesses to accept in-person card payments using card readers like the **BBPOS WisePOS E**. For K.S Salong, we'll use the **server-driven integration** which uses the Stripe API instead of mobile SDKs.

---

## Why Server-Driven Integration?

**Advantages:**
- Works with any backend infrastructure (Node.js, .NET, etc.)
- Reader connects directly to Stripe servers over internet (not local network)
- Simpler architecture - no need for iOS/Android SDKs
- Can prototype with curl/API calls
- Ideal for web-based POS systems like K.S Salong

**Limitations:**
- Does NOT support mobile readers (Stripe M2, BBPOS Chipper)
- Does NOT support offline payments
- Only works with smart readers (WisePOS E, S700, Verifone)

---

## BBPOS WisePOS E Specifications

**Device Type:** Smart countertop/handheld reader  
**Connectivity:** WiFi or Ethernet (via optional dock)  
**Payment Methods:** Chip, contactless (NFC), swipe  
**Display:** Touchscreen LCD with customizable interface  
**Battery:** Built-in rechargeable battery  
**Software:** Managed automatically by Stripe (updates at midnight)

**Compatible Integrations:**
- ✅ Server-driven (recommended for web apps)
- ✅ JavaScript SDK
- ✅ iOS SDK
- ✅ Android SDK
- ✅ React Native SDK

---

## Integration Architecture

```
┌─────────────────┐
│   POS Frontend  │ (K.S Salong React app)
│  (React + tRPC) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend Server │ (Express + tRPC)
│   (Node.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Stripe API    │
│  (Terminal API) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WisePOS E      │ (Physical reader)
│   Reader        │
└─────────────────┘
```

---

## Server-Driven Payment Flow

### 1. **Register Reader** (One-time setup)
```http
POST /v1/terminal/readers
{
  "registration_code": "puppy-dog-crab",
  "label": "K.S Salong - Counter 1",
  "location": "tml_xxxxx"
}
```

### 2. **Create Payment Intent**
```http
POST /v1/payment_intents
{
  "amount": 50000,  // 500.00 NOK
  "currency": "nok",
  "payment_method_types": ["card_present"],
  "capture_method": "automatic"
}
```

### 3. **Process Payment on Reader**
```http
POST /v1/terminal/readers/:reader_id/process_payment_intent
{
  "payment_intent": "pi_xxxxx"
}
```

### 4. **Listen for Webhooks**
Stripe sends webhooks to notify payment status:
- `terminal.reader.action_succeeded` → Payment collected
- `terminal.reader.action_failed` → Payment failed
- `payment_intent.succeeded` → Payment confirmed

---

## Required Stripe Setup

### 1. **Create Stripe Account**
- Sign up at https://stripe.com
- Complete business verification (required for live payments)

### 2. **Enable Terminal**
- Go to Dashboard → Terminal
- Order WisePOS E reader (or use test mode with simulated reader)

### 3. **Create Location**
```http
POST /v1/terminal/locations
{
  "display_name": "K.S Salong",
  "address": {
    "line1": "Salon Address",
    "city": "Oslo",
    "country": "NO",
    "postal_code": "0123"
  }
}
```

### 4. **Get API Keys**
- Dashboard → Developers → API keys
- Copy **Secret Key** (sk_test_... or sk_live_...)
- Copy **Publishable Key** (pk_test_... or pk_live_...)

---

## Database Schema Changes

Add to `salonSettings` table:
```typescript
stripeTerminalEnabled: boolean("stripe_terminal_enabled").default(false),
stripeSecretKey: text("stripe_secret_key"),
stripePublishableKey: text("stripe_publishable_key"),
stripeTerminalLocationId: text("stripe_terminal_location_id"),
```

Add `terminalReaders` table:
```typescript
export const terminalReaders = mysqlTable("terminalReaders", {
  id: varchar("id", { length: 255 }).primaryKey(), // Stripe reader ID
  label: varchar("label", { length: 255 }).notNull(),
  locationId: varchar("location_id", { length: 255 }).notNull(),
  serialNumber: varchar("serial_number", { length: 255 }),
  status: varchar("status", { length: 50 }), // online, offline
  ipAddress: varchar("ip_address", { length: 50 }),
  registeredAt: timestamp("registered_at").defaultNow(),
});
```

---

## API Endpoints to Implement

### Backend (tRPC)
1. `terminal.registerReader` - Register new WisePOS E
2. `terminal.listReaders` - Get all registered readers
3. `terminal.createPaymentIntent` - Create payment for reader
4. `terminal.processPayment` - Send payment to reader
5. `terminal.cancelPayment` - Cancel ongoing payment
6. `terminal.getReaderStatus` - Check reader connection

### Webhooks
- `/api/webhooks/stripe-terminal` - Handle Stripe events

---

## Frontend UI Changes

### Settings Page - Terminal Tab
- Enable/disable Terminal
- Add Stripe API keys
- Create Terminal location
- Register readers
- View reader list with status

### POS Page
- Show connected reader status
- "Pay with Card Reader" button
- Payment processing indicator
- Success/failure messages

---

## Testing Strategy

### Test Mode (No physical reader needed)
1. Use Stripe test API keys (sk_test_...)
2. Create **simulated reader** via API:
```http
POST /v1/test_helpers/terminal/readers
{
  "registration_code": "simulated-wpe",
  "location": "tml_xxxxx"
}
```
3. Simulate payments with test cards

### Production Mode (With WisePOS E)
1. Order WisePOS E from Stripe
2. Power on reader and connect to WiFi
3. Get registration code from reader screen
4. Register via API
5. Test real card payments

---

## Cost Breakdown

**Hardware:**
- WisePOS E reader: ~$299 USD (one-time)
- Optional dock: ~$49 USD

**Stripe Fees (Norway):**
- Card present transactions: 1.4% + 1.80 NOK per transaction
- No monthly fees
- No setup fees

**Comparison with Vipps:**
- Vipps: 1% + 1 NOK (cheaper for large transactions)
- Stripe Terminal: Better for international cards

---

## Security Considerations

- ✅ PCI compliance handled by Stripe
- ✅ Card data never touches K.S Salong servers
- ✅ End-to-end encryption from reader to Stripe
- ✅ Automatic security updates from Stripe
- ⚠️ Protect Stripe Secret Key (server-side only, never expose to frontend)

---

## Next Steps

1. ✅ Research completed
2. Add Stripe Terminal credentials to Settings
3. Implement backend API endpoints
4. Create reader registration UI
5. Add "Pay with Card Reader" to POS
6. Test with simulated reader
7. Deploy and test with physical WisePOS E

---

## References

- [Stripe Terminal Documentation](https://docs.stripe.com/terminal)
- [WisePOS E Product Page](https://stripe.com/terminal/wisepose)
- [Server-Driven Integration Guide](https://docs.stripe.com/terminal/payments/setup-integration)
- [WisePOS E Technical Specs](https://docs.stripe.com/terminal/readers/bbpos-wisepos-e)
- [Terminal API Reference](https://docs.stripe.com/api/terminal)
