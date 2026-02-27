# ⚡ Quick AWS S3 Deployment

## ✅ Build Complete!

Your application is built and ready to deploy.

**Build Location:** `frontend/dist/`

---

## 🚀 Quick Deploy (3 Steps)

### Step 1: Create S3 Bucket

1. Go to AWS Console → S3
2. Create bucket (name it anything, e.g., `beam-admin-app`)
3. **Uncheck** "Block all public access"
4. Enable static website hosting:
   - Index document: `index.html`
   - Error document: `index.html`

### Step 2: Set Bucket Policy

Go to Permissions → Bucket Policy → Add:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

**Replace `YOUR-BUCKET-NAME` with your bucket name!**

### Step 3: Upload Files

**Using PowerShell Script:**
```powershell
cd frontend
.\deploy.ps1 -BucketName "your-bucket-name"
```

**Or Manual Upload:**
1. Go to S3 bucket
2. Upload ALL files from `frontend/dist/` folder
3. Make them public

---

## 🎥 Video Calls?

### ✅ **YES, Video Calls Work on S3!**

**Why?** Video calls use **Beam's external service**, not your S3 bucket.

- Your app = Static files on S3
- Video calls = Connect to Beam servers (external)
- Chat = Uses MQTT (external)
- API = Uses staging backend (external)

**Everything works the same as localhost!** ✅

---

## 📍 Your Website URL

After deployment, your URL will be:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

---

## ✅ Test Checklist

- [ ] Application loads
- [ ] Create a page
- [ ] Send invitation
- [ ] Accept invitation
- [ ] Chat works
- [ ] Video call works
- [ ] Image sharing works

---

## 📖 Full Guide

See `AWS_S3_DEPLOYMENT.md` for detailed instructions.
