# Vipps eCom API Integration Guide

## Overview
Vipps eCom API allows merchants to create online payment flows. The customer pays by selecting Vipps, entering their phone number, and confirming payment in the Vipps app.

## API Endpoints

### Base URLs
- **Test:** `https://apitest.vipps.no`
- **Production:** `https://api.vipps.no`

### Key Endpoints
1. **Get Access Token:** `POST /accesstoken/get`
2. **Initiate Payment:** `POST /ecomm/v2/payments`
3. **Capture Payment:** `POST /ecomm/v2/payments/{orderId}/capture`
4. **Cancel Payment:** `PUT /ecomm/v2/payments/{orderId}/cancel`
5. **Refund Payment:** `POST /ecomm/v2/payments/{orderId}/refund`
6. **Get Payment Details:** `GET /ecomm/v2/payments/{orderId}/details`

## Authentication

### Required Headers
```
client_id: Your client ID
client_secret: Your client secret
Ocp-Apim-Subscription-Key: Your subscription key
```

### Access Token Request
```bash
POST /accesstoken/get
Headers:
  client_id: <your-client-id>
  client_secret: <your-client-secret>
  Ocp-Apim-Subscription-Key: <your-subscription-key>
```

Response:
```json
{
  "token_type": "Bearer",
  "expires_in": "86398",
  "ext_expires_in": "0",
  "expires_on": "1495271273",
  "not_before": "1495184574",
  "resource": "00000002-0000-0000-c000-000000000000",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6..."
}
```

## Payment Flow

### 1. Initiate Payment
```bash
POST /ecomm/v2/payments
Headers:
  Authorization: Bearer <access_token>
  Ocp-Apim-Subscription-Key: <subscription-key>
  Content-Type: application/json
  
Body:
{
  "customerInfo": {
    "mobileNumber": "4791234567" // Optional
  },
  "merchantInfo": {
    "merchantSerialNumber": "123456",
    "callbackPrefix": "https://yourdomain.com/api/vipps/callback",
    "fallBack": "https://yourdomain.com/booking/confirmation",
    "isApp": false
  },
  "transaction": {
    "orderId": "acme-shop-123-order123abc",
    "amount": 49900, // 499.00 NOK in øre
    "transactionText": "Booking at K.S Salong",
    "timeStamp": "2018-12-12T11:18:38.246Z"
  }
}
```

Response:
```json
{
  "orderId": "acme-shop-123-order123abc",
  "url": "https://api.vipps.no/dwo-api-application/v1/deeplink/vippsgateway?v=2&token=..."
}
```

### 2. Callback from Vipps
Vipps will call your `callbackPrefix` URL with payment status:

```
POST https://yourdomain.com/api/vipps/callback/v2/payments/{orderId}
Headers:
  Authorization: Bearer <access_token>
  
Body:
{
  "merchantSerialNumber": "123456",
  "orderId": "acme-shop-123-order123abc",
  "transactionInfo": {
    "amount": 49900,
    "status": "RESERVED", // or "SALE", "CANCELLED", "REJECTED"
    "timeStamp": "2018-12-12T11:18:38.246Z",
    "transactionId": "5001420062"
  }
}
```

### 3. Capture Payment
After goods are shipped or service is provided:

```bash
POST /ecomm/v2/payments/{orderId}/capture
Headers:
  Authorization: Bearer <access_token>
  Ocp-Apim-Subscription-Key: <subscription-key>
  Content-Type: application/json
  
Body:
{
  "merchantInfo": {
    "merchantSerialNumber": "123456"
  },
  "transaction": {
    "amount": 49900,
    "transactionText": "Booking confirmed"
  }
}
```

### 4. Get Payment Details
```bash
GET /ecomm/v2/payments/{orderId}/details
Headers:
  Authorization: Bearer <access_token>
  Ocp-Apim-Subscription-Key: <subscription-key>
```

## Payment States
- **INITIATE:** Payment initiated
- **REGISTER:** User has accepted in Vipps app
- **RESERVE:** Amount is reserved (pending capture)
- **SALE:** Direct sale (auto-captured)
- **CAPTURE:** Payment captured
- **CANCEL:** Payment cancelled
- **REFUND:** Payment refunded
- **REJECTED:** User rejected payment
- **FAILED:** Payment failed

## Important Notes

1. **Amounts:** Must be in NOK, in øre (minor units). 1 kr = 100 øre
2. **OrderId:** Must be unique, max 50 characters, alphanumeric
3. **Callbacks:** Don't rely 100% on fallback URL - user may close app
4. **Capture:** Must be done within 180 days of reservation
5. **Test Environment:** Use test credentials and test phone numbers

## Test Credentials
Get test credentials from Vipps Developer Portal:
https://developer.vippsmobilepay.com/

## For K.S Salong Implementation

### Workflow:
1. Customer books appointment on `/book` page
2. Initiate Vipps payment with booking details
3. Redirect customer to Vipps URL
4. Vipps calls webhook after payment
5. Auto-confirm booking if payment successful
6. Send confirmation SMS/email to customer

### Required Environment Variables:
```
VIPPS_CLIENT_ID=your_client_id
VIPPS_CLIENT_SECRET=your_client_secret
VIPPS_SUBSCRIPTION_KEY=your_subscription_key
VIPPS_MERCHANT_SERIAL_NUMBER=your_msn
VIPPS_CALLBACK_PREFIX=https://yourdomain.com/api/vipps/callback
VIPPS_FALLBACK_URL=https://yourdomain.com/booking/confirmation
VIPPS_TEST_MODE=true
```
