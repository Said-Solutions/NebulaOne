#!/bin/bash

# Script to set up the database for the NebulaOne application

echo "🚀 Setting up database for NebulaOne application..."

# Check if DATABASE_URL is defined
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set."
  echo "Please run 'create_postgresql_database_tool' to create a database first."
  exit 1
fi

# Create the drizzle directories if they don't exist
mkdir -p drizzle/migrations

# Install postgres package for the db-push script
echo "📦 Installing required packages..."
npm install postgres --save

# Run the schema push script
echo "🔄 Pushing schema to database..."
NODE_ENV=development npx tsx scripts/db-push.ts

if [ $? -eq 0 ]; then
  echo "✅ Database setup complete!"
else
  echo "❌ Database setup failed."
  exit 1
fi

echo "✨ NebulaOne database is ready to use!"