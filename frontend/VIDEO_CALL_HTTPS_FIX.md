# 🔧 Fix Video Call Error: HTTPS Required

## ❌ The Problem

**Error:**
```
Error: Accessing media devices is available only in secure contexts (HTTPS and localhost)
TypeError: Cannot read properties of undefined (reading 'getUserMedia')
```

**Why This Happens:**
- Your S3 website is accessed via **HTTP**: `http://page-srvc.s3-website-us-east-1.amazonaws.com`
- Browsers **require HTTPS** (or localhost) to access camera/microphone
- Even though Beam video service uses HTTPS, the **parent page** is HTTP
- Browser blocks camera/mic access when parent page is HTTP (security requirement)

---

## ✅ The Solution: Use CloudFront with HTTPS

**S3 Static Website Hosting = HTTP Only**  
**CloudFront = HTTPS + Custom Domain**

You **MUST** use CloudFront to get HTTPS for video calls to work.

---

## 🚀 Setup CloudFront (Required for Video Calls)

### Step 1: Create CloudFront Distribution

1. **Go to AWS Console** → CloudFront
2. **Click "Create Distribution"**
3. **Configure:**

   **Origin Settings:**
   - **Origin Domain:** Select your S3 bucket (choose the **website endpoint**, not REST endpoint)
     - Example: `page-srvc.s3-website-us-east-1.amazonaws.com`
   - **Origin Path:** Leave empty
   - **Name:** Auto-filled
   - **Origin Access:** Select "Public" (or create OAC if needed)

   **Default Cache Behavior:**
   - **Viewer Protocol Policy:** **Redirect HTTP to HTTPS** ← Important!
   - **Allowed HTTP Methods:** GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache Policy:** CachingOptimized (or create custom)
   - **Origin Request Policy:** None (or CORS-S3Origin)

   **Distribution Settings:**
   - **Price Class:** Use All Edge Locations (or cheapest)
   - **Alternate Domain Names (CNAMEs):** (Optional - for custom domain)
   - **SSL Certificate:** Default CloudFront Certificate (or your custom domain cert)

4. **Click "Create Distribution"**
5. **Wait 5-15 minutes** for distribution to deploy

### Step 2: Configure Error Pages (For React Router)

1. **Go to your CloudFront Distribution** → **Error Pages** tab
2. **Create Custom Error Response:**

   **For 404 Errors:**
   - **HTTP Error Code:** 404
   - **Customize Error Response:** Yes
   - **Response Page Path:** `/index.html`
   - **HTTP Response Code:** 200
   - **Error Caching Minimum TTL:** 10

   **For 403 Errors:**
   - **HTTP Error Code:** 403
   - **Customize Error Response:** Yes
   - **Response Page Path:** `/index.html`
   - **HTTP Response Code:** 200
   - **Error Caching Minimum TTL:** 10

### Step 3: Get Your HTTPS URL

After deployment, you'll get a CloudFront URL:
```
https://d1234567890abc.cloudfront.net
```

**This URL uses HTTPS!** ✅

### Step 4: Test Video Calls

1. Visit: `https://your-cloudfront-url.cloudfront.net`
2. Navigate to a page
3. Click "Join Video"
4. **Video calls should work now!** ✅

---

## 🔄 Update Invitation Links

After setting up CloudFront, update your environment variable:

**In `.env.production`:**
```env
VITE_FRONTEND_URL=https://your-cloudfront-url.cloudfront.net
```

**Rebuild:**
```bash
npm run build
```

**Redeploy:**
```bash
.\deploy.ps1 -BucketName "page-srvc"
```

---

## 📋 Quick Checklist

- [ ] Create CloudFront distribution
- [ ] Set origin to S3 website endpoint
- [ ] Set "Redirect HTTP to HTTPS"
- [ ] Configure error pages (404 → index.html)
- [ ] Wait for deployment (5-15 min)
- [ ] Test video calls with HTTPS URL
- [ ] Update VITE_FRONTEND_URL
- [ ] Rebuild and redeploy

---

## 🎯 Why This Is Required

**Browser Security:**
- Browsers block camera/mic on HTTP pages (except localhost)
- This is a **security requirement** - cannot be bypassed
- Even if the iframe is HTTPS, parent page must be HTTPS

**S3 Limitation:**
- S3 static website hosting **only supports HTTP**
- Cannot enable HTTPS directly on S3 website endpoint
- **CloudFront is the only way** to get HTTPS for S3 static sites

---

## 💡 Alternative: Custom Domain with SSL

If you have a custom domain:

1. **Request SSL Certificate** in AWS Certificate Manager
2. **Add domain to CloudFront** (Alternate Domain Names)
3. **Update DNS** to point to CloudFront
4. **Use your custom domain** with HTTPS

Example: `https://app.yourdomain.com`

---

## ✅ After CloudFront Setup

**Your URLs:**
- ❌ HTTP (S3): `http://page-srvc.s3-website-us-east-1.amazonaws.com` (video calls won't work)
- ✅ HTTPS (CloudFront): `https://d1234567890abc.cloudfront.net` (video calls work!)

**All Features:**
- ✅ Video calls (HTTPS required)
- ✅ Real-time chat
- ✅ Image sharing
- ✅ Page management
- ✅ Invitations

---

## 📝 Summary

**Problem:** S3 static website = HTTP only → Video calls blocked  
**Solution:** CloudFront = HTTPS → Video calls work ✅

**You MUST use CloudFront for video calls to work on AWS!**
