# دليل رفع موقع K.S Salong على Hostinger

## الخطوات الأساسية السريعة

### 1️⃣ رفع الكود على GitHub

```bash
# إنشاء repository جديد على GitHub أولاً، ثم:
git init
git add .
git commit -m "K.S Salong - Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ks-salong.git
git branch -M main
git push -u origin main
```

### 2️⃣ إنشاء تطبيق Node.js في Hostinger

1. سجل دخول إلى **Hostinger Control Panel (hPanel)**
2. اذهب إلى **Advanced** → **Node.js**
3. اضغط **Create Application**
4. اختر الإعدادات:
   - **Node.js Version**: 22.x
   - **Application Mode**: Production
   - **Application Root**: `/public_html/ks-salong`
   - **Application Startup File**: `dist/index.js`

### 3️⃣ ربط GitHub

1. في إعدادات التطبيق، اختر **GitHub Integration**
2. اضغط **Connect GitHub**
3. اختر repository الخاص بك `ks-salong`
4. اختر branch `main`
5. فعّل **Auto Deploy** (اختياري)

### 4️⃣ إنشاء قاعدة البيانات MySQL

1. في hPanel، اذهب إلى **Databases** → **MySQL Databases**
2. اضغط **Create Database**
3. اسم قاعدة البيانات: `u123456789_ks_salong`
4. أنشئ مستخدم بكلمة مرور قوية
5. امنح **ALL PRIVILEGES** للمستخدم
6. احفظ المعلومات:
   - اسم قاعدة البيانات
   - اسم المستخدم
   - كلمة المرور
   - Host (عادة `localhost`)

**صيغة الاتصال:**
```
mysql://username:password@localhost:3306/database_name
```

**مثال:**
```
mysql://u123456789_ks:MyPass123@localhost:3306/u123456789_ks_salong
```

### 5️⃣ إضافة Environment Variables

في إعدادات تطبيق Node.js، أضف هذه المتغيرات:

#### المتغيرات الأساسية (إلزامية):

```env
# قاعدة البيانات
DATABASE_URL=mysql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:3306/YOUR_DB_NAME

# مفتاح JWT (استخدم نص عشوائي طويل)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-32-chars

# معلومات التطبيق
VITE_APP_ID=ks-salong
VITE_APP_TITLE=K.S Salong
NODE_ENV=production
PORT=3000

# معلومات المالك
OWNER_OPEN_ID=your-email@example.com
OWNER_NAME=Your Name
```

#### متغيرات Manus (إذا كنت تستخدم Manus للمصادقة):

```env
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-manus-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

#### متغيرات الدفع (اختيارية - للمستقبل):

```env
# Vipps (للدفع في النرويج)
VIPPS_CLIENT_ID=your-vipps-client-id
VIPPS_CLIENT_SECRET=your-vipps-client-secret
VIPPS_MERCHANT_SERIAL_NUMBER=your-merchant-serial
VIPPS_SUBSCRIPTION_KEY=your-subscription-key

# Stripe (للدفع الدولي)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# AWS S3 (لتخزين الملفات)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
AWS_S3_BUCKET=ks-salong-files
```

### 6️⃣ النشر التلقائي

بمجرد ربط GitHub:
1. ادفع التغييرات إلى GitHub
2. Hostinger سيسحب الكود تلقائياً
3. سيتم البناء والنشر تلقائياً

### 7️⃣ تشغيل Database Migrations

بعد النشر، قم بتشغيل migrations عبر SSH:

```bash
# الاتصال بـ SSH
ssh u123456789@your-domain.com

# الانتقال لمجلد التطبيق
cd public_html/ks-salong

# تشغيل migrations
npm run db:push

# إضافة بيانات تجريبية (اختياري)
npx tsx seed.mjs
```

أو استخدم **Terminal** في hPanel مباشرة.

### 8️⃣ تفعيل SSL

1. في hPanel، اذهب إلى **SSL**
2. اختر **Install Let's Encrypt SSL** (مجاني)
3. فعّل **Force HTTPS**

### 9️⃣ اختبار الموقع

زر موقعك:
```
https://yourdomain.com
```

**حسابات الموظفين الافتراضية (من seed data):**
- المالك (Khalid): PIN `123456`
- مدير (Sara): PIN `234567`
- حلاق (Mohammed): PIN `345678`
- حلاق (Lars): PIN `456789`
- كاشير (Nina): PIN `567890`

**⚠️ مهم جداً: غيّر هذه الأرقام فوراً في الإنتاج!**

---

## النشر اليدوي عبر SSH (بديل)

إذا لم تستخدم GitHub:

```bash
# الاتصال بـ SSH
ssh u123456789@your-domain.com

# الانتقال للمجلد
cd public_html/ks-salong

# رفع الملفات (استخدم FTP أو scp)
# ثم:

# تثبيت المكتبات
npm install --production

# بناء التطبيق
npm run build

# تشغيل migrations
npm run db:push

# إعادة تشغيل التطبيق
pm2 restart ks-salong
```

---

## حل المشاكل الشائعة

### التطبيق لا يعمل

**فحص السجلات:**
```bash
pm2 logs ks-salong
```

**أسباب شائعة:**
- متغيرات البيئة ناقصة
- خطأ في الاتصال بقاعدة البيانات
- خطأ في البناء
- المنفذ (Port) مستخدم

### خطأ في قاعدة البيانات

1. تأكد من صحة `DATABASE_URL`
2. تحقق من صلاحيات المستخدم
3. تأكد من تشغيل MySQL
4. اختبر الاتصال:
   ```bash
   mysql -u username -p -h localhost database_name
   ```

### إعادة البناء

```bash
rm -rf node_modules dist
npm install
npm run build
pm2 restart ks-salong
```

---

## النسخ الاحتياطي

### نسخ قاعدة البيانات

```bash
# تصدير
mysqldump -u username -p database_name > backup.sql

# استيراد
mysql -u username -p database_name < backup.sql
```

### نسخ الملفات

استخدم **Backup Manager** في hPanel:
- نسخ احتياطي يومي تلقائي
- إنشاء نسخة يدوية
- استعادة بنقرة واحدة

---

## التحديثات المستقبلية

### عبر GitHub (موصى به):
1. ادفع التغييرات إلى GitHub
2. Hostinger ينشر تلقائياً
3. التطبيق يعيد التشغيل تلقائياً

### عبر SSH:
```bash
cd public_html/ks-salong
git pull origin main
npm install
npm run build
pm2 restart ks-salong
```

---

## الخطوات التالية بعد النشر

1. ✅ **تخصيص الإعدادات**: اسم الصالون، العنوان، ساعات العمل
2. ✅ **إضافة الموظفين**: إنشاء حسابات حقيقية مع PINs آمنة
3. ✅ **تفعيل المدفوعات**: إضافة بيانات Vipps و Stripe
4. ✅ **استيراد العملاء**: نقل بيانات العملاء الحالية
5. ✅ **تدريب الموظفين**: تدريب على استخدام النظام
6. ✅ **البدء**: استقبال الحجوزات الحقيقية!

---

## الدعم

### دعم Hostinger
- دردشة مباشرة: متاح 24/7
- قاعدة المعرفة: https://support.hostinger.com
- البريد: support@hostinger.com

### مشاكل التطبيق
- فحص السجلات: `pm2 logs ks-salong`
- مراجعة رسائل الأخطاء
- التحقق من متغيرات البيئة
- اختبار الاتصال بقاعدة البيانات

---

**مبروك! موقع K.S Salong الآن على الإنترنت! 🎉**

للمزيد من التفاصيل، راجع ملف `HOSTINGER_DEPLOYMENT.md` الكامل.
