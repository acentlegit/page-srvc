# 🚀 AWS S3 Deployment Guide - Complete Setup

## 📋 Overview

This guide will help you deploy your React frontend application to AWS S3 with CloudFront for production.

## 🏗️ Deployment Structure

```
page-srve/
├── frontend/
│   ├── dist/                    # Build output (generated)
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   ├── .env.production          # Production environment variables
│   └── ...
├── aws/
│   ├── s3-bucket-config.json    # S3 bucket configuration
│   ├── cloudfront-config.json   # CloudFront distribution config
│   ├── deploy.sh                # Deployment script
│   └── s3-policy.json           # S3 bucket policy
└── README-DEPLOYMENT.md         # This file
```

## 📦 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
   ```bash
   aws --version
   aws configure
   ```
3. **Node.js & npm** installed
4. **Build tools** ready

## 🔧 Step 1: Build the Application

### 1.1 Install Dependencies
```bash
cd frontend
npm install
```

### 1.2 Create Production Environment File
Create `frontend/.env.production`:
```env
# Production API Configuration
VITE_API_BASE_URL=https://cudb-root-api.staging.beamdev.hu
VITE_API_PATH_PREFIX=

# Standard API Endpoint Paths
VITE_API_ENDPOINT_PAGES=/pages
VITE_API_ENDPOINT_EVENTS=/events
VITE_API_ENDPOINT_USERS=/createUser
VITE_API_ENDPOINT_MESSAGES=/messages
VITE_API_ENDPOINT_SEARCH_USER=/searchUser
VITE_API_ENDPOINT_SEARCH_IN_USER=/searchInUser

# Swagger Page API Endpoint Paths
VITE_API_ENDPOINT_CREATE_PAGE=/createPage
VITE_API_ENDPOINT_SEARCH_PAGE=/searchPage
VITE_API_ENDPOINT_SEARCH_IN_PAGE=/searchInPage
VITE_API_ENDPOINT_UPDATE_PAGE=/updatePage
VITE_API_ENDPOINT_SYNC_PAGE=/syncPage
VITE_API_ENDPOINT_CONNECT_PAGE=/connectPage
VITE_API_ENDPOINT_DISCONNECT_PAGE=/disconnectPage
VITE_API_ENDPOINT_SEARCH_MESSAGE=/searchMessage
VITE_API_ENDPOINT_DISCONNECT=/disconnect
VITE_API_ENDPOINT_OPERATE_PAGE=/operatePage
VITE_API_ENDPOINT_FIND_USERS_TO_PAGE=/findUsersToPage
VITE_API_ENDPOINT_DO_BULK=/doBulk

# MQTT Configuration
VITE_MQTT_BROKER_URL=wss://mqtt.staging.beamdev.hu:443/mqtt
VITE_MQTT_QUEUE_NAME=beam-pages
VITE_MQTT_CLIENT_ID=beam-admin-frontend
VITE_MQTT_SUBSCRIPTION_TOPIC=pages/+

# Frontend URL (for production)
VITE_FRONTEND_URL=https://your-domain.com
```

### 1.3 Build for Production
```bash
npm run build
```

This creates the `dist/` folder with optimized production files.

## 🪣 Step 2: Create S3 Bucket

### 2.1 Create Bucket via AWS Console
1. Go to **S3 Console** → **Create bucket**
2. Bucket name: `page-srve-frontend` (must be globally unique)
3. Region: Choose your preferred region (e.g., `us-east-1`)
4. **Block Public Access**: Uncheck "Block all public access" (we'll make it public for static hosting)
5. **Bucket Versioning**: Enable (optional, for rollback capability)
6. Click **Create bucket**

### 2.2 Configure Bucket for Static Website Hosting
1. Select your bucket → **Properties** tab
2. Scroll to **Static website hosting**
3. Click **Edit**
4. Enable static website hosting
5. **Index document**: `index.html`
6. **Error document**: `index.html` (for React Router)
7. Click **Save changes**

### 2.3 Set Bucket Policy (Make it Public)
1. Go to **Permissions** tab → **Bucket policy**
2. Add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. Click **Save changes**

### 2.4 Configure CORS (if needed)
1. Go to **Permissions** tab → **Cross-origin resource sharing (CORS)**
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 📤 Step 3: Upload Files to S3

### Option A: Using AWS CLI (Recommended)

```bash
# Navigate to frontend directory
cd frontend

# Sync dist folder to S3 bucket
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/ --delete

# Or upload specific files
aws s3 cp dist/ s3://YOUR-BUCKET-NAME/ --recursive
```

### Option B: Using AWS Console
1. Go to your S3 bucket
2. Click **Upload**
3. Select all files from `frontend/dist/` folder
4. Click **Upload**

### Option C: Using Deployment Script
```bash
# Make script executable (Linux/Mac)
chmod +x aws/deploy.sh

# Run deployment
./aws/deploy.sh YOUR-BUCKET-NAME
```

## 🌐 Step 4: Configure CloudFront (Optional but Recommended)

CloudFront provides:
- **CDN** for faster global access
- **HTTPS** with SSL certificate
- **Custom domain** support
- **Better performance**

### 4.1 Create CloudFront Distribution
1. Go to **CloudFront Console** → **Create distribution**
2. **Origin domain**: Select your S3 bucket
3. **Origin access**: Select "Public" or "Origin access control"
4. **Viewer protocol policy**: Redirect HTTP to HTTPS
5. **Allowed HTTP methods**: GET, HEAD, OPTIONS
6. **Default root object**: `index.html`
7. **Custom error responses**:
   - **403 Forbidden** → **200 OK** → `/index.html`
   - **404 Not Found** → **200 OK** → `/index.html`
8. Click **Create distribution**

### 4.2 Wait for Distribution to Deploy
- Status will change from "In Progress" to "Deployed"
- This takes 10-15 minutes
- Note the **Distribution domain name** (e.g., `d1234abcd.cloudfront.net`)

## 🔗 Step 5: Access Your Application

### S3 Website Endpoint
```
http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com
```

### CloudFront URL
```
https://YOUR-DISTRIBUTION-ID.cloudfront.net
```

## 🔄 Step 6: Automated Deployment Script

Create `aws/deploy.sh`:

```bash
#!/bin/bash

# Configuration
BUCKET_NAME=$1
DIST_FOLDER="frontend/dist"
REGION="us-east-1"

if [ -z "$BUCKET_NAME" ]; then
  echo "Usage: ./deploy.sh YOUR-BUCKET-NAME"
  exit 1
fi

echo "🚀 Starting deployment to S3 bucket: $BUCKET_NAME"

# Build the application
echo "📦 Building application..."
cd frontend
npm run build
cd ..

# Check if build was successful
if [ ! -d "$DIST_FOLDER" ]; then
  echo "❌ Build failed! dist/ folder not found."
  exit 1
fi

# Upload to S3
echo "📤 Uploading files to S3..."
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME/ \
  --region $REGION \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.html"

# Upload HTML files with no cache
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME/ \
  --region $REGION \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html"

echo "✅ Deployment complete!"
echo "🌐 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
```

## 📝 Step 7: Environment-Specific Builds

### Development Build
```bash
npm run build
# Uses .env or .env.development
```

### Production Build
```bash
npm run build -- --mode production
# Uses .env.production
```

## 🔐 Step 8: Security Best Practices

### 8.1 Enable HTTPS
- Use CloudFront with SSL certificate
- Or use AWS Certificate Manager (ACM) for custom domain

### 8.2 Restrict S3 Access
- Use CloudFront Origin Access Control (OAC)
- Remove public bucket policy
- Only allow CloudFront to access S3

### 8.3 Environment Variables
- Never commit `.env` files
- Use AWS Systems Manager Parameter Store for sensitive data
- Or use CloudFront custom headers

## 🎯 Step 9: Custom Domain Setup

### 9.1 Request SSL Certificate
1. Go to **AWS Certificate Manager (ACM)**
2. Request public certificate
3. Add your domain: `yourdomain.com` and `*.yourdomain.com`
4. Validate via DNS or email

### 9.2 Configure CloudFront
1. Edit your CloudFront distribution
2. **Alternate domain names (CNAMEs)**: Add `yourdomain.com` and `www.yourdomain.com`
3. **SSL certificate**: Select your ACM certificate
4. Save changes

### 9.3 Update DNS
Add CNAME record in your DNS provider:
```
Type: CNAME
Name: @ (or www)
Value: YOUR-CLOUDFRONT-DOMAIN.cloudfront.net
```

## 📊 Step 10: Monitoring & Logging

### Enable CloudFront Logging
1. Go to CloudFront distribution → **General** tab
2. Click **Edit**
3. Enable **Standard logging**
4. Select S3 bucket for logs
5. Save changes

### Monitor S3 Access
- Enable **S3 access logging**
- Use **CloudWatch** for metrics
- Set up **CloudWatch Alarms** for errors

## 🔄 Step 11: CI/CD Pipeline (Optional)

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to S3

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      
      - name: Build
        run: |
          cd frontend
          npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync frontend/dist/ s3://YOUR-BUCKET-NAME/ --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id YOUR-DISTRIBUTION-ID \
            --paths "/*"
```

## 📋 Deployment Checklist

- [ ] Build application successfully
- [ ] Create S3 bucket
- [ ] Configure static website hosting
- [ ] Set bucket policy (public read)
- [ ] Upload files to S3
- [ ] Test S3 website endpoint
- [ ] Create CloudFront distribution (optional)
- [ ] Configure custom domain (optional)
- [ ] Set up CI/CD pipeline (optional)
- [ ] Enable monitoring and logging
- [ ] Test all functionality in production

## 🐛 Troubleshooting

### Issue: 403 Forbidden
- **Solution**: Check bucket policy allows public read
- **Solution**: Verify static website hosting is enabled

### Issue: Blank Page / React Router Not Working
- **Solution**: Set error document to `index.html` in S3
- **Solution**: Configure CloudFront error responses (403/404 → 200 → index.html)

### Issue: Environment Variables Not Working
- **Solution**: Variables must start with `VITE_` prefix
- **Solution**: Rebuild after changing `.env` files
- **Solution**: Check `.env.production` file exists

### Issue: API Calls Failing
- **Solution**: Check CORS configuration on backend
- **Solution**: Verify API URLs in `.env.production`
- **Solution**: Check browser console for errors

## 📞 Support

For issues or questions:
1. Check AWS documentation
2. Review CloudFront/S3 logs
3. Check browser console for errors
4. Verify environment variables

## 🎉 Success!

Your application is now deployed to AWS S3! 🚀
