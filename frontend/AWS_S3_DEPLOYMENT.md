# 🚀 AWS S3 Deployment Guide

## ✅ Build Complete!

Your application has been built successfully. The production files are in `frontend/dist/` folder.

---

## 📁 Build Structure

```
frontend/dist/
├── index.html              (Entry point - 0.39 kB)
├── assets/
│   ├── index-CP3r1U3v.css  (Styles - 16.26 kB)
│   └── index-DHZg425h.js   (JavaScript bundle - 948.65 kB)
```

**Total Size:** ~965 kB (uncompressed) | ~287 kB (gzipped)

---

## 🎥 Video Calls on AWS S3

### ⚠️ **IMPORTANT: HTTPS Required for Video Calls!**

**Video calls require HTTPS** - Browsers block camera/microphone access on HTTP pages (security requirement).

**S3 Static Website Hosting = HTTP Only**  
**CloudFront = HTTPS Required**

### ✅ **Video Calls WILL Work with CloudFront + HTTPS**

**Why?** The video call functionality uses **Beam's external service**, but the **parent page must be HTTPS**.

**How it works:**
1. Your app is hosted on S3 (static files only)
2. **CloudFront provides HTTPS** (required for video calls)
3. Video calls connect to Beam's servers (external service)
4. MQTT real-time updates connect to staging MQTT servers
5. API calls go to staging backend (`https://cudb-root-api.staging.beamdev.hu`)

**Video Call Flow:**
```
User Browser (CloudFront HTTPS)
    ↓
Beam Video Service (external - beam.live)
    ↓
Video call works! ✅
```

**⚠️ Without CloudFront (HTTP only):**
- ❌ Video calls **WON'T work** (browser blocks camera/mic)
- ✅ Real-time chat works
- ✅ Image sharing works
- ✅ Page management works

**✅ With CloudFront (HTTPS):**
- ✅ Video calls work
- ✅ Real-time chat works
- ✅ Image sharing works
- ✅ Page management works
- ✅ All features work!

**See `VIDEO_CALL_HTTPS_FIX.md` for CloudFront setup instructions.**

---

## 📋 AWS S3 Deployment Steps

### Step 1: Create S3 Bucket

1. **Go to AWS Console** → S3
2. **Create bucket:**
   - Name: `your-app-name` (e.g., `beam-admin-app`)
   - Region: Choose closest to your users
   - **Uncheck** "Block all public access" (we need public access)
   - Enable "Bucket Versioning" (optional but recommended)

### Step 2: Configure Bucket for Static Website Hosting

1. **Select your bucket** → Properties tab
2. **Scroll to "Static website hosting"**
3. **Click "Edit"** and enable:
   - **Index document:** `index.html`
   - **Error document:** `index.html` (for React Router)
4. **Save changes**

### Step 3: Set Bucket Policy (Make Public)

1. **Select bucket** → Permissions tab
2. **Bucket Policy** → Edit
3. **Add this policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

**Replace `your-bucket-name` with your actual bucket name!**

### Step 4: Upload Files

**Option A: Using AWS Console**
1. Go to your bucket
2. Click "Upload"
3. Select **ALL files** from `frontend/dist/` folder
4. Click "Upload"

**Option B: Using AWS CLI** (Recommended)

```bash
# Install AWS CLI if not installed
# https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure

# Upload files
cd frontend/dist
aws s3 sync . s3://your-bucket-name --delete

# Make files public
aws s3 cp . s3://your-bucket-name --recursive --acl public-read
```

**Option C: Using PowerShell** (Windows)

```powershell
# Install AWS Tools for PowerShell
# https://aws.amazon.com/powershell/

# Configure credentials
Set-AWSCredential -AccessKey YOUR_ACCESS_KEY -SecretKey YOUR_SECRET_KEY -StoreAs default

# Upload files
cd frontend/dist
Write-S3Object -BucketName your-bucket-name -Folder . -Recurse -PublicReadOnly
```

### Step 5: Get Website URL

After enabling static website hosting, you'll get a URL like:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

**Or with region:**
```
http://your-bucket-name.s3-website.region.amazonaws.com
```

---

## 🌐 Optional: Custom Domain with CloudFront

### Why CloudFront?
- ✅ Custom domain (e.g., `app.yourdomain.com`)
- ✅ HTTPS/SSL certificate
- ✅ Better performance (CDN)
- ✅ Professional URL

### Setup CloudFront

1. **Create CloudFront Distribution:**
   - Origin Domain: Your S3 bucket (select the website endpoint, not REST endpoint)
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Default Root Object: `index.html`

2. **Configure Error Pages:**
   - 404 → `/index.html` (for React Router)
   - 403 → `/index.html`

3. **Custom Domain (Optional):**
   - Add your domain
   - Request SSL certificate via AWS Certificate Manager
   - Update DNS records

---

## ⚙️ Environment Variables for Production

### Option 1: Build-time Variables

Create `.env.production` file:

```env
# API Configuration
VITE_API_BASE_URL=https://cudb-root-api.staging.beamdev.hu
VITE_IS_STAGING_BACKEND=true
VITE_API_PATH_PREFIX=

# MQTT Configuration
VITE_MQTT_URL=wss://mqtt.staging.beamdev.hu/mqtt

# Frontend URL (for invitation links)
VITE_FRONTEND_URL=https://your-cloudfront-url.com
# OR
VITE_FRONTEND_URL=https://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

**Rebuild after changing .env.production:**
```bash
npm run build
```

### Option 2: Runtime Configuration (Advanced)

For dynamic configuration, you can inject variables at runtime using a config file.

---

## 🔄 Deployment Workflow

### Quick Deploy Script

Create `deploy.ps1` (PowerShell):

```powershell
# Build
Write-Host "Building application..." -ForegroundColor Green
cd frontend
npm run build

# Upload to S3
Write-Host "Uploading to S3..." -ForegroundColor Green
cd dist
aws s3 sync . s3://your-bucket-name --delete --acl public-read

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "URL: http://your-bucket-name.s3-website-us-east-1.amazonaws.com" -ForegroundColor Cyan
```

**Run:**
```powershell
.\deploy.ps1
```

---

## ✅ Post-Deployment Checklist

- [ ] Test application loads: `http://your-bucket-url`
- [ ] Test page creation
- [ ] Test real-time chat
- [ ] Test video calls (should work via Beam service)
- [ ] Test invitation links (should use correct URL)
- [ ] Test image sharing
- [ ] Verify API calls go to staging backend
- [ ] Check browser console for errors

---

## 🐛 Troubleshooting

### Issue: Blank page / 404 errors
**Solution:** Make sure error document is set to `index.html` in S3 static website hosting

### Issue: API calls failing
**Solution:** Check CORS settings on staging backend, or use CloudFront with proper headers

### Issue: Video calls not working
**Solution:** Video calls use Beam's external service - check browser console for connection errors

### Issue: Invitation links wrong URL
**Solution:** Set `VITE_FRONTEND_URL` in `.env.production` and rebuild

---

## 📊 Cost Estimate

**S3 Storage:**
- First 50 GB: Free
- Your app: ~1 MB = **$0.00/month**

**S3 Requests:**
- First 20,000 GET requests: Free
- Typical usage: **$0.00-5.00/month**

**CloudFront (Optional):**
- First 1 TB: $0.085/GB
- Typical usage: **$5-20/month**

**Total: ~$0-25/month** (depending on traffic)

---

## 🎯 Summary

✅ **Build Location:** `frontend/dist/`  
✅ **Upload to:** S3 bucket with static website hosting  
✅ **Video Calls:** Work via Beam external service  
✅ **All Features:** Work the same as localhost  
✅ **URL:** S3 website endpoint or CloudFront domain  

**Your application is ready to deploy!** 🚀
