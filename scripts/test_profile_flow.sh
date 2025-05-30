#!/bin/bash

# Define variables
USER_ID="test-user-123"
BASE_URL="http://localhost:3000" # Adjust if your server runs on a different port

echo "Testing profile flow for USER_ID: $USER_ID against BASE_URL: $BASE_URL"
echo "----------------------------------------------------------------------"

# Step 1: Check if profile exists (expect 404 initially)
echo ""
echo "Step 1: Checking if profile exists for $USER_ID (should be 404 Not Found initially)..."
curl -i -X GET "$BASE_URL/api/profile/$USER_ID"
echo ""
echo "----------------------------------------------------------------------"

# Step 2: Create the profile
echo ""
echo "Step 2: Creating profile for $USER_ID with role 'buyer' (should return 201 Created)..."
curl -i -X POST "$BASE_URL/api/profile" \
     -H "Content-Type: application/json" \
     -d '{"id": "'"$USER_ID"'", "role": "buyer"}'
echo ""
echo "----------------------------------------------------------------------"

# Step 3: Verify profile creation
echo ""
echo "Step 3: Verifying profile creation for $USER_ID (should return 200 OK and profile data)..."
curl -i -X GET "$BASE_URL/api/profile/$USER_ID"
echo ""
echo "----------------------------------------------------------------------"

# Step 4: Attempt to create the same profile again (expect 409)
echo ""
echo "Step 4: Attempting to create profile for $USER_ID again (should return 409 Conflict)..."
curl -i -X POST "$BASE_URL/api/profile" \
     -H "Content-Type: application/json" \
     -d '{"id": "'"$USER_ID"'", "role": "buyer"}'
echo ""
echo "----------------------------------------------------------------------"
echo "Profile flow test script finished."
