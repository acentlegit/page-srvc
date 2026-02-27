# ⚡ Quick CloudFront Setup for HTTPS

## 🎯 Why You Need This

**Error:** `Accessing media devices is available only in secure contexts (HTTPS)`

**Problem:** S3 static website = HTTP only → Video calls blocked by browser  
**Solution:** CloudFront = HTTPS → Video calls work ✅

---

## 🚀 5-Minute Setup

### Step 1: Create CloudFront Distribution

1. **AWS Console** → **CloudFront** → **Create Distribution**

2. **Origin Domain:**
   - Select: `page-srvc.s3-website-us-east-1.amazonaws.com`
   - ⚠️ Choose **website endpoint**, not REST endpoint!

3. **Viewer Protocol Policy:**
   - Select: **Redirect HTTP to HTTPS** ← Important!

4. **Click "Create Distribution"**

5. **Wait 5-15 minutes** for deployment

### Step 2: Configure Error Pages (React Router)

1. **Distribution** → **Error Pages** tab

2. **Create Error Response:**
   - **HTTP Error Code:** 404
   - **Customize:** Yes
   - **Response Page Path:** `/index.html`
   - **HTTP Response Code:** 200

3. **Repeat for 403 errors**

### Step 3: Get HTTPS URL

After deployment, you'll get:
```
https://d1234567890abc.cloudfront.net
```

**Use this URL instead of S3 HTTP URL!**

---

## ✅ Test

1. Visit: `https://your-cloudfront-url.cloudfront.net`
2. Navigate to a page
3. Click "Join Video"
4. **Should work now!** ✅

---

## 📝 Update Environment Variable

**`.env.production`:**
```env
VITE_FRONTEND_URL=https://your-cloudfront-url.cloudfront.net
```

**Rebuild and redeploy:**
```bash
npm run build
.\deploy.ps1 -BucketName "page-srvc"
```

---

## 🎯 Summary

- **S3 HTTP URL:** Video calls ❌
- **CloudFront HTTPS URL:** Video calls ✅

**You MUST use CloudFront for video calls!**

See `VIDEO_CALL_HTTPS_FIX.md` for detailed instructions.
