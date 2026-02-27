#!/bin/bash

# AWS S3 Deployment Script
# Usage: ./deploy.sh YOUR-BUCKET-NAME [REGION]

# Configuration
BUCKET_NAME=$1
REGION=${2:-us-east-1}
DIST_FOLDER="frontend/dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if bucket name is provided
if [ -z "$BUCKET_NAME" ]; then
  echo -e "${RED}❌ Error: Bucket name is required${NC}"
  echo "Usage: ./deploy.sh YOUR-BUCKET-NAME [REGION]"
  echo "Example: ./deploy.sh page-srve-frontend us-east-1"
  exit 1
fi

echo -e "${GREEN}🚀 Starting deployment to S3 bucket: $BUCKET_NAME${NC}"
echo -e "${YELLOW}📍 Region: $REGION${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${RED}❌ AWS CLI is not installed${NC}"
  echo "Install it from: https://aws.amazon.com/cli/"
  exit 1
fi

# Check if dist folder exists
if [ ! -d "$DIST_FOLDER" ]; then
  echo -e "${YELLOW}📦 Building application...${NC}"
  cd frontend
  
  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    npm install
  fi
  
  # Build the application
  echo -e "${YELLOW}🔨 Building for production...${NC}"
  npm run build
  
  cd ..
  
  # Check if build was successful
  if [ ! -d "$DIST_FOLDER" ]; then
    echo -e "${RED}❌ Build failed! dist/ folder not found.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ Build folder found${NC}"
fi

# Check if bucket exists
echo -e "${YELLOW}🔍 Checking if bucket exists...${NC}"
if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
  echo -e "${GREEN}✅ Bucket exists${NC}"
else
  echo -e "${YELLOW}⚠️  Bucket does not exist. Creating...${NC}"
  aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Bucket created successfully${NC}"
  else
    echo -e "${RED}❌ Failed to create bucket${NC}"
    exit 1
  fi
fi

# Upload static assets with long cache
echo -e "${YELLOW}📤 Uploading static assets (with cache)...${NC}"
aws s3 sync "$DIST_FOLDER" "s3://$BUCKET_NAME/" \
  --region "$REGION" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.html" \
  --exclude "*.json"

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to upload static assets${NC}"
  exit 1
fi

# Upload HTML files with no cache
echo -e "${YELLOW}📤 Uploading HTML files (no cache)...${NC}"
aws s3 sync "$DIST_FOLDER" "s3://$BUCKET_NAME/" \
  --region "$REGION" \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html"

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to upload HTML files${NC}"
  exit 1
fi

# Upload JSON files with short cache
echo -e "${YELLOW}📤 Uploading JSON files...${NC}"
aws s3 sync "$DIST_FOLDER" "s3://$BUCKET_NAME/" \
  --region "$REGION" \
  --delete \
  --cache-control "public, max-age=3600" \
  --include "*.json"

# Enable static website hosting
echo -e "${YELLOW}🌐 Configuring static website hosting...${NC}"
aws s3 website "s3://$BUCKET_NAME/" \
  --index-document index.html \
  --error-document index.html

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Static website hosting enabled${NC}"
else
  echo -e "${YELLOW}⚠️  Could not configure website hosting (may already be configured)${NC}"
fi

# Get website endpoint
WEBSITE_ENDPOINT=$(aws s3api get-bucket-website --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null | grep -oP '(?<="WebsiteEndpoint": ")[^"]*' || echo "")

if [ -z "$WEBSITE_ENDPOINT" ]; then
  # Construct endpoint manually
  if [ "$REGION" = "us-east-1" ]; then
    WEBSITE_ENDPOINT="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
  else
    WEBSITE_ENDPOINT="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
  fi
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${GREEN}🌐 Website URL:${NC} $WEBSITE_ENDPOINT"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Test the website URL above"
echo "2. Set up CloudFront for HTTPS and CDN (optional)"
echo "3. Configure custom domain (optional)"
echo ""
