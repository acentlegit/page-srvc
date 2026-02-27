# Build Structure for AWS S3 Deployment

## Build Output Location
```
frontend/dist/
```

## File Structure

```
dist/
├── index.html                          (394 bytes)
├── mqtt-test.html                      (7 KB)
└── assets/
    ├── index-CP3r1U3v.css             (16.26 KB)
    ├── index-Dlp-Oawq.js              (2.23 MB) - Main bundle
    ├── index.es-DdncW0s4.js           (150.51 KB)
    ├── html2canvas.esm-CBrSDip1.js    (202.30 KB)
    ├── purify.es-B9ZVCkUG.js         (22.64 KB)
    └── tasks-BttJZUrX.js              (524 bytes)
```

## Total Size
- **Total**: ~2.6 MB (uncompressed)
- **Gzipped**: ~715 KB (estimated)

## Deployment Files

All files in `frontend/dist/` should be uploaded to your S3 bucket root.

## Quick Deploy Command

```powershell
cd frontend
.\deploy-s3.ps1 -BucketName "your-bucket-name" -Region "us-east-1"
```

Or manually:
```powershell
cd frontend\dist
aws s3 sync . s3://your-bucket-name --delete
```

## Important Notes

1. **React Router**: Make sure error document is set to `index.html` in S3 static website hosting
2. **HTTPS**: Use CloudFront for HTTPS support
3. **CORS**: Configure CORS if accessing from different domains
4. **Backend API**: Update API endpoints in your code before building if needed
