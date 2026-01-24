# CRM Feature - Customer Relationship Management

## Overview
Comprehensive CRM page for managing customer database with detailed profiles, booking history, and spending analytics.

## Features Implemented

### 1. Customer List Page (`/customers`)
**Location:** `client/src/pages/Customers.tsx`

**Main Features:**
- **Search Functionality**: Real-time search by name, phone, or email
- **Statistics Dashboard**:
  * Total number of customers
  * Active customers count
  * New customers this month
- **Customer Cards**: Each customer displayed with:
  * Avatar with gradient background
  * Full name
  * Phone number
  * Email address
  * Registration date

### 2. Customer Detail Dialog
**Opens when clicking on any customer card**

**Sections:**
1. **Contact Information**:
   - Phone number
   - Email address
   - Physical address (if available)
   - Date of birth (if available)

2. **Customer Statistics** (3 cards):
   - **Total Visits**: Count of completed appointments
   - **Total Spending**: Sum of all orders (from `orders.total`)
   - **Last Visit**: Date of most recent completed appointment

3. **Booking History**:
   - All appointments (past and future)
   - Service name
   - Status badge with color coding:
     * Pending (yellow)
     * Confirmed (blue)
     * Checked-in (purple)
     * Completed (green)
     * Cancelled (red)
     * No-show (gray)
   - Date and time
   - Staff member name
   - Service price

4. **Customer Notes**:
   - Display any notes saved about the customer

### 3. Database Functions
**Location:** `server/db.ts`

**New Functions:**
- `getCustomerBookingHistory(customerId)`: Fetch all appointments with service and staff details
- `getCustomerStatistics(customerId)`: Calculate total visits, spending, and last visit date

**Existing Functions Used:**
- `getAllCustomers()`: Fetch all active customers
- `getCustomerById(id)`: Fetch single customer details
- `searchCustomers(query)`: Search customers by name, phone, or email

### 4. API Endpoints
**Location:** `server/routers.ts`

**New Endpoints:**
- `customers.getBookingHistory`: Get customer's appointment history
- `customers.getStatistics`: Get customer statistics (visits, spending, last visit)

**Existing Endpoints:**
- `customers.list`: Get all customers
- `customers.getById`: Get single customer
- `customers.search`: Search customers
- `customers.create`: Create new customer
- `customers.update`: Update customer information

## User Experience

### Navigation
- Access via `/customers` route
- Also accessible from Dashboard sidebar "Kunder" link

### Workflow
1. **View Customer List**: See all customers with basic info
2. **Search**: Filter customers by typing in search bar
3. **View Details**: Click any customer card to open detail dialog
4. **Review History**: See complete booking history with status
5. **Check Statistics**: View total visits, spending, and last visit
6. **Close**: Click X or outside dialog to return to list

## Design Elements

### Color Scheme
- **Purple-Amber Gradient**: Main theme colors
- **Status Colors**: 
  * Yellow: Pending
  * Blue: Confirmed
  * Purple: Checked-in
  * Green: Completed
  * Red: Cancelled
  * Gray: No-show

### Icons
- Users icon for main page header
- User icon for individual customer avatars
- Phone, Mail, Calendar, Clock icons for information display
- TrendingUp icon for spending statistics

### Layout
- **Responsive Grid**: 3-column stats cards on desktop
- **Card-based Design**: Clean, modern card layout
- **Modal Dialog**: Full-screen dialog for customer details
- **Gradient Backgrounds**: Purple-to-amber gradients throughout

## Technical Details

### Data Flow
1. **Customer List**: `trpc.customers.list.useQuery()` → Display all customers
2. **Customer Details**: `trpc.customers.getById.useQuery(id)` → Show profile
3. **Booking History**: `trpc.customers.getBookingHistory.useQuery(customerId)` → Display appointments
4. **Statistics**: `trpc.customers.getStatistics.useQuery(customerId)` → Show metrics

### State Management
- `searchQuery`: Local state for search filter
- `selectedCustomerId`: Local state for dialog control
- React Query (tRPC): Server state management with automatic caching

### Database Queries
- **Booking History**: LEFT JOIN appointments with services and users tables
- **Statistics**: 
  * COUNT completed appointments
  * SUM order totals
  * MAX appointment date for last visit

## Benefits

### For Salon Owner:
- **Complete Customer View**: All information in one place
- **Spending Insights**: See which customers are most valuable
- **Visit Tracking**: Monitor customer frequency
- **Quick Search**: Find customers instantly
- **Booking History**: Review past services and preferences

### For Staff:
- **Customer Context**: Know customer history before appointment
- **Service Preferences**: See what services customer usually books
- **Contact Information**: Easy access to phone and email
- **Notes Review**: Read any special instructions or preferences

## Future Enhancements
- [ ] Add customer tags (VIP, Regular, New)
- [ ] Implement customer notes editing
- [ ] Add GDPR compliance features (data export/delete)
- [ ] Create customer loyalty program integration
- [ ] Add customer birthday reminders
- [ ] Implement customer feedback/reviews
- [ ] Add customer communication history (SMS/Email)
- [ ] Create customer segmentation for marketing
- [ ] Add customer lifetime value (LTV) calculation
- [ ] Implement customer retention analytics

## Testing Checklist
- [x] Customer list loads correctly
- [x] Search functionality works
- [x] Statistics cards display accurate counts
- [x] Customer detail dialog opens on click
- [x] Contact information displays properly
- [x] Statistics calculate correctly
- [x] Booking history shows all appointments
- [x] Status badges display with correct colors
- [x] Dialog closes properly
- [ ] Write vitest unit tests for customer functions
- [ ] Test with large customer datasets
- [ ] Test search performance

## Notes
- All text is in Norwegian (Norsk Bokmål)
- Uses date-fns with Norwegian locale for date formatting
- Responsive design works on mobile and desktop
- Empty states handled gracefully (no customers, no bookings)
- Loading states with spinner for better UX
