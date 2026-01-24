# Tidsstempling (Time Tracking System) Feature

## Overview
Complete time tracking system with PIN authentication for employees to clock in/out, track work hours, and calculate overtime automatically.

## Features Implemented

### 1. PIN Authentication
- Employees use 4-6 digit PIN codes to clock in/out
- PIN stored securely in `users.pin` field
- No password required - quick and easy for salon environment

### 2. Clock In/Out System
- **Clock In**: Verify PIN → Create timeEntry with clockIn timestamp
- **Clock Out**: Verify PIN → Update timeEntry with clockOut timestamp
- Automatic calculation of:
  - Total work minutes
  - Break minutes
  - **Overtime minutes** (weekends = Saturday & Sunday)

### 3. Overtime Calculation
**Business Rule**: Saturday and Sunday are non-working days. Any work on these days = 100% overtime.

```typescript
const dayOfWeek = clockIn.getDay();
const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
const overtimeMinutes = isWeekend ? totalMinutes : 0;
```

### 4. Tidsstempling Page (`/tidsstempling`)
Beautiful UI with:
- **PIN Pad Interface**: Large buttons (1-9, 0) for easy touch input
- **Mode Toggle**: Switch between "Stemple Inn" and "Stemple Ut"
- **Currently Clocked In**: Real-time list of logged-in employees with duration
- **Quick Stats**: Active employees, total work hours today, productivity

### 5. Real-time Updates
- Employee list refreshes every 5 seconds
- Live duration calculation for clocked-in employees
- Instant feedback with toast notifications

## Database Schema

### timeEntries Table (Already Exists)
```sql
- id: Primary key
- staffId: Foreign key to users.id
- clockIn: Timestamp (required)
- clockOut: Timestamp (nullable)
- breakStart: Timestamp (nullable)
- breakEnd: Timestamp (nullable)
- totalBreakMinutes: Integer (default 0)
- totalWorkMinutes: Integer (default 0)
- overtimeMinutes: Integer (default 0)
- notes: Text (nullable)
- editedBy: Integer (nullable)
- editReason: Text (nullable)
- createdAt: Timestamp
- updatedAt: Timestamp
```

### users Table - PIN Field
```sql
- pin: VARCHAR(6) - Stores employee PIN for authentication
```

## API Endpoints

### timeTracking Router

**1. clockIn**
- Input: `{ pin: string }` (4-6 digits)
- Verifies PIN → Creates timeEntry
- Returns: Employee info (id, name, role)
- Error: "Ugyldig PIN" or "Already clocked in"

**2. clockOut**
- Input: `{ pin: string }` (4-6 digits)
- Verifies PIN → Updates timeEntry with clockOut
- Calculates total work time and overtime
- Returns: Total minutes, overtime minutes
- Error: "Ugyldig PIN" or "Not clocked in"

**3. getClockedIn**
- Returns: List of currently clocked-in employees
- Includes: id, staffId, clockIn, name, role

**4. getEntries**
- Input: `{ startDate, endDate, staffId? }`
- Returns: Time entries for date range
- Optional: Filter by specific employee

**5. getSummary**
- Input: `{ staffId, startDate, endDate }`
- Returns: Work summary for employee
  - Total work hours
  - Total overtime hours
  - Total days worked
  - All entries

## User Flow

### Employee Clocking In
1. Navigate to `/tidsstempling`
2. Ensure "Stemple Inn" mode is selected
3. Enter PIN using on-screen pad or keyboard
4. Click "OK"
5. Success: "Velkommen [Name]! Du er nå stemplet inn."
6. Employee appears in "Pålogget Nå" list

### Employee Clocking Out
1. Navigate to `/tidsstempling`
2. Switch to "Stemple Ut" mode
3. Enter PIN
4. Click "OK"
5. Success: "Du er nå stemplet ut. Arbeidstid: Xt Ym"
6. Employee removed from "Pålogget Nå" list

## Features Not Yet Implemented

### 1. Automatic Logout
**Requirement**: Configurable automatic logout at end of workday
**Implementation Plan**:
- Add `autoLogoutTime` to salonSettings (e.g., "22:00")
- Run scheduled job to clock out all employees at specified time
- Notify employees via system notification

### 2. Link Sales to Employees
**Requirement**: All transactions must be attributed to logged-in employee
**Implementation Plan**:
- Add `staffId` field to orders table
- POS system checks for clocked-in employee
- Require PIN before processing sale
- Track sales per employee for commission/reports

### 3. Time Reports
**Requirement**: Daily, weekly, monthly reports
**Implementation Plan**:
- Add report generation page
- Filter by date range and employee
- Show:
  - Total hours worked
  - Overtime hours
  - Break time
  - Sales attributed to employee
- Export to Excel/PDF

### 4. Employee Productivity Reports
**Requirement**: Track performance metrics
**Metrics**:
- Hours worked vs. sales generated
- Average service time
- Customer satisfaction
- Overtime percentage

## Technical Notes

### Weekend Overtime Logic
```typescript
// In clockOutEmployee function (server/db.ts)
const dayOfWeek = clockIn.getDay();
const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
const overtimeMinutes = isWeekend ? totalMinutes : 0;
```

### Duration Calculation
```typescript
// In Tidsstempling.tsx
const calculateDuration = (clockIn: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(clockIn).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}t ${minutes}m`;
};
```

### Security Considerations
- PIN is stored in plaintext (acceptable for internal salon use)
- For higher security, hash PINs with bcrypt
- Consider rate limiting to prevent brute force attacks
- Add audit logging for all clock in/out events

## UI/UX Highlights
- **Large Touch Targets**: PIN pad buttons are 64px (h-16) for easy touch
- **Visual Feedback**: Toast notifications for all actions
- **Real-time Updates**: Employee list refreshes automatically
- **Gradient Design**: Purple-to-amber theme matches salon branding
- **Responsive**: Works on tablets, phones, and desktop

## Next Steps
1. Test with real employee PINs
2. Add automatic logout feature
3. Link POS sales to clocked-in employees
4. Build comprehensive reports page
5. Add break tracking (start/end break buttons)
6. Implement time entry editing for corrections
7. Add export functionality (Excel, PDF)

## Files Modified/Created
- `server/db.ts` - Added time tracking functions
- `server/routers.ts` - Added timeTracking router
- `client/src/pages/Tidsstempling.tsx` - New page
- `client/src/App.tsx` - Added route
- `drizzle/schema.ts` - timeEntries table (already existed)
- `todo.md` - Added Tidsstempling tasks
