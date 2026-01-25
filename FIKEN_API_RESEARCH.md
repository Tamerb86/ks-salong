# Fiken API Research Notes

## Overview
Fiken.no is a Norwegian online accounting system for small businesses. The API allows integration with external systems.

## API Details
- **Base URL**: `https://api.fiken.no/api/v2`
- **Version**: 2.0.0
- **Protocol**: HTTPS only (TLS required)
- **Documentation**: https://api.fiken.no/api/v2/docs/

## Authentication Methods

### 1. Personal API Tokens (Recommended for K.S Salong)
- **Best for**: Single business integrating their own system
- **Creation**: Rediger konto → API → Personlige API-nøkler
- **Expiration**: Never expires
- **Usage**: Send as Bearer token in Authorization header
- **Cost**: 99 NOK per month for API access

```http
GET https://api.fiken.no/api/v2/companies
Authorization: Bearer <api_token>
```

**Pros**:
- Simple setup - no OAuth flow needed
- Perfect for single salon use case
- Token never expires

**Cons**:
- Cannot be used in third-party applications (violates TOS)
- Must be kept secure

### 2. OAuth2 (For Third-Party Apps)
- **Best for**: Software companies integrating on behalf of multiple customers
- **Requires**: Developer account, Client ID, Client Secret
- **Flow**: Standard OAuth2 authorization code flow
- **Token Expiry**: Yes (with refresh token support)

## Rate Limiting
- **Concurrent requests**: Only 1 allowed at a time
- **Rate limit**: Max 4 requests per second
- **Penalty**: 429 error or potential ban

## Key Endpoints for K.S Salong Integration

### Sales Endpoints
```
GET    /companies/{companySlug}/sales
POST   /companies/{companySlug}/sales/drafts
POST   /companies/{companySlug}/sales/drafts/{draftId}/createSale
GET    /companies/{companySlug}/sales/{saleId}
PUT    /companies/{companySlug}/sales/{saleId}/settled
DELETE /companies/{companySlug}/sales/{saleId}/delete
```

### Key Features
- Create sales drafts
- Convert drafts to actual sales
- Mark sales as settled (paid)
- Delete sales if needed
- Query sales with filters (saleNumber, lastModified, date, contactId)

## MVA (VAT) Handling

Fiken uses VAT codes and types. For Norwegian 25% MVA:

| VAT Code | VAT Type | Description | Valid For |
|----------|----------|-------------|-----------|
| 3 | HIGH | Høy sats (25%) | Sales |
| 31 | MEDIUM | Middels sats | Sales |
| 33 | LOW | Lav sats | Sales |

**For K.S Salong**: Use VAT Code `3` or VAT Type `HIGH` for 25% MVA on sales.

## Sales Data Structure (Expected)

Based on API documentation, a sale object likely includes:
- `saleNumber`: Unique identifier
- `date`: Sale date
- `contactId`: Customer reference (optional)
- `lines`: Array of line items with:
  - `description`: Service/product name
  - `quantity`: Amount sold
  - `unitPrice`: Price per unit
  - `vatType`: VAT type (HIGH for 25%)
  - `account`: Account code for bookkeeping
- `totalAmount`: Total including VAT
- `settled`: Payment status

## Integration Plan for K.S Salong

### Phase 1: Setup
1. User creates Fiken account (if not exists)
2. User enables API module (99 NOK/month)
3. User generates Personal API Token in Fiken
4. User enters token in K.S Salong Settings page

### Phase 2: Daily Sales Sync
1. Aggregate all completed orders for the day
2. Create a sale draft in Fiken with:
   - All line items (services + products)
   - Correct MVA (25%) per line
   - Total amount
3. Convert draft to actual sale
4. Mark as settled (since payment already received in POS)

### Phase 3: Verification
1. Fetch sales from Fiken for date range
2. Compare totals with K.S Salong records
3. Display discrepancies in UI
4. Allow manual reconciliation

## Implementation Notes

### Mapping K.S Salong → Fiken

**Order → Sale**:
- `orderNumber` → `saleNumber` (or use as reference)
- `createdAt` → `date`
- `customerId` → `contactId` (if customer exists in Fiken)
- `orderItems` → `lines[]`

**OrderItem → Sale Line**:
- `itemName` → `description`
- `quantity` → `quantity`
- `unitPrice` → `unitPrice`
- `taxRate` (25%) → `vatType: "HIGH"`

### Account Codes
Need to determine which Fiken account codes to use:
- Services: Typically 3000-3999 (Sales revenue)
- Products: Typically 3000-3999 (Sales revenue)
- May need to fetch account list from Fiken first

### Error Handling
- Handle 429 (rate limit) with retry logic
- Handle 401 (invalid token) - prompt user to update
- Handle 400 (validation errors) - log details
- Handle network errors gracefully

## Cost Consideration
- **Fiken API Module**: 99 NOK per month
- **User must subscribe** to API access in their Fiken account
- K.S Salong should display this requirement clearly

## Next Steps
1. ✅ Research Fiken API (DONE)
2. Add Fiken settings to K.S Salong Settings page
3. Create Fiken service module (`server/fiken.ts`)
4. Implement daily sales sync endpoint
5. Build verification UI
6. Test with real Fiken test account
7. Write vitest tests

## References
- Official API Docs: https://api.fiken.no/api/v2/docs/
- Fiken Help (Norwegian): https://hjelp.fiken.no/api
