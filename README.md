# K.S Salong - Professional Salon Management System

A comprehensive, elegant salon management system built for Norwegian salons with full support for appointments, POS, payments (Vipps + Stripe), staff management, CRM, and detailed reporting.

![K.S Salong](https://img.shields.io/badge/Version-1.0.0-purple) ![Node.js](https://img.shields.io/badge/Node.js-22-green) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🌟 Features

### 📅 **Appointment Management**
- Interactive calendar with drag-and-drop
- Service and staff selection
- Conflict detection and double-booking prevention
- Multiple status states: Pending, Confirmed, Checked-in, No-show, Cancelled, Completed
- Automated email and SMS reminders (24h and 2h before)
- Flexible cancellation policies

### 👥 **Drop-in Queue**
- Real-time walk-in customer queue
- Drag-and-drop reordering
- Automatic wait time estimation
- Convert queue items to appointments
- Staff assignment

### 💳 **Payment Integration**
- **Vipps** - Norway's leading mobile payment solution
- **Stripe** - International card payments
- Stripe Connect for multi-salon support
- Refund processing with audit trail
- Multiple payment methods: Vipps, Stripe, Cash, Gift Cards

### 🛒 **Point of Sale (POS)**
- Fast checkout interface
- Service and product selection
- Discount and tip handling
- Receipt printing (80mm format)
- Inventory management
- Real-time stock updates

### ⏰ **Staff Time Tracking**
- Clock In/Out functionality
- Break tracking
- Automatic overtime calculation
- Manager editing with audit logs
- Weekly and monthly summaries
- Productivity analytics

### 👤 **Customer CRM**
- Comprehensive customer profiles
- Visit history and spending tracking
- Preferences and notes
- Customer tags (VIP, Regular, New, etc.)
- Quick search functionality
- GDPR compliance (data export/delete)

### 📊 **Reports & Analytics**
- Real-time dashboard with key metrics
- Sales reports (daily/weekly/monthly)
- Staff performance analytics
- No-show tracking
- Automatic daily report generation (Excel + PDF)
- Email delivery to owner

### 🔐 **Multi-Role Access Control**
- **Owner**: Full system access
- **Manager**: Operations and staff management
- **Barber**: Appointments and services
- **Cashier**: POS and payments
- Granular permission system
- PIN-based employee login

### ⚙️ **Settings & Configuration**
- Business hours management
- Holiday calendar
- MVA (Norwegian VAT) configuration
- Payment provider setup
- Notification templates
- Cancellation policies

---

## 🎨 Design Philosophy

K.S Salong features an **elegant and perfect** visual design with:
- Sophisticated purple and gold color palette
- Smooth animations and transitions
- Glass morphism effects
- Responsive design for all devices
- Intuitive user interface
- Professional typography

---

## 🏗️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with OKLCH colors
- **shadcn/ui** - Beautiful component library
- **tRPC** - End-to-end type safety
- **React Query** - Data fetching and caching
- **Wouter** - Lightweight routing

### Backend
- **Node.js 22** - JavaScript runtime
- **Express 4** - Web framework
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - Database toolkit
- **MySQL** - Relational database
- **JWT** - Authentication
- **Zod** - Schema validation

### Infrastructure
- **Hostinger** - Node.js hosting
- **MySQL** - Database hosting
- **AWS S3** - File storage
- **Stripe** - Payment processing
- **Vipps** - Norwegian mobile payments

---

## 📦 Installation

### Prerequisites

- Node.js 22 or higher
- pnpm 10 or higher
- MySQL 8 or higher

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ks-salong.git
cd ks-salong

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm db:push

# Seed database with sample data (optional)
npx tsx seed.mjs

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## 🚀 Deployment

### Hostinger Deployment

See [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Create Node.js application in Hostinger
2. Connect GitHub repository
3. Set up MySQL database
4. Configure environment variables
5. Deploy and build
6. Run migrations
7. Access your application

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/ks_salong

# JWT
JWT_SECRET=your-super-secret-key-change-this

# Application
VITE_APP_ID=ks-salong
VITE_APP_TITLE=K.S Salong
NODE_ENV=development
PORT=3000

# Owner
OWNER_OPEN_ID=admin@example.com
OWNER_NAME=Admin Name

# Vipps (Optional)
VIPPS_CLIENT_ID=your-vipps-client-id
VIPPS_CLIENT_SECRET=your-vipps-client-secret
VIPPS_MERCHANT_SERIAL_NUMBER=your-merchant-serial
VIPPS_SUBSCRIPTION_KEY=your-subscription-key

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
AWS_S3_BUCKET=ks-salong-files

# Email (Optional)
SES_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📖 Usage

### Default Staff Credentials

After running the seed script, you can log in with these PINs:

| Role | Name | PIN |
|------|------|-----|
| Owner | Khalid Saeed | 123456 |
| Manager | Sara Hansen | 234567 |
| Barber | Mohammed Ali | 345678 |
| Barber | Lars Olsen | 456789 |
| Cashier | Nina Berg | 567890 |

**⚠️ Change these PINs immediately in production!**

### Quick Start Guide

1. **Login**: Use your credentials or PIN
2. **Dashboard**: View today's overview
3. **Appointments**: Manage bookings
4. **Queue**: Handle walk-in customers
5. **POS**: Process sales
6. **Customers**: Manage customer database
7. **Reports**: View analytics
8. **Settings**: Configure system

---

## 📁 Project Structure

```
ks-salong/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable components
│       ├── hooks/         # Custom hooks
│       └── lib/           # Utilities
├── server/                # Backend Express application
│   ├── _core/            # Core server logic
│   ├── routers.ts        # tRPC routers
│   └── db.ts             # Database functions
├── drizzle/              # Database schema & migrations
│   ├── schema.ts         # Database schema
│   └── migrations/       # Migration files
├── shared/               # Shared types & constants
├── seed.mjs              # Database seeding script
└── package.json          # Dependencies
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test appointments

# Run with coverage
pnpm test --coverage
```

---

## 📊 Database Schema

### Main Tables

- **users** - Staff and customer accounts
- **permissions** - Role-based access control
- **services** - Salon services
- **products** - Retail products
- **appointments** - Booking records
- **dropInQueue** - Walk-in queue
- **customers** - Customer profiles
- **orders** - Sales transactions
- **orderItems** - Order line items
- **payments** - Payment records
- **timeEntries** - Staff time tracking
- **salonSettings** - System configuration
- **businessHours** - Operating hours
- **dailyReports** - Generated reports

---

## 🔒 Security

- JWT-based authentication
- HttpOnly cookies
- CSRF protection
- Role-based access control
- Granular permissions
- Audit logging
- GDPR compliance
- Secure password hashing
- Rate limiting

---

## 🌍 Localization

Currently supports:
- **Norwegian** (primary)
- **English** (interface)

MVA (Norwegian VAT) handling:
- 25% standard rate (configurable)
- Automatic tax calculations
- Compliant receipts

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

For questions and support:
- Email: support@kssalong.no
- Documentation: See [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)
- Issues: GitHub Issues

---

## 🙏 Acknowledgments

- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Stripe](https://stripe.com)
- [Vipps](https://vipps.no)

---

## 🎯 Roadmap

### Version 1.1
- [ ] Mobile app (React Native)
- [ ] SMS notifications via Twilio
- [ ] Advanced analytics dashboard
- [ ] Customer loyalty program
- [ ] Online booking widget

### Version 1.2
- [ ] Multi-location support
- [ ] Inventory forecasting
- [ ] Staff commission tracking
- [ ] Marketing campaigns
- [ ] Integration with accounting software

### Version 2.0
- [ ] AI-powered scheduling optimization
- [ ] Customer behavior analytics
- [ ] Automated marketing
- [ ] Advanced reporting
- [ ] API for third-party integrations

---

**Built with ❤️ for Norwegian salons**

**Last Updated**: January 24, 2026
