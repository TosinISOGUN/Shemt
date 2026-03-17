#!/bin/bash

# Configuration
API_URL="http://localhost:54321/functions/v1/ingest" # Update to your local edge function URL
PROJECT_ID="REPLACE_WITH_ACTUAL_PROJECT_ID"
API_KEY="REPLACE_WITH_ACTUAL_API_KEY"

echo "🚀 Starting Ingestion Tests..."

# 1. Test Successful Ingestion
echo -e "\n1. Testing valid event ingestion..."
curl -i -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{
    \"name\": \"test_page_view\",
    \"project_id\": \"$PROJECT_ID\",
    \"properties\": {
      \"browser\": \"chrome\",
      \"path\": \"/home\"
    }
  }"

# 2. Test Invalid API Key
echo -e "\n\n2. Testing invalid API key..."
curl -i -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid_key" \
  -d "{
    \"name\": \"test_hack\",
    \"project_id\": \"$PROJECT_ID\"
  }"

# 3. Test Missing Fields
echo -e "\n\n3. Testing missing required fields..."
curl -i -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{
    \"project_id\": \"$PROJECT_ID\"
  }"

echo -e "\n\n✅ Tests completed."
