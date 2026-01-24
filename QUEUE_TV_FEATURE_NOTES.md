# Queue TV Display Feature

## Overview
Large-screen TV display for showing the queue in real-time to customers waiting in the salon. Designed for public viewing with extra-large fonts and auto-refresh functionality.

## Features Implemented

### 1. TV Display Page (`/queue-tv`)
**Location:** `client/src/pages/QueueTV.tsx`

**Main Sections:**

#### Header
- **Salon Branding**: 
  * Large logo (Sparkles icon in white rounded square)
  * Salon name "K.S Salong" in huge 7xl font
  * Tagline "Luksus OG Rimelige PRISER!"
- **Live Clock**: 
  * Current time in HH:mm format (6xl font)
  * Current date in Norwegian (e.g., "lørdag, 24. januar 2026")
  * Updates every second

#### Now Serving Section
- **Prominent Display**: 
  * Animated pulse effect to draw attention
  * Green badge with Users icon
  * "Nå betjener vi:" heading (5xl font)
  * Customer name in 9xl font (extra large for visibility)
  * Service name below (4xl font)
- **Empty State**: 
  * Shows "Ingen kunder blir betjent akkurat nå" when no one is being served
  * Gray Users icon with message

#### Next in Line Section
- **Highlighted Display**:
  * Amber/orange border to distinguish from main queue
  * Amber badge with Users icon
  * "Neste i køen:" heading (4xl font)
  * Customer name in 7xl font
  * Service name below (3xl font)
- **Only shows when there's a next customer**

#### Queue List Section
- **Queue Counter**: 
  * Blue badge with Users icon
  * "I køen (X)" heading showing total count
- **Customer Cards**:
  * Each customer shown in a card with:
    - Position number in gradient circle (purple-to-amber)
    - Customer name (5xl font)
    - Service name (2xl font)
    - Estimated wait time (4xl font on right side)
  * Default wait time: 15 minutes if not specified
- **Empty State**:
  * Shows "Ingen kunder i køen" with "Velkommen inn!" message
  * Gray Users icon

#### Footer
- **Contact Information**:
  * Address: Storgata 122C, 3915 Porsgrunn
  * Phone: +47 929 81 628
  * Achievement: Norgesmester 2022

### 2. Design Elements

**Color Scheme:**
- **Background**: Purple-to-amber gradient (from-purple-600 via-purple-700 to-amber-600)
- **Cards**: White/10 with backdrop blur (glassmorphism effect)
- **Borders**: White/30 with 4px width for prominence
- **Status Colors**:
  * Green: Now serving
  * Amber: Next in line
  * Blue: Queue list
  * Purple-to-Amber gradient: Position numbers

**Typography:**
- **9xl**: Customer name when being served (extra large)
- **7xl**: Salon name, next customer name
- **6xl**: Clock time
- **5xl**: Section headings, queue customer names
- **4xl**: Service names, wait times, empty state messages
- **3xl**: Contact info, date
- **2xl**: Service names in queue

**Visual Effects:**
- **Glassmorphism**: backdrop-blur-lg on all cards
- **Shadows**: shadow-2xl for depth
- **Rounded Corners**: rounded-3xl for modern look
- **Pulse Animation**: on "Now Serving" section
- **Gradient Backgrounds**: Purple-amber throughout

### 3. Auto-Refresh Functionality

**Multiple Refresh Methods:**
1. **tRPC refetchInterval**: Automatic refetch every 10 seconds via React Query
2. **Manual Interval**: Backup refetch every 10 seconds using setInterval
3. **Clock Update**: Updates every 1 second for live time display

**Why Multiple Methods:**
- Ensures data stays fresh even if one method fails
- React Query handles caching and deduplication
- Manual interval provides redundancy

### 4. Database Integration

**Modified Function:**
- `getActiveQueue()` in `server/db.ts`:
  * Now includes LEFT JOIN with services table
  * Returns serviceName along with queue data
  * Ordered by position (ascending)
  * Filters by status (waiting, in_service)

**Data Structure:**
```typescript
{
  id: number;
  customerName: string;
  customerPhone: string | null;
  serviceId: number;
  serviceName: string | null;  // NEW: from services table
  preferredStaffId: number | null;
  position: number;
  status: 'waiting' | 'in_service' | 'completed' | 'cancelled';
  estimatedWaitTime: number | null;
  convertedToAppointmentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. User Experience

**Viewing Experience:**
- **Large Fonts**: All text is oversized for visibility from distance
- **High Contrast**: White text on purple gradient for readability
- **Clear Hierarchy**: Now Serving > Next in Line > Queue List
- **Live Updates**: Auto-refresh every 10 seconds without page reload
- **Real-time Clock**: Shows current time and date
- **Empty States**: Friendly messages when no customers

**Intended Use:**
- Mount on large TV screen in salon waiting area
- Customers can see their position without asking
- Staff can reference the display when calling next customer
- Reduces anxiety by showing wait times
- Professional appearance enhances salon image

### 6. Technical Details

**Route:** `/queue-tv`

**Dependencies:**
- `trpc.queue.list.useQuery()` - Fetch queue data
- `date-fns` with `nb` locale - Norwegian date formatting
- `lucide-react` - Icons (Clock, Sparkles, Users)
- React hooks: `useState`, `useEffect`

**Performance:**
- Lightweight queries (only active queue items)
- Efficient re-renders (React Query caching)
- No heavy animations (only pulse on serving section)
- Optimized for long-running display

### 7. Fullscreen Mode

**Browser Fullscreen:**
- Users can press F11 to enter fullscreen mode
- No UI elements needed (browser handles it)
- Exit with F11 or Esc key

**Recommended Setup:**
1. Open `/queue-tv` on TV browser
2. Press F11 for fullscreen
3. Let it run continuously
4. Auto-refresh keeps data current

## Benefits

### For Customers:
- **Transparency**: See exact position in queue
- **Reduced Anxiety**: Know estimated wait time
- **No Need to Ask**: Information always visible
- **Professional Experience**: Modern digital display

### For Salon:
- **Reduced Interruptions**: Fewer "how long?" questions
- **Modern Image**: High-tech professional appearance
- **Better Flow**: Customers self-monitor their turn
- **Marketing**: Shows salon name and achievements

### For Staff:
- **Easy Reference**: Glance at screen to see next customer
- **Reduced Confusion**: Clear visual of queue order
- **Less Repetition**: Don't need to verbally announce queue

## Future Enhancements
- [ ] Add QR code for customers to join queue
- [ ] Show staff member assigned to each customer
- [ ] Add promotional slides between queue updates
- [ ] Display special offers or services
- [ ] Add background music indicator
- [ ] Show average wait time statistics
- [ ] Add customer photos (with permission)
- [ ] Multi-language support (English, Arabic)
- [ ] Dark mode toggle for different lighting conditions
- [ ] Custom branding colors in settings

## Testing Checklist
- [x] Page loads correctly at /queue-tv
- [x] Clock updates every second
- [x] Queue data refreshes every 10 seconds
- [x] Now Serving section shows current customer
- [x] Next in Line section shows first waiting customer
- [x] Queue list shows all waiting customers
- [x] Empty states display properly
- [x] Service names appear when available
- [x] Position numbers are correct
- [x] Estimated wait times display
- [ ] Test with 10+ customers in queue
- [ ] Test fullscreen mode on actual TV
- [ ] Test auto-refresh reliability over 8 hours
- [ ] Test with various screen resolutions

## Notes
- All text in Norwegian (Norsk Bokmål)
- Designed for landscape orientation (TV screens)
- Optimized for 1920x1080 resolution
- Works on any modern browser
- No authentication required (public display)
- Responsive to queue changes in real-time
