# AWS S3 Deployment Script for Windows
# Usage: .\deploy-s3.ps1 -BucketName "your-bucket-name" -Region "us-east-1"

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS S3 Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
Write-Host "Checking AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✓ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found. Please install it from: https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host ""
Write-Host "Building application..." -ForegroundColor Yellow
Set-Location "C:\MY APPLICATIONS\page srve\frontend"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build successful!" -ForegroundColor Green

# Check if bucket exists
Write-Host ""
Write-Host "Checking if bucket exists..." -ForegroundColor Yellow
$bucketExists = aws s3 ls "s3://$BucketName" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Bucket does not exist. Creating bucket..." -ForegroundColor Yellow
    aws s3 mb "s3://$BucketName" --region $Region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create bucket!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Bucket created!" -ForegroundColor Green
    
    # Enable static website hosting
    Write-Host "Enabling static website hosting..." -ForegroundColor Yellow
    aws s3 website "s3://$BucketName" `
        --index-document index.html `
        --error-document index.html
    
    Write-Host "✓ Static website hosting enabled!" -ForegroundColor Green
    
    # Set bucket policy for public read access
    Write-Host "Setting bucket policy for public read access..." -ForegroundColor Yellow
    $policy = @{
        Version = "2012-10-17"
        Statement = @(
            @{
                Sid = "PublicReadGetObject"
                Effect = "Allow"
                Principal = "*"
                Action = "s3:GetObject"
                Resource = "arn:aws:s3:::$BucketName/*"
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $policy | Out-File -FilePath "temp-policy.json" -Encoding UTF8
    aws s3api put-bucket-policy --bucket $BucketName --policy file://temp-policy.json
    Remove-Item "temp-policy.json"
    
    Write-Host "✓ Bucket policy set!" -ForegroundColor Green
} else {
    Write-Host "✓ Bucket exists!" -ForegroundColor Green
}

# Upload files
Write-Host ""
Write-Host "Uploading files to S3..." -ForegroundColor Yellow
Set-Location "dist"
aws s3 sync . "s3://$BucketName" --delete --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Files uploaded successfully!" -ForegroundColor Green

# Display results
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bucket Name: $BucketName" -ForegroundColor White
Write-Host "Region: $Region" -ForegroundColor White
Write-Host ""
Write-Host "Website URL:" -ForegroundColor Yellow
Write-Host "http://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "To use a custom domain or HTTPS, set up CloudFront distribution." -ForegroundColor Gray
Write-Host ""
