# AWS S3 Deployment Script
# Usage: .\deploy.ps1 -BucketName "your-bucket-name"

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName,
    
    [string]$Region = "us-east-1"
)

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  AWS S3 Deployment" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Green

# Step 1: Build
Write-Host "Step 1: Building application..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!`n" -ForegroundColor Green

# Step 2: Check AWS CLI
Write-Host "Step 2: Checking AWS CLI..." -ForegroundColor Yellow
$awsCli = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsCli) {
    Write-Host "❌ AWS CLI not found!" -ForegroundColor Red
    Write-Host "Please install AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ AWS CLI found`n" -ForegroundColor Green

# Step 3: Upload to S3
Write-Host "Step 3: Uploading to S3 bucket: $BucketName..." -ForegroundColor Yellow
Set-Location dist

# Sync files
aws s3 sync . "s3://$BucketName" --delete --acl public-read --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Upload successful!`n" -ForegroundColor Green

# Step 4: Get website URL
$websiteUrl = "http://$BucketName.s3-website-$Region.amazonaws.com"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Green
Write-Host "Bucket Name: $BucketName" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "Website URL: $websiteUrl" -ForegroundColor Cyan
Write-Host "`n✅ Your application is live!" -ForegroundColor Green
Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Make sure static website hosting is enabled in S3" -ForegroundColor White
Write-Host "2. Set index.html as index document" -ForegroundColor White
Write-Host "3. Set index.html as error document (for React Router)" -ForegroundColor White
Write-Host "4. Test the URL: $websiteUrl" -ForegroundColor White
Write-Host "`nSee: AWS_S3_DEPLOYMENT.md for detailed instructions" -ForegroundColor Gray
