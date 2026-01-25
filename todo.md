# K.S Salong - Project TODO

## Phase 1: Database Schema & Infrastructure
- [x] Design complete database schema with all tables
- [x] Implement multi-tenant support
- [x] Set up Drizzle ORM with MySQL
- [x] Create database migrations

## Phase 2: Authentication & Permissions
- [x] Multi-role system (Owner, Manager, Barber, Cashier)
- [x] Secure login with JWT
- [ ] Optional 2FA implementation
- [x] Granular permission system
- [x] PIN-based employee login for POS

## Phase 3: Services & Products Management
- [x] CRUD for services (name, duration, price, MVA tax)
- [x] CRUD for products (name, SKU, price, inventory, image)
- [x] Staff assignment to services
- [ ] Product image upload to S3

## Phase 4: Appointment Booking System
- [ ] Interactive calendar view
- [ ] Service and staff selection
- [ ] Time slot generation and availability
- [ ] Double-booking prevention
- [ ] Appointment statuses (Pending, Confirmed, Checked-in, No-show, Cancelled, Completed)
- [ ] Reschedule functionality
- [ ] Cancellation policy enforcement

## Phase 5: Drop-in Queue
- [ ] Add walk-in customer to queue
- [ ] Automatic queue ordering
- [ ] Drag-and-drop reordering
- [ ] Queue to appointment conversion
- [ ] Wait time estimation

## Phase 6: Payment Integration
- [ ] Vipps payment integration
- [ ] Stripe Checkout integration
- [ ] Stripe Payment Intents
- [ ] Refund handling
- [ ] Webhooks for both providers
- [ ] Stripe Connect for multi-salon
- [ ] Payment status tracking

## Phase 7: POS/Cashier System
- [ ] Service and product selection
- [ ] Customer selection (optional)
- [ ] Discount application
- [ ] Tip handling
- [ ] Multiple payment methods (Vipps, Stripe, Cash, Gift card)
- [ ] Receipt generation (Kvittering)
- [ ] 80mm receipt printing
- [ ] Refund processing with notes

## Phase 8: Staff Time Tracking
- [ ] Clock In/Out functionality
- [ ] Break tracking
- [ ] Daily time logs
- [ ] Manager editing with Audit Log
- [ ] Regular hours calculation
- [ ] Overtime calculation
- [ ] Weekly/monthly summaries

## Phase 9: CRM System
- [ ] Customer profiles (name, phone, email, preferences)
- [ ] Visit history tracking
- [ ] Total spending calculation
- [ ] Customer notes and alerts
- [ ] Tags (VIP, New, Regular, etc.)
- [ ] Quick search functionality
- [ ] Duplicate customer merging
- [ ] GDPR compliance (data export/delete)

## Phase 10: Reporting System
- [ ] Dashboard with key metrics
- [ ] Sales reports (daily/weekly/monthly)
- [ ] Booking analytics
- [ ] Staff performance reports
- [ ] No-show tracking
- [ ] Average invoice value
- [ ] Best services/staff analysis
- [ ] Daily report auto-generation (Excel + PDF)
- [ ] Report storage in S3
- [ ] Email delivery to owner

## Phase 11: Settings Management
- [ ] MVA tax configuration
- [ ] Business hours setup
- [ ] Holiday management
- [ ] Vipps API keys configuration
- [ ] Stripe API keys configuration
- [ ] Stripe Connect setup
- [ ] Notification templates
- [ ] Cancellation policy settings
- [ ] Email/SMS reminder timing

## Phase 12: Frontend UI (Elegant Design)
- [ ] Landing page with booking widget
- [ ] Admin dashboard with elegant design
- [ ] Calendar/Appointments view
- [ ] Queue management interface
- [ ] POS interface
- [ ] Customer management interface
- [ ] Employee management interface
- [ ] Products & Services interface
- [ ] Reports interface
- [ ] Settings interface
- [ ] Responsive design for all screens

## Phase 13: Notifications & Automation
- [ ] Email notification system
- [ ] SMS notification system (optional with Twilio)
- [ ] Booking confirmation emails
- [ ] 24-hour reminder
- [ ] 2-hour reminder
- [ ] No-show notifications to staff
- [ ] Automatic daily report generation

## Phase 14: Testing & Seed Data
- [x] Create 5 test employees
- [x] Create 10 test services
- [x] Create 10 test products
- [x] Create 20 test customers
- [x] Generate random bookings
- [x] Generate sample sales data
- [x] Write unit tests for core features
- [ ] Test all payment flows
- [ ] Test all user roles

## Phase 15: Hostinger Deployment
- [x] Configure for Hostinger Node.js hosting
- [x] Environment variables setup
- [x] Database connection configuration
- [x] S3 storage configuration
- [x] Build optimization
- [x] Deployment documentation (HOSTINGER_DEPLOYMENT.md)
- [x] Production testing guide

## Phase 16: Frontend Pages Implementation
- [x] Appointments page with interactive calendar
- [x] Drop-in Queue management page
- [x] POS/Cashier checkout page
- [ ] Customer CRM page with profiles
- [ ] Reports and analytics dashboard
- [ ] Settings page
- [x] Time tracking page for staff

## Phase 17: Payment Integration
- [ ] Vipps payment integration
- [ ] Stripe payment integration
- [ ] Payment webhooks
- [ ] Refund processing

## Phase 18: Notifications System
- [ ] Email notifications (appointment reminders)
- [ ] SMS notifications (optional)
- [ ] Daily report generation and email
- [ ] No-show notifications to staff

## Bugs to Fix
- [x] Fix Select.Item empty value error in Queue page

## Current Work
- [x] Build POS/Cashier page with service/product selection
- [x] Implement MVA tax calculation (25%)
- [x] Add discount and tip functionality
- [x] Support multiple payment methods (Cash, Card, Vipps, Stripe)
- [x] Generate receipt (Kvittering) dialog with print option

## Time Tracking Implementation
- [x] Build staff time tracking page with clock in/out
- [x] Implement break management system
- [x] Add overtime calculation (weekends auto-flagged)
- [x] Create manager editing interface
- [x] Build daily timesheet view
- [ ] Add export functionality
- [ ] Add automatic logout at end of workday (configurable)

## UI/UX Improvements
- [x] Enhance home page design with better visual hierarchy
- [x] Improve color scheme and gradients
- [x] Add animations and transitions
- [x] Enhance card designs with better shadows and borders
- [x] Improve typography and spacing
- [x] Add icons and visual elements
- [ ] Enhance Appointments page layout
- [ ] Improve Queue page design
- [ ] Polish POS interface
- [ ] Refine Time Clock page
- [ ] Add loading states and skeletons
- [ ] Improve mobile responsiveness

## Sidebar Navigation
- [x] Create reusable Sidebar component with elegant design
- [x] Add navigation links to all main pages
- [x] Implement active state highlighting
- [x] Add user profile section in sidebar
- [x] Update all pages to use Sidebar layout
- [x] Make sidebar responsive (collapsible on mobile)

## Norwegian Translation
- [x] Review all pages for English text
- [x] Translate Home page to Norwegian
- [ ] Translate Appointments page to Norwegian
- [ ] Translate Queue page to Norwegian
- [ ] Translate POS page to Norwegian
- [ ] Translate TimeClock page to Norwegian
- [x] Translate Sidebar component to Norwegian
- [ ] Translate all error messages to Norwegian
- [ ] Translate all toast notifications to Norwegian
- [ ] Translate all button labels to Norwegian
- [ ] Translate all form labels to Norwegian

## Phase 1: Online Booking System
- [x] Build Services Management page (admin)
  - [x] CRUD for services (name, duration, price, MVA, assigned staff)
  - [x] Service availability toggle
  - [ ] Staff assignment interface
- [x] Build Public Booking page for customers
  - [x] Service selection with details
  - [x] Staff selection or "First Available"
  - [x] Smart calendar with conflict prevention
  - [x] Customer information form
  - [x] Booking confirmation
- [ ] Enhance Appointments page in dashboard
  - [ ] Display all bookings in calendar view
  - [ ] Status management (Pending/Confirmed/Checked-in/Cancelled/Completed)
  - [ ] Booking details and editing
  - [ ] Conflict detection and warnings
- [ ] Testing
  - [ ] Test complete booking flow from public page
  - [ ] Verify calendar display in dashboard
  - [ ] Test all booking statuses
  - [ ] Test conflict prevention

## Vipps Payment Integration
- [ ] Set up Vipps API credentials (Client ID, Client Secret, Subscription Key)
- [ ] Create Vipps service module for API calls
- [ ] Implement payment initiation endpoint
- [ ] Build webhook handler for payment confirmation
- [ ] Integrate Vipps payment flow with BookOnline page
- [ ] Auto-confirm bookings after successful payment
- [ ] Store payment transactions in database
- [ ] Generate payment receipts
- [ ] Handle payment failures and refunds
- [ ] Test Vipps integration in test environment

## Enhanced Appointments Calendar
- [ ] Build interactive week/month calendar view
- [ ] Add drag-and-drop rescheduling functionality
- [ ] Implement color-coded status indicators (Pending/Confirmed/Checked-in/Completed)
- [ ] Add quick status update from calendar
- [ ] Add appointment details popup on click
- [ ] Show staff availability in calendar

## Book Online Page Enhancements
- [x] Add settings table with requirePaymentForBooking field
- [x] Create Settings page for admin to control payment requirement
- [x] Add Vipps payment option to booking flow (Step 5: Payment)
- [x] Make payment step conditional based on settings
- [ ] Display payment confirmation after successful Vipps payment
- [ ] Handle payment failures gracefully
- [x] Allow "Pay Later" option when payment is not required

## CRM Page Implementation
- [x] Create customer list API with search and filters
- [x] Add customer statistics (total visits, total spending, last visit)
- [x] Build customer detail view with booking history
- [x] Display customer profile information
- [ ] Show spending breakdown by service/product
- [ ] Add customer tags (VIP, Regular, New)
- [ ] Implement customer notes and alerts
- [ ] Add GDPR compliance features (data export/delete)

## Queue TV Display Implementation
- [x] Create TV display page at /queue-tv
- [x] Show current queue with large, readable fonts
- [x] Display customer name and estimated wait time
- [x] Add auto-refresh every 10 seconds
- [x] Show "Now Serving" section prominently
- [x] Add "Next in Line" section
- [x] Display salon branding and logo
- [x] Add fullscreen mode support (F11 browser feature)
- [x] Show current time and date
- [x] Add smooth animations for queue updates

## QR Code for Queue Join
- [x] Install QR code generation library (qrcode.react)
- [x] Add QR code to TV display pointing to /queue join page
- [x] Position QR code prominently on screen
- [x] Add instructional text in Norwegian
- [x] Test QR code scanning with mobile devices

## Icon Update - Scissors Branding
- [x] Replace Sparkles icon with Scissors in QueueTV.tsx
- [x] Replace Sparkles icon with Scissors in Home.tsx
- [x] Replace Sparkles icon with Scissors in BookOnline.tsx
- [x] Replace Sparkles icon with Scissors in Sidebar.tsx
- [x] Verify consistent branding across application

## Queue TV Display - Icon Size Reduction
- [x] Reduce header logo size (Scissors icon) - from 24x24 to 16x16, icon from h-14 to h-8
- [x] Reduce badge icons sizes (Users, Clock, Smartphone) - from 16x16 to 12x12, icons from h-10 to h-6
- [x] Reduce QR code size for better balance - from 280px to 200px
- [x] Test visual balance on large screen

## Queue TV Display - Update Animations
- [x] Add fade-in animation for new queue items (fadeInUp with scale effect)
- [x] Add slide animation when queue position changes (transition-all duration-500)
- [x] Add pulse animation for "Now Serving" section (animate-pulse built-in)
- [x] Add smooth transition for queue count changes (CSS transitions)
- [x] Test animations on actual queue updates

## QueueTV Bug Fix
- [x] Fix infinite loop in useEffect at line 36 (changed to queue dependency with JSON comparison)
- [x] Fix infinite loop in useEffect at line 20 (removed refetch from dependencies)
- [x] Remove all problematic dependencies causing re-renders
- [x] Test queue updates work correctly after fix

## Tidsstempling (Time Tracking System)
- [x] Create timeEntries table in database schema (already exists)
- [x] Add PIN field to staff table for authentication (already exists in users table)
- [x] Create API endpoints for clock in/out with PIN
- [x] Build Tidsstempling page with PIN pad interface
- [x] Show current logged-in employees with duration
- [ ] Add time reports (daily, weekly, monthly)
- [x] Calculate overtime for weekends (Saturday/Sunday) - implemented in backend
- [ ] Implement automatic logout at configurable time
- [ ] Link all sales/orders to logged-in employee
- [ ] Add employee productivity reports
- [ ] Show total hours worked and sales per employee

## TimeClock Page Bug Fixes
- [x] Fix missing API endpoints (getDailyLogs, getCurrentStatus, updateEntry)
- [x] Fix invalid mutation calls (clockIn/clockOut expecting undefined instead of object)
- [x] Redirect TimeClock to Tidsstempling page (simplified solution)
- [x] Fix TypeScript errors in Tidsstempling.tsx (totalMinutes possibly undefined)

## Sidebar Consistency Fix
- [x] Identify all pages missing DashboardLayout/Sidebar
- [x] Wrap BookOnline.tsx with Layout (includes Sidebar)
- [ ] Keep QueueTV.tsx standalone (TV display doesn't need sidebar)
- [x] Wrap Tidsstempling.tsx with Layout (includes Sidebar)
- [x] Wrap Settings.tsx with Layout (includes Sidebar)
- [x] Wrap Customers.tsx with Layout (includes Sidebar)
- [x] Ensure all admin pages have consistent navigation

## Staff PIN Management
- [x] Add PIN field to Services/Staff page (Tjenester)
- [x] Create UI for setting/updating employee PIN
- [x] Add PIN validation (4-6 digits)
- [x] Ensure PIN is unique per employee
- [x] Add "Reset PIN" functionality for admin

## Time Reports Page
- [x] Create Reports page at /reports
- [x] Add date range selector (daily/weekly/monthly views)
- [x] Display employee work hours with overtime calculation
- [x] Show total hours, regular hours, and overtime hours
- [x] Calculate weekend overtime automatically (Saturday/Sunday)
- [x] Add employee filter dropdown
- [ ] Implement Excel export with filters and totals (UI ready)
- [ ] Implement PDF export with filters and totals (UI ready)
- [x] Show visual charts/graphs for hours worked
- [x] Add summary cards (total employees, total hours, total overtime)

## POS Employee Integration
- [x] Add employee login modal to POS page
- [x] Require PIN before accessing POS
- [x] Display currently logged-in employee in POS header
- [x] Add "Switch Employee" button in POS
- [x] Link all sales/transactions to logged-in employee
- [x] Update orders table to include employeeId field (uses existing staffId)
- [x] Show employee name in transaction history
- [ ] Add employee performance metrics (sales per employee)

## Automatic Logout Feature
- [x] Add autoLogoutTime field to salonSettings table
- [x] Create cron job to check and logout employees at configured time
- [x] Add UI in Settings page to configure auto-logout time (default 22:00)
- [x] Test automatic logout functionality
- [ ] Add notification when employee is auto-logged out (optional enhancement)

## Separate Staff Page
- [x] Extract staff management section from Services.tsx
- [x] Create dedicated Staff.tsx page (Ansatte)
- [x] Add Staff route to App.tsx
- [x] Add "Ansatte" link to Sidebar navigation
- [x] Keep Services.tsx for services only
- [x] Test staff PIN management in new page

## Staff Edit/Delete Functionality
- [x] Add Edit and Delete buttons to each staff card
- [x] Create edit dialog with form fields (name, email, phone, role, isActive)
- [x] Implement staff update mutation
- [x] Implement staff delete mutation with confirmation
- [x] Add form validation for edit dialog
- [x] Test edit and delete operations

## Monthly Calendar View for Appointments (Avtaler)
- [x] Analyze current Appointments page structure
- [x] Design monthly calendar grid UI component
- [x] Add month navigation (previous/next month buttons)
- [x] Fetch all bookings from database for selected month
- [x] Display bookings in calendar cells by date
- [x] Color-code appointments by status (Pending/Confirmed/Completed/Cancelled)
- [x] Make appointments clickable to show details
- [x] Create appointment details dialog
- [x] Add status update functionality in dialog
- [x] Show customer info, service, staff, time in dialog
- [x] Add Google Calendar integration button
- [x] Generate Google Calendar event links
- [x] Test calendar navigation and data display
- [x] Write vitest tests for calendar logic

## Settings Page with Tabbed Navigation
- [x] Create Settings page component with horizontal tabs
- [x] Design tab navigation UI (Oversikt, Google Calendar, Varsler, etc.)
- [x] Implement tab switching functionality
- [x] Create "Oversikt" (Overview) tab with general settings
- [x] Create "Google Calendar" tab for calendar integration settings
- [x] Add Google Calendar sync toggle
- [x] Add calendar selection dropdown
- [x] Add auto-sync frequency settings
- [x] Create "Varsler" (Notifications) tab for notification preferences
- [x] Create "Alle ansatte" (All Staff) tab for staff management
- [x] Style tabs to match reference design
- [x] Test tab navigation and settings persistence

## Unified PIN System with Employee Switching
- [x] Analyze current PIN login system in TimeTracking page
- [x] Change PIN system to use unified PIN for all employees
- [x] Add employee selection screen after PIN entry
- [x] Display all active employees for selection
- [x] Store selected employee in session/context
- [x] Add "Switch Employee" button in POS interface
- [x] Implement employee switching without affecting clock-in time
- [x] Ensure work hours remain tied to original clock-in employee
- [x] Update time tracking calculations to use 60-minute hour system
- [x] Display work hours in HH:MM format (60-minute based)
- [x] Add unified PIN setting in Settings page
- [x] Test PIN login with employee selection
- [x] Test employee switching in POS
- [x] Write vitest tests for PIN and time tracking logic

## Fix Universal PIN Error
- [x] Set default universal PIN (1234) in database
- [x] Verify PIN validation logic in server
- [x] Test PIN entry in Tidsstempling page
- [x] Ensure Settings page can update universal PIN

## Simplify POS Access
- [x] Remove PIN login requirement from POS
- [x] Allow direct access for logged-in admin users
- [x] Add employee switcher button inside POS page
- [x] Show current active employee in POS header
- [x] Keep employee tracking for sales attribution
- [x] Test POS access flow

## Real-Time Visual Indicators
- [ ] Create reusable loading skeleton components
- [ ] Add pulse animations to data cards
- [ ] Add "Live" badges to real-time data
- [ ] Implement flash effects for value changes (green up, red down)
- [ ] Add connection status indicator in header
- [ ] Apply loading states to Dashboard statistics
- [ ] Apply loading states to Appointments calendar
- [ ] Apply loading states to Queue page
- [ ] Apply loading states to POS page
- [ ] Apply loading states to Staff page
- [ ] Apply loading states to Customers page
- [ ] Apply loading states to Reports page
- [ ] Test all visual indicators across pages

## Real-Time Visual Indicators
- [x] Create reusable Skeleton loading component
- [x] Create LiveBadge component for real-time data
- [x] Create FlashValue component for value changes
- [x] Create ConnectionStatus component
- [x] Add loading skeletons to Dashboard stats cards
- [x] Add LiveBadge to Dashboard stats
- [x] Add FlashValue to Dashboard numbers
- [x] Add ConnectionStatus to Layout
- [x] Add real-time refetch intervals to all queries
- [x] Add loading states to Appointments page
- [x] Add loading states to Queue page
- [x] Add loading states to Staff page
- [x] Add loading states to Customers page
- [x] Test all visual indicators

## Add TV Button to Queue Page
- [x] Add TV button to Queue page header
- [x] Open QueueTV page in new window when clicked
- [x] Test TV button functionality

## Products Management Page
- [ ] Create Products page (Produkter) with list view
- [ ] Add search and filter functionality
- [ ] Implement add product dialog (name, SKU, price, quantity, image)
- [ ] Implement edit product functionality
- [ ] Implement delete product with confirmation
- [ ] Add inventory management (increase/decrease quantity buttons)
- [ ] Add product image upload to S3
- [ ] Add Products link to Sidebar navigation
- [ ] Add real-time visual indicators (Live badge, loading states)
- [ ] Write vitest tests for product CRUD operations
- [ ] Test all product management features

## Products Management Page
- [x] Analyze products schema in database
- [x] Create Products page component
- [x] Add products list view with cards
- [x] Add search and filter functionality
- [x] Create add product dialog with form
- [x] Add form validation for product fields
- [x] Implement create product mutation
- [x] Implement edit product dialog
- [x] Implement update product mutation
- [x] Implement delete product with confirmation
- [x] Add inventory management (increase/decrease quantity)
- [x] Add stock status indicators (På lager/Lavt lager)
- [x] Add Products link to Sidebar navigation
- [x] Add Products route to App.tsx
- [x] Test all product management features
- [ ] Write vitest tests for product CRUD operations

## Phase 4: Kvittering + Sales System
### Receipt Generation (Kvittering)
- [x] Generate automatic invoice number (INV-YYYYMMDD-XXX format)
- [x] Display MVA (25%) breakdown clearly
- [x] Show payment method on receipt
- [x] Include all service and product details
- [x] Show discount and tips separately
- [x] Display total amount with MVA included

### 80mm Thermal Printer Support
- [x] Create print-friendly receipt template (80mm width)
- [x] Add salon information header (name, address, phone)
- [x] Design compact layout for thermal printers
- [ ] Add QR code/barcode for invoice reference
- [ ] Test print layout on actual thermal printer
- [x] Add print button with proper CSS @media print

### Sales Records & Reports
- [x] Create Sales page with comprehensive filters
- [x] Filter by date range (today/week/month/custom)
- [x] Filter by employee (show sales per staff member)
- [x] Filter by payment method (Cash/Card/Vipps/Stripe)
- [x] Display sales summary cards (total sales, transactions, average)
- [x] Show detailed transaction list with all information
- [ ] Add export to Excel functionality
- [ ] Add export to PDF functionality
- [ ] Calculate profit margins (selling price - cost price)

### Refund System
- [x] Add refund button to transaction history
- [x] Create refund dialog with reason field (required)
- [x] Update inventory automatically on refund (products only)
- [x] Backend API endpoint for refund processing
- [x] Link refund to original transaction
- [x] Show refund status in transaction list
- [x] Calculate refunded amounts in reports
- [ ] Add refund history view (separate page)
- [ ] Require manager/owner approval for refunds (optional)

### Testing & Validation
- [x] Test receipt generation with all payment methods
- [ ] Test 80mm print layout on actual thermal printer
- [x] Test sales filtering by all criteria
- [x] Test refund process end-to-end
- [x] Write vitest tests for refund logic (5 tests passed)
- [x] Verify MVA calculations are correct

## Fiken Accounting Integration
- [ ] Research Fiken API documentation and endpoints
- [ ] Understand Fiken authentication (OAuth2 or API tokens)
- [ ] Add Fiken API credentials to Settings page
- [ ] Create backend service for Fiken API calls
- [ ] Implement daily sales sync to Fiken
- [ ] Map K.S Salong transactions to Fiken sale format
- [ ] Handle MVA (25%) tax mapping to Fiken
- [ ] Create verification endpoint to compare totals
- [ ] Add UI to trigger manual sync
- [ ] Add UI to view sync status and last sync time
- [ ] Handle Fiken API errors gracefully
- [ ] Add sync history log
- [ ] Write vitest tests for Fiken integration
- [ ] Test end-to-end sales sync flow
- [ ] Document Fiken setup process for users

## Fiken Accounting Integration
- [x] Research Fiken API and authentication methods
- [x] Add Fiken settings to database schema (fikenEnabled, fikenApiToken, fikenCompanySlug, fikenAutoSync)
- [x] Create Fiken service module (server/fiken.ts) with API functions
- [x] Add Fiken configuration UI in Settings page
- [x] Implement test connection feature
- [x] Implement manual sync button for today's sales
- [x] Implement automatic daily sync (optional)
- [x] Create verification system to compare K.S Salong totals with Fiken
- [x] Add sync status indicators and last sync date
- [x] Write vitest tests for Fiken integration (9/9 tests passed)
- [ ] Test with real Fiken test account (requires user's Fiken credentials)
- [x] Document setup process for users (in UI)

## Stripe Connect + WisePOS E Terminal Integration
- [ ] Research Stripe Connect platform setup and requirements
- [ ] Research Stripe Terminal API for WisePOS E reader
- [ ] Understand reader discovery and connection flow
- [ ] Add Stripe Connect credentials to database schema (stripeConnectEnabled, stripeSecretKey, stripePublishableKey, stripeTerminalLocationId)
- [ ] Create Stripe Terminal service module (server/stripeTerminal.ts)
- [ ] Implement reader discovery endpoint
- [ ] Implement reader connection endpoint
- [ ] Implement payment intent creation with Terminal
- [ ] Implement payment collection from reader
- [ ] Add Terminal reader management UI in Settings page
- [ ] Add "Pay with Card Reader" button in POS page
- [ ] Show reader connection status in POS
- [ ] Handle payment success/failure from reader
- [ ] Link Terminal payments to orders table
- [ ] Write vitest tests for Terminal integration
- [ ] Test with actual WisePOS E reader (requires physical device)
- [ ] Document setup process for users

## Online Booking Payment Integration
- [ ] Add requirePaymentForBooking setting (already exists in schema)
- [ ] Create Stripe Checkout session endpoint for booking payments
- [ ] Add paymentIntentId and paymentStatus fields to appointments table
- [ ] Link payment confirmation with appointment auto-confirmation
- [ ] Add payment UI to online booking page (before final confirmation)
- [ ] Create webhook endpoint to handle Stripe payment events
- [ ] Auto-confirm appointment when payment succeeds
- [ ] Cancel/expire appointment if payment fails or times out
- [ ] Show payment status in appointment details
- [ ] Add "Pay Now" button for pending payment appointments
- [ ] Send confirmation email after successful payment
- [ ] Write vitest tests for payment flow
- [ ] Test with Stripe test mode cards

## Vipps Online Booking Payment Integration
- [x] Add vippsOrderId and paymentStatus fields to appointments table
- [x] Create Vipps payment initiation endpoint for bookings
- [x] Generate Vipps payment link with booking details
- [x] Add payment UI to BookOnline page (Step 5: Payment)
- [x] Redirect customer to Vipps app/web for payment
- [x] Implement Vipps webhook handler for payment callbacks
- [x] Auto-confirm appointment when Vipps payment succeeds
- [ ] Cancel/expire appointment if payment fails or times out (30 min)
- [ ] Show payment status in Appointments page
- [ ] Add "Pay with Vipps" button for pending payment appointments
- [ ] Send confirmation SMS/email after successful payment
- [ ] Handle payment refunds when appointment is cancelled
- [x] Write vitest tests for Vipps booking payment flow (6/6 tests passed)
- [ ] Test with Vipps test environment (requires real Vipps credentials)

## Booking Link Management in Settings
- [x] Add "Booking Link" section in Settings page (Booking tab)
- [x] Display full booking URL dynamically based on current domain
- [x] Add copy-to-clipboard button with toast notification
- [ ] Add QR code generator for the booking link
- [ ] Add social media sharing buttons (Facebook, Instagram, WhatsApp)
- [ ] Show booking link statistics (clicks, conversions)

## Custom Booking URL Configuration
- [x] Add customBookingUrl field to salonSettings schema
- [x] Backend automatically saves custom booking URL with settings.update
- [x] Make booking URL field editable in Settings > Booking tab
- [x] Show preview of active URL (custom or default)
- [ ] Add validation for URL format (subdomain or full URL)
- [ ] Update BookOnline route to support custom subdomain redirect
- [ ] Add URL availability checker

## URL Validation and Redirect for Custom Booking URLs
- [x] Add URL validation in Settings UI (check format before saving)
- [x] Show error message for invalid URLs (real-time validation)
- [x] Create redirect middleware to handle custom booking URLs
- [x] Redirect from custom subdomain to /book-online (301 permanent)
- [ ] Add documentation for DNS configuration
- [ ] Test with actual custom domain
