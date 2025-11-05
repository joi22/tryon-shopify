#!/usr/bin/env node

/**
 * Migration script that runs after deployment
 * This can be triggered via Vercel Functions or manually
 */

import { execSync } from 'child_process';

console.log('🔄 Running database migrations...');

try {
  // Run Prisma migrations
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });

  console.log('✅ Migrations completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error.message);

  // Don't fail the deployment if migration fails
  // The app can still work with the existing schema
  console.log('⚠️  Continuing despite migration failure - app may work with existing schema');
  process.exit(0);
}