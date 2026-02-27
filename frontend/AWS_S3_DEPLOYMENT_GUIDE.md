# AWS S3 Deployment Guide

## Build Structure

After running `npm run build`, your application is built in the `frontend/dist` directory with the following structure:

```
dist/
├── index.html                    # Main HTML file
├── assets/
│   ├── index-CP3r1U3v.css       # Compiled CSS (16.26 kB)
│   ├── index-Dlp-Oawq.js        # Main JavaScript bundle (2.23 MB)
│   ├── index.es-DdncW0s4.js     # ES modules (150.47 kB)
│   ├── html2canvas.esm-CBrSDip1.js  # HTML2Canvas library (201.42 kB)
│   ├── purify.es-B9ZVCkUG.js   # DOMPurify library (22.64 kB)
│   └── tasks-BttJZUrX.js        # Tasks module (0.52 kB)
```

## Prerequisites

1. **AWS Account** with S3 access
2. **AWS CLI** installed and configured
   ```bash
   aws --version
   aws configure
   ```
3. **S3 Bucket** created (or create one during deployment)

## Deployment Steps

### Option 1: Using AWS CLI (Recommended)

1. **Create an S3 bucket** (if you don't have one):
   ```bash
   aws s3 mb s3://your-bucket-name --region us-east-1
   ```

2. **Enable static website hosting**:
   ```bash
   aws s3 website s3://your-bucket-name \
     --index-document index.html \
     --error-document index.html
   ```

3. **Set bucket policy for public read access** (if needed):
   ```bash
   aws s3api put-bucket-policy --bucket your-bucket-name --policy '{
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
   }'
   ```

4. **Upload the build files**:
   ```bash
   cd frontend/dist
   aws s3 sync . s3://your-bucket-name --delete
   ```

5. **Your application will be available at**:
   ```
   http://your-bucket-name.s3-website-us-east-1.amazonaws.com
   ```

### Option 2: Using AWS Console

1. **Create S3 Bucket**:
   - Go to AWS S3 Console
   - Click "Create bucket"
   - Enter bucket name (e.g., `beam-admin-app`)
   - Choose region
   - Uncheck "Block all public access" (if you want public access)
   - Click "Create bucket"

2. **Enable Static Website Hosting**:
   - Select your bucket
   - Go to "Properties" tab
   - Scroll to "Static website hosting"
   - Click "Edit"
   - Enable static website hosting
   - Set Index document: `index.html`
   - Set Error document: `index.html` (for React Router)
   - Save changes

3. **Set Bucket Policy** (for public access):
   - Go to "Permissions" tab
   - Click "Bucket policy"
   - Add this policy (replace `your-bucket-name`):
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

4. **Upload Files**:
   - Go to "Objects" tab
   - Click "Upload"
   - Select all files from `frontend/dist` folder
   - Click "Upload"

5. **Get Website URL**:
   - Go to "Properties" tab
   - Scroll to "Static website hosting"
   - Copy the "Bucket website endpoint" URL

### Option 3: Using AWS CloudFront (Recommended for Production)

For better performance and HTTPS support:

1. **Deploy to S3** (follow Option 1 or 2 above)

2. **Create CloudFront Distribution**:
   - Go to AWS CloudFront Console
   - Click "Create distribution"
   - Origin domain: Select your S3 bucket
   - Viewer protocol policy: "Redirect HTTP to HTTPS"
   - Default root object: `index.html`
   - Error pages: Add custom error response for 403 and 404, both redirect to `/index.html` with 200 status (for React Router)
   - Click "Create distribution"

3. **Wait for distribution to deploy** (5-15 minutes)

4. **Access your application** via CloudFront URL:
   ```
   https://d1234567890.cloudfront.net
   ```

## Important Notes

### React Router Configuration

Since this is a Single Page Application (SPA) with React Router, you need to configure error handling:

**For S3 Static Website Hosting:**
- Set Error document to `index.html` (already done above)

**For CloudFront:**
- Add custom error responses:
  - 403 → `/index.html` (HTTP 200)
  - 404 → `/index.html` (HTTP 200)

### Environment Variables

If your application uses environment variables, you'll need to:
1. Build with production environment variables
2. Or configure them in your deployment process

### Backend API Configuration

Make sure your frontend is configured to point to the correct backend API URL. Update the API endpoint in your frontend code or environment variables before building.

## Quick Deploy Script

Create a file `deploy-s3.sh` (or `deploy-s3.ps1` for Windows):

```bash
#!/bin/bash
BUCKET_NAME="your-bucket-name"
REGION="us-east-1"

echo "Building application..."
cd frontend
npm run build

echo "Uploading to S3..."
cd dist
aws s3 sync . s3://$BUCKET_NAME --delete --region $REGION

echo "Deployment complete!"
echo "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
```

For PowerShell (Windows):
```powershell
$BUCKET_NAME = "your-bucket-name"
$REGION = "us-east-1"

Write-Host "Building application..."
cd frontend
npm run build

Write-Host "Uploading to S3..."
cd dist
aws s3 sync . s3://$BUCKET_NAME --delete --region $REGION

Write-Host "Deployment complete!"
Write-Host "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
```

## Troubleshooting

1. **404 errors on routes**: Make sure error document is set to `index.html`
2. **CORS issues**: Configure CORS on your S3 bucket if accessing from different domains
3. **Large bundle size**: Consider code splitting (warning shown in build output)
4. **HTTPS required**: Use CloudFront with SSL certificate

## Next Steps

- Set up a custom domain with Route 53
- Configure CloudFront for CDN and HTTPS
- Set up CI/CD pipeline (GitHub Actions, AWS CodePipeline)
- Enable CloudFront caching for better performance
