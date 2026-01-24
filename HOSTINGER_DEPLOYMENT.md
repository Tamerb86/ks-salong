# K.S Salong - Hostinger Deployment Guide

This guide will help you deploy the K.S Salong management system to Hostinger's Node.js hosting.

## Prerequisites

1. **Hostinger Account** with Node.js hosting enabled
2. **MySQL Database** (available in Hostinger hosting plans)
3. **Domain** (optional, Hostinger provides a subdomain)
4. **GitHub Account** (for code deployment)

---

## Step 1: Prepare Your Repository

### 1.1 Push Code to GitHub

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - K.S Salong"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ks-salong.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Required Files

Ensure these files exist in your repository:
- `package.json` - Dependencies and scripts
- `.env.example` - Environment variables template
- `drizzle/` - Database schema and migrations
- `server/` - Backend code
- `client/` - Frontend code

---

## Step 2: Set Up Hostinger Node.js Application

### 2.1 Create Node.js Application

1. Log in to **Hostinger Control Panel (hPanel)**
2. Navigate to **Advanced** → **Node.js**
3. Click **Create Application**
4. Configure:
   - **Node.js Version**: 22.x
   - **Application Mode**: Production
   - **Application Root**: `/public_html/ks-salong` (or your preferred path)
   - **Application URL**: Choose your domain or subdomain
   - **Application Startup File**: `dist/index.js`

### 2.2 Connect GitHub Repository

1. In the Node.js application settings, find **GitHub Integration**
2. Click **Connect GitHub**
3. Authorize Hostinger to access your repositories
4. Select your `ks-salong` repository
5. Choose the `main` branch
6. Enable **Auto Deploy** (optional)

---

## Step 3: Set Up MySQL Database

### 3.1 Create Database

1. In hPanel, go to **Databases** → **MySQL Databases**
2. Click **Create Database**
3. Database name: `u123456789_ks_salong` (Hostinger adds prefix automatically)
4. Create a database user with a strong password
5. Grant **ALL PRIVILEGES** to the user
6. Note down:
   - Database name
   - Database user
   - Database password
   - Database host (usually `localhost` or `127.0.0.1`)

### 3.2 Get Database Connection String

Your connection string format:
```
mysql://username:password@host:3306/database_name
```

Example:
```
mysql://u123456789_ks:MyStrongPass123@localhost:3306/u123456789_ks_salong
```

---

## Step 4: Configure Environment Variables

### 4.1 Set Environment Variables in Hostinger

In your Node.js application settings, add these environment variables:

#### Required Variables:

```env
# Database
DATABASE_URL=mysql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:3306/YOUR_DB_NAME

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# Application
VITE_APP_ID=ks-salong
VITE_APP_TITLE=K.S Salong
NODE_ENV=production
PORT=3000

# Owner (use your email)
OWNER_OPEN_ID=your-email@example.com
OWNER_NAME=Your Name

# Manus OAuth (if using Manus authentication)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Built-in APIs (if using Manus services)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-manus-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

#### Optional Variables (for payment integration):

```env
# Vipps Payment (Norwegian)
VIPPS_CLIENT_ID=your-vipps-client-id
VIPPS_CLIENT_SECRET=your-vipps-client-secret
VIPPS_MERCHANT_SERIAL_NUMBER=your-merchant-serial
VIPPS_SUBSCRIPTION_KEY=your-subscription-key

# Stripe Payment
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
AWS_S3_BUCKET=ks-salong-files

# Email (AWS SES or SMTP)
SES_FROM_EMAIL=noreply@yourdomain.com

# SMS (Twilio - optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+47xxxxxxxxx
```

---

## Step 5: Deploy and Build

### 5.1 Automatic Deployment (if GitHub is connected)

1. Push your code to GitHub
2. Hostinger will automatically pull and deploy
3. Build process runs automatically

### 5.2 Manual Deployment via SSH

If you prefer SSH deployment:

```bash
# Connect to Hostinger via SSH
ssh u123456789@your-domain.com

# Navigate to application directory
cd public_html/ks-salong

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Build the application
npm run build

# Run database migrations
npm run db:push

# Restart the application
pm2 restart ks-salong
```

---

## Step 6: Initialize Database

### 6.1 Run Migrations

After deployment, run database migrations:

```bash
# Via SSH
cd public_html/ks-salong
npm run db:push
```

Or use Hostinger's **Terminal** feature in hPanel.

### 6.2 Seed Initial Data (Optional)

To populate the database with sample data:

```bash
npx tsx seed.mjs
```

**Note:** This creates:
- 5 staff members with PINs
- 10 services
- 10 products
- 20 customers
- Sample appointments

---

## Step 7: Configure Application Startup

### 7.1 Set Startup Command

In Hostinger Node.js settings:
- **Application Startup File**: `dist/index.js`
- **Custom Start Command**: `node dist/index.js`

### 7.2 Enable Process Manager

Hostinger uses PM2 to manage Node.js applications:
- Auto-restart on crash: ✅ Enabled
- Watch for file changes: ❌ Disabled (production)

---

## Step 8: Domain and SSL

### 8.1 Configure Domain

1. In hPanel, go to **Domains**
2. Point your domain to the Node.js application
3. Update DNS records if using external domain

### 8.2 Enable SSL Certificate

1. In hPanel, go to **SSL**
2. Install **Let's Encrypt SSL** (free)
3. Force HTTPS redirect

---

## Step 9: Testing

### 9.1 Access Your Application

Visit your domain:
```
https://yourdomain.com
```

### 9.2 Test Key Features

1. **Login**: Use owner credentials
2. **Dashboard**: Verify data loads correctly
3. **Appointments**: Create a test booking
4. **POS**: Process a test sale
5. **Reports**: Generate a report

### 9.3 Staff Login PINs

Default staff PINs (from seed data):
- Owner (Khalid): `123456`
- Manager (Sara): `234567`
- Barber (Mohammed): `345678`
- Barber (Lars): `456789`
- Cashier (Nina): `567890`

**⚠️ Change these PINs immediately in production!**

---

## Step 10: Production Checklist

### Security

- [ ] Change all default PINs
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting

### Performance

- [ ] Enable gzip compression
- [ ] Configure CDN (Cloudflare)
- [ ] Optimize database indexes
- [ ] Set up caching
- [ ] Monitor resource usage

### Monitoring

- [ ] Set up error logging (Sentry)
- [ ] Configure uptime monitoring
- [ ] Enable database backups
- [ ] Set up email alerts

### Payments

- [ ] Test Vipps integration (Norway)
- [ ] Test Stripe payments
- [ ] Verify webhook endpoints
- [ ] Test refund process

---

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
# Via SSH
pm2 logs ks-salong
```

**Common issues:**
- Missing environment variables
- Database connection failed
- Port already in use
- Build errors

### Database Connection Errors

1. Verify DATABASE_URL is correct
2. Check database user permissions
3. Ensure MySQL service is running
4. Test connection from terminal:
   ```bash
   mysql -u username -p -h localhost database_name
   ```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Port Issues

Hostinger assigns ports automatically. Don't hardcode port numbers in your code.

---

## Updating the Application

### Via GitHub (Recommended)

1. Push changes to GitHub
2. Hostinger auto-deploys (if enabled)
3. Application restarts automatically

### Via SSH

```bash
ssh u123456789@your-domain.com
cd public_html/ks-salong
git pull origin main
npm install
npm run build
pm2 restart ks-salong
```

---

## Backup and Recovery

### Database Backup

```bash
# Export database
mysqldump -u username -p database_name > backup.sql

# Import database
mysql -u username -p database_name < backup.sql
```

### File Backup

Use Hostinger's **Backup Manager** in hPanel:
- Daily automatic backups
- Manual backup creation
- One-click restore

---

## Support

### Hostinger Support
- Live Chat: Available 24/7
- Knowledge Base: https://support.hostinger.com
- Email: support@hostinger.com

### Application Issues
- Check logs: `pm2 logs ks-salong`
- Review error messages
- Verify environment variables
- Test database connection

---

## Additional Resources

- [Hostinger Node.js Documentation](https://support.hostinger.com/en/collections/2682932-node-js)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt SSL](https://letsencrypt.org/)

---

## Next Steps

After successful deployment:

1. **Customize Settings**: Update salon name, address, business hours
2. **Add Staff**: Create real staff accounts with secure PINs
3. **Configure Payments**: Set up Vipps and Stripe credentials
4. **Import Customers**: Migrate existing customer data
5. **Train Staff**: Provide training on the system
6. **Go Live**: Start taking real appointments!

---

**Congratulations! Your K.S Salong management system is now live on Hostinger! 🎉**
