# 📁 AWS S3 Deployment Structure

## Generated Build Output Structure

After running `npm run build`, your `frontend/dist/` folder will contain:

```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js    # Main JavaScript bundle
│   ├── index-[hash].css   # Main CSS bundle
│   ├── vendor-[hash].js   # Vendor dependencies
│   └── [other assets]     # Images, fonts, etc.
└── [other static files]   # Any other static assets
```

## S3 Bucket Structure

After deployment, your S3 bucket will have:

```
s3://your-bucket-name/
├── index.html              # Root HTML (no cache)
├── assets/
│   ├── index-[hash].js    # JavaScript (long cache)
│   ├── index-[hash].css   # CSS (long cache)
│   └── [other assets]     # Images, fonts (long cache)
└── [other files]          # Other static files
```

## File Cache Strategy

- **HTML files**: No cache (always fresh)
- **JavaScript/CSS**: Long cache (1 year) - hash-based names
- **Images/Fonts**: Long cache (1 year)
- **JSON files**: Short cache (1 hour)

## Deployment Files Structure

```
page-srve/
├── frontend/
│   ├── dist/                    # Build output (generated)
│   ├── .env.production          # Production env vars
│   ├── package.json
│   └── vite.config.ts
├── aws/
│   ├── deploy.sh                # Deployment script
│   ├── s3-policy.json           # S3 bucket policy template
│   └── cloudfront-config.json   # CloudFront config template
├── AWS_DEPLOYMENT_GUIDE.md         # Complete guide
└── DEPLOYMENT_STRUCTURE.md        # This file
```

## Quick Deployment Commands

### 1. Build
```bash
cd frontend
npm run build
```

### 2. Deploy to S3
```bash
# Using script
./aws/deploy.sh YOUR-BUCKET-NAME

# Or manually
aws s3 sync frontend/dist/ s3://YOUR-BUCKET-NAME/ --delete
```

### 3. Test
```bash
# Get website URL
aws s3api get-bucket-website --bucket YOUR-BUCKET-NAME
```

## Environment Variables

Production environment variables are in `frontend/.env.production`:
- All `VITE_*` variables are embedded at build time
- Rebuild required after changing env vars
- Never commit `.env` files to git

## Build Output Size

Typical build sizes:
- **index.html**: ~1-2 KB
- **JavaScript bundle**: ~500 KB - 2 MB (gzipped: ~150-500 KB)
- **CSS bundle**: ~50-200 KB (gzipped: ~10-50 KB)
- **Total**: ~1-3 MB (gzipped: ~200-600 KB)

## Deployment Checklist

- [ ] Build completes without errors
- [ ] `dist/` folder contains all files
- [ ] S3 bucket created and configured
- [ ] Files uploaded to S3
- [ ] Static website hosting enabled
- [ ] Bucket policy allows public read
- [ ] Website URL accessible
- [ ] CloudFront configured (optional)
- [ ] Custom domain set up (optional)
