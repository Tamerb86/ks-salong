# WisePOS E Setup Guide for K.S Salong

This guide provides comprehensive instructions for configuring and using the Stripe Terminal WisePOS E reader with the K.S Salong management system. The WisePOS E is a portable, all-in-one card reader that enables secure in-person payments directly at your salon.

## Overview

The WisePOS E integration allows salon staff to collect payments immediately after completing services. The device connects to your Stripe account and processes card payments (contactless, chip, and swipe) with automatic receipt generation and appointment tracking.

**Key Features:**
- Wireless connectivity via Wi-Fi or cellular
- Built-in receipt printer
- Support for all major card networks
- PCI-compliant security
- Battery-powered for portability
- Integrated with appointment system

## Prerequisites

Before beginning the setup process, ensure you have the following:

1. **Active Stripe Account**: Your salon must have a registered Stripe account with Terminal capabilities enabled
2. **WisePOS E Device**: Physical reader device ordered through Stripe Dashboard
3. **Admin Access**: Access to both Stripe Dashboard and K.S Salong Settings page
4. **Network Connection**: Stable Wi-Fi network at your salon location

## Step 1: Configure Terminal Location in Stripe Dashboard

A Terminal Location represents a physical location where readers will be used. Each location has unique configuration settings for receipts, currency, and reader management.

### 1.1 Access Stripe Dashboard

1. Navigate to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Log in with your Stripe account credentials
3. Ensure you are in **Live Mode** (toggle in top-right corner) for production use, or **Test Mode** for testing

### 1.2 Create Terminal Location

1. In the left sidebar, navigate to **Terminal** → **Locations**
2. Click **+ New location** button
3. Fill in the location details:

| Field | Description | Example |
|-------|-------------|---------|
| **Display name** | Name shown in dashboard and receipts | "K.S Salong Porsgrunn" |
| **Address** | Physical address of your salon | Street, postal code, city |
| **Configuration set** | Payment settings template | "Default" or create custom |

4. Click **Create location**
5. **Important**: Copy the **Location ID** (starts with `tml_`) - you will need this in Step 2

### 1.3 Configure Receipt Settings (Optional)

1. Click on your newly created location
2. Navigate to **Receipt settings** tab
3. Customize receipt appearance:
   - Upload salon logo
   - Add footer text (e.g., "Takk for besøket!")
   - Configure receipt format (email, print, or both)

## Step 2: Register WisePOS E Reader

### 2.1 Power On and Connect Device

1. **Charge the device**: Connect WisePOS E to power using the included USB-C cable (minimum 50% battery recommended)
2. **Power on**: Press and hold the power button on the right side for 3 seconds
3. **Select language**: Choose Norwegian (Norsk) from the language menu
4. **Connect to Wi-Fi**:
   - Select your salon's Wi-Fi network
   - Enter the Wi-Fi password
   - Wait for connection confirmation (green checkmark)

### 2.2 Register Reader in Stripe Dashboard

1. Return to Stripe Dashboard → **Terminal** → **Readers**
2. Click **+ Register reader** button
3. Select **WisePOS E** as the reader type
4. Choose the **Location** you created in Step 1.2
5. Enter a **Label** for the reader (e.g., "Reception Terminal", "Barber Station 1")
6. Click **Register reader**

### 2.3 Complete Device Pairing

1. On the WisePOS E screen, you should see a **pairing code** (6-digit number)
2. Enter this code in the Stripe Dashboard when prompted
3. Wait for confirmation message: "Reader successfully registered"
4. The device will download necessary updates (this may take 5-10 minutes)
5. Once complete, the device will display "Ready to accept payments"

**Troubleshooting**: If pairing fails, restart the device and ensure it has a stable internet connection. The pairing code expires after 10 minutes.

## Step 3: Configure K.S Salong Settings

### 3.1 Enable Stripe Terminal

1. Log in to K.S Salong Dashboard as an admin
2. Navigate to **Innstillinger** (Settings) in the sidebar
3. Click on the **Betaling** (Payment) tab
4. Scroll to the **Stripe Terminal** section
5. Toggle **Aktiver Stripe Terminal** to ON (enabled)

### 3.2 Enter Terminal Location ID

1. In the **Terminal Location ID** field, paste the Location ID you copied in Step 1.2
   - Format: `tml_xxxxxxxxxxxxxxxxx`
   - Example: `tml_1PQR2STUVWXYZabcd`
2. Click **Lagre innstillinger** (Save settings)
3. Wait for success confirmation message

### 3.3 Verify Reader Connection

1. Navigate to **Terminal Betaling** in the sidebar
2. The page should display your registered reader(s) in the dropdown menu
3. Reader status should show as **online**
4. If no readers appear, verify:
   - Terminal Location ID is correct
   - WisePOS E is powered on and connected to internet
   - Reader is registered to the correct location in Stripe Dashboard

## Step 4: Process Test Payment

Before using the system with real customers, perform a test transaction to ensure everything works correctly.

### 4.1 Create Test Appointment

1. Navigate to **Avtaler** (Appointments) in the dashboard
2. Create a test appointment with:
   - Test customer name
   - Any service (e.g., "Herreklipp")
   - Status: **Bekreftet** (Confirmed)
   - Payment status: **Pending**

### 4.2 Process Terminal Payment

1. In the appointments list, locate your test appointment
2. Click **Betal med Terminal** button (purple button with card icon)
3. In the payment dialog:
   - Verify customer name and service details
   - Verify amount matches service price
   - Select your WisePOS E reader from dropdown
   - Click **Start betaling** (Start payment)

### 4.3 Complete Payment on Device

1. The WisePOS E will display the payment amount
2. Use a test card:
   - **Test Mode**: Use Stripe test card `4242 4242 4242 4242`
   - **Live Mode**: Use a real card (you can refund immediately after)
3. Follow on-screen instructions:
   - Insert, tap, or swipe card
   - Enter PIN if required
   - Wait for approval
4. The device will print a receipt automatically
5. The dashboard will show **Betaling vellykket!** (Payment successful)
6. The appointment payment status will update to **Paid**

### 4.4 Verify Payment Record

1. Check Stripe Dashboard → **Payments** to confirm the transaction appears
2. In K.S Salong, navigate to **Betalingshistorikk** (Payment History) to see the record
3. If this was a test payment in Live Mode, refund it immediately:
   - Go to Stripe Dashboard → **Payments**
   - Find the transaction
   - Click **Refund** and confirm

## Usage Workflow

Once setup is complete, staff can collect payments using this workflow:

### Daily Operations

1. **Power on WisePOS E** at the start of each day
2. Verify device shows "Ready to accept payments"
3. Keep device charged throughout the day (battery lasts 8-10 hours)

### Collecting Payment After Service

1. Complete the customer's service
2. Open **Avtaler** (Appointments) page
3. Find the customer's appointment
4. Click **Betal med Terminal** button
5. Select the appropriate reader (if multiple)
6. Click **Start betaling**
7. Hand the WisePOS E to the customer
8. Customer completes payment
9. Receipt prints automatically
10. Appointment status updates to **Paid**

### End of Day

1. Review all payments in **Betalingshistorikk**
2. Reconcile with Stripe Dashboard if needed
3. Charge WisePOS E overnight

## Troubleshooting

### Reader Not Appearing in Dropdown

**Possible Causes:**
- Terminal Location ID is incorrect
- Reader is offline or not connected to internet
- Reader is registered to a different location

**Solutions:**
1. Verify Location ID in Settings matches Stripe Dashboard
2. Check WisePOS E Wi-Fi connection (Settings → Network on device)
3. Restart the WisePOS E device
4. Verify reader is registered to the correct location in Stripe Dashboard

### Payment Fails with "Reader Busy" Error

**Cause**: Another payment is in progress or the previous payment was not properly cancelled.

**Solution:**
1. On the WisePOS E, press the red X button to cancel any pending action
2. Wait 10 seconds
3. Try the payment again

### Device Shows "Connection Lost"

**Cause**: Wi-Fi connection dropped or internet is unavailable.

**Solution:**
1. Check salon Wi-Fi is working (test on phone/computer)
2. On WisePOS E, go to Settings → Network
3. Reconnect to Wi-Fi network
4. If problem persists, restart the device

### Payment Succeeds but Appointment Status Not Updated

**Cause**: Network issue between K.S Salong and database.

**Solution:**
1. Verify payment in Stripe Dashboard (payment was processed)
2. Manually refresh the Appointments page
3. If status still shows "Pending", manually update it to "Paid"
4. Contact support if issue persists

### Receipt Not Printing

**Possible Causes:**
- Printer paper is empty
- Printer hardware issue

**Solutions:**
1. Check paper roll in WisePOS E (open back cover)
2. Replace paper if empty (thermal paper, 57mm width)
3. Restart device if paper is present but not printing
4. Customer can receive digital receipt via email (configure in Stripe Dashboard)

## Security Best Practices

1. **Physical Security**: Keep WisePOS E in a secure location when not in use
2. **Access Control**: Only authorized staff should handle the device
3. **Software Updates**: Device updates automatically, but verify periodically in Stripe Dashboard
4. **PCI Compliance**: Never store card numbers or PIN codes - the device handles all sensitive data
5. **Network Security**: Use a secure, password-protected Wi-Fi network

## Support Resources

### Stripe Support
- **Documentation**: [https://stripe.com/docs/terminal](https://stripe.com/docs/terminal)
- **Support Email**: support@stripe.com
- **Phone**: Available in Stripe Dashboard under Help

### K.S Salong Support
- **Settings Page**: Built-in help text and tooltips
- **Payment History**: Review all transactions and troubleshoot issues
- **Dashboard**: Real-time status of all readers and payments

### Device Specifications

| Specification | Details |
|---------------|---------|
| **Model** | Stripe WisePOS E |
| **Connectivity** | Wi-Fi (2.4GHz/5GHz), 4G LTE (optional) |
| **Battery** | 3,000 mAh, 8-10 hours typical use |
| **Display** | 5.5" touchscreen, 720x1280 resolution |
| **Printer** | Built-in thermal printer, 57mm paper |
| **Card Support** | Contactless (NFC), chip (EMV), magnetic stripe |
| **Dimensions** | 190mm x 85mm x 55mm |
| **Weight** | 490g |

## Conclusion

The WisePOS E integration streamlines payment collection at K.S Salong by connecting in-person card payments directly to your appointment system. With proper setup and staff training, the device enables fast, secure transactions that automatically update customer records and generate receipts.

For additional assistance or questions not covered in this guide, please refer to the support resources listed above or contact your system administrator.

---

**Document Version**: 1.0  
**Last Updated**: January 25, 2026  
**Author**: Manus AI
