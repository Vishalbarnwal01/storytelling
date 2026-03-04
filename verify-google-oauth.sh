#!/bin/bash

# Google OAuth Setup Verification Script

echo "📋 Google OAuth Setup Verification"
echo "==================================="
echo ""

# Check .env.local
if [ -f ".env.local" ]; then
  echo "✅ .env.local exists"
  if grep -q "GOOGLE_CLIENT_ID" .env.local; then
    echo "✅ GOOGLE_CLIENT_ID found"
  fi
  if grep -q "GOOGLE_CLIENT_SECRET" .env.local; then
    echo "✅ GOOGLE_CLIENT_SECRET found"
  fi
else
  echo "❌ .env.local not found"
fi

echo ""
echo "📁 File Structure Check"
echo "=======================" 
echo ""

# Check auth.ts
if [ -f "src/auth.ts" ]; then
  echo "✅ src/auth.ts exists"
else
  echo "❌ src/auth.ts missing"
fi

# Check nextauth route
if [ -f "src/app/api/auth/[...nextauth]/route.ts" ]; then
  echo "✅ NextAuth API route exists"
else
  echo "❌ NextAuth API route missing"
fi

# Check google callback
if [ -f "src/app/api/auth/google-callback/route.ts" ]; then
  echo "✅ Google callback route exists"
else
  echo "❌ Google callback route missing"
fi

# Check LoginForm updated
if grep -q "handleGoogleAuth" src/components/forms/LoginForm.tsx; then
  echo "✅ LoginForm has Google Auth integration"
else
  echo "❌ LoginForm missing Google Auth"
fi

echo ""
echo "📦 Dependencies Check"
echo "===================="
echo ""

# Check if next-auth is in package.json
if grep -q '"next-auth"' package.json; then
  echo "✅ next-auth dependency found"
else
  echo "❌ next-auth not installed"
fi

echo ""
echo "✨ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Run SQL migrations on your database (see docs/users-table.sql)"
echo "2. Restart the dev server (npm run dev)"
echo "3. Test Google Sign-in on the login page"
