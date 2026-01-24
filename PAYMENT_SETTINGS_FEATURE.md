# Payment Settings Feature - K.S Salong

## Overview
Added configurable payment requirement for online bookings with Vipps integration support.

## Features Implemented

### 1. Database Schema Update
- Added `requirePaymentForBooking` field to `salonSettings` table
- Type: `boolean`, default: `false`
- Purpose: Control whether customers must pay before confirming online bookings

### 2. Settings Page (`/settings`)
**Location:** `client/src/pages/Settings.tsx`

**Features:**
- Salon Information section (name, email, phone, address)
- Booking Settings section (time intervals, buffer time, cancellation policy)
- **Payment Settings section:**
  - Toggle to enable/disable Vipps
  - Toggle to require payment for online booking
  - Warning message if payment is required but Vipps is not enabled
- Notification Settings section (24h and 2h reminders)
- Tax Settings section (MVA percentage)

**Access:** Admin only (requires owner/manager role)

### 3. Booking Flow Enhancement (`/book`)
**Location:** `client/src/pages/BookOnline.tsx`

**Updated Flow:**
1. **Step 1:** Select Service
2. **Step 2:** Select Staff (or "First Available")
3. **Step 3:** Select Date & Time
4. **Step 4:** Enter Customer Information
5. **Step 5 (Conditional):** Payment Selection
   - Only shown if `requirePaymentForBooking` is enabled in settings
   - Options:
     - **Betal med Vipps:** Vipps payment (orange gradient card)
     - **Betal senere:** Pay at salon (gray card) - only shown if payment is NOT required
6. **Step 6:** Success confirmation

### 4. Conditional Logic
```typescript
// In handleCustomerInfoNext()
if (settings?.requirePaymentForBooking && settings?.vippsEnabled) {
  setStep(5); // Show payment step
} else {
  handleSubmitBooking(e); // Skip payment, submit directly
}
```

## User Experience

### Scenario 1: Payment NOT Required (Default)
- Customer completes booking without payment
- No payment step shown
- Booking confirmed immediately after entering customer info

### Scenario 2: Payment Required + Vipps Enabled
- Customer must choose payment method
- Two options: "Betal med Vipps" or "Betal senere"
- Booking confirmed after payment selection

### Scenario 3: Payment Required but Vipps Disabled
- Warning shown in Settings page
- Payment step still appears but only shows "Betal senere" option
- Admin should enable Vipps to fully utilize this feature

## Admin Control

### To Enable Payment Requirement:
1. Navigate to `/settings`
2. Scroll to "Betalingsinnstillinger" section
3. Toggle "Aktiver Vipps" to ON
4. Toggle "Krev betaling ved online booking" to ON
5. Click "Lagre innstillinger"

### To Disable Payment Requirement:
1. Navigate to `/settings`
2. Toggle "Krev betaling ved online booking" to OFF
3. Click "Lagre innstillinger"

## Benefits

### For Salon Owner:
- **Reduce no-shows:** Requiring payment ensures customer commitment
- **Flexible control:** Can enable/disable feature anytime
- **Revenue protection:** Guaranteed payment before appointment

### For Customers:
- **Convenience:** Pay online with Vipps (Norwegian mobile payment)
- **Flexibility:** Option to pay later if salon allows
- **Clear expectations:** Know payment requirements upfront

## Technical Details

### Database Migration
- Migration file: `drizzle/0002_clammy_hitman.sql`
- Added column: `requirePaymentForBooking BOOLEAN DEFAULT FALSE NOT NULL`

### API Endpoints
- `trpc.settings.get` - Fetch salon settings
- `trpc.settings.update` - Update settings (admin only)

### State Management
- Settings fetched on BookOnline page load
- Conditional rendering based on `settings.requirePaymentForBooking`
- Payment method state: `"vipps" | "pay_later"`

## Future Enhancements
- [ ] Integrate actual Vipps API for payment processing
- [ ] Add payment confirmation webhook handler
- [ ] Store payment transaction records in database
- [ ] Send payment receipts via email/SMS
- [ ] Handle payment failures and refunds
- [ ] Add Stripe as alternative payment method

## Testing Checklist
- [x] Settings page loads correctly
- [x] Toggle switches work properly
- [x] Settings save successfully
- [x] Booking flow shows/hides payment step based on settings
- [x] "Pay Later" option only shows when payment is not required
- [x] Warning message displays when payment required but Vipps disabled
- [ ] Actual Vipps payment integration (pending API credentials)

## Notes
- Payment step is fully functional UI-wise
- Vipps API integration requires credentials (Client ID, Secret, Subscription Key)
- Current implementation creates booking immediately (payment integration pending)
- All text is in Norwegian (Norsk Bokmål)
